import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run(
  "one-root-function-per-file",
  rules["one-root-function-per-file"],
  {
    invalid: [
      {
        code: "function a() {}\nfunction b() {}",
        errors: [{ messageId: "tooManyRootFunctions" }],
      },
      {
        code: "const a = () => {};\nconst b = () => {};",
        errors: [{ messageId: "tooManyRootFunctions" }],
      },
      {
        code: "const a = () => {}, b = () => {};",
        errors: [{ messageId: "tooManyRootFunctions" }],
      },
      {
        code: "export function a() {}\nfunction b() {}",
        errors: [{ messageId: "tooManyRootFunctions" }],
      },
    ],
    valid: [
      "export function only() { return 1; }",
      "const value = 1;\nfunction one() {}",
      "const value = 1;\nconst other = 2;",
    ],
  },
);
