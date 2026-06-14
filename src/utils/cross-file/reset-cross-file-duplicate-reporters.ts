import { crossFileDuplicateIndexes } from "./cross-file-duplicate-indexes";

export function resetCrossFileDuplicateReporters() {
  crossFileDuplicateIndexes.clear();
}
