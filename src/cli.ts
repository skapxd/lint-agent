#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import type { ExecFileSyncOptionsWithStringEncoding } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { trySafe } from "@skapxd/result";
import { Command } from "commander";
import { ESLint } from "eslint";

const lintableFile = /\.(c|m)?[jt]sx?$/;

async function lintChanged(base: string | null) {
  function git(
    args: readonly string[],
    options: Partial<ExecFileSyncOptionsWithStringEncoding> = {},
    failureMessage?: string,
  ) {
    const result = trySafe(() =>
      execFileSync("git", args, {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "ignore"],
        ...options,
      }),
    );

    if (result.ok) {
      return result.value;
    }

    if (failureMessage) {
      console.error(failureMessage);
      process.exitCode = 1;
      return null;
    }

    return "";
  }

  function getChangedFiles() {
    // git diff --name-only devuelve rutas relativas a la RAÍZ del repo, no al
    // cwd: se resuelven contra ella para que el bin funcione desde cualquier
    // subdirectorio (p. ej. un subpaquete de un monorepo).
    const rootOutput = git(["rev-parse", "--show-toplevel"]);
    const root = rootOutput?.trim() || process.cwd();
    // Con --base: cambios del branch desde que divergió (CI / PR).
    // Sin --base: lo tocado en el árbol de trabajo + archivos sin trackear.
    const range = base ? `${base}...HEAD` : "HEAD";
    const changed = git(
      ["diff", "--name-only", "--diff-filter=ACMR", range],
      { stdio: ["pipe", "pipe", "inherit"] },
      "skapxd-lint-changed: git no pudo calcular los cambios.",
    );
    if (changed === null) {
      return null;
    }

    const untracked = base
      ? ""
      : (git(["ls-files", "--others", "--exclude-standard"], { cwd: root }) ??
        "");
    const lines = `${changed}\n${untracked}`
      .split("\n")
      .map((line) => line.trim());

    return [...new Set(lines)]
      .filter((file) => file && lintableFile.test(file))
      .map((file) => path.join(root, file));
  }

  const files = getChangedFiles();
  if (files === null) {
    return;
  }

  const hasNoFiles = files.length === 0;
  if (hasNoFiles) {
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

  const formatter = await trySafe(() => eslint.loadFormatter("stylish"));

  if (!formatter.ok) {
    console.error("skapxd-lint-changed: no pude cargar el formatter de ESLint.");
    console.error(formatter.error);
    process.exitCode = 1;
    return;
  }

  const output = await trySafe(() => formatter.value.format(lint.value));

  if (!output.ok) {
    console.error("skapxd-lint-changed: no pude formatear el reporte.");
    console.error(output.error);
    process.exitCode = 1;
    return;
  }

  if (output.value) {
    console.log(output.value);
    const hasErrors = lint.value.some(
      (result: { errorCount: number }) => result.errorCount > 0,
    );
    process.exitCode = hasErrors ? 1 : 0;
    return;
  }

  console.log("✓ Sin problemas.");
}

// Entrypoint: fire-and-forget declarado con `void` (el patrón que documenta
// no-floating-promises) — lintChanged maneja sus errores y setea exitCode;
// un rechazo de commander debe crashear ruidoso.
void new Command()
  .name("skapxd-lint-changed")
  .description(
    "Lintea solo los archivos cambiados (detectados con git) con tus reglas de ESLint.",
  )
  .option(
    "--base <ref>",
    "Rama base: lintea lo que tu branch cambió desde que divergió de ella (CI/PR).",
  )
  .action((options: { base?: string }) => lintChanged(options.base ?? null))
  .parseAsync();
