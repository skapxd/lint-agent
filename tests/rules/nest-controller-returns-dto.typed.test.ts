import { rules } from "../../src/shared/rules";
import { createTypedRuleTester } from "../typed-rule-tester";

const controllerDeclarations = `
declare function Controller(prefix?: string): ClassDecorator;
declare function WebSocketGateway(): ClassDecorator;
declare function Get(path?: string): MethodDecorator;
declare function Post(path?: string): MethodDecorator;
declare function Res(): ParameterDecorator;
declare function Next(): ParameterDecorator;
`;

const invalidInferredEmptyArray = `
${controllerDeclarations}

@Controller("users")
export class UsersController {
  @Get()
  findAll() {
    return [];
  }
}
`;

const invalidInterfaceDto = `
${controllerDeclarations}

interface UserDto {
  id: string;
}

@Controller("users")
export class UsersController {
  @Get(":id")
  findOne(): Promise<UserDto> {
    return Promise.resolve({ id: "1" });
  }
}
`;

const invalidTypeAliasDto = `
${controllerDeclarations}

type UserDto = {
  id: string;
};

@Controller("users")
export class UsersController {
  @Get(":id")
  findOne(): Promise<UserDto> {
    return Promise.resolve({ id: "1" });
  }
}
`;

const invalidClassWithoutDto = `
${controllerDeclarations}

class UserDto {
  id!: string;
}

@Controller("users")
export class UsersController {
  @Get(":id")
  findOne(): Promise<UserDto> {
    return Promise.resolve(new UserDto());
  }
}
`;

const invalidFakeLocalDtoMixin = `
${controllerDeclarations}

function Dto() {
  return class {};
}

class UserDto extends Dto() {
  id!: string;
}

@Controller("users")
export class UsersController {
  @Get(":id")
  findOne(): Promise<UserDto> {
    return Promise.resolve(new UserDto());
  }
}
`;

const invalidFakeLocalDtoBrand = `
${controllerDeclarations}

declare const SKAPXD_LAYER: unique symbol;

class UserDto {
  readonly [SKAPXD_LAYER]!: "dto";
  id!: string;
}

@Controller("users")
export class UsersController {
  @Get(":id")
  findOne(): Promise<UserDto> {
    return Promise.resolve(new UserDto());
  }
}
`;

const invalidSchemaReturn = `
${controllerDeclarations}

class UserSchema {
  _id!: string;
  passwordHash!: string;
}

@Controller("users")
export class UsersController {
  @Get()
  findAll(): Promise<UserSchema[]> {
    return Promise.resolve([new UserSchema()]);
  }
}
`;

const invalidUnionWithNonDto = `
import { Dto } from "@skapxd/nest";

${controllerDeclarations}

class UserDto extends Dto() {
  id!: string;
}

class UserSchema {
  _id!: string;
}

@Controller("users")
export class UsersController {
  @Get(":id")
  findOne(): Promise<UserDto | UserSchema> {
    return Promise.resolve(new UserSchema());
  }
}
`;

const invalidUnionWithPrimitive = `
import { Dto } from "@skapxd/nest";

${controllerDeclarations}

class UserDto extends Dto() {
  id!: string;
}

@Controller("users")
export class UsersController {
  @Get(":id")
  findOne(): Promise<UserDto | string> {
    return Promise.resolve("missing");
  }
}
`;

const invalidUnionDtos = `
import { Dto } from "@skapxd/nest";

${controllerDeclarations}

class CatDto extends Dto() {
  id!: string;
}

class DogDto extends Dto() {
  id!: string;
}

@Controller("pets")
export class PetsController {
  @Get(":id")
  findOne(): Promise<CatDto | DogDto> {
    return Promise.resolve(new CatDto());
  }
}
`;

const invalidVoidReturn = `
${controllerDeclarations}

@Controller("users")
export class UsersController {
  @Post()
  create(): Promise<void> {
    return Promise.resolve();
  }
}
`;

const invalidPrimitiveReturn = `
${controllerDeclarations}

@Controller("health")
export class HealthController {
  @Get()
  ping(): string {
    return "ok";
  }
}
`;

const invalidStreamReturn = `
${controllerDeclarations}

class StreamableFile {}

@Controller("users")
export class UsersController {
  @Get("file")
  file(): StreamableFile {
    return new StreamableFile();
  }
}
`;

const validPromiseDto = `
import { Dto } from "@skapxd/nest";

${controllerDeclarations}

class UserDto extends Dto() {
  id!: string;
}

@Controller("users")
export class UsersController {
  @Get(":id")
  findOne(): Promise<UserDto> {
    return Promise.resolve(new UserDto());
  }
}
`;

