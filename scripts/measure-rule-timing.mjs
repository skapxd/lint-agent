import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const eslintBin = path.join(repoRoot, "node_modules", ".bin", "eslint");
const defaultOutputPath = path.join(repoRoot, "rule-timing-results.md");
const sourceTarget = "src";
const printConfigFixture = "src/index.ts";

const options = parseOptions(process.argv.slice(2));
const outputPath = path.resolve(repoRoot, options.outputPath);
const distEntrypoint = path.join(repoRoot, "dist", "index.mjs");

if (!existsSync(distEntrypoint)) {
  throw new Error("dist/index.mjs no existe. Ejecuta pnpm build antes de medir.");
}

const plugin = await import(pathToFileURL(distEntrypoint).href).then(
  (module) => module.default,
);
const tempDir = await mkdtemp(path.join(tmpdir(), "skapxd-rule-timing-"));

try {
  const configPaths = await writeMeasurementConfigs(tempDir);
  const activeRules = getActiveRules(configPaths.all);
  const typeAwareRules = new Set(
    activeRules
      .filter((rule) => isTypeAwareRule(rule.id))
      .map((rule) => rule.id),
  );

  console.error(
    `Midiendo ${activeRules.length} reglas activas ` +
      `(${typeAwareRules.size} type-aware por meta.docs.requiresTypeChecking).`,
  );

  const untypedBaseline = measureConfig(configPaths.untypedBaseline);
  const typedBaseline = measureConfig(configPaths.typedBaseline);
  const allRules = measureConfig(configPaths.all);
  const timingAll = runTimingAll(configPaths.all);
  const isolatedRules = [];

  for (const rule of activeRules) {
    const ruleConfigPath = await writeRuleConfig(tempDir, rule);
    const measurement = measureConfig(ruleConfigPath);
    const baseline = typeAwareRules.has(rule.id)
      ? typedBaseline
      : untypedBaseline;

    isolatedRules.push({
      id: rule.id,
      measurement,
      marginalMedianMs: measurement.medianMs - baseline.medianMs,
      marginalMinMs: measurement.minMs - baseline.minMs,
      typeAware: typeAwareRules.has(rule.id),
    });
  }

  const sumIndividualMinMs = isolatedRules.reduce(
    (total, rule) => total + rule.marginalMinMs,
    0,
  );
  const sumIndividualMedianMs = isolatedRules.reduce(
    (total, rule) => total + rule.marginalMedianMs,
    0,
  );
  const allTogetherMinMs = allRules.minMs - typedBaseline.minMs;
  const allTogetherMedianMs = allRules.medianMs - typedBaseline.medianMs;
  const programFloorMinMs = typedBaseline.minMs - untypedBaseline.minMs;
  const programFloorMedianMs =
    typedBaseline.medianMs - untypedBaseline.medianMs;

  const report = renderReport({
    activeRules,
    allTogetherMedianMs,
    allTogetherMinMs,
    isolatedRules,
    options,
    programFloorMedianMs,
    programFloorMinMs,
    sumIndividualMedianMs,
    sumIndividualMinMs,
    timingAll,
    typeAwareRules,
    typedBaseline,
    untypedBaseline,
  });

  await mkdir(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, report);
  process.stdout.write(report);
  console.error(`\nResultado escrito en ${path.relative(repoRoot, outputPath)}`);
} finally {
  await rm(tempDir, { force: true, recursive: true });
}

function parseOptions(args) {
  const parsed = {
    outputPath: defaultOutputPath,
    repetitions: Number(process.env.RULE_TIMING_REPETITIONS ?? 5),
    warmup: Number(process.env.RULE_TIMING_WARMUP ?? 1),
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--output") {
      const value = args[index + 1];
      if (!value) throw new Error("--output requiere una ruta.");
      parsed.outputPath = value;
      index += 1;
      continue;
    }

    if (arg === "--repetitions") {
      const value = Number(args[index + 1]);
      if (!Number.isInteger(value) || value < 1) {
        throw new Error("--repetitions debe ser un entero positivo.");
      }
      parsed.repetitions = value;
      index += 1;
      continue;
    }

    if (arg === "--warmup") {
      const value = Number(args[index + 1]);
      if (!Number.isInteger(value) || value < 0) {
        throw new Error("--warmup debe ser un entero no negativo.");
      }
      parsed.warmup = value;
      index += 1;
      continue;
    }

    throw new Error(`Opcion no reconocida: ${arg}`);
  }

  return parsed;
}

async function writeMeasurementConfigs(configDir) {
  const all = path.join(configDir, "package-all.config.mjs");
  const typedBaseline = path.join(configDir, "baseline-typed.config.mjs");
  const untypedBaseline = path.join(configDir, "baseline-untyped.config.mjs");

  await writeFile(all, renderPackageConfig("packagePreset.rules"));
  await writeFile(typedBaseline, renderTypedBaselineConfig());
  await writeFile(untypedBaseline, renderUntypedBaselineConfig());

  return { all, typedBaseline, untypedBaseline };
}

