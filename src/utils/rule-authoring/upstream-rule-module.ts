import type { RuleModule } from "./rule-types";

export type UpstreamRuleModule = RuleModule & {
  meta: RuleModule["meta"] & {
    docs?: Record<string, unknown>;
    messages?: Record<string, string>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};
