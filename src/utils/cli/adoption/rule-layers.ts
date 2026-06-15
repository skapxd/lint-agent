import { computeRuleLayers } from "./compute-rule-layers";
import { RULE_DEPENDENCIES } from "./rule-dependencies";

export const RULE_LAYERS = computeRuleLayers(RULE_DEPENDENCIES);
