import { readFileSync, writeFileSync } from "node:fs";

const { name, version } = JSON.parse(readFileSync("package.json", "utf8"));
// Formato obtenido del generador oficial de Socket el 2026-09-11.
const badge = `[![Socket: paquete npm](https://badge.socket.dev/npm/package/${name}/${version})](https://socket.dev/npm/package/${name}/overview/${version})`;
const readme = readFileSync("README.md", "utf8");
const pattern = /^\[!\[Socket: paquete npm\].*$/m;
if (!pattern.test(readme)) throw new Error("Falta el badge Socket en README.md");
const updated = readme.replace(pattern, badge);
if (process.argv.includes("--check")) {
  if (updated !== readme) throw new Error("Badge Socket desalineado: ejecuta pnpm security:badge y commitea README.md");
} else {
  writeFileSync("README.md", updated);
}
