import { rules } from "../../src/shared/rules";
import { createTypedRuleTester } from "../typed-rule-tester";

// Type predicate demostrado por la firma: evidencia, no convencion.
const validProvenTypeGuard = `
type FunctionNode = { kind: "function"; name: string };

declare function isFunctionNode(node: unknown): node is FunctionNode;
declare const current: unknown;
declare function run(): void;

export function walk(): void {
  if (isFunctionNode(current)) {
    run();
  }
}
`;

// Result.isErr ES un type predicate: el idioma de Result pasa por evidencia.
const validResultIsErr = `
import { Result } from "@skapxd/result";

declare function track(error: unknown): void;

export function consume(input: Result<number, Error>): void {
  if (Result.isErr(input)) {
    track(input.error);
  }
}
`;

// Devolver boolean no basta: el nombre promete, la firma no demuestra nada.
const invalidBooleanCall = `
declare function check(value: unknown): boolean;
declare const data: unknown;
declare function run(): void;

export function f(): void {
  if (check(data)) {
    run();
  }
}
`;

// Con allowTypePredicates: false, hasta el guard demostrado exige nombre.
const invalidPredicateDisallowed = `
type FunctionNode = { kind: "function" };

declare function isFunctionNode(node: unknown): node is FunctionNode;
declare const current: unknown;
declare function run(): void;

export function walk(): void {
  if (isFunctionNode(current)) {
    run();
  }
}
`;

const ruleTester = createTypedRuleTester();
type RuleArg = Parameters<typeof ruleTester.run>[1];

ruleTester.run(
  "no-anonymous-condition",
  rules["no-anonymous-condition"] as unknown as RuleArg,
  {
    invalid: [
      {
        code: invalidBooleanCall,
        errors: [{ messageId: "anonymousCondition" }],
        filename: "invalid-boolean-call.ts",
      },
      {
        code: invalidPredicateDisallowed,
        errors: [{ messageId: "anonymousCondition" }],
        filename: "invalid-predicate-disallowed.ts",
        options: [{ allowTypePredicates: false }],
      },
    ],
    valid: [
      { code: validProvenTypeGuard, filename: "valid-proven-type-guard.ts" },
      { code: validResultIsErr, filename: "valid-result-is-err.ts" },
    ],
  },
);
