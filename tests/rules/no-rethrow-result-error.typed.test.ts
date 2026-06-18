import { rules } from "../../src/shared/rules";
import { createTypedRuleTester } from "../typed-rule-tester";

const invalidRuntimeOrigin = `
import { trySafe } from "@skapxd/result";
import { readFile } from "node:fs/promises";

export async function loadFile() {
  const result = await trySafe(() => readFile("fixture.txt", "utf8"));
  if (!result.ok) {
    throw result.error;
  }
  return result.value;
}
`;

const invalidDomainOrigin = `
import { trySafe } from "@skapxd/result";

async function loadDomainValue(): Promise<string> {
  return "ok";
}

export async function load() {
  const result = await trySafe(() => loadDomainValue());
  if (!result.ok) {
    throw result.error;
  }
  return result.value;
}
`;

const invalidFallbackOrigin = `
import { type Result } from "@skapxd/result";

export function unwrap(result: Result<number, Error>) {
  if (!result.ok) {
    throw result.error;
  }
  return result.value;
}
`;

const invalidMatchHandler = `
import { trySafe } from "@skapxd/result";
import { readFile } from "node:fs/promises";

declare function match<T>(value: T): {
  with(
    pattern: { ok: false },
    handler: (
      value: T extends { ok: false; error: infer E } ? { error: E } : never
    ) => unknown,
  ): unknown;
};

export async function load() {
  const result = await trySafe(() => readFile("fixture.txt", "utf8"));
  return match(result).with({ ok: false }, ({ error }) => {
    throw error;
  });
}
`;

const validThrowNewHttpExceptionInController = `
import { trySafe } from "@skapxd/result";

declare function Controller(): (target: object) => void;
declare class BadRequestException extends Error {
  constructor(message: string, options?: { cause?: unknown });
}
declare function loadDomainValue(): Promise<string>;

@Controller()
class UsersController {
  async show() {
    const result = await trySafe(() => loadDomainValue());
    if (!result.ok) {
      throw new BadRequestException("bad request", { cause: result.error });
    }
    return result.value;
  }
}
`;

const validThrowNewDomainError = `
import { trySafe } from "@skapxd/result";

declare class DomainError extends Error {
  constructor(message: string, options?: { cause?: unknown });
}
declare function loadDomainValue(): Promise<string>;

export async function load() {
  const result = await trySafe(() => loadDomainValue());
  if (!result.ok) {
    throw new DomainError("failed", { cause: result.error });
  }
  return result.value;
}
`;

const validUnrelatedThrow = `
export function fail(error: Error) {
  throw error;
}
`;

const validTestFileRethrow = `
import { trySafe } from "@skapxd/result";

declare function loadDomainValue(): Promise<string>;

export async function load() {
  const result = await trySafe(() => loadDomainValue());
  if (!result.ok) {
    throw result.error;
  }
  return result.value;
}
`;

const validReturnsResult = `
import { Result, trySafe } from "@skapxd/result";

declare function loadDomainValue(): Promise<string>;

export async function load(): Promise<Result<string, unknown>> {
  const result = await trySafe(() => loadDomainValue());
  if (!result.ok) {
    return result;
  }
  return Result.ok(result.value);
}
`;

const validTransformsToResultErr = `
import { Result, trySafe } from "@skapxd/result";

declare function loadDomainValue(): Promise<string>;

export async function load(): Promise<Result<string, { cause: unknown; message: string }>> {
  const result = await trySafe(() => loadDomainValue());
  if (!result.ok) {
    return Result.err({ cause: result.error, message: "failed" });
  }
  return Result.ok(result.value);
}
`;

const validLifecycleRethrow = `
import { trySafe } from "@skapxd/result";

declare function connect(): Promise<void>;

export class AppModule {
  async onModuleInit() {
    const result = await trySafe(() => connect());
    if (!result.ok) {
      throw result.error;
    }
  }
}
`;

const validDecoratedMethodRethrow = `
import { trySafe } from "@skapxd/result";

declare function EmitsEvent(): (
  target: object,
  key: string | symbol,
  descriptor: PropertyDescriptor,
) => void;
declare function save(): Promise<void>;

export class Emitter {
  @EmitsEvent()
  async save() {
    const result = await trySafe(() => save());
    if (!result.ok) {
      throw result.error;
    }
  }
}
`;

const ruleTester = createTypedRuleTester();
type RuleArg = Parameters<typeof ruleTester.run>[1];

ruleTester.run(
  "no-rethrow-result-error",
  rules["no-rethrow-result-error"] as unknown as RuleArg,
  {
    invalid: [
      {
        code: invalidRuntimeOrigin,
        errors: [{ messageId: "rethrowRuntimeError" }],
        filename: "invalid-runtime.ts",
      },
      {
        code: invalidDomainOrigin,
        errors: [{ messageId: "rethrowDomainError" }],
        filename: "invalid-domain.ts",
      },
      {
        code: invalidFallbackOrigin,
        errors: [{ messageId: "rethrowResultError" }],
        filename: "invalid-fallback.ts",
      },
      {
        code: invalidMatchHandler,
        errors: [{ messageId: "rethrowRuntimeError" }],
        filename: "invalid-runtime.ts",
      },
    ],
    valid: [
      {
        code: validThrowNewHttpExceptionInController,
        filename: "users.controller.ts",
      },
      { code: validThrowNewDomainError, filename: "valid.ts" },
      { code: validUnrelatedThrow, filename: "valid.ts" },
      { code: validTestFileRethrow, filename: "load.spec.ts" },
      { code: validReturnsResult, filename: "valid.ts" },
      { code: validTransformsToResultErr, filename: "valid.ts" },
      { code: validLifecycleRethrow, filename: "valid.ts" },
      { code: validDecoratedMethodRethrow, filename: "valid.ts" },
    ],
  },
);
