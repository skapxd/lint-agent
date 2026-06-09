import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run("max-hook-size", rules["max-hook-size"], {
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
