// Frontera de tipos de la fase 1 del issue #4 (adios a los 187 @ts-nocheck).
// ADVERTENCIA HONESTA: `RuleNode` declara TODAS las propiedades del AST como
// presentes y no-opcionales — MIENTE a proposito, como fachada estructural,
// para que ~190 archivos legacy compilen sin casts masivos. Por eso
// skapxd/no-impossible-branch esta apagada en el dogfood (le creeria a esta
// mentira y acusaria guards necesarios). La fase 2 (issue #10) migra los
// consumidores a nodos TSESTree honestos por lotes y este tipo muere o queda
// reducido a los helpers de opciones.
import type {
  ParserServices,
  ParserServicesWithTypeInformation,
  TSESLint,
} from "@typescript-eslint/utils";
import type ts from "typescript";

export type RulePrimitive = string | number | boolean | null | undefined;

export type RuleValue = unknown;

export type RuleNodeList = RuleNode[] & RuleNode;

export type RuleNode = {
  accessibility: string;
  alternate: RuleNode | null;
  argument: RuleNode;
  arguments: RuleNode[];
  async: boolean;
  body: RuleNodeList;
  callee: RuleNode;
  computed: boolean;
  declarations: RuleNode[];
  decorators: RuleNode[];
  declaration: RuleNode | null;
  delegate: boolean;
  elements: Array<RuleNode | null>;
  expression: RuleNode;
  exported: RuleNode;
  id: RuleNode;
  init: RuleNode;
  key: RuleNode;
  kind: string | number;
  left: RuleNode;
  loc: {
    end: { column: number; line: number };
    start: { column: number; line: number };
  };
  name: string;
  local: RuleNode;
  members: RuleNode[];
  object: RuleNode;
  operator: string;
  optional: boolean;
  parameter: RuleNode;
  parent: RuleNode;
  params: RuleNode[];
  properties: RuleNode[];
  property: RuleNode;
  consequent: RuleNode | null;
  quasis: RuleNode[];
  range: [number, number];
  raw: string;
  readonly: boolean;
  returnType?: { typeAnnotation?: RuleNode } | null;
  right: RuleNode;
  source: RuleNode;
  specifiers: RuleNode[];
  static: boolean;
  test: RuleNode;
  type: string;
  typeAnnotation: RuleNode;
  typeArguments: RuleNode;
  typeName: RuleNode;
  typeParameters: RuleNode;
  value: RulePrimitive | RuleNode;
  [key: string]: RuleValue;
};

export type RuleOptions = Record<string, unknown>;

export function booleanOption(
  options: RuleOptions,
  key: string,
  fallback: boolean,
): boolean {
  const value = options[key];

  return typeof value === "boolean" ? value : fallback;
}

export function numberOption(
  options: RuleOptions,
  key: string,
  fallback: number,
): number {
  const value = options[key];

  return typeof value === "number" ? value : fallback;
}

export function stringArrayOption(
  options: RuleOptions,
  key: string,
  fallback: string[] = [],
): string[] {
  const value = options[key];

  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : fallback;
}

export type RuleSourceCode = {
  getScope?: (node: RuleNode) => RuleScope;
  getText: (node?: RuleNode) => string;
  parserServices?: ParserServices;
};

export type RuleScope = {
  childScopes?: RuleScope[];
  set?: Map<string, RuleScopeVariable>;
  upper?: RuleScope | null;
  variables: RuleScopeVariable[];
};

export type RuleScopeVariable = {
  defs: Array<{ node?: RuleNode }>;
  name: string;
};

export type TypeContext = {
  checker: ts.TypeChecker;
  services: ParserServicesWithTypeInformation & {
    getSymbolAtLocation: (node: RuleNode) => ts.Symbol | undefined;
    getTypeAtLocation: (node: RuleNode) => ts.Type;
    getTypeFromTypeNode: (node: RuleNode) => ts.Type;
  };
};

export type RuleContext = {
  cwd?: string;
  filename?: string;
  getFilename: () => string;
  getSourceCode: () => RuleSourceCode;
  options: [RuleOptions?];
  report: (descriptor: {
    data?: Record<string, string>;
    messageId: string;
    node: unknown;
  }) => void;
  sourceCode?: RuleSourceCode;
  [key: string]: unknown;
};

export type RuleListener = Record<string, ((node: RuleNode) => void) | undefined>;

export type RuleModule = {
  create: (context: RuleContext) => RuleListener;
  meta: Record<string, RuleValue>;
};

export type TypedRuleModule<
  MessageIds extends string = string,
  Options extends readonly unknown[] = readonly [Record<string, unknown>?],
> = TSESLint.RuleModule<MessageIds, Options>;

export type TypedRuleContext<
  MessageIds extends string = string,
  Options extends readonly unknown[] = readonly [Record<string, unknown>?],
> = TSESLint.RuleContext<MessageIds, Options>;
