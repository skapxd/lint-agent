type NoAnonymousConditionOptions = {
  allowFilePatterns?: string[];
  allowTypePredicates?: boolean;
  maxMemberDepth?: number;
};

export function getNoAnonymousConditionOptions(
  options: NoAnonymousConditionOptions = {},
) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
    // Permitir llamadas cuya firma el type-checker demuestra como type
    // predicate (`x is T`). Sin type info, no hay evidencia y no aplica.
    allowTypePredicates: options.allowTypePredicates ?? true,
    // Saltos de propiedad permitidos en la lista blanca, contando desde la
    // base como nivel 0: `result.ok` → 1, `options.rules.flag` → 2.
    maxMemberDepth: options.maxMemberDepth ?? 2,
  };
}
