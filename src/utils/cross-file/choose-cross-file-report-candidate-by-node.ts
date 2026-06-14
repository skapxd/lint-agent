import type { TSESTree } from "@typescript-eslint/utils";
import type { CrossFileReportCandidate } from "./cross-file-duplicate-indexes";

export function chooseCrossFileReportCandidateByNode(
  candidates: CrossFileReportCandidate[],
) {
  const candidateByNode = new Map<TSESTree.Node, CrossFileReportCandidate>();

  for (const candidate of candidates) {
    const currentCandidate = candidateByNode.get(candidate.occurrence.node);
    const isHigherPriorityCandidate =
      !currentCandidate ||
      candidate.occurrence.reportPriority <
        currentCandidate.occurrence.reportPriority;
    if (isHigherPriorityCandidate) {
      candidateByNode.set(candidate.occurrence.node, candidate);
    }
  }

  return candidateByNode;
}
