import { execFileSync, spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

const packageJson = JSON.parse(
  execFileSync(process.execPath, [
    "-e",
    "process.stdout.write(JSON.stringify(require('./package.json')))",
  ], {
    cwd: repoRoot,
    encoding: "utf8",
  }),
);

const presetChecks = [
  {
    configs: "[plugin.configs.backend]",
    file: "src/index.ts",
    name: "backend",
  },
  {
    configs: "[plugin.configs.frontend]",
    file: "src/index.ts",
    name: "frontend",
  },
  {
    configs: "[plugin.configs.package]",
    file: "src/index.ts",
    name: "package",
  },
  {
    configs: "plugin.configs.nest",
    file: "src/main.ts",
    name: "nest",
  },
  {
    configs: "plugin.configs.next",
    file: "src/server/index.ts",
    name: "next",
  },
  {
    configs: "plugin.configs.astro",
    file: "src/index.ts",
    name: "astro",
  },
];

const noCrashSmokeChecks = [
  {
    configs: "[plugin.configs.frontend]",
    file: "src/repeated-jsx.tsx",
    name: "frontend-repeated-jsx",
    requiredRuleId: "skapxd/repeated-jsx-requires-component",
  },
  {
    configs: "plugin.configs.next",
    file: "src/repeated-jsx.tsx",
    name: "next-repeated-jsx",
    requiredRuleId: "skapxd/repeated-jsx-requires-component",
  },
  {
    configs: "plugin.configs.astro",
    file: "src/repeated-jsx.tsx",
    name: "astro-repeated-jsx",
    requiredRuleId: "skapxd/repeated-jsx-requires-component",
  },
];

export async function runPeerContract(versionSelector) {
  if (versionSelector !== "minimum" && versionSelector !== "latest") {
    throw new Error(`Selector de version peer invalido: ${versionSelector}`);
  }

  const peerVersions = getPeerVersions(versionSelector);
  const tempDir = await mkdtemp(
    path.join(tmpdir(), `skapxd-peer-${versionSelector}-`),
  );

  try {
    await writeFixtureProject(tempDir, {
      includeRepeatedJsxFixture: versionSelector === "latest",
      versionSelector,
    });

    run(
      "npm",
      [
        "install",
        "--no-audit",
        "--no-fund",
        `eslint@${peerVersions.eslint}`,
        `typescript@${peerVersions.typescript}`,
        `typescript-eslint@${peerVersions.typescriptEslint}`,
      ],
      tempDir,
    );
    const packageTarball = packPackage(tempDir);
    run(
      "npm",
      ["install", "--no-audit", "--no-fund", "--no-save", packageTarball],
      tempDir,
    );

    const installedPlugin = await importInstalledPlugin(tempDir);
    validateConfiguredRuleOptions(tempDir, installedPlugin);

    for (const check of presetChecks) {
      await writeConfig(tempDir, check);
      runEslintStrict(tempDir, check);
    }

    if (versionSelector === "latest") {
      await runNoCrashSmoke(tempDir);
    }

    console.log(formatSuccessMessage(versionSelector, peerVersions));
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }
}

function getPeerVersions(versionSelector) {
  const peerDependencies = packageJson.peerDependencies ?? {};
  const selector =
    versionSelector === "minimum"
      ? getInstallableMinimumVersion
      : getInstallableLatestVersion;

  return {
    eslint: selector("eslint", getPeerRange(peerDependencies, "eslint")),
    typescript: selector(
      "typescript",
      getPeerRange(peerDependencies, "typescript"),
    ),
    typescriptEslint: selector(
      "typescript-eslint",
      getPeerRange(peerDependencies, "typescript-eslint"),
    ),
  };
}

function getPeerRange(peerDependencies, packageName) {
  const range = peerDependencies[packageName];

  if (typeof range !== "string") {
    throw new Error(`peerDependency ausente para ${packageName}.`);
  }

  return range;
}

function getMinimumBound(range, packageName) {
  const match = /^>=\s*(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\s|$)/.exec(range.trim());

  if (!match) {
    throw new Error(
      `No se puede derivar el minimo exacto de ${packageName}: ${range}`,
    );
  }

  const [, major, minor = "0", patch = "0"] = match;

  return {
    nextMajor: Number(major) + 1,
    version: `${major}.${minor}.${patch}`,
  };
}

function getInstallableMinimumVersion(packageName, range) {
  const bound = getMinimumBound(range, packageName);
  const versions = getPublishedStableVersions(
    packageName,
    `>=${bound.version} <${bound.nextMajor}.0.0`,
  );
  const [firstVersion] = versions;

  if (typeof firstVersion !== "string") {
    throw new Error(
      `No se encontro version publicada para ${packageName} desde ${bound.version}.`,
    );
  }

  return firstVersion;
}

function getInstallableLatestVersion(packageName, range) {
  const versions = getPublishedStableVersions(packageName, range);
  const latestVersion = versions.at(-1);

  if (typeof latestVersion !== "string") {
    throw new Error(
      `No se encontro version estable publicada para ${packageName} en ${range}.`,
    );
  }

  return latestVersion;
}

function getPublishedStableVersions(packageName, range) {
  const output = execFileSync(
    "npm",
    ["view", `${packageName}@${range}`, "version", "--json"],
    {
      encoding: "utf8",
    },
  );
  const versions = JSON.parse(output);
  const installableVersions = Array.isArray(versions) ? versions : [versions];

  return installableVersions
    .filter((version) => typeof version === "string" && isStableVersion(version))
    .sort(compareStableVersions);
}

function isStableVersion(version) {
  return /^\d+\.\d+\.\d+$/.test(version);
}

function compareStableVersions(left, right) {
  const leftParts = parseStableVersion(left);
  const rightParts = parseStableVersion(right);

  for (const index of [0, 1, 2]) {
    const difference = leftParts[index] - rightParts[index];
    if (difference !== 0) {
      return difference;
    }
  }

  return 0;
}

function parseStableVersion(version) {
  return version.split(".").map((part) => Number(part));
}

async function importInstalledPlugin(projectDir) {
  const pluginPath = path.join(
    projectDir,
    "node_modules",
    "@skapxd",
    "lint-agent",
    "dist",
    "index.mjs",
  );

  const module = await import(pathToFileURL(pluginPath).href);

  return module.default;
}

function run(command, args, cwd) {
  execFileSync(command, args, {
    cwd,
    env: {
      ...process.env,
      npm_config_package_lock: "false",
    },
    stdio: "inherit",
  });
}

function runEslintStrict(projectDir, check) {
  run(
    path.join(projectDir, "node_modules", ".bin", "eslint"),
    [
      "--no-config-lookup",
      "--config",
      `.tmp-${check.name}.config.mjs`,
      "--format",
      "json",
      "--max-warnings",
      "0",
      check.file,
    ],
    projectDir,
  );
}

async function runNoCrashSmoke(projectDir) {
  for (const check of noCrashSmokeChecks) {
    await writeConfig(projectDir, check);
    const results = runEslintAllowingFindings(projectDir, check);

    assertNoFatalErrors(check, results);
    assertRuleWasExercised(check, results);
  }
}

function runEslintAllowingFindings(projectDir, check) {
  const result = spawnSync(
    path.join(projectDir, "node_modules", ".bin", "eslint"),
    [
      "--no-config-lookup",
      "--config",
      `.tmp-${check.name}.config.mjs`,
      "--format",
      "json",
      "--max-warnings",
      "0",
      check.file,
    ],
    {
      cwd: projectDir,
      encoding: "utf8",
      env: {
        ...process.env,
        npm_config_package_lock: "false",
      },
    },
  );

  if (result.error) {
    throw result.error;
  }

  const expectedLintStatus = result.status === 0 || result.status === 1;
  if (!expectedLintStatus) {
    throw new Error(
      [
        `${check.name}: ESLint fallo con exit ${result.status}.`,
        `stdout:\n${result.stdout}`,
        `stderr:\n${result.stderr}`,
      ].join("\n"),
    );
  }

  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    throw new Error(
      [
        `${check.name}: ESLint no produjo JSON valido.`,
        error instanceof Error ? error.message : String(error),
        `stdout:\n${result.stdout}`,
        `stderr:\n${result.stderr}`,
      ].join("\n"),
    );
  }
}

