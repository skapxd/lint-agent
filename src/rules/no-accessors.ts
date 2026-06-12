import type { TSESTree } from "@typescript-eslint/utils";
import { getPropertyName } from "#/utils/ast/get-property-name";
import { getNoAccessorsOptions } from "#/utils/options/get-no-accessors-options";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import type { RuleModule, RuleContext } from "#/utils/rule-authoring/rule-types";

export const noAccessors: RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prohibe getters y setters: un metodo explicito dice la verdad; un accessor esconde computacion tras sintaxis de propiedad.",
    },
    messages: {
      noAccessor:
        "No uses `{{kind}} {{name}}`: un accessor esconde computacion (o un metodo disfrazado) tras sintaxis de propiedad y escapa de las reglas de superficie publica. Usa un metodo explicito (`{{name}}()`) — dice la verdad en el call site y cuenta para max-public-methods. Para estado, prefiere propiedades readonly.",
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
    const options = getNoAccessorsOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    const isAllowedFilePattern = matchesAnyGlob(
      filename,
      options.allowFilePatterns,
    );
    if (isAllowedFilePattern) {
      return {};
    }

    function reportIfAccessor(node: TSESTree.MethodDefinition | TSESTree.Property) {
      const isAccessorMember = node.kind === "get" || node.kind === "set";
      if (!isAccessorMember) {
        return;
      }

      context.report({
        data: {
          kind: String(node.kind),
          name: getPropertyName(node.key),
        },
        messageId: "noAccessor",
        node: node.key,
      });
    }

    return {
      MethodDefinition: reportIfAccessor,
      Property: reportIfAccessor,
    };
  },
};
