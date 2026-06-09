#!/usr/bin/env node
// @ts-nocheck
import { execSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { trySafe } from "@skapxd/result";
import { Command } from "commander";
import { ESLint } from "eslint";

const lintableFile = /\.(c|m)?[jt]sx?$/;

async function lintChanged(base) {
  function git(command, options = {}) {
    const result = trySafe(() =>
      execSync(command, {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "ignore"],
        ...options,
      }),
    );

    return result.ok ? result.value : "";
  }

  function getChangedFiles() {
    // git diff --name-only devuelve rutas relativas a la RAÍZ del repo, no al
    // cwd: se resuelven contra ella para que el bin funcione desde cualquier
    // subdirectorio (p. ej. un subpaquete de un monorepo).
    const root = git("git rev-parse --show-toplevel").trim() || process.cwd();
    // Con --base: cambios del branch desde que divergió (CI / PR).
    // Sin --base: lo tocado en el árbol de trabajo + archivos sin trackear.
    const range = base ? `${base}...HEAD` : "HEAD";
    const changed = git(`git diff --name-only --diff-filter=ACMR ${range}`);
    const untracked = base
      ? ""
      : git("git ls-files --others --exclude-standard", { cwd: root });
    const lines = `${changed}\n${untracked}`.split("\n").map((line) => line.trim());

    return [...new Set(lines)]
      .filter((file) => file && lintableFile.test(file))
      .map((file) => path.join(root, file));
  }

  const files = getChangedFiles();

  if (files.length === 0) {
    console.log("skapxd-lint-changed: no hay archivos cambiados para lintear.");
    return;
  }

  console.log(`skapxd-lint-changed: linteando ${files.length} archivo(s):`);
  for (const file of files) {
    console.log(`  • ${path.relative(process.cwd(), file)}`);
  }

  const eslint = new ESLint({ warnIgnored: false });
  const lint = await trySafe(() => eslint.lintFiles(files));

  if (!lint.ok) {
    console.error("skapxd-lint-changed: ESLint falló al ejecutarse.");
    console.error(lint.error);
    process.exitCode = 1;
    return;
  }

  const formatter = await eslint.loadFormatter("stylish");
  const output = await formatter.format(lint.value);

  if (output) {
    console.log(output);
    const hasErrors = lint.value.some((result) => result.errorCount > 0);
    process.exitCode = hasErrors ? 1 : 0;
    return;
  }

  console.log("✓ Sin problemas.");
}

new Command()
  .name("skapxd-lint-changed")
  .description(
    "Lintea solo los archivos cambiados (detectados con git) con tus reglas de ESLint.",
  )
  .option(
    "--base <ref>",
    "Rama base: lintea lo que tu branch cambió desde que divergió de ella (CI/PR).",
  )
  .action((options) => lintChanged(options.base ?? null))
  .parseAsync();
