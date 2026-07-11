import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import tseslint from "typescript-eslint";
import { describe, expect, it } from "vitest";
import { containsCallNamed } from "#/utils/ast/contains-call-named";
import { getPropertyName } from "#/utils/ast/get-property-name";
import { getClassNameSignature } from "#/utils/react/get-class-name-signature";
import { readStaticObjectKey } from "#/utils/react/read-static-object-key";
import { getMatchArgument } from "#/utils/result/get-match-argument";
import type { TextRuleSourceCode } from "#/utils/rule-authoring/rule-types";
import { getTypeReferenceName } from "#/utils/typescript/get-type-reference-name";
import { getUnknownErrorMessage } from "#/utils/unknown/get-unknown-error-message";

type RangedNode = {
  range?: readonly [number, number];
};

type ParserOptions = {
  ecmaFeatures?: { jsx?: boolean };
  ecmaVersion: number;
  loc: boolean;
  range: boolean;
  sourceType: "module" | "script";
};

type ParserWithOptions = {
  parseForESLint: (code: string, options: ParserOptions) => { ast: TSESTree.Program };
};

function hasRange(node: unknown): node is RangedNode {
  return typeof node === "object" && node !== null && "range" in node;
}

function createSourceCode(code: string): TextRuleSourceCode {
  return {
    getText(node?: unknown) {
      if (!hasRange(node) || !node.range) {
        return code;
      }

      return code.slice(node.range[0], node.range[1]);
    },
  };
}

function parseProgram(code: string, options: ParserOptions): TSESTree.Program {
  const parser = tseslint.parser as ParserWithOptions;

  return parser.parseForESLint(code, options).ast;
}

function parseFirstJsxAttribute(code: string, attributeName: string) {
  const program = parseProgram(code, {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 2022,
    loc: true,
    range: true,
    sourceType: "module",
  });
  const exportNode = program.body[0];
  if (
    !exportNode ||
    exportNode.type !== "ExportNamedDeclaration" ||
    exportNode.declaration?.type !== "FunctionDeclaration"
  ) {
    throw new Error("Fixture must export a function declaration");
  }

  const [returnStatement] = exportNode.declaration.body.body;
  if (returnStatement?.type !== "ReturnStatement") {
    throw new Error("Fixture function must return JSX");
  }

  const jsxElement = returnStatement.argument;
  if (jsxElement?.type !== "JSXElement") {
    throw new Error("Fixture return value must be a JSX element");
  }

  function isMatchingAttribute(
    candidate: TSESTree.JSXAttribute | TSESTree.JSXSpreadAttribute,
  ): candidate is TSESTree.JSXAttribute {
    return (
      candidate.type === "JSXAttribute" &&
      candidate.name.type === "JSXIdentifier" &&
      candidate.name.name === attributeName
    );
  }

  const attribute =
    jsxElement.openingElement.attributes.find(isMatchingAttribute);
  if (!attribute) {
    throw new Error(`Missing JSX attribute ${attributeName}`);
  }

  return attribute;
}

function parseExpression(expression: string): TSESTree.Expression {
  const program = parseProgram(`const value = ${expression};`, {
    ecmaVersion: 2022,
    loc: true,
    range: true,
    sourceType: "module",
  });
  const statement = program.body[0];
  if (statement?.type !== "VariableDeclaration") {
    throw new Error("Expression fixture must parse as a variable declaration");
  }

  const declaration = statement.declarations[0];
  if (!declaration?.init) {
    throw new Error("Expression fixture must have an initializer");
  }

  return declaration.init;
}

function identifier(name: string): TSESTree.Identifier {
  return { name, type: AST_NODE_TYPES.Identifier } as TSESTree.Identifier;
}

function stringLiteral(value: string): TSESTree.Literal {
  return {
    raw: JSON.stringify(value),
    type: AST_NODE_TYPES.Literal,
    value,
  } as TSESTree.Literal;
}

