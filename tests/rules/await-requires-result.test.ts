import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run(
  "await-requires-result",
  rules["await-requires-result"],
  {
    invalid: [
      {
        code: "async function f() { await g(); }",
        errors: [{ messageId: "awaitWithoutResult" }],
      },
    ],
    valid: [
      "async function f() { await trySafe(() => g()); }",
      "async function f() { await trySafe(async () => { await g(); }); }",
    ],
  },
);
