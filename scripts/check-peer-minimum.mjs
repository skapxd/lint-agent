import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
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

const peerDependencies = packageJson.peerDependencies ?? {};
const eslintMinimum = getInstallableMinimumVersion(
  "eslint",
  getMinimumBound(peerDependencies.eslint, "eslint"),
);
const typescriptMinimum = getInstallableMinimumVersion(
  "typescript",
  getMinimumBound(peerDependencies.typescript, "typescript"),
);
const typescriptEslintMinimum = getInstallableMinimumVersion(
  "typescript-eslint",
  getMinimumBound(peerDependencies["typescript-eslint"], "typescript-eslint"),
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

const tempDir = await mkdtemp(path.join(tmpdir(), "skapxd-peer-minimum-"));

try {
  await writeFixtureProject(tempDir);

  run(
    "npm",
    [
      "install",
      "--no-audit",
      "--no-fund",
      `eslint@${eslintMinimum}`,
      `typescript@${typescriptMinimum}`,
      `typescript-eslint@${typescriptEslintMinimum}`,
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
    run(
      path.join(tempDir, "node_modules", ".bin", "eslint"),
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
      tempDir,
    );
  }

  console.log(
    [
      "Peer minimo verificado:",
      `eslint@${eslintMinimum}`,
      `typescript@${typescriptMinimum}`,
      `typescript-eslint@${typescriptEslintMinimum}`,
    ].join(" "),
  );
} finally {
  await rm(tempDir, { force: true, recursive: true });
}

function getMinimumBound(range, packageName) {
  if (typeof range !== "string") {
    throw new Error(`peerDependency ausente para ${packageName}.`);
  }

  const match = /^>=\s*(\d+)(?:\.(\d+))?(?:\.(\d+))?$/.exec(range.trim());

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

function getInstallableMinimumVersion(packageName, bound) {
  const versions = JSON.parse(
    execFileSync(
      "npm",
      [
        "view",
        `${packageName}@>=${bound.version} <${bound.nextMajor}.0.0`,
        "version",
        "--json",
      ],
      {
        encoding: "utf8",
      },
    ),
  );

  const installableVersions = Array.isArray(versions) ? versions : [versions];
  const [firstVersion] = installableVersions;

  if (typeof firstVersion !== "string") {
    throw new Error(
      `No se encontro version publicada para ${packageName} desde ${bound.version}.`,
    );
  }

  return firstVersion;
}

async function importInstalledPlugin(projectDir) {
  const pluginPath = path.join(
    projectDir,
    "node_modules",
    "@skapxd",
    "eslint-opinionated",
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
      'import plugin from "@skapxd/eslint-opinionated";',
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

async function writeFixtureProject(projectDir) {
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
        name: "peer-minimum-fixture",
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
