import { spawnSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
  if (options.mode === "combine") {
    writeMarkdownReport(
      createReportFromParts({
        all: readJsonInput(options.allInputPath, "--all-input"),
        isolated: readJsonInput(options.isolatedInputPath, "--isolated-input"),
      }),
    );
  } else {
    const configPaths = await writeMeasurementConfigs(tempDir);
    const activeRules = getActiveRules(configPaths.all);
    const typeAwareRuleIds = activeRules
      .filter((rule) => isTypeAwareRule(rule.id))
      .map((rule) => rule.id);
    const typeAwareRules = new Set(typeAwareRuleIds);

    console.error(
      `Midiendo ${activeRules.length} reglas activas ` +
        `(${typeAwareRules.size} type-aware por meta.docs.requiresTypeChecking).`,
    );

    if (options.mode === "isolated") {
      writeJsonResult(
        await measureIsolatedRules(configPaths, activeRules, typeAwareRules),
      );
    } else if (options.mode === "all") {
      writeJsonResult(measureAllRules(configPaths, activeRules, typeAwareRuleIds));
    } else {
      const isolated = await measureIsolatedRules(
        configPaths,
        activeRules,
        typeAwareRules,
      );
      const all = measureAllRules(configPaths, activeRules, typeAwareRuleIds);
      writeMarkdownReport(createReportFromParts({ all, isolated }));
    }
  }
} finally {
  await rm(tempDir, { force: true, recursive: true });
}

function parseOptions(args) {
  const parsed = {
    allInputPath: null,
    isolatedInputPath: null,
    mode: "full",
    outputPath: defaultOutputPath,
    repetitions: Number(process.env.RULE_TIMING_REPETITIONS ?? 5),
    warmup: Number(process.env.RULE_TIMING_WARMUP ?? 1),
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    // El separador `--` que pnpm reenvia cuando el target encadena comandos
    // (`pnpm build && node ...`): no es una opcion, se ignora.
    if (arg === "--") {
      continue;
    }

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

    if (arg === "--mode") {
      const value = args[index + 1];
      if (!["all", "combine", "full", "isolated"].includes(value)) {
        throw new Error(
          "--mode debe ser uno de: full, isolated, all, combine.",
        );
      }
      parsed.mode = value;
      index += 1;
      continue;
    }

    if (arg === "--isolated-input") {
      const value = args[index + 1];
      if (!value) throw new Error("--isolated-input requiere una ruta.");
      parsed.isolatedInputPath = path.resolve(repoRoot, value);
      index += 1;
      continue;
    }

    if (arg === "--all-input") {
      const value = args[index + 1];
      if (!value) throw new Error("--all-input requiere una ruta.");
      parsed.allInputPath = path.resolve(repoRoot, value);
      index += 1;
      continue;
    }

    throw new Error(`Opcion no reconocida: ${arg}`);
  }

  return parsed;
}

async function measureIsolatedRules(configPaths, activeRules, typeAwareRules) {
  console.error("Midiendo BASE_untyped...");
  const untypedBaseline = measureConfig(configPaths.untypedBaseline);
  console.error(
    `BASE_untyped: min=${formatMs(untypedBaseline.minMs)} ms; ` +
      `mediana=${formatMs(untypedBaseline.medianMs)} ms.`,
  );

  console.error("Midiendo BASE_typed...");
  const typedBaseline = measureConfig(configPaths.typedBaseline);
  console.error(
    `BASE_typed: min=${formatMs(typedBaseline.minMs)} ms; ` +
      `mediana=${formatMs(typedBaseline.medianMs)} ms.`,
  );

  const isolatedRules = [];

  for (const [ruleIndex, rule] of activeRules.entries()) {
    const progress = `[${String(ruleIndex + 1).padStart(2, "0")}/${activeRules.length}]`;
    console.error(`${progress} Midiendo ${rule.id}...`);

    const ruleConfigPath = await writeRuleConfig(tempDir, rule);
    const startedAt = performance.now();
    const measurement = measureConfig(ruleConfigPath);
    const baseline = typedBaseline;
    const isolatedRule = {
      id: rule.id,
      measurement,
      marginalMedianMs: measurement.medianMs - baseline.medianMs,
      marginalMinMs: measurement.minMs - baseline.minMs,
      typeAware: typeAwareRules.has(rule.id),
    };

    console.error(
      `${progress} ${rule.id}: min=${formatMs(isolatedRule.marginalMinMs)} ms; ` +
        `mediana=${formatMs(isolatedRule.marginalMedianMs)} ms; ` +
        `wall=${formatMs(performance.now() - startedAt)} ms.`,
    );

    isolatedRules.push(isolatedRule);
  }

  return {
    activeRules,
    generatedAt: new Date().toISOString(),
    isolatedRules,
    kind: "isolated",
    options: getSerializableOptions(),
    typeAwareRuleIds: [...typeAwareRules],
    typedBaseline,
    untypedBaseline,
  };
}

