import { rules } from "../../src/shared/rules";
import { createPreferNodeProtocolRule } from "../../src/utils/node-builtins/create-prefer-node-protocol-rule";
import { createRuleTester } from "../rule-tester";

const ruleTester = createRuleTester();
type RuleArg = Parameters<typeof ruleTester.run>[1];

ruleTester.run(
  "prefer-node-protocol-for-builtins",
  rules["prefer-node-protocol-for-builtins"]!,
  {
    invalid: [
      {
        code: 'import fs from "fs";',
        errors: [{ messageId: "preferNodeProtocol" }],
        output: 'import fs from "node:fs";',
      },
      {
        code: 'import { readFile } from "fs/promises";',
        errors: [{ messageId: "preferNodeProtocol" }],
        output: 'import { readFile } from "node:fs/promises";',
      },
      {
        code: 'export { join } from "path";',
        errors: [{ messageId: "preferNodeProtocol" }],
        output: 'export { join } from "node:path";',
      },
      {
        code: 'const crypto = require("crypto");',
        errors: [{ messageId: "preferNodeProtocol" }],
        output: 'const crypto = require("node:crypto");',
      },
      {
        code: 'const stream = import("stream");',
        errors: [{ messageId: "preferNodeProtocol" }],
        output: 'const stream = import("node:stream");',
      },
      {
        code: 'import sqlite from "sqlite";',
        errors: [{ messageId: "preferNodeProtocol" }],
        output: 'import sqlite from "node:sqlite";',
      },
      {
        code: 'export * from "timers/promises";',
        errors: [{ messageId: "preferNodeProtocol" }],
        output: 'export * from "node:timers/promises";',
      },
    ],
    valid: [
      'import fs from "node:fs";',
      'import sqlite from "bun:sqlite";',
      'import lodash from "npm:lodash";',
      'import path from "jsr:@std/path";',
      'import { pathToRegexp } from "path-to-regexp";',
      'import fsExtra from "fs-extra";',
      'import helper from "./fs";',
      'import helper from "#/utils/fs";',
      'const stream = import(moduleName);',
      'const stream = import(`fs`);',
      {
        code: 'import fs from "fs";',
        filename: "src/legacy/uses-old-imports.ts",
        options: [{ allowFilePatterns: ["src/legacy/**"] }],
      },
    ],
  },
);

ruleTester.run(
  "prefer-node-protocol-for-builtins runtime guard",
  createPreferNodeProtocolRule(null) as unknown as RuleArg,
  {
    invalid: [],
    valid: ['import fs from "fs";', 'const crypto = require("crypto");'],
  },
);
