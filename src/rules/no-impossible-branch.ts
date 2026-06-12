// @ts-nocheck
import tseslint from "typescript-eslint";

// Re-registro de @typescript-eslint/no-unnecessary-condition bajo un nombre
// que dice lo que defiende (axioma A1: los estados imposibles son
// irrepresentables) y con mensajes que ensenan el fix. El `create` es el de
// la regla original — typescript-eslint ya es peer dependency, aqui no se
// reimplementa nada. Se hace spread de los messages originales para que
// ningun messageId quede huerfano si la regla upstream agrega casos nuevos.

const original = tseslint.plugin.rules["no-unnecessary-condition"];

const elTipoMiente =
  " Si la comprobacion hace falta en runtime, el tipo esta mintiendo: arregla el tipo, no borres el guard a ciegas (acceso por indice tipo `array[i]` u `obj[key]`? te falta `noUncheckedIndexedAccess` en el tsconfig — `skapxd/requires-strict-tsconfig` lo exige).";

export const noImpossibleBranch = {
  ...original,
  meta: {
    ...original.meta,
    docs: {
      ...original.meta.docs,
      description:
        "La rama imposible: condiciones que el type-checker demuestra constantes. Si el tipo dice que no puede pasar, la rama sobra; si la rama hace falta, lo que esta mal es el tipo.",
    },
    messages: {
      ...original.meta.messages,
      alwaysFalsy:
        "Rama imposible: el tipo dice que este valor SIEMPRE es falsy — el camino positivo de esta condicion es codigo muerto." +
        elTipoMiente,
      alwaysNullish:
        "Rama imposible: el tipo dice que el lado izquierdo del `??` SIEMPRE es null/undefined — la expresion es solo su fallback." +
        elTipoMiente,
      alwaysTruthy:
        "Pregunta ya respondida: el tipo dice que este valor SIEMPRE es truthy — la condicion solo tiene un camino posible." +
        elTipoMiente,
      comparisonBetweenLiteralTypes:
        "Comparacion constante: `{{left}} {{operator}} {{right}}` siempre es {{trueOrFalse}} segun los tipos — esta decision no decide nada." +
        elTipoMiente,
      never:
        "Rama imposible: este valor es de tipo `never` — segun el modelo, este punto del codigo es inalcanzable." +
        elTipoMiente,
      neverNullish:
        "El `??` no aporta: el tipo dice que el lado izquierdo NUNCA es null/undefined — el fallback es codigo muerto." +
        elTipoMiente,
      neverOptionalChain:
        "El `?.` sobra: el tipo dice que este valor nunca es nullish — el encadenamiento opcional finge una duda que el modelo ya resolvio." +
        elTipoMiente,
      noOverlapBooleanExpression:
        "Comparacion imposible: los tipos de ambos lados no se solapan, asi que el resultado siempre es el mismo (ej. comparar con `null` un valor cuyo tipo nunca incluye `null`)." +
        elTipoMiente,
      noStrictNullCheck:
        "Esta regla necesita `strictNullChecks` (viene con `strict: true`): sin el, los tipos mienten sobre null/undefined y la regla acusaria guards necesarios. `skapxd/requires-strict-tsconfig` vigila esa premisa.",
    },
  },
};
