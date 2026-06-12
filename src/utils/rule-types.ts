/* eslint-disable skapxd/no-explicit-any -- Borde legacy: las reglas antiguas
 * manipulan formas TSESTree heterogeneas. El objetivo de este modulo es
 * concentrar el dinamismo aqui, no repartir `any` por cada regla/util. */
import type { TSESLint } from "@typescript-eslint/utils";

export type LegacyAstNode = any;
export type LegacyRuleContext = any;
export type LegacyValue = any;

export type RuleModule = {
  create: (context: LegacyRuleContext) => LegacyValue;
  meta: Record<string, LegacyValue>;
};

export type TypedRuleModule<
  MessageIds extends string = string,
  Options extends readonly unknown[] = readonly [Record<string, unknown>?],
> = TSESLint.RuleModule<MessageIds, Options>;

export type TypedRuleContext<
  MessageIds extends string = string,
  Options extends readonly unknown[] = readonly [Record<string, unknown>?],
> = TSESLint.RuleContext<MessageIds, Options>;
