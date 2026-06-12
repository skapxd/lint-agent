import { isHttpRouteMethod } from "#/utils/is-http-route-method";
import { toKebabCase } from "#/utils/to-kebab-case";

type SuggestedHelperFileNameInput = {
  extension: string;
  fileStem: string;
  functionName: string;
};

export function getSuggestedHelperFileName({
  extension,
  fileStem,
  functionName,
}: SuggestedHelperFileNameInput) {
  const helperFunctionName =
    fileStem === "route" && isHttpRouteMethod(functionName)
      ? `handle${functionName}`
      : functionName;

  return `${toKebabCase(helperFunctionName)}${extension}`;
}
