import type {
  ParserServices,
  ParserServicesWithTypeInformation,
} from "@typescript-eslint/utils";

export function isParserServicesWithTypeInformation(
  parserServices: ParserServices | undefined,
): parserServices is ParserServicesWithTypeInformation {
  return parserServices?.program !== null && parserServices?.program !== undefined;
}
