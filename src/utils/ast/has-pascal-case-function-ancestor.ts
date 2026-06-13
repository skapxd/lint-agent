import { getContainingFunction } from "#/utils/ast/get-containing-function";
import { getFunctionName } from "#/utils/ast/get-function-name";
import type { FunctionNode } from "#/utils/ast/is-function-node";
import { isPascalCaseName } from "#/utils/naming/is-pascal-case-name";

export function hasPascalCaseFunctionAncestor(node: FunctionNode) {
  let currentFunction = getContainingFunction(node);

  while (currentFunction) {
    const currentFunctionName = getFunctionName(currentFunction);
    const isComponentFunction = isPascalCaseName(currentFunctionName);
    if (isComponentFunction) {
      return true;
    }

    currentFunction = getContainingFunction(currentFunction);
  }

  return false;
}
