import { Linter } from "eslint";
import tseslint from "typescript-eslint";
import { afterEach, describe, expect, it } from "vitest";
import { rules } from "../../src/shared/rules";
import { resetCrossFileDuplicateReporters } from "../../src/utils/cross-file/reset-cross-file-duplicate-reporters";

const ruleName = "skapxd/repeated-jsx-requires-component";

type VerifyOptions = {
  code: string;
  filename: string;
};

function createRepeatedJsxVerifier() {
  const linter = new Linter({ configType: "flat" });
  return (options: VerifyOptions) => {
    const messages = linter.verify(
      options.code,
      [
        {
          files: ["**/*.tsx"],
          languageOptions: {
            ecmaVersion: 2022,
            parser: tseslint.parser,
            parserOptions: {
              ecmaFeatures: { jsx: true },
            },
            sourceType: "module",
          },
          plugins: {
            skapxd: {
              rules: {
                "repeated-jsx-requires-component": rules[
                  "repeated-jsx-requires-component"
                ]! as never,
              },
            },
          },
          rules: {
            [ruleName]: "error",
          },
        },
      ],
      options.filename,
    );

    return messages;
  };
}

function verifyRepeatedJsx(options: VerifyOptions) {
  const verify = createRepeatedJsxVerifier();
  return verify(options);
}

afterEach(() => {
  resetCrossFileDuplicateReporters();
});

