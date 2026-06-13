import { getTseslintPluginRules } from "./get-tseslint-plugin-rules";
import type { UpstreamRuleModule } from "./upstream-rule-module";

type WrapOverrides = {
  description: string;
  messages: Record<string, string>;
};

const upstreamRules = getTseslintPluginRules();

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
