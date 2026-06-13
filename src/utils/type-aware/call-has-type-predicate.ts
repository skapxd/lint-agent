import type { ParserServicesWithTypeInformation, TSESTree } from "@typescript-eslint/utils";
import ts from "typescript";

// Evidencia, no convencion (axioma A6): una llamada queda permitida dentro
// del if SOLO si el type-checker demuestra que su firma es un type predicate
// (`x is T`) — el proposito existencial de un type guard es usarse inline
// para estrechar. Sin type info disponible no hay evidencia: devuelve false.
export function callHasTypePredicate(
  node: TSESTree.CallExpression,
  parserServices: ParserServicesWithTypeInformation,
): boolean {
  const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
  const checker = parserServices.program.getTypeChecker();
  const isCallLikeExpression = ts.isCallLikeExpression(tsNode);
  if (!isCallLikeExpression) {
    return false;
  }

  const signature = checker.getResolvedSignature(tsNode);

  if (signature === undefined) {
    return false;
  }

  return checker.getTypePredicateOfSignature(signature) !== undefined;
}
