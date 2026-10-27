"use strict";
(() => {
  function shuffle(list, random = Math.random) {
    const result = list.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  // Every familiar word appears once per round; due and fragile memories go first.
  function queue(ids, words, records, now = Date.now(), random = Math.random) {
    const buckets = [[], [], []];
    for (const id of ids) {
      const r = records[words[id].word];
      buckets[r.due <= now ? 0 : r.stage === 0 ? 1 : 2].push(id);
    }
    return buckets.flatMap((bucket) => shuffle(bucket, random));
  }
  function duration(speed, word, record, streak, bonus = 0) {
    const base = { slow: 55000, normal: 38000, fast: 24000 }[speed] || 38000;
    const familiarity = record?.stage > 0 ? 1 : 1.3;
    const pace = Math.max(0.92, 1 - Math.floor(streak / 5) * 0.02);
    return Math.round(
      base * familiarity * pace + word.length * 1100 + bonus * 1000,
    );
  }
  // Retrieve a missed word after three other distinct words, at most twice per flight.
  function retry(queue, cursor, counts) {
    const id = queue[cursor];
    if ((counts[id] || 0) >= 2) return false;
    const following = queue.slice(cursor + 1).filter((other) => other !== id);
    if (new Set(following).size < 3) return false;
    const existing = queue.indexOf(id, cursor + 1);
    if (existing !== -1 && existing <= cursor + 4) return false;
    if (existing !== -1) queue.splice(existing, 1);
    let at = cursor + 1;
    const distinct = new Set();
    while (at < queue.length && distinct.size < 3) distinct.add(queue[at++]);
    queue.splice(at, 0, id);
    counts[id] = (counts[id] || 0) + 1;
    return true;
  }
  globalThis.VocabularyPractice = { queue, duration, retry };
})();
