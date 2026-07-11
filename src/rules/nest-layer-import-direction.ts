import { basename, relative, resolve } from "node:path";
import type { TSESTree } from "@typescript-eslint/utils";
import { resolveLocalImportFile } from "#/utils/imports/resolve-local-import-file";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import { formatLayerList } from "#/utils/nest/format-layer-list";
import { getNestLayerImportDirectionOptions } from "#/utils/options/get-nest-layer-import-direction-options";
import { getPathParts } from "#/utils/project/get-path-parts";
import { isInsideDirectory } from "#/utils/project/is-inside-directory";
import type { RuleContext, RuleModule } from "#/utils/rule-authoring/rule-types";

const indexFileNames = [
  "index.ts",
  "index.tsx",
  "index.js",
  "index.jsx",
  "index.mts",
  "index.cts",
  "index.mjs",
  "index.cjs",
];

export const nestLayerImportDirection: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Impide que las capas internas de un modulo Nest dependan de transporte o adapters concretos mediante imports locales resueltos.",
    },
    messages: {
      forbiddenLayerImport:
        "La capa `{{fromLayer}}` del modulo `{{fromModule}}` no puede importar `{{toLayer}}` del modulo `{{toModule}}`. Desde `{{fromLayer}}` importa solo {{allowedLayers}}; mueve el puerto a la capa interna que lo consume y deja el adapter concreto en `infrastructure`, compuesto desde `{{fromModule}}.module.ts`.",
      forbiddenPublicExport:
        "El index publico del modulo `{{moduleName}}` no expone `{{toLayer}}`. Reexporta solo {{allowedLayers}}; deja transporte y adapters concretos dentro del modulo.",
      unresolvedInternalImport:
        "No se pudo resolver el import interno `{{source}}` desde el modulo `{{moduleName}}`. Corrige el path o configura `sourceRoot` y `aliasPrefixes`; un import interno no resoluble no puede saltarse la matriz de capas.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          aliasPrefixes: {
            items: { type: "string" },
            type: "array",
          },
          allowedLayerImports: {
            additionalProperties: false,
            properties: {
              application: { items: { type: "string" }, type: "array" },
              contracts: { items: { type: "string" }, type: "array" },
              domain: { items: { type: "string" }, type: "array" },
              http: { items: { type: "string" }, type: "array" },
              infrastructure: { items: { type: "string" }, type: "array" },
            },
            type: "object",
          },
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          modulesRoot: { type: "string" },
          publicIndexAllowedLayers: {
            items: { type: "string" },
            type: "array",
          },
          sourceRoot: { type: "string" },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getNestLayerImportDirectionOptions(context.options[0]);
    const projectRoot = resolve(context.cwd ?? process.cwd());
    const modulesRoot = resolve(projectRoot, options.modulesRoot);
    const sourceRoot = resolve(projectRoot, options.sourceRoot);
    const filename = context.filename ?? context.getFilename();
    const absoluteFilename = resolve(projectRoot, filename);
    const allowedFile = matchesAnyGlob(
      absoluteFilename,
      options.allowFilePatterns,
    );
    const importerOutsideModules = !isInsideDirectory(
      modulesRoot,
      absoluteFilename,
    );
    const shouldIgnoreImporter = allowedFile || importerOutsideModules;
    if (shouldIgnoreImporter) {
      return {};
    }

    const importerParts = getPathParts(
      relative(modulesRoot, absoluteFilename),
    );
    const fromModule = importerParts[0];
    const fromLayer = importerParts.length > 2 ? importerParts[1] : undefined;
    const importerFileName = basename(absoluteFilename);
    const compositionRoot =
      importerParts.length === 2 &&
      importerFileName === `${fromModule}.module.ts`;
    const publicIndex =
      importerParts.length === 2 && importerFileName === "index.ts";
    const knownLayer =
      typeof fromLayer === "string" &&
      Object.hasOwn(options.allowedLayerImports, fromLayer);
    const lacksKnownImporterContext =
      !fromModule || (!compositionRoot && !publicIndex && !knownLayer);
    if (lacksKnownImporterContext) {
      return {};
    }
    const moduleName = fromModule;

    function reportImport(
      source: TSESTree.StringLiteral | null,
      publicReexport: boolean,
    ) {
      const invalidSource = !source || typeof source.value !== "string";
      if (invalidSource) {
        return;
      }

      const importSource = source.value;
      const resolution = resolveLocalImportFile({
        aliasPrefixes: options.aliasPrefixes,
        importerFile: absoluteFilename,
        importSource,
        indexFileNames,
        sourceRoot,
      });
      const isExternalImport = resolution.kind === "external";
      if (isExternalImport) {
        return;
      }

      const unresolvedInsideModules =
        resolution.kind === "unresolved" &&
        isInsideDirectory(modulesRoot, resolution.candidatePath);
      if (unresolvedInsideModules) {
        context.report({
          data: { moduleName, source: importSource },
          messageId: "unresolvedInternalImport",
          node: source,
        });

        return;
      }
      const lacksResolvedImport = resolution.kind !== "resolved";
      if (lacksResolvedImport) {
        return;
      }

      const targetOutsideModules = !isInsideDirectory(
        modulesRoot,
        resolution.filePath,
      );
      if (targetOutsideModules) {
        return;
      }

      const targetParts = getPathParts(
        relative(modulesRoot, resolution.filePath),
      );
      const toModule = targetParts[0] ?? "";
      const toLayer = targetParts.length > 2 ? (targetParts[1] ?? "") : "";
      const unknownTargetLayer =
        !toModule ||
        typeof toLayer !== "string" ||
        !Object.hasOwn(options.allowedLayerImports, toLayer);
      const directionDoesNotApply = unknownTargetLayer || compositionRoot;
      if (directionDoesNotApply) {
        return;
      }

      const publicLayerAllowed =
        publicIndex &&
        publicReexport &&
        options.publicIndexAllowedLayers.includes(toLayer);
      if (publicLayerAllowed) {
        return;
      }
      const isRestrictedPublicReexport = publicIndex && publicReexport;
      if (isRestrictedPublicReexport) {
        context.report({
          data: {
            allowedLayers: formatLayerList(options.publicIndexAllowedLayers),
            moduleName,
            source: importSource,
            toLayer,
          },
          messageId: "forbiddenPublicExport",
          node: source,
        });

        return;
      }
      const lacksSourceLayer = publicIndex || typeof fromLayer !== "string";
      if (lacksSourceLayer) {
        return;
      }

      const allowedLayers = options.allowedLayerImports[fromLayer] ?? [];
      const isAllowedLayerDirection = allowedLayers.includes(toLayer);
      if (isAllowedLayerDirection) {
        return;
      }

      context.report({
        data: {
          allowedLayers: formatLayerList(allowedLayers),
          fromLayer,
          fromModule: moduleName,
          source: importSource,
          toLayer,
          toModule,
        },
        messageId: "forbiddenLayerImport",
        node: source,
      });
    }

    return {
      ExportAllDeclaration(node: TSESTree.ExportAllDeclaration) {
        reportImport(node.source, true);
      },
      ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration) {
        reportImport(node.source, true);
      },
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        reportImport(node.source, false);
      },
      ImportExpression(node: TSESTree.ImportExpression) {
        reportImport(
          node.source.type === "Literal" && typeof node.source.value === "string"
            ? node.source
            : null,
          false,
        );
      },
    };
  },
};
