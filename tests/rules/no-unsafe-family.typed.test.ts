import { rules } from "../../src/shared/rules";
import { createTypedRuleTester } from "../typed-rule-tester";

const predicateNarrowing = `
type User = { name: string };

function isUser(value: unknown): value is User {
  return typeof value === "object" && value !== null && "name" in value;
}

const data: unknown = JSON.parse("{}");

if (isUser(data)) {
  data.name;
}
`;

const unknownBoundary = `
const data: unknown = JSON.parse("{}");
`;

const ruleTester = createTypedRuleTester();
type RuleArg = Parameters<typeof ruleTester.run>[1];
const filename = "no-unsafe-family.ts";

ruleTester.run(
  "no-unsafe-assignment",
  rules["no-unsafe-assignment"] as unknown as RuleArg,
  {
    invalid: [
      {
        code: `const data = JSON.parse("{}");`,
        errors: [{ messageId: "anyAssignment" }],
        filename,
      },
    ],
    valid: [
      { code: unknownBoundary, filename },
      { code: predicateNarrowing, filename },
    ],
  },
);

ruleTester.run(
  "no-unsafe-member-access",
  rules["no-unsafe-member-access"] as unknown as RuleArg,
  {
    invalid: [
      {
        code: `const data = JSON.parse("{}"); data.user;`,
        errors: [{ messageId: "unsafeMemberExpression" }],
        filename,
      },
    ],
    valid: [{ code: predicateNarrowing, filename }],
  },
);

ruleTester.run("no-unsafe-call", rules["no-unsafe-call"] as unknown as RuleArg, {
  invalid: [
    {
      code: `const data = JSON.parse("{}"); data();`,
      errors: [{ messageId: "unsafeCall" }],
      filename,
    },
  ],
  valid: [{ code: unknownBoundary, filename }],
});

ruleTester.run(
  "no-unsafe-return",
  rules["no-unsafe-return"] as unknown as RuleArg,
  {
    invalid: [
      {
        code: `function load(): string { return JSON.parse("{}"); }`,
        errors: [{ messageId: "unsafeReturn" }],
        filename,
      },
    ],
    valid: [
      {
        code: `
type User = { name: string };
declare const UserSchema: { parse(value: unknown): User };

function load(): User {
  const data: unknown = JSON.parse("{}");
  return UserSchema.parse(data);
}
`,
        filename,
      },
    ],
  },
);

ruleTester.run(
  "no-unsafe-argument",
  rules["no-unsafe-argument"] as unknown as RuleArg,
  {
    invalid: [
      {
        code: `
function save(value: { name: string }) {}

save(JSON.parse("{}"));
`,
        errors: [{ messageId: "unsafeArgument" }],
        filename,
      },
    ],
    valid: [
      {
        code: `
type User = { name: string };
declare const UserSchema: { parse(value: unknown): User };

function save(value: User) {}

const data: unknown = JSON.parse("{}");
save(UserSchema.parse(data));
`,
        filename,
      },
    ],
  },
);
