export function isHttpRouteMethod(functionName: string | null | undefined) {
  if (!functionName) {
    return false;
  }

  return ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"].includes(
    functionName,
  );
}
