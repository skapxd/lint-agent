import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { test } from "node:test";

test("el release rechaza un badge viejo y lo sincroniza desde package.json", () => {
  const directory = mkdtempSync(`${tmpdir()}/socket-badge-test-`);
  const script = resolve("scripts/sync-socket-badge.mjs");
  try {
    writeFileSync(`${directory}/package.json`, JSON.stringify({ name: "@scope/package", version: "2.0.0" }));
    writeFileSync(`${directory}/README.md`, "[![Socket: paquete npm](https://badge.socket.dev/npm/package/@scope/package/1.0.0)](https://socket.dev/npm/package/@scope/package/overview/1.0.0)\n");
    const run = args => spawnSync(process.execPath, [script, ...args], { cwd: directory });
    assert.equal(run(["--check"]).status, 1);
    assert.equal(run([]).status, 0);
    assert.equal(run(["--check"]).status, 0);
    assert.match(readFileSync(`${directory}/README.md`, "utf8"), /\/overview\/2\.0\.0/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
