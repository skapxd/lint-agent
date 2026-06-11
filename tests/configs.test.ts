import { describe, expect, it } from "vitest";
import plugin from "../src/index";
import { matchesAnyGlob } from "../src/utils/matches-any-glob";

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

describe("contrato de errores: await-requires-result manda", () => {
  it("es obligatoria en todos los presets tipados", () => {
    const typedPresets = [
      plugin.configs.backend,
      plugin.configs.frontend,
      plugin.configs.next.find(
        (config: { name: string }) => config.name === "skapxd/next/server",
      ),
      plugin.configs.astro.find(
        (config: { name: string }) => config.name === "skapxd/astro/typescript",
      ),
    ];

    for (const preset of typedPresets) {
      expect(
        preset.rules["skapxd/await-requires-result"],
        preset.name,
      ).toBe("error");
    }
  });

  it("async-functions-return-result está apagada por defecto en todos los presets", () => {
    const allPresets = [
      plugin.configs.base,
      plugin.configs.backend,
      plugin.configs.frontend,
      plugin.configs.package,
      ...plugin.configs.next,
      ...plugin.configs.astro,
    ];

    for (const preset of allPresets) {
      expect(
        preset.rules?.["skapxd/async-functions-return-result"],
        preset.name,
      ).toBeUndefined();
    }
  });
});

describe("no-default-export en el preset next", () => {
  it("exime automáticamente los entrypoints del App Router", () => {
    const nextBase = plugin.configs.next.find(
      (config: { name: string }) => config.name === "skapxd/next/base",
    );
    const [severity, options] = nextBase.rules["skapxd/no-default-export"];

    expect(severity).toBe("error");

    const globs = options.allowFilePatterns;

    expect(matchesAnyGlob("src/app/dashboard/page.tsx", globs)).toBe(true);
    expect(matchesAnyGlob("src/app/layout.tsx", globs)).toBe(true);
    expect(matchesAnyGlob("src/app/sitemap.ts", globs)).toBe(true);
    expect(matchesAnyGlob("src/app/components/card.tsx", globs)).toBe(false);
  });
});

describe("severidades", () => {
  it("ningún preset usa warn: error, u off por scoping deliberado", () => {
    const presets = [
      plugin.configs.base,
      plugin.configs.backend,
      plugin.configs.frontend,
      plugin.configs.package,
      ...plugin.configs.nest,
      ...plugin.configs.next,
      ...plugin.configs.astro,
    ];

    for (const preset of presets) {
      for (const [rule, entry] of Object.entries(preset.rules ?? {})) {
        const severity = Array.isArray(entry) ? entry[0] : entry;

        expect(severity, `${preset.name} → ${rule}`).not.toBe("warn");
      }
    }
  });
});

describe("preset nest", () => {
  it("exime los entrypoints del bootstrap en await-requires-result", () => {
    const nestBase = plugin.configs.nest.find(
      (config: { name: string }) => config.name === "skapxd/nest/base",
    );
    const [severity, options] =
      nestBase.rules["skapxd/await-requires-result"];

    expect(severity).toBe("error");
    expect(nestBase.languageOptions?.parser).toBeDefined();
    expect(matchesAnyGlob("src/main.ts", options.allowFilePatterns)).toBe(true);
    expect(
      matchesAnyGlob("src/modules/loan/loan.service.ts", options.allowFilePatterns),
    ).toBe(false);
    expect(nestBase.rules["skapxd/nest-no-result-response"]).toBe("error");
  });

  it("relaja en specs lo que los tests no pueden cumplir", () => {
    const nestTests = plugin.configs.nest.find(
      (config: { name: string }) => config.name === "skapxd/nest/tests",
    );

    expect(nestTests.rules["skapxd/await-requires-result"]).toBe("off");
    expect(nestTests.rules["skapxd/no-try-catch"]).toBe("off");
    expect(nestTests.rules["skapxd/result-error-requires-handling"]).toBe("off");
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
