import { describe, expect, it } from "vitest";
import plugin from "../src/index";

describe("configs.strict", () => {
  it("expone el preset endurecido con noInlineConfig", () => {
    expect(plugin.configs.strict.linterOptions.noInlineConfig).toBe(true);
  });
});

describe("configs.frontend", () => {
  it("obliga a trySafe en llamadas async sin exigir retornar Result", () => {
    const config = plugin.configs.frontend;

    expect(config.rules["skapxd/await-requires-try-safe"]).toBe("error");
    expect(config.rules["skapxd/async-functions-return-result"]).toBeUndefined();
  });
});

describe("configs.frontendServices", () => {
  it("obliga a trySafe en la capa de servicios del front", () => {
    const config = plugin.configs.frontendServices;

    expect(config.rules["skapxd/await-requires-try-safe"]).toBe("error");
    expect(config.files).toContain("**/services/**/*.{ts,tsx}");
  });
});

describe("parser de TypeScript en los presets", () => {
  it("todo preset que aplica a TS trae su parser (standalone, sin tseslint del consumidor)", () => {
    const presets = [
      plugin.configs.base,
      plugin.configs.backend,
      plugin.configs.frontend,
      plugin.configs.frontendServices,
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
