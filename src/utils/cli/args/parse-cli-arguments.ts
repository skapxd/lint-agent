import { parseArgs } from "node:util";
import { trySafe } from "@skapxd/result";
import { toCliAdoptPercent } from "./to-cli-adopt-percent";
import { toCliOutputFormat } from "./to-cli-output-format";
import { toCliPreset } from "./to-cli-preset";
import type { CliParseResult } from "#/utils/cli/types";

export function parseCliArguments(args: readonly string[]): CliParseResult {
  const parsed = trySafe(() =>
    parseArgs({
      allowPositionals: true,
      args,
      options: {
        adopt: { type: "string" },
        base: { type: "string" },
        changed: { type: "boolean" },
        format: { type: "string" },
        help: { short: "h", type: "boolean" },
        "include-tests": { type: "boolean" },
        "no-interactive": { type: "boolean" },
        preset: { type: "string" },
        yes: { type: "boolean" },
      },
      strict: true,
    }),
  );

  if (!parsed.ok) {
    const message =
      parsed.error instanceof Error ? parsed.error.message : "argumentos invalidos";

    return {
      message: `Uso invalido: ${message}. Ejecuta \`skapxd-lint --help\`.`,
      ok: false,
    };
  }

  const helpCommand = parsed.value.positionals[0] === "help";
  const path = helpCommand ? null : (parsed.value.positionals[0] ?? null);
  const hasTooManyPositionals =
    parsed.value.positionals.length > 1 && !helpCommand;
  if (hasTooManyPositionals) {
    return {
      message:
        "Uso invalido: se esperaba un solo <path>. Ejecuta `skapxd-lint --help`.",
      ok: false,
    };
  }

  const rawPreset = parsed.value.values.preset ?? null;
  const preset = rawPreset ? toCliPreset(rawPreset) : null;
  const hasInvalidPreset = rawPreset !== null && preset === null;
  if (hasInvalidPreset) {
    return {
      message:
        "Uso invalido: --preset <name> espera uno de astro, base, nest, next, package.",
      ok: false,
    };
  }

  const rawFormat = parsed.value.values.format ?? null;
  const format = rawFormat ? toCliOutputFormat(rawFormat) : null;
  const hasInvalidFormat = rawFormat !== null && format === null;
  if (hasInvalidFormat) {
    return {
      message: "Uso invalido: --format <json|compact|toon> espera json, compact o toon.",
      ok: false,
    };
  }

  const rawAdoptPercent = parsed.value.values.adopt ?? null;
  const adoptPercent =
    rawAdoptPercent === null ? null : toCliAdoptPercent(rawAdoptPercent);
  const hasInvalidAdoptPercent =
    rawAdoptPercent !== null && adoptPercent === null;
  if (hasInvalidAdoptPercent) {
    return {
      message: `Uso invalido: --adopt <percent> espera un entero entre 0 y 100; recibi ${rawAdoptPercent}.`,
      ok: false,
    };
  }

  return {
    ok: true,
    value: {
      adoptPercent,
      base: parsed.value.values.base ?? null,
      changed: parsed.value.values.changed === true,
      format,
      forceNonInteractive:
        parsed.value.values["no-interactive"] === true ||
        parsed.value.values.yes === true,
      help: parsed.value.values.help === true || helpCommand,
      includeTests: parsed.value.values["include-tests"] === true,
      path,
      preset,
      rawPreset,
    },
  };
}
