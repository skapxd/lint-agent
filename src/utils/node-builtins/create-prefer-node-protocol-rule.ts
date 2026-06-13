import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { isBuiltinDetector } from "./is-builtin-detector";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import { getPreferNodeProtocolOptions } from "#/utils/options/get-prefer-node-protocol-options";
import type {
  RuleContext,
  RuleModule,
} from "#/utils/rule-authoring/rule-types";

type StringSpecifierNode = TSESTree.StringLiteral;

export function createPreferNodeProtocolRule(
  builtinDetectorCandidate: unknown,
): RuleModule {
  return {
    meta: {
      type: "suggestion",
      docs: {
        description:
          "Exige el protocolo `node:` al importar modulos nativos de Node.",
      },
      fixable: "code",
      messages: {
        preferNodeProtocol:
          "Los modulos nativos de Node se importan con protocolo explicito: `node:{{moduleName}}`, no `{{moduleName}}`. El prefijo separa lo que viene del runtime de lo que viene de npm, evita que un paquete instalado con el mismo nombre lo shadowee, y es OBLIGATORIO en Deno. Autofix disponible. Ojo: `node:` no instala `@types/node` ni convierte codigo browser en codigo server.",
      },
      schema: [
        {
          additionalProperties: false,
          properties: {
            allowFilePatterns: {
              items: { type: "string" },
              type: "array",
            },
          },
          type: "object",
        },
      ],
    },
    create(context: RuleContext) {
      const options = getPreferNodeProtocolOptions(context.options[0]);
      const filename = context.filename ?? context.getFilename();

      const isAllowedFilePattern = matchesAnyGlob(
        filename,
        options.allowFilePatterns,
      );
      const shouldSkipRule =
        isAllowedFilePattern || !isBuiltinDetector(builtinDetectorCandidate);
      if (shouldSkipRule) {
        return {};
      }

      const isBuiltin = builtinDetectorCandidate;

      function reportIfBareNodeBuiltin(source: StringSpecifierNode | null) {
        const lacksStringSource = !source || typeof source.value !== "string";
        if (lacksStringSource) {
          return;
        }

        const moduleName = source.value;
        const hasProtocol = moduleName.includes(":");
        if (hasProtocol) {
          return;
        }

        const isNodeBuiltin = isBuiltin(`node:${moduleName}`);
        if (!isNodeBuiltin) {
          return;
        }

        context.report({
          data: { moduleName },
          fix(fixer: TSESLint.RuleFixer) {
            return fixer.replaceTextRange(
              [source.range[0] + 1, source.range[1] - 1],
              `node:${moduleName}`,
            );
          },
          messageId: "preferNodeProtocol",
          node: source,
        });
      }

      return {
        CallExpression(node: TSESTree.CallExpression) {
          const isRequireCall =
            node.callee.type === "Identifier" && node.callee.name === "require";
          if (!isRequireCall) {
            return;
          }

          const firstArgument = node.arguments[0];
          const hasStringLiteralArgument =
            firstArgument?.type === "Literal" &&
            typeof firstArgument.value === "string";
          reportIfBareNodeBuiltin(
            hasStringLiteralArgument ? firstArgument : null,
          );
        },
        ExportAllDeclaration(node: TSESTree.ExportAllDeclaration) {
          reportIfBareNodeBuiltin(node.source);
        },
        ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration) {
          reportIfBareNodeBuiltin(node.source);
        },
        ImportDeclaration(node: TSESTree.ImportDeclaration) {
          reportIfBareNodeBuiltin(node.source);
        },
        ImportExpression(node: TSESTree.ImportExpression) {
          const importSource = node.source;
          const isStringLiteralImport =
            importSource.type === "Literal" &&
            typeof importSource.value === "string";
          reportIfBareNodeBuiltin(isStringLiteralImport ? importSource : null);
        },
      };
    },
  };
}
