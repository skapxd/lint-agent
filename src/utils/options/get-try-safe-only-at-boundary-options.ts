import { stringArrayOption } from "./string-array-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";

const defaultAllowFilePatterns = [
  "**/*.test.ts",
  "**/*.test.tsx",
  "**/*.spec.ts",
  "**/*.spec.tsx",
  "**/*.e2e-spec.ts",
  "**/*.e2e-spec.tsx",
  "**/*.e2e.ts",
  "**/*.e2e.tsx",
  "**/__tests__/**",
  "**/e2e/**",
];

export function getTrySafeOnlyAtBoundaryOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: [
      ...defaultAllowFilePatterns,
      ...stringArrayOption(options, "allowFilePatterns", []),
    ],
  };
}
