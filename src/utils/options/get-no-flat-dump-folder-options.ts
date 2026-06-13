import { numberOption } from "#/utils/options/number-option";
import { stringArrayOption } from "#/utils/options/string-array-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";

export function getNoFlatDumpFolderOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
    dumpFolderNames: stringArrayOption(options, "dumpFolderNames", [
      "utils",
      "helpers",
      "lib",
      "common",
      "misc",
    ]),
    maxLooseFiles: numberOption(options, "maxLooseFiles", 0),
  };
}
