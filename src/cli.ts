#!/usr/bin/env node
import { trySafe } from "@skapxd/result";
import { getUnsupportedNodeVersionMessage } from "#/utils/cli/env/get-unsupported-node-version-message";
import { reportCliInfrastructureError } from "#/utils/cli/output/machine/report-cli-infrastructure-error";

async function runCliEntrypoint() {
  const unsupportedNodeVersionMessage = getUnsupportedNodeVersionMessage(
    process.versions.node,
  );

  if (unsupportedNodeVersionMessage) {
    process.stderr.write(`${unsupportedNodeVersionMessage}\n`);
    process.exitCode = 2;
    return;
  }

  const cliModule = await trySafe(() => import("#/utils/cli/commands/run-skapxd-lint"));

  if (!cliModule.ok) {
    process.stderr.write("skapxd-lint no pudo cargar el runner del CLI.\n");
    reportCliInfrastructureError(cliModule.error, process.stderr);
    process.exitCode = 2;
    return;
  }

  void cliModule.value.runSkapxdLint({
    argv: process.argv,
    cwd: process.cwd(),
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr,
  });
}

void runCliEntrypoint();
