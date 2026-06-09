import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run(
  "await-requires-try-safe",
  rules["await-requires-try-safe"],
  {
    invalid: [
      {
        code: "async function f() { await g(); }",
        errors: [{ messageId: "unprotectedAwait" }],
      },
    ],
    valid: [
      "async function f() { await trySafe(() => g()); }",
      "async function f() { await trySafe(async () => { await g(); }); }",
    ],
  },
);
