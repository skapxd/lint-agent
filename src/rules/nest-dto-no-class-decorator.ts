import type { TSESTree } from "@typescript-eslint/utils";
import { getDecoratorName } from "#/utils/nest/get-decorator-name";
import { getSkapxdLayerOfType } from "#/utils/nest/get-skapxd-layer-of-type";
import { getNestDtoNoClassDecoratorOptions } from "#/utils/options/get-nest-dto-no-class-decorator-options";
import type { RuleContext, RuleModule } from "#/utils/rule-authoring/rule-types";
import { getTypeContext } from "#/utils/type-aware/get-type-context";
import tslib from "typescript";

type ClassNode = TSESTree.ClassDeclaration | TSESTree.ClassExpression;

export const nestDtoNoClassDecorator: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        'El brand "dto" solo dice "extiende Dto(...)"; esta regla garantiza que ese brand sea puro: un @Schema/@Entity sobre la clase la convierte en modelo de persistencia registrado, y retornarla filtra la DB como respuesta HTTP. El decorador de clase, no la herencia, es la señal de modelo de persistencia.',
      requiresTypeChecking: true,
    },
    messages: {
      dtoDeclaresClassDecorator:
        "La clase `{{name}}` es un DTO (lleva el brand de @skapxd/nest) pero declara el decorador de clase `@{{decorator}}`. Un DTO es un contrato de transporte puro: `@Schema`/`@Entity` lo registran como modelo de persistencia y filtran tu DB como respuesta HTTP. Quitale el decorador; si necesitas persistir, crea una entity aparte y mapea hacia el DTO. Extender otra clase si esta permitido — lo prohibido es el decorador de clase.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowedClassDecorators: {
            items: { type: "string" },
            type: "array",
          },
          dtoLayerSource: { type: "string" },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getNestDtoNoClassDecoratorOptions(context.options[0]);
    const typeContext = getTypeContext(context);
    const lacksTypeContext = !typeContext;
    if (lacksTypeContext) {
      return {};
    }

    const activeTypeContext = typeContext;

    function getClassInstanceType(node: ClassNode) {
      const symbolNode = node.id ?? node;
      const classSymbol = activeTypeContext.services.getSymbolAtLocation(symbolNode);
      if (classSymbol) {
        return activeTypeContext.checker.getDeclaredTypeOfSymbol(classSymbol);
      }

      const tsClass = activeTypeContext.services.esTreeNodeToTSNodeMap.get(node);
      const isClassNode = tslib.isClassDeclaration(tsClass) ||
        tslib.isClassExpression(tsClass);
      if (!isClassNode) {
        return null;
      }

      const classValueType = activeTypeContext.checker.getTypeAtLocation(tsClass);
      const constructSignatures = activeTypeContext.checker.getSignaturesOfType(
        classValueType,
        tslib.SignatureKind.Construct,
      );
      const [constructSignature] = constructSignatures;
      if (!constructSignature) {
        return null;
      }

      return activeTypeContext.checker.getReturnTypeOfSignature(constructSignature);
    }

    function getClassDecorators(node: ClassNode) {
      const tsClass = activeTypeContext.services.esTreeNodeToTSNodeMap.get(node);
      const isClassNode = tslib.isClassDeclaration(tsClass) ||
        tslib.isClassExpression(tsClass);
      if (!isClassNode) {
        return [];
      }

      const canHaveClassDecorators = tslib.canHaveDecorators(tsClass);
      if (!canHaveClassDecorators) {
        return [];
      }

      return tslib.getDecorators(tsClass) ?? [];
    }

    function checkClass(node: ClassNode) {
      const instanceType = getClassInstanceType(node);
      if (!instanceType) {
        return;
      }

      const hasDtoLayer = getSkapxdLayerOfType(
        instanceType,
        activeTypeContext,
        options.dtoLayerSource,
      ) === "dto";
      if (!hasDtoLayer) {
        return;
      }

      const tsDecorators = getClassDecorators(node);
      for (const [decoratorIndex] of tsDecorators.entries()) {
        const decorator = node.decorators[decoratorIndex];
        if (!decorator) {
          continue;
        }

        const decoratorName = getDecoratorName(decorator) ?? "desconocido";
        const isAllowedClassDecorator = options.allowedClassDecorators.includes(decoratorName);
        if (isAllowedClassDecorator) {
          continue;
        }

        context.report({
          data: {
            decorator: decoratorName,
            name: node.id?.name ?? "anonima",
          },
          messageId: "dtoDeclaresClassDecorator",
          node: decorator,
        });
      }
    }

    return {
      ClassDeclaration: checkClass,
      ClassExpression: checkClass,
    };
  },
};
