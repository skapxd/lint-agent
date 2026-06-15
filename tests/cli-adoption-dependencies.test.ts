import { describe, expect, it } from "vitest";
import { createAdoptionOutput } from "../src/utils/cli/adoption/create-adoption-output";
import { createAdoptionRuleSummaries } from "../src/utils/cli/adoption/create-adoption-rule-summaries";
import { computeRuleLayers } from "../src/utils/cli/adoption/compute-rule-layers";
import { getRuleLayer } from "../src/utils/cli/adoption/get-rule-layer";
import { RULE_DEPENDENCIES } from "../src/utils/cli/adoption/rule-dependencies";
import { selectAdoptionRules } from "../src/utils/cli/adoption/select-adoption-rules";
import { createToonLintOutput } from "../src/utils/cli/output/machine/create-toon-lint-output";
import { rules } from "../src/shared/rules";
import type { LintFileResult, SkapxdLintOutput } from "../src/utils/cli/types";

function createLintFile(filePath: string, ruleIds: readonly string[]) {
  return {
    errorCount: ruleIds.length,
    filePath,
    messages: ruleIds.map((ruleId) => ({
      column: 1,
      line: 1,
      message: `Mensaje de ${ruleId}`,
      ruleId,
      severity: 2,
    })),
    warningCount: 0,
  } satisfies LintFileResult;
}

function createEvaluationOutput(files: LintFileResult[]) {
  return {
    configDeleted: true,
    errorCount: files.reduce((total, file) => total + file.errorCount, 0),
    files,
    mode: "evaluate",
    preset: "base",
    status: "findings",
    targetPath: "/repo",
    warningCount: 0,
  } satisfies SkapxdLintOutput;
}

