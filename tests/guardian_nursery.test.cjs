"use strict";
const assert = require("node:assert/strict");
require("../guardian-model.js");
require("../guardian-nursery.js");
const M = GuardianModel,
  N = GuardianNursery,
  words = Array.from({ length: 104 }, (_, i) => "word-" + i);
const state = () => {
  const s = M.create();
  N.ensure(s);
  return s;
};
const earn = (s, i, extra = {}) =>
  M.reward(s, {
    word: words[i % 104],
    clean: true,
    due: false,
    combo: i + 1,
    score: i * 12,
    date: "2026-10-26",
    random: () => 0.99,
    ...extra,
  });
assert.equal(M.pets.length, 45);
for (const rarity of Object.keys(N.tiers))
  assert.equal(
    M.pets.filter((p) => p.rarity === rarity).length,
    ["normal", "rare", "epic", "legend"].includes(rarity) ? 10 : 5,
  );
let s = state();
assert(M.valid(s, words));
assert.equal(s.nursery.tickets, 10);
assert.equal(s.nursery.incubator.species, "fox");
assert.equal(M.stage(s).index, 0);
// Enough coins is the only purchase gate, including the most expensive cosmetic.
s.coins = 2800;
assert(M.buy(s, "ship-phoenix").ok);
assert.equal(s.coins, 0);
assert.equal(s.activeDays.length, 0);
assert.equal(M.level(s.xp), 1);
assert(M.buy(s, "ship-phoenix").ok);
assert.equal(s.coins, 0);
s.coins = 400;
assert(N.buyEgg(s, "sprout").ok);
assert.equal(s.coins, 0);
assert(s.nursery.eggs.includes("sprout"));
assert(!N.buyEgg(s, "dragon").ok);
assert(!N.buyEgg(s, "fox").ok);
for (let i = 0; i < 10; i++) earn(s, i);
assert.equal(s.nursery.incubator.progress, 10);
N.pauseIncubation(s);
assert.equal(s.nursery.pets.fox.incubation, 10);
assert(N.incubate(s, "sprout").ok);
assert(!N.incubate(s, "fox").ok);
N.pauseIncubation(s);
N.incubate(s, "fox");
assert.equal(s.nursery.incubator.progress, 10);
for (let i = 10; i < 30; i++) earn(s, i);
assert(s.nursery.pets.fox.hatched);
assert.equal(s.nursery.incubator, null);
assert(!s.nursery.eggs.includes("fox"));
assert.equal(s.activeDays.length, 1);
assert(M.stage(s).index >= 1);
assert(M.valid(s, words));
const before = structuredClone(s.nursery.pets.sprout);
let duplicate = N.receive(s, "sprout");
assert(duplicate.duplicate);
assert.equal(s.nursery.pets.sprout.xp, before.xp + 40);
assert.equal(s.nursery.eggs.filter((id) => id === "sprout").length, 1);
assert(!s.nursery.pets.sprout.hatched);
// Per-species duplicate XP, even after hatching, never grants global XP or other species XP.
const rootXP = s.xp,
  foxXP = s.nursery.pets.fox.xp;
N.receive(s, "dragon");
N.receive(s, "dragon");
assert.equal(s.nursery.pets.dragon.xp, 600);
assert.equal(s.xp, rootXP);
assert.equal(s.nursery.pets.fox.xp, foxXP);
assert.deepEqual(
  [0, 9, 10, 20, 30, 40, 100].map(M.comboMultiplier),
  [1, 1, 2, 3, 4, 5, 5],
);
assert.deepEqual(
  [0, 10, 20, 30, 40].map(M.ticketChance),
  [0.01, 0.02, 0.06, 0.08, 0.1],
);
s = state();
const tickets = s.nursery.tickets;
earn(s, 0, { combo: 20, random: () => 0.059 });
assert.equal(s.nursery.tickets, tickets + 1);
earn(s, 0, { combo: 20, random: () => 0.06 });
assert.equal(s.nursery.tickets, tickets + 1);
earn(s, 0, { combo: 20, random: () => 0 });
const capped = s.nursery.tickets;
earn(s, 0, { combo: 100, random: () => 0 });
assert.equal(s.nursery.tickets, capped);
earn(s, 1, { clean: false, random: () => 0 });
assert.equal(s.nursery.tickets, capped);
s = state();
for (let i = 0; i < 15; i++) earn(s, i, { due: i < 3 });
assert.equal(s.nursery.tickets, 19);
const dailyTickets = s.nursery.tickets;
earn(s, 16);
assert.equal(s.nursery.tickets, dailyTickets);
// Hard pity at 50, soft pity starts at 41; all five rainbow species get collected.
s = state();
s.nursery.tickets = 2500;
for (let i = 1; i <= 250; i++) {
  const result = N.summon(s, () => 0);
  assert(result.ok);
  if (i % 50 === 0) {
    assert.equal(result.rarity, "rainbow");
    assert(result.guaranteed);
    assert.equal(s.nursery.pity, 0);
  } else assert.equal(s.nursery.pity, i % 50);
  if (i === 40) assert.equal(N.rates(s).rainbow, 1);
  if (i === 49) assert.equal(N.rates(s).rainbow, 100);
}
assert.equal(s.nursery.tickets, 0);
assert.equal(
  M.pets.filter((p) => p.rarity === "rainbow" && s.nursery.pets[p.id]).length,
  5,
);
assert(!N.summon(s, () => 0).ok);
assert.equal(s.nursery.pulls, 250);
assert.equal(s.nursery.history.length, 50);
assert(M.valid(s, words));
// Early rainbow resets pity immediately; rates sum exactly to 100 at every step.
s = state();
s.nursery.pulls = 12;
s.nursery.pity = 12;
let calls = 0;
let rare = N.summon(s, () => (calls++ === 0 ? 0.9999 : 0));
assert.equal(rare.rarity, "rainbow");
assert.equal(s.nursery.pity, 0);
for (let i = 0; i < 50; i++) {
  s.nursery.pity = i;
  assert(
    Math.abs(Object.values(N.rates(s)).reduce((a, b) => a + b, 0) - 100) <
      1e-10,
  );
}
s.nursery.pity = 0;
// Reproducible Monte Carlo: check base distribution separately from pity.
let seed = 479;
const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
};
const frequencies = Object.fromEntries(Object.keys(N.tiers).map((k) => [k, 0]));
for (let i = 0; i < 100000; i++) {
  s.nursery.pity = 0;
  s.nursery.tickets = 10;
  frequencies[N.summon(s, random).rarity]++;
}
for (const [k, tier] of Object.entries(N.tiers))
  assert(Math.abs(frequencies[k] / 1000 - tier.rate) < 0.6);
