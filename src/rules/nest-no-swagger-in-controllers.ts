import { getDecoratorName } from "#/utils/get-decorator-name";
import { getImportedLocalNames } from "#/utils/get-imported-local-names";
import { getNestSwaggerControllerOptions } from "#/utils/get-nest-swagger-controller-options";
import { hasClassDecoratorNamed } from "#/utils/has-class-decorator-named";
import { matchesAnyGlob } from "#/utils/matches-any-glob";
import type { RuleModule, LegacyAstNode } from "#/utils/rule-types";

export const nestNoSwaggerInControllers: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Los controllers no se llenan de decoradores de swagger: la documentacion vive en los DTOs.",
    },
    messages: {
      swaggerInController:
        "`@{{name}}` no va en el controller: con el plugin de @nestjs/swagger activo, los tipos de query/params/body y el tipo de retorno se introspeccionan solos desde los DTOs (que llevan @ApiProperty). Mueve la documentacion al DTO de input/output. En el controller solo se permiten: {{allowed}}.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          allowedDecoratorNames: {
            items: { type: "string" },
            type: "array",
          },
          controllerDecoratorNames: {
            items: { type: "string" },
            type: "array",
          },
        },
        type: "object",
      },
    ],
  },
  create(context: LegacyAstNode) {
    const options = getNestSwaggerControllerOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    if (matchesAnyGlob(filename, options.allowFilePatterns)) {
      return {};
    }

    let swaggerNames = new Set();

    function isInsideControllerClass(node: LegacyAstNode) {
      let current = node.parent;

      while (current) {
        if (
          current.type === "ClassDeclaration" ||
          current.type === "ClassExpression"
        ) {
          return hasClassDecoratorNamed(current, options.controllerDecoratorNames);
        }

        current = current.parent;
      }

      return false;
    }

    return {
      Program(node: LegacyAstNode) {
        swaggerNames = getImportedLocalNames(node, "@nestjs/swagger");
      },
      Decorator(node: LegacyAstNode) {
        const name = getDecoratorName(node);

        if (
          !name ||
          !swaggerNames.has(name) ||
          options.allowedDecoratorNames.includes(name)
        ) {
          return;
        }

        if (!isInsideControllerClass(node)) {
          return;
        }

        context.report({
          data: {
            allowed: options.allowedDecoratorNames.join(", "),
            name,
          },
          messageId: "swaggerInController",
          node,
        });
      },
    };
  },
};
