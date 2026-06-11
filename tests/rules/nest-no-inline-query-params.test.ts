import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run(
  "nest-no-inline-query-params",
  rules["nest-no-inline-query-params"]!,
  {
    invalid: [
      {
        // dos @Query('x') individuales: es un DTO disfrazado
        code: `
import { Controller, Get, Query } from "@nestjs/common";

@Controller("loans")
export class LoansController {
  @Get()
  findAll(@Query("status") status?: string, @Query("clientName") clientName?: string) {
    return [];
  }
}

declare function Controller(prefix?: string): ClassDecorator;
declare function Get(path?: string): MethodDecorator;
`,
        errors: [{ messageId: "tooManyInlineQueryParams" }],
        filename: "src/loans/loans.controller.ts",
      },
      {
        // @ApiQuery también suma al conteo
        code: `
import { Query } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";

export class LoansController {
  @ApiQuery({ name: "status" })
  findAll(@Query("status") status?: string) {
    return [];
  }
}
`,
        errors: [{ messageId: "tooManyInlineQueryParams" }],
        filename: "src/loans/loans.controller.ts",
      },
    ],
    valid: [
      // el patrón objetivo: un DTO consolidado
      {
        code: `
import { Query } from "@nestjs/common";

export class LoansController {
  findAll(@Query() filters: ListLoansDto) {
    return [];
  }
}
`,
        filename: "src/loans/loans.controller.ts",
      },
      // un solo @Query('id') es legítimo
      {
        code: `
import { Query } from "@nestjs/common";

export class LoansController {
  findOne(@Query("id") id: string) {
    return id;
  }
}
`,
        filename: "src/loans/loans.controller.ts",
      },
      // un Query casero (sin import de @nestjs/common) no cuenta
      {
        code: `
declare function Query(name?: string): ParameterDecorator;

export class LoansController {
  findAll(@Query("a") a: string, @Query("b") b: string) {
    return [a, b];
  }
}
`,
        filename: "src/loans/loans.controller.ts",
      },
      // el límite es configurable
      {
        code: `
import { Query } from "@nestjs/common";

export class LoansController {
  findAll(@Query("a") a: string, @Query("b") b: string) {
    return [a, b];
  }
}
`,
        filename: "src/loans/loans.controller.ts",
        options: [{ max: 2 }],
      },
    ],
  },
);
