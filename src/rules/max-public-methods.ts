import type { TSESTree } from "@typescript-eslint/utils";
import { getMaxPublicMethodsOptions } from "#/utils/options/get-max-public-methods-options";
import { isPublicClassMethod } from "#/utils/ast/is-public-class-method";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import type { RuleModule, RuleContext } from "#/utils/rule-authoring/rule-types";

export const maxPublicMethods: RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Limita los metodos publicos por clase: una clase, una responsabilidad. Los hooks de NestJS no cuentan.",
    },
    messages: {
      tooManyPublicMethods:
        "[REFACTOR REQUERIDO] La clase `{{className}}` tiene {{count}} metodos publicos (max {{max}}): [{{methodNames}}]. Refactoriza en {{count}} clases, una por metodo publico: (1) entiende cada metodo y elige un nombre de clase SEMANTICO (FindApcScoreService, no ApcGetService); (2) si hay estado compartido entre metodos, extraelo a una clase propia e inyectala; (3) una clase por archivo en el mismo directorio, kebab-case; (4) mueve a cada clase solo los metodos privados y dependencias del constructor que su metodo publico usa; (5) registra las clases nuevas como providers en el *.module.ts y elimina la original; (6) actualiza todos los imports de `{{className}}` en el codebase; (7) corre lint y tests.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          ignore: {
            items: { type: "string" },
            type: "array",
          },
          max: {
            minimum: 1,
            type: "integer",
          },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getMaxPublicMethodsOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    const isAllowedFilePattern = matchesAnyGlob(filename, options.allowFilePatterns);
    if (isAllowedFilePattern) {
      return {};
    }

    function reportIfTooManyPublicMethods(node: TSESTree.ClassDeclaration | TSESTree.ClassExpression) {
      const publicMethods = node.body.body
        .filter(isPublicClassMethod)
        .map((member) => member.key.name)
        .filter((name: string) => !options.ignore.has(name));

      const staysWithinMethodBudget = publicMethods.length <= options.max;
      if (staysWithinMethodBudget) {
        return;
      }

      context.report({
        data: {
          className: node.id?.name ?? "anonymous",
          count: String(publicMethods.length),
          max: String(options.max),
          methodNames: publicMethods.join(", "),
        },
        messageId: "tooManyPublicMethods",
        node: node.id ?? node,
      });
    }

    return {
      ClassDeclaration: reportIfTooManyPublicMethods,
      ClassExpression: reportIfTooManyPublicMethods,
    };
  },
};
