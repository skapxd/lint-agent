import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run("no-else", rules["no-else"]!, {
  invalid: [
    {
      // el else clásico: el camino sin nombre
      code: "function f(a: boolean) { if (a) { return 1; } else { return 2; } }",
      errors: [{ messageId: "noElse" }],
      filename: "src/f.ts",
    },
    {
      // else if es un else con un if adentro: cadena → match()
      code: "function f(s: string) { if (s === 'a') { run(); } else if (s === 'b') { other(); } }",
      errors: [{ messageId: "noElse" }],
      filename: "src/f.ts",
    },
    {
      // else de efectos: extraer o ternario
      code: "function f(a: boolean) { if (a) { doA(); } else { doB(); } sigue(); }",
      errors: [{ messageId: "noElse" }],
      filename: "src/f.ts",
    },
  ],
  valid: [
    // retorno anticipado: cada salida declara su condición
    {
      code: "function f(a: boolean) { if (!a) { return 2; } return 1; }",
      filename: "src/f.ts",
    },
    // guards secuenciales reemplazan la cadena else-if
    {
      code: "function f(x: number) { if (x < 10) { return 'a'; } if (x < 20) { return 'b'; } return 'c'; }",
      filename: "src/f.ts",
    },
    // ternario simple para decisiones de valor
    {
      code: "const label = (a: boolean) => (a ? 'si' : 'no');",
      filename: "src/label.ts",
    },
    // if sin else nunca se toca
    {
      code: "function f(a: boolean) { if (a) { run(); } sigue(); }",
      filename: "src/f.ts",
    },
    {
      code: "function f(a: boolean) { if (a) { return 1; } else { return 2; } }",
      filename: "src/legacy/f.ts",
      options: [{ allowFilePatterns: ["src/legacy/**"] }],
    },
  ],
});
