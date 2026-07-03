import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run("no-local-function-bag", rules["no-local-function-bag"]!, {
  invalid: [
    {
      code: `
const cli = {
  parseOptions(value: unknown) {
    return typeof value === "string" ? value : undefined;
  },

  getTargetPath(dirArg: unknown, options: CliOptions) {
    return cli.parseOptions(dirArg) ?? options.directory ?? process.cwd();
  },

  writeOrPrint(output: string) {
    console.log(output);
  },
};
`,
      errors: [
        {
          data: {
            count: "3",
            functionNames: "parseOptions, getTargetPath, writeOrPrint",
            objectName: "cli",
          },
          messageId: "localFunctionBag",
        },
      ],
    },
    {
      code: `
const fileLabelFormatter = {
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
            functionNames: "formatFileLabel, formatFileMetadata",
            objectName: "fileLabelFormatter",
          },
          messageId: "localFunctionBag",
        },
      ],
    },
    {
      code: `
const parserParts = {
  parseA() {},
};

const parser = {
  ...parserParts,
  parseB() {},
};
`,
      errors: [
        {
          data: {
            count: "2",
            functionNames: "parseA, parseB",
            objectName: "parser",
          },
          messageId: "localFunctionBag",
        },
      ],
    },
    {
      code: `
const parser = {
  ...{
    parseA() {},
  },
  ["parse" + "B"]() {},
};
`,
      errors: [
        {
          data: {
            count: "2",
            functionNames: "parseA, [computed]",
            objectName: "parser",
          },
          messageId: "localFunctionBag",
        },
      ],
    },
  ],
  valid: [
    "const empty = {};",
    "const tsxParser = { parse() {} };",
    `
const relationshipLabels = {
  imports: "imports",
  importers: "imported by",
};
`,
    `
const commands = {
  build: buildCommand,
  lint: lintCommand,
};
`,
    `
const callbacks = {
  get parseA() {
    return "";
  },
  set parseB(value: string) {
    void value;
  },
};
`,
    `
import { parserParts } from "./parser-parts";

const parser = {
  ...parserParts,
  parseB() {},
};
`,
    `
export const relatedRender = {
  renderBranches() {},
  renderUnresolved() {},
};
`,
    `
const relatedRender = {
  renderBranches() {},
  renderUnresolved() {},
};

export { relatedRender };
`,
    {
      code: `
const legacyFunctionBag = {
  a() {},
  b() {},
};
`,
      filename: "src/legacy/legacy-function-bag.ts",
      options: [{ allowFilePatterns: ["src/legacy/**"] }],
    },
  ],
});
