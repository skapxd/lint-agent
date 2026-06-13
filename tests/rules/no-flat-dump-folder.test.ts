import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdtempSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getDomainSuggestion } from "../../src/utils/dump-folders/get-domain-suggestion";
import { extractContentSignature } from "../../src/utils/dump-folders/extract-content-signature";
import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

const rootPath = mkdtempSync(join(tmpdir(), "no-flat-dump-folder-"));
const sourcePath = join(rootPath, "src");
const utilsPath = join(sourcePath, "utils");
const helpersPath = join(sourcePath, "helpers");
const rulesPath = join(sourcePath, "rules");

mkdirSync(join(utilsPath, "result"), { recursive: true });
mkdirSync(join(utilsPath, "ast"), { recursive: true });
mkdirSync(join(helpersPath, "formatting"), { recursive: true });
mkdirSync(rulesPath, { recursive: true });

writeFileSync(
  join(utilsPath, "result", "unwrap-result.ts"),
  'import { Result } from "@skapxd/result";\nexport function unwrapResult(result: Result.Result<unknown, Error>) { return result; }\n',
);
writeFileSync(
  join(utilsPath, "ast", "is-if-statement.ts"),
  'export function isIfStatement(node: { type: string }) { return node.type === "IfStatement"; }\n',
);
writeFileSync(
  join(helpersPath, "formatting", "format-date.ts"),
  'export function formatDate(value: Date) { return value.toISOString(); }\n',
);
writeFileSync(join(utilsPath, "result-helper.ts"), "export {};\n");
writeFileSync(join(utilsPath, "mute-helper.ts"), "export {};\n");
writeFileSync(join(helpersPath, "format.ts"), "export {};\n");
writeFileSync(join(utilsPath, "index.ts"), "export {};\n");
writeFileSync(join(utilsPath, "allowed-helper.ts"), "export {};\n");
writeFileSync(join(rulesPath, "no-foo.ts"), "export {};\n");

createRuleTester().run(
  "no-flat-dump-folder",
  rules["no-flat-dump-folder"]!,
  {
    invalid: [
      {
        code: 'import { Result } from "@skapxd/result";\nexport const value = Result.ok(1);\n',
        errors: [{ messageId: "flatDumpFolder" }],
        filename: join(utilsPath, "result-helper.ts"),
      },
      {
        code: "export const value = 1;\n",
        errors: [{ messageId: "flatDumpFolder" }],
        filename: join(helpersPath, "format.ts"),
      },
      {
        code: "export {};\n",
        errors: [{ messageId: "flatDumpFolder" }],
        filename: join(utilsPath, "mute-helper.ts"),
      },
    ],
    valid: [
      {
        code: 'import { Result } from "@skapxd/result";\nexport const value = Result.ok(1);\n',
        filename: join(utilsPath, "result", "new-result-helper.ts"),
      },
      {
        code: "export const rule = true;\n",
        filename: join(rulesPath, "no-foo.ts"),
      },
      {
        code: "export * from './result/unwrap-result';\n",
        filename: join(utilsPath, "index.ts"),
      },
      {
        code: "export const value = 1;\n",
        filename: join(utilsPath, "allowed-helper.ts"),
        options: [{ allowFilePatterns: ["**/allowed-helper.ts"] }],
      },
    ],
  },
);

describe("no-flat-dump-folder content suggestions", () => {
  it("suggests the domain that shares content signals", () => {
    const fileSignature = extractContentSignature(
      'import { Result } from "@skapxd/result";\nconst result = Result.ok(1);\nresult.ok; result.ok; result.ok;\n',
    );
    const domainSignature = extractContentSignature(
      'import { Result } from "@skapxd/result";\nconst result = Result.err(new Error());\nresult.ok; result.ok; result.ok;\n',
    );

    const suggestion = getDomainSuggestion(fileSignature, {
      directSourceFileNames: ["result-helper.ts"],
      domainNames: ["result"],
      domainSignatures: new Map([["result", domainSignature]]),
    });

    expect(suggestion.suggestedDomain).toBe("result");
    expect(suggestion.message).toContain("se parecen a `result/`");
  });

  it("falls back when the file has no content signals", () => {
    const suggestion = getDomainSuggestion(extractContentSignature("export {};\n"), {
      directSourceFileNames: ["mute-helper.ts"],
      domainNames: ["result"],
      domainSignatures: new Map([
        [
          "result",
          extractContentSignature('import { Result } from "@skapxd/result";\n'),
        ],
      ]),
    });

    expect(suggestion.suggestedDomain).toBeNull();
    expect(suggestion.message).toContain("No encontre senales");
  });
});
