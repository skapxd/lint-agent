// @ts-nocheck
import { wrapTseslintRule } from "#/utils/wrap-tseslint-rule";

// @typescript-eslint/no-non-null-assertion con mensajes que ensenan a
// modelar en vez de negar (axioma A2: ningun efecto invisible al tipo — un
// `!` equivocado es un crash que el tipo juro imposible).

export const noNonNullAssertion = wrapTseslintRule("no-non-null-assertion", {
  description:
    "Prohibe el `!` (non-null assertion): es 'callate, yo se mas que tu' dicho al compilador. Si no puede ser nulo, que lo diga el tipo; si puede serlo, hay que manejarlo.",
  messages: {
    noNonNull:
      "El `!` es 'callate, yo se mas que tu' dicho al compilador. Si el valor de verdad no puede ser nulo, que lo diga el tipo (modela mejor o estrecha con un guard legitimo que el compilador verifique); si puede serlo, este `!` esconde un crash que el tipo juraba imposible.",
    suggestOptionalChain:
      "Considera `?.`: a diferencia del `!`, comprueba en runtime — la duda se maneja en vez de negarse.",
  },
});
