import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run(
  "no-rethrow-result-error",
  rules["no-rethrow-result-error"]!,
  {
    invalid: [],
    valid: [
      `
type Result<T> = { ok: true; value: T } | { ok: false; error: Error };

function unwrap(result: Result<number>) {
  if (!result.ok) {
    throw result.error;
  }
  return result.value;
}
`,
    ],
  },
);
