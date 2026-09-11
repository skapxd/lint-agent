import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

export function verifyArtifact(directory, commit) {
  const manifest = JSON.parse(readFileSync(`${directory}/manifest.json`, "utf8"));
  if (!/^[\w.-]+\.tgz$/.test(manifest.filename) || manifest.commit !== commit) {
    throw new Error("Identidad del artefacto invalida");
  }
  const actual = createHash("sha256").update(readFileSync(`${directory}/${manifest.filename}`)).digest("hex");
  if (actual !== manifest.sha256) throw new Error("El SHA-256 del artefacto no coincide");
  return manifest;
}
