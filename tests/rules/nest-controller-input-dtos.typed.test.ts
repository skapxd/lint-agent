import { rules } from "../../src/shared/rules";
import { createTypedRuleTester } from "../typed-rule-tester";

const nestCommonImports = `
import { Body, Controller, Get, Param, Post, Query, Req, UploadedFile } from "@nestjs/common";
`;

const validBodyDto = `
import { Dto } from "@skapxd/nest";
${nestCommonImports}

class CreateUserDto extends Dto() {
  name!: string;
}

@Controller("users")
export class UsersController {
  @Post()
  create(@Body() body: CreateUserDto): Promise<void> {
    void body;
    return Promise.resolve();
  }
}
`;

const validQueryDto = `
import { Dto } from "@skapxd/nest";
${nestCommonImports}

class ListUsersQueryDto extends Dto() {
  status?: string;
}

@Controller("users")
export class UsersController {
  @Get()
  find(@Query() filters: ListUsersQueryDto): Promise<void> {
    void filters;
    return Promise.resolve();
  }
}
`;

const validParamDto = `
import { Dto } from "@skapxd/nest";
${nestCommonImports}

class GetUserParamsDto extends Dto() {
  id!: string;
}

@Controller("users")
export class UsersController {
  @Get(":id")
  findOne(@Param() params: GetUserParamsDto): Promise<void> {
    void params;
    return Promise.resolve();
  }
}
`;

const validBulkDtoContainsArray = `
import { Dto } from "@skapxd/nest";
${nestCommonImports}

class CreateUserDto extends Dto() {
  name!: string;
}

class BulkCreateUsersDto extends Dto() {
  items!: CreateUserDto[];
}

@Controller("users")
export class UsersController {
  @Post("bulk")
  bulkCreate(@Body() body: BulkCreateUsersDto): Promise<void> {
    void body;
    return Promise.resolve();
  }
}
`;

const validMappedDtoWrappedWithDto = `
import { Dto } from "@skapxd/nest";
${nestCommonImports}

type Constructor = abstract new () => object;
declare function PartialType<TBase extends Constructor>(base: TBase): abstract new () => object;

class CreateUserDto extends Dto() {
  name!: string;
}

class UpdateUserDto extends Dto(PartialType(CreateUserDto)) {
  name?: string;
}

@Controller("users")
export class UsersController {
  @Post(":id")
  update(@Body() body: UpdateUserDto): Promise<void> {
    void body;
    return Promise.resolve();
  }
}
`;

const validNoHttpInput = `
${nestCommonImports}

@Controller("users")
export class UsersController {
  @Post("sync")
  sync(): Promise<void> {
    return Promise.resolve();
  }
}
`;

const validIgnoredDecorators = `
${nestCommonImports}

type Request = { user: unknown };
type FileUpload = { filename: string };

@Controller("users")
export class UsersController {
  @Post("avatar")
  upload(@UploadedFile() file: FileUpload, @Req() request: Request): Promise<void> {
    void file;
    void request;
    return Promise.resolve();
  }
}
`;

const validNonRouteMethod = `
${nestCommonImports}

interface CreateUserBody {
  name: string;
}

@Controller("users")
export class UsersController {
  create(@Body() body: CreateUserBody): Promise<void> {
    void body;
    return Promise.resolve();
  }
}
`;

const validNonController = `
${nestCommonImports}

interface CreateUserBody {
  name: string;
}

export class UsersService {
  @Post()
  create(@Body() body: CreateUserBody): Promise<void> {
    void body;
    return Promise.resolve();
  }
}
`;

const validAllowedFilePattern = `
${nestCommonImports}

interface CreateUserBody {
  name: string;
}

@Controller("users")
export class UsersController {
  @Post()
  create(@Body() body: CreateUserBody): Promise<void> {
    void body;
    return Promise.resolve();
  }
}
`;

const validDecoratorLocalBodyNotImportedFromNest = `
import { Controller, Post } from "@nestjs/common";

declare function Body(): ParameterDecorator;

interface CreateUserBody {
  name: string;
}

@Controller("users")
export class UsersController {
  @Post()
  create(@Body() body: CreateUserBody): Promise<void> {
    void body;
    return Promise.resolve();
  }
}
`;

