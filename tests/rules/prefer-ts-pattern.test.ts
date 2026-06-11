import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run("prefer-ts-pattern", rules["prefer-ts-pattern"]!, {
  invalid: [
    {
      code: "switch (x) { case 1: break; default: break; }",
      errors: [{ messageId: "noSwitch" }],
    },
    {
      code: "const y = a ? 1 : b ? 2 : 3;",
      errors: [{ messageId: "noNestedTernary" }],
    },
    {
      code: "const y = a ? (b ? 1 : 2) : 3;",
      errors: [{ messageId: "noNestedTernary" }],
    },
  ],
  valid: [
    "const y = a ? 1 : 2;",
    "if (x) { foo(); } else { bar(); }",
  ],
});
