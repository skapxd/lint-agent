import { expect, it } from "vitest";
import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

const tsx = (code: string) => ({ code, filename: "test.tsx" });

it("functionInsideComponent da el criterio hook-vs-helper", () => {
  const message = rules["no-functions-inside-components"]!.meta.messages?.functionInsideComponent ?? "";

  expect(message).toContain("hook");
  expect(message).toContain("logica pura");
  expect(message).toContain("helper");
});

createRuleTester().run(
  "no-functions-inside-components",
  rules["no-functions-inside-components"]!,
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
        // flecha CON BLOQUE en .map: el cuerpo `{ return ... }` da pie a
        // ifs y lógica — no califica como callback de expresión
        code: "function List() { return <ul>{items.map((i) => { return <li key={i} />; })}</ul>; }",
        errors: [{ messageId: "functionInsideComponent" }],
        filename: "test.tsx",
      },
      {
        // function expression en .map: siempre tiene bloque, nunca exenta
        code: "function List() { return <ul>{items.map(function (i) { return <li key={i} />; })}</ul>; }",
        errors: [{ messageId: "functionInsideComponent" }],
        filename: "test.tsx",
      },
      {
        // flecha con bloque como prop JSX: tampoco
        code: "function Card() { return <button onClick={() => { save(); }} />; }",
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
      // por defecto: flecha de expresión como valor directo de una prop JSX
      tsx("function Card() { return <button onClick={() => save()} />; }"),
      // por defecto: flecha de expresión en .map (con o sin paréntesis)
      tsx("function List() { return <ul>{items.map((i) => <li key={i} />)}</ul>; }"),
      tsx("function List() { return <ul>{items.map((i) => (<li key={i} />))}</ul>; }"),
    ],
  },
);
