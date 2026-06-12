import tseslint from "typescript-eslint";

// Forma minima de una regla de typescript-eslint que el wrapper necesita
// conocer; el resto de campos pasan intactos via spread.
type UpstreamRuleModule = {
  create: (context: unknown) => Record<string, unknown>;
  meta: {
    docs?: Record<string, unknown>;
    messages?: Record<string, string>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

type WrapOverrides = {
  description: string;
  messages: Record<string, string>;
};

// El tipo publico CompatiblePlugin de tseslint no expone `rules`: se
// reafirma a la forma real del plugin para poder leer las reglas originales.
const upstreamRules = (
  tseslint.plugin as unknown as { rules: Record<string, UpstreamRuleModule> }
).rules;

// Re-registra una regla de typescript-eslint bajo el namespace skapxd:
// mismo `create` y mismas opciones (cero reimplementacion — typescript-eslint
// ya es peer dependency), pero con descripcion propia y mensajes que ensenan
// el fix. Se hace spread de los messages originales para que ningun messageId
// quede huerfano si la regla upstream agrega casos nuevos.
export function wrapTseslintRule(
  upstreamRuleName: string,
  { description, messages }: WrapOverrides,
): UpstreamRuleModule {
  const original = upstreamRules[upstreamRuleName];

  if (!original) {
    throw new Error(
      `wrapTseslintRule: la regla "${upstreamRuleName}" no existe en typescript-eslint.`,
    );
  }

  return {
    ...original,
    meta: {
      ...original.meta,
      docs: {
        ...original.meta.docs,
        description,
      },
      messages: {
        ...original.meta.messages,
        ...messages,
      },
    },
  };
}
