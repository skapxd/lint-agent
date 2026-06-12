import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run(
  "no-anonymous-condition",
  rules["no-anonymous-condition"]!,
  {
    invalid: [
      {
        // Llamada: el nombre dice que HACE, no que SIGNIFICA su resultado.
        code: "if (matchesAnyGlob(file, patterns)) { run(); }",
        errors: [{ messageId: "anonymousCondition" }],
        filename: "src/f.ts",
      },
      {
        // Comparacion: enuncia un hecho matematico, no su significado.
        code: "if (methods.length <= options.max) { run(); }",
        errors: [{ messageId: "anonymousCondition" }],
        filename: "src/f.ts",
      },
      {
        // Combinacion logica: tres hechos anonimos amarrados.
        code: "if (user && user.active) { run(); }",
        errors: [{ messageId: "anonymousCondition" }],
        filename: "src/f.ts",
      },
      {
        // Aritmetica: truthiness de un numero, un !== 0 que nadie escribio.
        code: "if (total % 2) { run(); }",
        errors: [{ messageId: "anonymousCondition" }],
        filename: "src/f.ts",
      },
      {
        // 3 saltos: el lector ya viaja por las entranas de otro objeto.
        code: "if (user.profile.address.verified) { run(); }",
        errors: [{ messageId: "anonymousCondition" }],
        filename: "src/f.ts",
      },
      {
        // La negacion no salva al computo: adentro sigue habiendo llamada.
        code: "if (!isEmpty(list)) { run(); }",
        errors: [{ messageId: "anonymousCondition" }],
        filename: "src/f.ts",
      },
      {
        // maxMemberDepth es configurable: con 1, dos saltos ya exigen nombre.
        code: "if (options.rules.flag) { run(); }",
        errors: [{ messageId: "anonymousCondition" }],
        filename: "src/f.ts",
        options: [{ maxMemberDepth: 1 }],
      },
      {
        // Comparar con literal NO booleano sigue siendo un computo anonimo.
        code: "if (status === 'ready') { run(); }",
        errors: [{ messageId: "anonymousCondition" }],
        filename: "src/f.ts",
      },
    ],
    valid: [
      // Identificador: la condicion ya es un nombre.
      { code: "if (isReady) { run(); }", filename: "src/f.ts" },
      // Su negacion sigue leyendose como prosa.
      { code: "if (!isReady) { run(); }", filename: "src/f.ts" },
      // 1 salto: el apellido de algo que ya tienes en la mano.
      { code: "if (result.ok) { run(); }", filename: "src/f.ts" },
      // El idioma de Result, intacto para las reglas que lo reconocen.
      { code: "if (!result.ok) { run(); }", filename: "src/f.ts" },
      // 2 saltos: el default del tope.
      { code: "if (options.rules.flag) { run(); }", filename: "src/f.ts" },
      // this cuenta como base (nivel 0).
      { code: "class A { f() { if (this.connected) { run(); } } }", filename: "src/f.ts" },
      // Encadenamiento opcional: acceso con duda declarada, sigue nombrado.
      { code: "if (config?.flag) { run(); }", filename: "src/f.ts" },
      // Comparacion con literal booleano: la afirmacion escrita explicita.
      { code: "if (result.ok === false) { run(); }", filename: "src/f.ts" },
      { code: "if (flag !== true) { run(); }", filename: "src/f.ts" },
      // Guard nullish: la escritura explicita de `!x` — coherencia con la
      // lista blanca (hallazgo de la calibracion contra unibank).
      { code: "if (concesionario == null) { run(); }", filename: "src/f.ts" },
      { code: "if (value !== undefined) { run(); }", filename: "src/f.ts" },
      // Doble negacion: se desenvuelve hasta el nombre.
      { code: "if (!!isReady) { run(); }", filename: "src/f.ts" },
      // La valvula estandar de archivos exentos.
      {
        code: "if (isEmpty(list)) { run(); }",
        filename: "src/legacy/f.ts",
        options: [{ allowFilePatterns: ["src/legacy/**"] }],
      },
    ],
  },
);
