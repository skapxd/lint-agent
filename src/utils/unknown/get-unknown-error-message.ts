export function getUnknownErrorMessage(error: unknown, fallback: string) {
  const isErrorInstance = error instanceof Error;
  if (isErrorInstance) {
    return error.message;
  }

  const hasMessageProperty =
    typeof error === "object" && error !== null && "message" in error;
  if (!hasMessageProperty) {
    return fallback;
  }

  const { message } = error;
  const isStringMessage = typeof message === "string";

  return isStringMessage ? message : fallback;
}
