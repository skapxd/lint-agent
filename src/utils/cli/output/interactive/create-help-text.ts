export function createHelpText() {
  return `skapxd-lint - ejecuta las reglas skapxd sin configurar el proyecto medido

Usage:
  skapxd-lint <path>
  skapxd-lint <path> --preset <name>
  skapxd-lint --changed [--base <git-ref>]
  skapxd-lint help
  skapxd-lint --help

Argumentos:
  <path>                  Directorio o archivo a evaluar. Unidad: ruta de filesystem. Default: ninguno en evaluacion efimera.

Flags:
  --preset <name>         Preset a usar. Unidad: uno de astro, base, nest, next, package. Default: autodetectado por senales del proyecto.
  --changed               Lintea solo archivos JS/TS cambiados por git. Unidad: archivos ACMR + untracked. Default: false.
  --base <git-ref>        Ref base para --changed. Unidad: revision git (ej. origin/main). Default: HEAD + untracked.
  --format <json|compact|toon> Formato de salida de maquina. Unidad: json, compact o toon. Default: compact sin TTY; texto legible con TTY.
  --include-tests         Incluye tests en evaluacion efimera. Unidad: booleano. Default: false.
  --no-interactive        Fuerza modo no-interactivo aunque haya TTY. Unidad: booleano. Default: false.
  --yes                   Alias de --no-interactive para scripts/agentes. Unidad: booleano. Default: false.
  --help                  Muestra esta ayuda. Unidad: booleano. Default: false.

Deteccion de preset:
  nest-cli.json -> nest
  next.config.* -> next
  astro.config.* -> astro
  package.json con exports -> package
  default -> base

Salida:
  TTY interactivo: texto legible.
  Sin TTY, --no-interactive o --yes: compact determinista por default.
  --format compact: lectura humana; resumen y hallazgos agrupados por archivo, sin codigos ANSI.
  --format json: salida estructurada para parsear con JSON.parse.
  --format toon: salida estructurada para parsear con TOON; compacta y con mensajes deduplicados por id.

Ignorados en evaluacion efimera:
  Siempre: node_modules, dist, build, coverage, configs, fixtures y mocks.
  Tests: ignorados por default; usa --include-tests para evaluarlos.
  Archivos fuera del tsconfig/project service: omitidos y contados aparte.

Exit codes:
  0  Sin hallazgos.
  1  Hallazgos de lint.
  2  Error de uso o de ejecucion.

Ejemplos:
  Humano:  skapxd-lint .
  Humano:  skapxd-lint --changed --base origin/main
  Humano:  skapxd-lint . --include-tests
  Agente:  skapxd-lint . --preset package --yes
  Agente:  skapxd-lint . --preset package --yes --format toon
  Agente:  skapxd-lint . --preset package --yes --format json
  Agente:  skapxd-lint --changed --base origin/main --yes

Para agentes:
  Prefiere --format toon (mas eficiente en tokens).
  Usa --format json si toon es insuficiente o confuso para tu caso.
  No dependas del default (compact): no es parseable; pasa siempre --format toon o json.

Fase 1:
  Este bin implementa evaluacion efimera, --changed, dual-mode y help.
  --adopt, --verify, seed, estado persistido y skill pertenecen a fases posteriores.`;
}
