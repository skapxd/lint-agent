// Reglas de typescript-eslint que el diseño guiado por tipos exige y que no
// tiene sentido reimplementar — typescript-eslint ya es peer dependency.
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
  // Silenciar la alarma no arregla el incendio: un error de tipos se
  // resuelve modelando mejor, no apagando el compilador. @ts-expect-error
  // queda permitido CON descripción: es la forma legítima de testear que un
  // estado inválido de verdad no compila.
  "@typescript-eslint/ban-ts-comment": [
    "error",
    {
      "ts-expect-error": "allow-with-description",
      "ts-ignore": true,
      "ts-nocheck": true,
    },
  ],
  // `type` en vez de `interface`: las uniones discriminadas son types, y la
  // homogeneidad evita el "¿esto se puede extender por declaration merging?"
  "@typescript-eslint/consistent-type-definitions": ["error", "type"],
  // `any` apaga el sistema de tipos: todo el esfuerzo de modelar estados
  // irrepresentables muere donde aparece uno.
  "@typescript-eslint/no-explicit-any": "error",
  // El hueco que await-requires-result no ve: una llamada async SIN await no
  // produce AwaitExpression — el rechazo muere sin pasar por trySafe. Esta
  // regla obliga a awaitear (y ahí entra el pipeline de Result). El operador
  // `void promesa` queda como única salida: fire-and-forget declarado y
  // greppeable, no interpretado.
  "@typescript-eslint/no-floating-promises": "error",
  // `!` es "cállate, yo sé más que tú" dicho al compilador. Si el valor no
  // puede ser nulo, que lo diga el tipo; si puede serlo, hay que modelarlo.
  "@typescript-eslint/no-non-null-assertion": "error",
  // La generalización type-aware de no-runtime-state-guard: si el tipo dice
  // que un estado es imposible, el guard defensivo sobra — y si el guard
  // hace falta, lo que está mal es el tipo. Requiere el tsconfig de
  // requires-strict-tsconfig para ser sólida: sin noUncheckedIndexedAccess,
  // `array[i]` miente y esta regla acusaría guards necesarios.
  "@typescript-eslint/no-unnecessary-condition": "error",
};
