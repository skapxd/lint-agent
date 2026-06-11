import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run("no-nested-if", rules["no-nested-if"], {
  invalid: [
    {
      // if dentro del consecuente de otro if
      code: "function f(a, b) { if (a) { if (b) { run(); } } }",
      errors: [{ messageId: "noNestedIf" }],
      filename: "f.ts",
    },
    {
      // if dentro de un bloque else
      code: "function f(a, b) { if (a) { run(); } else { if (b) { other(); } } }",
      errors: [{ messageId: "noNestedIf" }],
      filename: "f.ts",
    },
    {
      // anidación profunda: se reporta cada if anidado
      code: "function f(a, b, c) { if (a) { if (b) { if (c) { run(); } } } }",
      errors: [{ messageId: "noNestedIf" }, { messageId: "noNestedIf" }],
      filename: "f.ts",
    },
  ],
  valid: [
    // retorno anticipado: la alternativa que la regla empuja
    {
      code: "function f(a, b) { if (!a) return null; if (!b) return null; return run(); }",
      filename: "f.ts",
    },
    // else-if es cadena, no anidación
    {
      code: "function f(a, b) { if (a) { run(); } else if (b) { other(); } }",
      filename: "f.ts",
    },
    // una función dentro del if es una unidad cognitiva aparte
    {
      code: "function f(a) { if (a) { const g = (b) => { if (b) return 1; return 0; }; return g(a); } }",
      filename: "f.ts",
    },
    // archivos exentos por glob
    {
      code: "function f(a, b) { if (a) { if (b) { run(); } } }",
      filename: "src/legacy/f.ts",
      options: [{ allowFilePatterns: ["src/legacy/**"] }],
    },
  ],
});