const invalidArrayDto = `
import { Dto } from "@skapxd/nest";

${controllerDeclarations}

class UserDto extends Dto() {
  id!: string;
}

@Controller("users")
export class UsersController {
  @Get()
  findAll(): UserDto[] {
    return [new UserDto()];
  }
}
`;

const invalidPromiseArrayDto = `
import { Dto } from "@skapxd/nest";

${controllerDeclarations}

class UserDto extends Dto() {
  id!: string;
}

@Controller("users")
export class UsersController {
  @Get()
  findAll(): Promise<UserDto[]> {
    return Promise.resolve([new UserDto()]);
  }
}
`;

const invalidGenericArrayDto = `
import { Dto } from "@skapxd/nest";

${controllerDeclarations}

class UserDto extends Dto() {
  id!: string;
}

@Controller("users")
export class UsersController {
  @Get()
  findAll(): Array<UserDto> {
    return [new UserDto()];
  }
}
`;

const invalidReadonlyArrayDto = `
import { Dto } from "@skapxd/nest";

${controllerDeclarations}

class UserDto extends Dto() {
  id!: string;
}

@Controller("users")
export class UsersController {
  @Get()
  findAll(): ReadonlyArray<UserDto> {
    return [new UserDto()];
  }
}
`;

const invalidTupleDto = `
import { Dto } from "@skapxd/nest";

${controllerDeclarations}

class UserDto extends Dto() {
  id!: string;
}

@Controller("users")
export class UsersController {
  @Get()
  findAll(): [UserDto] {
    return [new UserDto()];
  }
}
`;

const invalidInferredArrayDto = `
import { Dto } from "@skapxd/nest";

${controllerDeclarations}

class UserDto extends Dto() {
  id!: string;
}

@Controller("users")
export class UsersController {
  @Get()
  findAll() {
    return [new UserDto()];
  }
}
`;

const validListWrapperDto = `
import { Dto } from "@skapxd/nest";

${controllerDeclarations}

class UserDto extends Dto() {
  id!: string;
}

class ListUsersDto extends Dto() {
  items!: UserDto[];
}

@Controller("users")
export class UsersController {
  @Get()
  findAll(): Promise<ListUsersDto> {
    return Promise.resolve(new ListUsersDto());
  }
}
`;

const validInferredDto = `
import { Dto } from "@skapxd/nest";

${controllerDeclarations}

class UserDto extends Dto() {
  id!: string;
}

@Controller("users")
export class UsersController {
  @Get(":id")
  findOne() {
    return Promise.resolve(new UserDto());
  }
}
`;

const validDtoStreamReturn = `
import { Dto } from "@skapxd/nest";

${controllerDeclarations}

class StreamableFile {}

class PdfFileDto extends Dto(StreamableFile) {}

@Controller("reports")
export class ReportsController {
  @Get("file")
  file(): Promise<PdfFileDto> {
    return Promise.resolve(new PdfFileDto());
  }
}
`;

const validManualResponseHandler = `
${controllerDeclarations}

type Response = { send: (body: string) => void };

@Controller("users")
export class UsersController {
  @Get("proxy")
  proxy(@Res() res: Response) {
    return res.send("ok");
  }
}
`;

const validManualNextHandler = `
${controllerDeclarations}

type NextFunction = () => void;

@Controller("users")
export class UsersController {
  @Get("proxy")
  proxy(@Next() next: NextFunction) {
    return next();
  }
}
`;

const validNonRouteMethod = `
${controllerDeclarations}

class UserSchema {
  _id!: string;
}

@Controller("users")
export class UsersController {
  findOne(): Promise<UserSchema> {
    return Promise.resolve(new UserSchema());
  }
}
`;

const validNonController = `
${controllerDeclarations}

class UserSchema {
  _id!: string;
}

export class UsersService {
  @Get(":id")
  findOne(): Promise<UserSchema> {
    return Promise.resolve(new UserSchema());
  }
}
`;

const validGateway = `
${controllerDeclarations}

class UserSchema {
  _id!: string;
}

@Controller("users")
@WebSocketGateway()
export class UsersGateway {
  @Get(":id")
  findOne(): Promise<UserSchema> {
    return Promise.resolve(new UserSchema());
  }
}
`;

const validAllowedFilePattern = `
${controllerDeclarations}

class UserSchema {
  _id!: string;
}

@Controller("users")
export class UsersController {
  @Get(":id")
  findOne(): Promise<UserSchema> {
    return Promise.resolve(new UserSchema());
  }
}
`;

