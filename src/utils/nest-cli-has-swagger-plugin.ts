import type { LegacyAstNode } from "#/utils/rule-types";
// nest-cli.json admite plugins como string o como objeto { name, options }.
export function nestCliHasSwaggerPlugin(nestCliConfig: LegacyAstNode) {
  const plugins = nestCliConfig?.compilerOptions?.plugins ?? [];

  return plugins.some(
    (plugin: LegacyAstNode) =>
      plugin === "@nestjs/swagger" || plugin?.name === "@nestjs/swagger",
  );
}
