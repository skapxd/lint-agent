import { describe, expect, it } from "vitest";
import plugin from "../src/index";

describe("configs.strict", () => {
  it("expone el preset endurecido con noInlineConfig", () => {
    expect(plugin.configs.strict.linterOptions.noInlineConfig).toBe(true);
  });
});

describe("configs.frontend", () => {
  it("exige que todo await resuelva en Result sin obligar a retornarlo", () => {
    const config = plugin.configs.frontend;

    expect(config.rules["skapxd/await-requires-result"]).toBe("error");
    expect(config.rules["skapxd/async-functions-return-result"]).toBeUndefined();
  });
});

describe("alias deprecado await-requires-try-safe", () => {
  it("sigue registrado, marcado como deprecado y apunta al nombre nuevo", () => {
    const alias = plugin.rules["await-requires-try-safe"];

    expect(alias).toBeDefined();
    expect(alias.meta?.deprecated).toBe(true);
    expect(alias.meta?.replacedBy).toContain("skapxd/await-requires-result");
    expect(alias.create).toBe(plugin.rules["await-requires-result"].create);
  });
});

describe("severidades", () => {
  it("ningún preset usa warn: todas las reglas son error", () => {
    const presets = [
      plugin.configs.base,
      plugin.configs.backend,
      plugin.configs.frontend,
      plugin.configs.package,
      ...plugin.configs.next,
      ...plugin.configs.astro,
    ];

    for (const preset of presets) {
      for (const [rule, entry] of Object.entries(preset.rules ?? {})) {
        const severity = Array.isArray(entry) ? entry[0] : entry;

        expect(severity, `${preset.name} → ${rule}`).toBe("error");
      }
    }
  });
});

describe("parser de TypeScript en los presets", () => {
  it("todo preset que aplica a TS trae su parser (standalone, sin tseslint del consumidor)", () => {
    const presets = [
      plugin.configs.base,
      plugin.configs.backend,
      plugin.configs.frontend,
      plugin.configs.package,
      ...plugin.configs.next,
      ...plugin.configs.astro.filter(
        (config: { name: string }) => config.name !== "skapxd/astro/astro-files",
      ),
    ];

    for (const preset of presets) {
      expect(preset.languageOptions?.parser, preset.name).toBeDefined();
    }
  });

  it("el bloque de .astro no impone parser (lo aporta eslint-plugin-astro)", () => {
    const astroFiles = plugin.configs.astro.find(
      (config: { name: string }) => config.name === "skapxd/astro/astro-files",
    );

    expect(astroFiles).toBeDefined();
    expect(astroFiles.languageOptions).toBeUndefined();
  });
});
