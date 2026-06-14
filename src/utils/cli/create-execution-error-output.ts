import type { SkapxdLintOutput } from "./types";

export function createExecutionErrorOutput(
  message: string,
  mode: SkapxdLintOutput["mode"] = "evaluate",
): SkapxdLintOutput {
  return {
    errorCount: 1,
    files: [
      {
        errorCount: 1,
        filePath: "<execution>",
        messages: [
          {
            column: 0,
            line: 0,
            message,
            ruleId: null,
            severity: 2,
          },
        ],
        warningCount: 0,
      },
    ],
    mode,
    status: "execution-error",
    warningCount: 0,
  };
}
