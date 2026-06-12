import { wrapTseslintRule } from "#/utils/rule-authoring/wrap-tseslint-rule";

// @typescript-eslint/consistent-type-definitions bajo un nombre que declara
// la opinion (como prefer-ts-pattern o prefer-tagged-union-state). Ojo: la
// regla upstream por defecto prefiere `interface` — los presets la activan
// con ["error", "type"]; si la usas suelta, pasa la opcion.

export const preferTypeOverInterface = wrapTseslintRule(
  "consistent-type-definitions",
  {
    description:
      "Prefiere `type` sobre `interface`: las uniones discriminadas son types, y un type no puede crecer en silencio por declaration merging.",
    messages: {
      typeOverInterface:
        "Usa `type` en vez de `interface`: las uniones discriminadas — la columna vertebral del modelado de estados — son types, y un `type` no puede ser extendido en silencio por declaration merging: lo que declara es todo lo que hay.",
    },
  },
);
