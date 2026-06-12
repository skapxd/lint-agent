// nest-cli.json admite plugins como string o como objeto { name, options }.
type NestCliConfig = {
  compilerOptions?: {
    plugins?: Array<string | { name?: string }>;
  };
};

export function nestCliHasSwaggerPlugin(nestCliConfig: NestCliConfig) {
  const plugins = nestCliConfig.compilerOptions?.plugins ?? [];

  return plugins.some((plugin: string | { name?: string }) =>
    typeof plugin === "string"
      ? plugin === "@nestjs/swagger"
      : plugin.name === "@nestjs/swagger",
  );
}
