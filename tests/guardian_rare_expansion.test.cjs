"use strict";
const assert = require("node:assert/strict");
require("../guardian-model.js");
require("../guardian-nursery.js");
require("../guardian-art.js");
const M = GuardianModel,
  N = GuardianNursery,
  ids = ["koi", "bat", "chameleon", "seal", "peacock"];
for (const [i, id] of ids.entries()) {
  const s = M.create();
  N.ensure(s);
  const fox = JSON.stringify(s.nursery.pets.fox),
    price = 3000 + i * 400;
  s.coins = price - 1;
  assert(!N.buyEgg(s, id).ok);
  s.coins = price;
  assert(N.buyEgg(s, id).ok);
  assert.equal(s.coins, 0);
  assert.equal(JSON.stringify(s.nursery.pets.fox), fox);
  N.pauseIncubation(s);
  assert(N.incubate(s, id).ok);
  assert.equal(s.nursery.incubator.target, 60);
  for (let k = 0; k < 60; k++)
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
  for (const [level, form] of [
    [1, 1],
    [7, 1],
    [8, 2],
    [35, 2],
  ]) {
    s.nursery.pets[id].xp = M.threshold(level);
    assert.equal(M.stage(s, id).index, form);
    assert(
      GuardianArt.draw(
        M.pets.find((p) => p.id === id),
        form,
      ).includes(`/rare/${id}-${form}.png`),
    );
  }
  const xp = s.nursery.pets[id].xp;
  assert.equal(N.receive(s, id).xp, 100);
  assert.equal(s.nursery.pets[id].xp, xp + 100);
  assert(!s.nursery.eggs.includes(id));
  assert(M.valid(JSON.parse(JSON.stringify(s)), ["recall"]));
  const g = M.create();
  N.ensure(g);
  let r = 0;
  const draw = N.summon(
    g,
    () =>
      [
        0.6,
        (M.pets
          .filter((p) => p.rarity === "rare")
          .findIndex((p) => p.id === id) +
          0.1) /
          M.pets.filter((p) => p.rarity === "rare").length,
      ][r++],
  );
  assert.equal(draw.species, id);
  assert.equal(draw.rarity, "rare");
  assert.equal(N.rates(g).rare, 30);
}
assert.equal(M.pets.length, 60);
assert.equal(GuardianArt.progress().forms, 125);
console.log(
  "PASS: five new Rare families, exact coin prices, 60-word hatch, two forms at level 8, 100 duplicate XP, reachable gacha pool with unchanged tier rate, save compatibility.",
);
