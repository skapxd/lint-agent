import type { UpstreamRuleModule } from "./upstream-rule-module";

export function isRuleCreate(
  createCandidate: unknown,
): createCandidate is UpstreamRuleModule["create"] {
  return typeof createCandidate === "function";
}
