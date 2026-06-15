import type { RuleDependencyMap } from "./rule-dependencies";

export function computeRuleLayers(dependencies: RuleDependencyMap) {
  const layers = new Map<string, number>();
  const resolving = new Set<string>();
  const ruleIds = new Set<string>(Object.keys(dependencies));

  for (const premises of Object.values(dependencies)) {
    for (const premise of premises) {
      ruleIds.add(premise);
    }
  }

  const resolveLayer = (ruleId: string, path: readonly string[]): number => {
    const cachedLayer = layers.get(ruleId);

    if (cachedLayer !== undefined) {
      return cachedLayer;
    }

    const isCycle = resolving.has(ruleId);

    if (isCycle) {
      const cycleStart = path.indexOf(ruleId);
      const cycle = [...path.slice(cycleStart), ruleId].join(" -> ");

      throw new Error(`Grafo de dependencias de reglas ciclico: ${cycle}.`);
    }

    resolving.add(ruleId);

    const premises = dependencies[ruleId] ?? [];
    let layer = 0;

    for (const premise of premises) {
      layer = Math.max(layer, resolveLayer(premise, [...path, ruleId]) + 1);
    }

    resolving.delete(ruleId);
    layers.set(ruleId, layer);

    return layer;
  };

  for (const ruleId of ruleIds) {
    resolveLayer(ruleId, []);
  }

  return layers;
}
