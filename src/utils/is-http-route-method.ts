import type { LegacyAstNode } from "#/utils/rule-types";
export function isHttpRouteMethod(functionName: LegacyAstNode) {
  return ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"].includes(
    functionName,
  );
}
