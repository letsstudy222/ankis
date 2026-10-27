const assert = require("node:assert/strict");
require("../vocabulary-practice.js");
const P = globalThis.VocabularyPractice;
const words = Array.from({ length: 8 }, (_, i) => ({ word: `word${i}` }));
const records = Object.fromEntries(
  words.map((w, i) => [
    w.word,
    { stage: i < 4 ? 0 : 3, due: i % 2 === 0 ? 0 : 2000 },
  ]),
);
const q = P.queue(
  words.map((_, i) => i),
  words,
  records,
  1000,
  () => 0.5,
);
assert.equal(new Set(q).size, 8);
assert(q.slice(0, 4).every((i) => records[words[i].word].due === 0));
assert(q.slice(4, 6).every((i) => records[words[i].word].stage === 0));
const familiar = P.duration("normal", "recall", { stage: 1 }, 0, 0);
assert(P.duration("normal", "recall", { stage: 0 }, 0, 0) > familiar);
assert.equal(
  P.duration("normal", "recall", { stage: 1 }, 0, 7),
  familiar + 7000,
);
assert(
  P.duration("normal", "recall", { stage: 1 }, 100, 0) >= 38000 * 0.92 + 6600,
);
const retry = [0, 1, 2, 3, 4, 5, 6, 7],
  counts = {};
assert(P.retry(retry, 0, counts));
assert.equal(retry[4], 0);
assert.deepEqual(retry.slice(1, 4), [1, 2, 3]);
assert(P.retry(retry, 4, counts));
assert.equal(counts[0], 2);
assert(!P.retry(retry, 8, counts));
const tiny = [0, 1, 2];
assert(!P.retry(tiny, 0, {}));
assert.deepEqual(tiny, [0, 1, 2]);
const already = [0, 1, 2, 3, 0, 4, 5];
assert(!P.retry(already, 0, {}));
assert.equal(already.filter((i) => i === 0).length, 2);
console.log(
  "PASS: unique due-first rounds, fragile-memory timing, capped pace, gear time bonus, three-distinct-word spacing, bounded retries and small pools.",
);
