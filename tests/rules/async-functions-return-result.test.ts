import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run(
  "async-functions-return-result",
  rules["async-functions-return-result"]!,
  {
    invalid: [
      {
        code: "async function reserve() {}",
        errors: [{ messageId: "missingReturnType" }],
      },
      {
        code: "async function reserve(): Promise<number> {}",
        errors: [{ messageId: "invalidReturnType" }],
      },
    ],
    valid: [
      "async function reserve(): Promise<Result<number, Error>> {}",
      "function sync(): number { return 1; }",
      // El nombre "helper" se considera generado/anónimo y se omite.
      "async function helper() {}",
    ],
  },
);
