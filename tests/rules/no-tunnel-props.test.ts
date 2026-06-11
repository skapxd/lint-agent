import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run("no-tunnel-props", rules["no-tunnel-props"], {
  invalid: [
    {
      // dos props que solo pasan de largo hacia otro componente
      code: "const Middle = ({ game, variant }) => <Child game={game} variant={variant} />;",
      errors: [{ messageId: "tunnelProps" }],
      filename: "middle.tsx",
    },
    {
      // túnel puro: reenvía todas las props con spread
      code: "const Middle = ({ ...props }) => <Child {...props} />;",
      errors: [{ messageId: "spreadTunnel" }],
      filename: "middle.tsx",
    },
    {
      // function declaration también cuenta
      code: "function Middle({ a, b }) { return <Child a={a} b={b} />; }",
      errors: [{ messageId: "tunnelProps" }],
      filename: "middle.tsx",
    },
  ],
  valid: [
    // usa una prop y reenvía otra: composición normal (1 < maxPassThroughProps)
    {
      code: "const Card = ({ title, game }) => <section><h2>{title}</h2><Child game={game} /></section>;",
      filename: "card.tsx",
    },
    // reenviar a elementos nativos es uso real, no túnel
    {
      code: "const Field = ({ value, onChange }) => <input value={value} onChange={onChange} />;",
      filename: "field.tsx",
    },
    // una función en minúscula no es componente
    {
      code: "const build = ({ a, b }) => <Child a={a} b={b} />;",
      filename: "build.tsx",
    },
    // el umbral es configurable
    {
      code: "const Middle = ({ a, b }) => <Child a={a} b={b} />;",
      filename: "middle.tsx",
      options: [{ maxPassThroughProps: 3 }],
    },
    // archivos exentos por glob
    {
      code: "const Middle = ({ a, b }) => <Child a={a} b={b} />;",
      filename: "src/ui/wrappers/middle.tsx",
      options: [{ allowFilePatterns: ["src/ui/wrappers/**"] }],
    },
  ],
});
