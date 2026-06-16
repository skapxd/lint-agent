import { requiredTypeConfigFlags } from "./required-type-config-flags";
import type { TypeConfigFlag } from "#/utils/cli/types";
import type { CompilerOptions } from "typescript";

export function getTypeConfigAddedFlags(
  compilerOptions: CompilerOptions | null,
) {
  if (!compilerOptions) {
    return [...requiredTypeConfigFlags];
  }

  return requiredTypeConfigFlags.filter(
    (flag: TypeConfigFlag) => compilerOptions[flag] !== true,
  );
}
