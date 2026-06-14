import { crossProjectDuplicateIndexes } from "./cross-project-duplicate-indexes";

export function resetCrossProjectDuplicateReporters() {
  crossProjectDuplicateIndexes.clear();
}
