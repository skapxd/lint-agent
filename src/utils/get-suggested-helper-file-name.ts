// @ts-nocheck
import { isHttpRouteMethod } from "./is-http-route-method";
import { toKebabCase } from "./to-kebab-case";

export function getSuggestedHelperFileName({ extension, fileStem, functionName }) {
  const helperFunctionName =
    fileStem === "route" && isHttpRouteMethod(functionName)
      ? `handle${functionName}`
      : functionName;

  return `${toKebabCase(helperFunctionName)}${extension}`;
}
