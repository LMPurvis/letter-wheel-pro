// Validates the LEVELS and DICT embedded in ../index.html (Letter Wheel Pro).
const fs = require("fs"), path = require("path");
const { checkLevel, spellable } = require("./check");
const { BLOCK } = require("./blocklist");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const m = html.match(/\/\*LEVELS_START\*\/([\s\S]*?)\/\*LEVELS_END\*\//);
const d = html.match(/\/\*DICT_START\*\/"([A-Z ]*)"\/\*DICT_END\*\//);
if (!m || !d) { console.error("LEVELS or DICT block not found"); process.exit(1); }
const LEVELS = JSON.parse(m[1]), DICT = new Set(d[1].split(" "));
const errs = [];
if (LEVELS.length < 30) errs.push("only " + LEVELS.length + " levels");
if (DICT.size < 20000) errs.push("dictionary too small: " + DICT.size);
for (const w of DICT) { if (!/^[A-Z]{3,8}$/.test(w)) errs.push("bad dict entry " + w); if (BLOCK.has(w.toLowerCase())) errs.push("blocked word in dict " + w); }
const allWords = new Set();
LEVELS.forEach((lv, i) => {
  errs.push(...checkLevel(lv, i));
  const tag = "Level " + (i + 1);
  const n = lv.placements.length;
  if (n < 6 || n > 10) errs.push(tag + ": has " + n + " grid words (want 6-10)");
  if (!lv.placements.some(p => p.word.length === lv.letters.length)) errs.push(tag + ": no word uses all wheel letters");
  lv.placements.forEach(p => { if (!DICT.has(p.word)) errs.push(tag + ": target " + p.word + " not in dictionary"); if (BLOCK.has(p.word.toLowerCase())) errs.push(tag + ": blocked word " + p.word); allWords.add(p.word); });
  if (lv.cols > 10 || lv.rows > 11) errs.push(tag + ": grid too big " + lv.rows + "x" + lv.cols);
  // bonus availability: count dictionary words spellable from the wheel that are not targets
  let b = 0; for (const w of DICT) if (w.length <= lv.letters.length && spellable(w, lv.letters) && !lv.placements.some(p => p.word === w)) b++;
  lv.bonusAvailable = b;
  if (b < 5) errs.push(tag + ": only " + b + " possible bonus words");
});
for (let i = 1; i < LEVELS.length; i++) if (LEVELS[i].letters.length < LEVELS[i - 1].letters.length) errs.push("Level " + (i + 1) + ": wheel size decreases");
if (/https?:\/\/(?!www\.w3\.org)/.test(html.replace(/xmlns='http:\/\/www\.w3\.org\/2000\/svg'/g, ""))) errs.push("external URL found in index.html");
if (errs.length) { console.error("VALIDATION FAILED:\n" + errs.join("\n")); process.exit(1); }
const tw = LEVELS.reduce((a, l) => a + l.placements.length, 0);
console.log(LEVELS.map((l, i) => `L${i + 1} ${l.letters} ${l.rows}x${l.cols} grid=${l.placements.length} bonusPossible=${l.bonusAvailable}`).join("\n"));
console.log("OK: " + LEVELS.length + " levels, " + tw + " grid words (" + allWords.size + " distinct), dictionary " + DICT.size + " words; all targets spellable & in dictionary, crossings consistent, no stray runs, grids connected, 6-8 letter wheels, 6-10 words/level.");
