import { rules } from "../../src/shared/rules";
import { createTypedRuleTester } from "../typed-rule-tester";

type ControllerSourceOptions = {
  async?: boolean;
  classMembers?: string;
  constructorParameter?: string;
  methodDecorator?: string;
  parameters?: string;
  topLevel?: string;
};

function createControllerSource(
  body: string,
  options: ControllerSourceOptions = {},
) {
  const asyncKeyword = options.async ? "async " : "";
  const constructorParameter = options.constructorParameter
    ? `, ${options.constructorParameter}`
    : "";

  return `
import { Dto, UseCase } from "@skapxd/nest";
import { Body, Controller, Get, Headers, Next, Param, Post, Query, Req, Res } from "@nestjs/common";

@UseCase()
class PrimaryUseCase {
  execute(...inputs: unknown[]): Promise<unknown> {
    return Promise.resolve(inputs[0]);
  }
}

@UseCase()
class SecondaryUseCase {
  execute(input: unknown): Promise<unknown> {
    return Promise.resolve(input);
  }
}

class AckDto extends Dto() {
  ok!: boolean;
}

${options.topLevel ?? ""}

@Controller("examples")
export class ExampleController {
  constructor(
    private readonly primaryUseCase: PrimaryUseCase,
    private readonly secondaryUseCase: SecondaryUseCase${constructorParameter},
  ) {}

  ${options.methodDecorator ?? "@Post()"}
  ${asyncKeyword}handle(${options.parameters ?? "payload: object"}) {
    ${body}
  }

  ${options.classMembers ?? ""}
}
`;
}

const invalidFakeUseCase = `
import { Controller, Post } from "@nestjs/common";

declare function UseCase(): ClassDecorator;

@UseCase()
class CreateOrderUseCase {
  execute(dto: object): Promise<object> {
    return Promise.resolve(dto);
  }
}

@Controller("orders")
export class OrdersController {
  constructor(private readonly createOrderUseCase: CreateOrderUseCase) {}

  @Post()
  create(dto: object): Promise<object> {
    return this.createOrderUseCase.execute(dto);
  }
}
`;

const invalidUnbrandedAck = `
import { UseCase } from "@skapxd/nest";
import { Controller, Post } from "@nestjs/common";

@UseCase()
class RecordWebhookUseCase {
  execute(payload: object): void {
    void payload;
  }
}

class WebhookAckDto {
  static fromPrimitives(input: { ok: boolean }): WebhookAckDto {
    return Object.assign(new WebhookAckDto(), input);
  }
}

@Controller("webhooks")
export class WebhookController {
  constructor(private readonly recordWebhookUseCase: RecordWebhookUseCase) {}

  @Post()
  receive(payload: object): WebhookAckDto {
    this.recordWebhookUseCase.execute(payload);
    return WebhookAckDto.fromPrimitives({ ok: true });
  }
}
`;

const validAliasedDecorators = `
import { UseCase as ApplicationUseCase } from "@skapxd/nest";
import { Controller as HttpController, Post as RoutePost } from "@nestjs/common";

@ApplicationUseCase()
class CreateOrderUseCase {
  execute(dto: object): Promise<object> {
    return Promise.resolve(dto);
  }
}

@HttpController("orders")
export class OrdersController {
  constructor(private readonly createOrderUseCase: CreateOrderUseCase) {}

  @RoutePost()
  create(dto: object): Promise<object> {
    return this.createOrderUseCase.execute(dto);
  }
}
`;

const validLocalControllerAndPost = `
declare function Controller(prefix?: string): ClassDecorator;
declare function Post(): MethodDecorator;

@Controller("local")
export class LocalController {
  @Post()
  handle(payload: object) {
    if (payload) {
      return new Date();
    }
  }
}
`;

const validDifferentNestImportsRenamedAsDecorators = `
import { Body as Controller, Query as Post } from "@nestjs/common";

@Controller("local")
export class LocalController {
  @Post()
  handle(payload: object) {
    return new Date();
  }
}
`;

