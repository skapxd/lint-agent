import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run("no-default-export", rules["no-default-export"], {
  invalid: [
    {
      code: "export default function helper() {}",
      errors: [{ messageId: "noDefaultExport" }],
      filename: "src/helper.ts",
    },
    {
      // forma indirecta
      code: "const x = 1;\nexport { x as default };",
      errors: [{ messageId: "noDefaultExport" }],
      filename: "src/x.ts",
    },
    {
      // un patrón del consumidor no exime archivos que no matchean
      code: "export default {};",
      errors: [{ messageId: "noDefaultExport" }],
      filename: "src/other.ts",
      options: [{ allowFilePatterns: ["legacy[\\\\/]"] }],
    },
  ],
  valid: [
    { code: "export const helper = () => 1;", filename: "src/helper.ts" },
    // integrados: configs de tooling y stories exigen default
    { code: "export default { content: [] };", filename: "tailwind.config.ts" },
    { code: "export default [];", filename: "eslint.config.mjs" },
    { code: "export default { title: 'Card' };", filename: "card.stories.tsx" },
    // extensible: el consumidor permite el entrypoint de un framework nuevo
    // (los patrones propios se SUMAN a los integrados, no los reemplazan)
    {
      code: "export default function Page() { return null; }",
      filename: "src/routes/+page.ts",
      options: [{ allowFilePatterns: ["\\+page\\.[jt]s$"] }],
    },
  ],
});
