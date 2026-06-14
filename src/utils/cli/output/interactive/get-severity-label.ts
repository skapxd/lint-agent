import pc from "picocolors";

export function getSeverityLabel(severity: number) {
  const isError = severity === 2;

  if (isError) {
    return pc.red("error");
  }

  return pc.yellow("warn");
}
