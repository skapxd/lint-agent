// @ts-nocheck
export function getTaggedUnionStateOptions(options = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
    // Nombres que delatan el flag de "estado en proceso". Se exige además
    // que el tipo sea boolean (en la forma de tipos) para mantener precisión.
    loadingPatterns: options.loadingPatterns ?? [
      "^(is|was|esta|estaba)?(loading|fetching|pending|submitting|saving|processing|syncing|refreshing|running|deploying|executing|sending|uploading|downloading|importing|exporting|migrating|polling|connecting|retrying|busy|inprogress|working|cargando|enviando|procesando|guardando|sincronizando|subiendo|descargando|reintentando|consultando|firmando)",
    ],
    // Nombres que delatan el campo de error conviviendo con el flag.
    errorPatterns: options.errorPatterns ?? ["(error|failure|failed|fallo|falla)"],
  };
}
