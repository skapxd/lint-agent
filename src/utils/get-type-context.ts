import type { LegacyAstNode } from "#/utils/rule-types";
export function getTypeContext(context: LegacyAstNode) {
  const sourceCode = context.sourceCode ?? context.getSourceCode();
  const parserServices = sourceCode.parserServices;

  if (!parserServices?.program) {
    return null;
  }

  return {
    checker: parserServices.program.getTypeChecker(),
    services: parserServices,
  };
}
