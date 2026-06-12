import type { LegacyAstNode } from "#/utils/rule-types";
export function getUntrustedModuleOptions(options: LegacyAstNode = {}) {
  return {
    // Globs de los archivos adaptador: el UNICO lugar desde donde se permite
    // importar los modulos declarados como no confiables.
    adapterFilePatterns: options.adapterFilePatterns ?? [],
    allowFilePatterns: options.allowFilePatterns ?? [],
    // Inventario de paquetes cuyos tipos mienten (p. ej. @types desfasados).
    // Vacio por defecto: la regla es inerte hasta que el proyecto declara
    // sus sospechosos.
    modules: options.modules ?? [],
  };
}
