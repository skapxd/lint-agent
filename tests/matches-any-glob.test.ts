import { describe, expect, it } from "vitest";
import { matchesAnyGlob } from "../src/utils/matches-any-glob";

describe("matchesAnyGlob", () => {
  it("un patrón sin prefijo matchea en cualquier carpeta", () => {
    expect(matchesAnyGlob("/repo/src/index.ts", ["src/index.ts"])).toBe(true);
    expect(matchesAnyGlob("src/index.ts", ["src/index.ts"])).toBe(true);
    expect(matchesAnyGlob("/repo/xsrc/index.ts", ["src/index.ts"])).toBe(false);
  });

  it("* cubre un segmento, ** cualquier profundidad", () => {
    expect(matchesAnyGlob("tailwind.config.ts", ["*.config.*"])).toBe(true);
    expect(matchesAnyGlob("/repo/next.config.mjs", ["*.config.*"])).toBe(true);
    expect(matchesAnyGlob("/repo/a/b/c/page.tsx", ["**/page.tsx"])).toBe(true);
    expect(matchesAnyGlob("/repo/legacy/x/y.ts", ["legacy/**"])).toBe(true);
    expect(matchesAnyGlob("/repo/src/y.ts", ["legacy/**"])).toBe(false);
  });

  it("{a,b} expande alternativas", () => {
    const globs = ["{page,layout}.{ts,tsx}"];

    expect(matchesAnyGlob("src/app/page.tsx", globs)).toBe(true);
    expect(matchesAnyGlob("src/app/layout.ts", globs)).toBe(true);
    expect(matchesAnyGlob("src/app/card.tsx", globs)).toBe(false);
  });

  it("normaliza separadores de Windows", () => {
    expect(matchesAnyGlob("C:\\repo\\src\\app\\page.tsx", ["page.tsx"])).toBe(true);
  });
});
