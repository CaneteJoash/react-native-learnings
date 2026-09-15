// Deliberately blocks the JS thread synchronously. The docs' own worked
// example is an expensive root-level setState taking 200ms ~= 12 dropped
// frames at 60fps. Blocking in the tap handler (not during React's render
// phase) keeps the effect isolated to a single interaction instead of
// poisoning every future render.
export function blockJsThreadFor(ms: number): void {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    // busy-wait — this IS the point
  }
}
