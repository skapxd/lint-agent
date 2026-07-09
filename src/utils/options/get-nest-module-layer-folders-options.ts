import { stringArrayOption } from "#/utils/options/string-array-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";
import { isRecord } from "#/utils/unknown/is-record";

const defaultAllowedLayers = [
  "http",
  "application",
  "domain",
  "infrastructure",
  "contracts",
];
const defaultAllowFilePatterns = [
  "**/*.spec.ts",
  "**/*.test.ts",
  "**/*.e2e-spec.ts",
];
const defaultSuffixLayers: Record<string, string[]> = {
  application: [".use-case.ts"],
  http: [".controller.ts", ".gateway.ts", ".dto.ts"],
};

/**
 * ### Contrato de configuracion
 * Mantiene una base segura para el layout Nest y permite ampliar sufijos sin activar heuristicas de infraestructura por defecto.
 *
 * ```text
 * { suffixLayers: { infrastructure: [".repository.ts"] } } -> defaults + repository
 * ```
 */
export function getNestModuleLayerFoldersOptions(options: RuleOptions = {}) {
  const suffixLayers = { ...defaultSuffixLayers };
  const configuredSuffixLayers = isRecord(options.suffixLayers)
    ? Object.entries(options.suffixLayers)
    : [];
  for (const [layer, suffixes] of configuredSuffixLayers) {
    const hasOnlyStringSuffixes =
      Array.isArray(suffixes) &&
      suffixes.every((suffix) => typeof suffix === "string");
    if (!hasOnlyStringSuffixes) {
      continue;
    }

    suffixLayers[layer] = suffixes;
  }

  return {
    allowedLayers: stringArrayOption(
      options,
      "allowedLayers",
      defaultAllowedLayers,
    ),
    allowFilePatterns: [
      ...defaultAllowFilePatterns,
      ...stringArrayOption(options, "allowFilePatterns", []),
    ],
    controllerDecoratorSource:
      typeof options.controllerDecoratorSource === "string"
        ? options.controllerDecoratorSource
        : "@nestjs/common",
    dtoLayerSource:
      typeof options.dtoLayerSource === "string"
        ? options.dtoLayerSource
        : "@skapxd/nest",
    gatewayDecoratorSource:
      typeof options.gatewayDecoratorSource === "string"
        ? options.gatewayDecoratorSource
        : "@nestjs/websockets",
    modulesRoot:
      typeof options.modulesRoot === "string"
        ? options.modulesRoot
        : "src/modules",
    rootFileNames: stringArrayOption(options, "rootFileNames", ["index.ts"]),
    suffixLayers,
    useCaseDecoratorSource:
      typeof options.useCaseDecoratorSource === "string"
        ? options.useCaseDecoratorSource
        : "@skapxd/nest",
  };
}
