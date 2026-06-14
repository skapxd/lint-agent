import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { decode } from "@toon-format/toon";
import { beforeAll, describe, expect, it } from "vitest";
import { omitProjectServiceParseErrorResults } from "../src/utils/cli/eslint-run/omit-project-service-parse-error-results";
import { detectCliPreset } from "../src/utils/project/detect-cli-preset";
import type { ESLint } from "eslint";

const PROJECT_ROOT = fileURLToPath(new URL("..", import.meta.url));
const CLI_PATH = path.join(PROJECT_ROOT, "dist", "cli.mjs");
const ansiEscapePattern = /\x1b\[/u;

type CliJson = {
  adoption?: {
    budget: number;
    percent: number;
    seed: string;
    selectedRuleCount: number;
    selectedRules: Array<{
      affectedFileCount: number;
      ruleId: string;
      violationCount: number;
    }>;
    targetViolationCount: number;
    totalViolationCount: number;
  };
  changedFiles?: string[];
  configDeleted?: boolean;
  errorCount: number;
  files: Array<{
    filePath: string;
    messages: Array<{
      message: string;
      ruleId: string | null;
    }>;
  }>;
  mode: "changed" | "evaluate";
  omittedFileCount?: number;
  preset?: string;
  status: string;
};

function runBuild() {
  const result = spawnSync("pnpm", ["build"], {
    cwd: PROJECT_ROOT,
    encoding: "utf8",
  });

  expect(result.status, result.stderr || result.stdout).toBe(0);
}

function createTempProject(prefix: string) {
  return mkdtempSync(path.join(tmpdir(), prefix));
}

function runCli(args: string[], cwd = PROJECT_ROOT, cliPath = CLI_PATH) {
  const result = spawnSync(process.execPath, [cliPath, ...args], {
    cwd,
    encoding: "utf8",
  });
  const json = result.stdout ? (JSON.parse(result.stdout) as CliJson) : null;

  return { json, result };
}

function writeBaseFixture(projectRoot: string, source: string) {
  const sourcePath = path.join(projectRoot, "index.ts");
  writeFileSync(
    path.join(projectRoot, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        noImplicitReturns: true,
        noUncheckedIndexedAccess: true,
        strict: true,
      },
    }),
    "utf8",
  );
  writeFileSync(sourcePath, source, "utf8");

  return sourcePath;
}

function writeScopedFixture(projectRoot: string) {
  mkdirSync(path.join(projectRoot, "src"), { recursive: true });
  mkdirSync(path.join(projectRoot, "tests"), { recursive: true });
  mkdirSync(path.join(projectRoot, "fixtures"), { recursive: true });
  writeFileSync(
    path.join(projectRoot, "tsconfig.json"),
    JSON.stringify({
      include: ["src/**/*.ts", "tests/**/*.ts"],
      compilerOptions: {
        noImplicitReturns: true,
        noUncheckedIndexedAccess: true,
        strict: true,
      },
    }),
    "utf8",
  );
  writeFileSync(
    path.join(projectRoot, "src", "index.ts"),
    "const value = 1;\nconsole.log(value);\n",
    "utf8",
  );
  writeFileSync(
    path.join(projectRoot, "vitest.config.ts"),
    "export default { test: { globals: true } };\n",
    "utf8",
  );
  writeFileSync(
    path.join(projectRoot, "tests", "bad.test.ts"),
    "const enabled = true;\nif (enabled) {\n  console.log(enabled);\n} else {\n  console.log(false);\n}\n",
    "utf8",
  );
  writeFileSync(
    path.join(projectRoot, "fixtures", "bad.ts"),
    "const enabled = true;\nif (enabled) {\n  console.log(enabled);\n} else {\n  console.log(false);\n}\n",
    "utf8",
  );
}

function writeAdoptionFixture(projectRoot: string) {
  writeBaseFixture(
    projectRoot,
    "const outer = Boolean(process.env.OUTER);\nconst inner = Boolean(process.env.INNER);\nif (outer) {\n  if (inner) {\n    console.log(inner);\n  }\n}\n",
  );
  writeFileSync(
    path.join(projectRoot, "other.ts"),
    "const enabled = Boolean(process.env.ENABLED);\nif (enabled) {\n  console.log(enabled);\n} else {\n  console.log(false);\n}\n",
    "utf8",
  );
}

function listProjectFiles(projectRoot: string) {
  return readdirSync(projectRoot).sort();
}

