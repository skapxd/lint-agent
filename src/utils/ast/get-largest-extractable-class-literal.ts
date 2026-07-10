import type { TSESTree } from "@typescript-eslint/utils";
import { getNodeChildren } from "#/utils/ast/get-node-children";
import { getNodeLineCount } from "#/utils/ast/get-node-line-count";
import { getPropertyName } from "#/utils/ast/get-property-name";
import { isJsonCompatibleExpression } from "#/utils/ast/is-json-compatible-expression";

export type ExtractableClassLiteral = {
  dataLines: number;
  memberName: string;
};

export function getLargestExtractableClassLiteral(
  node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
): ExtractableClassLiteral | null {
  let largest: ExtractableClassLiteral | null = null;

  for (const member of node.body.body) {
    const memberName = "key" in member ? getPropertyName(member.key) : "anonymous";
    const pendingNodes = getNodeChildren(member);

    while (pendingNodes.length > 0) {
      const currentNode = pendingNodes.pop();
      if (!currentNode) {
        continue;
      }

      let unwrappedNode = currentNode;
      while (
        unwrappedNode.type === "TSAsExpression" ||
        unwrappedNode.type === "TSSatisfiesExpression"
      ) {
        unwrappedNode = unwrappedNode.expression;
      }

      const isLiteralCandidate =
        unwrappedNode.type === "ObjectExpression" ||
        unwrappedNode.type === "ArrayExpression";
      const hasExtractableLiteral =
        isLiteralCandidate && isJsonCompatibleExpression(currentNode);
      if (!hasExtractableLiteral) {
        pendingNodes.push(...getNodeChildren(currentNode));
        continue;
      }

      const dataLines = getNodeLineCount(currentNode);
      const exceedsLargestLiteral = !largest || dataLines > largest.dataLines;
      if (exceedsLargestLiteral) {
        largest = { dataLines, memberName };
      }
    }
  }

  return largest;
}
