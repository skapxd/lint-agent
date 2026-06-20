import { rules } from "../../src/shared/rules";
import { createTypedRuleTester } from "../typed-rule-tester";

// trySafe REAL de @skapxd/result → protege el await.
const validSkapxdTrySafe = `
import { trySafe } from "@skapxd/result";

export async function load() {
  const result = await trySafe(() => fetch("/x"));
  return result;
}
`;

// Un trySafe local (homónimo, NO de @skapxd/result) NO protege.
const invalidForeignTrySafe = `
function trySafe<T>(fn: () => T): T {
  return fn();
}

export async function load() {
  const value = await trySafe(() => Promise.resolve(1));
  return value;
}
`;

// Awaitear una función que ya retorna Promise<Result> de @skapxd/result no
// necesita trySafe: los errores ya están modelados en el tipo.
const validAwaitedResult = `
import { type Result } from "@skapxd/result";

type DomainError = { type: "LOAD_FAILED" };

declare function getUser(): Promise<Result<number, Error>>;

class OrdersRepository {
  async find(): Promise<Result<number, DomainError>> {
    throw new Error("stub");
  }
}

export async function load() {
  const result = await getUser();
  return result;
}

export async function loadFromRepo(repo: OrdersRepository) {
  const result = await repo.find();
  return result;
}
`;

const validUseCaseComposesAnotherUseCase = `
import { UseCase } from "@skapxd/nest";

type Dto = { sku: string };
type OrderDto = { id: string };

@UseCase()
class CreateOrderUseCase {
  async execute(dto: Dto): Promise<OrderDto> {
    return { id: dto.sku };
  }
}

@UseCase()
class PlaceOrderUseCase {
  constructor(private readonly createOrder: CreateOrderUseCase) {}

  async execute(dto: Dto): Promise<OrderDto> {
    const order = await this.createOrder.execute(dto);
    return order;
  }
}
`;

const validControllerAwaitsUseCase = `
import { UseCase } from "@skapxd/nest";

declare function Body(): ParameterDecorator;
declare function Controller(prefix?: string): ClassDecorator;
declare function Post(): MethodDecorator;

type Dto = { sku: string };
type OrderDto = { id: string };

@UseCase()
class PlaceOrderUseCase {
  async execute(dto: Dto): Promise<OrderDto> {
    return { id: dto.sku };
  }
}

@Controller("orders")
export class OrdersController {
  constructor(private readonly placeOrder: PlaceOrderUseCase) {}

  @Post()
  async create(@Body() dto: Dto): Promise<OrderDto> {
    return await this.placeOrder.execute(dto);
  }
}
`;

const validAliasedUseCaseReceiver = `
import { UseCase } from "@skapxd/nest";

type Dto = { sku: string };
type OrderDto = { id: string };

@UseCase()
class PlaceOrderUseCase {
  async execute(dto: Dto): Promise<OrderDto> {
    return { id: dto.sku };
  }
}

export class OrdersController {
  constructor(private readonly placeOrder: PlaceOrderUseCase) {}

  async create(dto: Dto): Promise<OrderDto> {
    const uc = this.placeOrder;
    return await uc.execute(dto);
  }
}
`;

// Un Result casero (NO de @skapxd/result) no exime del trySafe.
const invalidForeignResult = `
type Result<T> = { ok: true; value: T } | { ok: false; error: Error };

declare function getUser(): Promise<Result<number>>;

export async function load() {
  const result = await getUser();
  return result;
}
`;

const invalidUseCaseExemptionLimits = `
import { UseCase } from "@skapxd/nest";

declare function LocalUseCase(): ClassDecorator;

@UseCase()
class LoadUserUseCase {
  async execute(url: string): Promise<string> {
    return await this.fetchRaw(url);
  }

  private async fetchRaw(url: string): Promise<string> {
    return url;
  }
}

class PaymentService {
  async doThing(): Promise<number> {
    return 1;
  }
}

export async function loadService(someService: PaymentService) {
  return await someService.doThing();
}

@LocalUseCase()
class FakeUseCase {
  async execute(): Promise<number> {
    return 1;
  }
}

export async function loadFake(fake: FakeUseCase) {
  return await fake.execute();
}
`;

const ruleTester = createTypedRuleTester();
type RuleArg = Parameters<typeof ruleTester.run>[1];

ruleTester.run(
  "await-requires-result",
  rules["await-requires-result"] as unknown as RuleArg,
  {
    invalid: [
      {
        code: invalidForeignTrySafe,
        errors: [{ messageId: "awaitWithoutResult" }],
        filename: "invalid-foreign-try-safe.ts",
      },
      {
        code: invalidForeignResult,
        errors: [{ messageId: "awaitWithoutResult" }],
        filename: "invalid-foreign-result.ts",
      },
      {
        code: invalidUseCaseExemptionLimits,
        errors: [
          { messageId: "awaitWithoutResult" },
          { messageId: "awaitWithoutResult" },
          { messageId: "awaitWithoutResult" },
        ],
        filename: "invalid-use-case-exemption-limits.ts",
      },
    ],
    valid: [
      { code: validSkapxdTrySafe, filename: "valid-skapxd-try-safe.ts" },
      { code: validAwaitedResult, filename: "valid-awaited-result.ts" },
      { code: validUseCaseComposesAnotherUseCase, filename: "valid-use-case-compose.ts" },
      { code: validControllerAwaitsUseCase, filename: "valid-controller-awaits-use-case.ts" },
      { code: validAliasedUseCaseReceiver, filename: "valid-aliased-use-case-receiver.ts" },
    ],
  },
);
