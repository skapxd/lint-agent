// @ts-nocheck
import { getDecoratorName } from "#/utils/get-decorator-name";
import { getImportedLocalNames } from "#/utils/get-imported-local-names";
import { getReadonlyPropertiesOptions } from "#/utils/get-readonly-properties-options";
import { matchesAnyGlob } from "#/utils/matches-any-glob";
import { matchesAnyPattern } from "#/utils/matches-any-pattern";

export const classPropertiesRequireReadonly = {
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
  create(context) {
    const options = getReadonlyPropertiesOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    if (matchesAnyGlob(filename, options.allowFilePatterns)) {
      return {};
    }

    let ormNames = new Set();

    function isOrmManagedProperty(node) {
      return (node.decorators ?? []).some((decorator) =>
        ormNames.has(getDecoratorName(decorator)),
      );
    }

    function reportIfMutable(node, name) {
      if (node.readonly) {
        return;
      }

      if (name && matchesAnyPattern(name, options.allowPropertyPatterns)) {
        return;
      }

      context.report({
        data: { name: name ?? "anonymous" },
        messageId: "propertyRequiresReadonly",
        node,
      });
    }

    return {
      Program(node) {
        ormNames = new Set(
          options.ormModuleSources.flatMap((source) => [
            ...getImportedLocalNames(node, source),
          ]),
        );
      },
      PropertyDefinition(node) {
        // Una propiedad decorada por el ORM (@Prop, @Column) le pertenece
        // al ORM: su modelo de mutación (doc.campo = x; doc.save()) no es
        // asunto de este lint. La exención es por propiedad, no por archivo.
        if (isOrmManagedProperty(node)) {
          return;
        }

        reportIfMutable(node, node.key?.name);
      },
      // constructor(private foo: X) también es una propiedad de la clase.
      TSParameterProperty(node) {
        reportIfMutable(node, node.parameter?.name);
      },
    };
  },
};
