import type { TSESTree } from "@typescript-eslint/utils";
import { getFunctionLineCount } from "#/utils/ast/get-function-line-count";
import { getNodeChildren } from "#/utils/ast/get-node-children";
import type { FunctionNode } from "#/utils/ast/is-function-node";

export type DenseFunctionMetrics = {
  branches: number;
  lines: number;
  literals: number;
};

export function getDenseFunctionMetrics(functionNode: FunctionNode): DenseFunctionMetrics {
  const metrics: DenseFunctionMetrics = {
    branches: 0,
    lines: getFunctionLineCount(functionNode),
    literals: 0,
  };
  const pendingNodes: TSESTree.Node[] = [functionNode];

  while (pendingNodes.length > 0) {
    const currentNode = pendingNodes.pop();
    const lacksCurrentNode = !currentNode;
    if (lacksCurrentNode) {
      continue;
    }

    const isStringOrNumberLiteral =
      currentNode.type === "Literal" &&
      (typeof currentNode.value === "string" ||
        typeof currentNode.value === "number");
    const isTemplateLiteral = currentNode.type === "TemplateLiteral";
    const countsAsLiteral = isStringOrNumberLiteral || isTemplateLiteral;
    if (countsAsLiteral) {
      metrics.literals += 1;
    }

    const countsAsBranch =
      currentNode.type === "IfStatement" ||
      currentNode.type === "ConditionalExpression" ||
      currentNode.type === "SwitchCase";
    if (countsAsBranch) {
      metrics.branches += 1;
    }

    pendingNodes.push(...getNodeChildren(currentNode));
  }

  return metrics;
}
