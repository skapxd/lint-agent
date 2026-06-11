// @ts-nocheck
// nest-cli.json admite plugins como string o como objeto { name, options }.
export function nestCliHasSwaggerPlugin(nestCliConfig) {
  const plugins = nestCliConfig?.compilerOptions?.plugins ?? [];

  return plugins.some(
    (plugin) =>
      plugin === "@nestjs/swagger" || plugin?.name === "@nestjs/swagger",
  );
}
