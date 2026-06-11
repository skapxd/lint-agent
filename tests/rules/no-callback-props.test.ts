import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run("no-callback-props", rules["no-callback-props"], {
  invalid: [
    {
      // handler hacia componente propio, por nombre on[A-Z]
      code: "const View = () => <Child onSelect={handleSelect} />;",
      errors: [{ messageId: "noCallbackProps" }],
      filename: "view.tsx",
    },
    {
      // función inline hacia componente propio
      code: "const View = () => <Child onPick={() => pick(id)} />;",
      errors: [{ messageId: "noCallbackProps" }],
      filename: "view.tsx",
    },
    {
      // función inline aunque el nombre no sea on[A-Z]
      code: "const View = () => <List renderItem={(x) => <li>{x}</li>} />;",
      errors: [{ messageId: "noCallbackProps" }],
      filename: "view.tsx",
    },
  ],
  valid: [
    // elementos nativos: la frontera con el DOM sí lleva handlers
    { code: "const View = () => <button onClick={() => save()} />;", filename: "view.tsx" },
    { code: "const View = () => <input onChange={handleChange} />;", filename: "view.tsx" },
    // props de datos hacia componentes propios
    { code: "const View = () => <Child label=\"x\" count={3} items={items} />;", filename: "view.tsx" },
    // render props exentas por patrón del consumidor
    {
      code: "const View = () => <List renderItem={(x) => <li>{x}</li>} />;",
      filename: "view.tsx",
      options: [{ allowPropPatterns: ["^render"] }],
    },
    // archivos exentos por glob (p. ej. wrappers de una librería de UI)
    {
      code: "const View = () => <Child onSelect={handleSelect} />;",
      filename: "src/ui/vendor/view.tsx",
      options: [{ allowFilePatterns: ["src/ui/vendor/**"] }],
    },
  ],
});
