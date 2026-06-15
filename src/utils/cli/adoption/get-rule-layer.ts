import { RULE_LAYERS } from "./rule-layers";

export function getRuleLayer(ruleId: string) {
  return RULE_LAYERS.get(ruleId) ?? 0;
}
