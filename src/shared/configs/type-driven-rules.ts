// Reglas de typescript-eslint que el diseño guiado por tipos exige, todas
// re-registradas bajo el namespace skapxd (ver src/utils/wrap-tseslint-rule.ts):
// mismo motor, cero reimplementación, pero con nombres que dicen lo que
// defienden y mensajes que enseñan el fix — un solo namespace en toda la
// lista de pendientes del consumidor.
//
// Ausencias deliberadas (no son olvidos):
// - switch-exhaustiveness-check: prefer-ts-pattern prohíbe el switch entero;
//   match().exhaustive() da la misma garantía sin él.
// - prefer-readonly: superada por class-properties-require-readonly, que
//   exige readonly en la declaración (no solo en privados nunca reasignados).
// - strict-boolean-expressions: castiga narrowing legítimo por cientos
//   (560 hallazgos en un backend real) sin hacer irrepresentable ningún
//   estado nuevo. Ruido, no señal.
// - explicit-module-boundary-types: los contratos que importan ya están
//   gobernados (Result en await-requires-result, respuestas de controller en
//   nest-no-result-response); anotar todo lo demás es ceremonia (198
//   hallazgos) que la inferencia resuelve sin perder garantías.
// - prefer-readonly-parameter-types: impracticable con cualquier parámetro
//   que venga de una librería externa.
export const typeDrivenRules = {
  // `any` apaga el sistema de tipos: todo el esfuerzo de modelar estados
  // irrepresentables muere donde aparece uno. (Era no-explicit-any.)
  "skapxd/no-explicit-any": "error",
  // El hueco que await-requires-result no ve: una llamada async SIN await no
  // produce AwaitExpression — el rechazo muere sin pasar por trySafe. La
  // única salida sin await es `void promesa()`: fire-and-forget declarado.
  // (Era no-floating-promises; el mensaje upstream recomendaba .then/.catch,
  // que no-promise-chain prohíbe — el nuestro corrige el consejo.)
  "skapxd/no-floating-promises": "error",
  // Familia indivisible: cierra el `any` invisible que no-explicit-any no ve
  // (JSON.parse, response.json, libs sin tipos). La salida legal es unknown
  // en la frontera y narrowing con evidencia antes de tocarlo.
  "skapxd/no-unsafe-assignment": "error",
  "skapxd/no-unsafe-member-access": "error",
  "skapxd/no-unsafe-call": "error",
  "skapxd/no-unsafe-return": "error",
  "skapxd/no-unsafe-argument": "error",
  // Un `as T` que estrecha sin evidencia es la misma fuga con otro traje:
  // el type-checker razona sobre una forma que nadie comprobó en runtime.
  "skapxd/no-unverified-cast": "error",
  // La generalización type-aware de no-runtime-state-guard: si el tipo dice
  // que un estado es imposible, el guard defensivo sobra — y si el guard
  // hace falta, lo que está mal es el tipo. Requiere el tsconfig de
  // requires-strict-tsconfig para ser sólida: sin noUncheckedIndexedAccess,
  // `array[i]` miente y esta regla acusaría guards necesarios.
  // (Era no-unnecessary-condition.) El literal `true` en bucles queda
  // permitido: `while (true)` con returns internos es un bucle infinito
  // DECLARADO (axioma A5), no un guard mentiroso.
  "skapxd/no-impossible-branch": [
    "error",
    { allowConstantLoopConditions: "only-allowed-literals" },
  ],
  // `!` es "cállate, yo sé más que tú" dicho al compilador. Si el valor no
  // puede ser nulo, que lo diga el tipo; si puede serlo, hay que modelarlo.
  "skapxd/no-non-null-assertion": "error",
  // Silenciar la alarma no arregla el incendio: un error de tipos se
  // resuelve modelando mejor, no apagando el compilador. @ts-expect-error
  // queda permitido CON descripción: es la forma legítima de testear que un
  // estado inválido de verdad no compila. (Era ban-ts-comment.)
  "skapxd/no-silenced-compiler": [
    "error",
    {
      "ts-expect-error": "allow-with-description",
      "ts-ignore": true,
      "ts-nocheck": true,
    },
  ],
  // Si una frontera unknown/any acumula muchos typeof/in/Array.isArray, eso
  // ya es un schema artesanal: la evidencia debe vivir en schema declarado.
  "skapxd/prefer-schema-validation": "error",
  // `type` en vez de `interface`: las uniones discriminadas son types, y la
  // homogeneidad evita el "¿esto se puede extender por declaration merging?"
  // (Era consistent-type-definitions, cuyo default upstream es `interface` —
  // por eso la opción explícita.)
  "skapxd/prefer-type-over-interface": ["error", "type"],
};
