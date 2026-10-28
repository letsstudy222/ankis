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
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  function validMemory(m) {
    return m === undefined || (m && typeof m === "object" &&
      Number.isInteger(m.samples) && m.samples >= 1 && m.samples <= 1e9 &&
      Number.isFinite(m.difficulty) && m.difficulty >= 0 && m.difficulty <= 1 &&
      Number.isFinite(m.meanMs) && m.meanMs >= 0 && m.meanMs <= 3600000);
  }
  // Normalize by phrase length, not equipment or selected countdown speed.
  function observe(record, word, elapsed, errors = 0, failed = false) {
    const ms = clamp(elapsed, 0, 3600000);
    const expected = 1600 + word.length * 180;
    const difficulty = failed ? 1 : clamp((ms / expected - 1) / 3 + Math.min(.65, errors * .22), 0, 1);
    const old = record.arcade;
    record.arcade = {
      samples: Math.min(1e9, (old?.samples || 0) + 1),
      difficulty: old ? old.difficulty * .65 + difficulty * .35 : difficulty,
      meanMs: old ? old.meanMs * .65 + ms * .35 : ms,
    };
    return difficulty;
  }
  // Every familiar word remains eligible; difficult words receive spaced extras.

  function queue(ids, words, records, now = Date.now(), random = Math.random) {
    const buckets = [[], [], []];
    for (const id of ids) {
      const r = records[words[id].word];
      buckets[r.due <= now ? 0 : r.stage === 0 ? 1 : 2].push(id);
    }
    const result = buckets.flatMap((bucket) => shuffle(bucket, random).sort(
      (a, b) => (records[words[b].word].arcade?.difficulty || 0) -
                (records[words[a].word].arcade?.difficulty || 0),
    ));
    if (ids.length < 4) return result;
    for (const id of ids) {
      const difficulty = records[words[id].word].arcade?.difficulty || 0;
      const extra = difficulty >= .7 ? 2 : difficulty >= .35 ? 1 : 0;
      for (let copy = 0; copy < extra; copy++) {
        // Keep at least three distinct other words on both sides of a repeat.
        const rightReady = [];
        const after = new Set();
        let hasNext = false;
        for (let at = result.length; at >= 0; at--) {
          if (at < result.length) {
            if (result[at] === id) { after.clear(); hasNext = true; }
            else after.add(result[at]);
          }
          rightReady[at] = !hasNext || after.size >= 3;
        }
        const before = new Set();
        for (let at = 1; at <= result.length; at++) {
          if (result[at - 1] === id) before.clear();
          else before.add(result[at - 1]);
          if (before.size >= 3 && rightReady[at]) {
            result.splice(at, 0, id);
            break;
          }
        }
      }
    }
    return result;
  }
  function duration(speed, word, record, streak, bonus = 0) {
    const base = { slow: 45000, normal: 35000, fast: 25000 }[speed] || 35000;
    const familiarity = record?.stage > 0 ? 0.96 : 1;
    const pace = Math.max(0.92, 1 - Math.floor(streak / 5) * 0.02);
    return Math.round(
      base * familiarity * pace +
        Math.min(6000, Math.max(0, word.length - 12) * 500) +
        bonus * 1000,
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
  globalThis.VocabularyPractice = { queue, duration, retry, observe, validMemory };
})();