function assertNoFatalErrors(check, results) {
  const fatalErrorCount = results.reduce((total, result) => {
    return total + (Number(result.fatalErrorCount) || 0);
  }, 0);

  if (fatalErrorCount > 0) {
    throw new Error(
      `${check.name}: ESLint reporto ${fatalErrorCount} errores fatales.`,
    );
  }
}

function assertRuleWasExercised(check, results) {
  const wasExercised = results.some((result) => {
    return (result.messages ?? []).some((message) => {
      return message.ruleId === check.requiredRuleId;
    });
  });

  if (!wasExercised) {
    throw new Error(
      `${check.name}: el smoke no ejecuto ${check.requiredRuleId}.`,
    );
  }
}

function packPackage(projectDir) {
  const output = execFileSync(
    "npm",
    ["pack", repoRoot, "--pack-destination", projectDir, "--json"],
    {
      cwd: projectDir,
      encoding: "utf8",
    },
  );
  const [packedPackage] = JSON.parse(output);

  if (!packedPackage?.filename) {
    throw new Error(`npm pack no produjo un tarball valido: ${output}`);
  }

  return path.join(projectDir, packedPackage.filename);
}

async function writeConfig(projectDir, check) {
  await writeFile(
    path.join(projectDir, `.tmp-${check.name}.config.mjs`),
    [
      'import plugin from "@skapxd/lint-agent";',
      "",
      `const configs = ${check.configs};`,
      'const typedFiles = ["**/*.{ts,tsx}"];',
      "",
      "export default [",
      '  { ignores: ["node_modules/**", "dist/**"] },',
      "  ...configs.map((config) => ({",
      "    ...config,",
      "    files: config.files ?? typedFiles,",
      "  })),",
      "];",
      "",
    ].join("\n"),
  );
}

