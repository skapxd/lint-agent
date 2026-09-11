import { appendFileSync, readFileSync } from "node:fs";
import { verifyArtifact } from "./verify-artifact.mjs";

const artifact = verifyArtifact("release-artifact", process.env.GITHUB_SHA);
const report = JSON.parse(readFileSync("security-reports/report.json", "utf8"));
if (artifact.workingTreeDirty !== false || report.commit !== artifact.commit || report.artifact.sha256 !== artifact.sha256 ||
    report.scans.length !== 2 || !["sources", "tarball"].every(name => report.scans.some(scan => scan.name === name && ["clean", "observations"].includes(scan.status)))) {
  throw new Error("Falta evidencia aprobada para este artefacto");
}
if (process.env.GITHUB_REF !== `refs/tags/v${artifact.version}`) throw new Error("Tag y artefacto no coinciden");
appendFileSync(process.env.GITHUB_OUTPUT, `package_file=release-artifact/${artifact.filename}\n`);
