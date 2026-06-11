import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run("no-promise-chain", rules["no-promise-chain"]!, {
  invalid: [
    {
      code: "fetchData().then(handle);",
      errors: [{ messageId: "noPromiseChain" }],
    },
    {
      code: "fetchData().catch(handle);",
      errors: [{ messageId: "noPromiseChain" }],
    },
    {
      code: "fetchData().finally(cleanup);",
      errors: [{ messageId: "noPromiseChain" }],
    },
  ],
  valid: [
    "const data = await fetchData();",
    "items.map((i) => i);",
    // `methods` configurable: con solo ["catch"], `.then` no se marca.
    { code: "fetchData().then(handle);", options: [{ methods: ["catch"] }] },
  ],
});
