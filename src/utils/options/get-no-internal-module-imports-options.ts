import { stringArrayOption } from "#/utils/options/string-array-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";

const defaultAliasPrefixes = ["#/", "@/"];
const defaultIndexFileNames = [
  "index.ts",
  "index.tsx",
  "index.js",
  "index.jsx",
  "index.mts",
  "index.cts",
  "index.mjs",
  "index.cjs",
];

export function getNoInternalModuleImportsOptions(options: RuleOptions = {}) {
  const sourceRoot = options.sourceRoot;

  return {
    aliasPrefixes: stringArrayOption(
      options,
      "aliasPrefixes",
      defaultAliasPrefixes,
    ),
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
    indexFileNames: stringArrayOption(
      options,
      "indexFileNames",
      defaultIndexFileNames,
    ),
    sourceRoot: typeof sourceRoot === "string" ? sourceRoot : "src",
  };
}
