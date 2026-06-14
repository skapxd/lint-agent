import type { SkapxdLintOutput } from "./types";

export function createUsageErrorOutput(message: string): SkapxdLintOutput {
  return {
    errorCount: 0,
    files: [
      {
        errorCount: 1,
        filePath: "<cli>",
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
    mode: "evaluate",
    status: "usage-error",
    warningCount: 0,
  };
}
