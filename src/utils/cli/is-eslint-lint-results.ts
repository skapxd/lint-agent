import type { ESLint } from "eslint";

export function isEslintLintResults(value: unknown): value is ESLint.LintResult[] {
  return Array.isArray(value);
}