function measureAllRules(configPaths, activeRules, typeAwareRuleIds) {
  console.error("Midiendo BASE_typed para preset completo...");
  const typedBaseline = measureConfig(configPaths.typedBaseline);
  console.error(
    `BASE_typed: min=${formatMs(typedBaseline.minMs)} ms; ` +
      `mediana=${formatMs(typedBaseline.medianMs)} ms.`,
  );

  console.error("Midiendo preset package completo...");
  const allRules = measureConfig(configPaths.all);
  console.error(
    `TODAS_JUNTAS: min=${formatMs(allRules.minMs - typedBaseline.minMs)} ms; ` +
      `mediana=${formatMs(allRules.medianMs - typedBaseline.medianMs)} ms.`,
  );

  console.error("Ejecutando cross-check TIMING=all...");
  const timingAll = runTimingAll(configPaths.all);

  return {
    activeRules,
    allRules,
    generatedAt: new Date().toISOString(),
    kind: "all",
    options: getSerializableOptions(),
    timingAll,
    typeAwareRuleIds,
    typedBaseline,
  };
}

function createReportFromParts({ all, isolated }) {
  const sumIndividualMinMs = isolated.isolatedRules.reduce(
    (total, rule) => total + rule.marginalMinMs,
    0,
  );
  const sumIndividualMedianMs = isolated.isolatedRules.reduce(
    (total, rule) => total + rule.marginalMedianMs,
    0,
  );
  const allTogetherMinMs = all.allRules.minMs - all.typedBaseline.minMs;
  const allTogetherMedianMs =
    all.allRules.medianMs - all.typedBaseline.medianMs;
  const programFloorMinMs =
    isolated.typedBaseline.minMs - isolated.untypedBaseline.minMs;
  const programFloorMedianMs =
    isolated.typedBaseline.medianMs - isolated.untypedBaseline.medianMs;

  return {
    activeRules: isolated.activeRules,
    allBaseline: all.typedBaseline,
    allGeneratedAt: all.generatedAt,
    allTogetherMedianMs,
    allTogetherMinMs,
    isolatedGeneratedAt: isolated.generatedAt,
    isolatedRules: isolated.isolatedRules,
    options: isolated.options,
    programFloorMedianMs,
    programFloorMinMs,
    sumIndividualMedianMs,
    sumIndividualMinMs,
    timingAll: all.timingAll,
    typeAwareRuleIds: isolated.typeAwareRuleIds,
    typedBaseline: isolated.typedBaseline,
    untypedBaseline: isolated.untypedBaseline,
  };
}

function getSerializableOptions() {
  return {
    mode: options.mode,
    repetitions: options.repetitions,
    warmup: options.warmup,
  };
}

function readJsonInput(inputPath, flagName) {
  if (!inputPath) {
    throw new Error(`${flagName} es obligatorio con --mode combine.`);
  }

  return JSON.parse(readFileSync(inputPath, "utf8"));
}

function writeOutput(content) {
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, content);
  process.stdout.write(content);
  console.error(`\nResultado escrito en ${path.relative(repoRoot, outputPath)}`);
}

function writeJsonResult(result) {
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
  process.stdout.write(renderConsoleReport(result));
  console.error(`\nArtifact JSON escrito en ${path.relative(repoRoot, outputPath)}`);
}

