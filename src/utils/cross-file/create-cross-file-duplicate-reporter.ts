import type { TSESTree } from "@typescript-eslint/utils";
import {
  crossFileDuplicateIndexes,
  type CrossFileDuplicateGroup,
  type CrossFileDuplicateIndex,
  type CrossFileDuplicateOccurrence,
} from "./cross-file-duplicate-indexes";
import type { RuleContext } from "#/utils/rule-authoring/rule-types";

export type DuplicateSignatureOccurrence = {
  node: TSESTree.Node;
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
      reported: false,
      signature: occurrence.signature,
    });
  }

  function reportReadyGroups(fileName: string) {
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

        options.context.report({
          data: { count: String(count) },
          messageId: options.messageId,
          node: occurrence.fileName === fileName ? occurrence.node : reportNode,
        });
        occurrence.reported = true;
      }
    }
  }

  return {
    collectAndReport() {
      const fileName = options.context.getFilename();
      removeCurrentFileOccurrences(fileName);

      for (const occurrence of options.getOccurrences()) {
        addOccurrence(fileName, occurrence);
      }

      reportReadyGroups(fileName);
    },
  };
}
