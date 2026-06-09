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
        // callback inline en JSX
        code: "function Card() { return <button onClick={() => save()} />; }",
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
        // callback de .map() en el render (prohibido: "absolutamente todo")
        code: "function List() { return <ul>{items.map((i) => <li key={i} />)}</ul>; }",
        errors: [{ messageId: "functionInsideComponent" }],
        filename: "test.tsx",
      },
      {
        // callback de useEffect dentro del componente
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
    ],
  },
);
