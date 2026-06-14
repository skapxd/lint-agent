import { createInterface } from "node:readline/promises";
import { Result, trySafe } from "@skapxd/result";
import type { PromptStreams } from "./types";

export async function promptForPath(streams: PromptStreams) {
  const readline = createInterface({
    input: streams.input,
    output: streams.output,
  });

  const answer = await trySafe(() => readline.question("Path a evaluar: "));
  readline.close();

  if (!answer.ok) {
    return Result.err(answer.error);
  }

  return Result.ok(answer.value.trim());
}
