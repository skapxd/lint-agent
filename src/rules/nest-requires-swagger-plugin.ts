import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { trySafe } from "@skapxd/result";
import { findProjectFile } from "#/utils/project/find-project-file";
import { getNestSwaggerPluginOptions } from "#/utils/options/get-nest-swagger-plugin-options";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import { nestCliHasSwaggerPlugin } from "#/utils/nest/nest-cli-has-swagger-plugin";
import type { RuleNode, RuleModule, RuleContext } from "#/utils/rule-authoring/rule-types";

export const nestRequiresSwaggerPlugin: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "El proyecto Nest debe tener el plugin @nestjs/swagger en nest-cli.json: es la premisa de las reglas de swagger.",
    },
    messages: {
      missingNestCli:
        "No encontre un nest-cli.json legible en el proyecto. El preset nest asume el plugin @nestjs/swagger activo (introspecciona DTOs y tipos de retorno); sin nest-cli.json esa premisa no se puede verificar.",
      missingSwaggerPlugin:
        "nest-cli.json no tiene el plugin @nestjs/swagger. Sin el, los DTOs y tipos de retorno NO se introspeccionan y el swagger queda vacio (las reglas del preset prohiben documentarlo a mano en los controllers). Agrega en compilerOptions: `\"plugins\": [\"@nestjs/swagger\"]`.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          mainFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getNestSwaggerPluginOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    if (
      matchesAnyGlob(filename, options.allowFilePatterns) ||
      !matchesAnyGlob(filename, options.mainFilePatterns)
    ) {
      return {};
    }

    return {
      Program(node: RuleNode) {
        const absoluteFilename = resolve(context.cwd ?? process.cwd(), filename);
        const nestCliPath = findProjectFile(dirname(absoluteFilename), "nest-cli.json");

        if (!nestCliPath) {
          context.report({ messageId: "missingNestCli", node });

          return;
        }

        const nestCliConfig = trySafe<Record<string, unknown>>(() =>
          JSON.parse(readFileSync(nestCliPath, "utf8")) as Record<
            string,
            unknown
          >,
        );

        if (!nestCliConfig.ok) {
          context.report({
            data: { reason: String(nestCliConfig.error) },
            messageId: "missingNestCli",
            node,
          });

          return;
        }

        if (!nestCliHasSwaggerPlugin(nestCliConfig.value)) {
          context.report({ messageId: "missingSwaggerPlugin", node });
        }
      },
    };
  },
};