const validAliasedNestDecorators = `
import { Dto } from "@skapxd/nest";
import { Body as HttpBody, Controller, Post as RoutePost } from "@nestjs/common";

class CreateUserDto extends Dto() {
  name!: string;
}

@Controller("users")
export class UsersController {
  @RoutePost()
  create(@HttpBody() body: CreateUserDto): Promise<void> {
    void body;
    return Promise.resolve();
  }
}
`;

const invalidBodyField = `
${nestCommonImports}

@Controller("users")
export class UsersController {
  @Post()
  create(@Body("name") name: string): Promise<void> {
    void name;
    return Promise.resolve();
  }
}
`;

const invalidQueryField = `
${nestCommonImports}

@Controller("users")
export class UsersController {
  @Get()
  find(@Query("status") status: string): Promise<void> {
    void status;
    return Promise.resolve();
  }
}
`;

const invalidParamField = `
${nestCommonImports}

@Controller("users")
export class UsersController {
  @Get(":id")
  findOne(@Param("id") id: string): Promise<void> {
    void id;
    return Promise.resolve();
  }
}
`;

const invalidRecordQuery = `
${nestCommonImports}

@Controller("users")
export class UsersController {
  @Get()
  find(@Query() filters: Record<string, string>): Promise<void> {
    void filters;
    return Promise.resolve();
  }
}
`;

const invalidInterfaceBody = `
${nestCommonImports}

interface CreateUserBody {
  name: string;
}

@Controller("users")
export class UsersController {
  @Post()
  create(@Body() body: CreateUserBody): Promise<void> {
    void body;
    return Promise.resolve();
  }
}
`;

const invalidTypeAliasBody = `
${nestCommonImports}

type CreateUserBody = {
  name: string;
};

@Controller("users")
export class UsersController {
  @Post()
  create(@Body() body: CreateUserBody): Promise<void> {
    void body;
    return Promise.resolve();
  }
}
`;

const invalidEntityBody = `
${nestCommonImports}

class UserEntity {
  id!: string;
}

@Controller("users")
export class UsersController {
  @Post()
  create(@Body() entity: UserEntity): Promise<void> {
    void entity;
    return Promise.resolve();
  }
}
`;

const invalidBodyArray = `
import { Dto } from "@skapxd/nest";
${nestCommonImports}

class CreateUserDto extends Dto() {
  name!: string;
}

@Controller("users")
export class UsersController {
  @Post()
  create(@Body() users: CreateUserDto[]): Promise<void> {
    void users;
    return Promise.resolve();
  }
}
`;

const invalidBodyReadonlyArray = `
import { Dto } from "@skapxd/nest";
${nestCommonImports}

class CreateUserDto extends Dto() {
  name!: string;
}

@Controller("users")
export class UsersController {
  @Post()
  create(@Body() users: ReadonlyArray<CreateUserDto>): Promise<void> {
    void users;
    return Promise.resolve();
  }
}
`;

const invalidBodyTuple = `
import { Dto } from "@skapxd/nest";
${nestCommonImports}

class CreateUserDto extends Dto() {
  name!: string;
}

@Controller("users")
export class UsersController {
  @Post()
  create(@Body() users: [CreateUserDto]): Promise<void> {
    void users;
    return Promise.resolve();
  }
}
`;

const invalidDestructuredBody = `
import { Dto } from "@skapxd/nest";
${nestCommonImports}

class CreateUserDto extends Dto() {
  name!: string;
}

@Controller("users")
export class UsersController {
  @Post()
  create(@Body() { name }: CreateUserDto): Promise<void> {
    void name;
    return Promise.resolve();
  }
}
`;

const invalidFakeLocalDtoMixin = `
${nestCommonImports}

function Dto() {
  return class {};
}

class CreateUserDto extends Dto() {
  name!: string;
}

@Controller("users")
export class UsersController {
  @Post()
  create(@Body() body: CreateUserDto): Promise<void> {
    void body;
    return Promise.resolve();
  }
}
`;

const invalidFakeLocalDtoBrand = `
${nestCommonImports}

declare const SKAPXD_LAYER: unique symbol;

class CreateUserDto {
  readonly [SKAPXD_LAYER]!: "dto";
  name!: string;
}

@Controller("users")
export class UsersController {
  @Post()
  create(@Body() body: CreateUserDto): Promise<void> {
    void body;
    return Promise.resolve();
  }
}
`;

