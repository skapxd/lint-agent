import { execFileSync, spawnSync } from "node:child_process";
import { appendFileSync, cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { evaluateScan } from "./evaluate-scan.mjs";
import { verifyArtifact } from "./verify-artifact.mjs";

const commit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const artifact = verifyArtifact("release-artifact", commit);
const scanner = process.env.GUARDDOG_BIN ?? "guarddog";
const version = spawnSync(scanner, ["--version"], { encoding: "utf8" });
const sources = mkdtempSync(`${tmpdir()}/lint-agent-source-`);
const scope = ["src", "scripts", "package.json", "tsup.config.ts", "tsconfig.json", "tsconfig.build.json", "eslint.config.ts", "vitest.config.ts"];
mkdirSync("security-reports", { recursive: true });
const report = {
  commit, prHead: process.env.PR_HEAD_SHA ?? null, date: new Date().toISOString(),
  scanner: version.stdout?.trim(), expectedVersion: "3.2.0", artifact,
  policy: "Bloquear amenazas, riesgos y errores. Conservar capacidades como observaciones. Sin excepciones.",
  sourceScope: scope, scans: [],
};
try {
  // El prefijo package/ permite que reglas como */package.json incluyan el manifiesto raiz.
  mkdirSync(`${sources}/package`);
  for (const path of scope) cpSync(path, `${sources}/package/${path}`, { recursive: true });
  for (const [name, target] of [["sources", sources], ["tarball", resolve("release-artifact", artifact.filename)]]) {
    const args = ["npm", "scan", target, "--output-format", "json"];
    const scan = spawnSync(scanner, args, { encoding: "utf8", timeout: 300_000, maxBuffer: 32 * 1024 * 1024 });
    writeFileSync(`security-reports/${name}.json`, scan.stdout ?? "");
    writeFileSync(`security-reports/${name}.stderr.log`, (scan.stderr ?? "") + (scan.error ? `\n${scan.error.message}` : ""));
    let data;
    try { data = JSON.parse(scan.stdout); } catch { /* El evaluador convierte JSON invalido en error bloqueante. */ }
    const result = evaluateScan(scan.status, data);
    if (version.status !== 0 || !/\b3\.2\.0$/.test(report.scanner ?? "")) {
      Object.assign(result, { status: "error", reason: "Version de GuardDog ausente o distinta de 3.2.0" });
    }
    report.scans.push({ name, command: [scanner, ...args], exitCode: scan.status, issues: data?.issues, risks: data?.risks, ...result });
  }
} finally {
  rmSync(sources, { recursive: true, force: true });
}
writeFileSync("security-reports/report.json", JSON.stringify(report, null, 2) + "\n");
// El contenido analizado no puede inyectar HTML ni filas de Markdown en el resumen.
const escape = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("|", "&#124;").replace(/[\r\n]/g, " ");
const lines = ["## GuardDog: fuentes y paquete npm", "", `Commit base: ${commit}; cambios locales sin commit: ${artifact.workingTreeDirty ? "si" : "no"}`, "", `Head del PR: ${report.prHead ?? "no aplica"}`, "", `Fecha UTC: ${report.date}; escaner: ${escape(report.scanner)}.`, "", `Paquete: ${artifact.name}@${artifact.version}; SHA-256: ${artifact.sha256}`, "", `Fuentes: ${scope.join(", ")}. El otro alcance es el contenido del tgz completo; no se instalan sus dependencias.`, "", report.policy, "", "| Alcance | Proceso | Resultado | issues (contador nativo) |", "| --- | --- | --- | --- |"];
for (const scan of report.scans) lines.push(`| ${scan.name} | ${scan.exitCode ?? "no termino"} | ${escape(scan.status)}: ${escape(scan.reason)} | ${scan.issues ?? "desconocido"} |`);
lines.push("", "### Hallazgos conservados", "", "| Alcance | Regla | Ubicacion | Descripcion |", "| --- | --- | --- | --- |");
for (const scan of report.scans) for (const finding of scan.findings ?? []) lines.push(`| ${scan.name} | ${escape(finding.rule)} | ${escape(finding.location)} | ${escape(finding.message)} |`);
lines.push("", "Consulta los JSON y stderr del artefacto security-reports para diagnosticos y riesgos completos. Las reglas YARA tienen filtros por archivo y limites de coincidencias: estos conteos no son un inventario exhaustivo. Sin detecciones no significa ausencia de malware.", "");
const markdown = lines.join("\n");
writeFileSync("security-reports/report.md", markdown);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
console.log(report.scans.map(scan => `${scan.name}: ${scan.status}`).join("\n"));
process.exitCode = report.scans.some(scan => scan.status === "error") ? 2 : report.scans.some(scan => scan.status === "detections") ? 1 : 0;
