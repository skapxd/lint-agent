import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ignoredDirectories = new Set([".git", "dist", "node_modules"]);

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function stripExtension(filePath) {
  return filePath.replace(/\.ts$/, "");
}

function moduleSpecifierForAlias(filePath) {
  return `#/${stripExtension(filePath).replace(/^src\//, "")}`;
}

function relativeSpecifier(importerPath, targetPath) {
  const fromDirectory = path.posix.dirname(importerPath);
  const relativePath = path.posix.relative(fromDirectory, stripExtension(targetPath));

  return relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
}

function resolveRelativeSpecifier(repoRoot, importerPath, specifier) {
  const resolved = path.posix.normalize(
    path.posix.join(path.posix.dirname(importerPath), specifier),
  );
  const candidates = [`${resolved}.ts`, path.posix.join(resolved, "index.ts")];

  return candidates.find((candidate) => fs.existsSync(path.join(repoRoot, candidate)));
}

function resolveSpecifier(repoRoot, importerPath, specifier) {
  if (specifier.startsWith("#/")) {
    return `src/${specifier.slice(2)}.ts`;
  }

  if (specifier.startsWith(".")) {
    return resolveRelativeSpecifier(repoRoot, importerPath, specifier);
  }

  return undefined;
}

function getMoveStates(repoRoot, moves) {
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

function listTypeScriptFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...listTypeScriptFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".ts")) {
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

function replacementSpecifier(importerPath, specifier, destinationPath) {
  if (specifier.startsWith("#/")) {
    return moduleSpecifierForAlias(destinationPath);
  }

  const nextSpecifier = relativeSpecifier(importerPath, destinationPath);

  return nextSpecifier.startsWith("../")
    ? moduleSpecifierForAlias(destinationPath)
    : nextSpecifier;
}

function collectUpdates(repoRoot, filePath, moveMap) {
  const importerPath = toPosix(path.relative(repoRoot, filePath));
  const destinationToSourceMap = new Map(
    [...moveMap.entries()].map(([source, destination]) => [destination, source]),
  );
  const originalImporterPath = destinationToSourceMap.get(importerPath) ?? importerPath;
  const finalImporterPath = moveMap.get(originalImporterPath) ?? importerPath;
  const sourceText = fs.readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
  );
  const updates = [];

  function visit(node) {
    const moduleSpecifier = getModuleSpecifier(node);

    if (moduleSpecifier !== undefined) {
      const resolvedFromCurrent = resolveSpecifier(
        repoRoot,
        importerPath,
        moduleSpecifier.text,
      );
      const resolvedFromOriginal =
        resolvedFromCurrent === undefined
          ? resolveSpecifier(repoRoot, originalImporterPath, moduleSpecifier.text)
          : undefined;
      const resolvedPath = resolvedFromCurrent ?? resolvedFromOriginal;
      const finalTargetPath = resolvedPath
        ? moveMap.get(resolvedPath) ?? resolvedPath
        : undefined;
      const shouldRecalculateRelative =
        moduleSpecifier.text.startsWith(".") &&
        (finalImporterPath !== importerPath || resolvedFromOriginal !== undefined);
      const shouldNormalizeParentRelative =
        importerPath.startsWith("src/") &&
        moduleSpecifier.text.startsWith("../") &&
        finalTargetPath !== undefined;
      const targetMoved = resolvedPath ? moveMap.has(resolvedPath) : false;

      if (
        finalTargetPath !== undefined &&
        (targetMoved || shouldRecalculateRelative || shouldNormalizeParentRelative)
      ) {
        const replacement = shouldNormalizeParentRelative
          ? moduleSpecifierForAlias(finalTargetPath)
          : replacementSpecifier(
              finalImporterPath,
              moduleSpecifier.text,
              finalTargetPath,
            );

        updates.push({
          end: moduleSpecifier.end,
          replacement: JSON.stringify(replacement),
          start: moduleSpecifier.getStart(sourceFile),
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return { sourceText, updates };
}

function applyUpdates(sourceText, updates) {
  return updates
    .slice()
    .sort((left, right) => right.start - left.start)
    .reduce(
      (nextText, update) =>
        `${nextText.slice(0, update.start)}${update.replacement}${nextText.slice(update.end)}`,
      sourceText,
    );
}

function updateReferences(repoRoot, moveMap, apply) {
  const changedFiles = [];

  for (const filePath of listTypeScriptFiles(repoRoot)) {
    const { sourceText, updates } = collectUpdates(repoRoot, filePath, moveMap);

    if (updates.length === 0) {
      continue;
    }

    changedFiles.push(toPosix(path.relative(repoRoot, filePath)));

    if (apply) {
      fs.writeFileSync(filePath, applyUpdates(sourceText, updates));
    }
  }

  return changedFiles;
}

function moveFiles(repoRoot, moveStates, apply) {
  for (const { destination, source, status } of moveStates) {
    if (!apply || status === "applied") {
      continue;
    }

    fs.mkdirSync(path.dirname(path.join(repoRoot, destination)), { recursive: true });
    fs.renameSync(path.join(repoRoot, source), path.join(repoRoot, destination));
  }
}

function verifyNoStaleReferences(repoRoot, moveMap) {
  const staleFiles = [];

  for (const filePath of listTypeScriptFiles(repoRoot)) {
    const { updates } = collectUpdates(repoRoot, filePath, moveMap);

    if (updates.length > 0) {
      staleFiles.push(toPosix(path.relative(repoRoot, filePath)));
    }
  }

  if (staleFiles.length > 0) {
    throw new Error(`Stale references remain:\n${staleFiles.join("\n")}`);
  }
}

export function runMoveMigration({ moves }) {
  const repoRoot = process.cwd();
  const apply = process.argv.includes("--apply");
  const moveStates = getMoveStates(repoRoot, moves);
  const moveMap = new Map(moves);
  const changedFiles = updateReferences(repoRoot, moveMap, apply);

  moveFiles(repoRoot, moveStates, apply);

  if (apply) {
    verifyNoStaleReferences(repoRoot, moveMap);
  }

  for (const { destination, source, status } of moveStates) {
    const action = status === "applied" ? "ALREADY MOVED" : apply ? "MOVE" : "WOULD MOVE";

    console.log(`${action} ${source} -> ${destination}`);
  }

  for (const filePath of changedFiles) {
    console.log(`${apply ? "UPDATE" : "WOULD UPDATE"} ${filePath}`);
  }
}
