"use strict";
const assert = require("node:assert/strict");
require("../guardian-model.js");
require("../guardian-nursery.js");
require("../guardian-art.js");
const M = GuardianModel,
  N = GuardianNursery,
  ids = ["tiger", "genbu", "swan", "elephant", "dragonhorse"];
for (const [i, id] of ids.entries()) {
  const s = M.create();
  N.ensure(s);
  s.coins = 99999;
  assert(!N.buyEgg(s, id).ok);
  assert.equal(s.coins, 99999);
  const fox = JSON.stringify(s.nursery.pets.fox);
  let r = 0;
  const draw = N.summon(s, () => [0.98, (5 + i + 0.1) / 10][r++]);
  assert.equal(draw.species, id);
  assert.equal(draw.rarity, "legend");
  assert.equal(N.rates(s).legend, 2.5);
  assert.equal(JSON.stringify(s.nursery.pets.fox), fox);
  N.pauseIncubation(s);
  assert(N.incubate(s, id).ok);
  assert.equal(s.nursery.incubator.target, 160);
  for (let k = 0; k < 160; k++)
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
    [15, 2],
    [16, 3],
    [35, 3],
  ]) {
    s.nursery.pets[id].xp = M.threshold(level);
    assert.equal(M.stage(s, id).index, form);
    assert(
      GuardianArt.draw(
        M.pets.find((p) => p.id === id),
        form,
      ).includes(`/legend/${id}-${form}.png`),
    );
  }
  const xp = s.nursery.pets[id].xp;
  assert.equal(N.receive(s, id).xp, 600);
  assert.equal(s.nursery.pets[id].xp, xp + 600);
  assert(!s.nursery.eggs.includes(id));
  assert(M.valid(JSON.parse(JSON.stringify(s)), ["recall"]));
}
assert.equal(M.pets.length, 45);
assert.equal(GuardianArt.progress().forms, 95);
console.log(
  "PASS: five new Legend families, disclosed gacha pool and unchanged rate, gacha-only eggs, 160-word hatch, three forms at levels 8/16, 600 duplicate XP, save compatibility.",
);
