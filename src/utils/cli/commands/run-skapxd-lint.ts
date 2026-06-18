import { Result } from "@skapxd/result";
import { createHelpText } from "#/utils/cli/output/interactive/create-help-text";
import { createExecutionErrorOutput } from "#/utils/cli/output/machine/create-execution-error-output";
import { createUsageErrorOutput } from "#/utils/cli/output/machine/create-usage-error-output";
import { formatCompactSummary } from "#/utils/cli/output/machine/format-compact-summary";
import { getCliExitCode } from "#/utils/cli/output/machine/get-cli-exit-code";
import { getCliOutputFormat } from "#/utils/cli/args/get-cli-output-format";
import { isInteractiveSession } from "#/utils/cli/output/interactive/is-interactive-session";
import { parseCliArguments } from "#/utils/cli/args/parse-cli-arguments";
import { promptForPath } from "#/utils/cli/output/interactive/prompt-for-path";
import { reportCliInfrastructureError } from "#/utils/cli/output/machine/report-cli-infrastructure-error";
import { createStateResetOutput } from "#/utils/cli/state/create-state-reset-output";
import { removeAdoptionState } from "#/utils/cli/state/remove-adoption-state";
import { resolveStateBackedVerifySeed } from "#/utils/cli/state/resolve-state-backed-verify-seed";
import { runRequestedMode } from "./run-requested-mode";
import { getUnknownErrorMessage } from "#/utils/unknown/get-unknown-error-message";
import { writeAdoptionState } from "#/utils/cli/state/write-adoption-state";
import { writeCliOutputOrReport } from "#/utils/cli/output/machine/write-cli-output-or-report";
import { writeOutputToFile } from "#/utils/cli/output/machine/write-output-to-file";
import type { CliOutputFormat, CliStreams, SkapxdLintOutput } from "#/utils/cli/types";

/**
 * Orquesta el CLI completo sin mezclar UX interactiva, persistencia de lotes y ejecucion de ESLint en los helpers de bajo nivel. La funcion decide el modo, normaliza la salida y traduce cada fallo a un payload estable para humanos o maquinas.
 *
 * ### Orden de control
 * parsear args -> ayuda/uso invalido -> resolver path interactivo o explicito -> reset/state-backed verify -> ejecutar modo solicitado -> persistir o limpiar seed -> escribir salida y exit code.
 *
 * ### Ejemplo
 * ```ts
 * await runSkapxdLint(streams); // sin <path> + --yes -> usage-error
 * await runSkapxdLint(streams); // --verify vacio -> recupera la seed persistida
 * ```
 */
export async function runSkapxdLint(streams: CliStreams) {
  const args = streams.argv.slice(2);
  const parsed = parseCliArguments(args);
  const hasParseError = !parsed.ok;

  if (hasParseError) {
    const output = createUsageErrorOutput(parsed.message);
    await writeCliOutputOrReport(output, streams.stdout, streams.stderr, "json");
    process.exitCode = 2;
    return;
  }

  const cliArguments = parsed.value;

  if (cliArguments.help) {
    streams.stdout.write(`${createHelpText()}\n`);
    process.exitCode = 0;
    return;
  }

  const canUseInteractiveMode = cliArguments.format === null && cliArguments.output === null;
  const interactive = canUseInteractiveMode && isInteractiveSession(cliArguments, streams);
  const outputFormat = getCliOutputFormat(cliArguments, interactive);

  async function emitOutput(
    output: SkapxdLintOutput,
    format: CliOutputFormat | "interactive",
  ) {
    const outputPath = cliArguments.output;
    const shouldWriteOutputToFile = outputPath !== null && format !== "interactive";

    if (!shouldWriteOutputToFile) {
      return writeCliOutputOrReport(output, streams.stdout, streams.stderr, format);
    }

    const outputWrite = writeOutputToFile(output, format, outputPath, streams.cwd);

    if (!outputWrite.ok) {
      streams.stderr.write(`skapxd-lint no pudo escribir la salida en ${outputPath}.\n`);
      reportCliInfrastructureError(outputWrite.error, streams.stderr);
      return Result.err(outputWrite.error);
    }

    streams.stdout.write(`${formatCompactSummary(output)} → salida en ${outputPath}\n`);
    return Result.ok(undefined);
  }
  const missingPath = cliArguments.path === null && !cliArguments.changed;
  const mustFailBecausePathIsMissing = missingPath && !interactive;

  if (mustFailBecausePathIsMissing) {
    const output = createUsageErrorOutput(
      "Falta <path>. En modo no-interactivo el CLI nunca pregunta; pasa `skapxd-lint <path> --yes` o usa `skapxd-lint --changed --yes`.",
    );
    await emitOutput(output, outputFormat);
    process.exitCode = 2;
    return;
  }

  const pathResult =
    missingPath && interactive
      ? await promptForPath({ input: streams.stdin, output: streams.stdout })
      : Result.ok(cliArguments.path);

  if (!pathResult.ok) {
    const message =
      pathResult.error instanceof Error
        ? pathResult.error.message
        : "no pude leer <path> desde stdin.";
    const output = createExecutionErrorOutput(message);

    await emitOutput(output, outputFormat);
    process.exitCode = 2;
    return;
  }

  const pathFromPrompt = pathResult.value;
  const hasEmptyPromptPath = pathFromPrompt === "";

  if (hasEmptyPromptPath) {
    const output = createUsageErrorOutput("Falta <path>: la respuesta interactiva quedo vacia.");
    await emitOutput(output, outputFormat);
    process.exitCode = 2;
    return;
  }

  const requestedPath = pathFromPrompt ?? streams.cwd;

  if (cliArguments.resetState) {
    const statePath = removeAdoptionState(requestedPath);
    const output = createStateResetOutput(statePath);

    await emitOutput(output, outputFormat);
    process.exitCode = 0;
    return;
  }

  const verifySeedResult = await resolveStateBackedVerifySeed({
    cliArguments,
    interactive,
    path: requestedPath,
    streams: { input: streams.stdin, output: streams.stdout },
  });

  if (!verifySeedResult.ok) {
    const message =
      verifySeedResult.error instanceof Error
        ? verifySeedResult.error.message
        : "no pude resolver el lote persistido.";
    const output = createUsageErrorOutput(message);

    await emitOutput(output, outputFormat);
    process.exitCode = 2;
    return;
  }

  const requestedOutput = await runRequestedMode({
    adoptPercent: cliArguments.adoptPercent,
    base: cliArguments.base,
    changed: cliArguments.changed,
    includeTests: cliArguments.includeTests,
    path: requestedPath,
    preset: cliArguments.preset,
    streams,
    useProjectTsconfig: cliArguments.useProjectTsconfig,
    verifySeed: verifySeedResult.value,
  });

  if (!requestedOutput.ok) {
    const message = getUnknownErrorMessage(requestedOutput.error, "fallo desconocido");
    const output = createExecutionErrorOutput(message);

    await emitOutput(output, outputFormat);
    process.exitCode = 2;
    return;
  }

  const output = requestedOutput.value;
  const exitCode = getCliExitCode(output);
  const outputTargetPath = output.targetPath ?? requestedPath;

  if (output.adoption) {
    writeAdoptionState(outputTargetPath, output.adoption);
  }

  if (output.verification?.completed === true) {
    removeAdoptionState(outputTargetPath);
  }

  const outputWrite = await emitOutput(output, outputFormat);
  const finalExitCode = outputWrite.ok ? exitCode : 2;

  process.exitCode = finalExitCode;
}
