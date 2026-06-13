import type { TSESTree } from "@typescript-eslint/utils";
import { getFunctionName } from "#/utils/ast/get-function-name";
import { isFunctionNode } from "#/utils/ast/is-function-node";
import { isPascalCaseName } from "#/utils/naming/is-pascal-case-name";

export function isComponentFunction(node: TSESTree.Node) {
  return isFunctionNode(node) && isPascalCaseName(getFunctionName(node));
}
