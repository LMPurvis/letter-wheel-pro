// Builds ../index.html: lays out levels and embeds levels + bonus dictionary into template.html.
const fs = require("fs"), path = require("path");
const levels = require("./levels");
const { layout } = require("./layout");
const { BLOCK } = require("./blocklist");
// Bonus dictionary: SCOWL (size <=60, en/US) words of 3-8 lowercase letters, minus blocklist.
const WL = "/workspace/wl", dict = new Set();
[10, 20, 35, 40, 50, 55, 60].forEach(l => fs.readFileSync(`${WL}/lvl${l}.txt`, "utf8").split("\n").forEach(w => { if (/^[a-z]{3,8}$/.test(w) && !BLOCK.has(w)) dict.add(w); }));
levels.forEach(lv => lv.words.forEach(w => dict.add(w.toLowerCase())));
const dictStr = [...dict].sort().join(" ").toUpperCase();
fs.writeFileSync(path.join(__dirname, "dict.txt"), dictStr);
const out = levels.map((lv, i) => {
  let L = null;
  for (let t = 0; t < 40; t++) {
    let c = layout(lv.words, 1000 + i * 7 + t * 101);
    if (!c) continue;
    if (c.cols > c.rows) c = { rows: c.cols, cols: c.rows, placements: c.placements.map(p => ({ word: p.word, row: p.col, col: p.row, dir: p.dir === "h" ? "v" : "h" })) };
    if (c.rows <= 11 && c.cols <= 10 && (!L || Math.max(c.rows, c.cols) < Math.max(L.rows, L.cols))) L = c;
  }
  if (!L) throw new Error(`Could not lay out level ${i + 1}`);
  return { letters: lv.letters, rows: L.rows, cols: L.cols, placements: L.placements };
});
let html = fs.readFileSync(path.join(__dirname, "template.html"), "utf8");
html = html.replace(/\/\*LEVELS_START\*\/[\s\S]*?\/\*LEVELS_END\*\//, () => `/*LEVELS_START*/${JSON.stringify(out)}/*LEVELS_END*/`);
html = html.replace(/\/\*DICT_START\*\/[\s\S]*?\/\*DICT_END\*\//, () => `/*DICT_START*/"${dictStr}"/*DICT_END*/`);
fs.writeFileSync(path.join(__dirname, "..", "index.html"), html);
out.forEach((l, i) => console.log(`L${i + 1} ${l.letters.padEnd(8)} ${l.rows}x${l.cols} words=${l.placements.length}`));
console.log("dictionary words:", dict.size, "index.html bytes:", Buffer.byteLength(html));
