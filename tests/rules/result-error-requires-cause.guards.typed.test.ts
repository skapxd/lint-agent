import { rules } from "../../src/shared/rules";
import { createTypedRuleTester } from "../typed-rule-tester";

// Casos de los huecos cerrados en la revisión de 2026-06: Result.err() vacío
// y el guard por presencia del error. En archivo aparte porque projectService
// admite máximo 8 archivos por default project y el test principal ya los usa.
// `Result.err()` sin argumentos descarta el error por completo: se reporta.
const invalidEmptyErr = `
import { Result } from "@skapxd/result";

export function transform(input: Result<number, Error>): Result<number, Error> {
  if (!input.ok) {
    return Result.err();
  }
  return Result.ok(input.value);
}
`;

// El guard por presencia del error (\`if (x.error)\`) también se vigila.
const invalidErrorMemberGuard = `
import { Result } from "@skapxd/result";

type DomainError = { message: string; cause?: unknown };

export function transform(
  input: Result<number, Error>,
): Result<number, DomainError> {
  if (input.error) {
    return Result.err({ message: "fail" });
  }
  return Result.ok(input.value);
}
`;

const validErrorMemberGuardWithCause = `
import { Result } from "@skapxd/result";

type DomainError = { message: string; cause?: unknown };

export function transform(
  input: Result<number, Error>,
): Result<number, DomainError> {
  if (input.error) {
    return Result.err({ cause: input.error, message: "fail" });
  }
  return Result.ok(input.value);
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
        code: invalidEmptyErr,
        errors: [{ messageId: "missingCause" }],
        filename: "invalid-empty-err.ts",
      },
      {
        code: invalidErrorMemberGuard,
        errors: [{ messageId: "missingCause" }],
        filename: "invalid-error-member-guard.ts",
      },
    ],
    valid: [
      {
        code: validErrorMemberGuardWithCause,
        filename: "valid-error-member-guard.ts",
      },
    ],
  },
);
