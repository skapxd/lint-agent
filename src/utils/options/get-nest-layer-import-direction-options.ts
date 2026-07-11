import { stringArrayOption } from "#/utils/options/string-array-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";
import { isRecord } from "#/utils/unknown/is-record";

const defaultAllowedLayerImports: Record<string, string[]> = {
  application: ["application", "domain"],
  contracts: ["contracts"],
  domain: ["domain"],
  http: ["http", "application"],
  infrastructure: ["infrastructure", "application", "domain", "contracts"],
};
const defaultAllowFilePatterns = [
  "**/*.spec.ts",
  "**/*.test.ts",
  "**/*.e2e-spec.ts",
];

export function getNestLayerImportDirectionOptions(options: RuleOptions = {}) {
  const configuredLayerImports = isRecord(options.allowedLayerImports)
    ? options.allowedLayerImports
    : {};
  const allowedLayerImports: Record<string, string[]> = {};
  for (const [layer, defaults] of Object.entries(defaultAllowedLayerImports)) {
    const configuredTargets = configuredLayerImports[layer];
    const hasOnlyStringTargets =
      Array.isArray(configuredTargets) &&
      configuredTargets.every((target) => typeof target === "string");

    allowedLayerImports[layer] = hasOnlyStringTargets
      ? configuredTargets
      : defaults;
  }

  return {
    aliasPrefixes: stringArrayOption(options, "aliasPrefixes", ["#/", "@/"]),
    allowedLayerImports,
    allowFilePatterns: [
      ...defaultAllowFilePatterns,
      ...stringArrayOption(options, "allowFilePatterns", []),
    ],
    modulesRoot:
      typeof options.modulesRoot === "string"
        ? options.modulesRoot
        : "src/modules",
    publicIndexAllowedLayers: stringArrayOption(
      options,
      "publicIndexAllowedLayers",
      ["application", "domain", "contracts"],
    ),
    sourceRoot:
      typeof options.sourceRoot === "string" ? options.sourceRoot : "src",
  };
}
