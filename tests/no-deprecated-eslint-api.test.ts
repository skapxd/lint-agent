import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

type DeprecatedContextCall = {
  api: string;
  newProperty: string | null;
};

const deprecatedContextCalls: readonly DeprecatedContextCall[] = [
  { api: "getSourceCode", newProperty: "sourceCode" },
  { api: "getFilename", newProperty: "filename" },
  { api: "getScope", newProperty: null },
];

const srcDirectory = fileURLToPath(new URL("../src", import.meta.url));

function collectTypeScriptFiles(directory: string): string[] {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectTypeScriptFiles(absolutePath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".ts")) {
      files.push(absolutePath);
    }
  }

  return files;
}

function getLineNumber(source: string, index: number) {
  return source.slice(0, index).split("\n").length;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function receiverPattern(receiver: string) {
  return receiver
    .trim()
    .split(/\s*\.\s*/)
    .map(escapeRegExp)
    .join("\\s*\\.\\s*");
}

function isNewFirstFallback(
  source: string,
  index: number,
  receiver: string,
  newProperty: string,
) {
  const lineStart = source.lastIndexOf("\n", index - 1) + 1;
  const prefix = source.slice(lineStart, index);
  const fallbackPattern = new RegExp(
    `${receiverPattern(receiver)}\\s*\\.\\s*${newProperty}\\s*\\?\\?\\s*$`,
  );

  return fallbackPattern.test(prefix);
}

function collectInvalidDeprecatedCalls(filePath: string) {
  const source = readFileSync(filePath, "utf8");
  const errors: string[] = [];

  for (const deprecatedCall of deprecatedContextCalls) {
    const callPattern = new RegExp(
      `([A-Za-z_$][\\w$]*(?:\\s*\\.\\s*[A-Za-z_$][\\w$]*)*)\\s*\\.\\s*${deprecatedCall.api}\\s*\\(\\s*\\)`,
      "g",
    );

    for (const match of source.matchAll(callPattern)) {
      const index = match.index;
      const receiver = match[1];
      const hasAllowedFallback =
        deprecatedCall.newProperty !== null &&
        typeof receiver === "string" &&
        isNewFirstFallback(
          source,
          index,
          receiver,
          deprecatedCall.newProperty,
        );

      if (hasAllowedFallback) {
        continue;
      }

      const relativePath = path.relative(path.dirname(srcDirectory), filePath);
      const lineNumber = getLineNumber(source, index);
      errors.push(
        `${relativePath}:${lineNumber}: context.${deprecatedCall.api}() requiere fallback nuevo-primero o reemplazo por API nueva.`,
      );
    }
  }

  return errors;
}

describe("APIs deprecadas de ESLint context", () => {
  it("no usa context.getX crudo en src", () => {
    const invalidCalls = collectTypeScriptFiles(srcDirectory).flatMap(
      collectInvalidDeprecatedCalls,
    );

    expect(invalidCalls).toEqual([]);
  });
});
