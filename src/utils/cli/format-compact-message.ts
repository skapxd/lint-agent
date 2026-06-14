const compactMessageLimit = 140;

export function formatCompactMessage(message: string) {
  const singleLineMessage = message.replace(/\s+/g, " ").trim();
  const exceedsCompactLimit = singleLineMessage.length > compactMessageLimit;

  if (exceedsCompactLimit) {
    return `${singleLineMessage.slice(0, compactMessageLimit - 1)}...`;
  }

  return singleLineMessage;
}
