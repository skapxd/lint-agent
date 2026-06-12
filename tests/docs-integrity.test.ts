import { readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { rules } from "#/shared/rules";

const PROJECT_ROOT = fileURLToPath(new URL("..", import.meta.url));
const RULES_DOCS_DIR = join(PROJECT_ROOT, "docs", "reglas");
const GITHUB_DOCS_URL =
  "https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas";

function readProjectFile(...pathSegments: string[]): string {
  return readFileSync(join(PROJECT_ROOT, ...pathSegments), "utf8");
}

function getRegisteredRuleNames(): string[] {
  return Object.keys(rules).sort();
}

function getDocumentedRuleNames(): string[] {
  return readdirSync(RULES_DOCS_DIR)
    .filter((fileName) => fileName.endsWith(".md") && fileName !== "README.md")
    .map((fileName) => basename(fileName, ".md"))
    .sort();
}

describe("docs integrity", () => {
  it("keeps the package README short", () => {
    const readme = readProjectFile("README.md");

    expect(readme.split("\n").length).toBeLessThanOrEqual(300);
  });

  it("keeps one rule doc per registered rule and no orphan docs", () => {
    expect(getDocumentedRuleNames()).toEqual(getRegisteredRuleNames());
  });

  it("links every registered rule from README and docs index", () => {
    const readme = readProjectFile("README.md");
    const ruleIndex = readProjectFile("docs", "reglas", "README.md");

    for (const ruleName of getRegisteredRuleNames()) {
      expect(readme).toContain(
        `[\`skapxd/${ruleName}\`](${GITHUB_DOCS_URL}/${ruleName}.md)`,
      );
      expect(ruleIndex).toContain(`[\`skapxd/${ruleName}\`](./${ruleName}.md)`);
    }
  });

  it("keeps each rule doc navigable", () => {
    for (const ruleName of getRegisteredRuleNames()) {
      const ruleDoc = readProjectFile("docs", "reglas", `${ruleName}.md`);

      expect(ruleDoc).toContain(`### \`skapxd/${ruleName}\``);
      expect(ruleDoc).toContain("[Indice de reglas](./README.md)");
      expect(ruleDoc).toContain("[README principal](../../README.md)");
    }
  });
});
