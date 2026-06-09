import { rules } from "../../src/shared/rules";
import { createTypedRuleTester } from "../typed-rule-tester";

// Con info de tipos, solo se marca el .catch/.then de una promesa REAL.
const invalidRealPromise = `
async function load(): Promise<number> {
  return 1;
}

load().catch(() => {});
`;

// Un objeto cualquiera con un método .catch que NO es una promesa no se marca.
const validNonPromiseCatch = `
const repo = {
  catch(handler: () => void) {
    return handler;
  },
};

repo.catch(() => {});
`;

const ruleTester = createTypedRuleTester();
type RuleArg = Parameters<typeof ruleTester.run>[1];

ruleTester.run(
  "no-promise-chain",
  rules["no-promise-chain"] as unknown as RuleArg,
  {
    invalid: [
      {
        code: invalidRealPromise,
        errors: [{ messageId: "noPromiseChain" }],
        filename: "invalid-real-promise.ts",
      },
    ],
    valid: [
      { code: validNonPromiseCatch, filename: "valid-non-promise-catch.ts" },
    ],
  },
);
