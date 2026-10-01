// Deterministic crossword layout generator for a list of words.
function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

function tryLayout(words, rand) {
  const grid = new Map(); // "r,c" -> {ch, h:bool, v:bool}
  const key = (r, c) => r + "," + c;
  const get = (r, c) => grid.get(key(r, c));
  const placed = [];
  function canPlace(w, r, c, dir) {
    const dr = dir === "v" ? 1 : 0, dc = dir === "h" ? 1 : 0;
    if (get(r - dr, c - dc) || get(r + dr * w.length, c + dc * w.length)) return -1;
    let crosses = 0;
    for (let i = 0; i < w.length; i++) {
      const rr = r + dr * i, cc = c + dc * i, cell = get(rr, cc);
      if (cell) {
        if (cell.ch !== w[i] || cell[dir]) return -1;
        crosses++;
      } else {
        // perpendicular neighbours must be empty
        if (get(rr + dc, cc + dr) || get(rr - dc, cc - dr)) return -1;
      }
    }
    return crosses;
  }
  function place(w, r, c, dir) {
    const dr = dir === "v" ? 1 : 0, dc = dir === "h" ? 1 : 0;
    for (let i = 0; i < w.length; i++) {
      const k = key(r + dr * i, c + dc * i);
      const cell = grid.get(k) || { ch: w[i], h: false, v: false };
      cell[dir] = true; grid.set(k, cell);
    }
    placed.push({ word: w, row: r, col: c, dir });
  }
  const order = words.slice();
  place(order[0], 0, 0, rand() < 0.5 ? "h" : "h");
  let remaining = order.slice(1);
  let guard = 0;
  while (remaining.length && guard++ < 50) {
    let progress = false;
    for (const w of remaining.slice()) {
      const opts = [];
      for (const [k, cell] of grid) {
        const [r0, c0] = k.split(",").map(Number);
        for (let i = 0; i < w.length; i++) {
          if (w[i] !== cell.ch) continue;
          for (const dir of ["h", "v"]) {
            if (cell[dir]) continue;
            const r = dir === "v" ? r0 - i : r0, c = dir === "h" ? c0 - i : c0;
            const x = canPlace(w, r, c, dir);
            if (x > 0) opts.push({ r, c, dir, x });
          }
        }
      }
      if (!opts.length) continue;
      // score: bounding box area + aspect preference, random tiebreak
      let best = null, bestScore = Infinity;
      for (const o of opts) {
        let minR = o.r, maxR = o.r + (o.dir === "v" ? w.length - 1 : 0), minC = o.c, maxC = o.c + (o.dir === "h" ? w.length - 1 : 0);
        for (const p of placed) {
          minR = Math.min(minR, p.row); minC = Math.min(minC, p.col);
          maxR = Math.max(maxR, p.row + (p.dir === "v" ? p.word.length - 1 : 0));
          maxC = Math.max(maxC, p.col + (p.dir === "h" ? p.word.length - 1 : 0));
        }
        const rows = maxR - minR + 1, cols = maxC - minC + 1;
        const score = Math.max(rows, cols) * 3 + rows * cols * 0.2 - o.x * 2 + (rows > cols + 2 ? 4 : 0) + rand() * 1.5;
        if (score < bestScore) { bestScore = score; best = o; }
      }
      place(w, best.r, best.c, best.dir);
      remaining = remaining.filter(x => x !== w);
      progress = true;
    }
    if (!progress) break;
  }
  if (remaining.length) return null;
  let minR = Infinity, minC = Infinity, maxR = -Infinity, maxC = -Infinity;
  for (const k of grid.keys()) { const [r, c] = k.split(",").map(Number); minR = Math.min(minR, r); minC = Math.min(minC, c); maxR = Math.max(maxR, r); maxC = Math.max(maxC, c); }
  return {
    rows: maxR - minR + 1, cols: maxC - minC + 1,
    placements: placed.map(p => ({ word: p.word, row: p.row - minR, col: p.col - minC, dir: p.dir }))
  };
}

function layout(words, seed = 1) {
  const rand = rng(seed);
  const sorted = words.slice().sort((a, b) => b.length - a.length);
  let best = null, bestScore = Infinity;
  for (let t = 0; t < 400; t++) {
    const order = [sorted[0], ...sorted.slice(1).sort(() => rand() - 0.5)];
    const res = tryLayout(order, rand);
    if (!res) continue;
    const score = Math.max(res.rows, res.cols) * 10 + res.rows * res.cols + (res.cols > 9 ? 100 : 0) + (res.rows > 9 ? 100 : 0);
    if (score < bestScore) { bestScore = score; best = res; }
  }
  return best;
}
module.exports = { layout };
