// Shared validation logic (used by validate.js).
function counts(s) { const m = {}; for (const ch of s) m[ch] = (m[ch] || 0) + 1; return m; }
function spellable(word, letters) { const L = counts(letters), W = counts(word); return Object.keys(W).every(k => (L[k] || 0) >= W[k]); }

function checkLevel(lv, idx) {
  const errs = [], tag = `Level ${idx + 1} (${lv.letters})`;
  if (lv.letters.length < 6 || lv.letters.length > 8) errs.push(`${tag}: wheel has ${lv.letters.length} letters`);
  if (!/^[A-Z]+$/.test(lv.letters)) errs.push(`${tag}: bad letters`);
  const words = lv.placements.map(p => p.word);
  if (new Set(words).size !== words.length) errs.push(`${tag}: duplicate target words`);
  for (const w of words) {
    if (w.length < 3) errs.push(`${tag}: target ${w} too short`);
    if (!spellable(w, lv.letters)) errs.push(`${tag}: target ${w} NOT spellable from ${lv.letters}`);
  }
  // Build grid from placements and check crossings
  const grid = Array.from({ length: lv.rows }, () => Array(lv.cols).fill(null));
  for (const p of lv.placements) {
    for (let i = 0; i < p.word.length; i++) {
      const r = p.row + (p.dir === "v" ? i : 0), c = p.col + (p.dir === "h" ? i : 0);
      if (r < 0 || c < 0 || r >= lv.rows || c >= lv.cols) { errs.push(`${tag}: ${p.word} out of bounds`); continue; }
      if (grid[r][c] && grid[r][c] !== p.word[i]) errs.push(`${tag}: conflict at ${r},${c} (${grid[r][c]} vs ${p.word[i]} from ${p.word})`);
      grid[r][c] = p.word[i];
    }
  }
  // Every run of 2+ letters (across or down) must be exactly a placed word
  const placedKeys = new Set(lv.placements.map(p => `${p.dir}:${p.row}:${p.col}:${p.word}`));
  const runs = [];
  for (let r = 0; r < lv.rows; r++) for (let c = 0; c < lv.cols; c++) {
    if (!grid[r][c]) continue;
    if ((c === 0 || !grid[r][c - 1]) && c + 1 < lv.cols && grid[r][c + 1]) { let s = ""; for (let k = c; k < lv.cols && grid[r][k]; k++) s += grid[r][k]; runs.push(`h:${r}:${c}:${s}`); }
    if ((r === 0 || !grid[r - 1][c]) && r + 1 < lv.rows && grid[r + 1][c]) { let s = ""; for (let k = r; k < lv.rows && grid[k][c]; k++) s += grid[k][c]; runs.push(`v:${r}:${c}:${s}`); }
  }
  for (const run of runs) if (!placedKeys.has(run)) errs.push(`${tag}: unintended/mismatched word run ${run}`);
  if (runs.length !== placedKeys.size) errs.push(`${tag}: ${placedKeys.size} placements but ${runs.length} runs`);
  // Connectivity
  const cells = []; for (let r = 0; r < lv.rows; r++) for (let c = 0; c < lv.cols; c++) if (grid[r][c]) cells.push([r, c]);
  const seen = new Set([cells[0].join()]), st = [cells[0]];
  while (st.length) { const [r, c] = st.pop(); for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) { const rr = r + dr, cc = c + dc; if (grid[rr] && grid[rr][cc] && !seen.has(rr + "," + cc)) { seen.add(rr + "," + cc); st.push([rr, cc]); } } }
  if (seen.size !== cells.length) errs.push(`${tag}: grid not connected`);
  // no empty row/col edges
  return errs;
}
module.exports = { checkLevel, spellable };
