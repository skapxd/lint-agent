import type {
  ParserServices,
  ParserServicesWithTypeInformation,
  TSESLint,
  TSESTree,
} from "@typescript-eslint/utils";
import type ts from "typescript";

export type RulePrimitive = string | number | boolean | null | undefined;

export type RuleValue = unknown;

export type RuleOptions = Record<string, unknown>;

export type RuleSourceCode = {
  getScope?: (node: unknown) => RuleScope;
  getText?: (node?: unknown) => string;
  parserServices?: ParserServices;
};

export type TextRuleSourceCode = RuleSourceCode & {
  getText: (node?: unknown) => string;
};

export type RuleScope = {
  childScopes?: RuleScope[];
  references?: RuleScopeReference[];
  set?: Map<string, RuleScopeVariable>;
  through?: RuleScopeReference[];
  type?: string;
  upper?: RuleScope | null;
  variables: RuleScopeVariable[];
};

export type RuleScopeVariable = {
  defs: Array<{ node?: TSESTree.Node }>;
  name: string;
  scope?: RuleScope;
};

export type RuleScopeReference = {
  from?: RuleScope;
  identifier?: TSESTree.Identifier;
  resolved: RuleScopeVariable | null;
};

export type TypeContext = {
  checker: ts.TypeChecker;
  services: ParserServicesWithTypeInformation;
};

export type RuleContext = {
  cwd?: string;
  filename?: string;
  getFilename: () => string;
  getSourceCode: () => RuleSourceCode;
  options: [RuleOptions?];
  report: (descriptor: {
    data?: Record<string, string>;
    fix?: (
      fixer: TSESLint.RuleFixer,
    ) => TSESLint.RuleFix | TSESLint.RuleFix[] | null;
    messageId: string;
    node: unknown;
  }) => void;
  sourceCode?: RuleSourceCode;
  [key: string]: unknown;
};

export type RuleListener = TSESLint.RuleListener;

export type RuleModule = {
  create: (context: RuleContext) => RuleListener;
  meta: Record<string, RuleValue> & {
    messages?: Record<string, string>;
  };
};

export type TypedRuleModule<
  MessageIds extends string = string,
  Options extends readonly unknown[] = readonly [Record<string, unknown>?],
> = TSESLint.RuleModule<MessageIds, Options>;

export type TypedRuleContext<
  MessageIds extends string = string,
  Options extends readonly unknown[] = readonly [Record<string, unknown>?],
> = TSESLint.RuleContext<MessageIds, Options>;
