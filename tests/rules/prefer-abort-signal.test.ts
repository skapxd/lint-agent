import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

// El "antes": listener sin signal + removeEventListener manual en el cleanup.
const manualCleanup = `
useEffect(() => {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => sync(media.matches);
  media.addEventListener("change", onSystemChange);
  return () => media.removeEventListener("change", onSystemChange);
}, [settings]);
`;

// El "después": AbortController + signal + un solo abort en el cleanup.
const abortCleanup = `
useEffect(() => {
  const controller = new AbortController();
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => sync(media.matches);
  media.addEventListener("change", onSystemChange, { signal: controller.signal });
  return () => controller.abort();
}, [settings]);
`;

createRuleTester().run("prefer-abort-signal", rules["prefer-abort-signal"], {
  invalid: [
    {
      // dos reportes: el add sin signal y el remove manual
      code: manualCleanup,
      errors: [
        { messageId: "addWithoutSignal" },
        { messageId: "removeInsteadOfAbort" },
      ],
      filename: "use-a11y-settings.ts",
    },
    {
      // options sin signal tampoco basta
      code: 'useEffect(() => { window.addEventListener("resize", onResize, { passive: true }); }, []);',
      errors: [{ messageId: "addWithoutSignal" }],
      filename: "use-resize.ts",
    },
    {
      // useLayoutEffect también cuenta
      code: 'useLayoutEffect(() => { window.addEventListener("scroll", onScroll); }, []);',
      errors: [{ messageId: "addWithoutSignal" }],
      filename: "use-scroll.ts",
    },
  ],
  valid: [
    // el patrón objetivo completo
    { code: abortCleanup, filename: "use-a11y-settings.ts" },
    // fuera de un efecto la regla no opina (otro contexto, otras reglas)
    {
      code: 'function attach() { window.addEventListener("resize", onResize); }',
      filename: "attach.ts",
    },
    // options como identifier: beneficio de la duda (puede traer signal)
    {
      code: 'useEffect(() => { window.addEventListener("resize", onResize, listenerOptions); }, []);',
      filename: "use-resize.ts",
    },
    // archivos exentos por glob
    {
      code: 'useEffect(() => { window.addEventListener("resize", onResize); }, []);',
      filename: "src/legacy/use-resize.ts",
      options: [{ allowFilePatterns: ["src/legacy/**"] }],
    },
  ],
});
