import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { test } from "node:test";
import { evaluateScan } from "./evaluate-scan.mjs";

test("contrato real: limpio, deteccion con exit 0, flag con exit 1 y archivo corrupto", { skip: !process.env.GUARDDOG_BIN }, () => {
  const directory = mkdtempSync(`${tmpdir()}/guarddog-probe-`);
  try {
    // GuardDog selecciona */package.json: se preserva la forma del tgz npm.
    mkdirSync(`${directory}/package`);
    writeFileSync(`${directory}/package/package.json`, JSON.stringify({ name: "local-probe", version: "1.0.0" }));
    const scan = (target, flags = []) => spawnSync(process.env.GUARDDOG_BIN, ["npm", "scan", target, "--output-format", "json", ...flags], { encoding: "utf8", timeout: 60_000 });
    const clean = scan(directory);
    assert.equal(clean.status, 0, clean.stderr);
    assert.equal(evaluateScan(clean.status, JSON.parse(clean.stdout)).status, "clean");
    // Solo se analiza este texto; nunca se ejecuta npm install ni el script.
    writeFileSync(`${directory}/package/package.json`, JSON.stringify({ name: "local-probe", version: "1.0.0", scripts: { preinstall: "echo fixture-only" } }));
    const detection = scan(directory);
    assert.equal(detection.status, 0, detection.stderr);
    assert.equal(evaluateScan(detection.status, JSON.parse(detection.stdout)).status, "detections");
    const strict = scan(directory, ["--exit-non-zero-on-finding"]);
    assert.equal(strict.status, 1);
    assert.ok(JSON.parse(strict.stdout).issues > 0);
    writeFileSync(`${directory}/broken.tgz`, "not an archive");
    const failure = scan(`${directory}/broken.tgz`);
    assert.equal(failure.status, 1);
    assert.equal(evaluateScan(failure.status, undefined).status, "error");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
