import type { TSESTree } from "@typescript-eslint/utils";
import { getNestControllerInjectsUseCaseOptions } from "#/utils/options/get-nest-controller-injects-use-case-options";
import { getConstructorDefinition } from "#/utils/nest/get-constructor-definition";
import { getTypedConstructorParameter } from "#/utils/nest/get-typed-constructor-parameter";
import { getTypeContext } from "#/utils/type-aware/get-type-context";
import { hasClassDecoratorNamed } from "#/utils/nest/has-class-decorator-named";
import { isExternalOrigin } from "#/utils/result/is-external-origin";
import { isSymbolFromSkapxdNest } from "#/utils/nest/is-symbol-from-skapxd-nest";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import { resolveAliasSymbol } from "#/utils/type-aware/resolve-alias-symbol";
import type { RuleContext, RuleModule } from "#/utils/rule-authoring/rule-types";
import ts from "typescript";

export const nestControllerInjectsUseCase: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Los controllers y gateways Nest inyectan casos de uso, no dependencias de capa baja del proyecto.",
      requiresTypeChecking: true,
    },
    messages: {
      controllerInjectsNonUseCase:
        "El controller `{{controller}}` inyecta `{{dependency}}`, que no es un @UseCase. Un controller solo orquesta: inyecta casos de uso (clases con @UseCase de @skapxd/nest), no servicios/repositorios directos - si salta el use-case, salta las reglas de dominio. Marca la dependencia con @UseCase, o mueve la logica a un use-case que el controller consuma. (La infra de framework esta permitida.)",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          allowedInjectionTypeNames: {
            items: { type: "string" },
            type: "array",
          },
          controllerDecoratorNames: {
            items: { type: "string" },
            type: "array",
          },
          gatewayDecoratorNames: {
            items: { type: "string" },
            type: "array",
          },
          useCaseDecoratorNames: {
            items: { type: "string" },
            type: "array",
          },
          useCaseDecoratorSource: { type: "string" },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getNestControllerInjectsUseCaseOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();
    const typeContext = getTypeContext(context);
    const isAllowedFile = matchesAnyGlob(filename, options.allowFilePatterns);
    const shouldSkipRule = !typeContext || isAllowedFile;
    if (shouldSkipRule) {
      return {};
    }

    const activeTypeContext = typeContext;

    function getParameterClassDeclaration(parameterNode: TSESTree.Node) {
      const parameterType = activeTypeContext.services.getTypeAtLocation(parameterNode);
      const isAnyOrUnknownType = Boolean(
        parameterType.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown),
      );
      if (isAnyOrUnknownType) {
        return null;
      }

      const symbol = parameterType.getSymbol();
      const lacksSymbol = !symbol;
      if (lacksSymbol) {
        return null;
      }

      const resolvedSymbol = resolveAliasSymbol(symbol, activeTypeContext);
      const declaration = (resolvedSymbol.getDeclarations() ?? []).find((candidate: ts.Declaration) =>
        ts.isClassDeclaration(candidate),
      );
      const lacksClassDeclaration = !declaration;
      if (lacksClassDeclaration) {
        return null;
      }

      return {
        declaration,
        name: resolvedSymbol.getName(),
      };
    }

    function decoratorComesFromConfiguredUseCase(decorator: ts.Decorator) {
      const expression = decorator.expression;
      const callee = ts.isCallExpression(expression)
        ? expression.expression
        : expression;
      const isIdentifierCallee = ts.isIdentifier(callee);
      if (!isIdentifierCallee) {
        return false;
      }

      const symbol = activeTypeContext.checker.getSymbolAtLocation(callee);
      const lacksSymbol = !symbol;
      if (lacksSymbol) {
        return false;
      }

      const resolvedSymbol = resolveAliasSymbol(symbol, activeTypeContext);
      const hasConfiguredName = options.useCaseDecoratorNames.includes(
        resolvedSymbol.getName(),
      );
      if (!hasConfiguredName) {
        return false;
      }

      return isSymbolFromSkapxdNest(
        symbol,
        activeTypeContext,
        options.useCaseDecoratorSource,
      );
    }

    function classHasConfiguredUseCaseDecorator(declaration: ts.ClassDeclaration) {
      const decorators = ts.canHaveDecorators(declaration)
        ? (ts.getDecorators(declaration) ?? [])
        : [];

      return decorators.some(decoratorComesFromConfiguredUseCase);
    }

    function shouldAllowInjection(dependency: {
      declaration: ts.ClassDeclaration;
      name: string;
    }) {
      const hasAllowedTypeName = options.allowedInjectionTypeNames.includes(
        dependency.name,
      );
      if (hasAllowedTypeName) {
        return true;
      }

      const hasExternalOrigin = isExternalOrigin(
        dependency.declaration,
        activeTypeContext.services.program,
      );
      if (hasExternalOrigin) {
        return true;
      }

      return classHasConfiguredUseCaseDecorator(dependency.declaration);
    }

    function checkTransportClass(
      classNode: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
    ) {
      const hasControllerDecorator = hasClassDecoratorNamed(
        classNode,
        options.controllerDecoratorNames,
      );
      const hasGatewayDecorator = hasClassDecoratorNamed(
        classNode,
        options.gatewayDecoratorNames,
      );
      const lacksTransportBoundary = !hasControllerDecorator && !hasGatewayDecorator;
      if (lacksTransportBoundary) {
        return;
      }

      const constructorDefinition = getConstructorDefinition(classNode);
      const lacksConstructor = !constructorDefinition;
      if (lacksConstructor) {
        return;
      }

      for (const parameter of constructorDefinition.value.params) {
        const parameterNode = getTypedConstructorParameter(parameter);
        const lacksTypedParameter = !parameterNode;
        if (lacksTypedParameter) {
          continue;
        }

        const dependency = getParameterClassDeclaration(parameterNode);
        const lacksDependencyClass = !dependency;
        if (lacksDependencyClass) {
          continue;
        }

        const hasAllowedInjection = shouldAllowInjection(dependency);
        if (hasAllowedInjection) {
          continue;
        }

        context.report({
          data: {
            controller: classNode.id?.name ?? "anonymous",
            dependency: dependency.name,
          },
          messageId: "controllerInjectsNonUseCase",
          node: parameterNode,
        });
      }
    }

    return {
      ClassDeclaration: checkTransportClass,
      ClassExpression: checkTransportClass,
    };
  },
};