describe("coverage budget utility branches", () => {
  it("resume className complejos sin ejecutar expresiones", () => {
    const code = `
      export function View() {
        return <div className={cn(
          "p-2",
          active && "bg-blue-500",
          active ? "block" : "hidden",
          ["mt-2", null],
          { "text-sm": isSmall, ...spread },
          \`grid \${columns}\`,
        )} />;
      }
    `;
    const attribute = parseFirstJsxAttribute(code, "className");

    const signature = getClassNameSignature(attribute, createSourceCode(code));

    expect(signature?.classes).toEqual([
      "bg-blue-500",
      "block",
      "grid",
      "hidden",
      "mt-2",
      "p-2",
      "text-sm",
    ]);
    expect(signature?.signature).toContain("call:cn(");
    expect(signature?.signature).toContain("logical:&&");
    expect(signature?.signature).toContain("conditional(");
    expect(signature?.signature).toContain("spread:dynamic");
    expect(signature?.signature).toContain("template(grid|:dynamic)");
  });

  it("resume className plano y descarta atributos sin valor", () => {
    const literalCode = `
      export function View() {
        return <div className="rounded p-2 rounded" />;
      }
    `;
    const missingValueCode = `
      export function View() {
        return <div className />;
      }
    `;

    expect(
      getClassNameSignature(
        parseFirstJsxAttribute(literalCode, "className"),
        createSourceCode(literalCode),
      ),
    ).toEqual({
      classes: ["p-2", "rounded"],
      signature: "plain(p-2 rounded)",
    });
    expect(
      getClassNameSignature(
        parseFirstJsxAttribute(missingValueCode, "className"),
        createSourceCode(missingValueCode),
      ),
    ).toBeNull();
  });

  it("lee llaves estaticas de objetos JSX", () => {
    expect(readStaticObjectKey(stringLiteral("text-sm"))).toBe("text-sm");
    expect(readStaticObjectKey(identifier("enabled"))).toBe("enabled");
    expect(
      readStaticObjectKey({
        type: AST_NODE_TYPES.ThisExpression,
      } as TSESTree.ThisExpression),
    ).toBeNull();
  });

  it("lee nombres simples de propiedades AST", () => {
    expect(getPropertyName(identifier("count"))).toBe("count");
    expect(getPropertyName(stringLiteral("status"))).toBe("status");
    expect(
      getPropertyName({
        name: "secret",
        type: AST_NODE_TYPES.PrivateIdentifier,
      } as TSESTree.PrivateIdentifier),
    ).toBe("#secret");
    expect(
      getPropertyName({
        type: AST_NODE_TYPES.ThisExpression,
      } as TSESTree.ThisExpression),
    ).toBe("anonymous");
  });

  it("encuentra el argumento original de llamadas match encadenadas", () => {
    const directArgument = getMatchArgument(parseExpression("match(input)"));
    const chainedArgument = getMatchArgument(
      parseExpression('match(input).with("ok", handler)'),
    );

    expect(directArgument).toMatchObject({ name: "input", type: "Identifier" });
    expect(chainedArgument).toMatchObject({ name: "input", type: "Identifier" });
    expect(getMatchArgument(parseExpression("notMatch(input)"))).toBeNull();
    expect(getMatchArgument(identifier("input"))).toBeNull();
  });

  it("detecta llamadas por callee directo o propiedad miembro", () => {
    expect(containsCallNamed(parseExpression("track(input)"), ["track"])).toBe(
      true,
    );
    expect(containsCallNamed(parseExpression("service.track(input)"), ["track"])).toBe(
      true,
    );
    expect(
      containsCallNamed(parseExpression('service["track"](input)'), ["track"]),
    ).toBe(true);
    expect(containsCallNamed(parseExpression("service.skip(input)"), ["track"])).toBe(
      false,
    );
  });

  it("normaliza nombres de referencias TypeScript", () => {
    const qualifiedName = {
      left: identifier("Result"),
      right: identifier("Ok"),
      type: AST_NODE_TYPES.TSQualifiedName,
    } as TSESTree.TSQualifiedName;

    expect(getTypeReferenceName(identifier("Result"))).toBe("Result");
    expect(getTypeReferenceName(qualifiedName)).toBe("Ok");
    expect(
      getTypeReferenceName({
        type: AST_NODE_TYPES.ThisExpression,
      } as unknown as TSESTree.TSTypeReference["typeName"]),
    ).toBeNull();
  });

  it("extrae mensajes seguros desde errores desconocidos", () => {
    expect(getUnknownErrorMessage(new Error("boom"), "fallback")).toBe("boom");
    expect(getUnknownErrorMessage({ message: "custom" }, "fallback")).toBe(
      "custom",
    );
    expect(getUnknownErrorMessage({ message: 42 }, "fallback")).toBe("fallback");
    expect(getUnknownErrorMessage(null, "fallback")).toBe("fallback");
  });
});
