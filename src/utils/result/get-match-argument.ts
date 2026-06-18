import type { TSESTree } from "@typescript-eslint/utils";
import { unwrapExpression } from "#/utils/ast/unwrap-expression";

export function getMatchArgument(node: TSESTree.Node): TSESTree.Node | null {
  const unwrappedNode = unwrapExpression(node);
  const isCallExpression = unwrappedNode.type === "CallExpression";
  if (!isCallExpression) {
    const isMemberExpression = unwrappedNode.type === "MemberExpression";

    return isMemberExpression ? getMatchArgument(unwrappedNode.object) : null;
  }

  const callee = unwrappedNode.callee;
  const isMatchCall = callee.type === "Identifier" && callee.name === "match";
  if (isMatchCall) {
    return unwrappedNode.arguments[0] ?? null;
  }

  const hasMemberCallee = callee.type === "MemberExpression";

  return hasMemberCallee ? getMatchArgument(callee.object) : null;
}
