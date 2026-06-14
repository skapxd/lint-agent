import path from "node:path";

export function isChangedAlias(argv: readonly string[]) {
  const invokedPath = argv[1] ?? "";
  const invokedName = path.basename(invokedPath);

  return invokedName === "skapxd-lint-changed";
}
