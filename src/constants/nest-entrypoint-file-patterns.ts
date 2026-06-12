// Entrypoints de un proyecto Nest donde exigir Promise<Result> no aplica:
// el bootstrap debe crashear ruidoso, no modelar errores de dominio.
// Globs (matchean en cualquier carpeta), basados en proyectos reales:
// main.ts, main.module.ts/app.module.ts, instrumentation.ts, app-cluster.ts.
export const nestEntrypointFilePatterns = [
  "src/main.ts",
  "src/app-cluster.ts",
  "src/instrumentation.ts",
];
