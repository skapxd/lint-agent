import type { RuleListener } from "./rule-types";

export function isRuleListener(
  listenerCandidate: unknown,
): listenerCandidate is RuleListener {
  const hasListenerObject =
    typeof listenerCandidate === "object" && listenerCandidate !== null;
  if (!hasListenerObject) {
    return false;
  }

  for (const selector of Object.keys(listenerCandidate)) {
    const handler: unknown = Reflect.get(listenerCandidate, selector);
    const hasHandlerFunction = typeof handler === "function";
    if (!hasHandlerFunction) {
      return false;
    }
  }

  return true;
}
