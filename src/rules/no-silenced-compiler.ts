import { wrapTseslintRule } from "#/utils/wrap-tseslint-rule";

// @typescript-eslint/ban-ts-comment bajo un nombre que dice lo que defiende
// (axioma A5: las decisiones se declaran, no se interpretan — y silenciar la
// alarma no es declarar nada): el compilador es el muro de contencion y
// nadie lo apaga cuando el modelado se pone dificil.

export const noSilencedCompiler = wrapTseslintRule("ban-ts-comment", {
  description:
    "No silencies al compilador: @ts-ignore y @ts-nocheck apagan la alarma en vez de arreglar el incendio. @ts-expect-error con descripcion queda para testear que lo invalido NO compila.",
  messages: {
    replaceTsIgnoreWithTsExpectError:
      "Reemplaza `@ts-ignore` por `@ts-expect-error`.",
    tsDirectiveComment:
      "No silencies al compilador: `@ts-{{directive}}` apaga la alarma en vez de arreglar el incendio. Un error de tipos se resuelve modelando mejor el dominio. Para testear que un estado invalido de verdad NO compila, usa `@ts-expect-error` con descripcion.",
    tsDirectiveCommentDescriptionNotMatchPattern:
      "La descripcion de `@ts-{{directive}}` debe cumplir el formato {{format}}.",
    tsDirectiveCommentRequiresDescription:
      "Explica el porque: `@ts-{{directive}}` exige una descripcion (minimo {{minimumDescriptionLength}} caracteres) que justifique la supresion — si la trampa existe, queda declarada y auditable, no escondida.",
    tsIgnoreInsteadOfExpectError:
      "Usa `@ts-expect-error` en vez de `@ts-ignore`: si la linea siguiente deja de fallar, `@ts-ignore` calla para siempre; `@ts-expect-error` te avisa que la supresion ya no hace falta.",
  },
});
