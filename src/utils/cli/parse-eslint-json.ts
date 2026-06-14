import { isEslintLintResults } from "./is-eslint-lint-results";

export function parseEslintJson(stdout: string) {
  const trimmed = stdout.trim();
  const hasEmptyOutput = trimmed.length === 0;

  if (hasEmptyOutput) {
    return [];
  }

  const parsed: unknown = JSON.parse(trimmed);

  if (isEslintLintResults(parsed)) {
    return parsed;
  }

  throw new Error("ESLint no devolvio JSON con formato de LintResult[].");
}
