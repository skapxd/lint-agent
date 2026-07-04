import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

const fixtureRoot = fileURLToPath(
  new URL("../fixtures/module-boundary", import.meta.url),
);
const appFile = join(fixtureRoot, "src", "app", "use-users.ts");
const userRepositoryFile = join(
  fixtureRoot,
  "src",
  "modules",
  "users",
  "user-repository.ts",
);
const adminDashboardFile = join(
  fixtureRoot,
  "src",
  "admin",
  "dashboard.ts",
);
const aliasOptions = [{ sourceRoot: join(fixtureRoot, "src") }];

createRuleTester().run(
  "no-internal-module-imports",
  rules["no-internal-module-imports"]!,
  {
    invalid: [
      {
        code: 'import { findUser } from "#/modules/users/user-repository";',
        errors: [{ messageId: "internalModuleImport" }],
        filename: appFile,
        options: aliasOptions,
      },
      {
        code: 'import { findUser } from "../modules/users/user-repository";',
        errors: [{ messageId: "internalModuleImport" }],
        filename: appFile,
      },
      {
        code: 'export { findUser } from "#/modules/users/user-repository";',
        errors: [{ messageId: "internalModuleImport" }],
        filename: appFile,
        options: aliasOptions,
      },
      {
        code: 'const users = await import("#/modules/users/user-repository");',
        errors: [{ messageId: "internalModuleImport" }],
        filename: appFile,
        options: aliasOptions,
      },
      {
        code: 'import { secret } from "#/modules/users/internal/secret";',
        errors: [{ messageId: "internalModuleImport" }],
        filename: appFile,
        options: aliasOptions,
      },
    ],
    valid: [
      {
        code: 'import { findUser } from "#/modules/users";',
        filename: appFile,
        options: aliasOptions,
      },
      {
        code: 'import { findUser } from "../modules/users";',
        filename: appFile,
      },
      {
        code: 'import { publishUserEvent } from "#/modules/users/events";',
        filename: appFile,
        options: aliasOptions,
      },
      {
        code: 'import { findUser } from "./user-repository";',
        filename: userRepositoryFile,
      },
      {
        code: 'import { findUser } from "#/modules/users/user-repository";',
        filename: appFile,
        options: [
          {
            allowFilePatterns: ["**/use-users.ts"],
            sourceRoot: join(fixtureRoot, "src"),
          },
        ],
      },
      {
        code: 'import { x } from "external-package";',
        filename: appFile,
      },
      {
        code: 'import { x } from "#/missing/module";',
        filename: appFile,
      },
      {
        code: 'import { GET } from "#/pages/api/orders/pending-by-customer";',
        filename: adminDashboardFile,
        options: aliasOptions,
      },
    ],
  },
);
