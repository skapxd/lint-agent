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
  --format <json|toon>    Formato de salida de maquina. Unidad: json o toon. Default: json sin TTY; texto legible con TTY.
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
  Sin TTY, --no-interactive o --yes: JSON determinista.
  --format toon: TOON compacto para agentes, con mensajes deduplicados y rutas relativas cuando aplica.

Exit codes:
  0  Sin hallazgos.
  1  Hallazgos de lint.
  2  Error de uso o de ejecucion.

Ejemplos:
  Humano:  skapxd-lint .
  Humano:  skapxd-lint --changed --base origin/main
  Agente:  skapxd-lint . --preset package --yes
  Agente:  skapxd-lint . --preset package --yes --format toon
  Agente:  skapxd-lint --changed --base origin/main --yes

Fase 1:
  Este bin implementa evaluacion efimera, --changed, dual-mode y help.
  --adopt, --verify, seed, estado persistido y skill pertenecen a fases posteriores.`;
}
