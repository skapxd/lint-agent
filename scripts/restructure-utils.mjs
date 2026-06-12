import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const repoRoot = process.cwd();

const moves = [
  ["src/utils/rule-types.ts", "src/utils/rule-authoring/rule-types.ts"],
  ["src/utils/wrap-tseslint-rule.ts", "src/utils/rule-authoring/wrap-tseslint-rule.ts"],
  ["src/utils/boolean-option.ts", "src/utils/options/boolean-option.ts"],
  ["src/utils/number-option.ts", "src/utils/options/number-option.ts"],
  ["src/utils/string-array-option.ts", "src/utils/options/string-array-option.ts"],
  [
    "src/utils/get-async-result-rule-options.ts",
    "src/utils/options/get-async-result-rule-options.ts",
  ],
  [
    "src/utils/get-await-requires-result-options.ts",
    "src/utils/options/get-await-requires-result-options.ts",
  ],
  [
    "src/utils/get-max-hook-size-options.ts",
    "src/utils/options/get-max-hook-size-options.ts",
  ],
  [
    "src/utils/get-max-public-methods-options.ts",
    "src/utils/options/get-max-public-methods-options.ts",
  ],
  [
    "src/utils/get-nest-direct-instantiation-options.ts",
    "src/utils/options/get-nest-direct-instantiation-options.ts",
  ],
  [
    "src/utils/get-nest-dto-api-property-options.ts",
    "src/utils/options/get-nest-dto-api-property-options.ts",
  ],
  [
    "src/utils/get-nest-dto-validation-options.ts",
    "src/utils/options/get-nest-dto-validation-options.ts",
  ],
  [
    "src/utils/get-nest-inline-query-options.ts",
    "src/utils/options/get-nest-inline-query-options.ts",
  ],
  [
    "src/utils/get-nest-no-result-response-options.ts",
    "src/utils/options/get-nest-no-result-response-options.ts",
  ],
  [
    "src/utils/get-nest-swagger-controller-options.ts",
    "src/utils/options/get-nest-swagger-controller-options.ts",
  ],
  [
    "src/utils/get-nest-swagger-plugin-options.ts",
    "src/utils/options/get-nest-swagger-plugin-options.ts",
  ],
  [
    "src/utils/get-nest-validation-pipe-options.ts",
    "src/utils/options/get-nest-validation-pipe-options.ts",
  ],
  [
    "src/utils/get-no-accessors-options.ts",
    "src/utils/options/get-no-accessors-options.ts",
  ],
  [
    "src/utils/get-no-anonymous-condition-options.ts",
    "src/utils/options/get-no-anonymous-condition-options.ts",
  ],
  [
    "src/utils/get-no-default-export-options.ts",
    "src/utils/options/get-no-default-export-options.ts",
  ],
  ["src/utils/get-no-else-options.ts", "src/utils/options/get-no-else-options.ts"],
  ["src/utils/get-no-emoji-options.ts", "src/utils/options/get-no-emoji-options.ts"],
  [
    "src/utils/get-no-functions-inside-components-options.ts",
    "src/utils/options/get-no-functions-inside-components-options.ts",
  ],
  [
    "src/utils/get-no-nested-if-options.ts",
    "src/utils/options/get-no-nested-if-options.ts",
  ],
  [
    "src/utils/get-no-runtime-state-guard-options.ts",
    "src/utils/options/get-no-runtime-state-guard-options.ts",
  ],
  [
    "src/utils/get-no-tunnel-props-options.ts",
    "src/utils/options/get-no-tunnel-props-options.ts",
  ],
  [
    "src/utils/get-prefer-abort-signal-options.ts",
    "src/utils/options/get-prefer-abort-signal-options.ts",
  ],
  [
    "src/utils/get-readonly-properties-options.ts",
    "src/utils/options/get-readonly-properties-options.ts",
  ],
  [
    "src/utils/get-result-error-requires-handling-options.ts",
    "src/utils/options/get-result-error-requires-handling-options.ts",
  ],
  [
    "src/utils/get-strict-tsconfig-options.ts",
    "src/utils/options/get-strict-tsconfig-options.ts",
  ],
  [
    "src/utils/get-tagged-union-state-options.ts",
    "src/utils/options/get-tagged-union-state-options.ts",
  ],
  [
    "src/utils/get-typed-exports-options.ts",
    "src/utils/options/get-typed-exports-options.ts",
  ],
  [
    "src/utils/get-untrusted-module-options.ts",
    "src/utils/options/get-untrusted-module-options.ts",
  ],
];

const apply = process.argv.includes("--apply");
const dryRun = !apply || process.argv.includes("--dry-run");

