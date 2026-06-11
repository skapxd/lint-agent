import { rules } from "../../src/shared/rules";
import { createTypedRuleTester } from "../typed-rule-tester";

// El footgun: Nest serializa lo que el handler retorna. Un Result crudo
// manda `{ ok: false, error: {...} }` con los internals al cliente.
const invalidControllerReturnsResult = `
import { Result } from "@skapxd/result";

declare function Controller(prefix?: string): ClassDecorator;

@Controller("users")
export class UsersController {
  async findOne(): Promise<Result<number, Error>> {
    return Result.ok(1);
  }
}
`;

// La frontera correcta: el controller traduce a DTO o lanza HttpException.
const validControllerReturnsDto = `
declare function Controller(prefix?: string): ClassDecorator;

@Controller("users")
export class UsersController {
  async findOne(): Promise<{ id: number }> {
    return { id: 1 };
  }
}
`;

// Una clase sin @Controller (un service) SÍ retorna Result: es el dominio.
const validServiceReturnsResult = `
import { Result } from "@skapxd/result";

export class UsersService {
  async findOne(): Promise<Result<number, Error>> {
    return Result.ok(1);
  }
}
`;

// Decorador custom vía opción.
const invalidCustomDecorator = `
import { Result } from "@skapxd/result";

declare function ApiController(prefix?: string): ClassDecorator;

@ApiController("users")
export class UsersController {
  async findOne(): Promise<Result<number, Error>> {
    return Result.ok(1);
  }
}
`;

const ruleTester = createTypedRuleTester();
type RuleArg = Parameters<typeof ruleTester.run>[1];

ruleTester.run(
  "nest-no-result-response",
  rules["nest-no-result-response"] as unknown as RuleArg,
  {
    invalid: [
      {
        code: invalidControllerReturnsResult,
        errors: [{ messageId: "nestNoResultResponse" }],
        filename: "invalid-controller-result.ts",
      },
      {
        code: invalidCustomDecorator,
        errors: [{ messageId: "nestNoResultResponse" }],
        filename: "invalid-custom-decorator.ts",
        options: [{ controllerDecoratorNames: ["ApiController"] }],
      },
    ],
    valid: [
      {
        code: validControllerReturnsDto,
        filename: "valid-controller-dto.ts",
      },
      {
        code: validServiceReturnsResult,
        filename: "valid-service-result.ts",
      },
    ],
  },
);
