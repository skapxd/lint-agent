import { Result, trySafe } from "@skapxd/result";
import { createHelpText } from "#/utils/cli/output/interactive/create-help-text";
import { createExecutionErrorOutput } from "#/utils/cli/output/machine/create-execution-error-output";
import { createUsageErrorOutput } from "#/utils/cli/output/machine/create-usage-error-output";
import { getCliExitCode } from "#/utils/cli/output/machine/get-cli-exit-code";
import { getCliOutputFormat } from "#/utils/cli/args/get-cli-output-format";
import { isInteractiveSession } from "#/utils/cli/output/interactive/is-interactive-session";
import { parseCliArguments } from "#/utils/cli/args/parse-cli-arguments";
import { promptForPath } from "#/utils/cli/output/interactive/prompt-for-path";
import { runRequestedMode } from "./run-requested-mode";
import { withChangedAlias } from "#/utils/cli/args/with-changed-alias";
import { writeCliOutput } from "#/utils/cli/output/machine/write-cli-output";
import type { CliStreams } from "#/utils/cli/types";

export async function runSkapxdLint(streams: CliStreams) {
  const args = withChangedAlias(streams.argv);
  const parsed = parseCliArguments(args);
  const hasParseError = !parsed.ok;

  if (hasParseError) {
    const output = createUsageErrorOutput(parsed.message);
    writeCliOutput(output, streams.stdout, "json");
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
    writeCliOutput(output, streams.stdout, outputFormat);
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

    writeCliOutput(output, streams.stdout, outputFormat);
    process.exitCode = 2;
    return;
  }

  const pathFromPrompt = pathResult.value;
  const hasEmptyPromptPath = pathFromPrompt === "";

  if (hasEmptyPromptPath) {
    const output = createUsageErrorOutput("Falta <path>: la respuesta interactiva quedo vacia.");
    writeCliOutput(output, streams.stdout, outputFormat);
    process.exitCode = 2;
    return;
  }

  const requestedOutput = await trySafe(() =>
    runRequestedMode({
      adoptPercent: parsed.value.adoptPercent,
      base: parsed.value.base,
      changed: parsed.value.changed,
      includeTests: parsed.value.includeTests,
      path: pathFromPrompt ?? streams.cwd,
      preset: parsed.value.preset,
      streams,
    }),
  );

  if (!requestedOutput.ok) {
    const message =
      requestedOutput.error instanceof Error
        ? requestedOutput.error.message
        : "fallo desconocido";
    const output = createExecutionErrorOutput(message);

    writeCliOutput(output, streams.stdout, outputFormat);
    process.exitCode = 2;
    return;
  }

  const output = requestedOutput.value;
  const exitCode = getCliExitCode(output);

  writeCliOutput(output, streams.stdout, outputFormat);
  process.exitCode = exitCode;
}