const invalidMappedDtoWithoutWrapper = `
import { Dto } from "@skapxd/nest";
${nestCommonImports}

type Constructor = abstract new () => object;
declare function PartialType<TBase extends Constructor>(base: TBase): abstract new () => object;

class CreateUserDto extends Dto() {
  name!: string;
}

class UpdateUserDto extends PartialType(CreateUserDto) {
  name?: string;
}

@Controller("users")
export class UsersController {
  @Post(":id")
  update(@Body() body: UpdateUserDto): Promise<void> {
    void body;
    return Promise.resolve();
  }
}
`;

const invalidAliasedBodyField = `
import { Body as HttpBody, Controller, Post as RoutePost } from "@nestjs/common";

@Controller("users")
export class UsersController {
  @RoutePost()
  create(@HttpBody("name") name: string): Promise<void> {
    void name;
    return Promise.resolve();
  }
}
`;

const ruleTester = createTypedRuleTester();
const testFilename = "users.controller.ts";
type RuleArg = Parameters<typeof ruleTester.run>[1];

ruleTester.run(
  "nest-controller-input-dtos",
  rules["nest-controller-input-dtos"] as unknown as RuleArg,
  {
    invalid: [
      {
        code: invalidBodyField,
        errors: [
          {
            data: { decorator: "Body", name: "name", received: "campo suelto" },
            messageId: "invalidInputDto",
          },
        ],
        filename: testFilename,
      },
      {
        code: invalidQueryField,
        errors: [{ messageId: "invalidInputDto" }],
        filename: testFilename,
      },
      {
        code: invalidParamField,
        errors: [{ messageId: "invalidInputDto" }],
        filename: testFilename,
      },
      {
        code: invalidRecordQuery,
        errors: [{ messageId: "invalidInputDto" }],
        filename: testFilename,
      },
      {
        code: invalidInterfaceBody,
        errors: [{ messageId: "invalidInputDto" }],
        filename: testFilename,
      },
      {
        code: invalidTypeAliasBody,
        errors: [{ messageId: "invalidInputDto" }],
        filename: testFilename,
      },
      {
        code: invalidEntityBody,
        errors: [{ messageId: "invalidInputDto" }],
        filename: testFilename,
      },
      {
        code: invalidBodyArray,
        errors: [{ messageId: "invalidInputDto" }],
        filename: testFilename,
      },
      {
        code: invalidBodyReadonlyArray,
        errors: [{ messageId: "invalidInputDto" }],
        filename: testFilename,
      },
      {
        code: invalidBodyTuple,
        errors: [{ messageId: "invalidInputDto" }],
        filename: testFilename,
      },
      {
        code: invalidDestructuredBody,
        errors: [
          {
            data: {
              decorator: "Body",
              name: "parametro",
              received: "patron destructurado",
            },
            messageId: "invalidInputDto",
          },
        ],
        filename: testFilename,
      },
      {
        code: invalidFakeLocalDtoMixin,
        errors: [{ messageId: "invalidInputDto" }],
        filename: testFilename,
      },
      {
        code: invalidFakeLocalDtoBrand,
        errors: [{ messageId: "invalidInputDto" }],
        filename: testFilename,
      },
      {
        code: invalidMappedDtoWithoutWrapper,
        errors: [{ messageId: "invalidInputDto" }],
        filename: testFilename,
      },
      {
        code: invalidAliasedBodyField,
        errors: [
          {
            data: {
              decorator: "HttpBody",
              name: "name",
              received: "campo suelto",
            },
            messageId: "invalidInputDto",
          },
        ],
        filename: testFilename,
      },
    ],
    valid: [
      {
        code: validBodyDto,
        filename: testFilename,
      },
      {
        code: validQueryDto,
        filename: testFilename,
      },
      {
        code: validParamDto,
        filename: testFilename,
      },
      {
        code: validBulkDtoContainsArray,
        filename: testFilename,
      },
      {
        code: validMappedDtoWrappedWithDto,
        filename: testFilename,
      },
      {
        code: validNoHttpInput,
        filename: testFilename,
      },
      {
        code: validIgnoredDecorators,
        filename: testFilename,
      },
      {
        code: validNonRouteMethod,
        filename: testFilename,
      },
      {
        code: validNonController,
        filename: testFilename,
      },
      {
        code: validAllowedFilePattern,
        filename: testFilename,
        options: [{ allowFilePatterns: [testFilename] }],
      },
      {
        code: validDecoratorLocalBodyNotImportedFromNest,
        filename: testFilename,
      },
      {
        code: validAliasedNestDecorators,
        filename: testFilename,
      },
    ],
  },
);