function getMoveStates() {
  const sourceSet = new Set();
  const destinationSet = new Set();
  const moveStates = [];

  for (const [source, destination] of moves) {
    if (sourceSet.has(source)) {
      throw new Error(`Duplicate source in manifest: ${source}`);
    }

    if (destinationSet.has(destination)) {
      throw new Error(`Duplicate destination in manifest: ${destination}`);
    }

    const sourceExists = fs.existsSync(path.join(repoRoot, source));
    const destinationExists = fs.existsSync(path.join(repoRoot, destination));

    if (sourceExists && destinationExists) {
      throw new Error(`Source and destination both exist: ${source} -> ${destination}`);
    }

    if (!sourceExists && !destinationExists) {
      throw new Error(`Source and destination are both missing: ${source} -> ${destination}`);
    }

    sourceSet.add(source);
    destinationSet.add(destination);
    moveStates.push({
      destination,
      source,
      status: sourceExists ? "pending" : "applied",
    });
  }

  return moveStates;
}

function moduleSpecifierFor(filePath) {
  return `#/${filePath.replace(/^src\//, "").replace(/\.ts$/, "")}`;
}

function buildSpecifierMap() {
  const specifierMap = new Map();

  for (const [source, destination] of moves) {
    specifierMap.set(moduleSpecifierFor(source), moduleSpecifierFor(destination));
  }

  return specifierMap;
}

function listFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.name === "dist" || entry.name === "node_modules" || entry.name === ".git") {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...listFiles(fullPath));
      continue;
    }

    if (entry.isFile() && fullPath.endsWith(".ts")) {
      files.push(fullPath);
    }
  }

  return files;
}

function getModuleSpecifier(node) {
  if (!ts.isImportDeclaration(node) && !ts.isExportDeclaration(node)) {
    return undefined;
  }

  if (node.moduleSpecifier === undefined || !ts.isStringLiteral(node.moduleSpecifier)) {
    return undefined;
  }

  return node.moduleSpecifier;
}

function collectSpecifierUpdates(filePath, specifierMap) {
  const sourceText = fs.readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
  );
  const updates = [];

  function visit(node) {
    const specifier = getModuleSpecifier(node);

    if (specifier !== undefined) {
      const replacement = specifierMap.get(specifier.text);

      if (replacement !== undefined) {
        updates.push({
          end: specifier.end,
          replacement: JSON.stringify(replacement),
          start: specifier.getStart(sourceFile),
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return { sourceText, updates };
}

function applyTextUpdates(sourceText, updates) {
  return updates
    .slice()
    .sort((left, right) => right.start - left.start)
    .reduce(
      (nextText, update) =>
        `${nextText.slice(0, update.start)}${update.replacement}${nextText.slice(update.end)}`,
      sourceText,
    );
}

function updateImports(specifierMap) {
  const changedFiles = [];

  for (const filePath of listFiles(repoRoot)) {
    const { sourceText, updates } = collectSpecifierUpdates(filePath, specifierMap);

    if (updates.length === 0) {
      continue;
    }

    changedFiles.push({
      filePath: path.relative(repoRoot, filePath),
      updates,
    });

    if (apply) {
      fs.writeFileSync(filePath, applyTextUpdates(sourceText, updates));
    }
  }

  return changedFiles;
}

function moveFiles(moveStates) {
  for (const { destination, source, status } of moveStates) {
    if (dryRun || status === "applied") {
      continue;
    }

    fs.mkdirSync(path.dirname(path.join(repoRoot, destination)), { recursive: true });
    fs.renameSync(path.join(repoRoot, source), path.join(repoRoot, destination));
  }
}

function verifyNoStaleSpecifiers(specifierMap) {
  const staleImports = [];

  for (const filePath of listFiles(repoRoot)) {
    const { updates } = collectSpecifierUpdates(filePath, specifierMap);

    if (updates.length > 0) {
      staleImports.push(path.relative(repoRoot, filePath));
    }
  }

  return staleImports;
}

const moveStates = getMoveStates();

const specifierMap = buildSpecifierMap();
const changedFiles = updateImports(specifierMap);
moveFiles(moveStates);
const staleImports = apply ? verifyNoStaleSpecifiers(specifierMap) : [];

for (const { destination, source, status } of moveStates) {
  const action = status === "applied" ? "ALREADY MOVED" : apply ? "MOVE" : "WOULD MOVE";

  console.log(`${action} ${source} -> ${destination}`);
}

for (const changedFile of changedFiles) {
  console.log(`${apply ? "UPDATE" : "WOULD UPDATE"} ${changedFile.filePath}`);
}

if (staleImports.length > 0) {
  throw new Error(`Stale imports remain:\n${staleImports.join("\n")}`);
}
