import { rules } from "../../src/shared/rules";
import { createTypedRuleTester } from "../typed-rule-tester";

// Evasión por alias: `const e = result.error` no es consumo, es transferencia.
// El consumo se valida sobre el alias, recursivamente.
const invalidUnusedAlias = `
import { Result } from "@skapxd/result";

export function transform(input: Result<number, Error>): void {
  if (!input.ok) {
    const e = input.error;
    return;
  }
}
`;

// Encadenar alias tampoco ayuda: se siguen hasta el final.
const invalidAliasChain = `
import { Result } from "@skapxd/result";

export function transform(input: Result<number, Error>): void {
  if (!input.ok) {
    const e = input.error;
    const f = e;
    return;
  }
}
`;

// Destructuring sin uso: misma evasión, misma respuesta.
const invalidUnusedDestructuring = `
import { Result } from "@skapxd/result";

export function transform(input: Result<number, Error>): void {
  if (!input.ok) {
    const { error } = input;
    return;
  }
}
`;

// El alias consumido sí vale: esta es la forma legítima de nombrar el cause.
const validConsumedAlias = `
import { Result } from "@skapxd/result";

type DomainError = { message: string; cause?: unknown };

export function transform(
  input: Result<number, Error>,
): Result<number, DomainError> {
  if (!input.ok) {
    const cause = input.error;
    return Result.err({ cause, message: "fail" });
  }
  return Result.ok(input.value);
}
`;

// Destructuring consumido: también legítimo.
const validConsumedDestructuring = `
import { Result } from "@skapxd/result";

export function transform(input: Result<number, Error>): void {
  if (!input.ok) {
    const { error } = input;
    track(error);
    return;
  }
}

declare function track(error: unknown): void;
`;

// Proyectar no es manejar: leer .message pierde el cause en la última milla.
const invalidProjectionOnly = `
import { Result } from "@skapxd/result";

export function transform(input: Result<number, Error>): void {
  if (!input.ok) {
    setFeedback(input.error.message);
    return;
  }
}

declare function setFeedback(message: string): void;
`;

// La proyección vía alias tampoco: el alias ES el error, y .message lo proyecta.
const invalidAliasProjection = `
import { Result } from "@skapxd/result";

export function transform(input: Result<number, Error>): void {
  if (!input.ok) {
    const e = input.error;
    setFeedback(e.message);
    return;
  }
}

declare function setFeedback(message: string): void;
`;

// Proyección para la UI + entrega del objeto completo al trace: el contrato.
const validProjectionPlusDelivery = `
import { Result } from "@skapxd/result";

export function transform(input: Result<number, Error>): void {
  if (!input.ok) {
    reportDomainError(input.error);
    setFeedback(input.error.message);
    return;
  }
}

declare function reportDomainError(error: unknown): void;
declare function setFeedback(message: string): void;
`;

const ruleTester = createTypedRuleTester();
type RuleArg = Parameters<typeof ruleTester.run>[1];

ruleTester.run(
  "result-error-requires-handling",
  rules["result-error-requires-handling"] as unknown as RuleArg,
  {
    invalid: [
      {
        code: invalidUnusedAlias,
        errors: [{ messageId: "unhandledResultError" }],
        filename: "invalid-unused-alias.ts",
      },
      {
        code: invalidAliasChain,
        errors: [{ messageId: "unhandledResultError" }],
        filename: "invalid-alias-chain.ts",
      },
      {
        code: invalidUnusedDestructuring,
        errors: [{ messageId: "unhandledResultError" }],
        filename: "invalid-unused-destructuring.ts",
      },
      {
        code: invalidProjectionOnly,
        errors: [{ messageId: "unhandledResultError" }],
        filename: "invalid-projection-only.ts",
      },
      {
        code: invalidAliasProjection,
        errors: [{ messageId: "unhandledResultError" }],
        filename: "invalid-alias-projection.ts",
      },
    ],
    valid: [
      { code: validConsumedAlias, filename: "valid-consumed-alias.ts" },
      {
        code: validConsumedDestructuring,
        filename: "valid-consumed-destructuring.ts",
      },
      {
        code: validProjectionPlusDelivery,
        filename: "valid-projection-plus-delivery.ts",
      },
    ],
  },
);
