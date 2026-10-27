"use strict";
const assert = require("node:assert/strict");
require("../guardian-model.js");
require("../guardian-nursery.js");
require("../guardian-art.js");
const M = GuardianModel,
  N = GuardianNursery,
  ids = ["penguin", "hedgehog", "raccoon", "otter", "seahorse"];
for (const [i, id] of ids.entries()) {
  const s = M.create();
  N.ensure(s);
  const original = JSON.stringify(s.nursery.pets.fox);
  const price = 1200 + i * 200;
  s.coins = price - 1;
  assert(!N.buyEgg(s, id).ok);
  assert(!s.nursery.pets[id]);
  s.coins = price;
  assert(N.buyEgg(s, id).ok);
  assert.equal(s.coins, 0);
  assert.equal(JSON.stringify(s.nursery.pets.fox), original);
  N.pauseIncubation(s);
  assert(N.incubate(s, id).ok);
  assert.equal(s.nursery.incubator.target, 30);
  for (let k = 0; k < 30; k++)
    M.reward(s, {
      word: "recall",
      clean: true,
      due: false,
      combo: k,
      score: 10,
      date: "2026-10-27",
      random: () => 0.99,
    });
  assert(s.nursery.pets[id].hatched);
  assert.equal(s.nursery.incubator, null);
  assert.equal(M.stage(s, id).index, 1);
  s.nursery.pets[id].xp = M.threshold(35);
  assert.equal(M.stage(s, id).index, 1);
  const before = s.nursery.pets[id].xp;
  assert.equal(N.receive(s, id).xp, 40);
  assert.equal(s.nursery.pets[id].xp, before + 40);
  assert(!s.nursery.eggs.includes(id));
  assert(M.valid(JSON.parse(JSON.stringify(s)), ["recall"]));
  const g = M.create();
  N.ensure(g);
  let r = 0;
  const draw = N.summon(g, () => [0, (5 + i + 0.1) / 10][r++]);
  assert.equal(draw.species, id);
  assert.equal(draw.rarity, "normal");
  assert.equal(N.rates(g).normal, 55);
}
assert.equal(GuardianArt.progress().species, 30);
assert.equal(GuardianArt.progress().forms, 60);
console.log(
  "PASS: all five new eggs coin-only at exact prices, no charge when short, 30-word hatch, one-form cap, duplicate XP, expanded gacha selection and JSON save compatibility.",
);
