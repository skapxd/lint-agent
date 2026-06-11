// @ts-nocheck
export function getNestInlineQueryOptions(options = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
    // Un @Query('name') suelto es legítimo; desde 2 ya es un DTO disfrazado.
    max: options.max ?? 1,
  };
}
