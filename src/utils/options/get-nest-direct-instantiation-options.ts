import { stringArrayOption } from "#/utils/options/string-array-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";
export function getNestDirectInstantiationOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
    // Regex de NOMBRES de clase que se construyen, no se inyectan: errores,
    // excepciones y eventos de dominio, vivan en el archivo que vivan.
    allowedClassPatterns: stringArrayOption(options, "allowedClassPatterns", [
      "(Error|Exception|Event)$",
    ]),
    // Regex de sources internos donde SÍ se permite instanciar (value
    // objects, errores de dominio, DTOs construidos a mano).
    allowedPatterns: stringArrayOption(options, "allowedPatterns", []),
    // Regex que identifican imports internos del proyecto: alias (#/, @/)
    // y relativos. Lo externo (librerías) se instancia libre.
    internalPatterns: stringArrayOption(options, "internalPatterns", [
      "^#/",
      "^@/",
      "^\\./",
      "^\\.\\./",
    ]),
  };
}
