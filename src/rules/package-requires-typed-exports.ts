import type { TSESTree } from "@typescript-eslint/utils";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { trySafe } from "@skapxd/result";
import { findProjectFile } from "#/utils/project/find-project-file";
import { getTypedExportsOptions } from "#/utils/options/get-typed-exports-options";
import { getUntypedExportConditions } from "#/utils/project/get-untyped-export-conditions";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import { isRecord } from "#/utils/unknown/is-record";
import { parseJsonRecord } from "#/utils/unknown/parse-json-record";
import type { RuleModule, RuleContext } from "#/utils/rule-authoring/rule-types";

const kindMessages = {
  "missing-file": "missingTypesFile",
  untyped: "untypedCondition",
  "wrong-flavor": "wrongTypesFlavor",
} as const;

export const packageRequiresTypedExports: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "El package.json de una libreria debe cablear los tipos POR CONDICION en exports: import → .d.mts, require → .d.ts. Un types unico es el bug FalseCJS.",
    },
    messages: {
      missingExports:
        "El package.json no tiene campo `exports`. Sin el, Node y TypeScript resuelven por heuristicas viejas y los consumidores ESM/CJS pueden recibir artefactos cruzados. Declara el mapa de exports con `types` por condicion.",
      missingTypesFile:
        "En exports[\"{{subpath}}\"].{{condition}}, el archivo de `types` declarado no existe en disco. El contrato apunta a un fantasma: o falta el build (dts) o la ruta esta mal escrita.",
      unreadablePackageJson:
        "No encontre un package.json legible subiendo desde este archivo. Esta regla valida el contrato de tipos de la libreria y necesita leerlo.",
      untypedCondition:
        "exports[\"{{subpath}}\"] → `{{condition}}` no declara su propio `types`. Un `types` unico a nivel del subpath es el bug \"FalseCJS\": el consumidor ESM con moduleResolution node16 recibe los tipos CJS. Cada condicion declara los suyos — `import` como objeto con `types: ./dist/x.d.mts` y `default: ./dist/x.mjs`; `require` como objeto con `types: ./dist/x.d.ts` y `default: ./dist/x.js`.",
      wrongTypesFlavor:
        "exports[\"{{subpath}}\"].{{condition}} apunta a tipos del formato equivocado: `import` exige `.d.mts` (tipos ESM) y `require` exige `.d.ts`/`.d.cts` (tipos CJS). tsup con dts: true ya genera ambos sabores.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          anchorFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getTypedExportsOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    const isAllowedFilePattern = matchesAnyGlob(filename, options.allowFilePatterns) ||
      !matchesAnyGlob(filename, options.anchorFilePatterns);
    if (
      isAllowedFilePattern
    ) {
      return {};
    }

    return {
      Program(node: TSESTree.Program) {
        const absoluteFilename = resolve(context.cwd ?? process.cwd(), filename);
        const packageJsonPath = findProjectFile(
          dirname(absoluteFilename),
          "package.json",
        );
        const parsed = packageJsonPath
          ? trySafe<Record<string, unknown>>(() =>
              parseJsonRecord(readFileSync(packageJsonPath, "utf8")),
            )
          : null;

        const lacksReadablePackageJson = !packageJsonPath || !parsed || !parsed.ok;
        if (lacksReadablePackageJson) {
          context.report({ messageId: "unreadablePackageJson", node });

          return;
        }

        const exportsField = parsed.value.exports;

        const lacksObjectExportsMap = !isRecord(exportsField);
        if (
          lacksObjectExportsMap
        ) {
          context.report({ messageId: "missingExports", node });

          return;
        }

        const violations = getUntypedExportConditions(
          exportsField,
          dirname(packageJsonPath),
        );

        for (const violation of violations) {
          context.report({
            data: {
              condition: violation.condition,
              subpath: violation.subpath,
            },
            messageId: kindMessages[violation.kind],
            node,
          });
        }
      },
    };
  },
};