const invalidCases = [
  {
    code: createControllerSource(`
      if (payload) {
        void payload;
      }
      return this.primaryUseCase.execute(payload);
    `),
    messageId: "controllerControlFlow",
  },
  {
    code: createControllerSource(`
      switch (String(payload)) {
        default:
          break;
      }
      return this.primaryUseCase.execute(payload);
    `),
    messageId: "controllerControlFlow",
  },
  {
    code: createControllerSource(`
      for (const item of [payload]) {
        void item;
      }
      return this.primaryUseCase.execute(payload);
    `),
    messageId: "controllerControlFlow",
  },
  {
    code: createControllerSource(`
      try {
        void payload;
      } catch {
        void payload;
      }
      return this.primaryUseCase.execute(payload);
    `),
    messageId: "controllerControlFlow",
  },
  {
    code: createControllerSource(
      "return this.primaryUseCase.execute(payload ? payload : {});",
    ),
    messageId: "controllerControlFlow",
  },
  {
    code: createControllerSource(
      "return this.primaryUseCase.execute(payload && {});",
    ),
    messageId: "controllerControlFlow",
  },
  {
    code: createControllerSource(`
      this.primaryUseCase.execute(payload);
      return this.secondaryUseCase.execute(payload);
    `),
    messageId: "multipleUseCaseCalls",
  },
  {
    code: createControllerSource(
      "this.map(payload); return this.primaryUseCase.execute(payload);",
      {
        classMembers: "private map(value: object) { return value; }",
      },
    ),
    messageId: "controllerCallsNonUseCase",
  },
  {
    code: createControllerSource(
      "return this.primaryUseCase.execute(this.map(payload));",
      {
        classMembers: "private map(value: object) { return value; }",
      },
    ),
    messageId: "controllerCallsNonUseCase",
  },
  {
    code: createControllerSource(
      "createHmac(payload); return this.primaryUseCase.execute(payload);",
      { topLevel: "declare function createHmac(value: unknown): unknown;" },
    ),
    messageId: "controllerCallsNonUseCase",
  },
  {
    code: createControllerSource(
      "return this.primaryUseCase.execute(new Date());",
    ),
    messageId: "controllerCallsNonUseCase",
  },
  {
    code: createControllerSource(`
      const mapped = 1 + 2;
      return this.primaryUseCase.execute(mapped);
    `),
    messageId: "controllerTransformsInput",
  },
  {
    code: createControllerSource(`
      const matches = payload === payload;
      return this.primaryUseCase.execute(matches);
    `),
    messageId: "controllerTransformsInput",
  },
  {
    code: createControllerSource(`
      const input = payload;
      return this.primaryUseCase.execute(input);
    `),
    messageId: "controllerTransformsInput",
  },
  {
    code: createControllerSource(
      "return this.primaryUseCase.execute({ ...payload });",
    ),
    messageId: "controllerTransformsInput",
  },
  {
    code: createControllerSource(
      "return this.primaryUseCase.execute(payload as object);",
    ),
    messageId: "controllerTransformsInput",
  },
  {
    code: createControllerSource(
      "return this.legacyService.execute(payload);",
      {
        constructorParameter: "private readonly legacyService: LegacyService",
        topLevel: "class LegacyService { execute(input: unknown) { return input; } }",
      },
    ),
    messageId: "controllerCallsNonUseCase",
  },
  {
    code: invalidFakeUseCase,
    messageId: "controllerCallsNonUseCase",
    methodName: "create",
  },
  {
    code: createControllerSource("return payload;"),
    messageId: "controllerMissingDelegation",
  },
  {
    code: createControllerSource(`
      this.primaryUseCase.execute(payload);
      return AckDto.fromPrimitives({ ok: Boolean(payload) });
    `),
    messageId: "controllerCallsNonUseCase",
  },
  {
    code: invalidUnbrandedAck,
    messageId: "controllerCallsNonUseCase",
    methodName: "receive",
  },
] satisfies readonly {
  code: string;
  messageId: string;
  methodName?: string;
}[];

const validCases = [
  createControllerSource("return this.primaryUseCase.execute(payload);"),
  createControllerSource(
    "return await this.primaryUseCase.execute(payload);",
    { async: true },
  ),
  createControllerSource("this.primaryUseCase.execute(payload);"),
  createControllerSource(
    "await this.primaryUseCase.execute(payload);",
    { async: true },
  ),
  createControllerSource(
    `return this.primaryUseCase.execute({
      body,
      header,
      params,
      query,
      rawBody: request.rawBody,
    });`,
    {
      parameters:
        "@Body() body: object, @Headers() header: object, @Param() params: object, @Query() query: object, @Req() request: { rawBody: string }",
    },
  ),
  createControllerSource(
    "return this.primaryUseCase.execute({ payload, flags: [true, false], nested: { ok: true } });",
  ),
  createControllerSource(`
    this.primaryUseCase.execute({ payload });
    return AckDto.fromPrimitives({ ok: true });
  `),
  createControllerSource(
    "return this.primaryUseCase.execute(payload);",
    { methodDecorator: "@Get()" },
  ),
  createControllerSource(
    "if (payload) { return new Date(); }",
    { methodDecorator: "" },
  ),
  validAliasedDecorators,
  validLocalControllerAndPost,
  validDifferentNestImportsRenamedAsDecorators,
  createControllerSource(
    "if (payload) { response.send(\"ok\"); }",
    { parameters: "payload: object, @Res() response: { send(value: string): void }" },
  ),
  createControllerSource(
    "if (payload) { next(); }",
    { parameters: "payload: object, @Next() next: () => void" },
  ),
  `
import { Post } from "@nestjs/common";

export class NotAController {
  @Post()
  handle(payload: object) {
    if (payload) {
      return new Date();
    }
  }
}
`,
  createControllerSource(
    "return this.primaryUseCase.execute(payload);",
    {
      methodDecorator: "@Get(\"file\")",
      topLevel: "class StreamableFile {}\nclass PdfFileDto extends Dto(StreamableFile) {}",
    },
  ),
];

const ruleTester = createTypedRuleTester();
const testFilename = "example.controller.ts";
type RuleArg = Parameters<typeof ruleTester.run>[1];

ruleTester.run(
  "nest-controller-delegates-to-use-case",
  rules["nest-controller-delegates-to-use-case"] as unknown as RuleArg,
  {
    invalid: invalidCases.map(({ code, messageId, methodName = "handle" }) => ({
      code,
      errors: [
        {
          data: { methodName },
          messageId,
        },
      ],
      filename: testFilename,
    })),
    valid: [
      ...validCases.map((code) => ({ code, filename: testFilename })),
      {
        code: createControllerSource("return payload;"),
        filename: "example.controller.spec.ts",
      },
      {
        code: createControllerSource("return payload;"),
        filename: testFilename,
        options: [{ allowFilePatterns: [testFilename] }],
      },
    ],
  },
);
