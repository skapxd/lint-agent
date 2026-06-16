import type { TypeConfigOutput } from "#/utils/cli/types";

export function formatCompactTypeConfig(typeConfig: TypeConfigOutput | undefined) {
  const hasTypeConfig = typeConfig !== undefined;
  if (!hasTypeConfig) {
    return null;
  }

  const usesProjectConfig = typeConfig.source === "project";
  if (usesProjectConfig) {
    return "tipos: tsconfig del proyecto";
  }

  const flags = typeConfig.addedFlags.join(", ");
  const hasAddedFlags = flags.length > 0;
  const usesGeneratedConfig = typeConfig.source === "generated";

  if (usesGeneratedConfig) {
    return hasAddedFlags
      ? `tipos: config generada (${flags})`
      : "tipos: config generada";
  }

  return hasAddedFlags
    ? `tipos: config endurecida (${flags})`
    : "tipos: config clonada sin flags nuevos";
}
