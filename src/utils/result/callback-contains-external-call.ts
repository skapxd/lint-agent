import type { TSESTree } from "@typescript-eslint/utils";
import { getNodeChildren } from "#/utils/ast/get-node-children";
import { getCallOrigin } from "./get-call-origin";
import type { CallbackFunctionNode } from "./no-rethrow-result-error-types";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";

export function callbackContainsExternalCall(
  callback: CallbackFunctionNode,
  typeContext: TypeContext,
) {
  const pendingNodes: TSESTree.Node[] = [callback.body];

  while (pendingNodes.length > 0) {
    const currentNode = pendingNodes.pop();
    if (!currentNode) {
      continue;
    }

    const isExternalCall =
      currentNode.type === "CallExpression" &&
      getCallOrigin(currentNode, typeContext) === "external";
    if (isExternalCall) {
      return true;
    }

    pendingNodes.push(...getNodeChildren(currentNode));
  }

  return false;
}
