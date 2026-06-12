import type ts from "typescript";

type ParserServices = {
  esTreeNodeToTSNodeMap?: { get: (node: unknown) => ts.Node | undefined };
  program?: ts.Program | null;
};

// Evidencia, no convencion (axioma A6): una llamada queda permitida dentro
// del if SOLO si el type-checker demuestra que su firma es un type predicate
// (`x is T`) — el proposito existencial de un type guard es usarse inline
// para estrechar. Sin type info disponible no hay evidencia: devuelve false.
export function callHasTypePredicate(
  node: unknown,
  parserServices: ParserServices | undefined,
): boolean {
  const tsNode = parserServices?.esTreeNodeToTSNodeMap?.get(node);
  const program = parserServices?.program;

  const lacksTypeServices = tsNode === undefined || program === null || program === undefined;
  if (lacksTypeServices) {
    return false;
  }

  const checker = program.getTypeChecker();
  const signature = checker.getResolvedSignature(
    tsNode as ts.CallLikeExpression,
  );

  if (signature === undefined) {
    return false;
  }

  return checker.getTypePredicateOfSignature(signature) !== undefined;
}
