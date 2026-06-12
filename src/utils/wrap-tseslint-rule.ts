// @ts-nocheck
import tseslint from "typescript-eslint";

// Re-registra una regla de typescript-eslint bajo el namespace skapxd:
// mismo `create` y mismas opciones (cero reimplementacion — typescript-eslint
// ya es peer dependency), pero con descripcion propia y mensajes que ensenan
// el fix. Se hace spread de los messages originales para que ningun messageId
// quede huerfano si la regla upstream agrega casos nuevos.
export function wrapTseslintRule(upstreamRuleName, { description, messages }) {
  const original = tseslint.plugin.rules[upstreamRuleName];

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
