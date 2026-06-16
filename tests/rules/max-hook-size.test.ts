import { expect, it } from "vitest";
import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

const maxHookSizeRule = rules["max-hook-size"]!;

it("mantiene el contrato educativo de tooManyUseState", () => {
  const message = maxHookSizeRule.meta.messages?.tooManyUseState ?? "";

  expect(message).toContain("union discriminada");
  expect(message).toContain("useReducer");
  expect(message).toContain("divide el componente/hook");
});

createRuleTester().run("max-hook-size", maxHookSizeRule, {
  invalid: [
    {
      code: "function useThing() { const [a] = useState(); const [b] = useState(); }",
      errors: [{ messageId: "tooManyUseState" }],
    },
    {
      code: "function useBig() {\n\n\n\n  return 1;\n}",
      errors: [{ messageId: "tooLargeHook" }],
      options: [{ maxLines: 3 }],
    },
  ],
  valid: [
    "function useThing() { const [a] = useState(); return a; }",
    // No es un hook (no empieza con `use`).
    "function build() { const [a] = useState(); const [b] = useState(); }",
  ],
});
