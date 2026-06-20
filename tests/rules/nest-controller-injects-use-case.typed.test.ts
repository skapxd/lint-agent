import { rules } from "../../src/shared/rules";
import { createTypedRuleTester } from "../typed-rule-tester";

const invalidControllerInjectsService = `
declare function Controller(prefix?: string): ClassDecorator;

class UsersService {}

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
`;

const invalidGatewayInjectsRepository = `
declare function WebSocketGateway(): ClassDecorator;

class UsersRepository {}

@WebSocketGateway()
export class UsersGateway {
  constructor(private readonly usersRepository: UsersRepository) {}
}
`;

const invalidFakeUseCaseDecorator = `
declare function Controller(prefix?: string): ClassDecorator;
declare function UseCase(): ClassDecorator;

@UseCase()
class GetUserUseCase {}

@Controller("users")
export class UsersController {
  constructor(private readonly getUser: GetUserUseCase) {}
}
`;

const validControllerInjectsUseCase = `
import { UseCase } from "@skapxd/nest";

declare function Controller(prefix?: string): ClassDecorator;

@UseCase()
class GetUserUseCase {}

@Controller("users")
export class UsersController {
  constructor(private readonly getUser: GetUserUseCase) {}
}
`;

const validControllerInjectsExternalInfra = `
import { EventEmitter } from "node:events";

declare function Controller(prefix?: string): ClassDecorator;

@Controller("users")
export class UsersController {
  constructor(private readonly events: EventEmitter) {}
}
`;

const validControllerInjectsAllowedType = `
declare function Controller(prefix?: string): ClassDecorator;

class LegacyFacade {}

@Controller("users")
export class UsersController {
  constructor(private readonly legacyFacade: LegacyFacade) {}
}
`;

const validControllerWithoutConstructorParams = `
declare function Controller(prefix?: string): ClassDecorator;

@Controller("users")
export class UsersController {
  constructor() {}
}
`;

const validControllerWithAnyParameter = `
declare function Controller(prefix?: string): ClassDecorator;

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: any) {}
}
`;

const validControllerWithUntypedParameter = `
declare function Controller(prefix?: string): ClassDecorator;

@Controller("users")
export class UsersController {
  constructor(usersService) {
    void usersService;
  }
}
`;

const validNonControllerInjectsRepository = `
class UsersRepository {}

export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}
}
`;

const ruleTester = createTypedRuleTester();
type RuleArg = Parameters<typeof ruleTester.run>[1];

ruleTester.run(
  "nest-controller-injects-use-case",
  rules["nest-controller-injects-use-case"] as unknown as RuleArg,
  {
    invalid: [
      {
        code: invalidControllerInjectsService,
        errors: [
          {
            data: {
              controller: "UsersController",
              dependency: "UsersService",
            },
            messageId: "controllerInjectsNonUseCase",
          },
        ],
        filename: "users.controller.ts",
      },
      {
        code: invalidGatewayInjectsRepository,
        errors: [
          {
            data: {
              controller: "UsersGateway",
              dependency: "UsersRepository",
            },
            messageId: "controllerInjectsNonUseCase",
          },
        ],
        filename: "users.gateway.ts",
      },
      {
        code: invalidFakeUseCaseDecorator,
        errors: [
          {
            data: {
              controller: "UsersController",
              dependency: "GetUserUseCase",
            },
            messageId: "controllerInjectsNonUseCase",
          },
        ],
        filename: "fake-use-case.controller.ts",
      },
    ],
    valid: [
      {
        code: validControllerInjectsUseCase,
        filename: "valid-controller.ts",
      },
      {
        code: validControllerInjectsExternalInfra,
        filename: "valid-controller.ts",
      },
      {
        code: validControllerInjectsAllowedType,
        filename: "valid-controller.ts",
        options: [{ allowedInjectionTypeNames: ["LegacyFacade"] }],
      },
      {
        code: validControllerWithoutConstructorParams,
        filename: "valid-controller.ts",
      },
      {
        code: validControllerWithAnyParameter,
        filename: "valid-controller.ts",
      },
      {
        code: validControllerWithUntypedParameter,
        filename: "valid-controller.ts",
      },
      {
        code: validNonControllerInjectsRepository,
        filename: "valid-service.ts",
      },
    ],
  },
);
