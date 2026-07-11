import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

const fixtureRoot = fileURLToPath(
  new URL("../fixtures/layer-import-direction", import.meta.url),
);
const sourceRoot = join(fixtureRoot, "src");
const modulesRoot = join(sourceRoot, "modules");
const ordersRoot = join(modulesRoot, "orders");
const domainFile = join(ordersRoot, "domain", "order.ts");
const applicationFile = join(
  ordersRoot,
  "application",
  "create-order.ts",
);
const httpFile = join(ordersRoot, "http", "order.controller.ts");
const infrastructureFile = join(
  ordersRoot,
  "infrastructure",
  "turso",
  "turso-order-repository.ts",
);
const contractsFile = join(
  ordersRoot,
  "contracts",
  "provider-contract.ts",
);
const moduleFile = join(ordersRoot, "orders.module.ts");
const indexFile = join(ordersRoot, "index.ts");
const featuresRoot = join(sourceRoot, "features");
const featureDomainFile = join(
  featuresRoot,
  "catalog",
  "domain",
  "product.ts",
);
const baseOptions = { modulesRoot, sourceRoot };

createRuleTester().run(
  "nest-layer-import-direction",
  rules["nest-layer-import-direction"]!,
  {
    invalid: [
      {
        code: 'import { tursoOrderRepository } from "../infrastructure/turso/turso-order-repository";',
        errors: [
          {
            data: {
              allowedLayers: "`domain`",
              fromLayer: "domain",
              fromModule: "orders",
              source:
                "../infrastructure/turso/turso-order-repository",
              toLayer: "infrastructure",
              toModule: "orders",
            },
            messageId: "forbiddenLayerImport",
          },
        ],
        filename: domainFile,
        options: [baseOptions],
      },
      {
        code: 'import { tursoOrderRepository } from "#/modules/orders/infrastructure/turso/turso-order-repository";',
        errors: [
          {
            data: {
              allowedLayers: "`domain`",
              fromLayer: "domain",
              fromModule: "orders",
              source:
                "#/modules/orders/infrastructure/turso/turso-order-repository",
              toLayer: "infrastructure",
              toModule: "orders",
            },
            messageId: "forbiddenLayerImport",
          },
        ],
        filename: domainFile,
        options: [baseOptions],
      },
      {
        code: 'import type { tursoOrderRepository } from "../infrastructure/turso/turso-order-repository";',
        errors: [
          {
            data: {
              allowedLayers: "`domain`",
              fromLayer: "domain",
              fromModule: "orders",
              source:
                "../infrastructure/turso/turso-order-repository",
              toLayer: "infrastructure",
              toModule: "orders",
            },
            messageId: "forbiddenLayerImport",
          },
        ],
        filename: domainFile,
        options: [baseOptions],
      },
      {
        code: 'import { tursoOrderRepository } from "~/modules/orders/infrastructure/turso/turso-order-repository";',
        errors: [
          {
            data: {
              allowedLayers: "`domain`",
              fromLayer: "domain",
              fromModule: "orders",
              source:
                "~/modules/orders/infrastructure/turso/turso-order-repository",
              toLayer: "infrastructure",
              toModule: "orders",
            },
            messageId: "forbiddenLayerImport",
          },
        ],
        filename: domainFile,
        options: [{ ...baseOptions, aliasPrefixes: ["~/"] }],
      },
      {
        code: 'import { orderController } from "../http/order.controller";',
        errors: [
          {
            data: {
              allowedLayers: "`domain`",
              fromLayer: "domain",
              fromModule: "orders",
              source: "../http/order.controller",
              toLayer: "http",
              toModule: "orders",
            },
            messageId: "forbiddenLayerImport",
          },
        ],
        filename: domainFile,
        options: [baseOptions],
      },
      {
        code: 'import { orderController } from "../http/order.controller";',
        errors: [
          {
            data: {
              allowedLayers: "`application`, `domain`",
              fromLayer: "application",
              fromModule: "orders",
              source: "../http/order.controller",
              toLayer: "http",
              toModule: "orders",
            },
            messageId: "forbiddenLayerImport",
          },
        ],
        filename: applicationFile,
        options: [baseOptions],
      },
      {
        code: 'import { tursoOrderRepository } from "../infrastructure/turso/turso-order-repository";',
        errors: [
          {
            data: {
              allowedLayers: "`http`, `application`",
              fromLayer: "http",
              fromModule: "orders",
              source:
                "../infrastructure/turso/turso-order-repository",
              toLayer: "infrastructure",
              toModule: "orders",
            },
            messageId: "forbiddenLayerImport",
          },
        ],
        filename: httpFile,
        options: [baseOptions],
      },
      {
        code: 'import { tursoOrderRepository } from "../infrastructure/turso/turso-order-repository";',
        errors: [
          {
            data: {
              allowedLayers: "`contracts`",
              fromLayer: "contracts",
              fromModule: "orders",
              source:
                "../infrastructure/turso/turso-order-repository",
              toLayer: "infrastructure",
              toModule: "orders",
            },
            messageId: "forbiddenLayerImport",
          },
        ],
        filename: contractsFile,
        options: [baseOptions],
      },
      {
        code: 'export { tursoOrderRepository } from "./infrastructure/turso/turso-order-repository";',
        errors: [
          {
            data: {
              allowedLayers: "`application`, `domain`, `contracts`",
              moduleName: "orders",
              source:
                "./infrastructure/turso/turso-order-repository",
              toLayer: "infrastructure",
            },
            messageId: "forbiddenPublicExport",
          },
        ],
        filename: indexFile,
        options: [baseOptions],
      },
      {
        code: 'import { paymentClient } from "#/modules/payments/infrastructure/payment-client";',
        errors: [
          {
            data: {
              allowedLayers: "`domain`",
              fromLayer: "domain",
              fromModule: "orders",
              source:
                "#/modules/payments/infrastructure/payment-client",
              toLayer: "infrastructure",
              toModule: "payments",
            },
            messageId: "forbiddenLayerImport",
          },
        ],
        filename: domainFile,
        options: [baseOptions],
      },
      {
        code: 'const repository = await import("../infrastructure/turso/turso-order-repository");',
        errors: [
          {
            data: {
              allowedLayers: "`domain`",
              fromLayer: "domain",
              fromModule: "orders",
              source:
                "../infrastructure/turso/turso-order-repository",
              toLayer: "infrastructure",
              toModule: "orders",
            },
            messageId: "forbiddenLayerImport",
          },
        ],
        filename: domainFile,
        options: [baseOptions],
      },
      {
        code: 'import { missing } from "../infrastructure/missing";',
        errors: [
          {
            data: {
              moduleName: "orders",
              source: "../infrastructure/missing",
            },
            messageId: "unresolvedInternalImport",
          },
        ],
        filename: domainFile,
        options: [baseOptions],
      },
    ],
    valid: [
      {
        code: 'import type { Order } from "./order";',
        filename: domainFile,
        options: [baseOptions],
      },
      {
        code: 'import type { Order } from "../domain/order";',
        filename: applicationFile,
        options: [baseOptions],
      },
      {
        code: 'import { createOrder } from "../application/create-order";',
        filename: httpFile,
        options: [baseOptions],
      },
      {
        code: 'import { createOrder } from "../../application/create-order";',
        filename: infrastructureFile,
        options: [baseOptions],
      },
      {
        code: 'import type { Order } from "../../domain/order";',
        filename: infrastructureFile,
        options: [baseOptions],
      },
      {
        code: 'import type { ProviderContract } from "../../contracts/provider-contract";',
        filename: infrastructureFile,
        options: [baseOptions],
      },
      {
        code: 'import { tursoOrderRepository } from "./infrastructure/turso/turso-order-repository";',
        filename: moduleFile,
        options: [baseOptions],
      },
      {
        code: 'import { external } from "external-package";',
        filename: domainFile,
        options: [baseOptions],
      },
      {
        code: 'import { tursoOrderRepository } from ".";',
        filename: infrastructureFile,
        options: [baseOptions],
      },
      {
        code: 'export * from "./application/create-order"; export * from "./domain/order"; export * from "./contracts/provider-contract";',
        filename: indexFile,
        options: [baseOptions],
      },
      {
        code: 'import { value } from "#/shared/value";',
        filename: domainFile,
        options: [baseOptions],
      },
      {
        code: 'import type { Order } from "#/modules/orders/domain/order";',
        filename: join(sourceRoot, "main.ts"),
        options: [baseOptions],
      },
      {
        code: 'import { tursoOrderRepository } from "../infrastructure/turso/turso-order-repository";',
        filename: join(ordersRoot, "domain", "order.spec.ts"),
        options: [baseOptions],
      },
      {
        code: "const source = '../infrastructure/turso/turso-order-repository'; const repository = import(source);",
        filename: domainFile,
        options: [baseOptions],
      },
      {
        code: 'import type { Product } from "./product";',
        filename: featureDomainFile,
        options: [{ modulesRoot: featuresRoot, sourceRoot }],
      },
      {
        code: 'import type { Order } from "~/modules/orders/domain/order";',
        filename: applicationFile,
        options: [{ ...baseOptions, aliasPrefixes: ["~/"] }],
      },
      {
        code: 'import { tursoOrderRepository } from "../infrastructure/turso/turso-order-repository";',
        filename: domainFile,
        options: [
          {
            ...baseOptions,
            allowedLayerImports: {
              domain: ["domain", "infrastructure"],
            },
          },
        ],
      },
      {
        code: 'export * from "./infrastructure/turso/turso-order-repository";',
        filename: indexFile,
        options: [
          {
            ...baseOptions,
            publicIndexAllowedLayers: [
              "application",
              "domain",
              "contracts",
              "infrastructure",
            ],
          },
        ],
      },
      {
        code: 'import { tursoOrderRepository } from "../infrastructure/turso/turso-order-repository";',
        filename: join(ordersRoot, "domain", "legacy.ts"),
        options: [
          { ...baseOptions, allowFilePatterns: ["**/domain/legacy.ts"] },
        ],
      },
      {
        code: 'import { missing } from "../../../missing";',
        filename: domainFile,
        options: [baseOptions],
      },
      {
        code: 'import { unresolvedAlias } from "unconfigured/internal";',
        filename: domainFile,
        options: [baseOptions],
      },
    ],
  },
);
