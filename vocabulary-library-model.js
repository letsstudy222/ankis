"use strict";
(() => {
  const integer = (n) => Number.isSafeInteger(n) && n >= 0;
  const create = () => ({
    version: 1,
    size: 12,
    direction: "vi",
    words: {},
    history: [],
  });
  function valid(s, vocabulary) {
    const keys = new Set(vocabulary.map((w) => w.word));
    return (
      !!s &&
      s.version === 1 &&
      [12, 24].includes(s.size) &&
      ["vi", "en"].includes(s.direction) &&
      s.words &&
      typeof s.words === "object" &&
      !Array.isArray(s.words) &&
      Object.entries(s.words).every(
        ([key, w]) =>
          keys.has(key) &&
          w &&
          [0, 1, 2, 3].includes(w.rating) &&
          integer(w.reviews) &&
          integer(w.tests) &&
          integer(w.correct) &&
          w.correct <= w.tests &&
          (w.lastResult === undefined ||
            ["correct", "helped"].includes(w.lastResult)) &&
          integer(w.lastTest),
      ) &&
      Array.isArray(s.history) &&
      s.history.length <= 20 &&
      s.history.every(
        (h) =>
          h &&
          integer(h.at) &&
          Array.isArray(h.words) &&
          h.words.length > 0 &&
          h.words.length <= keys.size &&
          new Set(h.words).size === h.words.length &&
          h.words.every((w) => keys.has(w)) &&
          Array.isArray(h.answers) &&
          h.answers.every(
            (a) =>
              a && typeof a.word === "string" && typeof a.correct === "boolean",
          ) &&
          h.answers.length <= h.words.length &&
          new Set(h.answers.map((a) => a.word)).size === h.answers.length &&
          h.answers.every(
            (a) => h.words.includes(a.word) && typeof a.correct === "boolean",
          ),
      )
    );
  }
  function decks(vocabulary, size = 12) {
    if (![12, 24].includes(size)) size = 12;
    const result = [];
    for (let i = 0; i < vocabulary.length; i += size)
      result.push({
        index: result.length,
        start: i,
        words: vocabulary.slice(i, i + size),
      });
    return result;
  }
  const entry = (s, word) =>
    (s.words[word] ||= {
      rating: 0,
      reviews: 0,
      tests: 0,
      correct: 0,
      lastTest: 0,
    });
  function rate(s, word, rating) {
    const w = entry(s, word);
    w.rating = rating;
    w.reviews++;
  }
  function answer(s, word, correct, at = Date.now()) {
    const w = entry(s, word);
    w.tests++;
    if (correct) w.correct++;
    w.lastResult = correct ? "correct" : "helped";
    w.lastTest = at;
  }
  function finish(s, words, answers, at = Date.now()) {
    if (!answers.length) return;
    s.history.unshift({
      at,
      words: words.map((w) => w.word),
      answers: answers.map((a) => ({ ...a })),
    });
    s.history = s.history.slice(0, 20);
  }
  const latest = (s, words) =>
    s.history.find(
      (h) =>
        h.words.length === words.length &&
        h.words.every((w, i) => w === words[i].word),
    );
  const weak = (s, word) =>
    [1, 2].includes(s.words[word]?.rating) ||
    s.words[word]?.lastResult === "helped";
  const introduced = (r) =>
    !!r && (r.learned === true || (r.learned === undefined && r.stage > 0));
  const fold = (text) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
  function filter(
    words,
    s,
    records,
    query = "",
    status = "all",
    now = Date.now(),
  ) {
    const q = fold(query.trim());
    return words.filter(
      (w) =>
        (!q || fold(w.word + " " + w.meaning + " " + w.context).includes(q)) &&
        (status === "all" ||
          (status === "weak" && weak(s, w.word)) ||
          (status === "new" && !introduced(records[w.word])) ||
          (status === "due" &&
            introduced(records[w.word]) &&
            records[w.word].due <= now)),
    );
  }
  globalThis.VocabularyLibraryModel = {
    create,
    valid,
    decks,
    rate,
    answer,
    finish,
    latest,
    weak,
    introduced,
    filter,
  };
})();
