import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run(
  "jsx-return-name-pascal-case",
  rules["jsx-return-name-pascal-case"]!,
  {
    invalid: [
      {
        code: "function button() { return <div />; }",
        errors: [{ messageId: "invalidName" }],
        filename: "test.tsx",
      },
      {
        code: "const card = () => <span />;",
        errors: [{ messageId: "invalidName" }],
        filename: "test.tsx",
      },
    ],
    valid: [
      { code: "function Button() { return <div />; }", filename: "test.tsx" },
      { code: "const Card = () => <span />;", filename: "test.tsx" },
      { code: "function helper() { return 1; }", filename: "test.tsx" },
    ],
  },
);
