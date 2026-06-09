// @ts-nocheck
export function isHttpRouteMethod(functionName) {
  return ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"].includes(
    functionName,
  );
}