console.log("Base-rate simulation, 100000 pulls:", frequencies);
// Old save migration preserves currency, selected species, learning XP and unlocked companions.
const old = M.create();
old.coins = 777;
old.xp = 5000;
old.activeDays = Array.from(
  { length: 21 },
  (_, i) => `2026-09-${String(i + 1).padStart(2, "0")}`,
);
for (let i = 0; i < 80; i++) old.vocabulary[words[i]] = 1;
old.pet = "dragon";
assert(M.valid(old, words));
N.ensure(old);
assert.equal(old.coins, 777);
assert.equal(old.pet, "dragon");
assert(old.nursery.pets.dragon.hatched);
assert(old.nursery.pets.axolotl.hatched);
assert.equal(old.nursery.pets.dragon.xp, 5000);
assert(M.valid(JSON.parse(JSON.stringify(old)), words));
const bad = structuredClone(old);
bad.nursery.pity = 50;
assert(!M.valid(bad, words));
const corrupt = structuredClone(old);
corrupt.nursery.pets.fox.incubation = -1;
assert(!M.valid(corrupt, words));
console.log(
  "PASS: coin-only shop, 45 species, incubation pause/resume/hatching, species duplicate XP, combo tickets/caps/missions, hard+soft pity, five-rainbow collection, rate sums, Monte Carlo, migration and backup validation.",
);

const individual = GuardianModel.create();
GuardianNursery.ensure(individual);
GuardianNursery.receive(individual, "dragon");
individual.nursery.pets.dragon.hatched = true;
individual.nursery.eggs = individual.nursery.eggs.filter(
  (id) => id !== "dragon",
);
individual.nursery.pets.dragon.xp = GuardianModel.threshold(16);
assert.equal(GuardianModel.stage(individual, "dragon").index, 3);
assert.equal(GuardianModel.stage(individual).index, 0);

// Ticket drought protection counts every clean word, even repeated/capped words.
let protection = state();
for (let i = 0; i < 14; i++) earn(protection, 0);
assert.equal(protection.nursery.ticketMisses, 14);
assert.equal(protection.nursery.tickets, 10);
protection = JSON.parse(JSON.stringify(protection));
assert(M.valid(protection, words));
earn(protection, 0, { clean: false });
assert.equal(protection.nursery.ticketMisses, 14);
earn(protection, 0, { date: "2026-10-27" });
assert.equal(protection.nursery.tickets, 11);
assert.equal(protection.nursery.ticketMisses, 0);
for (let i = 0; i < 15; i++) earn(protection, 0);
assert.equal(protection.nursery.tickets, 12);
let luckyReset = state();
for (let i = 0; i < 8; i++) earn(luckyReset, 0);
earn(luckyReset, 1, { random: () => 0 });
assert.equal(luckyReset.nursery.ticketMisses, 0);
assert.equal(luckyReset.nursery.tickets, 11);
let oldCounter = state();
delete oldCounter.nursery.ticketMisses;
assert(M.valid(oldCounter, words));
N.ensure(oldCounter);
assert.equal(oldCounter.nursery.ticketMisses, 0);
oldCounter.nursery.ticketMisses = 15;
assert(!M.valid(oldCounter, words));
console.log(
  "PASS: guaranteed ticket every 15 clean words, repeat/day/reload persistence, wrong answers preserve count, early drops reset, old saves migrate and invalid counters reject.",
);

// Approved rarity-specific evolution counts never alter saved XP or ownership.
const formsState = state();
let totalForms = 0;
for (const pet of M.pets) {
  N.receive(formsState, pet.id);
  formsState.nursery.pets[pet.id].hatched = true;
  formsState.nursery.eggs = formsState.nursery.eggs.filter(
    (id) => id !== pet.id,
  );
  const expected = { normal: 1, rare: 2, epic: 2, legend: 3, rainbow: 3 }[
    pet.rarity
  ];
  totalForms += expected;
  assert.equal(M.formCount(pet.id), expected);
  for (const level of [1, 7, 8, 15, 16, 28, 60]) {
    formsState.nursery.pets[pet.id].xp = M.threshold(level);
    const xp = formsState.nursery.pets[pet.id].xp;
    const stage = M.stage(formsState, pet.id);
    assert.equal(
      stage.index,
      Math.min(expected, level >= 16 ? 3 : level >= 8 ? 2 : 1),
    );
    assert.equal(stage.total, expected);
    assert.equal(stage.next === null, stage.index === expected);
    assert.equal(formsState.nursery.pets[pet.id].xp, xp);
  }
}
assert.equal(totalForms, 95);
console.log(
  "PASS: all 45 species follow 1/2/3 forms by rarity, 95 total forms, exact thresholds, final-form cap and existing XP preserved.",
);