async function writeRuleConfig(configDir, rule) {
  const filename = `${rule.id.replaceAll("/", "__")}.config.mjs`;
  const configPath = path.join(configDir, filename);
  await writeFile(
    configPath,
    renderPackageConfig(
      `{ ${JSON.stringify(rule.id)}: ${JSON.stringify(rule.setting)} }`,
    ),
  );

  return configPath;
}

function renderPackageConfig(rulesExpression) {
  return [
    `import plugin from ${JSON.stringify(pathToFileURL(distEntrypoint).href)};`,
    "",
    "const packagePreset = plugin.configs.shared.package;",
    "",
    "export default [",
    '  { ignores: ["dist/**", "node_modules/**"] },',
    "  {",
    `    basePath: ${JSON.stringify(repoRoot)},`,
    '    files: ["src/**/*.ts"],',
    "    languageOptions: packagePreset.languageOptions,",
    "    plugins: packagePreset.plugins,",
    `    rules: ${rulesExpression},`,
    "  },",
    "];",
    "",
  ].join("\n");
}

function renderUntypedBaselineConfig() {
  return [
    `import plugin from ${JSON.stringify(pathToFileURL(distEntrypoint).href)};`,
    "",
    "const basePreset = plugin.configs.shared.base;",
    "",
    "export default [",
    '  { ignores: ["dist/**", "node_modules/**"] },',
    "  {",
    `    basePath: ${JSON.stringify(repoRoot)},`,
    '    files: ["src/**/*.ts"],',
    "    languageOptions: basePreset.languageOptions,",
    "    plugins: basePreset.plugins,",
    "    rules: {},",
    "  },",
    "];",
    "",
  ].join("\n");
}

function renderTypedBaselineConfig() {
  return [
    `import plugin from ${JSON.stringify(pathToFileURL(distEntrypoint).href)};`,
    "",
    "const packagePreset = plugin.configs.shared.package;",
    "const typeProbe = {",
    "  rules: {",
    "    program: {",
    "      meta: {",
    '        docs: { requiresTypeChecking: true },',
    '        schema: [],',
    '        type: "problem",',
    "      },",
    "      create(context) {",
    "        const services = context.sourceCode.parserServices;",
    "        services?.program?.getTypeChecker();",
    "        return {};",
    "      },",
    "    },",
    "  },",
    "};",
    "",
    "export default [",
    '  { ignores: ["dist/**", "node_modules/**"] },',
    "  {",
    `    basePath: ${JSON.stringify(repoRoot)},`,
    '    files: ["src/**/*.ts"],',
    "    languageOptions: packagePreset.languageOptions,",
    '    plugins: { ...packagePreset.plugins, "rule-timing": typeProbe },',
    '    rules: { "rule-timing/program": "error" },',
    "  },",
    "];",
    "",
  ].join("\n");
}

function getActiveRules(configPath) {
  const result = spawnSync(
    eslintBin,
    [
      "--no-config-lookup",
      "--config",
      configPath,
      "--print-config",
      printConfigFixture,
    ],
    {
      cwd: repoRoot,
      encoding: "utf8",
    },
  );

  if (result.status !== 0) {
    throw new Error(
      `eslint --print-config fallo:\n${result.stderr || result.stdout}`,
    );
  }

  const printedConfig = JSON.parse(result.stdout);

  return Object.entries(printedConfig.rules ?? {})
    .filter(([, setting]) => isRuleEnabled(setting))
    .map(([id, setting]) => ({ id, setting }))
    .sort((left, right) => left.id.localeCompare(right.id));
}

function isRuleEnabled(setting) {
  const severity = Array.isArray(setting) ? setting[0] : setting;
  return severity !== 0 && severity !== "off";
}

function isTypeAwareRule(ruleId) {
  if (!ruleId.startsWith("skapxd/")) return false;

  const ruleName = ruleId.slice("skapxd/".length);
  return plugin.rules[ruleName]?.meta?.docs?.requiresTypeChecking === true;
}

function measureConfig(configPath) {
  const samples = [];
  const totalRuns = options.warmup + options.repetitions;

  for (let runIndex = 0; runIndex < totalRuns; runIndex += 1) {
    const start = performance.now();
    runEslint(configPath);
    const elapsedMs = performance.now() - start;

    if (runIndex >= options.warmup) {
      samples.push(elapsedMs);
    }
  }

  return {
    medianMs: median(samples),
    minMs: Math.min(...samples),
    samples,
  };
}

function runEslint(configPath) {
  const result = spawnSync(
    eslintBin,
    [
      "--no-config-lookup",
      "--config",
      configPath,
      "--no-cache",
      "--concurrency",
      "off",
      "--format",
      "json",
      sourceTarget,
    ],
    {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "ignore", "pipe"],
    },
  );

  if (result.status !== 0 && result.status !== 1) {
    throw new Error(`eslint fallo:\n${result.stderr}`);
  }
}

