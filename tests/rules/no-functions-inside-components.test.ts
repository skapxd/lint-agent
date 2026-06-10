import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

const tsx = (code: string) => ({ code, filename: "test.tsx" });

createRuleTester().run(
  "no-functions-inside-components",
  rules["no-functions-inside-components"],
  {
    invalid: [
      {
        // arrow handler declarado en el cuerpo del componente
        code: "function Card() { const onClick = () => save(); return <button onClick={onClick} />; }",
        errors: [{ messageId: "functionInsideComponent" }],
        filename: "test.tsx",
      },
      {
        // function declaration anidada
        code: "function Card() { function helper() {} return <div />; }",
        errors: [{ messageId: "functionInsideComponent" }],
        filename: "test.tsx",
      },
      {
        // function expression anidada
        code: "function Card() { const f = function () {}; return <div />; }",
        errors: [{ messageId: "functionInsideComponent" }],
        filename: "test.tsx",
      },
      {
        // callback de useEffect: no es JSX ni .map, se reporta siempre
        code: "function Card() { useEffect(() => {}, []); return <div />; }",
        errors: [{ messageId: "functionInsideComponent" }],
        filename: "test.tsx",
      },
      {
        // componente como arrow PascalCase
        code: "const Card = () => { const f = () => {}; return <div />; };",
        errors: [{ messageId: "functionInsideComponent" }],
        filename: "test.tsx",
      },
      {
        // .forEach no es render: la exención de .map no aplica
        code: "function List() { items.forEach((i) => track(i)); return <div />; }",
        errors: [{ messageId: "functionInsideComponent" }],
        filename: "test.tsx",
      },
      {
        // modo ultraestricto: el consumidor apaga la exención de props JSX
        code: "function Card() { return <button onClick={() => save()} />; }",
        errors: [{ messageId: "functionInsideComponent" }],
        filename: "test.tsx",
        options: [{ allowJsxCallbacks: false }],
      },
      {
        // modo ultraestricto: el consumidor apaga la exención de .map
        code: "function List() { return <ul>{items.map((i) => <li key={i} />)}</ul>; }",
        errors: [{ messageId: "functionInsideComponent" }],
        filename: "test.tsx",
        options: [{ allowArrayMapCallbacks: false }],
      },
    ],
    valid: [
      // componente sin funciones internas
      tsx("function Card() { return <div>{title}</div>; }"),
      // handler definido fuera del componente
      tsx("const onClick = () => save();\nfunction Card() { return <button onClick={onClick} />; }"),
      // hook personalizado (no es componente): puede tener callbacks dentro
      tsx("function useThing() { const f = () => {}; return f; }"),
      // helper en minúscula (no es componente)
      tsx("function build() { const f = () => 1; return f; }"),
      // por defecto: callback anónimo como valor directo de una prop JSX
      tsx("function Card() { return <button onClick={() => save()} />; }"),
      // por defecto: callback anónimo de .map en el render
      tsx("function List() { return <ul>{items.map((i) => <li key={i} />)}</ul>; }"),
    ],
  },
);
