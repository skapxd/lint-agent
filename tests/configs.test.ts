import { describe, expect, it } from "vitest";
import plugin from "../src/index";
import { matchesAnyGlob } from "../src/utils/matching/matches-any-glob";

type AllowFilePatternsOptions = {
  allowFilePatterns: readonly string[];
};

type SilencedCompilerOptions = {
  "ts-expect-error": string;
  "ts-ignore": boolean;
  "ts-nocheck": boolean;
};

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

describe("alias await-requires-try-safe eliminado en v1.0.0", () => {
  it("ya no existe: la migración es renombrar a await-requires-result", () => {
    expect(plugin.rules["await-requires-try-safe"]).toBeUndefined();
  });
});

describe("contrato de errores: await-requires-result manda", () => {
  it("es obligatoria en todos los presets tipados", () => {
    const typedPresets = [
      plugin.configs.backend,
      plugin.configs.frontend,
      plugin.configs.next.find(
        (config: { name: string }) => config.name === "skapxd/next/server",
      )!,
      plugin.configs.astro.find(
        (config: { name: string }) => config.name === "skapxd/astro/typescript",
      )!,
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

describe("preset package", () => {
  it("trae las bases, el set type-driven y el contrato de empaquetado", () => {
    const preset = plugin.configs.package;

    expect(preset.rules["skapxd/one-root-function-per-file"]).toBe("error");
    // En las bases por decisión del dueño (issue #2): los legacy la apagan
    // en su lista de pendientes.
    expect(preset.rules["skapxd/no-anonymous-condition"]).toBe("error");
    expect(preset.rules["skapxd/await-requires-result"]).toBe("error");
    expect(preset.rules["skapxd/package-requires-typed-exports"]).toBe("error");
    // Inerte sin inventario de modulos sospechosos, pero registrada.
    expect(preset.rules["skapxd/untrusted-module-requires-adapter"]).toBe(
      "error",
    );
    expect(preset.languageOptions?.parser).toBeDefined();
  });
});

describe("no-default-export en el preset next", () => {
  it("exime automáticamente los entrypoints del App Router", () => {
    const nextBase = plugin.configs.next.find(
      (config: { name: string }) => config.name === "skapxd/next/base",
    )!;
    const [severity, options] = nextBase.rules["skapxd/no-default-export"]!;

    expect(severity).toBe("error");

    const globs = (options as AllowFilePatternsOptions).allowFilePatterns;

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
    )!;
    const [severity, options] =
      nestBase.rules["skapxd/await-requires-result"]!;

    expect(severity).toBe("error");
    expect(nestBase.languageOptions?.parser).toBeDefined();
    const allowOptions = options as AllowFilePatternsOptions;

    expect(matchesAnyGlob("src/main.ts", allowOptions.allowFilePatterns)).toBe(true);
    expect(
      matchesAnyGlob(
        "src/modules/loan/loan.service.ts",
        allowOptions.allowFilePatterns,
      ),
    ).toBe(false);
    expect(nestBase.rules["skapxd/nest-no-result-response"]).toBe("error");
  });

  it("inyecta los hooks del framework a la regla agnóstica max-public-methods", () => {
    const nestBase = plugin.configs.nest.find(
      (config: { name: string }) => config.name === "skapxd/nest/base",
    )!;
    const [severity, options] = nestBase.rules["skapxd/max-public-methods"]!;

    expect(severity).toBe("error");
    expect(options.ignore).toContain("onModuleInit");
    expect(options.ignore).toContain("canActivate");

    const controllers = plugin.configs.nest.find(
      (config: { name: string }) => config.name === "skapxd/nest/controllers",
    )!;

    expect(controllers.rules["skapxd/max-public-methods"]).toBe("off");
  });

  it("relaja en specs lo que los tests no pueden cumplir", () => {
    const nestTests = plugin.configs.nest.find(
      (config: { name: string }) => config.name === "skapxd/nest/tests",
    )!;

    expect(nestTests.rules["skapxd/await-requires-result"]).toBe("off");
    expect(nestTests.rules["skapxd/no-try-catch"]).toBe("off");
    expect(nestTests.rules["skapxd/result-error-requires-handling"]).toBe("off");
    // El ! sobre fixtures es el arrange del test, no una mentira al compilador.
    expect(nestTests.rules["skapxd/no-non-null-assertion"]).toBe("off");
    // Pero un await olvidado en un spec es un falso verde: sigue activa.
    expect(nestTests.rules["skapxd/no-floating-promises"]).toBeUndefined();
  });
});

// Wrappers de typescript-eslint: regla skapxd → regla upstream que envuelve.
const wrappedRules = {
  "no-explicit-any": "no-explicit-any",
  "no-floating-promises": "no-floating-promises",
  "no-unsafe-argument": "no-unsafe-argument",
  "no-unsafe-assignment": "no-unsafe-assignment",
  "no-unsafe-call": "no-unsafe-call",
  "no-unsafe-member-access": "no-unsafe-member-access",
  "no-unsafe-return": "no-unsafe-return",
  "no-unverified-cast": "no-unsafe-type-assertion",
  "no-impossible-branch": "no-unnecessary-condition",
  "no-non-null-assertion": "no-non-null-assertion",
  "no-silenced-compiler": "ban-ts-comment",
  "prefer-type-over-interface": "consistent-type-definitions",
};

const ownTypeDrivenRules = ["prefer-schema-validation"];

const wrapperWithLocalOptions = ["no-unverified-cast"];

describe("reglas type-driven (wrappers de typescript-eslint) en presets tipados", () => {
  it("activa el set curado completo en backend, frontend, package y nest/base", () => {
    const typedPresets = [
      plugin.configs.backend,
      plugin.configs.frontend,
      plugin.configs.package,
      plugin.configs.nest.find(
        (config: { name: string }) => config.name === "skapxd/nest/base",
      )!,
    ];

    for (const preset of typedPresets) {
      for (const [skapxdName, upstreamName] of Object.entries(wrappedRules)) {
        const entry = preset.rules[`skapxd/${skapxdName}`];
        const severity = Array.isArray(entry) ? entry[0] : entry;

        expect(severity, `${preset.name} → ${skapxdName}`).toBe("error");
        // El nombre upstream no se activa además: una sola fuente de verdad.
        expect(
          preset.rules[`@typescript-eslint/${upstreamName}`],
          `${preset.name} → ${upstreamName}`,
        ).toBeUndefined();
      }
      for (const skapxdName of ownTypeDrivenRules) {
        const entry = preset.rules[`skapxd/${skapxdName}`];
        const severity = Array.isArray(entry) ? entry[0] : entry;

        expect(severity, `${preset.name} → ${skapxdName}`).toBe("error");
      }
      // Y los presets ya no registran el plugin upstream: el consumidor
      // puede registrar su propia instancia de tseslint sin chocar.
      expect(preset.plugins["@typescript-eslint"], preset.name).toBeUndefined();
    }
  });

  it("cada wrapper delega en su regla upstream sin messageIds huérfanos", async () => {
    const { default: tseslint } = await import("typescript-eslint");
    // El tipo CompatiblePlugin de tseslint no expone `rules`: se reafirma a
    // la forma real del plugin para leer las reglas originales.
    const upstreamRules = (
      tseslint.plugin as unknown as {
        rules: Record<
          string,
          { create: unknown; meta: { messages: Record<string, string> } }
        >;
      }
    ).rules;

    for (const [skapxdName, upstreamName] of Object.entries({
      ...wrappedRules,
    })) {
      const wrapped = plugin.rules[skapxdName]!;
      const original = upstreamRules[upstreamName]!;

      for (const id of Object.keys(original.meta.messages)) {
        expect(wrapped.meta?.messages?.[id], `${skapxdName}.${id}`).toBeDefined();
      }
    }

    for (const [skapxdName, upstreamName] of Object.entries(wrappedRules)) {
      const wrapped = plugin.rules[skapxdName]!;
      const original = upstreamRules[upstreamName]!;
      const wrapsCreateWithLocalOptions =
        wrapperWithLocalOptions.includes(skapxdName);
      if (wrapsCreateWithLocalOptions) {
        continue;
      }

      expect(wrapped.create, skapxdName).toBe(original.create);
    }
  });

  it("los mensajes principales enseñan en español", () => {
    const messageOf = (name: string, id: string) =>
      plugin.rules[name]!.meta?.messages?.[id];

    expect(messageOf("no-impossible-branch", "alwaysTruthy")).toContain(
      "Pregunta ya respondida",
    );
    // El mensaje corrige el consejo upstream que recomendaba .then/.catch
    // (prohibidos por no-promise-chain).
    expect(messageOf("no-floating-promises", "floatingVoid")).toContain(
      "no-promise-chain",
    );
    expect(messageOf("no-unsafe-assignment", "anyAssignment")).toContain(
      "`any` invisible",
    );
    expect(messageOf("no-silenced-compiler", "tsDirectiveComment")).toContain(
      "No silencies al compilador",
    );
    expect(messageOf("no-explicit-any", "unexpectedAny")).toContain("unknown");
    expect(messageOf("no-non-null-assertion", "noNonNull")).toContain(
      "callate, yo se mas que tu",
    );
    expect(messageOf("no-unverified-cast", "unsafeTypeAssertion")).toContain(
      "la misma mentira con lavado de manos",
    );
  });

  it("prohíbe ts-ignore y ts-nocheck pero permite ts-expect-error descrito", () => {
    const [severity, options] =
      plugin.configs.backend.rules["skapxd/no-silenced-compiler"]!;
    const compilerOptions = options as SilencedCompilerOptions;

    expect(severity).toBe("error");
    expect(compilerOptions["ts-ignore"]).toBe(true);
    expect(compilerOptions["ts-nocheck"]).toBe(true);
    expect(compilerOptions["ts-expect-error"]).toBe("allow-with-description");
  });

  it("prefer-type-over-interface fuerza la opción type (el default upstream es interface)", () => {
    const [severity, mode] =
      plugin.configs.backend.rules["skapxd/prefer-type-over-interface"]!;

    expect(severity).toBe("error");
    expect(mode).toBe("type");
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
    )!;

    expect(astroFiles).toBeDefined();
    expect(astroFiles.languageOptions).toBeUndefined();
  });
});
