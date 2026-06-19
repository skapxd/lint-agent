import type { ExecFileSyncOptionsWithStringEncoding } from "node:child_process";

export const supportedCliPresets = ["astro", "base", "nest", "next", "package"];

export type CliPreset = "astro" | "base" | "nest" | "next" | "package";

export type CliStatus =
  | "execution-error"
  | "findings"
  | "ok"
  | "usage-error";

export type CliOutputFormat = "compact" | "json" | "toon";

export type CliStreams = {
  argv: string[];
  cwd: string;
  stdin: NodeJS.ReadStream;
  stdout: NodeJS.WriteStream;
  stderr: NodeJS.WriteStream;
};

export type CliArguments = {
  adoptPercent: number | null;
  base: string | null;
  changed: boolean;
  forceNonInteractive: boolean;
  format: CliOutputFormat | null;
  help: boolean;
  includeTests: boolean;
  output: string | null;
  path: string | null;
  preset: CliPreset | null;
  rawPreset: string | null;
  resetState: boolean;
  resumeLast: boolean;
  useProjectTsconfig: boolean;
  verifySeed: string | null;
};

export type CliParseResult =
  | { ok: true; value: CliArguments }
  | { ok: false; message: string };

export type CliRunResult = {
  exitCode: number;
  output: SkapxdLintOutput;
};

/**
 * Error de dominio del canal de EJECUCION del CLI: ESLint o git no pudieron
 * producir el reporte de lint. La frontera (trySafe sobre ESLint/git/fs) mapea
 * su error crudo aqui, preservando el original en `cause`.
 */
export type CliExecutionError = {
  _tag: "CliExecutionError";
  cause: unknown;
  message: string;
};

/**
 * Error de dominio del canal de I/O del CLI: escribir la salida, renderizar el
 * modo interactivo, leer un prompt o resolver el lote persistido. Union
 * discriminada para que el consumidor decida con `match()` en vez de tratar
 * todo fallo como opaco. Cada variante de runtime preserva su `cause`.
 */
export type CliIoError =
  | { _tag: "OutputDirectoryMissing"; message: string }
  | { _tag: "OutputWriteFailed"; cause: unknown; message: string }
  | { _tag: "InteractiveRendererUnavailable"; cause: unknown; message: string }
  | { _tag: "InteractivePromptFailed"; cause: unknown; message: string }
  | { _tag: "InteractionCancelled"; message: string }
  | { _tag: "PersistedStateMissing"; message: string }
  | { _tag: "CliRunnerUnavailable"; cause: unknown; message: string };

export type SkapxdLintOutput = {
  adoption?: AdoptionOutput;
  changedFiles?: string[];
  configDeleted?: boolean;
  countBreakdown?: CountBreakdownOutput;
  errorCount: number;
  files: LintFileResult[];
  mode: "adopt" | "changed" | "evaluate" | "state" | "verify";
  omittedFileCount?: number;
  preset?: CliPreset;
  resolutionPrompt?: string;
  rulePlan?: readonly RulePlanEntry[];
  ruleSummaries?: readonly AdoptionRuleSummary[];
  state?: StateOutput;
  status: CliStatus;
  targetPath?: string;
  typeConfig?: TypeConfigOutput;
  unattributedFindings?: readonly UnattributedFindingOutput[];
  verification?: VerificationOutput;
  warningCount: number;
};

export type CountBreakdownOutput = {
  actionableErrorCount: number;
  filesWithFindings: number;
  skapxdRuleViolationCount: number;
  totalErrorCount: number;
  unattributedErrorCount: number;
  warningCount: number;
};

export type TypeConfigFlag =
  | "noImplicitReturns"
  | "noUncheckedIndexedAccess"
  | "strict";

export type TypeConfigOutput = {
  addedFlags: TypeConfigFlag[];
  source: "cloned" | "generated" | "project";
};

export type EphemeralTypeConfig = {
  path: string | null;
  typeConfig: TypeConfigOutput;
};

export type AdoptionOutput = {
  budget: number;
  percent: number;
  seed: string;
  selectedRuleCount: number;
  selectedRules: AdoptionRuleSummary[];
  targetViolationCount: number;
  totalViolationCount: number;
};

export type AdoptionRuleSummary = {
  affectedFileCount: number;
  blockedBy?: readonly string[];
  dependencyLayer: number;
  ruleId: string;
  violationCount: number;
};

export type RuleResolutionRole = "blocked" | "independent" | "premise";

export type RulePlanEntry = AdoptionRuleSummary & {
  resolutionRole: RuleResolutionRole;
  unblocks?: readonly string[];
};

export type UnattributedFindingCategory =
  | "external-rule"
  | "fatal"
  | "parse"
  | "rule-definition-missing";

export type UnattributedFindingOutput = {
  actionability: "cli-config-not-project-debt";
  category: UnattributedFindingCategory;
  column: number;
  filePath: string;
  line: number;
  message: string;
  ruleId: string | null;
};

export type VerificationOutput = {
  completed: boolean;
  fixedRuleCount: number;
  fixedRules: string[];
  outsideViolationCount: number;
  remainingRuleCount: number;
  remainingRules: AdoptionRuleSummary[];
  remainingViolationCount: number;
  seed: string;
  targetRules: string[];
};

export type AdoptionState = {
  percent: number;
  seed: string;
  targetRules: string[];
  timestamp: string;
};

export type StateOutput = {
  action: "reset";
  statePath: string;
};

export type LintFileResult = {
  errorCount: number;
  filePath: string;
  messages: LintMessageResult[];
  warningCount: number;
};

export type LintMessageResult = {
  column: number;
  fatal?: boolean;
  line: number;
  message: string;
  ruleId: string | null;
  severity: number;
};

export type GitCommandOptions = Partial<ExecFileSyncOptionsWithStringEncoding>;

export type PromptStreams = {
  input: NodeJS.ReadStream;
  output: NodeJS.WriteStream;
};

export type RunRequestedModeInput = {
  adoptPercent: number | null;
  base: string | null;
  changed: boolean;
  includeTests: boolean;
  path: string;
  preset: CliPreset | null;
  streams: CliStreams;
  useProjectTsconfig: boolean;
  verifySeed: string | null;
};
