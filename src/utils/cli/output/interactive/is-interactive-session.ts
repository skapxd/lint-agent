import type { CliArguments, CliStreams } from "#/utils/cli/types";

export function isInteractiveSession(
  cliArguments: CliArguments,
  streams: CliStreams,
) {
  const stdinHasTty = streams.stdin.isTTY === true;
  const stdoutHasTty = streams.stdout.isTTY === true;
  const hasTty = stdinHasTty && stdoutHasTty;

  return hasTty && !cliArguments.forceNonInteractive;
}
