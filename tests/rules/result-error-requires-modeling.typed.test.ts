import { rules } from "../../src/shared/rules";
import { createTypedRuleTester } from "../typed-rule-tester";

const invalidBoundaryReturnsUnknownError = `
import { Result, trySafe } from "@skapxd/result";

declare const model: { findById(id: string): Promise<string | null> };

export async function findById(
  id: string,
): Promise<Result<string | null, unknown>> {
  return trySafe(() => model.findById(id));
}
`;

const invalidInferredUnknownError = `
import { trySafe } from "@skapxd/result";

declare const model: { findById(id: string): Promise<string | null> };

export function findById(id: string) {
  return trySafe(() => model.findById(id));
}
`;

const invalidSyncUnknownError = `
import { Result, trySafe } from "@skapxd/result";

declare const parse: (raw: string) => unknown;

export function parseConfig(raw: string): Result<unknown, unknown> {
  return trySafe(() => parse(raw));
}
`;

const validModeledTaggedUnionError = `
import { Result, trySafe } from "@skapxd/result";

type RepositoryError = { _tag: "DbError"; cause: unknown };

declare const model: { findById(id: string): Promise<string | null> };

export async function findById(
  id: string,
): Promise<Result<string | null, RepositoryError>> {
  const result = await trySafe(() => model.findById(id));
  if (result.ok) {
    return result;
  }
  return Result.err({ _tag: "DbError" as const, cause: result.error });
}
`;

const validNonResultReturn = `
export async function findById(id: string): Promise<string | null> {
  return id;
}
`;

const validModeledErrorClass = `
import { Result } from "@skapxd/result";

class RepositoryError extends Error {}

export function load(): Result<string, RepositoryError> {
  return Result.ok("ok");
}
`;

const ruleTester = createTypedRuleTester();
type RuleArg = Parameters<typeof ruleTester.run>[1];

ruleTester.run(
  "result-error-requires-modeling",
  rules["result-error-requires-modeling"] as unknown as RuleArg,
  {
    invalid: [
      {
        code: invalidBoundaryReturnsUnknownError,
        errors: [{ data: { name: "findById" }, messageId: "unmodeledError" }],
        filename: "user.repository.ts",
      },
      {
        code: invalidInferredUnknownError,
        errors: [{ data: { name: "findById" }, messageId: "unmodeledError" }],
        filename: "user.repository.ts",
      },
      {
        code: invalidSyncUnknownError,
        errors: [{ data: { name: "parseConfig" }, messageId: "unmodeledError" }],
        filename: "parse-config.ts",
      },
    ],
    valid: [
      { code: validModeledTaggedUnionError, filename: "user.repository.ts" },
      { code: validNonResultReturn, filename: "user.repository.ts" },
      { code: validModeledErrorClass, filename: "loader.ts" },
      {
        code: invalidBoundaryReturnsUnknownError,
        filename: "user.repository.ts",
        options: [{ allowFilePatterns: ["**/*.repository.ts"] }],
      },
    ],
  },
);
