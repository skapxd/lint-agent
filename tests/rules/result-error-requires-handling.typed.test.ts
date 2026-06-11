import { rules } from "../../src/shared/rules";
import { createTypedRuleTester } from "../typed-rule-tester";

// El caso que motivó la regla: `if (!result.ok) return;` — el error muere
// en silencio sin que nadie decidiera conscientemente que estaba bien.
const invalidSilentDiscard = `
import { trySafe } from "@skapxd/result";

export async function copy(text: string): Promise<void> {
  const result = await trySafe(() => navigator.clipboard.writeText(text));
  if (!result.ok) return;
  notifyCopied();
}

declare function notifyCopied(): void;
declare const navigator: { clipboard: { writeText: (t: string) => Promise<void> } };
`;

// El descarte "explícito" con void tampoco vale: descarta información valiosa.
const invalidVoidDiscard = `
import { Result } from "@skapxd/result";

export function transform(input: Result<number, Error>): void {
  if (!input.ok) {
    void input.error;
    return;
  }
}
`;

// Manejar sin tocar el error tampoco cuenta: el detalle se perdió.
const invalidHandlingWithoutError = `
import { Result } from "@skapxd/result";

export function transform(input: Result<number, Error>): void {
  if (!input.ok) {
    setFailed(true);
    return;
  }
}

declare function setFailed(value: boolean): void;
`;

// Salida 1: transformarlo (result-error-requires-cause vigila el cause).
const validTransforms = `
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

// Salida 2: entregárselo a alguien.
const validDelivers = `
import { Result } from "@skapxd/result";

export function transform(input: Result<number, Error>): void {
  if (!input.ok) {
    track(input.error);
    return;
  }
}

declare function track(error: unknown): void;
`;

// Propagar el result completo también mantiene el seguimiento.
const validForwardsWhole = `
import { Result } from "@skapxd/result";

export function transform(input: Result<number, Error>): Result<number, Error> {
  if (!input.ok) {
    return input;
  }
  return Result.ok(input.value);
}
`;

// Un objeto { ok } casero no es un Result de @skapxd/result: no aplica.
const validNotASkapxdResult = `
export function transform(input: { ok: boolean }): void {
  if (!input.ok) return;
}
`;

const ruleTester = createTypedRuleTester();
type RuleArg = Parameters<typeof ruleTester.run>[1];

ruleTester.run(
  "result-error-requires-handling",
  rules["result-error-requires-handling"] as unknown as RuleArg,
  {
    invalid: [
      {
        code: invalidSilentDiscard,
        errors: [{ messageId: "unhandledResultError" }],
        filename: "invalid-silent-discard.ts",
      },
      {
        code: invalidVoidDiscard,
        errors: [{ messageId: "unhandledResultError" }],
        filename: "invalid-void-discard.ts",
      },
      {
        code: invalidHandlingWithoutError,
        errors: [{ messageId: "unhandledResultError" }],
        filename: "invalid-handling-without-error.ts",
      },
    ],
    valid: [
      { code: validTransforms, filename: "valid-transforms.ts" },
      { code: validDelivers, filename: "valid-delivers.ts" },
      { code: validForwardsWhole, filename: "valid-forwards-whole.ts" },
      { code: validNotASkapxdResult, filename: "valid-not-skapxd-handling.ts" },
    ],
  },
);
