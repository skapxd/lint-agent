import { rules } from "../../src/shared/rules";
import { createTypedRuleTester } from "../typed-rule-tester";

// Un objeto literal siempre es truthy: la condicion solo tiene un camino.
const invalidAlwaysTruthy = `
const config = { retries: 3 };
if (config) {
  run();
}

declare function run(): void;
`;

// Comparar con null un valor cuyo tipo nunca incluye null: sin solape.
const invalidNoOverlap = `
declare const value: string | number;
if (value !== null) {
  run();
}

declare function run(): void;
`;

// La pregunta legitima: el tipo admite ambas respuestas.
const validRealQuestion = `
declare const name: string | undefined;
if (name) {
  run();
}

declare function run(): void;
`;

const ruleTester = createTypedRuleTester();
type RuleArg = Parameters<typeof ruleTester.run>[1];

ruleTester.run(
  "no-impossible-branch",
  rules["no-impossible-branch"] as unknown as RuleArg,
  {
    invalid: [
      {
        code: invalidAlwaysTruthy,
        errors: [{ messageId: "alwaysTruthy" }],
        filename: "invalid-always-truthy.ts",
      },
      {
        code: invalidNoOverlap,
        errors: [{ messageId: "noOverlapBooleanExpression" }],
        filename: "invalid-no-overlap.ts",
      },
    ],
    valid: [{ code: validRealQuestion, filename: "valid-real-question.ts" }],
  },
);
