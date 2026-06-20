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

const invalidMissingReturnType = `
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

const invalidFakeDtoDecorator = `
${controllerDeclarations}

declare function Dto(): ClassDecorator;

@Dto()
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

@Dto()
class UserDto {
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

@Dto()
class UserDto {
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

const invalidPrimitiveWhenDisabled = `
${controllerDeclarations}

@Controller("health")
export class HealthController {
  @Get()
  ping(): string {
    return "ok";
  }
}
`;

const validPromiseDto = `
import { Dto } from "@skapxd/nest";

${controllerDeclarations}

@Dto()
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

const validArrayDto = `
import { Dto } from "@skapxd/nest";

${controllerDeclarations}

@Dto()
class UserDto {
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

const validPromiseArrayDto = `
import { Dto } from "@skapxd/nest";

${controllerDeclarations}

@Dto()
class UserDto {
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

const validUnionDtos = `
import { Dto } from "@skapxd/nest";

${controllerDeclarations}

@Dto()
class UserDto {
  id!: string;
}

@Dto()
class AdminDto {
  id!: string;
}

@Controller("users")
export class UsersController {
  @Get(":id")
  findOne(): Promise<UserDto | AdminDto> {
    return Promise.resolve(new UserDto());
  }
}
`;

const validVoidReturn = `
${controllerDeclarations}

@Controller("users")
export class UsersController {
  @Post()
  create(): Promise<void> {
    return Promise.resolve();
  }
}
`;

const validPrimitiveReturn = `
${controllerDeclarations}

@Controller("health")
export class HealthController {
  @Get()
  ping(): string {
    return "ok";
  }
}
`;

const validStreamReturn = `
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
        code: invalidMissingReturnType,
        errors: [{ messageId: "missingDtoReturn" }],
        filename: testFilename,
      },
      {
        code: invalidInterfaceDto,
        errors: [{ messageId: "missingDtoReturn" }],
        filename: testFilename,
      },
      {
        code: invalidTypeAliasDto,
        errors: [{ messageId: "missingDtoReturn" }],
        filename: testFilename,
      },
      {
        code: invalidClassWithoutDto,
        errors: [{ messageId: "missingDtoReturn" }],
        filename: testFilename,
      },
      {
        code: invalidFakeDtoDecorator,
        errors: [{ messageId: "missingDtoReturn" }],
        filename: testFilename,
      },
      {
        code: invalidSchemaReturn,
        errors: [{ messageId: "missingDtoReturn" }],
        filename: testFilename,
      },
      {
        code: invalidUnionWithNonDto,
        errors: [{ messageId: "missingDtoReturn" }],
        filename: testFilename,
      },
      {
        code: invalidUnionWithPrimitive,
        errors: [{ messageId: "missingDtoReturn" }],
        filename: testFilename,
      },
      {
        code: invalidPrimitiveWhenDisabled,
        errors: [{ messageId: "missingDtoReturn" }],
        filename: testFilename,
        options: [{ allowPrimitiveReturns: false }],
      },
    ],
    valid: [
      {
        code: validPromiseDto,
        filename: testFilename,
      },
      {
        code: validArrayDto,
        filename: testFilename,
      },
      {
        code: validPromiseArrayDto,
        filename: testFilename,
      },
      {
        code: validUnionDtos,
        filename: testFilename,
      },
      {
        code: validVoidReturn,
        filename: testFilename,
      },
      {
        code: validPrimitiveReturn,
        filename: testFilename,
      },
      {
        code: validStreamReturn,
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
