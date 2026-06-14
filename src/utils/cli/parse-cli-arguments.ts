import { parseArgs } from "node:util";
import { trySafe } from "@skapxd/result";
import { toCliPreset } from "./to-cli-preset";
import type { CliParseResult } from "./types";

export function parseCliArguments(args: readonly string[]): CliParseResult {
  const parsed = trySafe(() =>
    parseArgs({
      allowPositionals: true,
      args,
      options: {
        base: { type: "string" },
        changed: { type: "boolean" },
        help: { short: "h", type: "boolean" },
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

  return {
    ok: true,
    value: {
      base: parsed.value.values.base ?? null,
      changed: parsed.value.values.changed === true,
      forceNonInteractive:
        parsed.value.values["no-interactive"] === true ||
        parsed.value.values.yes === true,
      help: parsed.value.values.help === true || helpCommand,
      path,
      preset,
      rawPreset,
    },
  };
}
