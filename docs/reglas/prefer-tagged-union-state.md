### `skapxd/prefer-tagged-union-state`

La regla temática del paquete: el estado inconsistente que motivó todo esto, ahora prohibido en su origen. Detecta las dos formas de la enfermedad:

**Forma A — el tipo enfermo**: un flag boolean de "en proceso" conviviendo con un campo de error como propiedades independientes. Las combinaciones imposibles (cargando Y con error, error Y con valor) son *representables*:

```ts
// ❌ 2³ combinaciones; solo 3 tienen sentido
type RequestState = { isLoading: boolean; error?: Error; value?: Data };

// ✅ los estados imposibles no se pueden NI ESCRIBIR
type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "ok"; value: Data };
```

La forma A aplica **igual en el back**: la clase de un job con `private isProcessing = false; private lastError?: Error` es la versión OOP de la máquina repartida, y un schema de Mongoose con `@Prop() isSyncing` + `@Prop() syncError` es la versión más grave — **la inconsistencia se persiste en la base de datos**. La regla revisa tipos, interfaces y cuerpos de clase por igual, con verbos de ambos mundos (`loading`, `submitting`, `deploying`, `migrating`, `retrying`, ...).

**Forma B — la máquina repartida** (front): varios `useState` que en realidad son una sola máquina de estados. Cada transición toca varios setters y los renders intermedios ven combinaciones imposibles:

```ts
// ❌ tres setters para una transición: el render del medio ve mentiras
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);
const [user, setUser] = useState<User | null>(null);

// ✅ UN estado, transición atómica, match() exhaustivo
const [state, setState] = useState<RequestState>({ status: "idle" });
```

**¿`useState` con unión o `useReducer`?** Mismo criterio que [`max-hook-size`](./max-hook-size.md) (`tooManyUseState`), para no contradecir reglas hermanas: si son **fases de un mismo dato**, basta UN `useState` con una unión etiquetada; si las **transiciones se repiten o concentran reglas**, un `useReducer` con acciones de unión etiquetada deja la transición en un solo lugar. En ambos casos el estado es uno y `match().exhaustive()` lo consume.

**Forma C — la transición repartida (evidencia ESTRUCTURAL, sin depender de nombres)**: los setters de `useState` se identifican por *posición en el destructuring* (`const [x, setX] = useState()` — el segundo elemento, se llame como se llame). Si una misma función llama a dos setters distintos, eso **prueba** que esos estados son una sola máquina — entre setter y setter, los renders intermedios ven mentiras:

```ts
const cargar = (respuesta, fallo) => {
  setDatos(respuesta);   // ❌ dos setters en una transición: una máquina
  setError(fallo);       //    repartida, aunque `datos` no se llame "loading"
};
```

Este detector caza lo que los nombres no ven (estados con nombres exóticos o en español ya cubiertos: `cargando`, `procesando`, `fallo`, ...). El filtro de precisión: al menos uno de los estados co-actualizados debe ser loading/error-ish — resetear dos campos independientes de un formulario no es una máquina.

Sobre la detección por nombres (formas A y B): es deliberadamente el escalón más bajo de evidencia del paquete — para un tipo *declarado* no hay comportamiento que observar y el nombre es la única señal disponible. El **tipo del campo de error no importa** (`Error`, `string`, código numérico, otro boolean — `isSyncing` + `hasError` es la peor forma): la enfermedad es la coexistencia. Los **callbacks** quedan excluidos (`onError?: (e) => void`, miembros de tipo función): un handler no es estado. `loadingPatterns`/`errorPatterns` ajustan las convenciones. Cierra el círculo con el resto del paquete: la unión etiquetada es a los estados lo que `Result` es a los errores, y `prefer-ts-pattern` te espera con el `match().exhaustive()` al otro lado.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
