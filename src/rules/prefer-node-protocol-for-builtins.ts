import { isBuiltin } from "node:module";
import { createPreferNodeProtocolRule } from "#/utils/node-builtins/create-prefer-node-protocol-rule";

export const preferNodeProtocolForBuiltins =
  createPreferNodeProtocolRule(isBuiltin);
