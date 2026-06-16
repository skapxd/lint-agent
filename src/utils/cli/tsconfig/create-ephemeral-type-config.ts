import fs from "node:fs";
import path from "node:path";
import { getEphemeralTsconfigExtendsPath } from "./get-ephemeral-tsconfig-extends-path";
import { getTypeConfigAddedFlags } from "./get-type-config-added-flags";
import { findProjectFile } from "#/utils/project/find-project-file";
import { readResolvedTsconfig } from "#/utils/project/read-resolved-tsconfig";
import type { EphemeralTypeConfig } from "#/utils/cli/types";

const EPHEMERAL_TSCONFIG_JSON_INDENT = 2;
const strictCompilerOptions = {
  strict: true,
  noImplicitReturns: true,
  noUncheckedIndexedAccess: true,
};

/**
 * ### Tsconfig efímero del CLI
 * El CLI evalúa como guardrail autocontenido, no como build del usuario: puede clonar o generar una config estricta para que las reglas type-aware vean la verdad recomendada sin escribir esa decisión en presets ni en el repo medido.
 *
 * ```ts
 * createEphemeralTypeConfig("/app", false);
 * // -> .tmp-skapxd-tsconfig-*.json + { source: "cloned" | "generated", addedFlags: [...] }
 * createEphemeralTypeConfig("/app", true);
 * // -> sin temporal; mantiene projectService sobre el tsconfig real
 * ```
 */
export function createEphemeralTypeConfig(
  projectRoot: string,
  useProjectTsconfig: boolean,
): EphemeralTypeConfig {
  if (useProjectTsconfig) {
    return {
      path: null,
      typeConfig: { addedFlags: [], source: "project" },
    };
  }

  const tsconfigPath = findProjectFile(projectRoot, "tsconfig.json");
  const rootPath = tsconfigPath ? path.dirname(tsconfigPath) : projectRoot;
  const ephemeralPath = path.join(
    rootPath,
    `.tmp-skapxd-tsconfig-${process.pid}-${Date.now()}.json`,
  );
  const resolvedOptions = tsconfigPath ? readResolvedTsconfig(tsconfigPath) : null;
  const addedFlags = getTypeConfigAddedFlags(resolvedOptions);
  const content = tsconfigPath
    ? {
        extends: getEphemeralTsconfigExtendsPath(ephemeralPath, tsconfigPath),
        compilerOptions: strictCompilerOptions,
      }
    : {
        compilerOptions: {
          ...strictCompilerOptions,
          moduleResolution: "bundler",
          module: "esnext",
          target: "esnext",
          jsx: "react-jsx",
          allowJs: true,
          skipLibCheck: true,
        },
        include: ["**/*"],
      };

  fs.writeFileSync(
    ephemeralPath,
    `${JSON.stringify(content, null, EPHEMERAL_TSCONFIG_JSON_INDENT)}\n`,
    "utf8",
  );

  return {
    path: ephemeralPath,
    typeConfig: {
      addedFlags,
      source: tsconfigPath ? "cloned" : "generated",
    },
  };
}
