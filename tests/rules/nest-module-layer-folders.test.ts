import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

const localController = `
function Controller(): ClassDecorator {
  return () => undefined;
}

@Controller()
export class AccountEndpoint {}
`;

createRuleTester().run(
  "nest-module-layer-folders",
  rules["nest-module-layer-folders"]!,
  {
    invalid: [
      {
        code: "export class OpenWaWebhookController {}",
        errors: [{ messageId: "wrongLayer" }],
        filename: "src/modules/whatsapp/open-wa-webhook.controller.ts",
      },
      {
        code: "export class OpenWaWebhookPayloadDto {}",
        errors: [{ messageId: "wrongLayer" }],
        filename: "src/modules/whatsapp/open-wa-webhook-payload.dto.ts",
      },
      {
        code: "export class ReceiveWhatsappMessageUseCase {}",
        errors: [{ messageId: "wrongLayer" }],
        filename: "src/modules/whatsapp/receive-whatsapp-message.use-case.ts",
      },
      {
        code: "export class HealthcheckRuntimeState {}",
        errors: [{ messageId: "unknownModuleFolder" }],
        filename:
          "src/modules/healthcheck/runtime/healthcheck-runtime-state.ts",
      },
      {
        code: "export class OpenWaWebhookController {}",
        errors: [{ messageId: "wrongLayer" }],
        filename:
          "src/modules/whatsapp/controllers/open-wa-webhook.controller.ts",
      },
      {
        code: "export class OpenwaModule {}",
        errors: [{ messageId: "nestedModuleFile" }],
        filename: "src/modules/whatsapp/http/openwa/openwa.module.ts",
      },
      {
        code: "export const helper = true;",
        errors: [{ messageId: "unknownRootFile" }],
        filename: "src/modules/whatsapp/helper.ts",
      },
      {
        code: `
          import { Controller as HttpController } from "@nestjs/common";
          @HttpController()
          export class Endpoint {}
        `,
        errors: [{ messageId: "wrongLayer" }],
        filename: "src/modules/whatsapp/domain/endpoint.ts",
      },
      {
        code: `
          import { Controller as HttpController } from "@nestjs/common";
          @HttpController()
          export class Endpoint {}
        `,
        errors: [{ messageId: "wrongLayer" }],
        filename: "src/modules/whatsapp/controllers/endpoint.ts",
      },
      {
        code: `
          import { WebSocketGateway as Gateway } from "@nestjs/websockets";
          @Gateway()
          export class Endpoint {}
        `,
        errors: [{ messageId: "wrongLayer" }],
        filename: "src/modules/whatsapp/application/endpoint.ts",
      },
      {
        code: `
          import { UseCase as ApplicationUseCase } from "@skapxd/nest";
          @ApplicationUseCase()
          export class ReceiveMessage {}
        `,
        errors: [{ messageId: "wrongLayer" }],
        filename: "src/modules/whatsapp/domain/receive-message.ts",
      },
      {
        code: `
          import { Dto as TransportDto } from "@skapxd/nest";
          export class Payload extends TransportDto() {}
        `,
        errors: [{ messageId: "wrongLayer" }],
        filename: "src/modules/whatsapp/application/payload.ts",
      },
      {
        code: "export class DeploymentStateRepository {}",
        errors: [{ messageId: "wrongLayer" }],
        filename:
          "src/modules/healthcheck/domain/deployment-state.repository.ts",
        options: [
          {
            suffixLayers: {
              infrastructure: [".repository.ts"],
            },
          },
        ],
      },
    ],
    valid: [
      {
        code: "export class WhatsappModule {}",
        filename: "src/modules/whatsapp/whatsapp.module.ts",
      },
      {
        code: 'export * from "./application/use-case";',
        filename: "src/modules/whatsapp/index.ts",
      },
      {
        code: "export class OpenWaWebhookController {}",
        filename:
          "src/modules/whatsapp/http/openwa/open-wa-webhook.controller.ts",
      },
      {
        code: "export class OpenWaWebhookPayloadDto {}",
        filename:
          "src/modules/whatsapp/http/openwa/open-wa-webhook-payload.dto.ts",
      },
      {
        code: "export class ReceiveWhatsappMessageUseCase {}",
        filename:
          "src/modules/whatsapp/application/receive-whatsapp-message.use-case.ts",
      },
      {
        code: "export class IncomingWhatsappMessage {}",
        filename:
          "src/modules/whatsapp/domain/incoming-whatsapp-message.ts",
      },
      {
        code: "export class DeploymentStateRepository {}",
        filename:
          "src/modules/healthcheck/infrastructure/postgres/deployment-state-repository.ts",
      },
      {
        code: "export type ProdSchemaContract = unknown;",
        filename:
          "src/modules/en-bocca-data/contracts/en-bocca-prod-schema-contract.ts",
      },
      {
        code: "it('works', () => undefined);",
        filename:
          "src/modules/healthcheck/http/healthcheck.controller.spec.ts",
      },
      {
        code: "export class AppModule {}",
        filename: "src/app.module.ts",
      },
      {
        code: "export function bootstrap() {}",
        filename: "src/main.ts",
      },
      {
        code: localController,
        filename: "src/modules/whatsapp/domain/account-endpoint.ts",
      },
      {
        code: "export class DeploymentStateRepository {}",
        filename:
          "src/modules/healthcheck/domain/deployment-state.repository.ts",
      },
      {
        code: "export const manifest = {};",
        filename: "src/modules/whatsapp/manifest.ts",
        options: [{ rootFileNames: ["index.ts", "manifest.ts"] }],
      },
      {
        code: "export class FeatureModule {}",
        filename: "src/features/catalog/catalog.module.ts",
        options: [{ modulesRoot: "src/features" }],
      },
      {
        code: "export const legacy = true;",
        filename: "src/modules/legacy/legacy.ts",
        options: [{ allowFilePatterns: ["**/legacy/legacy.ts"] }],
      },
    ],
  },
);
