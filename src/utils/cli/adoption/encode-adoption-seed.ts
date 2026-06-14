import type { AdoptionRuleSummary } from "#/utils/cli/types";

export function encodeAdoptionSeed(selectedRules: AdoptionRuleSummary[]) {
  const payload = JSON.stringify({
    v: 1,
    rules: selectedRules.map((rule) => rule.ruleId),
  });
  const encodedPayload = Buffer.from(payload, "utf8").toString("base64url");

  return `skapxd1.${encodedPayload}`;
}
