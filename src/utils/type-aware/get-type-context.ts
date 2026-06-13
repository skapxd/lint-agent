import type { RuleContext, TypeContext } from "#/utils/rule-authoring/rule-types";
import { isParserServicesWithTypeInformation } from "#/utils/type-aware/is-parser-services-with-type-information";

export function getTypeContext(context: RuleContext): TypeContext | null {
  const sourceCode = context.sourceCode ?? context.getSourceCode();
  const parserServices = sourceCode.parserServices;

  if (!isParserServicesWithTypeInformation(parserServices)) {
    return null;
  }

  return {
    checker: parserServices.program.getTypeChecker(),
    services: parserServices,
  };
}
