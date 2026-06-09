import { rules } from "../../src/shared/rules";
import { createTypedRuleTester } from "../typed-rule-tester";

// trySafe REAL de @skapxd/result → protege el await.
const validSkapxdTrySafe = `
import { trySafe } from "@skapxd/result";

export async function load() {
  const result = await trySafe(() => fetch("/x"));
  return result;
}
`;

// Un trySafe local (homónimo, NO de @skapxd/result) NO protege.
const invalidForeignTrySafe = `
function trySafe<T>(fn: () => T): T {
  return fn();
}

export async function load() {
  const value = await trySafe(() => Promise.resolve(1));
  return value;
}
`;

const ruleTester = createTypedRuleTester();
type RuleArg = Parameters<typeof ruleTester.run>[1];

ruleTester.run(
  "await-requires-try-safe",
  rules["await-requires-try-safe"] as unknown as RuleArg,
  {
    invalid: [
      {
        code: invalidForeignTrySafe,
        errors: [{ messageId: "unprotectedAwait" }],
        filename: "invalid-foreign-try-safe.ts",
      },
    ],
    valid: [{ code: validSkapxdTrySafe, filename: "valid-skapxd-try-safe.ts" }],
  },
);
