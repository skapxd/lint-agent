# Evidencia de Socket y GuardDog

## Qué puede consultar un visitante

El [análisis público de Socket](https://socket.dev/npm/package/@skapxd/lint-agent) corresponde al paquete npm publicado. El badge del README fija una versión concreta y enlaza su página de análisis. No describe el árbol Git completo ni demuestra que la GitHub App esté instalada.

En [CI/CD con GuardDog](https://github.com/skapxd/lint-agent/actions/workflows/ci.yml), abre una ejecución y su **Summary → GuardDog: fuentes y paquete npm**. El resumen identifica commit analizado, head del PR (si aplica), fecha UTC, versión del escáner, alcances, SHA-256, resultado y hallazgos. En un PR se analiza el commit de merge de prueba que GitHub entrega a `pull_request`, no solo el head; ambos quedan identificados. **Artifacts → security-reports** incluye `report.md`, `report.json`, JSON nativos, stderr y entorno Python; GitHub puede exigir inicio de sesión para descargarlos. La retención es de 90 días. `release-candidate` conserva el tarball y su manifiesto durante el mismo plazo.

El badge CI/CD incluye GuardDog y las demás comprobaciones del workflow: su verde es el resultado agregado, su rojo requiere consultar el job concreto. Si un prerrequisito falla y GuardDog queda omitido, no existe un análisis aprobado para esa ejecución. El registro de implementación y su primera evidencia están en [#218](https://github.com/skapxd/lint-agent/issues/218).

## Socket en pull requests

Uso la [GitHub App oficial](https://docs.socket.dev/docs/socket-for-github), configurada mediante [`socket.yml`](../socket.yml), sin duplicarla con una Action/CLI ni añadir secretos al workflow. La App utiliza manifiestos y lockfiles para evaluar las dependencias; no escanea el código fuente propio del repositorio ([alcance y permisos oficiales](https://docs.socket.dev/docs/permissions)). `package.json`, `pnpm-lock.yaml` y `pnpm-workspace.yaml` permanecen disponibles para la integración. No se ignoran autores, rutas ni alertas.

**Estado al preparar esta integración, 2026-09-11: activación pendiente de verificación.** La página pública del paquete existe y el generador oficial produjo una imagen para `@skapxd/lint-agent/1.5.0`, cargada en el navegador. No aparecieron checks de Socket en la consulta de `main`; el listado de instalaciones con la credencial disponible devolvió HTTP 403. Eso no demuestra que la App esté desinstalada.

El paso externo exacto para el dueño es abrir [Socket Security en GitHub](https://github.com/apps/socket-security), instalarla o configurar la instalación de `skapxd`, seleccionar **Only select repositories → lint-agent** y completar la autorización de sus permisos. Si ya está instalada, confirmar que este repositorio esté seleccionado. En Socket, comprobar que las alertas de PR y los check runs no estén desactivados; la [configuración v2](https://docs.socket.dev/docs/socket-yml) del repo solicita ambos. Después, abrir/actualizar un PR que cambie el lockfile y verificar un check de la App con su enlace de análisis, no solamente un workflow de GitHub Actions. Registrar esa URL en #218 antes de cambiar el estado a activo. Esta opción no requiere `SOCKET_SECURITY_API_KEY` ni otro secret de Actions.

## GuardDog: alcance y bloqueo

Fijo **GuardDog 3.2.0**, Python 3.12.11 y sus dependencias exactas en `.github/guarddog-requirements.txt`. Las Actions están fijadas por SHA. Se conserva el sandbox obligatorio de GuardDog; no se pasa `--no-sandbox`. Si la plataforma no lo soporta, el análisis falla.

| Alcance | Entrada | Qué se analiza |
| --- | --- | --- |
| Fuentes propias | Copia temporal de `src/`, `scripts/`, `package.json`, `tsup.config.ts`, `tsconfig.json`, `tsconfig.build.json`, `eslint.config.ts`, `vitest.config.ts` | Código propio del paquete, scripts de build/validación y configuración; excluye dependencias instaladas, Git, documentación y fixtures externos de tests |
| Distribuible | `.tgz` completo de `npm@11.18.0 pack --ignore-scripts` | Contenido real que se publicaría: JavaScript compilado, CLI, tipos, mapas, README y package.json; las reglas aplicables dependen de sus filtros internos |

La copia de fuentes lleva un prefijo `package/` porque los filtros de GuardDog como `*/package.json` no reconocen un manifiesto sin directorio padre. Un probe de CI comprueba esa detección con un manifiesto ficticio; no ejecuta su script.

Ambos usan `guarddog npm scan <ruta-local> --output-format json`, no `npm verify` ni `npm audit`. Para rutas locales sin `--metadata`, GuardDog ejecuta las reglas de código; no descarga metadatos del registro ni resuelve/instala dependencias. Se conservan todas sus reglas de origen y sus filtros por extensión/ruta. Por ejemplo, las reglas de scripts de instalación seleccionan `package.json`, mientras otras omiten documentación y declaraciones de tipos. GuardDog limita algunas coincidencias por regla; los conteos no son un inventario de cada línea analizada. La implementación upstream de referencia está en [scan local](https://github.com/DataDog/guarddog/blob/v3.2.0/guarddog/scanners/scanner.py) y [analizador YARA](https://github.com/DataDog/guarddog/blob/v3.2.0/guarddog/analyzer/analyzer.py).

El [CLI 3.2.0](https://github.com/DataDog/guarddog/blob/v3.2.0/guarddog/cli.py) no falla por hallazgos de forma predeterminada. `--exit-non-zero-on-finding` convierte cualquier `issues > 0` en código 1, incluidas capacidades normales; los errores de ejecución también pueden usar 1. Además, el [reporte JSON](https://github.com/DataDog/guarddog/blob/v3.2.0/guarddog/reporters/json.py) puede contener `errors` aunque el proceso termine con 0. `scan` admite JSON; el SARIF de upstream corresponde a `verify`, cuyo alcance es diferente.

Por eso el wrapper interpreta el JSON completo y aplica este contrato sin `continue-on-error` ni `|| true`:

| Estado propio | Condición | Salida del wrapper | Publicación |
| --- | --- | --- | --- |
| `clean` | Proceso 0, reporte válido, sin hallazgos, amenazas, riesgos ni errores | 0 | Permitida si los demás jobs pasan |
| `observations` | Solo hallazgos `capability-*`; score cero y lista de riesgos vacía | 0 | Permitida; las observaciones quedan visibles |
| `detections` | Cualquier hallazgo que no sea una capacidad, cualquier riesgo o score mayor que cero | 1 | Bloqueada |
| `error` | Proceso no cero, timeout, JSON vacío/inválido/incompatible, errores internos o versión inesperada | 2 | Bloqueada |

La distinción entre capacidades y amenazas sigue el [modelo de GuardDog 3.2.0](https://github.com/DataDog/guarddog/blob/v3.2.0/README.md#how-guarddog-works). No se declara “sin hallazgos” cuando existen capacidades. No hay excepciones de reglas o archivos. Si se incorpora una excepción futura, debe identificar regla, ubicación y motivo en un issue revisable; no se debe apagar una regla global para silenciar un caso.

### Revisión inicial de observaciones

| Coincidencia | Revisión | Tratamiento |
| --- | --- | --- |
| `fs.readFileSync` y `fs.unlinkSync` | Lectura del estado/configuración y limpieza de archivos temporales de la CLI | Capacidad legítima, conservada |
| `child_process.execFileSync` en `dist/cli.js` | Invocación de Git para localizar la raíz del proyecto | Capacidad legítima, conservada |
| `resolve(` en `scripts/measure-rule-timing.mjs` y bundle | Coincidencia imprecisa de red: corresponde a resolución de rutas | Observación conservada; ninguna exclusión |
| `.exec(range.trim())` en `scripts/lib/run-peer-contract.mjs` | Coincidencia imprecisa de procesos: ejecuta una expresión regular sobre un rango de versión | Observación conservada; ninguna exclusión |

## Publicación del mismo artefacto

El job de build Node 22 empaqueta una vez después de las comprobaciones. GuardDog descarga ese artefacto de la misma ejecución, verifica commit y SHA-256 y analiza fuentes y tarball. `publish` depende de GuardDog y de los checks existentes, descarga ese mismo artefacto y el reporte aprobado, comprueba identidad, hash y tag, genera provenance y publica el archivo con `--ignore-scripts`. No reinstala dependencias, recompila ni vuelve a empaquetar en el runner con OIDC.

Los PRs usan `pull_request`, permiso `contents: read` y ningún secret; no existe `pull_request_target`. La publicación conserva sus permisos de OIDC/atestación solo en el job condicionado a tags. Un PR de fork puede producir evidencia en su runner sin recibir credenciales de publicación.

### Mantener el badge alineado

`package.json` sigue siendo la fuente de versión. El hook `version` sincroniza el badge con `node scripts/sync-socket-badge.mjs` y stagea README cuando el dueño usa `npm version`/`pnpm version`. Si modifica la versión a mano, ejecuta `pnpm security:badge` y commitea README junto con package.json antes de crear el tag. CI comprueba la sincronización y `pack-release.mjs` vuelve a comprobarla, además de exigir `v<package.version>` en tags. Así una publicación con badge antiguo falla antes de npm. La nueva URL puede no tener resultado hasta que Socket indexe esa publicación; no se simula un análisis durante esa espera. Esta tarea no crea tags ni publica una versión.

## Reproducción

Con Node 22.14.0 y un entorno Python 3.12 aislado:

```bash
export PATH="$HOME/.nvm/versions/node/v22.14.0/bin:$PATH"
python3.12 -m venv /tmp/lint-agent-guarddog
/tmp/lint-agent-guarddog/bin/python -m pip install --no-deps -r .github/guarddog-requirements.txt
/tmp/lint-agent-guarddog/bin/python -m pip check
pnpm install --frozen-lockfile
pnpm build && pnpm typecheck && pnpm test && pnpm lint
GUARDDOG_BIN=/tmp/lint-agent-guarddog/bin/guarddog pnpm test:security
node scripts/security/pack-release.mjs
GUARDDOG_BIN=/tmp/lint-agent-guarddog/bin/guarddog node scripts/security/run-guarddog.mjs
```

Los resultados locales quedan en `security-reports/` y el distribuible en `release-artifact/`, ambos ignorados por Git. Para renovar el escáner, cambiar deliberadamente la versión fijada, regenerar dependencias mediante `printf 'guarddog==<version>\n' | uv pip compile - --python-version 3.12 --output-file .github/guarddog-requirements.txt`, revisar su nuevo contrato y repetir probes de detección/error y análisis real antes de entregar el PR.

GuardDog, Socket, CodeQL y el auditor de vulnerabilidades cubren señales diferentes. Ninguno demuestra que un paquete sea completamente seguro.
