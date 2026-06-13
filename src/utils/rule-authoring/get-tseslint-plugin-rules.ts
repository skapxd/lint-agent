import tseslint from "typescript-eslint";
import { isRuleCreate } from "./is-rule-create";
import { isRuleListener } from "./is-rule-listener";
import type { UpstreamRuleModule } from "./upstream-rule-module";

export function getTseslintPluginRules(): Record<string, UpstreamRuleModule> {
  const rulesCandidate: unknown = Reflect.get(tseslint.plugin, "rules");
  const hasRuleMap =
    typeof rulesCandidate === "object" && rulesCandidate !== null;
  if (!hasRuleMap) {
    throw new Error(
      "getTseslintPluginRules: typescript-eslint no expone plugin.rules en runtime.",
    );
  }

  const upstreamRules: Record<string, UpstreamRuleModule> = {};

  for (const ruleName of Object.keys(rulesCandidate)) {
    const ruleCandidate: unknown = Reflect.get(rulesCandidate, ruleName);
    const hasRuleObject =
      typeof ruleCandidate === "object" && ruleCandidate !== null;
    if (!hasRuleObject) {
      throw new Error(
        `getTseslintPluginRules: la regla "${ruleName}" no tiene forma de objeto.`,
      );
    }

    const createCandidate: unknown = Reflect.get(ruleCandidate, "create");
    const metaCandidate: unknown = Reflect.get(ruleCandidate, "meta");
    const hasCreate = isRuleCreate(createCandidate);
    const hasMeta = typeof metaCandidate === "object" && metaCandidate !== null;
    const hasInvalidRuleShape = !hasCreate || !hasMeta;
    if (hasInvalidRuleShape) {
      throw new Error(
        `getTseslintPluginRules: la regla "${ruleName}" no expone create/meta.`,
      );
    }

    const meta: UpstreamRuleModule["meta"] = {};
    for (const metaName of Object.keys(metaCandidate)) {
      const metaValue: unknown = Reflect.get(metaCandidate, metaName);
      meta[metaName] = metaValue;
    }

    const create: UpstreamRuleModule["create"] = (context) => {
      const listenerCandidate: unknown = createCandidate(context);
      const hasListener = isRuleListener(listenerCandidate);
      if (!hasListener) {
        return {};
      }

      return listenerCandidate;
    };

    const upstreamRule: UpstreamRuleModule = {
      create,
      meta,
    };
    for (const propertyName of Object.keys(ruleCandidate)) {
      const propertyValue: unknown = Reflect.get(ruleCandidate, propertyName);
      upstreamRule[propertyName] = propertyValue;
    }
    upstreamRule.create = create;
    upstreamRule.meta = meta;
    upstreamRules[ruleName] = upstreamRule;
  }

  return upstreamRules;
}
