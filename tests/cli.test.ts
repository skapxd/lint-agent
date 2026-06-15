import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { decode } from "@toon-format/toon";
import { beforeAll, describe, expect, it } from "vitest";
import { createAdoptionOutput } from "../src/utils/cli/adoption/create-adoption-output";
import { decodeAdoptionSeed } from "../src/utils/cli/adoption/decode-adoption-seed";
import { createEphemeralConfigContent } from "../src/utils/cli/eslint-run/create-ephemeral-config-content";
import { getUnsupportedNodeVersionMessage } from "../src/utils/cli/env/get-unsupported-node-version-message";
import { omitProjectServiceParseErrorResults } from "../src/utils/cli/eslint-run/omit-project-service-parse-error-results";
import { detectCliPreset } from "../src/utils/project/detect-cli-preset";
import type { SkapxdLintOutput } from "../src/utils/cli/types";
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
      fatal?: boolean;
      message: string;
      ruleId: string | null;
      severity: number;
    }>;
  }>;
  mode: "adopt" | "changed" | "evaluate" | "state" | "verify";
  omittedFileCount?: number;
  preset?: string;
  state?: {
    action: "reset";
    statePath: string;
  };
  status: string;
  verification?: {
    completed: boolean;
    fixedRuleCount: number;
    fixedRules: string[];
    outsideViolationCount: number;
    remainingRuleCount: number;
    remainingRules: Array<{
      affectedFileCount: number;
      ruleId: string;
      violationCount: number;
    }>;
    remainingViolationCount: number;
    seed: string;
    targetRules: string[];
  };
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

function runCli(
  args: string[],
  cwd = PROJECT_ROOT,
  cliPath = CLI_PATH,
  env: NodeJS.ProcessEnv = process.env,
) {
  const result = spawnSync(process.execPath, [cliPath, ...args], {
    cwd,
    encoding: "utf8",
    env,
  });
  const json = result.stdout ? (JSON.parse(result.stdout) as CliJson) : null;

  return { json, result };
}

function runCliRaw(
  args: string[],
  cwd = PROJECT_ROOT,
  cliPath = CLI_PATH,
  env: NodeJS.ProcessEnv = process.env,
) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd,
    encoding: "utf8",
    env,
  });
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
  const indexPath = writeBaseFixture(
    projectRoot,
    "const outer = Boolean(process.env.OUTER);\nconst inner = Boolean(process.env.INNER);\nif (outer) {\n  if (inner) {\n    console.log(inner);\n  }\n}\n",
  );
  const otherPath = path.join(projectRoot, "other.ts");

  writeFileSync(
    otherPath,
    "const enabled = Boolean(process.env.ENABLED);\nif (enabled) {\n  console.log(enabled);\n} else {\n  console.log(false);\n}\n",
    "utf8",
  );

  return { indexPath, otherPath };
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

