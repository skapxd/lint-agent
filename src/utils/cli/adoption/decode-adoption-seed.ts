import { trySafe } from "@skapxd/result";

export function decodeAdoptionSeed(seed: string) {
  const prefix = "skapxd1.";
  const hasExpectedPrefix = seed.startsWith(prefix);

  if (!hasExpectedPrefix) {
    throw new Error("Uso invalido: --verify <seed> espera una seed skapxd1 valida.");
  }

  const encodedPayload = seed.slice(prefix.length);
  const decodedPayload = trySafe(
    () =>
      JSON.parse(
        Buffer.from(encodedPayload, "base64url").toString("utf8"),
      ) as unknown,
  );

  if (!decodedPayload.ok) {
    throw new Error("Uso invalido: --verify <seed> espera una seed skapxd1 valida.", {
      cause: decodedPayload.error,
    });
  }

  const payload = decodedPayload.value;
  const payloadIsObject = typeof payload === "object" && payload !== null;

  if (!payloadIsObject) {
    throw new Error("Uso invalido: --verify <seed> espera una seed skapxd1 valida.");
  }

  const version: unknown = Reflect.get(payload, "v");
  const rules: unknown = Reflect.get(payload, "rules");
  const hasSupportedSeedVersion = version === 1;

  if (!hasSupportedSeedVersion) {
    throw new Error("Uso invalido: --verify <seed> espera una seed skapxd1 valida.");
  }

  const hasRuleList = Array.isArray(rules);

  if (!hasRuleList) {
    throw new Error("Uso invalido: --verify <seed> espera una seed skapxd1 valida.");
  }

  const ruleNames: string[] = [];

  for (const rule of rules) {
    const hasRuleName = typeof rule === "string";

    if (!hasRuleName) {
      throw new Error("Uso invalido: --verify <seed> espera una seed skapxd1 valida.");
    }

    ruleNames.push(rule);
  }

  return { rules: ruleNames, v: version };
}
