import fs from "node:fs";
import { trySafe } from "@skapxd/result";
import { getAdoptionStateFilePath } from "./get-adoption-state-file-path";
import type { AdoptionState } from "#/utils/cli/types";

export function readAdoptionState(targetPath: string) {
  const statePath = getAdoptionStateFilePath(targetPath);
  const hasStateFile = fs.existsSync(statePath);

  if (!hasStateFile) {
    return null;
  }

  const parsedState = trySafe(() =>
    JSON.parse(fs.readFileSync(statePath, "utf8")) as unknown,
  );

  if (!parsedState.ok) {
    throw new Error("Estado persistido invalido.", {
      cause: parsedState.error,
    });
  }

  const state = parsedState.value;
  const stateIsObject = typeof state === "object" && state !== null;

  if (!stateIsObject) {
    return null;
  }

  const seed: unknown = Reflect.get(state, "seed");
  const percent: unknown = Reflect.get(state, "percent");
  const timestamp: unknown = Reflect.get(state, "timestamp");
  const targetRules: unknown = Reflect.get(state, "targetRules");
  const hasValidState =
    typeof seed === "string" &&
    typeof percent === "number" &&
    typeof timestamp === "string" &&
    Array.isArray(targetRules) &&
    targetRules.every((rule: unknown) => typeof rule === "string");

  if (!hasValidState) {
    return null;
  }

  return {
    path: statePath,
    state: {
      percent,
      seed,
      targetRules,
      timestamp,
    } satisfies AdoptionState,
  };
}
