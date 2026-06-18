import { expect, it } from "vitest";
import { rules } from "../../src/shared/rules";

it("tsDirectiveCommentDescriptionNotMatchPattern pide reescribir conservando la razon", () => {
  const message = rules["no-silenced-compiler"]!.meta.messages
    ?.tsDirectiveCommentDescriptionNotMatchPattern ?? "";

  expect(message).toContain("Reescribe la descripcion");
  expect(message).toContain("conservando la razon");
  // No copiar un patron vacio solo para pasar el lint.
  expect(message).toContain("no pegues un patron vacio");
  // Conserva los placeholders.
  expect(message).toContain("{{directive}}");
  expect(message).toContain("{{format}}");
});
