import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

const ruleTester = createRuleTester();

const denseFunctionWithoutComment = `
export function getCellClass(state) {
  const base = "grid";
  const cursor = "cursor";
  const selected = "selected";
  const precedent = "precedent";
  const dependent = "dependent";
  const deepPrecedent = "deep-precedent";
  const deepDependent = "deep-dependent";
  const cycle = "cycle";
  const formula = "formula";
  const normal = "normal";
  const muted = "muted";
  if (state.cursor) {
    return base + cursor;
  }
  if (state.selected) {
    return base + selected;
  }
  if (state.precedent) {
    return base + precedent;
  }
  if (state.dependent) {
    return base + dependent;
  }
  if (state.deepPrecedent) {
    return base + deepPrecedent;
  }
  if (state.deepDependent) {
    return base + deepDependent;
  }
  return state.formula ? formula : state.cycle ? cycle : normal + muted;
}
`;

const denseFunctionWithMarkdownComment = [
  "/**",
  " * Traduce el estado visual de una celda al modo auditoria: cursor, seleccion,",
  " * precedentes/dependientes y celdas neutras compiten por el color final.",
  " *",
  " * ### Prioridad",
  " * cursor -> seleccion -> relaciones directas -> relaciones profundas -> formula/ciclo/normal.",
  " *",
  " * ### Ejemplo",
  " * ```ts",
  ' * getCellClass({ precedent: true }); // -> "precedent"',
  " * ```",
  " */",
].join("\n") + denseFunctionWithoutComment;

ruleTester.run(
  "dense-function-requires-comment",
  rules["dense-function-requires-comment"]!,
  {
    invalid: [
      {
        code: denseFunctionWithoutComment,
        errors: [{ messageId: "missingMotivationComment" }],
      },
      {
        code: `// Explica el modo auditoria.
${denseFunctionWithoutComment}`,
        errors: [{ messageId: "missingMotivationComment" }],
      },
      {
        code: `/**
 * Traduce el estado visual de una celda al modo auditoria.
 *
 * ### Ejemplo
 * getCellClass({ precedent: true }) -> "precedent"
 */${denseFunctionWithoutComment}`,
        errors: [{ messageId: "markdownStructureMissing" }],
      },
      {
        code: `/**
 * Traduce el estado visual de una celda al modo auditoria.
 *
 * Ejemplo:
 * \`\`\`ts
 * getCellClass({ precedent: true }); // -> "precedent"
 * \`\`\`
 */${denseFunctionWithoutComment}`,
        errors: [{ messageId: "markdownStructureMissing" }],
      },
    ],
    valid: [
      denseFunctionWithMarkdownComment,
      `
export function buildConfig() {
  const one = "one";
  const two = "two";
  const three = "three";
  const four = "four";
  const five = "five";
  const six = "six";
  const seven = "seven";
  const eight = "eight";
  const nine = "nine";
  const ten = "ten";
  const eleven = "eleven";
  const twelve = "twelve";
  return {
    one,
    two,
    three,
    four,
    five,
    six,
    seven,
    eight,
    nine,
    ten,
    eleven,
    twelve,
  };
}
`,
      `export function tiny(value) {
  return value ? "yes" : "no";
}
`,
      {
        code: denseFunctionWithoutComment,
        filename: "src/legacy/get-cell-class.ts",
        options: [{ allowFilePatterns: ["src/legacy/**"] }],
      },
    ],
  },
);
