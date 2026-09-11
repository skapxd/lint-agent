import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
execFileSync(process.execPath, ["scripts/sync-socket-badge.mjs", "--check"], { stdio: "inherit" });
if (process.env.GITHUB_REF?.startsWith("refs/tags/") && process.env.GITHUB_REF !== `refs/tags/v${pkg.version}`) {
  throw new Error("El tag no coincide con package.json");
}
mkdirSync("release-artifact", { recursive: true });
const output = execFileSync("npx", ["-y", "npm@11.18.0", "pack", "--json", "--ignore-scripts", "--pack-destination", "release-artifact"], { encoding: "utf8" });
const [pack] = JSON.parse(output);
if (pack?.name !== pkg.name || pack?.version !== pkg.version || !/^[\w.-]+\.tgz$/.test(pack.filename)) {
  throw new Error("npm pack devolvio un artefacto inesperado");
}
const sha256 = createHash("sha256").update(readFileSync(`release-artifact/${pack.filename}`)).digest("hex");
writeFileSync("release-artifact/pack.json", output);
writeFileSync("release-artifact/manifest.json", JSON.stringify({
  commit: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  createdAt: new Date().toISOString(),
  workingTreeDirty: Boolean(execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }).trim()),
  name: pkg.name,
  version: pkg.version,
  filename: pack.filename,
  sha256,
}, null, 2) + "\n");
console.log(`Artefacto: ${pack.filename}; SHA-256: ${sha256}`);
