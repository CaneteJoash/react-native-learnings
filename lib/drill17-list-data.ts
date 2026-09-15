// 10,000-row dataset for the FlatList tuning drill. noteLines varies 1-4 so the
// "before" row is genuinely variable-height — the "after" row fixes the height
// instead of measuring it, which is the actual point of the exercise.
export type FieldRow = {
  id: string;
  title: string;
  noteLines: 1 | 2 | 3 | 4;
  readingC: number;
};

const LOREM_LINE =
  'Sensor drift within tolerance, no action needed this cycle, recheck after next calibration pass.';

function noteForLines(lines: number): string {
  return Array.from({ length: lines }, () => LOREM_LINE).join(' ');
}

export const FIELD_ROWS: FieldRow[] = Array.from({ length: 10_000 }, (_, index) => {
  const lines = ((index % 4) + 1) as FieldRow['noteLines'];
  return {
    id: String(index),
    title: `Sensor ${index}`,
    noteLines: lines,
    readingC: Math.round((15 + Math.sin(index / 37) * 8) * 10) / 10,
  };
});

export function noteTextFor(row: FieldRow): string {
  return noteForLines(row.noteLines);
}

export const FIXED_ROW_HEIGHT = 64;