function createCacheEnv(cacheRoot: string) {
  return {
    ...process.env,
    XDG_CACHE_HOME: cacheRoot,
  };
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

  it("--output escribe JSON al archivo y deja solo resumen en stdout", () => {
    const projectRoot = createTempProject("skapxd-cli-output-json-");
    const outputPath = "report.json";
    writeBaseFixture(
      projectRoot,
      "const enabled = true;\nif (enabled) {\n  console.log(enabled);\n} else {\n  console.log(false);\n}\n",
    );

    const result = runCliRaw([
      ".",
      "--preset",
      "base",
      "--yes",
      "--format",
      "json",
      "--output",
      outputPath,
    ], projectRoot);
    const report = JSON.parse(readFileSync(path.join(projectRoot, outputPath), "utf8")) as CliJson;

    expect(result.status).toBe(1);
    expect(report.status).toBe("findings");
    expect(report.mode).toBe("evaluate");
    expect(result.stdout).toContain("errors |");
    expect(result.stdout).toContain(`files | preset base → salida en ${outputPath}`);
    expect(result.stdout).not.toContain('"files"');
    expect(result.stdout).not.toContain("skapxd/no-else");
  });

  it("--output escribe TOON al archivo y deja solo resumen en stdout", () => {
    const projectRoot = createTempProject("skapxd-cli-output-toon-");
    const outputPath = "report.toon";
    writeBaseFixture(
      projectRoot,
      "const enabled = true;\nif (enabled) {\n  console.log(enabled);\n} else {\n  console.log(false);\n}\n",
    );

    const result = runCliRaw([
      ".",
      "--preset",
      "base",
      "--yes",
      "--format",
      "toon",
      "--output",
      outputPath,
    ], projectRoot);
    const report = readFileSync(path.join(projectRoot, outputPath), "utf8");
    const toon = decode(report);

    expect(result.status).toBe(1);
    expect(toon).toMatchObject({
      mode: "evaluate",
      preset: "base",
      status: "findings",
    });
    expect(result.stdout).toContain(`files | preset base → salida en ${outputPath}`);
    expect(result.stdout).not.toContain("messages[");
    expect(result.stdout).not.toContain("skapxd/no-else");
  });

  it("--output escribe compact al archivo y deja solo resumen en stdout", () => {
    const projectRoot = createTempProject("skapxd-cli-output-compact-");
    const outputPath = "report.txt";
    writeBaseFixture(
      projectRoot,
      "const enabled = true;\nif (enabled) {\n  console.log(enabled);\n} else {\n  console.log(false);\n}\n",
    );

    const result = runCliRaw([
      ".",
      "--preset",
      "base",
      "--yes",
      "--format",
      "compact",
      "--output",
      outputPath,
    ], projectRoot);
    const report = readFileSync(path.join(projectRoot, outputPath), "utf8");

    expect(result.status).toBe(1);
    expect(report).toContain("files | preset base");
    expect(report).toContain("index.ts");
    expect(report).toContain("skapxd/no-else");
    expect(result.stdout).toContain(`files | preset base → salida en ${outputPath}`);
    expect(result.stdout).not.toContain("index.ts");
    expect(result.stdout).not.toContain("skapxd/no-else");
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

  it("--output funciona con --adopt", () => {
    const projectRoot = createTempProject("skapxd-cli-output-adopt-");
    const outputPath = "adopt.json";
    writeAdoptionFixture(projectRoot);

    const result = runCliRaw([
      ".",
      "--preset",
      "base",
      "--yes",
      "--format",
      "json",
      "--adopt",
      "50",
      "--output",
      outputPath,
    ], projectRoot);
    const report = JSON.parse(readFileSync(path.join(projectRoot, outputPath), "utf8")) as CliJson;

    expect(result.status).toBe(1);
    expect(report.mode).toBe("adopt");
    expect(report.adoption?.percent).toBe(50);
    expect(report.adoption?.selectedRules).toEqual([
      {
        affectedFileCount: 1,
        ruleId: "skapxd/no-else",
        violationCount: 1,
      },
    ]);
    expect(result.stdout).toContain(`files | preset base → salida en ${outputPath}`);
    expect(result.stdout).not.toContain('"adoption"');
  });

  it("--output falla con exit 2 cuando el directorio no existe", () => {
    const projectRoot = createTempProject("skapxd-cli-output-missing-dir-");
    const outputPath = path.join("missing", "report.json");
    writeBaseFixture(
      projectRoot,
      "const enabled = true;\nif (enabled) {\n  console.log(enabled);\n} else {\n  console.log(false);\n}\n",
    );

    const result = runCliRaw([
      ".",
      "--preset",
      "base",
      "--yes",
      "--format",
      "json",
      "--output",
      outputPath,
    ], projectRoot);

    expect(result.status).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain(`skapxd-lint no pudo escribir la salida en ${outputPath}.`);
    expect(result.stderr).toContain("el directorio");
    expect(result.stderr).toContain("no existe");
  });

  it("--adopt no convierte errores de configuracion en reglas objetivo", () => {
    const evaluationOutput = {
      configDeleted: true,
      errorCount: 3,
      files: [
        {
          errorCount: 3,
          filePath: "/repo/index.ts",
          messages: [
            {
              column: 1,
              line: 1,
              message:
                "Definition for rule '@typescript-eslint/no-require-imports' was not found.",
              ruleId: "@typescript-eslint/no-require-imports",
              severity: 2,
            },
            {
              column: 0,
              fatal: true,
              line: 0,
              message: "Parsing error: token inesperado.",
              ruleId: null,
              severity: 2,
            },
            {
              column: 1,
              line: 2,
              message: "Evita else: retorna temprano.",
              ruleId: "skapxd/no-else",
              severity: 2,
            },
          ],
          warningCount: 0,
        },
      ],
      mode: "evaluate",
      preset: "base",
      status: "findings",
      targetPath: "/repo",
      warningCount: 0,
    } satisfies SkapxdLintOutput;

    const output = createAdoptionOutput(evaluationOutput, 100);
    const seedPayload = decodeAdoptionSeed(output.adoption.seed);

    expect(output.adoption.selectedRules).toEqual([
      {
        affectedFileCount: 1,
        ruleId: "skapxd/no-else",
        violationCount: 1,
      },
    ]);
    expect(seedPayload.rules).toEqual(["skapxd/no-else"]);
    expect(output.adoption.totalViolationCount).toBe(1);
    expect(output.files[0]?.messages).toEqual([
      expect.objectContaining({ ruleId: "skapxd/no-else" }),
    ]);
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

  it("--verify cierra la seed y reporta errores fuera del objetivo como info", () => {
    const projectRoot = createTempProject("skapxd-cli-verify-");
    const fixture = writeAdoptionFixture(projectRoot);
    const adoption = runCli([
      projectRoot,
      "--preset",
      "base",
      "--yes",
      "--format",
      "json",
      "--adopt",
      "1",
    ]);
    const seed = adoption.json?.adoption?.seed;

    expect(seed).toEqual(expect.stringMatching(/^skapxd1\./u));

    writeFileSync(
      fixture.otherPath,
      "const enabled = Boolean(process.env.ENABLED);\nif (enabled) {\n  console.log(enabled);\n}\n",
      "utf8",
    );
    writeFileSync(
      fixture.indexPath,
      "const outer = Boolean(process.env.OUTER);\nconst inner = Boolean(process.env.INNER);\nif (outer) {\n  if (inner) {\n    console.log(inner);\n  }\n}\nexport default outer;\n",
      "utf8",
    );

    const verification = runCli([
      projectRoot,
      "--preset",
      "base",
      "--yes",
      "--format",
      "json",
      "--verify",
      seed ?? "",
    ]);

    expect(verification.result.status).toBe(0);
    expect(verification.json?.mode).toBe("verify");
    expect(verification.json?.status).toBe("ok");
    expect(verification.json?.verification).toMatchObject({
      completed: true,
      fixedRuleCount: 1,
      outsideViolationCount: expect.any(Number),
      remainingRuleCount: 0,
      remainingViolationCount: 0,
      seed,
      targetRules: ["skapxd/no-else"],
    });
    expect(verification.json?.verification?.outsideViolationCount).toBeGreaterThan(0);
    expect(verification.json?.files).toEqual([]);
  });

  it("--verify reporta restantes solo del conjunto objetivo", () => {
    const projectRoot = createTempProject("skapxd-cli-verify-pending-");
    writeAdoptionFixture(projectRoot);
    const adoption = runCli([
      projectRoot,
      "--preset",
      "base",
      "--yes",
      "--format",
      "json",
      "--adopt",
      "1",
    ]);
    const seed = adoption.json?.adoption?.seed ?? "";

    const verification = runCli([
      projectRoot,
      "--preset",
      "base",
      "--yes",
      "--format",
      "json",
      "--verify",
      seed,
    ]);

    expect(verification.result.status).toBe(1);
    expect(verification.json?.mode).toBe("verify");
    expect(verification.json?.verification?.completed).toBe(false);
    expect(verification.json?.verification?.remainingRules).toEqual([
      {
        affectedFileCount: 1,
        ruleId: "skapxd/no-else",
        violationCount: 1,
      },
    ]);
    expect(verification.json?.files.every((file) =>
      file.messages.every((message) => message.ruleId === "skapxd/no-else"),
    )).toBe(true);
  });

  it("persiste el lote por repo y --resume-last lo usa explicitamente", () => {
    const projectRoot = createTempProject("skapxd-cli-state-");
    const cacheRoot = createTempProject("skapxd-cli-cache-");
    const env = createCacheEnv(cacheRoot);
    writeAdoptionFixture(projectRoot);
    runGit(["init"], projectRoot);

    const adoption = runCli([
      projectRoot,
      "--preset",
      "base",
      "--yes",
      "--format",
      "json",
      "--adopt",
      "1",
    ], PROJECT_ROOT, CLI_PATH, env);
    const seed = adoption.json?.adoption?.seed;
    const stateFiles = readdirSync(path.join(cacheRoot, "skapxd-lint"));

    expect(seed).toEqual(expect.stringMatching(/^skapxd1\./u));
    expect(stateFiles).toHaveLength(1);

    const resumed = runCli([
      projectRoot,
      "--preset",
      "base",
      "--yes",
      "--format",
      "json",
      "--resume-last",
    ], PROJECT_ROOT, CLI_PATH, env);

    expect(resumed.result.status).toBe(1);
    expect(resumed.json?.mode).toBe("verify");
    expect(resumed.json?.verification?.seed).toBe(seed);
  });

  it("el modo args ignora el estado si no se pasa --resume-last", () => {
    const projectRoot = createTempProject("skapxd-cli-state-ignore-");
    const cacheRoot = createTempProject("skapxd-cli-cache-ignore-");
    const env = createCacheEnv(cacheRoot);
    writeAdoptionFixture(projectRoot);
    runGit(["init"], projectRoot);

    runCli([
      projectRoot,
      "--preset",
      "base",
      "--yes",
      "--format",
      "json",
      "--adopt",
      "1",
    ], PROJECT_ROOT, CLI_PATH, env);

    const evaluation = runCli([
      projectRoot,
      "--preset",
      "base",
      "--yes",
      "--format",
      "json",
    ], PROJECT_ROOT, CLI_PATH, env);

    expect(evaluation.result.status).toBe(1);
    expect(evaluation.json?.mode).toBe("evaluate");
    expect(evaluation.json?.verification).toBeUndefined();
  });

  it("usa claves distintas por root y limpia el estado al completar o resetear", () => {
    const firstRoot = createTempProject("skapxd-cli-state-root-a-");
    const secondRoot = createTempProject("skapxd-cli-state-root-b-");
    const cacheRoot = createTempProject("skapxd-cli-cache-roots-");
    const env = createCacheEnv(cacheRoot);
    const firstFixture = writeAdoptionFixture(firstRoot);
    writeAdoptionFixture(secondRoot);
    runGit(["init"], firstRoot);
    runGit(["init"], secondRoot);

    const firstAdoption = runCli([
      firstRoot,
      "--preset",
      "base",
      "--yes",
      "--format",
      "json",
      "--adopt",
      "1",
    ], PROJECT_ROOT, CLI_PATH, env);
    runCli([
      secondRoot,
      "--preset",
      "base",
      "--yes",
      "--format",
      "json",
      "--adopt",
      "1",
    ], PROJECT_ROOT, CLI_PATH, env);

    expect(readdirSync(path.join(cacheRoot, "skapxd-lint"))).toHaveLength(2);

    writeFileSync(
      firstFixture.otherPath,
      "const enabled = Boolean(process.env.ENABLED);\nif (enabled) {\n  console.log(enabled);\n}\n",
      "utf8",
    );
    const completed = runCli([
      firstRoot,
      "--preset",
      "base",
      "--yes",
      "--format",
      "json",
      "--verify",
      firstAdoption.json?.adoption?.seed ?? "",
    ], PROJECT_ROOT, CLI_PATH, env);

    expect(completed.result.status).toBe(0);
    expect(readdirSync(path.join(cacheRoot, "skapxd-lint"))).toHaveLength(1);

    const reset = runCli([
      secondRoot,
      "--yes",
      "--format",
      "json",
      "--reset-state",
    ], PROJECT_ROOT, CLI_PATH, env);

    expect(reset.result.status).toBe(0);
    expect(reset.json?.state?.action).toBe("reset");
    expect(readdirSync(path.join(cacheRoot, "skapxd-lint"))).toHaveLength(0);
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

  it("el config efimero descarta reglas cuyo plugin no esta registrado", () => {
    const projectRoot = createTempProject("skapxd-cli-ephemeral-ghost-rule-");
    const pluginPath = path.join(projectRoot, "fake-plugin.mjs");
    const configPath = path.join(projectRoot, ".tmp-skapxd-lint-test.config.mjs");

    writeFileSync(path.join(projectRoot, "index.js"), "require('node:fs');\n", "utf8");
    writeFileSync(
      pluginPath,
      `export default {
  configs: {
    base: {
      plugins: { local: { rules: {} } },
      rules: { "@typescript-eslint/no-require-imports": "error" },
    },
  },
};
`,
      "utf8",
    );
    writeFileSync(
      configPath,
      createEphemeralConfigContent(pathToFileURL(pluginPath).href, "base", false),
      "utf8",
    );

    const result = spawnSync(
      process.execPath,
      [
        path.join(PROJECT_ROOT, "node_modules", "eslint", "bin", "eslint.js"),
        "--no-config-lookup",
        "--config",
        configPath,
        "--format",
        "json",
        "index.js",
      ],
      {
        cwd: projectRoot,
        encoding: "utf8",
      },
    );
    const results = JSON.parse(result.stdout) as ESLint.LintResult[];

    expect(result.status, result.stderr || result.stdout).toBe(0);
    expect(results[0]?.messages).toEqual([]);
    expect(result.stderr).not.toContain("Definition for rule");
  });

  it("el config efimero conserva reglas de plugins scoped registrados", () => {
    const projectRoot = createTempProject("skapxd-cli-ephemeral-scoped-rule-");
    const pluginPath = path.join(projectRoot, "fake-plugin.mjs");
    const configPath = path.join(projectRoot, ".tmp-skapxd-lint-test.config.mjs");

    writeFileSync(path.join(projectRoot, "index.js"), "const value = 1;\n", "utf8");
    writeFileSync(
      pluginPath,
      `export default {
  configs: {
    base: {
      plugins: {
        "@fake-scope": {
          rules: {
            ban: {
              meta: {
                type: "problem",
                schema: [],
                messages: { banned: "scoped rule survived" },
              },
              create(context) {
                return {
                  Program(node) {
                    context.report({ node, messageId: "banned" });
                  },
                };
              },
            },
          },
        },
      },
      rules: { "@fake-scope/ban": "error" },
    },
  },
};
`,
      "utf8",
    );
    writeFileSync(
      configPath,
      createEphemeralConfigContent(pathToFileURL(pluginPath).href, "base", false),
      "utf8",
    );

    const result = spawnSync(
      process.execPath,
      [
        path.join(PROJECT_ROOT, "node_modules", "eslint", "bin", "eslint.js"),
        "--no-config-lookup",
        "--config",
        configPath,
        "--format",
        "json",
        "index.js",
      ],
      {
        cwd: projectRoot,
        encoding: "utf8",
      },
    );
    const results = JSON.parse(result.stdout) as ESLint.LintResult[];

    expect(result.status, result.stderr || result.stdout).toBe(1);
    expect(results[0]?.messages).toEqual([
      expect.objectContaining({
        message: "scoped rule survived",
        ruleId: "@fake-scope/ban",
      }),
    ]);
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
    expect(result.stdout).toContain("--verify <seed>");
    expect(result.stdout).toContain("--resume-last");
    expect(result.stdout).toContain("--reset-state");
    expect(result.stdout).toContain("--base <git-ref>");
    expect(result.stdout).toContain("--format <json|compact|toon>");
    expect(result.stdout).toContain("--output <archivo>");
    expect(result.stdout).toContain("--include-tests");
    expect(result.stdout).toContain("--no-interactive");
    expect(result.stdout).toContain("Exit codes:");
    expect(result.stdout).toContain("Ignorados en evaluacion efimera:");
    expect(result.stdout).toContain("Adopcion incremental:");
    expect(result.stdout).toContain("--verify <seed> reevalua solo esas reglas");
    expect(result.stdout).toContain("Estado persistido:");
    expect(result.stdout).toContain("Args nunca dependen del estado salvo --resume-last");
    expect(result.stdout).toContain("Tests: ignorados por default; usa --include-tests");
    expect(result.stdout).toContain("--format compact: lectura humana;");
    expect(result.stdout).toContain("--output <archivo>: escribe el formato elegido en archivo");
    expect(result.stdout).toContain("Para agentes:");
    expect(result.stdout).toContain("Prefiere --format toon");
    expect(result.stdout).toContain("No dependas del default (compact): no es parseable");
    expect(result.stdout).not.toContain("lectura humana/agente");
    expect(result.stdout).not.toContain("Agente:  skapxd-lint . --preset package --yes --format compact");
  });

  it("usa clack con import diferido solo en rutas interactivas", () => {
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
    const resumePromptSource = readFileSync(
      path.join(
        PROJECT_ROOT,
        "src",
        "utils",
        "cli",
        "output",
        "interactive",
        "prompt-for-resume-last-state.ts",
      ),
      "utf8",
    );
    const interactiveRenderSource = readFileSync(
      path.join(
        PROJECT_ROOT,
        "src",
        "utils",
        "cli",
        "output",
        "interactive",
        "render-interactive-output.ts",
      ),
      "utf8",
    );
    const cliEntrypointSource = readFileSync(path.join(PROJECT_ROOT, "src", "cli.ts"), "utf8");
    const resolverSource = readFileSync(
      path.join(
        PROJECT_ROOT,
        "src",
        "utils",
        "cli",
        "state",
        "resolve-state-backed-verify-seed.ts",
      ),
      "utf8",
    );
    const staticClackImport = /from\s+["@']@clack\/prompts["@']/u;

    expect(promptSource).toContain('import("@clack/prompts")');
    expect(promptSource).not.toMatch(staticClackImport);
    expect(promptSource).not.toContain("node:readline");
    expect(interactiveRenderSource).toContain('import("@clack/prompts")');
    expect(interactiveRenderSource).not.toMatch(staticClackImport);
    expect(resumePromptSource).toContain("confirm");
    expect(resumePromptSource).toContain('import("@clack/prompts")');
    expect(resumePromptSource).not.toMatch(staticClackImport);
    expect(resolverSource).toContain("promptForResumeLastState");
    expect(cliEntrypointSource).toContain("getUnsupportedNodeVersionMessage");
    expect(cliEntrypointSource.indexOf("getUnsupportedNodeVersionMessage")).toBeLessThan(
      cliEntrypointSource.indexOf('import("#/utils/cli/commands/run-skapxd-lint")'),
    );
  });

  it("declara y valida el minimo de Node soportado", () => {
    const packageJson = JSON.parse(readFileSync(path.join(PROJECT_ROOT, "package.json"), "utf8")) as {
      engines?: { node?: string };
    };

    expect(packageJson.engines?.node).toBe(">=20.12.0");
    expect(getUnsupportedNodeVersionMessage("16.20.2")).toBe(
      "skapxd-lint requiere Node >=20.12.0; detectado v16.20.2.",
    );
    expect(getUnsupportedNodeVersionMessage("20.11.1")).toBe(
      "skapxd-lint requiere Node >=20.12.0; detectado v20.11.1.",
    );
    expect(getUnsupportedNodeVersionMessage("20.12.0")).toBeNull();
    expect(getUnsupportedNodeVersionMessage("22.14.0")).toBeNull();
  });

  it("--changed lintea solo archivos modificados por git", () => {
    const projectRoot = createTempProject("skapxd-cli-changed-");

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

    const changed = runCli(["--changed", "--yes", "--format", "json"], projectRoot);

    expect(changed.result.status).toBe(1);
    expect(changed.json?.status).toBe("findings");
    expect(changed.json?.errorCount).toBe(1);
    expect(changed.json?.changedFiles?.map((file) => path.basename(file))).toEqual(["bad.js"]);
  });
});
