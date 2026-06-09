import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run(
  "no-deep-relative-imports",
  rules["no-deep-relative-imports"],
  {
    invalid: [
      {
        // Por defecto (maxDepth 0) cualquier `../` falla.
        code: 'import { x } from "../y";',
        errors: [{ messageId: "deepRelativeImport" }],
      },
      {
        code: 'import { x } from "../../y";',
        errors: [{ messageId: "deepRelativeImport" }],
      },
      {
        code: 'export { x } from "../../../y";',
        errors: [{ messageId: "deepRelativeImport" }],
      },
      {
        code: 'export * from "../y";',
        errors: [{ messageId: "deepRelativeImport" }],
      },
      {
        code: 'const m = import("../y");',
        errors: [{ messageId: "deepRelativeImport" }],
      },
    ],
    valid: [
      'import { x } from "./y";',
      'import x from "some-package";',
      'import x from "@scope/pkg";',
      'export * from "./y";',
      // maxDepth configurable: con maxDepth 1, un solo `../` está permitido.
      { code: 'import { x } from "../y";', options: [{ maxDepth: 1 }] },
      // ...pero `../../` sigue fallando con maxDepth 1 (ver invalid implícito).
      { code: 'import { x } from "../../y";', options: [{ maxDepth: 2 }] },
    ],
  },
);
