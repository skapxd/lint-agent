import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

const controllerDeclarations = `
declare function Controller(prefix?: string): ClassDecorator;
declare function WebSocketGateway(): ClassDecorator;
declare function Get(path?: string): MethodDecorator;
declare function Post(path?: string): MethodDecorator;
declare function Res(): ParameterDecorator;
declare function Next(): ParameterDecorator;
`;

createRuleTester().run(
  "nest-controller-returns-dto",
  rules["nest-controller-returns-dto"]!,
  {
    invalid: [
      {
        code: `
${controllerDeclarations}

@Controller("users")
export class UsersController {
  @Get()
  findAll() {
    return [];
  }
}
`,
        errors: [{ messageId: "missingDtoReturn" }],
        filename: "src/users/users.controller.ts",
      },
      {
        code: `
${controllerDeclarations}

@Controller("users")
export class UsersController {
  @Get(":id")
  findOne(): any {
    return {};
  }
}
`,
        errors: [{ messageId: "missingDtoReturn" }],
        filename: "src/users/users.controller.ts",
      },
      {
        code: `
${controllerDeclarations}

@Controller("users")
export class UsersController {
  @Get(":id")
  findOne(): Promise<unknown> {
    return Promise.resolve({});
  }
}
`,
        errors: [{ messageId: "missingDtoReturn" }],
        filename: "src/users/users.controller.ts",
      },
      {
        code: `
${controllerDeclarations}

@Controller("users")
export class UsersController {
  @Post()
  create(): { id: string } {
    return { id: "1" };
  }
}
`,
        errors: [{ messageId: "missingDtoReturn" }],
        filename: "src/users/users.controller.ts",
      },
      {
        code: `
${controllerDeclarations}

class UserResponse {
  id: string;
}

@Controller("users")
export class UsersController {
  @Get(":id")
  findOne(): Promise<UserResponse> {
    return Promise.resolve(new UserResponse());
  }
}
`,
        errors: [{ messageId: "missingDtoReturn" }],
        filename: "src/users/users.controller.ts",
        options: [{ requireDtoSuffix: true }],
      },
      {
        code: `
${controllerDeclarations}

@Controller("health")
export class HealthController {
  @Get()
  ping(): string {
    return "ok";
  }
}
`,
        errors: [{ messageId: "missingDtoReturn" }],
        filename: "src/health/health.controller.ts",
        options: [{ allowPrimitiveReturns: false }],
      },
    ],
    valid: [
      {
        code: `
${controllerDeclarations}

class UserResponse {
  id: string;
}

@Controller("users")
export class UsersController {
  @Get(":id")
  findOne(): Promise<UserResponse> {
    return Promise.resolve(new UserResponse());
  }
}
`,
        filename: "src/users/users.controller.ts",
      },
      {
        code: `
${controllerDeclarations}

class UserDto {
  id: string;
}

@Controller("users")
export class UsersController {
  @Get(":id")
  findOne(): Promise<UserDto> {
    return Promise.resolve(new UserDto());
  }
}
`,
        filename: "src/users/users.controller.ts",
      },
      {
        code: `
${controllerDeclarations}

class UserDto {
  id: string;
}

@Controller("users")
export class UsersController {
  @Get()
  findAll(): UserDto[] {
    return [];
  }
}
`,
        filename: "src/users/users.controller.ts",
      },
      {
        code: `
${controllerDeclarations}

class UserDto {
  id: string;
}

@Controller("users")
export class UsersController {
  @Get()
  findAll(): Promise<UserDto[]> {
    return Promise.resolve([]);
  }
}
`,
        filename: "src/users/users.controller.ts",
      },
      {
        code: `
${controllerDeclarations}

@Controller("users")
export class UsersController {
  @Post()
  create(): Promise<void> {
    return Promise.resolve();
  }
}
`,
        filename: "src/users/users.controller.ts",
      },
      {
        code: `
${controllerDeclarations}

type Response = { send: (body: string) => void };

@Controller("users")
export class UsersController {
  @Get("proxy")
  proxy(@Res() res: Response) {
    return res.send("ok");
  }
}
`,
        filename: "src/users/users.controller.ts",
      },
      {
        code: `
${controllerDeclarations}

type NextFunction = () => void;

@Controller("users")
export class UsersController {
  @Get("proxy")
  proxy(@Next() next: NextFunction) {
    return next();
  }
}
`,
        filename: "src/users/users.controller.ts",
      },
      {
        code: `
${controllerDeclarations}

@Controller("users")
export class UsersController {
  @Get("file")
  file(): StreamableFile {
    return {} as StreamableFile;
  }
}
`,
        filename: "src/users/users.controller.ts",
      },
      {
        code: `
${controllerDeclarations}

@Controller("health")
export class HealthController {
  @Get()
  ping(): string {
    return "ok";
  }
}
`,
        filename: "src/health/health.controller.ts",
      },
      {
        code: `
${controllerDeclarations}

@Controller("users")
export class UsersController {
  private toDto() {
    return {};
  }
}
`,
        filename: "src/users/users.controller.ts",
      },
      {
        code: `
${controllerDeclarations}

@Controller("events")
@WebSocketGateway()
export class EventsGateway {
  @Get()
  list(): any {
    return {};
  }
}
`,
        filename: "src/events/events.gateway.ts",
      },
      {
        code: `
${controllerDeclarations}

@Controller("users")
export class UsersController {
  @Get()
  findAll() {
    return [];
  }
}
`,
        filename: "src/users/users.controller.spec.ts",
      },
    ],
  },
);
