import { rules } from "../../src/shared/rules";
import { createTypedRuleTester } from "../typed-rule-tester";

const validSkapxdResult = `
import { Result } from "@skapxd/result";

export async function reserve(): Promise<Result<number, Error>> {
  return Result.ok(1);
}
`;

// Un Result con el mismo nombre pero de OTRO origen no debe contar:
// la regla está atada a @skapxd/result.
const invalidForeignResult = `
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export async function reserve(): Promise<Result<number, Error>> {
  return { ok: true, value: 1 };
}
`;

const ruleTester = createTypedRuleTester();
type RuleArg = Parameters<typeof ruleTester.run>[1];

ruleTester.run(
  "async-functions-return-result",
  rules["async-functions-return-result"] as unknown as RuleArg,
  {
    invalid: [
      {
        code: invalidForeignResult,
        errors: [{ messageId: "invalidReturnType" }],
        filename: "invalid-foreign-result.ts",
      },
    ],
    valid: [{ code: validSkapxdResult, filename: "valid-skapxd-result.ts" }],
  },
);
