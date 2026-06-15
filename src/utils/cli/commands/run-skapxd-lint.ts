import { Result, trySafe } from "@skapxd/result";
import { createHelpText } from "#/utils/cli/output/interactive/create-help-text";
import { createExecutionErrorOutput } from "#/utils/cli/output/machine/create-execution-error-output";
import { createUsageErrorOutput } from "#/utils/cli/output/machine/create-usage-error-output";
import { getCliExitCode } from "#/utils/cli/output/machine/get-cli-exit-code";
import { getCliOutputFormat } from "#/utils/cli/args/get-cli-output-format";
import { isInteractiveSession } from "#/utils/cli/output/interactive/is-interactive-session";
import { parseCliArguments } from "#/utils/cli/args/parse-cli-arguments";
import { promptForPath } from "#/utils/cli/output/interactive/prompt-for-path";
import { createStateResetOutput } from "#/utils/cli/state/create-state-reset-output";
import { removeAdoptionState } from "#/utils/cli/state/remove-adoption-state";
import { resolveStateBackedVerifySeed } from "#/utils/cli/state/resolve-state-backed-verify-seed";
import { runRequestedMode } from "./run-requested-mode";
import { writeAdoptionState } from "#/utils/cli/state/write-adoption-state";
import { writeCliOutputOrReport } from "#/utils/cli/output/machine/write-cli-output-or-report";
import type { CliStreams } from "#/utils/cli/types";

/**
 * Orquesta el CLI completo sin mezclar UX interactiva, persistencia de lotes y ejecucion de ESLint en los helpers de bajo nivel. La funcion decide el modo, normaliza la salida y traduce cada fallo a un payload estable para humanos o maquinas.
 *
 * Orden de control: parsear args -> ayuda/uso invalido -> resolver path interactivo o explicito -> reset/state-backed verify -> ejecutar modo solicitado -> persistir o limpiar seed -> escribir salida y exit code.
 *
 * Ej.: sin `<path>` en terminal interactiva pregunta por ruta; sin `<path>` con `--yes` devuelve usage-error; con `--verify` vacio puede recuperar la seed persistida antes de correr el lote.
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

  if (parsed.value.help) {
    streams.stdout.write(`${createHelpText()}\n`);
    process.exitCode = 0;
    return;
  }

  const canUseInteractiveMode = parsed.value.format === null;
  const interactive = canUseInteractiveMode && isInteractiveSession(parsed.value, streams);
  const outputFormat = getCliOutputFormat(parsed.value, interactive);
  const missingPath = parsed.value.path === null && !parsed.value.changed;
  const mustFailBecausePathIsMissing = missingPath && !interactive;

  if (mustFailBecausePathIsMissing) {
    const output = createUsageErrorOutput(
      "Falta <path>. En modo no-interactivo el CLI nunca pregunta; pasa `skapxd-lint <path> --yes` o usa `skapxd-lint --changed --yes`.",
    );
    await writeCliOutputOrReport(output, streams.stdout, streams.stderr, outputFormat);
    process.exitCode = 2;
    return;
  }

  const pathResult =
    missingPath && interactive
      ? await promptForPath({ input: streams.stdin, output: streams.stdout })
      : Result.ok(parsed.value.path);

  if (!pathResult.ok) {
    const message =
      pathResult.error instanceof Error
        ? pathResult.error.message
        : "no pude leer <path> desde stdin.";
    const output = createExecutionErrorOutput(message);

    await writeCliOutputOrReport(output, streams.stdout, streams.stderr, outputFormat);
    process.exitCode = 2;
    return;
  }

  const pathFromPrompt = pathResult.value;
  const hasEmptyPromptPath = pathFromPrompt === "";

  if (hasEmptyPromptPath) {
    const output = createUsageErrorOutput("Falta <path>: la respuesta interactiva quedo vacia.");
    await writeCliOutputOrReport(output, streams.stdout, streams.stderr, outputFormat);
    process.exitCode = 2;
    return;
  }

  const requestedPath = pathFromPrompt ?? streams.cwd;

  if (parsed.value.resetState) {
    const statePath = removeAdoptionState(requestedPath);
    const output = createStateResetOutput(statePath);

    await writeCliOutputOrReport(output, streams.stdout, streams.stderr, outputFormat);
    process.exitCode = 0;
    return;
  }

  const verifySeedResult = await resolveStateBackedVerifySeed({
    cliArguments: parsed.value,
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

    await writeCliOutputOrReport(output, streams.stdout, streams.stderr, outputFormat);
    process.exitCode = 2;
    return;
  }

  const requestedOutput = await trySafe(() =>
    runRequestedMode({
      adoptPercent: parsed.value.adoptPercent,
      base: parsed.value.base,
      changed: parsed.value.changed,
      includeTests: parsed.value.includeTests,
      path: requestedPath,
      preset: parsed.value.preset,
      streams,
      verifySeed: verifySeedResult.value,
    }),
  );

  if (!requestedOutput.ok) {
    const message =
      requestedOutput.error instanceof Error
        ? requestedOutput.error.message
        : "fallo desconocido";
    const output = createExecutionErrorOutput(message);

    await writeCliOutputOrReport(output, streams.stdout, streams.stderr, outputFormat);
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

  const outputWrite = await writeCliOutputOrReport(
    output,
    streams.stdout,
    streams.stderr,
    outputFormat,
  );
  const finalExitCode = outputWrite.ok ? exitCode : 2;

  process.exitCode = finalExitCode;
}
