import { relative, resolve } from "node:path";
import type { TSESTree } from "@typescript-eslint/utils";
import { getImportedLocalNames } from "#/utils/imports/get-imported-local-names";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import { getDecoratorName } from "#/utils/nest/get-decorator-name";
import { getNestModuleLayerFoldersOptions } from "#/utils/options/get-nest-module-layer-folders-options";
import { getFileName } from "#/utils/project/get-file-name";
import { getPathParts } from "#/utils/project/get-path-parts";
import { isInsideDirectory } from "#/utils/project/is-inside-directory";
import type { RuleContext, RuleModule } from "#/utils/rule-authoring/rule-types";

const suffixKinds: Record<string, string> = {
  ".controller.ts": "controller",
  ".dto.ts": "DTO",
  ".gateway.ts": "gateway",
  ".use-case.ts": "use-case",
};

type TrackedImportName =
  | "Controller"
  | "Dto"
  | "UseCase"
  | "WebSocketGateway";

export const nestModuleLayerFolders: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Exige que los modulos Nest declaren sus capas http, application, domain, infrastructure y contracts en el arbol de archivos.",
    },
    messages: {
      nestedModuleFile:
        "El module file `{{fileName}}` esta anidado dentro del modulo `{{moduleName}}`. En v1 solo se permite `{{moduleName}}.module.ts` en la raiz del modulo; extrae un submodulo explicito en otro issue si ese contrato hace falta.",
      unknownModuleFolder:
        "La carpeta `{{folderName}}` esta directa bajo el modulo Nest `{{moduleName}}` pero no es una capa declarada. Usa {{allowedLayers}}; por ejemplo, adapters runtime/DB van en `infrastructure/{{folderName}}/`.",
      unknownRootFile:
        "El archivo `{{fileName}}` esta directo en la raiz del modulo Nest `{{moduleName}}`. La raiz solo acepta `{{moduleName}}.module.ts` y {{rootFileNames}}; mueve el archivo a una capa declarada: {{allowedLayers}}.",
      wrongLayer:
        "`{{kind}}` pertenece a la capa `{{expectedLayer}}` del modulo `{{moduleName}}`: mueve `{{fileName}}` a `{{modulesRoot}}/{{moduleName}}/{{expectedLayer}}/...`. El arbol del modulo debe declarar la frontera antes de que el codigo obligue a inferirla.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowedLayers: {
            items: { type: "string" },
            type: "array",
          },
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          controllerDecoratorSource: { type: "string" },
          dtoLayerSource: { type: "string" },
          gatewayDecoratorSource: { type: "string" },
          modulesRoot: { type: "string" },
          rootFileNames: {
            items: { type: "string" },
            type: "array",
          },
          suffixLayers: {
            additionalProperties: {
              items: { type: "string" },
              type: "array",
            },
            type: "object",
          },
          useCaseDecoratorSource: { type: "string" },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getNestModuleLayerFoldersOptions(context.options[0]);
    const projectRoot = resolve(context.cwd ?? process.cwd());
    const modulesRoot = resolve(projectRoot, options.modulesRoot);
    const filename = context.filename ?? context.getFilename();
    const absoluteFilename = resolve(projectRoot, filename);
    const isAllowedFile = matchesAnyGlob(
      absoluteFilename,
      options.allowFilePatterns,
    );
    const isModuleFile = isInsideDirectory(modulesRoot, absoluteFilename);
    const shouldIgnoreFile = isAllowedFile || !isModuleFile;
    if (shouldIgnoreFile) {
      return {};
    }

    const modulePathParts = getPathParts(
      relative(modulesRoot, absoluteFilename),
    );
    const moduleNamePart = modulePathParts[0];
    const fileName = getFileName(filename);
    const lacksModuleAndFile = !moduleNamePart || modulePathParts.length < 2;
    if (lacksModuleAndFile) {
      return {};
    }

    const moduleName = moduleNamePart;
    const pathInsideModule = modulePathParts.slice(1);
    const currentLayer =
      pathInsideModule.length > 1 ? (pathInsideModule[0] ?? null) : null;
    const isAllowedRootFile =
      currentLayer === null &&
      (fileName === `${moduleName}.module.ts` ||
        options.rootFileNames.includes(fileName));
    if (isAllowedRootFile) {
      return {};
    }

    const importedSourceByName: Record<TrackedImportName, string> = {
      Controller: options.controllerDecoratorSource,
      Dto: options.dtoLayerSource,
      UseCase: options.useCaseDecoratorSource,
      WebSocketGateway: options.gatewayDecoratorSource,
    };
    let controllerLocalNames = new Set<string>();
    let dtoLocalNames = new Set<string>();
    let gatewayLocalNames = new Set<string>();
    let useCaseLocalNames = new Set<string>();
    let hasReported = false;

    function getTrackedLocalNames(
      program: TSESTree.Program,
      importedName: TrackedImportName,
    ) {
      const moduleSource = importedSourceByName[importedName];
      const namesFromSource = getImportedLocalNames(program, moduleSource);
      const trackedLocalNames = new Set<string>();

      for (const statement of program.body) {
        const isDifferentSource =
          statement.type !== "ImportDeclaration" ||
          statement.source.value !== moduleSource;
        if (isDifferentSource) {
          continue;
        }

        for (const specifier of statement.specifiers) {
          const isTrackedImport =
            specifier.type === "ImportSpecifier" &&
            specifier.imported.type === "Identifier" &&
            specifier.imported.name === importedName &&
            namesFromSource.has(specifier.local.name);
          if (isTrackedImport) {
            trackedLocalNames.add(specifier.local.name);
          }
        }
      }

      return trackedLocalNames;
    }

    function getSuffixLayer() {
      for (const [layer, suffixes] of Object.entries(options.suffixLayers)) {
        const suffix = suffixes.find((candidate) =>
          fileName.endsWith(candidate),
        );
        if (suffix) {
          return {
            expectedLayer: layer,
            kind: suffixKinds[suffix] ?? `archivo con sufijo ${suffix}`,
          };
        }
      }

      return null;
    }

    function reportWrongLayer(
      node: TSESTree.Node,
      kind: string,
      expectedLayer: string,
    ) {
      const alreadyInExpectedLayer = currentLayer === expectedLayer;
      const shouldSkipLayerReport = hasReported || alreadyInExpectedLayer;
      if (shouldSkipLayerReport) {
        return;
      }

      context.report({
        data: {
          expectedLayer,
          fileName,
          kind,
          moduleName,
          modulesRoot: options.modulesRoot.replaceAll("\\", "/"),
        },
        messageId: "wrongLayer",
        node,
      });
      hasReported = true;
    }

    function reportClassLayer(
      node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
    ) {
      for (const decorator of node.decorators) {
        const decoratorName = getDecoratorName(decorator);
        const isControllerDecorator =
          decoratorName !== null && controllerLocalNames.has(decoratorName);
        if (isControllerDecorator) {
          reportWrongLayer(node, "controller", "http");

          return;
        }
        const isGatewayDecorator =
          decoratorName !== null && gatewayLocalNames.has(decoratorName);
        if (isGatewayDecorator) {
          reportWrongLayer(node, "gateway", "http");

          return;
        }
        const isUseCaseDecorator =
          decoratorName !== null && useCaseLocalNames.has(decoratorName);
        if (isUseCaseDecorator) {
          reportWrongLayer(node, "use-case", "application");

          return;
        }
      }

      const superClass = node.superClass;
      const extendsImportedDto =
        superClass?.type === "CallExpression" &&
        superClass.callee.type === "Identifier" &&
        dtoLocalNames.has(superClass.callee.name);
      if (extendsImportedDto) {
        reportWrongLayer(node, "DTO", "http");
      }
    }

    return {
      ClassDeclaration(node: TSESTree.ClassDeclaration) {
        if (!hasReported) {
          reportClassLayer(node);
        }
      },
      ClassExpression(node: TSESTree.ClassExpression) {
        if (!hasReported) {
          reportClassLayer(node);
        }
      },
      Program(node: TSESTree.Program) {
        controllerLocalNames = getTrackedLocalNames(node, "Controller");
        dtoLocalNames = getTrackedLocalNames(node, "Dto");
        gatewayLocalNames = getTrackedLocalNames(node, "WebSocketGateway");
        useCaseLocalNames = getTrackedLocalNames(node, "UseCase");

        const hasNestedModuleFile =
          currentLayer !== null && fileName.endsWith(".module.ts");
        if (hasNestedModuleFile) {
          context.report({
            data: { fileName, moduleName },
            messageId: "nestedModuleFile",
            node,
          });
          hasReported = true;

          return;
        }

        const suffixLayer = getSuffixLayer();
        if (suffixLayer) {
          reportWrongLayer(
            node,
            suffixLayer.kind,
            suffixLayer.expectedLayer,
          );
        }
      },
      "Program:exit"(node: TSESTree.Program) {
        if (hasReported) {
          return;
        }

        const hasUnknownModuleFolder =
          currentLayer !== null &&
          !options.allowedLayers.includes(currentLayer);
        if (hasUnknownModuleFolder) {
          context.report({
            data: {
              allowedLayers: options.allowedLayers
                .map((layer) => `\`${layer}/\``)
                .join(", "),
              folderName: currentLayer,
              moduleName,
            },
            messageId: "unknownModuleFolder",
            node,
          });

          return;
        }

        const hasUnknownRootFile = currentLayer === null;
        if (!hasUnknownRootFile) {
          return;
        }

        context.report({
          data: {
            allowedLayers: options.allowedLayers
              .map((layer) => `\`${layer}/\``)
              .join(", "),
            fileName,
            moduleName,
            rootFileNames: options.rootFileNames
              .map((rootFileName) => `\`${rootFileName}\``)
              .join(", "),
          },
          messageId: "unknownRootFile",
          node,
        });
      },
    };
  },
};
