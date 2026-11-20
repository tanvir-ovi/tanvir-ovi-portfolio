/* The hero's 3D brain is the first thing a visitor sees, so its mesh loads
 * first. Heavier media further down the page (the scroll-scrubbed clip) wait
 * for it instead of splitting a slow connection's bandwidth with it. */

let heroLoaded = false;
const waiting = new Set<() => void>();

/** Called once the hero brain's mesh has arrived (or failed to). */
export function markHeroAssetsLoaded() {
  if (heroLoaded) return;
  heroLoaded = true;
  waiting.forEach((fn) => fn());
  waiting.clear();
}

/** Runs `fn` once the hero assets are in; returns a cancel function. */
export function afterHeroAssets(fn: () => void): () => void {
  if (heroLoaded) {
    fn();
    return () => {};
  }
  waiting.add(fn);
  return () => {
    waiting.delete(fn);
  };
}
