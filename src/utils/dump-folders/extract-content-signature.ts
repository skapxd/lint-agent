import type {
  ContentSignalExamples,
  ContentSignalKind,
  ContentSignature,
} from "#/utils/dump-folders/types";

const importSourcePattern =
  /(?:import\s+(?:type\s+)?(?:[^'"]+\s+from\s+)?|export\s+[^'"]+\s+from\s+|require\s*\(\s*|import\s*\(\s*)["']([^"']+)["']/g;

const astLiteralPattern =
  /["']([A-Z][A-Za-z0-9]+(?:Expression|Statement|Declaration|Element|Literal|Identifier|Pattern|Specifier|Definition|Property|Method|Body|Clause))["']/g;

const identifierPattern = /\b[A-Za-z_$][A-Za-z0-9_$]*\b/g;

const ignoredIdentifiers = new Set([
  "as",
  "const",
  "else",
  "export",
  "false",
  "from",
  "function",
  "if",
  "import",
  "interface",
  "let",
  "null",
  "readonly",
  "return",
  "satisfies",
  "string",
  "true",
  "type",
  "undefined",
]);

export function extractContentSignature(sourceText: string): ContentSignature {
  const keys = new Set<string>();
  const examples: ContentSignalExamples = {
    ast: [],
    identifier: [],
    import: [],
  };

  const addSignal = (kind: ContentSignalKind, value: string): void => {
    const normalized = value.trim();
    const lacksSignalValue = normalized.length === 0;
    if (lacksSignalValue) {
      return;
    }

    keys.add(`${kind}:${normalized}`);

    const alreadyHasExample = examples[kind].includes(normalized);
    if (alreadyHasExample) {
      return;
    }

    const hasEnoughExamples = examples[kind].length >= 4;
    if (hasEnoughExamples) {
      return;
    }

    examples[kind].push(normalized);
  };

  for (const match of sourceText.matchAll(importSourcePattern)) {
    const importSource = match[1];
    const hasImportSource = typeof importSource === "string";
    if (!hasImportSource) {
      continue;
    }

    addSignal("import", importSource);
  }

  for (const match of sourceText.matchAll(astLiteralPattern)) {
    const astLiteral = match[1];
    const hasAstLiteral = typeof astLiteral === "string";
    if (!hasAstLiteral) {
      continue;
    }

    addSignal("ast", astLiteral);
  }

  const identifierCounts = new Map<string, number>();
  for (const match of sourceText.matchAll(identifierPattern)) {
    const identifier = match[0];
    const isIgnoredIdentifier = ignoredIdentifiers.has(identifier);
    if (isIgnoredIdentifier) {
      continue;
    }

    const isShortIdentifier = identifier.length < 4;
    if (isShortIdentifier) {
      continue;
    }

    identifierCounts.set(identifier, (identifierCounts.get(identifier) ?? 0) + 1);
  }

  const dominantIdentifiers = [...identifierCounts.entries()]
    .filter((entry) => {
      const [, count] = entry;

      return count >= 3;
    })
    .sort((left, right) => right[1] - left[1])
    .slice(0, 8);

  for (const [identifier] of dominantIdentifiers) {
    addSignal("identifier", identifier);
  }

  return { examples, keys };
}
