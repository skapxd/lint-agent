import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run(
  "nest-dto-requires-api-property",
  rules["nest-dto-requires-api-property"]!,
  {
    invalid: [
      {
        // propiedad pública sin decorador de swagger
        code: "export class CreateUserDto { name: string; }",
        errors: [{ messageId: "missingApiProperty" }],
        filename: "src/users/dto/create-user.dto.ts",
      },
      {
        // tener OTROS decoradores (class-validator) no exime
        code: "export class CreateUserDto { @IsString() name: string; }",
        errors: [{ messageId: "missingApiProperty" }],
        filename: "src/users/dto/create-user.dto.ts",
      },
    ],
    valid: [
      {
        code: "export class CreateUserDto { @ApiProperty({ description: 'Nombre' }) name: string; }",
        filename: "src/users/dto/create-user.dto.ts",
      },
      {
        code: "export class ListUsersDto { @ApiPropertyOptional() page?: number; }",
        filename: "src/users/dto/list-users.dto.ts",
      },
      // swagger solo serializa propiedades públicas de instancia
      {
        code: "export class CreateUserDto { @ApiProperty() name: string; private cache: string; static empty = new CreateUserDto(); }",
        filename: "src/users/dto/create-user.dto.ts",
      },
      // fuera de *.dto.ts la regla no opina
      {
        code: "export class UsersService { repository: unknown; }",
        filename: "src/users/users.service.ts",
      },
      // dtoFilePatterns configurable para otras convenciones
      {
        code: "export class CreateUserInput { name: string; }",
        filename: "src/users/inputs/create-user.input.ts",
        options: [{ dtoFilePatterns: ["*.dto.ts"] }],
      },
    ],
  },
);
