import type { TSESTree } from "@typescript-eslint/utils";
import { getPropertyName } from "#/utils/ast/get-property-name";
import { getDecoratorName } from "#/utils/nest/get-decorator-name";
import { getImportedLocalNames } from "#/utils/imports/get-imported-local-names";
import { getReadonlyPropertiesOptions } from "#/utils/options/get-readonly-properties-options";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import { matchesAnyPattern } from "#/utils/matching/matches-any-pattern";
import type { RuleModule, RuleContext } from "#/utils/rule-authoring/rule-types";

export const classPropertiesRequireReadonly: RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Toda propiedad de clase es readonly: el estado mutable permite estados inconsistentes; el cambio se modela con instancias nuevas.",
    },
    messages: {
      propertyRequiresReadonly:
        "La propiedad `{{name}}` no es `readonly`. El estado mutable permite estados inconsistentes (el clasico isLoading+error+value llenos a la vez); modela el cambio creando una instancia nueva con el valor actualizado. Si la mutacion es inherente (la conexion de un socket), declarala visible en `allowPropertyPatterns` — una decision en la config, no un default silencioso.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          allowPropertyPatterns: {
            items: { type: "string" },
            type: "array",
          },
          ormModuleSources: {
            items: { type: "string" },
            type: "array",
          },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getReadonlyPropertiesOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    const isAllowedFilePattern = matchesAnyGlob(filename, options.allowFilePatterns);
    if (isAllowedFilePattern) {
      return {};
    }

    let ormNames = new Set<string>();

    function isOrmManagedProperty(node: TSESTree.PropertyDefinition) {
      return node.decorators.some((decorator) => {
        const decoratorName = getDecoratorName(decorator);

        return Boolean(decoratorName && ormNames.has(decoratorName));
      });
    }

    function reportIfMutable(
      node: TSESTree.PropertyDefinition | TSESTree.TSParameterProperty,
      name: string | null | undefined,
    ) {
      if (node.readonly) {
        return;
      }

      const isAllowedPropertyName = name && matchesAnyPattern(name, options.allowPropertyPatterns);
      if (isAllowedPropertyName) {
        return;
      }

      context.report({
        data: { name: name ?? "anonymous" },
        messageId: "propertyRequiresReadonly",
        node,
      });
    }

    return {
      Program(node: TSESTree.Program) {
        ormNames = new Set(
          options.ormModuleSources.flatMap((source: string) => [
            ...getImportedLocalNames(node, source),
          ]),
        );
      },
      PropertyDefinition(node: TSESTree.PropertyDefinition) {
        // Una propiedad decorada por el ORM (@Prop, @Column) le pertenece
        // al ORM: su modelo de mutación (doc.campo = x; doc.save()) no es
        // asunto de este lint. La exención es por propiedad, no por archivo.
        const isOrmManagedPropertyAllowed = isOrmManagedProperty(node);
        if (isOrmManagedPropertyAllowed) {
          return;
        }

        reportIfMutable(node, getPropertyName(node.key));
      },
      // constructor(private foo: X) también es una propiedad de la clase.
      TSParameterProperty(node: TSESTree.TSParameterProperty) {
        const parameter = node.parameter;
        const parameterName = parameter.type === "Identifier"
          ? parameter.name
          : parameter.left.name;

        reportIfMutable(node, parameterName);
      },
    };
  },
};
