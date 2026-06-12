import { rules } from "../../src/shared/rules";
import { createTypedRuleTester } from "../typed-rule-tester";

const manualUnknownValidator = `
function validateUser(data: unknown): boolean {
  if (typeof data !== "object" || data === null) return false;
  if (!("name" in data)) return false;
  if (typeof (data as Record<string, unknown>).name !== "string") return false;
  if (!Array.isArray((data as Record<string, unknown>).roles)) return false;

  return true;
}
`;

const checksSplitAcrossBranches = `
function validatePayload(payload: unknown): boolean {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  if ("user" in payload) {
    return typeof (payload as Record<string, unknown>).user === "object";
  }

  if ("roles" in payload) {
    return Array.isArray((payload as Record<string, unknown>).roles);
  }

  return false;
}
`;

const threeCheckValidator = `
function validateSettings(input: unknown): boolean {
  if (typeof input !== "object" || input === null) return false;
  if (!("mode" in input)) return false;

  return typeof (input as Record<string, unknown>).mode === "string";
}
`;

const shortTypePredicate = `
type FunctionNode = { params: unknown[] };

function isFunctionNode(node: unknown): node is FunctionNode {
  return typeof node === "object" && node !== null && "params" in node;
}
`;

const typedUnionDiscrimination = `
type DomainEvent =
  | { kind: "text"; data: string }
  | { kind: "count"; data: number };

function consume(event: DomainEvent): string {
  if (typeof event.data === "string") {
    return event.data;
  }

  return String(event.data);
}
`;

const typedValueValidator = `
type UserInput = {
  age?: unknown;
  name?: unknown;
  roles?: unknown;
};

function validateKnownShape(user: UserInput): boolean {
  if (typeof user !== "object" || user === null) return false;
  if (!("name" in user)) return false;
  if (typeof user.name !== "string") return false;
  if (!Array.isArray(user.roles)) return false;

  return true;
}
`;

const ruleTester = createTypedRuleTester();
type RuleArg = Parameters<typeof ruleTester.run>[1];

ruleTester.run(
  "prefer-schema-validation",
  rules["prefer-schema-validation"] as unknown as RuleArg,
  {
    invalid: [
      {
        code: manualUnknownValidator,
        errors: [{ messageId: "preferSchema" }],
        filename: "manual-unknown-validator.ts",
      },
      {
        code: checksSplitAcrossBranches,
        errors: [{ messageId: "preferSchema" }],
        filename: "split-branches-validator.ts",
      },
      {
        code: threeCheckValidator,
        errors: [{ messageId: "preferSchema" }],
        filename: "three-check-validator.ts",
        options: [{ maxStructuralChecks: 3 }],
      },
    ],
    valid: [
      { code: shortTypePredicate, filename: "short-type-predicate.ts" },
      { code: typedUnionDiscrimination, filename: "typed-union.ts" },
      { code: typedValueValidator, filename: "typed-value-validator.ts" },
      {
        code: manualUnknownValidator,
        filename: "manual-validator.ts",
        options: [{ allowFilePatterns: ["manual-validator.ts"] }],
      },
    ],
  },
);
