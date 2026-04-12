export declare const COLUMN_RANGES: readonly [number, number][];
export type BingoGridPayload = {
    rows: (number | null)[][];
};
export declare function generateRandomGrid(): BingoGridPayload;
export declare function fingerprintGrid(grid: BingoGridPayload): string;
export declare function shuffleInPlace<T>(arr: T[]): T[];
export declare function assertValidUs75Grid(grid: BingoGridPayload): void;
