import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { test } from "node:test";
import { verifyArtifact } from "./verify-artifact.mjs";

test("rechaza artefactos modificados, de otro commit o fuera del directorio", () => {
  const directory = mkdtempSync(`${tmpdir()}/artifact-test-`);
  const manifest = { filename: "package.tgz", commit: "commit", sha256: createHash("sha256").update("original").digest("hex") };
  try {
    writeFileSync(`${directory}/package.tgz`, "original");
    writeFileSync(`${directory}/manifest.json`, JSON.stringify(manifest));
    assert.equal(verifyArtifact(directory, "commit").sha256, manifest.sha256);
    assert.throws(() => verifyArtifact(directory, "other"));
    writeFileSync(`${directory}/package.tgz`, "modified");
    assert.throws(() => verifyArtifact(directory, "commit"));
    writeFileSync(`${directory}/manifest.json`, JSON.stringify({ ...manifest, filename: "../package.tgz" }));
    assert.throws(() => verifyArtifact(directory, "commit"));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
