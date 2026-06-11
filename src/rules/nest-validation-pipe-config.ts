// @ts-nocheck
import { getImportedLocalNames } from "#/utils/get-imported-local-names";
import { getNestValidationPipeOptions } from "#/utils/get-nest-validation-pipe-options";
import { getObjectKeysSetToTrue } from "#/utils/get-object-keys-set-to-true";
import { getVariableInitializer } from "#/utils/get-variable-initializer";
import { matchesAnyGlob } from "#/utils/matches-any-glob";

export const nestValidationPipeConfig = {
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
  create(context) {
    const options = getNestValidationPipeOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    if (matchesAnyGlob(filename, options.allowFilePatterns)) {
      return {};
    }

    let commonNames = new Set();

    function resolvePipeOptionsObject(argument) {
      if (!argument) {
        return null;
      }

      if (argument.type === "ObjectExpression") {
        return argument;
      }

      if (argument.type !== "Identifier") {
        return undefined;
      }

      const initializer = getVariableInitializer(
        argument,
        sourceCode.getScope(argument),
      );

      return initializer?.type === "ObjectExpression" ? initializer : undefined;
    }

    return {
      Program(node) {
        commonNames = getImportedLocalNames(node, "@nestjs/common");
      },
      NewExpression(node) {
        if (
          node.callee?.type !== "Identifier" ||
          node.callee.name !== "ValidationPipe" ||
          !commonNames.has("ValidationPipe")
        ) {
          return;
        }

        // null = sin argumento (faltan todas); undefined = irresoluble (duda).
        const pipeOptions = resolvePipeOptionsObject(node.arguments[0]);

        if (pipeOptions === undefined) {
          return;
        }

        const hasSpread =
          pipeOptions?.properties.some(
            (property) => property.type === "SpreadElement",
          ) ?? false;

        if (hasSpread) {
          return;
        }

        const present = pipeOptions
          ? getObjectKeysSetToTrue(pipeOptions, options.requiredPipeOptions)
          : [];
        const missing = options.requiredPipeOptions.filter(
          (key) => !present.includes(key),
        );

        if (missing.length > 0) {
          context.report({
            data: { missing: missing.map((key) => `\`${key}: true\``).join(", ") },
            messageId: "missingPipeOptions",
            node,
          });
        }
      },
    };
  },
};