const ruleTester = createTypedRuleTester();
const testFilename = "controller.ts";
type RuleArg = Parameters<typeof ruleTester.run>[1];

ruleTester.run(
  "nest-controller-returns-dto",
  rules["nest-controller-returns-dto"] as unknown as RuleArg,
  {
    invalid: [
      {
        code: invalidInferredEmptyArray,
        errors: [
          {
            data: { name: "findAll", returned: "never[]" },
            messageId: "returnsArray",
          },
        ],
        filename: testFilename,
      },
      {
        code: invalidInterfaceDto,
        errors: [{ messageId: "returnsNonClass" }],
        filename: testFilename,
      },
      {
        code: invalidTypeAliasDto,
        errors: [{ messageId: "returnsNonClass" }],
        filename: testFilename,
      },
      {
        code: invalidClassWithoutDto,
        errors: [{ messageId: "returnsUnmarkedClass" }],
        filename: testFilename,
      },
      {
        code: invalidFakeLocalDtoMixin,
        errors: [{ messageId: "returnsUnmarkedClass" }],
        filename: testFilename,
      },
      {
        code: invalidFakeLocalDtoBrand,
        errors: [{ messageId: "returnsUnmarkedClass" }],
        filename: testFilename,
      },
      {
        code: invalidSchemaReturn,
        errors: [
          {
            data: { name: "findAll", returned: "UserSchema[]" },
            messageId: "returnsArray",
          },
        ],
        filename: testFilename,
      },
      {
        code: invalidUnionWithNonDto,
        errors: [{ messageId: "returnsUnionType" }],
        filename: testFilename,
      },
      {
        code: invalidUnionWithPrimitive,
        errors: [{ messageId: "returnsUnionType" }],
        filename: testFilename,
      },
      {
        code: invalidUnionDtos,
        errors: [
          {
            data: { name: "findOne", returned: "CatDto | DogDto" },
            messageId: "returnsUnionType",
          },
        ],
        filename: testFilename,
      },
      {
        code: invalidVoidReturn,
        errors: [
          {
            data: { name: "create", returned: "void" },
            messageId: "returnsVoid",
          },
        ],
        filename: testFilename,
      },
      {
        code: invalidPrimitiveReturn,
        errors: [
          {
            data: { name: "ping", returned: "string" },
            messageId: "returnsPrimitive",
          },
        ],
        filename: testFilename,
      },
      {
        code: invalidStreamReturn,
        errors: [{ messageId: "returnsUnmarkedClass" }],
        filename: testFilename,
      },
      {
        code: invalidArrayDto,
        errors: [
          {
            data: { name: "findAll", returned: "UserDto[]" },
            messageId: "returnsArray",
          },
        ],
        filename: testFilename,
      },
      {
        code: invalidPromiseArrayDto,
        errors: [
          {
            data: { name: "findAll", returned: "UserDto[]" },
            messageId: "returnsArray",
          },
        ],
        filename: testFilename,
      },
      {
        code: invalidGenericArrayDto,
        errors: [
          {
            data: { name: "findAll", returned: "UserDto[]" },
            messageId: "returnsArray",
          },
        ],
        filename: testFilename,
      },
      {
        code: invalidReadonlyArrayDto,
        errors: [
          {
            data: { name: "findAll", returned: "readonly UserDto[]" },
            messageId: "returnsArray",
          },
        ],
        filename: testFilename,
      },
      {
        code: invalidTupleDto,
        errors: [
          {
            data: { name: "findAll", returned: "[UserDto]" },
            messageId: "returnsArray",
          },
        ],
        filename: testFilename,
      },
      {
        code: invalidInferredArrayDto,
        errors: [
          {
            data: { name: "findAll", returned: "UserDto[]" },
            messageId: "returnsArray",
          },
        ],
        filename: testFilename,
      },
    ],
    valid: [
      {
        code: validPromiseDto,
        filename: testFilename,
      },
      {
        code: validListWrapperDto,
        filename: testFilename,
      },
      {
        code: validInferredDto,
        filename: testFilename,
      },
      {
        code: validDtoStreamReturn,
        filename: testFilename,
      },
      {
        code: validManualResponseHandler,
        filename: testFilename,
      },
      {
        code: validManualNextHandler,
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
        code: validGateway,
        filename: testFilename,
      },
      {
        code: validAllowedFilePattern,
        filename: testFilename,
        options: [{ allowFilePatterns: [testFilename] }],
      },
    ],
  },
);
