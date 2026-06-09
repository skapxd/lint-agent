import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run("no-try-catch", rules["no-try-catch"], {
  invalid: [
    {
      code: "try { doThing(); } catch (e) {}",
      errors: [{ messageId: "noTryCatch" }],
    },
    {
      code: "try { doThing(); } finally { cleanup(); }",
      errors: [{ messageId: "noTryCatch" }],
    },
  ],
  valid: [
    "const result = trySafe(() => doThing());",
    "doThing();",
  ],
});
