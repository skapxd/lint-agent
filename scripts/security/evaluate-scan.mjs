// GuardDog 3.2.0: las capacidades son observaciones, las amenazas y riesgos bloquean.
// No se usa --exit-non-zero-on-finding: tambien trata capacidades como fallos.
export function evaluateScan(exitCode, report) {
  const object = value => value !== null && typeof value === "object" && !Array.isArray(value);
  if (exitCode !== 0) return { status: "error", reason: `GuardDog termino con codigo ${exitCode}` };
  if (!object(report) || !object(report.results) || !object(report.errors) ||
      !Number.isInteger(report.issues) || report.issues < 0 || !Array.isArray(report.risks) ||
      !object(report.risk_score) || !Number.isFinite(report.risk_score.score) || report.risk_score.score < 0 ||
      Object.keys(report.results).length === 0) {
    return { status: "error", reason: "JSON ausente, incompleto o incompatible con GuardDog 3.2.0" };
  }
  if (Object.keys(report.errors).length) return { status: "error", reason: "GuardDog reporto errores internos; consulta el JSON" };
  const findings = [];
  for (const [rule, matches] of Object.entries(report.results)) {
    if (object(matches) && Object.keys(matches).length === 0) continue;
    if (!Array.isArray(matches) || matches.some(match => !object(match) || typeof match.location !== "string" || typeof match.message !== "string")) {
      return { status: "error", reason: `Formato de hallazgo incompatible: ${rule}` };
    }
    for (const match of matches) findings.push({ rule, ...match });
  }
  const blocking = findings.filter(finding => !finding.rule.startsWith("capability-"));
  if (report.issues > 0 && findings.length === 0) return { status: "error", reason: "issues sin hallazgos interpretables" };
  if (blocking.length || report.risks.length || report.risk_score.score > 0) {
    return { status: "detections", findings, blocking, reason: "Amenazas o riesgos detectados" };
  }
  return { status: findings.length ? "observations" : "clean", findings, blocking, reason: findings.length ? "Solo capacidades; sin amenazas ni riesgos detectados" : "Sin hallazgos detectados" };
}
