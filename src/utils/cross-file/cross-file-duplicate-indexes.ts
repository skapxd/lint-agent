import type { TSESTree } from "@typescript-eslint/utils";
import type { RuleContext } from "#/utils/rule-authoring/rule-types";

export type CrossFileDuplicateOccurrence = {
  context: RuleContext;
  fileName: string;
  node: TSESTree.Node;
  reportPriority: number;
  reported: boolean;
  signature: string;
};

export type CrossFileDuplicateGroup = {
  occurrences: CrossFileDuplicateOccurrence[];
};

export type CrossFileDuplicateIndex = {
  groups: Map<string, CrossFileDuplicateGroup>;
};

export type CrossFileReportCandidate = {
  count: number;
  occurrence: CrossFileDuplicateOccurrence;
  reportNode: TSESTree.Node;
};

export const crossFileDuplicateIndexes = new Map<
  string,
  CrossFileDuplicateIndex
>();
