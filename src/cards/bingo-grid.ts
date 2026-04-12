import { createHash } from 'crypto';
import { randomInt } from 'crypto';

/** B, I, N, G, O column inclusive ranges (US 75-ball). */
export const COLUMN_RANGES: readonly [number, number][] = [
  [1, 15],
  [16, 30],
  [31, 45],
  [46, 60],
  [61, 75],
];

export type BingoGridPayload = {
  rows: (number | null)[][];
};

/**
 * Builds a random valid 5×5 US bingo grid: one free cell at [2][2], column ranges enforced.
 */
export function generateRandomGrid(): BingoGridPayload {
  const rows: (number | null)[][] = Array.from({ length: 5 }, () =>
    Array<number | null>(5).fill(null),
  );

  for (let col = 0; col < 5; col++) {
    const [lo, hi] = COLUMN_RANGES[col];
    const pool = shuffleInPlace([...rangeInclusive(lo, hi)]);

    if (col === 2) {
      const picks = pool.slice(0, 4);
      rows[0][col] = picks[0]!;
      rows[1][col] = picks[1]!;
      rows[2][col] = null;
      rows[3][col] = picks[2]!;
      rows[4][col] = picks[3]!;
    } else {
      const picks = pool.slice(0, 5);
      for (let r = 0; r < 5; r++) {
        rows[r][col] = picks[r]!;
      }
    }
  }

  return { rows };
}

export function fingerprintGrid(grid: BingoGridPayload): string {
  const canonical = JSON.stringify(grid.rows);
  return createHash('sha256').update(canonical, 'utf8').digest('hex');
}

function rangeInclusive(lo: number, hi: number): number[] {
  const out: number[] = [];
  for (let n = lo; n <= hi; n++) {
    out.push(n);
  }
  return out;
}

/** Fisher–Yates shuffle using crypto.randomInt. */
export function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Validates column ranges and single null at center (for tests). */
export function assertValidUs75Grid(grid: BingoGridPayload): void {
  if (grid.rows.length !== 5) {
    throw new Error('Grid must have 5 rows');
  }
  for (const row of grid.rows) {
    if (row.length !== 5) {
      throw new Error('Each row must have 5 cells');
    }
  }
  if (grid.rows[2][2] !== null) {
    throw new Error('Center cell must be null');
  }
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (r === 2 && c === 2) {
        continue;
      }
      const v = grid.rows[r][c]!;
      if (typeof v !== 'number' || !Number.isInteger(v)) {
        throw new Error('Non-center cells must be integers');
      }
      const [lo, hi] = COLUMN_RANGES[c];
      if (v < lo || v > hi) {
        throw new Error(`Value ${v} out of range for column ${c}`);
      }
    }
  }
}
