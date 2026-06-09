import { rules } from "../../src/shared/rules";
import { createTypedRuleTester } from "../typed-rule-tester";

const validPreservesCause = `
import { Result } from "@skapxd/result";

type DomainError = { message: string; cause?: unknown };

export function transform(
  input: Result<number, Error>,
): Result<number, DomainError> {
  if (!input.ok) {
    return Result.err({ cause: input.error, message: "fail" });
  }
  return Result.ok(input.value);
}
`;

const validForwardsErrorDirectly = `
import { Result } from "@skapxd/result";

export function transform(
  input: Result<number, Error>,
): Result<number, Error> {
  if (!input.ok) {
    return Result.err(input.error);
  }
  return Result.ok(input.value);
}
`;

const validNotASkapxdResult = `
function transform(input: { ok: boolean }) {
  if (!input.ok) {
    return { ok: false, error: { message: "fail" } };
  }
  return { ok: true };
}
`;

const invalidMissingCause = `
import { Result } from "@skapxd/result";

type DomainError = { message: string; cause?: unknown };

export function transform(
  input: Result<number, Error>,
): Result<number, DomainError> {
  if (!input.ok) {
    return Result.err({ message: "fail" });
  }
  return Result.ok(input.value);
}
`;

// Guarda con el type-guard idiomático `Result.isErr(...)` en vez de `!x.ok`.
const invalidIsErrGuard = `
import { Result } from "@skapxd/result";

type DomainError = { message: string; cause?: unknown };

export function transform(
  input: Result<number, Error>,
): Result<number, DomainError> {
  if (Result.isErr(input)) {
    return Result.err({ message: "fail" });
  }
  return Result.ok(input.value);
}
`;

// Result importado con alias: la detección debe seguir funcionando (robusta a
// renombres), porque se basa en el símbolo, no en el nombre literal `Result`.
const invalidAliasedResult = `
import { Result as R } from "@skapxd/result";

type DomainError = { message: string; cause?: unknown };

export function transform(input: R<number, Error>): R<number, DomainError> {
  if (!input.ok) {
    return R.err({ message: "fail" });
  }
  return R.ok(input.value);
}
`;

const ruleTester = createTypedRuleTester();
type RuleArg = Parameters<typeof ruleTester.run>[1];

ruleTester.run(
  "result-error-requires-cause",
  rules["result-error-requires-cause"] as unknown as RuleArg,
  {
    invalid: [
      {
        code: invalidMissingCause,
        errors: [{ messageId: "missingCause" }],
        filename: "invalid-missing-cause.ts",
      },
      {
        code: invalidAliasedResult,
        errors: [{ messageId: "missingCause" }],
        filename: "invalid-aliased-result.ts",
      },
      {
        code: invalidIsErrGuard,
        errors: [{ messageId: "missingCause" }],
        filename: "invalid-is-err-guard.ts",
      },
    ],
    valid: [
      { code: validPreservesCause, filename: "valid-preserves-cause.ts" },
      { code: validForwardsErrorDirectly, filename: "valid-forwards.ts" },
      { code: validNotASkapxdResult, filename: "valid-not-skapxd.ts" },
    ],
  },
);
