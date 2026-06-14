import type { SkapxdLintOutput } from "#/utils/cli/types";

export function getInteractiveOutputTitle(output: SkapxdLintOutput) {
  const reportsChangedFiles = output.mode === "changed";

  if (reportsChangedFiles) {
    return "skapxd-lint --changed";
  }

  return `skapxd-lint (${output.preset ?? "preset desconocido"})`;
}
