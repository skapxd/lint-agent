import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

const invalidWithoutTypeInformation = `
import { Body, Controller, Post } from "@nestjs/common";

interface CreateUserBody {
  name: string;
}

@Controller("users")
export class UsersController {
  @Post()
  create(@Body() body: CreateUserBody): void {
    void body;
  }
}
`;

const validAllowedFileWithoutTypeInformation = `
import { Body, Controller, Post } from "@nestjs/common";

interface CreateUserBody {
  name: string;
}

@Controller("users")
export class UsersController {
  @Post()
  create(@Body() body: CreateUserBody): void {
    void body;
  }
}
`;

const ruleTester = createRuleTester();

ruleTester.run(
  "nest-controller-input-dtos",
  rules["nest-controller-input-dtos"]!,
  {
    invalid: [
      {
        code: invalidWithoutTypeInformation,
        errors: [{ messageId: "missingTypeInformation" }],
        filename: "users.controller.ts",
      },
    ],
    valid: [
      {
        code: validAllowedFileWithoutTypeInformation,
        filename: "users.controller.spec.ts",
      },
    ],
  },
);
