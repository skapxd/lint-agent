import { rules } from "../../src/shared/rules";
import { createTypedRuleTester } from "../typed-rule-tester";

const invalidAsyncUseCaseReturnsResult = `
import { UseCase } from "@skapxd/nest";
import { Result } from "@skapxd/result";

type Dto = { id: number };
type DomainError = { type: "NOT_FOUND" };

@UseCase()
export class GetUserUseCase {
  async execute(): Promise<Result<Dto, DomainError>> {
    return Result.ok({ id: 1 });
  }
}
`;

const invalidSyncUseCaseReturnsResult = `
import { UseCase } from "@skapxd/nest";
import { Result } from "@skapxd/result";

type Dto = { id: number };
type DomainError = { type: "NOT_FOUND" };

@UseCase()
export class GetUserUseCase {
  run(): Result<Dto, DomainError> {
    return Result.ok({ id: 1 });
  }
}
`;

const invalidOnlyOnePublicMethodReturnsResult = `
import { UseCase } from "@skapxd/nest";
import { Result } from "@skapxd/result";

type Dto = { id: number };
type DomainError = { type: "NOT_FOUND" };

@UseCase()
export class GetUserUseCase {
  preview(): Dto {
    return { id: 1 };
  }

  save(): Result<Dto, DomainError> {
    return Result.ok({ id: 1 });
  }
}
`;

const validUseCaseReturnsDto = `
import { UseCase } from "@skapxd/nest";

type Dto = { id: number };

@UseCase()
export class GetUserUseCase {
  async execute(): Promise<Dto> {
    return { id: 1 };
  }
}
`;

const validPrivateHelpersReturnResult = `
import { UseCase } from "@skapxd/nest";
import { Result } from "@skapxd/result";

type Dto = { id: number };
type DomainError = { type: "NOT_FOUND" };

@UseCase()
export class GetUserUseCase {
  execute(): Dto {
    return { id: 1 };
  }

  private loadPrivate(): Result<Dto, DomainError> {
    return Result.ok({ id: 1 });
  }

  protected loadProtected(): Result<Dto, DomainError> {
    return Result.ok({ id: 1 });
  }

  #loadHashPrivate(): Result<Dto, DomainError> {
    return Result.ok({ id: 1 });
  }
}
`;

const validAccessorsAndConstructorAreIgnored = `
import { UseCase } from "@skapxd/nest";
import { Result } from "@skapxd/result";

type Dto = { id: number };
type DomainError = { type: "NOT_FOUND" };

@UseCase()
export class GetUserUseCase {
  constructor(private readonly id: number) {}

  get current(): Result<Dto, DomainError> {
    return Result.ok({ id: this.id });
  }

  set current(value: Result<Dto, DomainError>) {
    void value;
  }
}
`;

const validFakeUseCaseDecorator = `
import { Result } from "@skapxd/result";

declare function UseCase(): ClassDecorator;

type Dto = { id: number };
type DomainError = { type: "NOT_FOUND" };

@UseCase()
export class NotReallyAUseCase {
  execute(): Result<Dto, DomainError> {
    return Result.ok({ id: 1 });
  }
}
`;

const validInjectableLowLayerReturnsResult = `
import { Result } from "@skapxd/result";

declare function Injectable(): ClassDecorator;

type Dto = { id: number };
type DomainError = { type: "NOT_FOUND" };

@Injectable()
export class UsersRepository {
  findById(): Result<Dto, DomainError> {
    return Result.ok({ id: 1 });
  }
}
`;

const validAllowedFilePattern = `
import { UseCase } from "@skapxd/nest";
import { Result } from "@skapxd/result";

type Dto = { id: number };
type DomainError = { type: "NOT_FOUND" };

@UseCase()
export class LegacyUseCase {
  execute(): Result<Dto, DomainError> {
    return Result.ok({ id: 1 });
  }
}
`;

const ruleTester = createTypedRuleTester();
type RuleArg = Parameters<typeof ruleTester.run>[1];

ruleTester.run(
  "nest-use-case-no-result-response",
  rules["nest-use-case-no-result-response"] as unknown as RuleArg,
  {
    invalid: [
      {
        code: invalidAsyncUseCaseReturnsResult,
        errors: [
          {
            data: { name: "execute" },
            messageId: "useCaseReturnsResult",
          },
        ],
        filename: "invalid-use-case.ts",
      },
      {
        code: invalidSyncUseCaseReturnsResult,
        errors: [
          {
            data: { name: "run" },
            messageId: "useCaseReturnsResult",
          },
        ],
        filename: "invalid-use-case.ts",
      },
      {
        code: invalidOnlyOnePublicMethodReturnsResult,
        errors: [
          {
            data: { name: "save" },
            messageId: "useCaseReturnsResult",
          },
        ],
        filename: "invalid-use-case.ts",
      },
    ],
    valid: [
      {
        code: validUseCaseReturnsDto,
        filename: "valid-use-case.ts",
      },
      {
        code: validPrivateHelpersReturnResult,
        filename: "valid-use-case.ts",
      },
      {
        code: validAccessorsAndConstructorAreIgnored,
        filename: "valid-use-case.ts",
      },
      {
        code: validFakeUseCaseDecorator,
        filename: "valid-fake-use-case.ts",
      },
      {
        code: validInjectableLowLayerReturnsResult,
        filename: "valid-injectable-result.ts",
      },
      {
        code: validAllowedFilePattern,
        filename: "legacy.fixture.ts",
        options: [{ allowFilePatterns: ["**/*.fixture.ts"] }],
      },
    ],
  },
);
