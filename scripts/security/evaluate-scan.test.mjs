import assert from "node:assert/strict";
import { test } from "node:test";
import { evaluateScan } from "./evaluate-scan.mjs";

const clean = () => ({ issues: 0, errors: {}, results: { "threat-example": {} }, risk_score: { score: 0 }, risks: [] });
const match = { location: "index.js:1", message: "fixture" };

test("distingue scan limpio de capacidades observadas", () => {
  assert.equal(evaluateScan(0, clean()).status, "clean");
  const observation = { ...clean(), issues: 1, results: { "capability-filesystem-read": [match] } };
  assert.equal(evaluateScan(0, observation).status, "observations");
  assert.equal(evaluateScan(0, observation).findings.length, 1);
});

test("bloquea amenazas aun con codigo 0 y score cero", () => {
  assert.equal(evaluateScan(0, { ...clean(), issues: 1, results: { "threat-example": [match] } }).status, "detections");
  assert.equal(evaluateScan(0, { ...clean(), risks: [{ name: "risk" }] }).status, "detections");
  assert.equal(evaluateScan(0, { ...clean(), risk_score: { score: 0.1 } }).status, "detections");
});

test("bloquea errores de proceso, JSON e internos, aunque issues sea cero", () => {
  for (const code of [1, 2, null]) assert.equal(evaluateScan(code, clean()).status, "error");
  for (const report of [undefined, {}, [], { ...clean(), errors: { rule: "timeout" } }, { ...clean(), results: {} }, { ...clean(), issues: 1 }, { ...clean(), results: { rule: "unexpected" } }]) {
    assert.equal(evaluateScan(0, report).status, "error");
  }
});
