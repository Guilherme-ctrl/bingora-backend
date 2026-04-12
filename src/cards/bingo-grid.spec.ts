import {
  COLUMN_RANGES,
  assertValidUs75Grid,
  fingerprintGrid,
  generateRandomGrid,
} from "./bingo-grid";

describe("bingo-grid", () => {
  it("generates a valid US 75-ball grid with free center", () => {
    const grid = generateRandomGrid();
    assertValidUs75Grid(grid);
  });

  it("uses correct column ranges across many samples", () => {
    for (let i = 0; i < 50; i++) {
      const grid = generateRandomGrid();
      for (let c = 0; c < 5; c++) {
        const [lo, hi] = COLUMN_RANGES[c];
        for (let r = 0; r < 5; r++) {
          if (r === 2 && c === 2) {
            continue;
          }
          const v = grid.rows[r][c] as number;
          expect(v).toBeGreaterThanOrEqual(lo);
          expect(v).toBeLessThanOrEqual(hi);
        }
      }
    }
  });

  it("produces stable fingerprints for identical grids", () => {
    const grid = generateRandomGrid();
    const a = fingerprintGrid(grid);
    const b = fingerprintGrid({ rows: grid.rows.map((row) => [...row]) });
    expect(a).toBe(b);
  });

  it("produces different fingerprints for different grids (very likely)", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 30; i++) {
      seen.add(fingerprintGrid(generateRandomGrid()));
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  /** Mirrors card batch generation: every fingerprint in a batch must be unique (event-scoped in DB). */
  it("keeps fingerprints unique across a large batch (same as generation loop)", () => {
    const seen = new Set<string>();
    const n = 250;
    for (let i = 0; i < n; i++) {
      const fp = fingerprintGrid(generateRandomGrid());
      expect(seen.has(fp)).toBe(false);
      seen.add(fp);
    }
    expect(seen.size).toBe(n);
  });
});
