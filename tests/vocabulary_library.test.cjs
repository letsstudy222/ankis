const assert = require("node:assert/strict");
global.window = {};
require("../vocabulary-data.js");
require("../vocabulary-library-model.js");
const M = VocabularyLibraryModel,
  words = window.VOCABULARY,
  s = M.create();
assert(M.valid(s, words));
for (const size of [12, 24]) {
  const decks = M.decks(words, size);
  assert.deepEqual(
    decks.flatMap((d) => d.words),
    words,
  );
  assert(decks.every((d) => d.words.length <= size));
}
assert.equal(M.decks(words).length, 16);
assert.equal(M.decks(words, 24).length, 8);
M.rate(s, "mitigate", 1);
assert(M.weak(s, "mitigate"));
assert.equal(s.words.mitigate.tests, 0);
M.answer(s, "mitigate", true, 1000);
assert.equal(s.words.mitigate.correct, 1);
assert.equal(s.words.mitigate.rating, 1);
M.answer(s, "mitigate", false, 2000);
assert.equal(s.words.mitigate.tests, 2);
assert.equal(s.words.mitigate.correct, 1);
assert(M.weak(s, "mitigate"));
const d = M.decks(words)[0];
M.finish(s, d.words, [{ word: "mitigate", correct: true }]);
assert.equal(M.latest(s, d.words).answers.length, 1);
assert.equal(M.latest(s, d.words).words.length, 12);
assert.equal(M.latest(s, M.decks(words, 24)[0].words), undefined);
assert(M.filter(words, s, {}, "ma sat").some((w) => w.word === "friction"));
assert.equal(M.filter(words, s, {}, "", "new").length, words.length);
assert.equal(
  M.filter(
    words,
    s,
    { mitigate: { learned: true, stage: 0, due: 0 } },
    "",
    "due",
    100,
  ).length,
  1,
);
assert.deepEqual(
  M.filter(words, s, {}, "", "weak").map((w) => w.word),
  ["mitigate"],
);
for (let i = 0; i < 30; i++)
  M.finish(s, d.words, [{ word: "mitigate", correct: false }], i);
assert.equal(s.history.length, 20);
assert(M.valid(s, words));
assert(M.valid(JSON.parse(JSON.stringify(s)), words));
for (const mutate of [
  (x) => (x.words.mitigate.correct = 999),
  (x) => (x.words.mitigate.rating = 8),
  (x) =>
    (x.words.unknown = {
      rating: 0,
      reviews: 0,
      tests: 0,
      correct: 0,
      lastTest: 0,
    }),
  (x) => (x.history[0].answers = [null]),
  (x) =>
    (x.history[0].answers = [
      { word: "mitigate", correct: true },
      { word: "mitigate", correct: false },
    ]),
  (x) => (x.size = 0),
]) {
  const bad = JSON.parse(JSON.stringify(s));
  mutate(bad);
  assert.equal(M.valid(bad, words), false);
}
console.log(
  "PASS: deck coverage and sizes, separate self-rating/test evidence, partial results and bounded history, accent-insensitive search, review filters and backup validation.",
);
