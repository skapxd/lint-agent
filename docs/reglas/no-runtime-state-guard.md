### `skapxd/no-runtime-state-guard`

El compañero de `prefer-tagged-union-state` para el comportamiento: cuando un
método protege su estado con una comprobación en runtime, la máquina de
estados vive en `if` + `throw` — requiere tests para cada ruta inválida y el
compilador no puede ayudar (*make invalid states unrepresentable*):

```ts
// ❌ el guard en runtime: probable con tests, invisible para el compilador
class Socket {
  private isConnected = false;
  emit(event: string) {
    if (!this.isConnected) throw new Error("Cannot emit: not connected");
  }
}

// ✅ cada estado es un tipo: emit NO EXISTE en el socket desconectado
class DisconnectedSocket {
  connect(): ConnectedSocket { ... }       // la transición retorna el estado nuevo
}
class ConnectedSocket {
  emit(event: string): void { ... }        // sin guard: el compilador lo garantiza
  disconnect(): DisconnectedSocket { ... }
}
```

(La variante funcional: la unión discriminada de `prefer-tagged-union-state`,
consumida con `match()`.) Solo aplica al **estado propio** (`this.<prop>`) en
métodos de clase — validar argumentos o inputs externos es otro territorio
(DTOs, `Result`). Un `if` sobre `this` que retorna temprano sin lanzar
tampoco se toca. Nota la sinergia con `class-properties-require-readonly`:
el flag mutable que este guard necesita ya era ilegal — las dos reglas
empujan juntas hacia las transiciones que retornan instancias nuevas.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
