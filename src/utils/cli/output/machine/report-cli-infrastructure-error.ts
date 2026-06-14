export function reportCliInfrastructureError(
  error: unknown,
  stream: NodeJS.WriteStream,
) {
  const errorIsNativeError = error instanceof Error;

  if (errorIsNativeError) {
    stream.write(`${error.stack ?? error.message}\n`);
    return;
  }

  stream.write(`${String(error)}\n`);
}
