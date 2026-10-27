"use strict";
const assert = require("node:assert/strict");
require("../guardian-model.js");
require("../guardian-nursery.js");
require("../guardian-equipment.js");
const M = GuardianModel,
  N = GuardianNursery,
  E = GuardianEquipment;
const s = M.create();
N.ensure(s);
assert(M.valid(s, ["recall"]));
s.coins = 200000;
assert.deepEqual(
  M.catalog.filter((i) => i.slot === "sky").map((i) => i.timeBonus),
  [5, 10, 15, 20],
);
const oldFox = JSON.stringify(s.nursery.pets.fox);
for (const id of [
  "ship-phoenix",
  "target-comet",
  "sky-solar",
  "trail-sapphire",
])
  assert(M.buy(s, id).ok);
assert.equal(s.coins, 22000);
assert.deepEqual(E.effects(s), {
  hintEvery: 5,
  timeBonus: 20,
  ticketBonus: 0.03,
  coinBonus: 3,
});
assert.equal(JSON.stringify(s.nursery.pets.fox), oldFox);
assert.equal(M.ticketChance(s), 0.08);
s.nursery.ticketMisses = 19;
assert.equal(M.ticketChance(s), 1);
s.nursery.ticketMisses = 0;
const earn = (clean = true, date = "2026-10-27") =>
  M.reward(s, {
    word: "recall",
    clean,
    due: false,
    score: 10,
    combo: 1,
    date,
    random: () => 0.99,
  });
const before = s.coins;
for (let i = 0; i < 5; i++) earn();
assert.equal(s.coins - before, 7);
assert.equal(E.ensure(s).hintCharge, 1);
assert.equal(s.gear.hintProgress, 0);
for (let i = 0; i < 25; i++) earn();
assert.equal(s.gear.hintCharge, 1);
assert.equal(s.gear.hintProgress, 0);
assert(E.useHint(s));
assert(!E.useHint(s));
earn(false);
assert.equal(s.gear.hintProgress, 0);
for (let i = 0; i < 4; i++) earn();
assert.equal(s.gear.hintCharge, 0);
earn();
assert.equal(s.gear.hintCharge, 1);
const dayCoins = s.coins;
earn(true, "2026-10-28");
assert.equal(s.coins - dayCoins, 6);
const copy = JSON.parse(JSON.stringify(s));
assert(M.valid(copy, ["recall"]));
assert.equal(copy.gear.hintCharge, 1);
copy.gear.hintCharge = 2;
assert(!M.valid(copy, ["recall"]));
delete copy.gear;
assert(M.valid(copy, ["recall"]));
assert.equal(E.ensure(copy).hintCharge, 0);
for (const slot of ["ship", "sky", "target", "trail"]) {
  const list = M.catalog.filter((i) => i.slot === slot);
  assert.equal(list.length, 4);
  for (let i = 1; i < list.length; i++)
    assert(list[i].price > list[i - 1].price);
}
const legacy = M.create();
N.ensure(legacy);
legacy.owned.push("ship-phoenix");
const funds = legacy.coins;
assert(M.buy(legacy, "ship-phoenix").ok);
assert.equal(legacy.coins, funds);
assert.equal(E.effects(legacy).hintEvery, 5);
console.log(
  "PASS: escalating four-slot prices, coin-only ownership retained, ticket bonus and 100% cap, one-charge hint cooldown/no banking, no recharge from assisted words, daily unique coin bonus, backup validation/migration.",
);
