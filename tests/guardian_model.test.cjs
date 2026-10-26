"use strict";
const assert = require("node:assert/strict");
require("../guardian-model.js");
const M = globalThis.GuardianModel;
const words = Array.from({ length: 104 }, (_, i) => "word-" + i);
const earn = (s, word, date = "2026-10-26", extra = {}) =>
  M.reward(s, {
    word,
    clean: true,
    due: false,
    score: 12,
    combo: 1,
    date,
    ...extra,
  });
let s = M.create();
assert(M.valid(s, words));
assert.equal(M.level(0), 1);
for (let level = 1; level <= 50; level++) {
  assert.equal(M.level(M.threshold(level)), level);
  if (level > 1) assert.equal(M.level(M.threshold(level) - 1), level - 1);
}
assert.deepEqual(
  [
    earn(s, words[0]).xp,
    earn(s, words[0]).xp,
    earn(s, words[0]).xp,
    earn(s, words[0]).xp,
  ],
  [8, 3, 1, 0],
);
assert.equal(s.coins, 4);
assert.equal(M.distinct(s), 1);
assert.equal(s.activeDays.length, 0);
s = M.create();
let failed = earn(s, words[0], undefined, { clean: false });
assert.equal(failed.xp, 1);
assert.equal(s.cleanClears, 0);
assert.equal(s.coins, 0);
assert.equal(earn(s, words[0], undefined, { clean: false }).xp, 0);
assert.equal(earn(s, words[0], undefined, { due: true }).xp, 12);
assert.equal(s.coins, 5);
assert.equal(earn(s, words[0], undefined, { due: true }).xp, 3);
assert.equal(s.coins, 6);
s = M.create();
for (let i = 0; i < 5; i++) earn(s, words[i], undefined, { due: i < 3 });
assert.equal(s.activeDays.length, 1);
assert.equal(s.coins, 46); // 15 base + 6 due + 10 five + 15 due mission
assert.deepEqual(s.day.missions.sort(), ["due", "five"]);
let coins = s.coins;
earn(s, words[4]);
assert.equal(s.coins, coins + 1);
assert.equal(s.activeDays.length, 1);
assert.equal(M.stage(s).index, 0);
for (let i = 0; i < 15; i++) earn(s, words[i], "2026-10-28");
assert.equal(s.activeDays.length, 2);
assert.equal(M.stage(s).index, 1);
assert.equal(M.distinct(s), 15);
assert.equal(s.day.missions.filter((x) => x === "fifteen").length, 1);
let before = structuredClone(s);
assert(!M.buy(s, "ship-phoenix").ok);
assert.deepEqual(s, before);
assert(!M.equip(s, "ship-phoenix").ok);
assert(!M.petAvailable(s, "dragon"));
s.coins = 1000;
assert(M.buy(s, "ship-kite").ok);
assert.equal(s.coins, 820);
assert.equal(s.equipment.ship, "ship-kite");
assert(M.buy(s, "ship-kite").ok);
assert.equal(s.coins, 820);
assert(M.equip(s, "ship-scout").ok);
assert(M.valid(s, words));
s = M.create();
for (let day = 0; day < 60; day++) {
  const date = new Date(Date.UTC(2026, 0, 1 + day)).toISOString().slice(0, 10);
  for (let i = 0; i < 40; i++)
    earn(s, words[(i + day * 7) % 104], date, { score: 1000, combo: 20 });
}
assert.equal(s.activeDays.length, 60);
assert.equal(M.distinct(s), 104);
assert.equal(s.cleanClears, 2400);
assert.equal(s.sectors.length, 6);
assert.equal(M.stage(s).index, 4);
assert(M.petAvailable(s, "dragon"));
assert(M.valid(s, words));
assert(M.badges(s).every((x) => x.value >= x.target));
coins = s.coins;
M.today(s, "2026-06-01");
assert.equal(s.coins, coins);
assert.equal(s.activeDays.length, 60);
assert.equal(s.day.missions.length, 0);
assert.equal(Object.keys(s.day.words).length, 0);
const backup = JSON.parse(JSON.stringify(s));
assert(M.valid(backup, words));
backup.equipment.ship = "not-real";
assert(!M.valid(backup, words));
backup.equipment.ship = "ship-phoenix";
assert(!M.valid(backup, words));
const negative = structuredClone(s);
negative.coins = -1;
assert(!M.valid(negative, words));
const evil = structuredClone(s);
evil.petName = "<img src=x onerror=alert(1)>";
assert(!M.valid(evil, words));
console.log(
  "PASS: 50 level thresholds, reward diminishing returns, due bonuses, no duplicate missions, days/hatching/evolution, 60-day expedition simulation, shop balances/ownership, rest days, and backup validation.",
);
