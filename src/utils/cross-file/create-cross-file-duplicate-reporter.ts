import type { TSESTree } from "@typescript-eslint/utils";
import { chooseCrossFileReportCandidateByNode } from "./choose-cross-file-report-candidate-by-node";
import {
  crossFileDuplicateIndexes,
  type CrossFileDuplicateGroup,
  type CrossFileDuplicateIndex,
  type CrossFileDuplicateOccurrence,
  type CrossFileReportCandidate,
} from "./cross-file-duplicate-indexes";
import type { RuleContext } from "#/utils/rule-authoring/rule-types";

export type DuplicateSignatureOccurrence = {
  node: TSESTree.Node;
  reportPriority?: number;
  signature: string;
};

type CrossFileDuplicateReporterOptions = {
  context: RuleContext;
  getOccurrences: () => DuplicateSignatureOccurrence[];
  messageId: string;
  minRepetitions: number;
  namespace: string;
};

export function createCrossFileDuplicateReporter(
  options: CrossFileDuplicateReporterOptions,
) {
  const index =
    crossFileDuplicateIndexes.get(options.namespace) ??
    ({
      groups: new Map<string, CrossFileDuplicateGroup>(),
    } satisfies CrossFileDuplicateIndex);
  crossFileDuplicateIndexes.set(options.namespace, index);

  function removeCurrentFileOccurrences(fileName: string) {
    for (const group of index.groups.values()) {
      group.occurrences = group.occurrences.filter(
        (occurrence: CrossFileDuplicateOccurrence) => {
          const belongsToCurrentFile = occurrence.fileName === fileName;
          return !belongsToCurrentFile;
        },
      );
    }
  }

  function addOccurrence(
    fileName: string,
    occurrence: DuplicateSignatureOccurrence,
  ) {
    const group =
      index.groups.get(occurrence.signature) ??
      ({
        occurrences: [],
      } satisfies CrossFileDuplicateGroup);
    index.groups.set(occurrence.signature, group);
    group.occurrences.push({
      context: options.context,
      fileName,
      node: occurrence.node,
      reportPriority: occurrence.reportPriority ?? 0,
      reported: false,
      signature: occurrence.signature,
    });
  }

  function collectReadyReportCandidates(fileName: string) {
    const candidates: CrossFileReportCandidate[] = [];

    for (const group of index.groups.values()) {
      const count = group.occurrences.length;
      const reachesRepetitionThreshold = count >= options.minRepetitions;
      if (!reachesRepetitionThreshold) {
        continue;
      }

      const currentFileOccurrence = group.occurrences.find((occurrence) => {
        const belongsToCurrentFile = occurrence.fileName === fileName;
        return belongsToCurrentFile;
      });
      const reportNode = currentFileOccurrence?.node;
      const lacksReportNode = !reportNode;
      if (lacksReportNode) {
        continue;
      }

      for (const occurrence of group.occurrences) {
        const wasAlreadyReported = occurrence.reported;
        if (wasAlreadyReported) {
          continue;
        }

        candidates.push({
          count,
          occurrence,
          reportNode: occurrence.fileName === fileName ? occurrence.node : reportNode,
        });
      }
    }

    return candidates;
  }

  function markNodeOccurrencesAsReported(node: TSESTree.Node) {
    for (const group of index.groups.values()) {
      for (const occurrence of group.occurrences) {
        const belongsToReportedNode = occurrence.node === node;
        if (belongsToReportedNode) {
          occurrence.reported = true;
        }
      }
    }
  }

  function reportReadyGroups(fileName: string) {
    const candidates = collectReadyReportCandidates(fileName);
    const candidateByNode = chooseCrossFileReportCandidateByNode(candidates);

    for (const candidate of candidateByNode.values()) {
      options.context.report({
        data: { count: String(candidate.count) },
        messageId: options.messageId,
        node: candidate.reportNode,
      });
      markNodeOccurrencesAsReported(candidate.occurrence.node);
    }
  }

  return {
    collectAndReport() {
      const fileName = options.context.filename ?? options.context.getFilename();
      removeCurrentFileOccurrences(fileName);

      for (const occurrence of options.getOccurrences()) {
        addOccurrence(fileName, occurrence);
      }

      reportReadyGroups(fileName);
    },
  };
}
