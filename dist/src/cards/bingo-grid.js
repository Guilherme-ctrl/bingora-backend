"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COLUMN_RANGES = void 0;
exports.generateRandomGrid = generateRandomGrid;
exports.fingerprintGrid = fingerprintGrid;
exports.shuffleInPlace = shuffleInPlace;
exports.assertValidUs75Grid = assertValidUs75Grid;
const crypto_1 = require("crypto");
const crypto_2 = require("crypto");
exports.COLUMN_RANGES = [
    [1, 15],
    [16, 30],
    [31, 45],
    [46, 60],
    [61, 75],
];
function generateRandomGrid() {
    const rows = Array.from({ length: 5 }, () => Array(5).fill(null));
    for (let col = 0; col < 5; col++) {
        const [lo, hi] = exports.COLUMN_RANGES[col];
        const pool = shuffleInPlace([...rangeInclusive(lo, hi)]);
        if (col === 2) {
            const picks = pool.slice(0, 4);
            rows[0][col] = picks[0];
            rows[1][col] = picks[1];
            rows[2][col] = null;
            rows[3][col] = picks[2];
            rows[4][col] = picks[3];
        }
        else {
            const picks = pool.slice(0, 5);
            for (let r = 0; r < 5; r++) {
                rows[r][col] = picks[r];
            }
        }
    }
    return { rows };
}
function fingerprintGrid(grid) {
    const canonical = JSON.stringify(grid.rows);
    return (0, crypto_1.createHash)('sha256').update(canonical, 'utf8').digest('hex');
}
function rangeInclusive(lo, hi) {
    const out = [];
    for (let n = lo; n <= hi; n++) {
        out.push(n);
    }
    return out;
}
function shuffleInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = (0, crypto_2.randomInt)(0, i + 1);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
function assertValidUs75Grid(grid) {
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
            const v = grid.rows[r][c];
            if (typeof v !== 'number' || !Number.isInteger(v)) {
                throw new Error('Non-center cells must be integers');
            }
            const [lo, hi] = exports.COLUMN_RANGES[c];
            if (v < lo || v > hi) {
                throw new Error(`Value ${v} out of range for column ${c}`);
            }
        }
    }
}
//# sourceMappingURL=bingo-grid.js.map