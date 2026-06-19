import type { CliIoError } from "#/utils/cli/types";

export function reportCliInfrastructureError(
  error: CliIoError,
  stream: NodeJS.WriteStream,
) {
  const cause = "cause" in error ? error.cause : undefined;
  const causeIsNativeError = cause instanceof Error;

  if (causeIsNativeError) {
    stream.write(`${cause.stack ?? error.message}\n`);
    return;
  }

  stream.write(`${error.message}\n`);
}
