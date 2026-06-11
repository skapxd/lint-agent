import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

const controllerWith = (decorators: string, imports: string) => `
import { ${imports} } from "@nestjs/swagger";

declare function Controller(prefix?: string): ClassDecorator;
declare function Get(path?: string): MethodDecorator;

@Controller("users")
export class UsersController {
  ${decorators}
  @Get(":id")
  findOne(): { id: number } {
    return { id: 1 };
  }
}
`;

createRuleTester().run(
  "nest-no-swagger-in-controllers",
  rules["nest-no-swagger-in-controllers"]!,
  {
    invalid: [
      {
        // los redundantes con el plugin activo: la doc vive en el DTO
        code: controllerWith('@ApiOperation({ summary: "x" })', "ApiOperation"),
        errors: [{ messageId: "swaggerInController" }],
        filename: "src/users/users.controller.ts",
      },
      {
        code: controllerWith("@ApiResponse({ status: 200 })", "ApiResponse"),
        errors: [{ messageId: "swaggerInController" }],
        filename: "src/users/users.controller.ts",
      },
      {
        code: controllerWith('@ApiParam({ name: "id" })', "ApiParam"),
        errors: [{ messageId: "swaggerInController" }],
        filename: "src/users/users.controller.ts",
      },
    ],
    valid: [
      // el allow list real de un controller: ocultar, agrupar, auth, multipart
      {
        code: controllerWith("@ApiExcludeEndpoint()", "ApiExcludeEndpoint"),
        filename: "src/users/users.controller.ts",
      },
      {
        code: controllerWith('@ApiConsumes("multipart/form-data")', "ApiConsumes"),
        filename: "src/users/users.controller.ts",
      },
      // un decorador propio que se llame Api* no es de swagger: no se toca
      {
        code: `
declare function Controller(prefix?: string): ClassDecorator;
declare function Get(path?: string): MethodDecorator;
declare function ApiOperation(options: unknown): MethodDecorator;

@Controller("users")
export class UsersController {
  @ApiOperation({ summary: "custom" })
  @Get(":id")
  findOne(): { id: number } {
    return { id: 1 };
  }
}
`,
        filename: "src/users/users.controller.ts",
      },
      // fuera de una clase @Controller (un decorador factory propio) no aplica
      {
        code: `
import { ApiOperation } from "@nestjs/swagger";

export class SwaggerHelpers {
  @ApiOperation({ summary: "x" })
  document(): void {}
}
`,
        filename: "src/utils/swagger-helpers.ts",
      },
      // el allow list es configurable
      {
        code: controllerWith('@ApiOperation({ summary: "x" })', "ApiOperation"),
        filename: "src/users/users.controller.ts",
        options: [{ allowedDecoratorNames: ["ApiOperation"] }],
      },
    ],
  },
);
