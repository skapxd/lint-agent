import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

// La regla lee el tsconfig.json REAL subiendo desde el archivo linteado,
// con la API de TypeScript (soporta JSONC y resuelve `extends`).
createRuleTester().run(
  "requires-strict-tsconfig",
  rules["requires-strict-tsconfig"]!,
  {
    invalid: [
      {
        // strict solo no basta: no implica noImplicitReturns ni
        // noUncheckedIndexedAccess
        code: "export const bootstrap = 1;",
        errors: [{ messageId: "missingStrictFlags" }],
        filename: "tests/fixtures/ts-loose/src/main.ts",
        options: [{ anchorFilePatterns: ["**/src/main.ts"] }],
      },
      {
        // fallback: un proyecto SIN archivo ancla (Astro, librerias) no se
        // queda sin guardian — reporta el primer archivo del run
        code: "export const helper = 1;",
        errors: [{ messageId: "missingStrictFlags" }],
        filename: "tests/fixtures/ts-loose-anchorless/src/lib/helper.ts",
        options: [{ anchorFilePatterns: ["**/src/main.ts"] }],
      },
    ],
    valid: [
      {
        code: "export const bootstrap = 1;",
        filename: "tests/fixtures/ts-strict/src/main.ts",
        options: [{ anchorFilePatterns: ["**/src/main.ts"] }],
      },
      // los flags heredados vía `extends` cuentan
      {
        code: "export const bootstrap = 1;",
        filename: "tests/fixtures/ts-extends/src/main.ts",
        options: [{ anchorFilePatterns: ["**/src/main.ts"] }],
      },
      // fuera del anchor la regla no corre si el proyecto SI tiene archivo
      // ancla: el reporte le pertenece a ese archivo (un reporte por proyecto)
      {
        code: "export const helper = 1;",
        filename: "tests/fixtures/ts-loose/src/utils/helper.ts",
        options: [{ anchorFilePatterns: ["**/src/main.ts"] }],
      },
      // fallback en proyecto sin ancla pero con tsconfig implacable: silencio
      {
        code: "export const helper = 1;",
        filename: "tests/fixtures/ts-strict-anchorless/src/lib/helper.ts",
        options: [{ anchorFilePatterns: ["**/src/main.ts"] }],
      },
      // los flags requeridos son configurables
      {
        code: "export const bootstrap = 1;",
        filename: "tests/fixtures/ts-loose/src/main.ts",
        options: [
          {
            anchorFilePatterns: ["**/src/main.ts"],
            requiredCompilerOptions: ["strict"],
          },
        ],
      },
    ],
  },
);
