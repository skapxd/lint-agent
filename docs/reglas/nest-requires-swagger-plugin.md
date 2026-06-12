### `skapxd/nest-requires-swagger-plugin`

Las reglas de swagger del preset (`nest-no-swagger-in-controllers`,
`nest-dto-requires-api-property`) descansan sobre una premisa: el plugin
`@nestjs/swagger` activo en `nest-cli.json`, que introspecciona DTOs y tipos
de retorno. Esta regla **verifica la premisa en vez de asumirla**: anclada al
entrypoint (`mainFilePatterns`, default `src/main.ts`, un reporte por
proyecto), sube por las carpetas hasta el `nest-cli.json` real y exige:

```jsonc
// nest-cli.json
{
  "compilerOptions": {
    "plugins": ["@nestjs/swagger"]   // ✅ (también acepta { "name": "..." })
  }
}
```

Sin el plugin, el swagger queda vacío — y como el preset prohíbe documentarlo
a mano en los controllers, el error te lo dice en el primer lint, no en el
primer deploy.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
