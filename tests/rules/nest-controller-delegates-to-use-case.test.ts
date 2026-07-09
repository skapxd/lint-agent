import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

const code = `
import { Controller, Post } from "@nestjs/common";

@Controller("examples")
export class ExampleController {
  @Post()
  handle(payload: object) {
    return payload;
  }
}
`;

const ruleTester = createRuleTester();

ruleTester.run(
  "nest-controller-delegates-to-use-case",
  rules["nest-controller-delegates-to-use-case"]!,
  {
    invalid: [
      {
        code,
        errors: [{ messageId: "missingTypeInformation" }],
        filename: "example.controller.ts",
      },
    ],
    valid: [
      {
        code,
        filename: "example.controller.spec.ts",
      },
    ],
  },
);
