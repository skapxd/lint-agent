import { rules } from "../../src/shared/rules";
import { createTypedRuleTester } from "../typed-rule-tester";

const invalidProjectRepositoryCall = `
import { trySafe } from "@skapxd/result";

class UsersRepository {
  async upsert(id: string): Promise<string> {
    return id;
  }
}

export class UpsertUserUseCase {
  constructor(private readonly repository: UsersRepository) {}

  async execute(id: string) {
    return trySafe(() => this.repository.upsert(id));
  }
}
`;

const validRuntimeReadFileCall = `
import { trySafe } from "@skapxd/result";
import { readFile } from "node:fs/promises";

export function loadFixture() {
  return trySafe(() => readFile("fixture.txt", "utf8"));
}
`;

const validRuntimeMethodCall = `
import { trySafe } from "@skapxd/result";
import type { FileHandle } from "node:fs/promises";

export function loadFixture(fileHandle: FileHandle) {
  return trySafe(() => fileHandle.readFile("utf8"));
}
`;

const validOrchestratedProjectCalls = `
import { trySafe } from "@skapxd/result";

async function loadUser(): Promise<string> {
  return "user";
}

async function saveAudit(user: string): Promise<void> {
  void user;
}

export function run() {
  return trySafe(async () => {
    const user = await loadUser();
    await saveAudit(user);
    return user;
  });
}
`;

const validAnyCallee = `
import { trySafe } from "@skapxd/result";

declare const repository: any;

export function run() {
  return trySafe(() => repository.upsert("1"));
}
`;

const validSpecFileProjectCall = `
import { trySafe } from "@skapxd/result";

async function upsert(id: string): Promise<string> {
  return id;
}

export function run() {
  return trySafe(() => upsert("1"));
}
`;

const validForeignTrySafe = `
async function trySafe<T>(callback: () => Promise<T>): Promise<T> {
  return callback();
}

async function upsert(id: string): Promise<string> {
  return id;
}

export function run() {
  return trySafe(() => upsert("1"));
}
`;

const validExternalBoundarySignals = `
import { readFileSync } from "node:fs";
import { trySafe } from "@skapxd/result";

export async function prompt() {
  const clackPrompts = await trySafe(() => import("@clack/prompts"));
  if (!clackPrompts.ok) {
    return clackPrompts;
  }

  const { text } = clackPrompts.value;
  return trySafe(() => text({ message: "Ruta" }));
}

function parseJsonRecord(source: string): Record<string, unknown> {
  return JSON.parse(source) as Record<string, unknown>;
}

export function loadPackage(path: string) {
  return trySafe(() => parseJsonRecord(readFileSync(path, "utf8")));
}
`;

const ruleTester = createTypedRuleTester();
type RuleArg = Parameters<typeof ruleTester.run>[1];

ruleTester.run(
  "trysafe-only-at-boundary",
  rules["trysafe-only-at-boundary"] as unknown as RuleArg,
  {
    invalid: [
      {
        code: invalidProjectRepositoryCall,
        errors: [
          {
            data: { callee: "this.repository.upsert" },
            messageId: "trySafeMisplaced",
          },
        ],
        filename: "upsert-user.use-case.ts",
      },
    ],
    valid: [
      { code: validRuntimeReadFileCall, filename: "load-fixture.ts" },
      { code: validRuntimeMethodCall, filename: "load-file-handle.ts" },
      { code: validOrchestratedProjectCalls, filename: "orchestrated.ts" },
      { code: validAnyCallee, filename: "any-callee.ts" },
      { code: validSpecFileProjectCall, filename: "upsert-user.spec.ts" },
      { code: validForeignTrySafe, filename: "foreign-trysafe.ts" },
      {
        code: validExternalBoundarySignals,
        filename: "external-boundary-signals.ts",
      },
    ],
  },
);
