// @ts-nocheck
// Convierte un glob legible a RegExp: `*` (un segmento), `**` (cualquier
// profundidad), `?` (un carácter), `{a,b}` (alternativas). Un patrón sin
// prefijo matchea en cualquier carpeta ("src/index.ts" encuentra
// "/repo/src/index.ts"); con `**/` o `/` inicial, se respeta tal cual.
export function globToRegExp(glob) {
  const escaped = glob.replace(/[.+^$()|[\]\\]/g, "\\$&");

  // Placeholders para que los `*`/`?` de un reemplazo no se vuelvan a
  // reemplazar en los pasos siguientes.
  const pattern = escaped
    .replace(/\{([^}]*)\}/g, (_, alternatives) => `(${alternatives.split(",").join("|")})`)
    .replace(/\*\*\//g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "[^/]*")
    .replace(/\?/g, "[^/]")
    .replaceAll("", "(.*/)?")
    .replaceAll("", ".*");

  const prefix = glob.startsWith("/") || glob.startsWith("**") ? "^" : "(^|/)";

  return new RegExp(`${prefix}${pattern}$`);
}
