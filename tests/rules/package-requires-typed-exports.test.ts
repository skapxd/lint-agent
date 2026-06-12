import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

// La regla lee el package.json REAL subiendo desde el archivo ancla y exige
// el contrato de tipos duales: cada condicion import/require con su propio
// `types` (el `types` unico a nivel del subpath es el bug FalseCJS).
createRuleTester().run(
  "package-requires-typed-exports",
  rules["package-requires-typed-exports"]!,
  {
    invalid: [
      {
        // El layout clasico pre-attw: types unico + import/require strings.
        // Dos condiciones sin types propio → dos reportes.
        code: "export const lib = 1;",
        errors: [
          { messageId: "untypedCondition" },
          { messageId: "untypedCondition" },
        ],
        filename: "tests/fixtures/pkg-falsecjs/src/index.ts",
      },
      {
        code: "export const lib = 1;",
        errors: [{ messageId: "missingExports" }],
        filename: "tests/fixtures/pkg-no-exports/src/index.ts",
      },
    ],
    valid: [
      // Tipos duales bien cableados y archivos existentes en disco.
      {
        code: "export const lib = 1;",
        filename: "tests/fixtures/pkg-typed/src/index.ts",
      },
      // Fuera del ancla la regla no corre: un reporte por paquete.
      {
        code: "export const helper = 1;",
        filename: "tests/fixtures/pkg-falsecjs/src/utils/helper.ts",
      },
    ],
  },
);
