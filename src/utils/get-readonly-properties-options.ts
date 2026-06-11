// @ts-nocheck
export function getReadonlyPropertiesOptions(options = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
    // Regex de nombres de propiedad con mutación inherente (la conexión de
    // un socket, un buffer): la excepción se declara visible en la config.
    allowPropertyPatterns: options.allowPropertyPatterns ?? [],
    // Una propiedad decorada por el ORM (@Prop de @nestjs/mongoose, @Column
    // de typeorm) le pertenece al ORM y a su modelo de mutación — la
    // exención es por PROPIEDAD, no por nombre de archivo.
    ormModuleSources: options.ormModuleSources ?? [
      "@nestjs/mongoose",
      "typeorm",
    ],
  };
}