function runGit(args: string[], cwd: string) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
  });

  expect(result.status, result.stderr || result.stdout).toBe(0);
}

function includesReportedPath(filePaths: string[], suffix: string) {
  return filePaths.some((filePath) => filePath.endsWith(suffix));
}

beforeAll(() => {
  runBuild();
}, 30000);

describe("detectCliPreset", () => {
  it("detecta cada senal y cae a base por defecto", () => {
    const baseRoot = createTempProject("skapxd-cli-base-");
    const nestRoot = createTempProject("skapxd-cli-nest-");
    const nextRoot = createTempProject("skapxd-cli-next-");
    const astroRoot = createTempProject("skapxd-cli-astro-");
    const packageRoot = createTempProject("skapxd-cli-package-");

    writeFileSync(path.join(nestRoot, "nest-cli.json"), "{}", "utf8");
    writeFileSync(path.join(nextRoot, "next.config.mjs"), "export default {};\n", "utf8");
    writeFileSync(path.join(astroRoot, "astro.config.mjs"), "export default {};\n", "utf8");
    writeFileSync(
      path.join(packageRoot, "package.json"),
      JSON.stringify({ exports: { ".": "./index.js" } }),
      "utf8",
    );

    expect(detectCliPreset(nestRoot)).toBe("nest");
    expect(detectCliPreset(nextRoot)).toBe("next");
    expect(detectCliPreset(astroRoot)).toBe("astro");
    expect(detectCliPreset(packageRoot)).toBe("package");
    expect(detectCliPreset(baseRoot)).toBe("base");
  });
});

