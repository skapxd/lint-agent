import type { RuleContext, TypeContext } from "#/utils/rule-types";

export function getTypeContext(context: RuleContext): TypeContext | null {
  const sourceCode = context.sourceCode ?? context.getSourceCode();
  const parserServices = sourceCode.parserServices;

  const program = parserServices?.program;

  if (!program) {
    return null;
  }

  const services = parserServices as TypeContext["services"];

  return {
    checker: program.getTypeChecker(),
    services,
  };
}
