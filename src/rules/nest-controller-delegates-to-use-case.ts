import type { TSESTree } from "@typescript-eslint/utils";
import { getDecoratorName } from "#/utils/nest/get-decorator-name";
import { getNodeChildren } from "#/utils/ast/get-node-children";
import { getImportedLocalNamesForNames } from "#/utils/imports/get-imported-local-names-for-names";
import { getNestControllerDelegatesToUseCaseOptions } from "#/utils/options/get-nest-controller-delegates-to-use-case-options";
import { getPropertyName } from "#/utils/ast/get-property-name";
import { getSkapxdLayerOfType } from "#/utils/nest/get-skapxd-layer-of-type";
import { getTypeContext } from "#/utils/type-aware/get-type-context";
import { hasClassDecoratorNamed } from "#/utils/nest/has-class-decorator-named";
import { isClassDecoratedBySkapxdNest } from "#/utils/nest/is-class-decorated-by-skapxd-nest";
import { isTrivialControllerTransportValue } from "#/utils/nest/is-trivial-controller-transport-value";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import { resolveClassDeclarationOfNode } from "#/utils/nest/resolve-class-declaration-of-node";
import type { RuleContext, RuleModule } from "#/utils/rule-authoring/rule-types";

export const nestControllerDelegatesToUseCase: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Los route handlers de un @Controller adaptan HTTP y delegan una sola operacion a un @UseCase real.",
      requiresTypeChecking: true,
    },
    messages: {
      controllerCallsNonUseCase:
        "El route handler `{{methodName}}` llama o construye algo fuera de su unico @UseCase. Un controller Nest solo adapta HTTP: mueve mapping, seguridad o infraestructura al @UseCase, provider o guard y deja el handler como `return this.<useCase>.execute(...)`.",
      controllerControlFlow:
        "El route handler `{{methodName}}` contiene control flow. Un controller Nest solo adapta HTTP: mueve la decision al @UseCase y deja el handler como `return this.<useCase>.execute(...)`.",
      controllerMissingDelegation:
        "El route handler `{{methodName}}` no delega a un @UseCase real. Inyecta una clase con @UseCase de @skapxd/nest y deja el handler como `return this.<useCase>.execute(...)`.",
      controllerTransformsInput:
        "El route handler `{{methodName}}` transforma inputs o usa statements fuera de la gramatica permitida. Pasa DTOs, params, headers o request data directamente al @UseCase y mueve mapping y calculos fuera del controller.",
      missingTypeInformation:
        "La regla `skapxd/nest-controller-delegates-to-use-case` requiere type info. Activa parser services/projectService para comprobar el @UseCase real y el brand dto de @skapxd/nest.",
      multipleUseCaseCalls:
        "El route handler `{{methodName}}` llama varios @UseCase. Crea un unico @UseCase orquestador y deja el controller con una sola delegacion `return this.<useCase>.execute(...)`.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: { items: { type: "string" }, type: "array" },
          controllerDecoratorNames: { items: { type: "string" }, type: "array" },
          dtoLayerSource: { type: "string" },
          httpMethodDecoratorNames: { items: { type: "string" }, type: "array" },
          nestDecoratorSource: { type: "string" },
          responseHandlerParamDecorators: { items: { type: "string" }, type: "array" },
          useCaseDecoratorNames: { items: { type: "string" }, type: "array" },
          useCaseDecoratorSource: { type: "string" },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getNestControllerDelegatesToUseCaseOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();
    const isAllowedFile = matchesAnyGlob(filename, options.allowFilePatterns);
    if (isAllowedFile) {
      return {};
    }

    const typeContext = getTypeContext(context);
    const lacksTypeInformation = !typeContext;
    if (lacksTypeInformation) {
      return {
        Program(node: TSESTree.Program) {
          context.report({ messageId: "missingTypeInformation", node });
        },
      };
    }

    const activeTypeContext = typeContext;
    let controllerDecoratorLocalNames = new Set<string>();
    let httpMethodDecoratorLocalNames = new Set<string>();
    let responseHandlerParamDecoratorLocalNames = new Set<string>();

    function getDirectUseCaseCall(expression: TSESTree.Expression | null) {
      const unwrapped = expression?.type === "AwaitExpression"
        ? expression.argument
        : expression;
      const lacksExpression = !unwrapped;
      if (lacksExpression) {
        return null;
      }

      const lacksCallExpression = unwrapped.type !== "CallExpression";
      if (lacksCallExpression) {
        return null;
      }

      const callee = unwrapped.callee;
      const lacksMemberCallee = callee.type !== "MemberExpression";
      if (lacksMemberCallee) {
        return null;
      }

      const lacksDirectExecuteCall = unwrapped.optional ||
        callee.computed ||
        callee.property.type !== "Identifier" ||
        callee.property.name !== "execute";
      if (lacksDirectExecuteCall) {
        return null;
      }

      const receiver = callee.object;
      const lacksMemberReceiver = receiver.type !== "MemberExpression";
      if (lacksMemberReceiver) {
        return null;
      }

      const lacksThisDependencyReceiver = receiver.computed ||
        receiver.object.type !== "ThisExpression" ||
        receiver.property.type !== "Identifier";
      if (lacksThisDependencyReceiver) {
        return null;
      }

      const dependency = resolveClassDeclarationOfNode(receiver, activeTypeContext);
      const lacksDependencyClass = !dependency;
      if (lacksDependencyClass) {
        return null;
      }

      const isUseCase = isClassDecoratedBySkapxdNest(
        dependency.declaration,
        activeTypeContext,
        options.useCaseDecoratorNames,
        options.useCaseDecoratorSource,
      );

      return isUseCase ? unwrapped : null;
    }

    function isDtoTypedExpression(expression: TSESTree.Expression | null) {
      const lacksExpression = !expression;
      if (lacksExpression) {
        return false;
      }

      const type = activeTypeContext.services.getTypeAtLocation(expression);

      return getSkapxdLayerOfType(
        type,
        activeTypeContext,
        options.dtoLayerSource,
      ) === "dto";
    }

    function isDtoAckExpression(expression: TSESTree.Expression | null) {
      const lacksAckExpression = !expression;
      if (lacksAckExpression) {
        return false;
      }

      const lacksDtoBrand = !isDtoTypedExpression(expression);
      if (lacksDtoBrand) {
        return false;
      }

      const hasTrivialAckValue = isTrivialControllerTransportValue(expression);
      if (hasTrivialAckValue) {
        return true;
      }

      const isFactoryCall = expression.type === "CallExpression";
      if (isFactoryCall) {
        const callee = expression.callee;
        const hasSimpleCallee = callee.type === "Identifier" ||
          (callee.type === "MemberExpression" &&
            !callee.computed &&
            !callee.optional &&
            callee.object.type === "Identifier" &&
            callee.property.type === "Identifier");
        const hasTrivialFactoryArguments = expression.arguments.every(
          (argument) =>
            argument.type !== "SpreadElement" &&
            isTrivialControllerTransportValue(argument),
        );

        return !expression.optional &&
          hasSimpleCallee &&
          hasTrivialFactoryArguments;
      }

      const isConstructorCall = expression.type === "NewExpression";
      if (isConstructorCall) {
        return expression.callee.type === "Identifier" &&
          expression.arguments.every(
            (argument) =>
              argument.type !== "SpreadElement" &&
              isTrivialControllerTransportValue(argument),
          );
      }

      return false;
    }

    function usesManualResponseHandler(node: TSESTree.MethodDefinition) {
      return node.value.params.some((param) =>
        param.decorators.some((decorator) => {
          const name = getDecoratorName(decorator);

          return Boolean(
            name && responseHandlerParamDecoratorLocalNames.has(name),
          );
        }),
      );
    }

    return {
      Program(node: TSESTree.Program) {
        controllerDecoratorLocalNames = getImportedLocalNamesForNames(
          node,
          options.nestDecoratorSource,
          options.controllerDecoratorNames,
        );
        httpMethodDecoratorLocalNames = getImportedLocalNamesForNames(
          node,
          options.nestDecoratorSource,
          options.httpMethodDecoratorNames,
        );
        responseHandlerParamDecoratorLocalNames = getImportedLocalNamesForNames(
          node,
          options.nestDecoratorSource,
          options.responseHandlerParamDecorators,
        );
      },
      MethodDefinition(node: TSESTree.MethodDefinition) {
        const classNode = node.parent.parent;
        const isController = hasClassDecoratorNamed(
          classNode,
          [...controllerDecoratorLocalNames],
        );
        const isRoute = node.decorators.some((decorator) => {
          const name = getDecoratorName(decorator);

          return Boolean(name && httpMethodDecoratorLocalNames.has(name));
        });
        const shouldSkipHandler = node.kind !== "method" ||
          !isController ||
          !isRoute ||
          usesManualResponseHandler(node);
        if (shouldSkipHandler) {
          return;
        }

        const body = node.value.body;
        const statements = body?.body ?? [];
        const firstStatement = statements[0];
        let firstStatementExpression: TSESTree.Expression | null = null;
        const hasExpressionStatement = firstStatement?.type ===
          "ExpressionStatement";
        if (hasExpressionStatement) {
          firstStatementExpression = firstStatement.expression;
        }
        const hasReturnStatement = firstStatement?.type === "ReturnStatement";
        if (hasReturnStatement) {
          firstStatementExpression = firstStatement.argument;
        }
        const firstCall = getDirectUseCaseCall(firstStatementExpression);
        const firstCallHasTrivialArguments = Boolean(
          firstCall?.arguments.every(
            (argument) =>
              argument.type !== "SpreadElement" &&
              isTrivialControllerTransportValue(argument),
          ),
        );
        const isDirectDelegation = statements.length === 1 &&
          Boolean(firstCall && firstCallHasTrivialArguments);
        const ackExpression = statements[1]?.type === "ReturnStatement"
          ? statements[1].argument
          : null;
        const isAckDelegation = statements.length === 2 &&
          statements[0]?.type === "ExpressionStatement" &&
          Boolean(firstCall && firstCallHasTrivialArguments) &&
          isDtoAckExpression(ackExpression);
        const lacksHandlerBody = !body;
        if (lacksHandlerBody) {
          context.report({
            data: { methodName: getPropertyName(node.key) },
            messageId: "controllerMissingDelegation",
            node: node.key,
          });

          return;
        }

        const bodyNodes: TSESTree.Node[] = [];
        const pendingBodyNodes = [...getNodeChildren(body)];
        while (pendingBodyNodes.length > 0) {
          const bodyNode = pendingBodyNodes.pop();
          const lacksBodyNode = !bodyNode;
          if (lacksBodyNode) {
            continue;
          }

          bodyNodes.push(bodyNode);
          pendingBodyNodes.push(...getNodeChildren(bodyNode));
        }
        const useCaseCalls = bodyNodes.filter(
          (bodyNode): bodyNode is TSESTree.CallExpression =>
            bodyNode.type === "CallExpression" &&
            Boolean(getDirectUseCaseCall(bodyNode)),
        );
        const methodName = getPropertyName(node.key);
        const hasMultipleUseCaseCalls = useCaseCalls.length > 1;
        if (hasMultipleUseCaseCalls) {
          context.report({
            data: { methodName },
            messageId: "multipleUseCaseCalls",
            node: node.key,
          });

          return;
        }

        const controlFlowNodeTypes = [
          "ConditionalExpression",
          "DoWhileStatement",
          "ForInStatement",
          "ForOfStatement",
          "ForStatement",
          "IfStatement",
          "LogicalExpression",
          "SwitchStatement",
          "TryStatement",
          "WhileStatement",
        ];
        const hasControlFlow = bodyNodes.some((bodyNode) =>
          controlFlowNodeTypes.includes(bodyNode.type),
        );
        if (hasControlFlow) {
          context.report({
            data: { methodName },
            messageId: "controllerControlFlow",
            node: node.key,
          });

          return;
        }

        const hasValidHandlerGrammar = isDirectDelegation || isAckDelegation;
        if (hasValidHandlerGrammar) {
          return;
        }

        const useCaseCallSet = new Set<TSESTree.Node>(useCaseCalls);
        const canExcludeAckRoot = Boolean(
          firstCall &&
          isDtoTypedExpression(ackExpression) &&
          (ackExpression?.type === "CallExpression" ||
            ackExpression?.type === "NewExpression"),
        );
        function isAdditionalCall(bodyNode: TSESTree.Node) {
          const isCallOrConstruction = bodyNode.type === "CallExpression" ||
            bodyNode.type === "NewExpression";
          const isAllowedUseCaseCall = isCallOrConstruction &&
            useCaseCallSet.has(bodyNode);
          const lacksAdditionalCallCandidate = !isCallOrConstruction ||
            isAllowedUseCaseCall;
          if (lacksAdditionalCallCandidate) {
            return false;
          }

          return !canExcludeAckRoot || bodyNode !== ackExpression;
        }
        const hasAdditionalCall = bodyNodes.some(isAdditionalCall);
        if (hasAdditionalCall) {
          context.report({
            data: { methodName },
            messageId: "controllerCallsNonUseCase",
            node: node.key,
          });

          return;
        }

        context.report({
          data: { methodName },
          messageId: useCaseCalls.length === 1
            ? "controllerTransformsInput"
            : "controllerMissingDelegation",
          node: node.key,
        });
      },
    };
  },
};
