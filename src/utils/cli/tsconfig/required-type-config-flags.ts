import type { TypeConfigFlag } from "#/utils/cli/types";

export const requiredTypeConfigFlags = [
  "strict",
  "noImplicitReturns",
  "noUncheckedIndexedAccess",
] satisfies TypeConfigFlag[];
