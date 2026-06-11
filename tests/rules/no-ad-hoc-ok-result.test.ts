import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run("no-ad-hoc-ok-result", rules["no-ad-hoc-ok-result"]!, {
  invalid: [
    {
      code: "export async function f() { return { ok: true }; }",
      errors: [{ messageId: "adHocOkResult" }],
    },
  ],
  valid: [
    // No exportada → se omite.
    "async function f() { return { ok: true }; }",
    // No async → se omite.
    "export function f() { return { ok: true }; }",
    // Sin propiedad `ok`.
    "export async function f() { return { value: 1 }; }",
    // `ok` no es un booleano literal (p. ej. un Response de fetch): no es un
    // contrato Result ad hoc, así que no se reporta.
    "export async function f() { const res = await fetch(url); return { ok: res.ok, data: 1 }; }",
  ],
});
