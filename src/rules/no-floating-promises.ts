// @ts-nocheck
import { wrapTseslintRule } from "#/utils/wrap-tseslint-rule";

// @typescript-eslint/no-floating-promises con mensajes corregidos para ESTE
// sistema: el mensaje upstream recomienda `.then/.catch`, que aqui prohibe
// no-promise-chain — un dev que lo obedezca se estrella con la otra regla.
// Las dos salidas legales son `await` (y ahi entra el pipeline de Result) o
// `void promesa()` (axioma A5: fire-and-forget declarado, no interpretado).

const promesaFlotante =
  "Promesa flotante: nadie espera este resultado, y si rechaza, el error muere sin pasar por el pipeline de Result. Dos salidas: `await` (y `await-requires-result` te lleva a trySafe/Result) o `void promesa()` para declarar el fire-and-forget consciente. Nada de `.then/.catch`: `no-promise-chain` los prohibe — una sola forma de asincronia.";

export const noFloatingPromises = wrapTseslintRule("no-floating-promises", {
  description:
    "Prohibe promesas flotantes: una llamada async sin `await` no produce AwaitExpression y su rechazo muere sin pasar por trySafe. Se awaitea o se declara con `void`.",
  messages: {
    floating: promesaFlotante,
    floatingFixAwait: "Agrega `await`.",
    floatingFixVoid: "Agrega `void` para declarar el descarte consciente.",
    floatingPromiseArray:
      "Array de promesas sin manejar: probablemente falta un `await Promise.all(...)` (o `allSettled`) para esperar su resolucion — tal cual, ni se esperan ni se reporta su fallo.",
    floatingPromiseArrayVoid:
      "Array de promesas sin manejar: probablemente falta un `await Promise.all(...)` (o `allSettled`) — o un `void` si el descarte es deliberado.",
    floatingUselessRejectionHandler:
      promesaFlotante +
      " Ademas, el handler de rechazo que pasaste no es una funcion: se ignora en silencio.",
    floatingUselessRejectionHandlerVoid:
      promesaFlotante +
      " Ademas, el handler de rechazo que pasaste no es una funcion: se ignora en silencio.",
    floatingVoid: promesaFlotante,
  },
});
