import { describe, expect, it } from "vitest";
import plugin from "../src/index";

describe("configs.strict", () => {
  it("expone el preset endurecido con noInlineConfig", () => {
    expect(plugin.configs.strict.linterOptions.noInlineConfig).toBe(true);
  });
});

describe("configs.frontendServices", () => {
  it("obliga a trySafe en la capa de servicios del front", () => {
    const config = plugin.configs.frontendServices;

    expect(config.rules["skapxd/await-requires-try-safe"]).toBe("error");
    expect(config.files).toContain("**/services/**/*.{ts,tsx}");
  });
});
