import { wrapTseslintRule } from "#/utils/rule-authoring/wrap-tseslint-rule";

// @typescript-eslint/no-magic-numbers con mensaje playbook: A4 exige nombre
// semántico para todo número significativo.
export const noMagicNumbers = wrapTseslintRule("no-magic-numbers", {
  description:
    "Prohibe numeros magicos: un literal numerico significativo sin nombre. Extraelo a una const con nombre de dominio.",
  messages: {
    noMagic:
      "El numero {{raw}} aparece crudo: sin nombre nadie sabe que significa ni puede cambiarlo en un solo sitio. Extraelo a una `const` con nombre de dominio (p. ej. `const DEFAULT_TIMEOUT_MS = {{raw}}`). Los idiomaticos (0, 1, -1, 2, indices de array, miembros de enum) estan exentos: esto solo dispara sobre valores con significado.",
    useConst:
      "Un numero significativo nombrado debe declararse con `const`, no `let`/`var`: su valor no cambia, y `const` lo declara inmutable por defecto (A8). Si de verdad variara, no es una constante semantica. Cambia la declaracion a `const`.",
  },
});