function validateConfiguredRuleOptions(projectDir, plugin) {
  const requireFromProject = createRequire(path.join(projectDir, "package.json"));
  const Ajv = requireFromProject("ajv");
  const ajv = new Ajv({ allErrors: true, verbose: true });

  for (const { configs, name } of getPresetConfigs(plugin)) {
    for (const config of configs) {
      for (const [ruleId, setting] of Object.entries(config.rules ?? {})) {
        if (!ruleId.startsWith("skapxd/")) continue;

        const options = getRuleOptions(setting);
        if (options.length === 0) continue;

        const ruleName = ruleId.slice("skapxd/".length);
        const rule = plugin.rules[ruleName];

        if (!rule) {
          throw new Error(`${name}: regla registrada no existe: ${ruleId}`);
        }

        const schema = getOptionsSchema(rule.meta?.schema);

        if (!schema) {
          throw new Error(`${name}: ${ruleId} tiene opciones sin schema.`);
        }

        const validate = ajv.compile(schema);

        if (!validate(options)) {
          throw new Error(
            [
              `${name}: opciones invalidas para ${ruleId}.`,
              `Opciones: ${JSON.stringify(options)}`,
              `Errores: ${ajv.errorsText(validate.errors)}`,
            ].join("\n"),
          );
        }
      }
    }
  }
}

function getPresetConfigs(plugin) {
  return [
    { configs: [plugin.configs.backend], name: "backend" },
    { configs: [plugin.configs.frontend], name: "frontend" },
    { configs: [plugin.configs.package], name: "package" },
    { configs: plugin.configs.nest, name: "nest" },
    { configs: plugin.configs.next, name: "next" },
    { configs: plugin.configs.astro, name: "astro" },
  ];
}