describe("repeated-jsx-requires-component", () => {
  it("reporta tres bloques JSX iguales", () => {
    const code = `
      export function View() {
        return (
          <>
            <div className="rounded-lg border p-4 shadow-sm"><h3 className="text-lg font-bold">{a.title}</h3></div>
            <div className="border shadow-sm rounded-lg p-4"><h3 className="font-bold text-lg">{b.title}</h3></div>
            <div className="shadow-sm p-4 border rounded-lg"><h3 className="text-lg font-bold">{c.title}</h3></div>
          </>
        );
      }
    `;

    const messages = verifyRepeatedJsx({ code, filename: "src/view.tsx" });

    expect(messages).toHaveLength(3);
    expect(messages.map((message) => message.messageId)).toEqual([
      "repeatedJsx",
      "repeatedJsx",
      "repeatedJsx",
    ]);
    expect(messages.every((message) => message.message.includes("3 veces"))).toBe(
      true,
    );
  });

  it("ignora JSX dentro de .map", () => {
    const code = `
      export function View() {
        return (
          <>
            {items.map((item) => <div className="rounded-lg border p-4 shadow-sm"><h3 className="text-lg font-bold">{item.title}</h3></div>)}
            {more.map((item) => <div className="rounded-lg border p-4 shadow-sm"><h3 className="text-lg font-bold">{item.title}</h3></div>)}
            {other.map((item) => <div className="rounded-lg border p-4 shadow-sm"><h3 className="text-lg font-bold">{item.title}</h3></div>)}
          </>
        );
      }
    `;

    const messages = verifyRepeatedJsx({ code, filename: "src/list.tsx" });

    expect(messages).toHaveLength(0);
  });

  it("no reporta markup trivial de baja densidad", () => {
    const code = `
      export function View() {
        return (
          <>
            <span className="mt-2" />
            <span className="mt-2" />
            <span className="mt-2" />
          </>
        );
      }
    `;

    const messages = verifyRepeatedJsx({ code, filename: "src/trivial.tsx" });

    expect(messages).toHaveLength(0);
  });

  it("no reporta solo dos repeticiones", () => {
    const code = `
      export function View() {
        return (
          <>
            <div className="rounded-lg border p-4 shadow-sm" />
            <div className="border shadow-sm rounded-lg p-4" />
          </>
        );
      }
    `;

    const messages = verifyRepeatedJsx({ code, filename: "src/two.tsx" });

    expect(messages).toHaveLength(0);
  });

  it("normaliza clases en distinto orden para la firma de receta", () => {
    const files = [
      {
        code: `export function A() { return <section className="rounded-lg border p-4 shadow-sm" />; }`,
        filename: "src/a.tsx",
      },
      {
        code: `export function B() { return <article className="border shadow-sm rounded-lg p-4" />; }`,
        filename: "src/b.tsx",
      },
      {
        code: `export function C() { return <div className="shadow-sm p-4 border rounded-lg" />; }`,
        filename: "src/c.tsx",
      },
    ];

    const verify = createRepeatedJsxVerifier();
    const resultSets = files.map((file) => verify(file));
    const messages = resultSets.flat();

    expect(messages).toHaveLength(3);
  });

  it("no mezcla ternario y className plano aunque compartan clases", () => {
    const code = `
      export function View() {
        return (
          <>
            <div className={active ? "rounded-lg border p-4 shadow-sm" : "rounded-lg border p-4 shadow-sm"} />
            <div className={active ? "rounded-lg border p-4 shadow-sm" : "rounded-lg border p-4 shadow-sm"} />
            <div className="rounded-lg border p-4 shadow-sm" />
          </>
        );
      }
    `;

    const messages = verifyRepeatedJsx({ code, filename: "src/forms.tsx" });

    expect(messages).toHaveLength(0);
  });

  it("cuenta duplicados cross-file pero concentra la ubicacion hasta el runner global", () => {
    const files = [
      {
        code: `export function A() { return <div className="rounded-lg border p-4 shadow-sm"><h3 className="text-lg font-bold">{a.title}</h3></div>; }`,
        filename: "src/a.tsx",
      },
      {
        code: `export function B() { return <div className="border shadow-sm rounded-lg p-4"><h3 className="font-bold text-lg">{b.title}</h3></div>; }`,
        filename: "src/b.tsx",
      },
      {
        code: `export function C() { return <div className="shadow-sm p-4 border rounded-lg"><h3 className="text-lg font-bold">{c.title}</h3></div>; }`,
        filename: "src/c.tsx",
      },
    ];

    const verify = createRepeatedJsxVerifier();
    const resultSets = files.map((file) => verify(file));
    const messages = resultSets.flat();

    // Limitación conocida hasta #53: ESLint devuelve cada archivo al terminarlo,
    // así que los reportes pendientes se emiten en el archivo que activa el grupo.
    expect(resultSets[0]).toHaveLength(0);
    expect(resultSets[1]).toHaveLength(0);
    expect(resultSets[2]).toHaveLength(3);
    expect(messages).toHaveLength(3);
    expect(messages.every((message) => message.messageId === "repeatedJsx")).toBe(
      true,
    );
    expect(messages.every((message) => message.line === 1)).toBe(true);
  });

  it("deduplica por nodo con prioridad de sub-arbol sobre receta de clases", () => {
    const code = `
      export function View() {
        return (
          <>
            <div className="rounded-lg border p-4 shadow-sm"><h3 className="text-lg font-bold">{a.title}</h3></div>
            <div className="border shadow-sm rounded-lg p-4"><h3 className="font-bold text-lg">{b.title}</h3></div>
            <div className="shadow-sm p-4 border rounded-lg"><h3 className="text-lg font-bold">{c.title}</h3></div>
            <section className="rounded-lg border p-4 shadow-sm" />
            <section className="border shadow-sm rounded-lg p-4" />
          </>
        );
      }
    `;

    const messages = verifyRepeatedJsx({ code, filename: "src/mixed.tsx" });
    const treeReports = messages.filter((message) =>
      message.message.includes("3 veces"),
    );
    const classReports = messages.filter((message) =>
      message.message.includes("5 veces"),
    );

    expect(messages).toHaveLength(5);
    expect(treeReports).toHaveLength(3);
    expect(classReports).toHaveLength(2);
  });

  it("extrae literales dentro de cualquier llamada sin lista de class-builders", () => {
    const code = `
      export function View() {
        return (
          <>
            <div className={makeClasses("rounded-lg border p-4 shadow-sm")} />
            <section className={makeClasses("border shadow-sm rounded-lg p-4")} />
            <article className={makeClasses("shadow-sm p-4 border rounded-lg")} />
          </>
        );
      }
    `;

    const messages = verifyRepeatedJsx({ code, filename: "src/calls.tsx" });

    expect(messages).toHaveLength(3);
  });
});
