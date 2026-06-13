import type { TSESTree } from "@typescript-eslint/utils";
import { getAncestorLocalScopes } from "#/utils/ast/get-ancestor-local-scopes";
import { getContainingFunction } from "#/utils/ast/get-containing-function";
import { hasPascalCaseFunctionAncestor } from "#/utils/ast/has-pascal-case-function-ancestor";
import { isFunctionNode, type FunctionNode } from "#/utils/ast/is-function-node";
import type {
  RuleContext,
  RuleModule,
  RuleScope,
} from "#/utils/rule-authoring/rule-types";
import { isReferenceToDeclaration } from "#/utils/rule-authoring/is-reference-to-declaration";

type NestedFunctionSubject = {
  declarationNode: TSESTree.Node;
  functionNode: FunctionNode;
  reportNode: TSESTree.Node;
};

export const nestedFunctionRequiresCapture: RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Exige que una funcion nombrada dentro de otra capture scope local; si no, es un helper extraible.",
    },
    messages: {
      missingCapture:
        "Esta funcion anidada no usa nada del scope que la contiene: es un helper extraible, no un closure. Muevela a su propio archivo (`src/utils/<dominio>/` o donde corresponda) y pasale lo que necesite como argumento; luego importala aqui. Reserva las funciones anidadas para cuando cierran sobre variables locales que no pueden viajar a otro archivo. Para un callback de un solo uso, pasalo inline y anonimo: `items.map((x) => ...)`.",
    },
    schema: [],
  },
  create(context: RuleContext) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    function getRuleScope(node: FunctionNode) {
      return sourceCode.getScope?.(node) ?? null;
    }

    function capturesAncestorLocalScope(subject: NestedFunctionSubject) {
      const functionScope = getRuleScope(subject.functionNode);
      const lacksScopeAnalysis = !functionScope;
      if (lacksScopeAnalysis) {
        return true;
      }

      const ancestorLocalScopes = getAncestorLocalScopes(functionScope);
      const escapingReferences = functionScope.through ?? [];

      return escapingReferences.some((reference) => {
        const isOwnRecursiveReference = isReferenceToDeclaration(
          reference,
          subject.declarationNode,
        );
        if (isOwnRecursiveReference) {
          return false;
        }

        const resolvedScope = reference.resolved?.scope;
        const lacksResolvedScope = !resolvedScope;
        if (lacksResolvedScope) {
          return false;
        }

        return ancestorLocalScopes.has(resolvedScope);
      });
    }

    function reportIfMissingCapture(subject: NestedFunctionSubject) {
      const lacksContainingFunction = !getContainingFunction(subject.functionNode);
      if (lacksContainingFunction) {
        return;
      }

      const isInsideComponentFunction = hasPascalCaseFunctionAncestor(subject.functionNode);
      if (isInsideComponentFunction) {
        return;
      }

      const capturesLocalScope = capturesAncestorLocalScope(subject);
      if (capturesLocalScope) {
        return;
      }

      context.report({
        messageId: "missingCapture",
        node: subject.reportNode,
      });
    }

    return {
      FunctionDeclaration(node: TSESTree.FunctionDeclaration) {
        reportIfMissingCapture({
          declarationNode: node,
          functionNode: node,
          reportNode: node,
        });
      },
      VariableDeclarator(node: TSESTree.VariableDeclarator) {
        const initializer = node.init;
        const hasFunctionInitializer = isFunctionNode(initializer);
        if (!hasFunctionInitializer) {
          return;
        }

        reportIfMissingCapture({
          declarationNode: node,
          functionNode: initializer,
          reportNode: node.id,
        });
      },
    };
  },
};
