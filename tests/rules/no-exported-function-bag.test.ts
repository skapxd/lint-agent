import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run(
  "no-exported-function-bag",
  rules["no-exported-function-bag"]!,
  {
    invalid: [
      {
        code: `
export const relatedRender = {
  renderBranches() {},
  renderUnresolved() {},
  renderFileList() {},
};
`,
        errors: [
          {
            data: {
              count: "3",
              exportName: "relatedRender",
              functionNames: "renderBranches, renderUnresolved, renderFileList",
            },
            messageId: "exportedFunctionBag",
          },
        ],
      },
      {
        code: `
export const fileLabelFormatter = {
  formatFileLabel: () => "",
  formatFileMetadata: function formatFileMetadata() {
    return "";
  },
};
`,
        errors: [
          {
            data: {
              count: "2",
              exportName: "fileLabelFormatter",
              functionNames: "formatFileLabel, formatFileMetadata",
            },
            messageId: "exportedFunctionBag",
          },
        ],
      },
      {
        code: `
const relatedRender = {
  renderBranches() {},
  renderUnresolved() {},
};

export { relatedRender };
`,
        errors: [
          {
            data: {
              count: "2",
              exportName: "relatedRender",
              functionNames: "renderBranches, renderUnresolved",
            },
            messageId: "exportedFunctionBag",
          },
        ],
      },
      {
        code: `
const relatedRender = {
  renderBranches() {},
  renderUnresolved() {},
};

export { relatedRender as renderBag };
`,
        errors: [
          {
            data: {
              count: "2",
              exportName: "renderBag",
              functionNames: "renderBranches, renderUnresolved",
            },
            messageId: "exportedFunctionBag",
          },
        ],
      },
      {
        code: `
export default {
  parseA() {},
  parseB() {},
};
`,
        errors: [
          {
            data: {
              count: "2",
              exportName: "default",
              functionNames: "parseA, parseB",
            },
            messageId: "exportedFunctionBag",
          },
        ],
      },
      {
        code: `
const parserParts = {
  parseA() {},
};

export const parser = {
  ...parserParts,
  parseB() {},
};
`,
        errors: [
          {
            data: {
              count: "2",
              exportName: "parser",
              functionNames: "parseA, parseB",
            },
            messageId: "exportedFunctionBag",
          },
        ],
      },
      {
        code: `
const parserParts = {
  parseA() {},
};

export const parser = {
  ...parserParts,
  ["parse" + "B"]() {},
};
`,
        errors: [
          {
            data: {
              count: "2",
              exportName: "parser",
              functionNames: "parseA, [computed]",
            },
            messageId: "exportedFunctionBag",
          },
        ],
      },
    ],
    valid: [
      "export const empty = {};",
      "export const tsxParser = { parse() {} };",
      `
export const relationshipLabels = {
  imports: "imports",
  importers: "imported by",
};
`,
      `
export const eslintPlugin = {
  configs,
  rules,
};
`,
      `
const callbacks = {
  a() {},
  b() {},
};

export { callbacks } from "./callbacks";
`,
      `
import { parserParts } from "./parser-parts";

export const parser = {
  ...parserParts,
  parseB() {},
};
`,
      `
const parserParts = {
  parseA() {},
};

export const parser = {
  ...unknownParserParts,
  parseB() {},
};
`,
      `
export const computedAccessors = {
  get parseA() {
    return "";
  },
  set parseB(value: string) {
    void value;
  },
};
`,
      {
        code: `
export const legacyFunctionBag = {
  a() {},
  b() {},
};
`,
        filename: "src/legacy/legacy-function-bag.ts",
        options: [{ allowFilePatterns: ["src/legacy/**"] }],
      },
    ],
  },
);
