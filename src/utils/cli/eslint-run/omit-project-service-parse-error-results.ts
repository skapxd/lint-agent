import { isProjectServiceParseError } from "./is-project-service-parse-error";
import type { ESLint } from "eslint";

export function omitProjectServiceParseErrorResults(results: ESLint.LintResult[]) {
  const filteredResults = results.filter((result) => !isProjectServiceParseError(result));

  return {
    omittedFileCount: results.length - filteredResults.length,
    results: filteredResults,
  };
}
