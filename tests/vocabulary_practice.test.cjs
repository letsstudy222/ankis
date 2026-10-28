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
assert.equal(P.duration("normal", "recall", { stage: 0 }, 0, 5), 40000);
for (const [bonus, expected] of [
  [5, 40000],
  [10, 45000],
  [15, 50000],
  [20, 55000],
])
  assert.equal(
    P.duration("normal", "recall", { stage: 0 }, 0, bonus),
    expected,
  );
assert.equal(P.duration("slow", "recall", { stage: 0 }, 0, 5), 50000);
assert.equal(P.duration("fast", "recall", { stage: 0 }, 0, 5), 30000);
const familiar = P.duration("normal", "recall", { stage: 1 }, 0, 0);
assert(P.duration("normal", "recall", { stage: 0 }, 0, 0) > familiar);
assert.equal(
  P.duration("normal", "recall", { stage: 1 }, 0, 7),
  familiar + 7000,
);
assert(
  P.duration("normal", "recall", { stage: 1 }, 100, 0) >=
    Math.round(35000 * 0.96 * 0.92),
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
// Corrected mistakes affect practice frequency without changing reward eligibility.
const fast = {}, slow = {}, typo = {};
P.observe(fast, 'recall', 1200, 0, false);
P.observe(slow, 'recall', 15000, 0, false);
P.observe(typo, 'recall', 1200, 3, false);
assert(fast.arcade.difficulty < typo.arcade.difficulty);
assert(slow.arcade.difficulty > .7);
assert(P.validMemory(slow.arcade));
assert(!P.validMemory({...slow.arcade, difficulty: NaN}));
assert(!P.validMemory({...slow.arcade, samples: -1}));
const adaptiveRecords = Object.fromEntries(words.map(w=>[w.word,{stage:1,due:2000,arcade:{...fast.arcade}}]));
adaptiveRecords.word0.arcade = {...slow.arcade};
let adaptive = P.queue(words.map((_,i)=>i), words, adaptiveRecords,1000,()=>.5);
assert.equal(adaptive.filter(i=>i===0).length,3);
assert.equal(adaptive.filter(i=>i===1).length,1);
assert.equal(new Set(adaptive).size,8);
for (let i=0;i<adaptive.length;i++) {
 const next=adaptive.indexOf(adaptive[i],i+1);
 if(next!==-1)assert(new Set(adaptive.slice(i+1,next)).size>=3);
}
for(let i=0;i<8;i++)P.observe(adaptiveRecords.word0,'recall',1000,0,false);
assert(adaptiveRecords.word0.arcade.difficulty < .1);
adaptive=P.queue(words.map((_,i)=>i),words,adaptiveRecords,1000,()=>.5);
assert.equal(adaptive.filter(i=>i===0).length,1,'mastered words lose their extra repeats');
P.observe(typo,'recall',1000,0,true);
assert(typo.arcade.difficulty > .65);
assert.equal(P.queue([0,1,2],words,adaptiveRecords,1000,()=>.5).length,3);
console.log('PASS: length-normalized speed, corrected-error difficulty, spaced weighted repetitions, no starvation, mastery decay, small pools and memory validation.');
