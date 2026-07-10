import { expect, it } from "vitest";
import { maxClassSize } from "../../src/rules/max-class-size";
import { createRuleTester } from "../rule-tester";

function createClassWithLines(lines: number) {
  return ["class SizedClass {", ...Array(lines - 2).fill("// line"), "}"].join(
    "\n",
  );
}

it("expone solo maxLines como entero positivo", () => {
  expect(maxClassSize.meta.fixable).toBeUndefined();
  expect(maxClassSize.meta.schema).toEqual([
    {
      additionalProperties: false,
      properties: {
        maxLines: { minimum: 1, type: "integer" },
      },
      type: "object",
    },
  ]);
});

it("mantiene los dos playbooks aprobados", () => {
  const messages = maxClassSize.meta.messages ?? {};

  expect(messages.tooLargeClass).toContain("clases mas pequenas y semanticas");
  expect(messages.tooLargeClass).toContain("no a providers artificiales");
  expect(messages.tooLargeClassWithExtractableData).toContain(
    "usa una funcion factory",
  );
  expect(messages.tooLargeClassWithExtractableData).toContain(
    "dependencias, estado o lifecycle reales",
  );
});

createRuleTester().run("max-class-size", maxClassSize, {
  invalid: [
    {
      code: createClassWithLines(151),
      errors: [
        {
          data: {
            className: "SizedClass",
            internalMethodCount: "0",
            lines: "151",
            maxLines: "150",
            methodCount: "0",
            propertyCount: "0",
            publicMethodCount: "0",
          },
          messageId: "tooLargeClass",
        },
      ],
    },
    {
      code: [
        "@sealed()",
        "class DecoratedClass {",
        "  execute() {}",
        "}",
      ].join("\n"),
      errors: [
        {
          data: {
            className: "DecoratedClass",
            internalMethodCount: "0",
            lines: "4",
            maxLines: "3",
            methodCount: "1",
            propertyCount: "0",
            publicMethodCount: "1",
          },
          messageId: "tooLargeClass",
        },
      ],
      options: [{ maxLines: 3 }],
    },
    {
      code: [
        "const Named = class InnerClass {",
        "  execute() {}",
        "};",
        "const Anonymous = class {",
        "  execute() {}",
        "};",
      ].join("\n"),
      errors: [
        {
          data: {
            className: "InnerClass",
            internalMethodCount: "0",
            lines: "3",
            maxLines: "2",
            methodCount: "1",
            propertyCount: "0",
            publicMethodCount: "1",
          },
          messageId: "tooLargeClass",
        },
        {
          data: {
            className: "anonymous",
            internalMethodCount: "0",
            lines: "3",
            maxLines: "2",
            methodCount: "1",
            propertyCount: "0",
            publicMethodCount: "1",
          },
          messageId: "tooLargeClass",
        },
      ],
      options: [{ maxLines: 2 }],
    },
    {
      code: [
        "class MetricsClass {",
        "  constructor(public id: string, private count = 0) {}",
        "  value = 1;",
        "  static config = {};",
        "  execute() {}",
        "  static build() {}",
        "  private normalize() {}",
        "  protected audit() {}",
        "  #secret() {}",
        "  _softPrivate() {}",
        "  [\"computed\"]() {}",
        "  get cached() { return 1; }",
        "  set cached(value: number) {}",
        "}",
      ].join("\n"),
      errors: [
        {
          data: {
            className: "MetricsClass",
            internalMethodCount: "5",
            lines: "14",
            maxLines: "13",
            methodCount: "7",
            propertyCount: "4",
            publicMethodCount: "2",
          },
          messageId: "tooLargeClass",
        },
      ],
      options: [{ maxLines: 13 }],
    },
    {
      code: [
        "class ToolFactory {",
        "  createTools() {",
        "    return [",
        "      {",
        "        name: \"search\",",
        "      },",
        "    ] as const;",
        "  }",
        "}",
      ].join("\n"),
      errors: [
        {
          data: {
            className: "ToolFactory",
            dataLines: "5",
            internalMethodCount: "0",
            lines: "9",
            maxLines: "5",
            memberName: "createTools",
            methodCount: "1",
            propertyCount: "0",
            publicMethodCount: "1",
          },
          messageId: "tooLargeClassWithExtractableData",
        },
      ],
      options: [{ maxLines: 5 }],
    },
    {
      code: [
        "class ConfigHolder {",
        "  data = {",
        "    empty: null,",
        "    label: \"orders\",",
        "    enabled: true,",
        "    retries: 3,",
        "    offset: -1,",
        "    values: [null, \"x\", false, 1, -1],",
        "    [\"computed\"]: true,",
        "    nested: { enabled: true },",
        "  } satisfies Record<string, unknown>;",
        "}",
      ].join("\n"),
      errors: [
        {
          data: {
            className: "ConfigHolder",
            dataLines: "10",
            internalMethodCount: "0",
            lines: "12",
            maxLines: "3",
            memberName: "data",
            methodCount: "0",
            propertyCount: "1",
            publicMethodCount: "0",
          },
          messageId: "tooLargeClassWithExtractableData",
        },
      ],
      options: [{ maxLines: 3 }],
    },
    {
      code: [
        "class InnerCandidate {",
        "  create() {",
        "    return {",
        "      dynamic: load(),",
        "      config: {",
        "        enabled: true,",
        "        mode: \"strict\",",
        "      },",
        "    };",
        "  }",
        "}",
      ].join("\n"),
      errors: [
        {
          data: {
            className: "InnerCandidate",
            dataLines: "4",
            internalMethodCount: "0",
            lines: "11",
            maxLines: "8",
            memberName: "create",
            methodCount: "1",
            propertyCount: "0",
            publicMethodCount: "1",
          },
          messageId: "tooLargeClassWithExtractableData",
        },
      ],
      options: [{ maxLines: 8 }],
    },
    {
      code: [
        "class InsufficientLiteral {",
        "  create() {",
        "    return { enabled: true };",
        "  }",
        "  first() {}",
        "  second() {}",
        "}",
      ].join("\n"),
      errors: [{ messageId: "tooLargeClass" }],
      options: [{ maxLines: 3 }],
    },
    {
      code: [
        "class DynamicData {",
        "  async create() {",
        "    return {",
        "      spread: { ...source },",
        "      call: load(),",
        "      created: new Date(),",
        "      fn: () => true,",
        "      method() { return true; },",
        "      self: this,",
        "      awaited: await load(),",
        "      asserted: source!,",
        "      chained: source?.value,",
        "      [key]: true,",
        "      missing: undefined,",
        "      nan: NaN,",
        "      infinite: Infinity,",
        "      regex: /x/u,",
        "      bigint: 1n,",
        "    };",
        "  }",
        "}",
      ].join("\n"),
      errors: [{ messageId: "tooLargeClass" }],
      options: [{ maxLines: 2 }],
    },
    {
      code: [
        "class FirstLarge {",
        "  execute() {}",
        "}",
        "class SecondLarge {",
        "  execute() {}",
        "}",
      ].join("\n"),
      errors: [
        {
          data: {
            className: "FirstLarge",
            internalMethodCount: "0",
            lines: "3",
            maxLines: "2",
            methodCount: "1",
            propertyCount: "0",
            publicMethodCount: "1",
          },
          messageId: "tooLargeClass",
        },
        {
          data: {
            className: "SecondLarge",
            internalMethodCount: "0",
            lines: "3",
            maxLines: "2",
            methodCount: "1",
            propertyCount: "0",
            publicMethodCount: "1",
          },
          messageId: "tooLargeClass",
        },
      ],
      options: [{ maxLines: 2 }],
    },
  ],
  valid: [
    createClassWithLines(150),
    {
      code: [
        ...Array(200).fill("const value = 1;"),
        "class SmallClass {",
        "  execute() {}",
        "}",
      ].join("\n"),
    },
    {
      code: [
        "const DATA = {",
        ...Array(200).fill("  enabled: true,"),
        "};",
        "class DataConsumer {",
        "  execute() { return DATA; }",
        "}",
      ].join("\n"),
    },
    {
      code: [
        "class AccessorOnly {",
        "  constructor() {}",
        "  get value() { return 1; }",
        "  set value(next: number) {}",
        "}",
      ].join("\n"),
      options: [{ maxLines: 5 }],
    },
    {
      code: "class CustomBudget {\n  execute() {}\n}",
      options: [{ maxLines: 3 }],
    },
  ],
});
