import type { TSESTree } from "@typescript-eslint/utils";
import type { RuleContext } from "#/utils/rule-authoring/rule-types";

export type CrossProjectDuplicateOccurrence = {
  context: RuleContext;
  fileName: string;
  node: TSESTree.Node;
  reported: boolean;
  signature: string;
};

export type CrossProjectDuplicateGroup = {
  occurrences: CrossProjectDuplicateOccurrence[];
};

export type CrossProjectDuplicateIndex = {
  groups: Map<string, CrossProjectDuplicateGroup>;
};

export const crossProjectDuplicateIndexes = new Map<
  string,
  CrossProjectDuplicateIndex
>();
