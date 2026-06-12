import { stringArrayOption } from "#/utils/string-array-option";
import type { RuleOptions } from "#/utils/rule-types";
export function getUntrustedModuleOptions(options: RuleOptions = {}) {
  return {
    // Globs de los archivos adaptador: el UNICO lugar desde donde se permite
    // importar los modulos declarados como no confiables.
    adapterFilePatterns: stringArrayOption(options, "adapterFilePatterns", []),
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
    // Inventario de paquetes cuyos tipos mienten (p. ej. @types desfasados).
    // Vacio por defecto: la regla es inerte hasta que el proyecto declara
    // sus sospechosos.
    modules: stringArrayOption(options, "modules", []),
  };
}
