import type { TSESTree } from "@typescript-eslint/utils";
import { getNodeChildren } from "#/utils/ast/get-node-children";
import {
  isFunctionNode,
  type FunctionNode,
} from "#/utils/ast/is-function-node";

export function countFunctionDecisions(functionNode: FunctionNode): number {
  let decisionCount = 0;
  const pendingNodes: TSESTree.Node[] = getNodeChildren(functionNode);

  while (pendingNodes.length > 0) {
    const currentNode = pendingNodes.pop();
    const lacksCurrentNode = !currentNode;
    if (lacksCurrentNode) {
      continue;
    }

    const entersNestedFunction = isFunctionNode(currentNode);
    if (entersNestedFunction) {
      continue;
    }

    const isTestedSwitchCase =
      currentNode.type === "SwitchCase" && currentNode.test !== null;
    const isLogicalAssignment =
      currentNode.type === "AssignmentExpression" &&
      ["&&=", "||=", "??="].includes(currentNode.operator);
    const countsAsDecision =
      currentNode.type === "IfStatement" ||
      currentNode.type === "ConditionalExpression" ||
      currentNode.type === "LogicalExpression" ||
      isTestedSwitchCase ||
      currentNode.type === "ForStatement" ||
      currentNode.type === "ForInStatement" ||
      currentNode.type === "ForOfStatement" ||
      currentNode.type === "WhileStatement" ||
      currentNode.type === "DoWhileStatement" ||
      currentNode.type === "CatchClause" ||
      isLogicalAssignment;

    if (countsAsDecision) {
      decisionCount += 1;
    }

    pendingNodes.push(...getNodeChildren(currentNode));
  }

  return decisionCount;
}