function writeMarkdownReport(report) {
  writeOutput(renderReport(report));
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
    `| Type-aware por metadato | ${report.typeAwareRuleIds.length} |`,
    "| Marginales por regla | cada regla resta `BASE_typed` del mismo job/runner |",
    "| `TODAS_JUNTAS` | resta `BASE_typed` medido en su propio job/runner |",
    "| Nota CI paralela | `SUMA_INDIVIDUALES` y `TODAS_JUNTAS` pueden venir de runners distintos; no comparar absolutos sin su baseline local |",
    "| Columna type-aware | informativa; no selecciona baseline |",
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

function renderConsoleReport(result) {
  if (result.kind === "isolated") {
    return renderIsolatedConsoleReport(result);
  }

  if (result.kind === "all") {
    return renderAllConsoleReport(result);
  }

  throw new Error(`Tipo de resultado no soportado: ${result.kind}`);
}

function renderIsolatedConsoleReport(result) {
  const ruleRows = result.isolatedRules
    .map((rule) => ({
      mediana: formatMs(rule.marginalMedianMs),
      min: formatMs(rule.marginalMinMs),
      regla: rule.id,
      typeAware: rule.typeAware ? "si" : "no",
    }))
    .sort((left, right) => Number(right.min) - Number(left.min));

  return [
    "",
    "## Resumen isolated",
    "",
    renderMarkdownTable([
      ["Metrica", "ms", "mediana ms", "detalle"],
      [
        "BASE_untyped",
        formatMs(result.untypedBaseline.minMs),
        formatMs(result.untypedBaseline.medianMs),
        "arranque sin programa TS",
      ],
      [
        "BASE_typed",
        formatMs(result.typedBaseline.minMs),
        formatMs(result.typedBaseline.medianMs),
        "arranque con programa TS",
      ],
      [
        "reglas activas",
        String(result.activeRules.length),
        "-",
        `${result.typeAwareRuleIds.length} type-aware`,
      ],
    ]),
    "",
    "## Ranking aislado (mayor -> menor)",
    "",
    renderMarkdownTable([
      ["Regla", "ms", "type-aware?", "mediana ms"],
      ...ruleRows.map((row) => [
        row.regla,
        row.min,
        row.typeAware,
        row.mediana,
      ]),
    ]),
    "",
  ].join("\n");
}

function renderAllConsoleReport(result) {
  const allTogetherMinMs = result.allRules.minMs - result.typedBaseline.minMs;
  const allTogetherMedianMs =
    result.allRules.medianMs - result.typedBaseline.medianMs;

  return [
    "",
    "## Resumen all",
    "",
    renderMarkdownTable([
      ["Metrica", "ms", "mediana ms", "detalle"],
      [
        "BASE_typed",
        formatMs(result.typedBaseline.minMs),
        formatMs(result.typedBaseline.medianMs),
        "arranque con programa TS",
      ],
      [
        "TODAS_JUNTAS",
        formatMs(allTogetherMinMs),
        formatMs(allTogetherMedianMs),
        "preset completo - BASE_typed",
      ],
      [
        "reglas activas",
        String(result.activeRules.length),
        "-",
        `${result.typeAwareRuleIds.length} type-aware`,
      ],
    ]),
    "",
    "## Cross-check TIMING=all",
    "",
    "```text",
    result.timingAll || "(TIMING=all no produjo salida textual)",
    "```",
    "",
  ].join("\n");
}

function renderMarkdownTable(rows) {
  const widths = rows[0].map((_, columnIndex) =>
    Math.max(...rows.map((row) => row[columnIndex].length)),
  );

  return rows
    .flatMap((row, rowIndex) => {
      const renderedRow = `| ${row
        .map((cell, columnIndex) => cell.padEnd(widths[columnIndex], " "))
        .join(" | ")} |`;

      if (rowIndex !== 0) return [renderedRow];

      return [
        renderedRow,
        `| ${widths.map((width) => "-".repeat(width)).join(" | ")} |`,
      ];
    })
    .join("\n");
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
