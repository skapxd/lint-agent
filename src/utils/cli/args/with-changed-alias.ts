import { isChangedAlias } from "./is-changed-alias";

export function withChangedAlias(argv: readonly string[]) {
  const args = argv.slice(2);
  const shouldInjectChanged = isChangedAlias(argv) && !args.includes("--changed");

  if (shouldInjectChanged) {
    return ["--changed", ...args];
  }

  return args;
}
