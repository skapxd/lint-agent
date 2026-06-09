// @ts-nocheck
export function getTypeContext(context) {
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
