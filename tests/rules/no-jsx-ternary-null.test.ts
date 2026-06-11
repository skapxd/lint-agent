import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run("no-jsx-ternary-null", rules["no-jsx-ternary-null"]!, {
  invalid: [
    {
      code: "const C = () => <div>{cond ? <span /> : null}</div>;",
      errors: [{ messageId: "preferLogicalAnd" }],
      filename: "test.tsx",
    },
    {
      code: "const C = () => <div>{cond ? null : <span />}</div>;",
      errors: [{ messageId: "preferLogicalAnd" }],
      filename: "test.tsx",
    },
  ],
  valid: [
    // ya usa &&
    { code: "const C = () => <div>{cond && <span />}</div>;", filename: "test.tsx" },
    // ninguna rama es null
    { code: "const C = () => <div>{cond ? <a /> : <b />}</div>;", filename: "test.tsx" },
    // ternario en un atributo, no en el cuerpo JSX (semántica distinta)
    { code: 'const C = () => <div className={cond ? "a" : null} />;', filename: "test.tsx" },
    // ternario fuera de JSX
    { code: 'const x = cond ? "a" : null;', filename: "test.tsx" },
  ],
});
