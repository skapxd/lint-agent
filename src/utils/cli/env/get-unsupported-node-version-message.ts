const MINIMUM_NODE_MAJOR = 20;
const MINIMUM_NODE_MINOR = 12;
const MINIMUM_NODE_PATCH = 0;

export function getUnsupportedNodeVersionMessage(nodeVersion: string) {
  const [majorText = "0", minorText = "0"] = nodeVersion.split(".");
  const nodeMajor = Number.parseInt(majorText, 10);
  const nodeMinor = Number.parseInt(minorText, 10);
  const nodeVersionIsInvalid = Number.isNaN(nodeMajor) || Number.isNaN(nodeMinor);
  const nodeVersionIsTooOld =
    nodeMajor < MINIMUM_NODE_MAJOR ||
    (nodeMajor === MINIMUM_NODE_MAJOR && nodeMinor < MINIMUM_NODE_MINOR);
  const nodeVersionIsSupported = !nodeVersionIsInvalid && !nodeVersionIsTooOld;

  if (nodeVersionIsSupported) {
    return null;
  }

  return `skapxd-lint requiere Node >=${MINIMUM_NODE_MAJOR}.${MINIMUM_NODE_MINOR}.${MINIMUM_NODE_PATCH}; detectado v${nodeVersion}.`;
}
