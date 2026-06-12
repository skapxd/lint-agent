import { wrapTseslintRule } from "#/utils/wrap-tseslint-rule";

// @typescript-eslint/no-explicit-any con mensajes que ensenan la alternativa
// (axioma A1: los estados imposibles son irrepresentables — con `any` nada
// es irrepresentable).

export const noExplicitAny = wrapTseslintRule("no-explicit-any", {
  description:
    "Prohibe `any`: apaga el sistema de tipos justo donde mas se necesita. `unknown` para lo genuinamente desconocido; el tipo real para lo demas.",
  messages: {
    suggestNever:
      "Usa `never`: util al instanciar genericos cuyo tipo no necesitas conocer.",
    suggestPropertyKey:
      "Usa `PropertyKey`: dice explicitamente 'clave de objeto', que es lo que `keyof any` insinuaba.",
    suggestUnknown:
      "Usa `unknown`: te obliga a estrechar el tipo antes de usarlo — la duda queda declarada y verificada, no escondida.",
    unexpectedAny:
      "`any` apaga el sistema de tipos: todo lo que toca deja de estar verificado y el esfuerzo de modelar estados imposibles muere donde aparece uno. Si el valor es genuinamente desconocido usa `unknown` (obliga a estrechar antes de usar); si tiene forma conocida, modela el tipo real.",
  },
});
