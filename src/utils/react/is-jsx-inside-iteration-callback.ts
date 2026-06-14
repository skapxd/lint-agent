import type { TSESTree } from "@typescript-eslint/utils";

export function isJsxInsideIterationCallback(node: TSESTree.Node) {
  let current: TSESTree.Node | undefined = node;

  while (current) {
    const parent: TSESTree.Node | undefined = current.parent;
    const hasCallExpressionParent = parent?.type === "CallExpression";
    const isFirstCallArgument = hasCallExpressionParent && parent.arguments[0] === current;
    const callee = hasCallExpressionParent ? parent.callee : null;
    const isMemberIteration =
      callee?.type === "MemberExpression" &&
      !callee.computed &&
      callee.property.type === "Identifier" &&
      ["forEach", "map"].includes(callee.property.name);
    const isIterationCallback = isFirstCallArgument && isMemberIteration;

    if (isIterationCallback) {
      return true;
    }

    current = parent;
  }

  return false;
}
