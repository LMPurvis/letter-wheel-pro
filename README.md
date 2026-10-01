# Letter Wheel Pro

An adult-difficulty, Wordscapes-style word game in one self-contained `index.html` (no network requests). Play: https://lmpurvis.github.io/letter-wheel-pro/

- 34 levels, 6–8 letter wheels, 7–10 crossword words per level
- Any real English word (3–8 letters, ~40k-word SCOWL-based dictionary, offensive words filtered) counts as a bonus; 5 bonus words earn a hint
- Progress saved in localStorage (`letterWheelPro.save.v1`)

Tools: `tools/genlevels.js` (seed words → levels), `tools/build.js` (layout + embed), `tools/validate.js` (checks every level).