describe("dependencias de adopcion", () => {
  it("mantiene el mapa alineado con reglas registradas", () => {
    const registeredRuleIds = new Set(
      Object.keys(rules).map((ruleId) => `skapxd/${ruleId}`),
    );
    const dependencyRuleIds = [
      ...Object.keys(RULE_DEPENDENCIES),
      ...Object.values(RULE_DEPENDENCIES).flat(),
    ];
    const unknownRuleIds = [...new Set(dependencyRuleIds)].filter(
      (ruleId) => !registeredRuleIds.has(ruleId),
    );

    expect(unknownRuleIds).toEqual([]);
  });

  it("calcula capas aciclicas con el histograma del spike", () => {
    expect(() => computeRuleLayers(RULE_DEPENDENCIES)).not.toThrow();

    const layers = computeRuleLayers(RULE_DEPENDENCIES);
    const histogram = new Map<number, number>();
    const edgeCount = Object.values(RULE_DEPENDENCIES).reduce(
      (total, premises) => total + premises.length,
      0,
    );

    for (const ruleId of Object.keys(rules)) {
      const layer = layers.get(`skapxd/${ruleId}`) ?? 0;

      histogram.set(layer, (histogram.get(layer) ?? 0) + 1);
    }

    expect(edgeCount).toBe(9);
    expect(histogram.get(0)).toBe(48);
    expect(histogram.get(1)).toBe(8);
    expect([...histogram.keys()].sort()).toEqual([0, 1]);
  });

  it("rechaza ciclos en aristas futuras", () => {
    expect(() =>
      computeRuleLayers({
        "skapxd/a": ["skapxd/b"],
        "skapxd/b": ["skapxd/a"],
      }),
    ).toThrow("Grafo de dependencias de reglas ciclico: skapxd/a -> skapxd/b -> skapxd/a.");
  });

  it("expone capas correctas para premisas, dependientes e ids desconocidos", () => {
    expect(getRuleLayer("skapxd/filename-matches-root-function")).toBe(1);
    expect(getRuleLayer("skapxd/one-root-function-per-file")).toBe(0);
    expect(getRuleLayer("skapxd/no-impossible-branch")).toBe(1);
    expect(getRuleLayer("skapxd/requires-strict-tsconfig")).toBe(0);
    expect(getRuleLayer("skapxd/untrusted-module-requires-adapter")).toBe(1);
    expect(getRuleLayer("skapxd/no-ad-hoc-ok-result")).toBe(0);
    expect(getRuleLayer("skapxd/await-requires-result")).toBe(1);
    expect(getRuleLayer("skapxd/desconocida")).toBe(0);
  });

  it("ordena premisas antes que dependientes aunque afecten mas archivos", () => {
    const files = [
      createLintFile("/repo/strict-1.ts", ["skapxd/requires-strict-tsconfig"]),
      createLintFile("/repo/strict-2.ts", ["skapxd/requires-strict-tsconfig"]),
      createLintFile("/repo/strict-3.ts", ["skapxd/requires-strict-tsconfig"]),
      createLintFile("/repo/strict-4.ts", ["skapxd/requires-strict-tsconfig"]),
      createLintFile("/repo/strict-5.ts", ["skapxd/requires-strict-tsconfig"]),
      createLintFile("/repo/branch-1.ts", ["skapxd/no-impossible-branch"]),
      createLintFile("/repo/branch-2.ts", ["skapxd/no-impossible-branch"]),
    ];

    const summaries = createAdoptionRuleSummaries(files);
    const selection = selectAdoptionRules(summaries, 100);

    expect(selection.selectedRules.map((rule) => rule.ruleId)).toEqual([
      "skapxd/requires-strict-tsconfig",
      "skapxd/no-impossible-branch",
    ]);
    expect(selection.selectedRules[1]).toMatchObject({
      blockedBy: ["skapxd/requires-strict-tsconfig"],
      dependencyLayer: 1,
    });
  });

  it("conserva el orden por esfuerzo entre reglas independientes", () => {
    const summaries = createAdoptionRuleSummaries([
      createLintFile("/repo/nested-1.ts", ["skapxd/no-nested-if"]),
      createLintFile("/repo/nested-2.ts", ["skapxd/no-nested-if"]),
      createLintFile("/repo/nested-3.ts", ["skapxd/no-nested-if"]),
      createLintFile("/repo/else.ts", ["skapxd/no-else"]),
    ]);

    expect(summaries.map((rule) => rule.ruleId)).toEqual([
      "skapxd/no-else",
      "skapxd/no-nested-if",
    ]);
  });

  it("omite blockedBy cuando la premisa no tiene hallazgos en la corrida", () => {
    const summaries = createAdoptionRuleSummaries([
      createLintFile("/repo/branch.ts", ["skapxd/no-impossible-branch"]),
    ]);

    expect(summaries[0]).toEqual({
      affectedFileCount: 1,
      dependencyLayer: 1,
      ruleId: "skapxd/no-impossible-branch",
      violationCount: 1,
    });
  });

  it("expone dependencyLayer y blockedBy en la salida que viaja a JSON y TOON", () => {
    const output = createAdoptionOutput(
      createEvaluationOutput([
        createLintFile("/repo/strict.ts", ["skapxd/requires-strict-tsconfig"]),
        createLintFile("/repo/branch.ts", ["skapxd/no-impossible-branch"]),
      ]),
      100,
    );
    const toonOutput = createToonLintOutput(output);

    expect(output.adoption.selectedRules).toEqual([
      {
        affectedFileCount: 1,
        dependencyLayer: 0,
        ruleId: "skapxd/requires-strict-tsconfig",
        violationCount: 1,
      },
      {
        affectedFileCount: 1,
        blockedBy: ["skapxd/requires-strict-tsconfig"],
        dependencyLayer: 1,
        ruleId: "skapxd/no-impossible-branch",
        violationCount: 1,
      },
    ]);
    expect(toonOutput.adoption?.selectedRules).toEqual(output.adoption.selectedRules);
  });
});
