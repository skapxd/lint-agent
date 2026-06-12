### `skapxd/async-functions-return-result`

> **Apagada por defecto desde v0.5.0** — ningún preset la activa. La regla
> obligatoria del sistema de errores es `skapxd/await-requires-result`.
>
> **Por qué se tomó esta decisión:**
>
> 1. **`await-requires-result` produce el mismo estado final con mejor
>    ergonomía.** Si ningún `await` puede quedar sin `Result`, envolver con
>    `trySafe` inline una y otra vez se vuelve incómodo rápido — la presión
>    natural es extraer funciones que retornen `Promise<Result<...>>` con
>    errores de dominio. Se llega a las mismas firmas que esta regla imponía,
>    pero por gravedad, no por decreto.
> 2. **Imponer la firma choca con los bordes del framework.** Los handlers
>    `GET/POST` de Next, `page.tsx`, los callbacks de librerías: sus firmas no
>    son tuyas. Esta regla necesitaba listas de excepciones
>    (`allowFilePatterns`, `allowNamePatterns`) para convivir con eso;
>    `await-requires-result` no necesita ninguna, porque envolver un `await`
>    es compatible con cualquier firma.
> 3. **Adopción incremental.** En un codebase existente, exigir la firma en
>    cada función async lo rompe todo de golpe. Exigir `Result` en los `await`
>    permite migrar llamada por llamada.
>
> Sigue disponible para quien quiera endurecer el contrato (p. ej. un backend
> nuevo donde todas las firmas son tuyas):
>
> ```js
> rules: {
>   "skapxd/async-functions-return-result": ["error", {
>     checkMissingReturnType: true,
>     resultTypeNames: ["Result", "ResultValue", "SafeResult"],
>   }],
> }
> ```

Obliga a que funciones async en dominios configurados declaren un retorno como:

```ts
Promise<Result<Success, DomainError>>
```

Es **type-aware** y está atada a `@skapxd/result`: usa el TypeScript checker para
confirmar que el `Result` viene de ese paquete, no solo que el tipo *se llame*
`Result`. Un `Result` de otro paquete (o un tipo homónimo hecho a mano) **no**
cumple la regla.

```ts
import { Result } from "@skapxd/result";
async function ok(): Promise<Result<number, Error>> {} // ✅

type Result<T, E> = ...;                                // ❌ Result ajeno
async function no(): Promise<Result<number, Error>> {}  // se reporta
```

> Requiere `projectService` (actívalo en `languageOptions.parserOptions` o
> apóyate en un preset tipado del plugin, que ya lo trae).
> Sin información de tipos cae a una comprobación por nombre (`resultTypeNames`),
> menos estricta.

Todas las opciones, con sus defaults:

```js
"skapxd/async-functions-return-result": ["error", {
  allowFilePatterns: [],       // globs de archivos exentos, p. ej. ["src/legacy/**"]
  allowNamePatterns: [],       // regex de nombres exentos, p. ej. ["^(GET|POST)$"]
  checkMissingReturnType: true, // reportar también funciones SIN anotación de retorno
  checkMissingReturnTypeWhenCallNames: [], // ...o solo si el cuerpo llama a estos nombres
  requireCallNames: [],        // acotar la regla a funciones que llamen a estos nombres
  promiseTypeNames: ["Promise"],  // wrappers de promesa aceptados (fallback sin tipos)
  resultTypeNames: ["Result"],    // nombres de Result aceptados (fallback sin tipos)
}]
```

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
