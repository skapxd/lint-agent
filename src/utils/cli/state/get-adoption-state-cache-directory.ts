import os from "node:os";
import path from "node:path";

export function getAdoptionStateCacheDirectory() {
  const xdgCacheHome = process.env.XDG_CACHE_HOME;
  const cacheHome =
    xdgCacheHome && xdgCacheHome.length > 0
      ? xdgCacheHome
      : path.join(os.homedir(), ".cache");

  return path.join(cacheHome, "skapxd-lint");
}
