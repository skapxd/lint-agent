import type { TSESTree } from "@typescript-eslint/utils";
import { isCalleeNamed } from "#/utils/ast/is-callee-named";

export function isBootstrapCall(
  node: TSESTree.Node,
  bootstrapCallNames: readonly string[],
) {
  const isCallExpression = node.type === "CallExpression";

  return isCallExpression && isCalleeNamed(node.callee, bootstrapCallNames);
}