function getOptionsSchema(schema) {
  if (schema === false) {
    return {
      additionalItems: false,
      items: [],
      maxItems: 0,
      type: "array",
    };
  }

  if (Array.isArray(schema)) {
    return {
      additionalItems: false,
      items: schema,
      maxItems: schema.length,
      type: "array",
    };
  }

  if (schema && typeof schema === "object") {
    return schema;
  }

  return null;
}

function getRuleOptions(setting) {
  return Array.isArray(setting) ? setting.slice(1) : [];
}

async function writeFixtureProject(projectDir, options) {
  await mkdir(path.join(projectDir, "src", "server"), { recursive: true });
  await mkdir(path.join(projectDir, "dist"), { recursive: true });

  await writeFile(
    path.join(projectDir, "package.json"),
    JSON.stringify(
      {
        exports: {
          ".": {
            import: {
              default: "./dist/index.mjs",
              types: "./dist/index.d.mts",
            },
            require: {
              default: "./dist/index.js",
              types: "./dist/index.d.ts",
            },
          },
        },
        name: `peer-${options.versionSelector}-fixture`,
        private: true,
        type: "module",
      },
      null,
      2,
    ),
  );
  await writeFile(
    path.join(projectDir, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          jsx: "react-jsx",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          noImplicitReturns: true,
          noUncheckedIndexedAccess: true,
          skipLibCheck: true,
          strict: true,
          target: "ES2022",
        },
        include: ["src/**/*.ts", "src/**/*.tsx"],
      },
      null,
      2,
    ),
  );
  await writeFile(path.join(projectDir, "nest-cli.json"), nestCliFixture());
  await writeFile(path.join(projectDir, "src", "index.ts"), sourceFixture());
  await writeFile(path.join(projectDir, "src", "main.ts"), sourceFixture("main"));
  await writeFile(
    path.join(projectDir, "src", "server", "index.ts"),
    sourceFixture(),
  );

  if (options.includeRepeatedJsxFixture) {
    await writeFile(
      path.join(projectDir, "src", "repeated-jsx.tsx"),
      repeatedJsxFixture(),
    );
  }

  await writeFile(path.join(projectDir, "dist", "index.d.mts"), "");
  await writeFile(path.join(projectDir, "dist", "index.d.ts"), "");
  await writeFile(path.join(projectDir, "dist", "index.mjs"), "");
  await writeFile(path.join(projectDir, "dist", "index.js"), "");
}

function nestCliFixture() {
  return `${JSON.stringify(
    {
      compilerOptions: {
        plugins: ["@nestjs/swagger"],
      },
    },
    null,
    2,
  )}\n`;
}

function sourceFixture(functionName = "createPeerValue") {
  return [
    "export type PeerValue = {",
    "  readonly label: string;",
    "};",
    "",
    `export function ${functionName}(label: string): PeerValue {`,
    "  return { label };",
    "}",
    "",
  ].join("\n");
}

function repeatedJsxFixture() {
  return [
    "type Card = {",
    "  readonly title: string;",
    "};",
    "",
    "const first: Card = { title: \"A\" };",
    "const second: Card = { title: \"B\" };",
    "const third: Card = { title: \"C\" };",
    "",
    "export function PeerLatestView() {",
    "  return (",
    "    <>",
    "      <div className=\"rounded-lg border p-4 shadow-sm\"><h3 className=\"text-lg font-bold\">{first.title}</h3></div>",
    "      <div className=\"border shadow-sm rounded-lg p-4\"><h3 className=\"font-bold text-lg\">{second.title}</h3></div>",
    "      <div className=\"shadow-sm p-4 border rounded-lg\"><h3 className=\"text-lg font-bold\">{third.title}</h3></div>",
    "    </>",
    "  );",
    "}",
    "",
  ].join("\n");
}

function formatSuccessMessage(versionSelector, peerVersions) {
  const label = versionSelector === "minimum" ? "minimo" : "latest";

  return [
    `Peer ${label} verificado:`,
    `eslint@${peerVersions.eslint}`,
    `typescript@${peerVersions.typescript}`,
    `typescript-eslint@${peerVersions.typescriptEslint}`,
  ].join(" ");
}
