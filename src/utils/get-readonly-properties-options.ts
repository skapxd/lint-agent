import { stringArrayOption } from "#/utils/string-array-option";
import type { RuleOptions } from "#/utils/rule-types";
export function getReadonlyPropertiesOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
    // Regex de nombres de propiedad con mutación inherente (la conexión de
    // un socket, un buffer): la excepción se declara visible en la config.
    allowPropertyPatterns: stringArrayOption(options, "allowPropertyPatterns", []),
    // Una propiedad decorada por el ORM (@Prop de @nestjs/mongoose, @Column
    // de typeorm) le pertenece al ORM y a su modelo de mutación — la
    // exención es por PROPIEDAD, no por nombre de archivo.
    ormModuleSources: stringArrayOption(options, "ormModuleSources", [
      "@nestjs/mongoose",
      "typeorm",
    ]),
  };
}
