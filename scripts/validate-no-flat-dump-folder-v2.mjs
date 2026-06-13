#!/usr/bin/env node
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const utilsRoot = join(projectRoot, "src", "utils");
const sourceFilePattern = /\.(?:ts|tsx)$/;
const thresholds = [
  { minMargin: 0.1, minSignalCount: 1 },
  { minMargin: 0.15, minSignalCount: 2 },
  { minMargin: 0.2, minSignalCount: 3 },
];
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

function listSourceFiles(directoryPath) {
  const files = [];
  const entries = readdirSync(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...listSourceFiles(entryPath));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (!sourceFilePattern.test(entry.name)) {
      continue;
    }

    files.push(entryPath);
  }

  return files;
}

function extractSignature(sourceText) {
  const keys = new Set();
  const addSignal = (kind, value) => {
    const normalized = value.trim();
    if (normalized.length === 0) {
      return;
    }

    keys.add(`${kind}:${normalized}`);
  };

  for (const match of sourceText.matchAll(importSourcePattern)) {
    if (typeof match[1] !== "string") {
      continue;
    }

    addSignal("import", match[1]);
  }

  for (const match of sourceText.matchAll(astLiteralPattern)) {
    if (typeof match[1] !== "string") {
      continue;
    }

    addSignal("ast", match[1]);
  }

  const identifierCounts = new Map();
  for (const match of sourceText.matchAll(identifierPattern)) {
    const identifier = match[0];
    if (ignoredIdentifiers.has(identifier)) {
      continue;
    }

    if (identifier.length < 4) {
      continue;
    }

    identifierCounts.set(identifier, (identifierCounts.get(identifier) ?? 0) + 1);
  }

  const dominantIdentifiers = [...identifierCounts.entries()]
    .filter(([, count]) => count >= 3)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 8);

  for (const [identifier] of dominantIdentifiers) {
    addSignal("identifier", identifier);
  }

  return keys;
}

function getDomainName(filePath) {
  return relative(utilsRoot, filePath).split(/[\\/]/)[0];
}

function buildDomainSignatures(files, excludedFile) {
  const signatures = new Map();

  for (const filePath of files) {
    if (filePath === excludedFile) {
      continue;
    }

    const domainName = getDomainName(filePath);
    const signature = signatures.get(domainName) ?? new Set();
    const fileSignature = extractSignature(readFileSync(filePath, "utf8"));

    for (const key of fileSignature) {
      signature.add(key);
    }

    signatures.set(domainName, signature);
  }

  return signatures;
}

function scoreDomain(fileSignature, domainSignature) {
  let sharedSignalCount = 0;

  for (const key of fileSignature) {
    if (domainSignature.has(key)) {
      sharedSignalCount += 1;
    }
  }

  return sharedSignalCount / fileSignature.size;
}

function classifyFile(filePath, files, threshold) {
  const ownDomain = getDomainName(filePath);
  const fileSignature = extractSignature(readFileSync(filePath, "utf8"));

  if (fileSignature.size < threshold.minSignalCount) {
    return { bestDomain: null, filePath, ownDomain, status: "inclasificable" };
  }

  const domainSignatures = buildDomainSignatures(files, filePath);
  const scores = [...domainSignatures.entries()]
    .map(([domainName, domainSignature]) => ({
      domainName,
      score: scoreDomain(fileSignature, domainSignature),
    }))
    .sort((left, right) => right.score - left.score);
  const best = scores[0];
  const own = scores.find((score) => score.domainName === ownDomain);

  if (!best || !own) {
    return { bestDomain: null, filePath, ownDomain, status: "inclasificable" };
  }

  const marginAgainstOwn = best.score - own.score;
  const isOwnBest = best.domainName === ownDomain;
  if (isOwnBest) {
    return {
      bestDomain: best.domainName,
      filePath,
      ownDomain,
      score: best.score,
      status: "correcto",
    };
  }

  if (marginAgainstOwn < threshold.minMargin) {
    return {
      bestDomain: best.domainName,
      filePath,
      ownDomain,
      score: best.score,
      status: "ambiguo",
    };
  }

  return {
    bestDomain: best.domainName,
    filePath,
    ownDomain,
    score: best.score,
    status: "mal-ubicado",
  };
}

function summarizeThreshold(files, threshold) {
  const classifications = files.map((filePath) =>
    classifyFile(filePath, files, threshold),
  );

  return {
    ambiguous: classifications.filter(({ status }) => status === "ambiguo").length,
    classifications,
    correct: classifications.filter(({ status }) => status === "correcto").length,
    misplaced: classifications.filter(({ status }) => status === "mal-ubicado"),
    mute: classifications.filter(({ status }) => status === "inclasificable").length,
    threshold,
  };
}

const files = listSourceFiles(utilsRoot);
const directUtilsFiles = readdirSync(utilsRoot, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .filter((entry) => sourceFilePattern.test(entry.name))
  .filter((entry) => entry.name !== "index.ts" && entry.name !== "index.tsx")
  .length;
const domainNames = readdirSync(utilsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort((left, right) => left.localeCompare(right));
const summaries = thresholds.map((threshold) => summarizeThreshold(files, threshold));

console.log("# Spike V2 no-flat-dump-folder\n");
console.log(`Comando: \`node scripts/validate-no-flat-dump-folder-v2.mjs\``);
console.log(`Archivos medidos: ${files.length}`);
console.log(`Archivos .ts/.tsx directos en src/utils/: ${directUtilsFiles}`);
console.log(`Subdominios de src/utils/: ${domainNames.length} (${domainNames.join(", ")})\n`);
console.log("| minSignalCount | minMargin | correctos | candidatos mal ubicados | ambiguos | inclasificables |");
console.log("| --- | --- | ---: | ---: | ---: | ---: |");

for (const summary of summaries) {
  console.log(
    `| ${summary.threshold.minSignalCount} | ${summary.threshold.minMargin} | ${summary.correct} | ${summary.misplaced.length} | ${summary.ambiguous} | ${summary.mute} |`,
  );
}

console.log("\n## Candidatos mal ubicados\n");

for (const summary of summaries) {
  console.log(
    `### minSignalCount=${summary.threshold.minSignalCount}, minMargin=${summary.threshold.minMargin}`,
  );
  const sample = summary.misplaced;

  if (sample.length === 0) {
    console.log("\nSin candidatos.\n");
    continue;
  }

  console.log("\n| Archivo | Ground truth | Mejor dominio | Score |");
  console.log("| --- | --- | --- | ---: |");

  for (const item of sample) {
    console.log(
      `| \`${relative(projectRoot, item.filePath)}\` | \`${item.ownDomain}/\` | \`${item.bestDomain}/\` | ${item.score.toFixed(2)} |`,
    );
  }

  console.log("");
}