describe("skapxd-lint", () => {
  it("falla rapido en no-interactivo cuando falta path", () => {
    const result = spawnSync(process.execPath, [CLI_PATH, "--yes"], {
      cwd: PROJECT_ROOT,
      encoding: "utf8",
    });

    expect(result.status).toBe(2);
    expect(result.stdout).toContain("1 errors | 1 files | preset none");
    expect(result.stdout).toContain("Falta <path>");
  });

  it("emite JSON y exit code 1 cuando hay hallazgos", () => {
    const projectRoot = createTempProject("skapxd-cli-findings-");
    writeBaseFixture(
      projectRoot,
      "const enabled = true;\nif (enabled) {\n  console.log(enabled);\n} else {\n  console.log(false);\n}\n",
    );

    const { json, result } = runCli([
      projectRoot,
      "--preset",
      "base",
      "--yes",
      "--format",
      "json",
    ]);

    expect(result.status).toBe(1);
    expect(json?.status).toBe("findings");
    expect(json?.mode).toBe("evaluate");
    expect(json?.preset).toBe("base");
    expect(json?.files[0]?.messages.some((message) => message.message.length > 0)).toBe(
      true,
    );
  });

  it("no contamina el JSON no-interactivo con codigos ANSI", () => {
    const projectRoot = createTempProject("skapxd-cli-json-no-ansi-");
    writeBaseFixture(
      projectRoot,
      "const enabled = true;\nif (enabled) {\n  console.log(enabled);\n} else {\n  console.log(false);\n}\n",
    );

    const result = spawnSync(
      process.execPath,
      [CLI_PATH, projectRoot, "--preset", "base", "--yes", "--format", "json"],
      {
        cwd: PROJECT_ROOT,
        encoding: "utf8",
        env: { ...process.env, FORCE_COLOR: "1" },
      },
    );

    expect(result.status).toBe(1);
    expect(result.stdout).not.toMatch(ansiEscapePattern);
    expect(JSON.parse(result.stdout)).toMatchObject({ status: "findings" });
  });

  it("emite salida compacta por defecto en no-interactivo", () => {
    const projectRoot = createTempProject("skapxd-cli-compact-");
    writeBaseFixture(
      projectRoot,
      "const enabled = true;\nif (enabled) {\n  console.log(enabled);\n} else {\n  console.log(false);\n}\n",
    );

    const result = spawnSync(
      process.execPath,
      [CLI_PATH, projectRoot, "--preset", "base", "--yes"],
      {
        cwd: PROJECT_ROOT,
        encoding: "utf8",
        env: { ...process.env, FORCE_COLOR: "1" },
      },
    );
    const explicitResult = spawnSync(
      process.execPath,
      [CLI_PATH, projectRoot, "--preset", "base", "--yes", "--format", "compact"],
      {
        cwd: PROJECT_ROOT,
        encoding: "utf8",
        env: { ...process.env, FORCE_COLOR: "1" },
      },
    );

    expect(result.status).toBe(1);
    expect(explicitResult.status).toBe(1);
    expect(result.stdout).not.toMatch(ansiEscapePattern);
    expect(explicitResult.stdout).not.toMatch(ansiEscapePattern);
    expect(result.stdout).toContain("errors |");
    expect(result.stdout).toContain("files | preset base");
    expect(result.stdout).toContain("index.ts");
    expect(result.stdout).toContain("skapxd/no-else");
    expect(result.stdout).not.toContain("errorCount:");
    expect(result.stdout).not.toContain("{");
    expect(explicitResult.stdout).toBe(result.stdout);
  });

  it("emite TOON compacto cuando se pide --format toon", () => {
    const projectRoot = createTempProject("skapxd-cli-toon-");
    writeBaseFixture(
      projectRoot,
      "const enabled = true;\nif (enabled) {\n  console.log(enabled);\n} else {\n  console.log(false);\n}\n",
    );

    const result = spawnSync(
      process.execPath,
      [CLI_PATH, projectRoot, "--preset", "base", "--yes", "--format", "toon"],
      {
        cwd: PROJECT_ROOT,
        encoding: "utf8",
        env: { ...process.env, FORCE_COLOR: "1" },
      },
    );
    const toon = decode(result.stdout);

    expect(result.status).toBe(1);
    expect(result.stdout).not.toMatch(ansiEscapePattern);
    expect(result.stdout).toContain("messages[");
    expect(result.stdout).toContain("findings[");
    expect(result.stdout).not.toContain("errorCount:");
    expect(toon).toMatchObject({
      errors: expect.any(Number),
      findings: expect.any(Array),
      messages: expect.any(Array),
      mode: "evaluate",
      preset: "base",
      status: "findings",
    });
  });

  it("emite JSON y exit code 0 cuando no hay hallazgos", () => {
    const projectRoot = createTempProject("skapxd-cli-clean-");
    writeBaseFixture(projectRoot, "const value = 1;\nconsole.log(value);\n");

    const { json, result } = runCli([
      projectRoot,
      "--preset",
      "base",
      "--yes",
      "--format",
      "json",
    ]);

    expect(result.status).toBe(0);
    expect(json?.status).toBe("ok");
    expect(json?.errorCount).toBe(0);
  });

  it("--adopt selecciona reglas en orden determinista y emite seed estable", () => {
    const projectRoot = createTempProject("skapxd-cli-adopt-");
    writeAdoptionFixture(projectRoot);

    const firstRun = runCli([
      projectRoot,
      "--preset",
      "base",
      "--yes",
      "--format",
      "json",
      "--adopt",
      "50",
    ]);
    const secondRun = runCli([
      projectRoot,
      "--preset",
      "base",
      "--yes",
      "--format",
      "json",
      "--adopt",
      "50",
    ]);

    expect(firstRun.result.status).toBe(1);
    expect(firstRun.json?.mode).toBe("adopt");
    expect(firstRun.json?.adoption?.percent).toBe(50);
    expect(firstRun.json?.adoption?.budget).toBe(1);
    expect(firstRun.json?.adoption?.selectedRules).toEqual([
      {
        affectedFileCount: 1,
        ruleId: "skapxd/no-else",
        violationCount: 1,
      },
    ]);
    expect(firstRun.json?.adoption?.seed).toBe(secondRun.json?.adoption?.seed);
    expect(firstRun.json?.files).toHaveLength(1);
    expect(firstRun.json?.files[0]?.messages.every(
      (message) => message.ruleId === "skapxd/no-else",
    )).toBe(true);
  });

  it("--adopt incluye la regla mas facil aunque no quepa en el porcentaje", () => {
    const projectRoot = createTempProject("skapxd-cli-adopt-minimum-");
    writeAdoptionFixture(projectRoot);

    const { json, result } = runCli([
      projectRoot,
      "--preset",
      "base",
      "--yes",
      "--format",
      "json",
      "--adopt",
      "1",
    ]);

    expect(result.status).toBe(1);
    expect(json?.adoption?.budget).toBe(0);
    expect(json?.adoption?.targetViolationCount).toBe(1);
    expect(json?.adoption?.selectedRules[0]?.ruleId).toBe("skapxd/no-else");
  });

  it("--adopt valida el porcentaje con mensaje claro", () => {
    const result = spawnSync(process.execPath, [CLI_PATH, ".", "--yes", "--adopt", "0.1"], {
      cwd: PROJECT_ROOT,
      encoding: "utf8",
    });

    expect(result.status).toBe(2);
    expect(result.stdout).toContain("--adopt <percent>");
    expect(result.stdout).toContain("entero entre 0 y 100");
    expect(result.stdout).toContain("recibi 0.1");
  });

  it("ignora configs, tests y fixtures por default en evaluacion efimera", () => {
    const projectRoot = createTempProject("skapxd-cli-default-ignores-");
    writeScopedFixture(projectRoot);

    const { json, result } = runCli([
      projectRoot,
      "--preset",
      "base",
      "--yes",
      "--format",
      "json",
    ]);

    expect(result.status).toBe(0);
    expect(json?.errorCount).toBe(0);
    expect(json?.omittedFileCount).toBe(0);
    const reportedFiles = json?.files.map((file) => file.filePath) ?? [];

    expect(reportedFiles).toHaveLength(1);
    expect(includesReportedPath(reportedFiles, path.join("src", "index.ts"))).toBe(
      true,
    );
  });

  it("--include-tests evalua tests sin incluir configs ni fixtures", () => {
    const projectRoot = createTempProject("skapxd-cli-include-tests-");
    writeScopedFixture(projectRoot);

    const { json, result } = runCli([
      projectRoot,
      "--preset",
      "base",
      "--yes",
      "--format",
      "json",
      "--include-tests",
    ]);
    const reportedFiles = json?.files.map((file) => file.filePath) ?? [];

    expect(result.status).toBe(1);
    expect(includesReportedPath(reportedFiles, path.join("src", "index.ts"))).toBe(
      true,
    );
    expect(
      includesReportedPath(reportedFiles, path.join("tests", "bad.test.ts")),
    ).toBe(true);
    expect(includesReportedPath(reportedFiles, "vitest.config.ts")).toBe(false);
    expect(includesReportedPath(reportedFiles, path.join("fixtures", "bad.ts"))).toBe(
      false,
    );
    expect(
      json?.files
        .find((file) => file.filePath.endsWith(path.join("tests", "bad.test.ts")))
        ?.messages.some((message) => message.ruleId === "skapxd/no-else"),
    ).toBe(true);
  });

  it("omite parse errors residuales fuera del tsconfig sin contarlos como hallazgos", () => {
    const results: ESLint.LintResult[] = [
      {
        errorCount: 1,
        fatalErrorCount: 1,
        filePath: "/repo/scripts/task.ts",
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        messages: [
          {
            column: 0,
            fatal: true,
            line: 0,
            message:
              "Parsing error: /repo/scripts/task.ts was not found by the project service.",
            ruleId: null,
            severity: 2,
          },
        ],
        suppressedMessages: [],
        usedDeprecatedRules: [],
        warningCount: 0,
      },
      {
        errorCount: 0,
        fatalErrorCount: 0,
        filePath: "/repo/src/index.ts",
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        messages: [],
        suppressedMessages: [],
        usedDeprecatedRules: [],
        warningCount: 0,
      },
    ];

    const filtered = omitProjectServiceParseErrorResults(results);

    expect(filtered.omittedFileCount).toBe(1);
    expect(filtered.results).toHaveLength(1);
    expect(filtered.results[0]?.filePath).toBe("/repo/src/index.ts");
  });

  it("expone parse errors residuales como omitidos en el CLI", () => {
    const { json, result } = runCli([
      PROJECT_ROOT,
      "--preset",
      "package",
      "--yes",
      "--format",
      "json",
    ]);

    expect(result.status).toBe(1);
    expect(json?.omittedFileCount).toBeGreaterThan(0);
    expect(JSON.stringify(json?.files ?? [])).not.toContain(
      "was not found by the project service",
    );
  });

  it("no reporta configs, tests, fixtures ni parse errors del propio repo", () => {
    const { json } = runCli([
      PROJECT_ROOT,
      "--preset",
      "package",
      "--yes",
      "--format",
      "json",
    ]);
    const reportedPaths = json?.files.map((file) => file.filePath) ?? [];
    const messages = JSON.stringify(json?.files ?? []);

    expect(includesReportedPath(reportedPaths, "eslint.config.ts")).toBe(false);
    expect(
      reportedPaths.some((filePath) => filePath.includes(`${path.sep}tests${path.sep}`)),
    ).toBe(false);
    expect(
      reportedPaths.some((filePath) =>
        filePath.includes(`${path.sep}fixtures${path.sep}`),
      ),
    ).toBe(false);
    expect(messages).not.toContain("was not found by the project service");
  });

  it("evalua con config efimero y no deja archivos temporales", () => {
    const projectRoot = createTempProject("skapxd-cli-ephemeral-");
    writeBaseFixture(
      projectRoot,
      "const enabled = true;\nif (enabled) {\n  console.log(enabled);\n} else {\n  console.log(false);\n}\n",
    );
    const beforeFiles = listProjectFiles(projectRoot);

    const { json, result } = runCli([
      projectRoot,
      "--preset",
      "base",
      "--yes",
      "--format",
      "json",
    ]);
    const afterFiles = listProjectFiles(projectRoot);

    expect(result.status).toBe(1);
    expect(json?.configDeleted).toBe(true);
    expect(afterFiles).toEqual(beforeFiles);
    expect(afterFiles.some((file) => file.startsWith(".tmp-skapxd-lint-"))).toBe(false);
  });

  it("documenta flags con placeholders en help", () => {
    const result = spawnSync(process.execPath, [CLI_PATH, "--help"], {
      cwd: PROJECT_ROOT,
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("skapxd-lint <path>");
    expect(result.stdout).toContain("--preset <name>");
    expect(result.stdout).toContain("--adopt <percent>");
    expect(result.stdout).toContain("--base <git-ref>");
    expect(result.stdout).toContain("--format <json|compact|toon>");
    expect(result.stdout).toContain("--include-tests");
    expect(result.stdout).toContain("--no-interactive");
    expect(result.stdout).toContain("Exit codes:");
    expect(result.stdout).toContain("Ignorados en evaluacion efimera:");
    expect(result.stdout).toContain("Adopcion incremental:");
    expect(result.stdout).toContain("Tests: ignorados por default; usa --include-tests");
    expect(result.stdout).toContain("--format compact: lectura humana;");
    expect(result.stdout).toContain("Para agentes:");
    expect(result.stdout).toContain("Prefiere --format toon");
    expect(result.stdout).toContain("No dependas del default (compact): no es parseable");
    expect(result.stdout).not.toContain("lectura humana/agente");
    expect(result.stdout).not.toContain("Agente:  skapxd-lint . --preset package --yes --format compact");
  });

  it("usa clack para el prompt interactivo, no readline", () => {
    const promptSource = readFileSync(
      path.join(
        PROJECT_ROOT,
        "src",
        "utils",
        "cli",
        "output",
        "interactive",
        "prompt-for-path.ts",
      ),
      "utf8",
    );

    expect(promptSource).toContain("@clack/prompts");
    expect(promptSource).not.toContain("node:readline");
  });

  it("--changed y el alias legacy devuelven el mismo resultado", () => {
    const projectRoot = createTempProject("skapxd-cli-changed-");
    const aliasPath = path.join(projectRoot, "skapxd-lint-changed");

    writeFileSync(
      path.join(projectRoot, "eslint.config.mjs"),
      "export default [{ files: ['**/*.js'], rules: { 'no-undef': 'error' } }];\n",
      "utf8",
    );
    runGit(["init"], projectRoot);
    runGit(["config", "user.email", "codex@example.com"], projectRoot);
    runGit(["config", "user.name", "Codex"], projectRoot);
    runGit(["add", "eslint.config.mjs"], projectRoot);
    runGit(["commit", "-m", "initial"], projectRoot);
    writeFileSync(path.join(projectRoot, "bad.js"), "missingReference;\n", "utf8");
    symlinkSync(CLI_PATH, aliasPath);

    const changed = runCli(["--changed", "--yes", "--format", "json"], projectRoot);
    const alias = runCli(["--yes", "--format", "json"], projectRoot, aliasPath);

    expect(changed.result.status).toBe(1);
    expect(alias.result.status).toBe(1);
    expect(changed.json?.status).toBe("findings");
    expect(alias.json?.status).toBe("findings");
    expect(alias.json?.errorCount).toBe(changed.json?.errorCount);
    expect(alias.json?.changedFiles?.map((file) => path.basename(file))).toEqual(
      changed.json?.changedFiles?.map((file) => path.basename(file)),
    );
    expect(existsSync(aliasPath)).toBe(true);
  });
});
