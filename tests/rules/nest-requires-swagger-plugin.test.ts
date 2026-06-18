import { expect, it } from "vitest";
import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

it("missingNestCli da una accion concreta", () => {
  const message = rules["nest-requires-swagger-plugin"]!.meta.messages?.missingNestCli ?? "";

  expect(message).toContain("Crea o corrige el nest-cli.json");
});

// La regla lee el nest-cli.json real subiendo desde el archivo linteado:
// los fixtures simulan un proyecto con y sin el plugin.
createRuleTester().run(
  "nest-requires-swagger-plugin",
  rules["nest-requires-swagger-plugin"]!,
  {
    invalid: [
      {
        code: "export const bootstrap = 1;",
        errors: [{ messageId: "missingSwaggerPlugin" }],
        filename: "tests/fixtures/nest-without-plugin/src/main.ts",
        options: [{ mainFilePatterns: ["**/src/main.ts"] }],
      },
    ],
    valid: [
      {
        code: "export const bootstrap = 1;",
        filename: "tests/fixtures/nest-with-plugin/src/main.ts",
        options: [{ mainFilePatterns: ["**/src/main.ts"] }],
      },
      // fuera del entrypoint la regla no corre (un solo reporte por proyecto)
      {
        code: "export const helper = 1;",
        filename: "tests/fixtures/nest-without-plugin/src/utils/helper.ts",
        options: [{ mainFilePatterns: ["**/src/main.ts"] }],
      },
    ],
  },
);
