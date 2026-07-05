import type { TSESTree } from "@typescript-eslint/utils";
import { classifyNestControllerInputDtoType } from "#/utils/nest/classify-nest-controller-input-dto-type";
import { getDecoratorName } from "#/utils/nest/get-decorator-name";
import { getImportedLocalNames } from "#/utils/imports/get-imported-local-names";
import { getNestControllerInputDtosOptions } from "#/utils/options/get-nest-controller-input-dtos-options";
import { getParameterName } from "#/utils/nest/get-parameter-name";
import { getTypeContext } from "#/utils/type-aware/get-type-context";
import { hasClassDecoratorNamed } from "#/utils/nest/has-class-decorator-named";
import { hasStringFieldArgument } from "#/utils/nest/has-string-field-argument";
import { isDestructuredParameter } from "#/utils/nest/is-destructured-parameter";
import { isAstNode } from "#/utils/ast/is-ast-node";
import { isHttpRouteMethod } from "#/utils/nest/is-http-route-method";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import type { RuleContext, RuleModule } from "#/utils/rule-authoring/rule-types";

const httpRouteDecoratorNames = ["Delete", "Get", "Head", "Options", "Patch", "Post", "Put"].filter((name) =>
  isHttpRouteMethod(name.toUpperCase()),
);

export const nestControllerInputDtos: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Los parametros HTTP decorados de un @Controller cruzan como DTO completo extends Dto() con brand de @skapxd/nest, no como campos sueltos, arrays crudos, interfaces, aliases ni clases sin contrato de transporte.",
      requiresTypeChecking: true,
    },
    messages: {
      invalidInputDto:
        "El parametro `{{name}}` usa `@{{decorator}}` como input HTTP sin DTO completo (`{{received}}`). La frontera no acepta campos sueltos, arrays crudos, interfaces, aliases, Record ni clases sin brand: crea una clase `extends Dto()` de @skapxd/nest y usa `@{{decorator}}() dto: RequestDto`.",
      missingTypeInformation:
        "La regla `skapxd/nest-controller-input-dtos` requiere type info. Activa parser services/projectService para que el checker pueda comprobar el brand `SKAPXD_LAYER: \"dto\"` de @skapxd/nest; sin eso la frontera HTTP queda sin enforcement real.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          checkedDecorators: {
            items: { type: "string" },
            type: "array",
          },
          controllerDecoratorNames: {
            items: { type: "string" },
            type: "array",
          },
          dtoLayerSource: { type: "string" },
          nestDecoratorSource: { type: "string" },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getNestControllerInputDtosOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();
    const isAllowedFilePattern = matchesAnyGlob(filename, options.allowFilePatterns);
    if (isAllowedFilePattern) {
      return {};
    }

    const typeContext = getTypeContext(context);
    if (!typeContext) {
      return {
        Program(node: TSESTree.Program) {
          context.report({
            messageId: "missingTypeInformation",
            node,
          });
        },
      };
    }

    const activeTypeContext = typeContext;
    let checkedDecoratorLocalNames = new Set<string>();
    let httpRouteDecoratorLocalNames = new Set<string>();

    function getLocalNamesImportedFromNest(
      program: TSESTree.Program,
      importedNames: readonly string[],
    ) {
      const namesFromNest = getImportedLocalNames(program, options.nestDecoratorSource);
      const localNames = new Set<string>();

      for (const statement of program.body) {
        const isDifferentSource = statement.type !== "ImportDeclaration" ||
          statement.source.value !== options.nestDecoratorSource;
        if (isDifferentSource) {
          continue;
        }

        for (const specifier of statement.specifiers) {
          const isTrackedSpecifier = specifier.type === "ImportSpecifier" &&
            specifier.imported.type === "Identifier" &&
            importedNames.includes(specifier.imported.name) &&
            namesFromNest.has(specifier.local.name);
          if (isTrackedSpecifier) {
            localNames.add(specifier.local.name);
          }
        }
      }

      return localNames;
    }

    function getInputDecorator(param: TSESTree.Parameter) {
      for (const decorator of param.decorators) {
        const decoratorName = getDecoratorName(decorator);
        const isCheckedDecorator = decoratorName &&
          checkedDecoratorLocalNames.has(decoratorName);
        if (isCheckedDecorator) {
          return { decorator, name: decoratorName };
        }
      }

      return null;
    }

    function reportInvalidInput(param: TSESTree.Parameter, decoratorName: string, received: string) {
      context.report({
        data: {
          decorator: decoratorName,
          name: getParameterName(param),
          received,
        },
        messageId: "invalidInputDto",
        node: param,
      });
    }

    function checkParameter(param: TSESTree.Parameter) {
      const inputDecorator = getInputDecorator(param);
      if (!inputDecorator) {
        return;
      }

      const hasFieldArgument = hasStringFieldArgument(inputDecorator.decorator);
      if (hasFieldArgument) {
        reportInvalidInput(param, inputDecorator.name, "campo suelto");

        return;
      }

      const hasDestructuredInput = isDestructuredParameter(param);
      if (hasDestructuredInput) {
        reportInvalidInput(param, inputDecorator.name, "patron destructurado");

        return;
      }

      if (!isAstNode(param)) {
        reportInvalidInput(param, inputDecorator.name, "parametro sin tipo resoluble");

        return;
      }

      const parameterType = activeTypeContext.services.getTypeAtLocation(param);
      const result = classifyNestControllerInputDtoType(
        parameterType,
        activeTypeContext,
        options,
      );
      const hasValidDtoInput = result.status === "ok";
      if (hasValidDtoInput) {
        return;
      }

      reportInvalidInput(param, inputDecorator.name, result.received);
    }

    return {
      Program(node: TSESTree.Program) {
        checkedDecoratorLocalNames = getLocalNamesImportedFromNest(
          node,
          options.checkedDecorators,
        );
        httpRouteDecoratorLocalNames = getLocalNamesImportedFromNest(
          node,
          httpRouteDecoratorNames,
        );
      },
      MethodDefinition(node: TSESTree.MethodDefinition) {
        const isMethodMember = node.kind === "method";
        if (!isMethodMember) {
          return;
        }

        const classNode = node.parent.parent;
        const lacksControllerClass = !hasClassDecoratorNamed(classNode, options.controllerDecoratorNames);
        if (lacksControllerClass) {
          return;
        }

        const hasHttpRouteDecorator = node.decorators.some((decorator) => {
          const decoratorName = getDecoratorName(decorator);

          return Boolean(
            decoratorName && httpRouteDecoratorLocalNames.has(decoratorName),
          );
        });
        if (!hasHttpRouteDecorator) {
          return;
        }

        for (const param of node.value.params) {
          checkParameter(param);
        }
      },
    };
  },
};
