import { rules } from "../../src/shared/rules";
import { createTypedRuleTester } from "../typed-rule-tester";

const narrowingCast = `
type User = { name: string };

declare const data: unknown;
const user = data as User;
`;

const doubleAssertion = `
type FunctionNode = { kind: "function"; name: string };

declare const node: { kind: string };
const functionNode = node as unknown as FunctionNode;
`;

const wideningCast = `
type Base = { id: string };
type User = Base & { name: string };

declare const user: User;
const value = user as Base;
`;

const constAssertion = `
const tuple = [1, 2] as const;
`;

const ruleTester = createTypedRuleTester();
type RuleArg = Parameters<typeof ruleTester.run>[1];

ruleTester.run(
  "no-unverified-cast",
  rules["no-unverified-cast"] as unknown as RuleArg,
  {
    invalid: [
      {
        code: narrowingCast,
        errors: [{ messageId: "unsafeTypeAssertion" }],
        filename: "narrowing.ts",
      },
      {
        code: doubleAssertion,
        errors: [{ messageId: "unsafeTypeAssertion" }],
        filename: "double-assertion.ts",
      },
    ],
    valid: [
      { code: wideningCast, filename: "widening.ts" },
      { code: constAssertion, filename: "const-assertion.ts" },
      {
        code: narrowingCast,
        filename: "user.adapter.ts",
        options: [{ allowFilePatterns: ["*.adapter.ts"] }],
      },
    ],
  },
);
