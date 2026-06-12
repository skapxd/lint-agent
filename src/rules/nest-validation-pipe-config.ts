import type { TSESTree } from "@typescript-eslint/utils";
import { getImportedLocalNames } from "#/utils/imports/get-imported-local-names";
import { getNestValidationPipeOptions } from "#/utils/options/get-nest-validation-pipe-options";
import { getObjectKeysSetToTrue } from "#/utils/ast/get-object-keys-set-to-true";
import { getVariableInitializer } from "#/utils/ast/get-variable-initializer";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import type { RuleModule, RuleContext } from "#/utils/rule-authoring/rule-types";

export const nestValidationPipeConfig: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "ValidationPipe debe configurar transform y whitelist: sin ellos, el contrato de los DTOs no se cumple en runtime.",
    },
    messages: {
      missingPipeOptions:
        "Este ValidationPipe no configura: {{missing}}. Sin `transform: true`, class-transformer no corre y los @Type de los DTOs no hacen nada (los anidados llegan como plain objects). Sin `whitelist: true`, las propiedades sin decorador pasan crudas al dominio. Son las dos opciones que hacen reales los contratos de los DTOs.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          requiredPipeOptions: {
            items: { type: "string" },
            type: "array",
          },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getNestValidationPipeOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    const isAllowedFilePattern = matchesAnyGlob(filename, options.allowFilePatterns);
    if (isAllowedFilePattern) {
      return {};
    }

    let commonNames = new Set<string>();

    function resolvePipeOptionsObject(argument: TSESTree.Node | undefined) {
      if (!argument) {
        return null;
      }

      const isObjectExpressionNode = argument.type === "ObjectExpression";
      if (isObjectExpressionNode) {
        return argument;
      }

      const hasIdentifierArgument = argument.type === "Identifier";
      if (!hasIdentifierArgument) {
        return undefined;
      }

      const scope = sourceCode.getScope?.(argument);

      if (!scope) {
        return undefined;
      }

      const initializer = getVariableInitializer(argument, scope);

      return initializer?.type === "ObjectExpression" ? initializer : undefined;
    }

    return {
      Program(node: TSESTree.Program) {
        commonNames = getImportedLocalNames(node, "@nestjs/common");
      },
      NewExpression(node: TSESTree.NewExpression) {
        const isValidationPipeConstructor = node.callee.type === "Identifier" &&
          node.callee.name === "ValidationPipe" &&
          commonNames.has("ValidationPipe");
        if (!isValidationPipeConstructor) {
          return;
        }

        // null = sin argumento (faltan todas); undefined = irresoluble (duda).
        const pipeOptions = resolvePipeOptionsObject(node.arguments[0]);

        if (pipeOptions === undefined) {
          return;
        }

        const hasSpread =
          pipeOptions?.properties.some(
            (property: TSESTree.Node) => property.type === "SpreadElement",
          ) ?? false;

        if (hasSpread) {
          return;
        }

        const present = pipeOptions
          ? getObjectKeysSetToTrue(pipeOptions, options.requiredPipeOptions)
          : [];
        const missing = options.requiredPipeOptions.filter(
          (key: string) => !present.includes(key),
        );

        const hasMissing = missing.length > 0;
        if (hasMissing) {
          context.report({
            data: { missing: missing.map((key: string) => `\`${key}: true\``).join(", ") },
            messageId: "missingPipeOptions",
            node,
          });
        }
      },
    };
  },
};
