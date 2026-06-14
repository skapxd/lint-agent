#!/usr/bin/env node
import { runSkapxdLint } from "#/utils/cli/commands/run-skapxd-lint";

void runSkapxdLint({
  argv: process.argv,
  cwd: process.cwd(),
  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr,
});
