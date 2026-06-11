import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run("no-emoji", rules["no-emoji"]!, {
  invalid: [
    {
      code: 'const label = "Listo 🚀";',
      errors: [{ messageId: "noEmoji" }],
      filename: "src/label.ts",
    },
    {
      code: "const message = `Completado ✅`;",
      errors: [{ messageId: "noEmoji" }],
      filename: "src/message.ts",
    },
    {
      code: "const View = () => <p>Hola 😄</p>;",
      errors: [{ messageId: "noEmoji" }],
      filename: "src/view.tsx",
    },
    {
      code: 'const View = () => <button title="Enviar 👍" />;',
      errors: [{ messageId: "noEmoji" }],
      filename: "src/view.tsx",
    },
  ],
  valid: [
    // texto normal, acentos y símbolos tipográficos no son emojis
    { code: 'const label = "Café listo";', filename: "src/label.ts" },
    { code: 'const arrow = "A → B";', filename: "src/arrow.ts" },
    { code: 'const check = "✓ Sin problemas.";', filename: "src/check.ts" },
    { code: "const View = () => <p>Hola mundo</p>;", filename: "src/view.tsx" },
    // archivos exentos por glob del consumidor
    {
      code: 'const seed = "🚀";',
      filename: "tests/fixtures/emoji-seed.ts",
      options: [{ allowFilePatterns: ["tests/fixtures/**"] }],
    },
  ],
});
