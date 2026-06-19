import { describe, expect, it } from "vitest";
import { createAdoptionOutput } from "../src/utils/cli/adoption/create-adoption-output";
import { createAdoptionRuleSummaries } from "../src/utils/cli/adoption/create-adoption-rule-summaries";
import { computeRuleLayers } from "../src/utils/cli/adoption/compute-rule-layers";
import { getRuleLayer } from "../src/utils/cli/adoption/get-rule-layer";
import { RULE_DEPENDENCIES } from "../src/utils/cli/adoption/rule-dependencies";
import { selectAdoptionRules } from "../src/utils/cli/adoption/select-adoption-rules";
import { createVerificationOutput } from "../src/utils/cli/adoption/create-verification-output";
import { formatCompactAdoptionSummary } from "../src/utils/cli/output/machine/format-compact-adoption-summary";
import { formatCompactVerificationSummary } from "../src/utils/cli/output/machine/format-compact-verification-summary";
import { createToonLintOutput } from "../src/utils/cli/output/machine/create-toon-lint-output";
import { renderCompactOutput } from "../src/utils/cli/output/machine/render-compact-output";
import { createReportGuidance } from "../src/utils/cli/output/report/create-report-guidance";
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
  const errorCount = files.reduce((total, file) => total + file.errorCount, 0);
  const ruleSummaries = createAdoptionRuleSummaries(files);
  const warningCount = files.reduce((total, file) => total + file.warningCount, 0);

  return {
    configDeleted: true,
    ...createReportGuidance({
      errorCount,
      files,
      ruleSummaries,
      warningCount,
    }),
    errorCount,
    files,
    mode: "evaluate",
    preset: "base",
    ruleSummaries,
    status: errorCount > 0 ? "findings" : "ok",
    targetPath: "/repo",
    warningCount,
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
    expect(histogram.get(0)).toBe(52);
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
    const evaluationOutput = createEvaluationOutput([
      createLintFile("/repo/strict.ts", ["skapxd/requires-strict-tsconfig"]),
      createLintFile("/repo/branch.ts", ["skapxd/no-impossible-branch"]),
    ]);
    const toonOutput = createToonLintOutput(evaluationOutput);

    expect(evaluationOutput.ruleSummaries).toEqual([
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
    expect(evaluationOutput.rulePlan).toEqual([
      {
        affectedFileCount: 1,
        dependencyLayer: 0,
        resolutionRole: "premise",
        ruleId: "skapxd/requires-strict-tsconfig",
        unblocks: ["skapxd/no-impossible-branch"],
        violationCount: 1,
      },
      {
        affectedFileCount: 1,
        blockedBy: ["skapxd/requires-strict-tsconfig"],
        dependencyLayer: 1,
        resolutionRole: "blocked",
        ruleId: "skapxd/no-impossible-branch",
        violationCount: 1,
      },
    ]);
    expect(evaluationOutput.countBreakdown).toEqual({
      actionableErrorCount: 2,
      filesWithFindings: 2,
      skapxdRuleViolationCount: 2,
      totalErrorCount: 2,
      unattributedErrorCount: 0,
      warningCount: 0,
    });
    expect(evaluationOutput.resolutionPrompt).toContain("como resolver:");
    expect(toonOutput.ruleSummaries).toEqual(evaluationOutput.ruleSummaries);
    expect(toonOutput.rulePlan).toEqual(evaluationOutput.rulePlan);
    expect(toonOutput.countBreakdown).toEqual(evaluationOutput.countBreakdown);
  });

  it("reconcilia errores no atribuibles sin mezclarlos con el plan", () => {
    const externalFile = {
      errorCount: 3,
      filePath: "/repo/config.ts",
      messages: [
        {
          column: 1,
          line: 3,
          message: "'missingReference' is not defined.",
          ruleId: "no-undef",
          severity: 2,
        },
        {
          column: 1,
          fatal: true,
          line: 4,
          message: "Parsing error: Unexpected token",
          ruleId: null,
          severity: 2,
        },
        {
          column: 1,
          line: 5,
          message: "Definition for rule 'missing/rule' was not found.",
          ruleId: "missing/rule",
          severity: 2,
        },
      ],
      warningCount: 0,
    } satisfies LintFileResult;
    const output = createEvaluationOutput([
      createLintFile("/repo/index.ts", ["skapxd/no-else"]),
      externalFile,
    ]);
    const rendered = renderCompactOutput(output);

    expect(output.countBreakdown).toEqual({
      actionableErrorCount: 1,
      filesWithFindings: 2,
      skapxdRuleViolationCount: 1,
      totalErrorCount: 4,
      unattributedErrorCount: 3,
      warningCount: 0,
    });
    expect(output.rulePlan).toEqual([
      expect.objectContaining({
        resolutionRole: "independent",
        ruleId: "skapxd/no-else",
      }),
    ]);
    expect(output.unattributedFindings).toEqual([
      expect.objectContaining({ category: "external-rule", ruleId: "no-undef" }),
      expect.objectContaining({ category: "parse", ruleId: null }),
      expect.objectContaining({
        category: "rule-definition-missing",
        ruleId: "missing/rule",
      }),
    ]);
    expect(rendered.indexOf("rules (plan de resolucion):")).toBeLessThan(
      rendered.indexOf("no atribuidos:"),
    );
    expect(rendered).toContain("no atribuidos:");
    expect(rendered).toContain("external-rule  no-undef");
    expect(rendered).toContain("parse  parse");
    expect(rendered).toContain("rule-definition-missing  missing/rule");
  });

  it("no convierte reglas externas en plan compacto accionable", () => {
    const output = createEvaluationOutput([
      {
        errorCount: 1,
        filePath: "/repo/index.ts",
        messages: [
          {
            column: 1,
            line: 1,
            message: "'missingReference' is not defined.",
            ruleId: "no-undef",
            severity: 2,
          },
        ],
        warningCount: 0,
      },
    ]);
    const rendered = renderCompactOutput(output);

    expect(output.countBreakdown).toEqual({
      actionableErrorCount: 0,
      filesWithFindings: 1,
      skapxdRuleViolationCount: 0,
      totalErrorCount: 1,
      unattributedErrorCount: 1,
      warningCount: 0,
    });
    expect(output.rulePlan).toBeUndefined();
    expect(output.resolutionPrompt).toBeUndefined();
    expect(rendered).toContain("no atribuidos:");
    expect(rendered).not.toContain("rules (plan de resolucion):");
  });

  it("mantiene dependencyLayer y blockedBy dentro del lote de adopcion", () => {
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

  it("formatea el compact evaluate con premisas antes de dependientes", () => {
    const output = createEvaluationOutput([
      createLintFile("/repo/strict.ts", ["skapxd/requires-strict-tsconfig"]),
      createLintFile("/repo/branch.ts", ["skapxd/no-impossible-branch"]),
    ]);
    const rendered = renderCompactOutput(output);

    expect(rendered).toContain("conteo:");
    expect(rendered).toContain("como resolver: arregla las reglas en el orden listado");
    expect(rendered).toContain("rules (plan de resolucion):");
    expect(rendered).toContain(
      "  1. skapxd/requires-strict-tsconfig: 1 viol, 1 file [premisa]",
    );
    expect(rendered).toContain(
      "  2. skapxd/no-impossible-branch: 1 viol, 1 file [bloqueada por: requires-strict-tsconfig]",
    );
    expect(rendered.indexOf("conteo:")).toBeLessThan(
      rendered.indexOf("como resolver:"),
    );
    expect(rendered.indexOf("como resolver:")).toBeLessThan(
      rendered.indexOf("rules (plan de resolucion):"),
    );
    expect(rendered.indexOf("rules (plan de resolucion):")).toBeLessThan(
      rendered.indexOf("strict.ts"),
    );
    expect(rendered).not.toContain("capa 0");
  });

  it("formatea el compact evaluate plano como reglas independientes", () => {
    const rendered = renderCompactOutput(
      createEvaluationOutput([
        createLintFile("/repo/else.ts", ["skapxd/no-else"]),
        createLintFile("/repo/nested.ts", ["skapxd/no-nested-if"]),
      ]),
    );

    expect(rendered).toContain("rules (plan de resolucion):");
    expect(rendered).toContain("  1. skapxd/no-else: 1 viol, 1 file [independiente]");
    expect(rendered).toContain(
      "  2. skapxd/no-nested-if: 1 viol, 1 file [independiente]",
    );
    expect(rendered).not.toContain("capa 0");
  });

  it("omite la seccion compact evaluate cuando no hay hallazgos", () => {
    const rendered = renderCompactOutput(createEvaluationOutput([]));

    expect(rendered).toContain("conteo:");
    expect(rendered).not.toContain("como resolver:");
    expect(rendered).not.toContain("rules (plan de resolucion):");
  });

  it("no duplica la seccion de reglas cuando --adopt ya tiene lote", () => {
    const output = createAdoptionOutput(
      createEvaluationOutput([
        createLintFile("/repo/strict.ts", ["skapxd/requires-strict-tsconfig"]),
        createLintFile("/repo/branch.ts", ["skapxd/no-impossible-branch"]),
      ]),
      100,
    );
    const rendered = renderCompactOutput(output);
    const sectionHeaders = rendered.match(/rules \(plan de resolucion\):/gu) ?? [];

    expect(sectionHeaders).toHaveLength(1);
    expect(rendered).toContain(`adopt 100% | seed ${output.adoption.seed}`);
    expect(rendered).toContain(`cierra este lote con \`--verify ${output.adoption.seed}\``);
  });

  it("formatea el compact plano como orden numerado independiente", () => {
    const output = createAdoptionOutput(
      createEvaluationOutput([
        createLintFile("/repo/else.ts", ["skapxd/no-else"]),
        createLintFile("/repo/nested.ts", ["skapxd/no-nested-if"]),
      ]),
      100,
    );

    expect(formatCompactAdoptionSummary(output)).toEqual([
      `adopt 100% | seed ${output.adoption.seed}`,
      "target 2/2 violations | budget 2",
      "rules (plan de resolucion):",
      "  1. skapxd/no-else: 1 viol, 1 file [independiente]",
      "  2. skapxd/no-nested-if: 1 viol, 1 file [independiente]",
    ]);
    expect(formatCompactAdoptionSummary(output).join("\n")).not.toContain("capa 0");
    expect(formatCompactAdoptionSummary(output).join("\n")).not.toContain("[premisa]");
    expect(formatCompactAdoptionSummary(output).join("\n")).not.toContain("[bloqueada por:");
  });

  it("formatea el compact con premisa y dependiente sin prefijo skapxd en blockedBy", () => {
    const output = createAdoptionOutput(
      createEvaluationOutput([
        createLintFile("/repo/strict.ts", ["skapxd/requires-strict-tsconfig"]),
        createLintFile("/repo/branch.ts", ["skapxd/no-impossible-branch"]),
      ]),
      100,
    );

    expect(formatCompactAdoptionSummary(output)).toEqual([
      `adopt 100% | seed ${output.adoption.seed}`,
      "target 2/2 violations | budget 2",
      "rules (plan de resolucion):",
      "  1. skapxd/requires-strict-tsconfig: 1 viol, 1 file [premisa]",
      "  2. skapxd/no-impossible-branch: 1 viol, 1 file [bloqueada por: requires-strict-tsconfig]",
    ]);
  });

  it("aplica el mismo orden compacto a reglas restantes de --verify", () => {
    const adoption = createAdoptionOutput(
      createEvaluationOutput([
        createLintFile("/repo/strict.ts", ["skapxd/requires-strict-tsconfig"]),
        createLintFile("/repo/branch.ts", ["skapxd/no-impossible-branch"]),
      ]),
      100,
    );
    const verification = createVerificationOutput(
      createEvaluationOutput([
        createLintFile("/repo/strict.ts", ["skapxd/requires-strict-tsconfig"]),
        createLintFile("/repo/branch.ts", ["skapxd/no-impossible-branch"]),
      ]),
      adoption.adoption.seed,
    );

    expect(formatCompactVerificationSummary(verification)).toEqual([
      `verify pending | seed ${adoption.adoption.seed}`,
      "target 2 remaining | 0/2 rules fixed",
      "outside target: 0 info violations",
      "rules (plan de resolucion):",
      "  1. skapxd/requires-strict-tsconfig: 1 remaining, 1 file [premisa]",
      "  2. skapxd/no-impossible-branch: 1 remaining, 1 file [bloqueada por: requires-strict-tsconfig]",
    ]);
  });
});
