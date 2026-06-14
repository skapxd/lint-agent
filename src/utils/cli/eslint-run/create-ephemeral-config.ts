import fs from "node:fs";
import path from "node:path";
import { createEphemeralConfigContent } from "./create-ephemeral-config-content";
import { getPackageEntryUrl } from "#/utils/cli/env/get-package-entry-url";
import type { CliPreset } from "#/utils/cli/types";

export function createEphemeralConfig(projectRoot: string, preset: CliPreset) {
  const filename = `.tmp-skapxd-lint-${process.pid}-${Date.now()}.config.mjs`;
  const configPath = path.join(projectRoot, filename);
  const content = createEphemeralConfigContent(getPackageEntryUrl(), preset);

  fs.writeFileSync(configPath, content, "utf8");

  return configPath;
}
