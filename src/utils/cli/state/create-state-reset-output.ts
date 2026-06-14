import type { SkapxdLintOutput } from "#/utils/cli/types";

export function createStateResetOutput(statePath: string) {
  return {
    errorCount: 0,
    files: [],
    mode: "state",
    state: {
      action: "reset",
      statePath,
    },
    status: "ok",
    warningCount: 0,
  } satisfies SkapxdLintOutput;
}
