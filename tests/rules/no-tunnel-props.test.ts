import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run("no-tunnel-props", rules["no-tunnel-props"], {
  invalid: [
    {
      // segundo salto: el padre recibe la prop y la reenvía al hijo
      code: "const Padre = ({ onSelect }) => <Hijo onSelect={onSelect} />;",
      errors: [{ messageId: "forwardedProp" }],
      filename: "padre.tsx",
    },
    {
      // el rename del atributo no esconde el reenvío
      code: "const Padre = ({ onSelect }) => <Hijo handler={onSelect} />;",
      errors: [{ messageId: "forwardedProp" }],
      filename: "padre.tsx",
    },
    {
      // usarla localmente NO autoriza el segundo salto
      code: "function Padre({ game }) { usePlay(game); return <Hijo game={game} />; }",
      errors: [{ messageId: "forwardedProp" }],
      filename: "padre.tsx",
    },
    {
      // cada prop reenviada se reporta
      code: "const Padre = ({ a, b }) => <Hijo a={a} b={b} />;",
      errors: [
        { messageId: "forwardedProp" },
        { messageId: "forwardedProp" },
      ],
      filename: "padre.tsx",
    },
    {
      // túnel puro: reenvía todas las props con spread
      code: "const Padre = ({ ...props }) => <Hijo {...props} />;",
      errors: [{ messageId: "spreadTunnel" }],
      filename: "padre.tsx",
    },
  ],
  valid: [
    // primer salto: el valor se crea aquí (hook/store) y baja UN nivel
    {
      code: "const Abuelo = () => { const onSelect = useStore(selectPick); return <Padre onSelect={onSelect} />; };",
      filename: "abuelo.tsx",
    },
    // la prop se usa, no se reenvía
    {
      code: "const Card = ({ title }) => <h2>{title}</h2>;",
      filename: "card.tsx",
    },
    // reenviar a elementos nativos es uso real (frontera con el DOM)
    {
      code: "const Field = ({ value, onChange }) => <input value={value} onChange={onChange} />;",
      filename: "field.tsx",
    },
    // children: la composición es la alternativa, no un túnel
    {
      code: "const Layout = ({ children }) => <section>{children}</section>;",
      filename: "layout.tsx",
    },
    // derivar datos no es reenviar el identifier
    {
      code: "const Card = ({ game }) => <Hijo title={game.title} />;",
      filename: "card.tsx",
    },
    // una función en minúscula no es componente
    {
      code: "const build = ({ a }) => <Hijo a={a} />;",
      filename: "build.tsx",
    },
    // props exentas por patrón (wrappers de design system)
    {
      code: "const Button = ({ className }) => <BaseButton className={className} />;",
      filename: "button.tsx",
      options: [{ allowPropPatterns: ["^className$"] }],
    },
    // archivos exentos por glob
    {
      code: "const Padre = ({ a }) => <Hijo a={a} />;",
      filename: "src/ui/wrappers/padre.tsx",
      options: [{ allowFilePatterns: ["src/ui/wrappers/**"] }],
    },
  ],
});
