import type { ESLint } from "eslint";

export function isProjectServiceParseError(result: ESLint.LintResult) {
  return (
    result.messages.length > 0 &&
    result.messages.every((message) =>
      message.fatal === true &&
      message.message.includes("was not found by the project service"),
    )
  );
}
