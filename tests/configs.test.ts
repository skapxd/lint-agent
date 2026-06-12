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
    const alias = plugin.rules["await-requires-try-safe"]!;

    expect(alias).toBeDefined();
    expect(alias.meta?.deprecated).toBe(true);
    expect(alias.meta?.replacedBy).toContain("skapxd/await-requires-result");
    expect(alias.create).toBe(plugin.rules["await-requires-result"]!.create);
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

  it("inyecta los hooks del framework a la regla agnóstica max-public-methods", () => {
    const nestBase = plugin.configs.nest.find(
      (config: { name: string }) => config.name === "skapxd/nest/base",
    );
    const [severity, options] = nestBase.rules["skapxd/max-public-methods"];

    expect(severity).toBe("error");
    expect(options.ignore).toContain("onModuleInit");
    expect(options.ignore).toContain("canActivate");

    const controllers = plugin.configs.nest.find(
      (config: { name: string }) => config.name === "skapxd/nest/controllers",
    );

    expect(controllers.rules["skapxd/max-public-methods"]).toBe("off");
  });

  it("relaja en specs lo que los tests no pueden cumplir", () => {
    const nestTests = plugin.configs.nest.find(
      (config: { name: string }) => config.name === "skapxd/nest/tests",
    );

    expect(nestTests.rules["skapxd/await-requires-result"]).toBe("off");
    expect(nestTests.rules["skapxd/no-try-catch"]).toBe("off");
    expect(nestTests.rules["skapxd/result-error-requires-handling"]).toBe("off");
    // El ! sobre fixtures es el arrange del test, no una mentira al compilador.
    expect(
      nestTests.rules["@typescript-eslint/no-non-null-assertion"],
    ).toBe("off");
    // Pero un await olvidado en un spec es un falso verde: sigue activa.
    expect(
      nestTests.rules["@typescript-eslint/no-floating-promises"],
    ).toBeUndefined();
  });
});

describe("reglas type-driven de typescript-eslint en presets tipados", () => {
  it("activa el set curado completo en backend, frontend y nest/base", () => {
    const typedPresets = [
      plugin.configs.backend,
      plugin.configs.frontend,
      plugin.configs.nest.find(
        (config: { name: string }) => config.name === "skapxd/nest/base",
      ),
    ];

    for (const preset of typedPresets) {
      expect(
        preset.rules["@typescript-eslint/no-explicit-any"],
        preset.name,
      ).toBe("error");
      expect(
        preset.rules["@typescript-eslint/no-floating-promises"],
        preset.name,
      ).toBe("error");
      expect(
        preset.rules["@typescript-eslint/no-non-null-assertion"],
        preset.name,
      ).toBe("error");
      expect(
        preset.rules["skapxd/no-impossible-branch"],
        preset.name,
      ).toBe("error");
      // El nombre upstream no se activa además: una sola fuente de verdad.
      expect(
        preset.rules["@typescript-eslint/no-unnecessary-condition"],
        preset.name,
      ).toBeUndefined();
    }
  });

  it("no-impossible-branch delega en no-unnecessary-condition con mensajes propios", async () => {
    const { default: tseslint } = await import("typescript-eslint");
    const wrapped = plugin.rules["no-impossible-branch"]!;
    const original = tseslint.plugin.rules!["no-unnecessary-condition"]!;

    expect(wrapped.create).toBe(original.create);
    // Todo messageId upstream existe en el wrapper: ninguno queda huérfano.
    for (const id of Object.keys(original.meta!.messages!)) {
      expect(wrapped.meta?.messages?.[id], id).toBeDefined();
    }
    expect(wrapped.meta?.messages?.alwaysTruthy).toContain(
      "Pregunta ya respondida",
    );
  });

  it("prohíbe ts-ignore y ts-nocheck pero permite ts-expect-error descrito", () => {
    const [severity, options] =
      plugin.configs.backend.rules["@typescript-eslint/ban-ts-comment"];

    expect(severity).toBe("error");
    expect(options["ts-ignore"]).toBe(true);
    expect(options["ts-nocheck"]).toBe(true);
    expect(options["ts-expect-error"]).toBe("allow-with-description");
  });

  it("las ausencias son deliberadas: lo superado no se duplica", () => {
    const backend = plugin.configs.backend;

    // prefer-ts-pattern reemplaza al switch entero.
    expect(
      backend.rules["@typescript-eslint/switch-exhaustiveness-check"],
    ).toBeUndefined();
    // class-properties-require-readonly es más fuerte que prefer-readonly.
    expect(backend.rules["@typescript-eslint/prefer-readonly"]).toBeUndefined();
    expect(
      backend.rules["@typescript-eslint/strict-boolean-expressions"],
    ).toBeUndefined();
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
