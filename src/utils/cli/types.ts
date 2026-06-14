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
  path: string | null;
  preset: CliPreset | null;
  rawPreset: string | null;
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
  mode: "adopt" | "changed" | "evaluate";
  omittedFileCount?: number;
  preset?: CliPreset;
  status: CliStatus;
  targetPath?: string;
  warningCount: number;
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
  ruleId: string;
  violationCount: number;
};

export type LintFileResult = {
  errorCount: number;
  filePath: string;
  messages: LintMessageResult[];
  warningCount: number;
};

export type LintMessageResult = {
  column: number;
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
};
