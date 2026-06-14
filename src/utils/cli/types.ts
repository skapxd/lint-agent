import type { ExecFileSyncOptionsWithStringEncoding } from "node:child_process";

export const supportedCliPresets = ["astro", "base", "nest", "next", "package"];

export type CliPreset = "astro" | "base" | "nest" | "next" | "package";

export type CliStatus =
  | "execution-error"
  | "findings"
  | "ok"
  | "usage-error";

export type CliStreams = {
  argv: string[];
  cwd: string;
  stdin: NodeJS.ReadStream;
  stdout: NodeJS.WriteStream;
  stderr: NodeJS.WriteStream;
};

export type CliArguments = {
  base: string | null;
  changed: boolean;
  forceNonInteractive: boolean;
  help: boolean;
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
  changedFiles?: string[];
  configDeleted?: boolean;
  errorCount: number;
  files: LintFileResult[];
  mode: "changed" | "evaluate";
  preset?: CliPreset;
  status: CliStatus;
  targetPath?: string;
  warningCount: number;
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
  base: string | null;
  changed: boolean;
  path: string;
  preset: CliPreset | null;
  streams: CliStreams;
};
