export function isAnonymousGeneratedFunctionName(name: string | null | undefined) {
  return name === "anonymous" || name === "helper";
}
