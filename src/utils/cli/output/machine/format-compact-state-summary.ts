import type { SkapxdLintOutput } from "#/utils/cli/types";

export function formatCompactStateSummary(output: SkapxdLintOutput) {
  const state = output.state;

  if (!state) {
    return [];
  }

  return [`state ${state.action} | ${state.statePath}`];
}
