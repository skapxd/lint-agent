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

export type SkapxdLintOutput = {
  adoption?: AdoptionOutput;
  changedFiles?: string[];
  configDeleted?: boolean;
  errorCount: number;
  files: LintFileResult[];
  mode: "adopt" | "changed" | "evaluate" | "state" | "verify";
  omittedFileCount?: number;
  preset?: CliPreset;
  state?: StateOutput;
  status: CliStatus;
  targetPath?: string;
  typeConfig?: TypeConfigOutput;
  verification?: VerificationOutput;
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
