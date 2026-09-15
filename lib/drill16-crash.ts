// Deliberate crash for the release-build symbolication drill — see
// docs/drill-16-symbolication.md. Two frames deep on purpose: a real crash's
// stack rarely originates in the function wired to the button that triggered it.

function readMapLayer(index: number): never {
  throw new Error(`Drill 16: map layer ${index} is missing its bounds`);
}

function initializeMap() {
  readMapLayer(3);
}

export function crashNow() {
  initializeMap();
}