function runTimingAll(configPath) {
  const outputFile = path.join(
    path.dirname(configPath),
    "timing-all-eslint-output.json",
  );
  const result = spawnSync(
    eslintBin,
    [
      "--no-config-lookup",
      "--config",
      configPath,
      "--no-cache",
      "--concurrency",
      "off",
      "--format",
      "json",
      "--output-file",
      outputFile,
      sourceTarget,
    ],
    {
      cwd: repoRoot,
      encoding: "utf8",
      env: { ...process.env, TIMING: "all" },
    },
  );

  if (result.status !== 0 && result.status !== 1) {
    throw new Error(`TIMING=all eslint fallo:\n${result.stderr}`);
  }

  return [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
}

function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) return sorted[middle];

  return (sorted[middle - 1] + sorted[middle]) / 2;
}

function renderReport(report) {
  const tableRows = [
    {
      id: "_programa TS_ (`BASE_typed - BASE_untyped`)",
      medianMs: report.programFloorMedianMs,
      minMs: report.programFloorMinMs,
      typeAware: "piso",
    },
    ...report.isolatedRules.map((rule) => ({
      id: `\`${rule.id}\``,
      medianMs: rule.marginalMedianMs,
      minMs: rule.marginalMinMs,
      typeAware: rule.typeAware ? "si" : "no",
    })),
    {
      id: "`TODAS_JUNTAS` (`total - BASE_typed`)",
      medianMs: report.allTogetherMedianMs,
      minMs: report.allTogetherMinMs,
      typeAware: "mixto",
    },
    {
      id: "`SUMA_INDIVIDUALES`",
      medianMs: report.sumIndividualMedianMs,
      minMs: report.sumIndividualMinMs,
      typeAware: "mixto",
    },
    {
      id: "_arranque_ (`BASE_untyped`)",
      medianMs: report.untypedBaseline.medianMs,
      minMs: report.untypedBaseline.minMs,
      typeAware: "base",
    },
  ].sort((left, right) => right.minMs - left.minMs);

  return [
    "## Medicion de tiempo por regla",
    "",
    `Fecha UTC: ${new Date().toISOString()}`,
    "",
    "| Parametro | Valor |",
    "| --- | --- |",
    `| Corpus | \`${sourceTarget}\` |`,
    `| Fixture print-config | \`${printConfigFixture}\` |`,
    `| Warmup descartado | ${report.options.warmup} |`,
    `| Repeticiones K | ${report.options.repetitions} |`,
    "| Cache ESLint | apagado (`--no-cache`) |",
    "| Concurrencia ESLint | apagada (`--concurrency off`) |",
    `| Reglas activas | ${report.activeRules.length} |`,
    `| Type-aware por metadato | ${report.typeAwareRules.size} |`,
    "",
    "## Tabla de resultados (por regla, mayor -> menor)",
    "",
    "| Regla | Tiempo (ms) | Type-aware | Mediana (ms) |",
    "| --- | ---: | --- | ---: |",
    ...tableRows.map(
      (row) =>
        `| ${row.id} | ${formatMs(row.minMs)} | ${row.typeAware} | ${formatMs(
          row.medianMs,
        )} |`,
    ),
    "",
    "## Lectura automatica",
    "",
    renderProgramReading(report),
    "",
    renderContrastReading(report),
    "",
    "## Cross-check TIMING=all",
    "",
    "```text",
    report.timingAll || "(TIMING=all no produjo salida textual)",
    "```",
    "",
  ].join("\n");
}

function renderProgramReading(report) {
  const maxRule = report.isolatedRules.reduce(
    (max, rule) => Math.max(max, rule.marginalMinMs),
    Number.NEGATIVE_INFINITY,
  );
  const share = (report.programFloorMinMs / maxRule) * 100;

  return [
    `Piso TS: ${formatMs(report.programFloorMinMs)} ms; regla mas cara: ${formatMs(
      maxRule,
    )} ms (${share.toFixed(1)}% del maximo aislado); suma individuales: ${formatMs(
      report.sumIndividualMinMs,
    )} ms.`,
    "Lectura: la fila del programa TS mide el piso compartido; TIMING=all mide el tiempo interno de listeners en una sola corrida.",
  ].join(" ");
}

function renderContrastReading(report) {
  const tolerance = Math.max(5, Math.abs(report.allTogetherMinMs) * 0.05);
  const delta = report.sumIndividualMinMs - report.allTogetherMinMs;

  if (delta > tolerance) {
    return (
      `Contraste: SUMA_INDIVIDUALES es mayor que TODAS_JUNTAS por ` +
      `${formatMs(delta)} ms. Lectura: hay trabajo compartido/amortizado; ` +
      "el ranking individual sirve para ordenar, no para presupuestar."
    );
  }

  if (delta < -tolerance) {
    return (
      `Contraste: SUMA_INDIVIDUALES es menor que TODAS_JUNTAS por ` +
      `${formatMs(Math.abs(delta))} ms. Lectura: posible interferencia; ` +
      "investigar antes de presupuestar."
    );
  }

  return (
    `Contraste: SUMA_INDIVIDUALES y TODAS_JUNTAS son equivalentes dentro de ` +
    `${formatMs(tolerance)} ms. Lectura: costos aproximadamente aditivos.`
  );
}

function formatMs(value) {
  return value.toFixed(1);
}
