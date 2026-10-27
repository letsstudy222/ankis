"use strict";
const assert = require("node:assert/strict");
require("../guardian-model.js");
require("../guardian-nursery.js");
require("../guardian-art.js");
const M = GuardianModel,
  N = GuardianNursery,
  ids = ["aurora", "leviathan", "sphinx", "moonrabbit", "stargazer"];
for (const [i, id] of ids.entries()) {
  const s = M.create();
  N.ensure(s);
  s.coins = 99999;
  assert(!N.buyEgg(s, id).ok);
  assert.equal(s.coins, 99999);
  const fox = JSON.stringify(s.nursery.pets.fox);
  for (const p of M.pets.filter((p) => p.rarity === "rainbow" && p.id !== id))
    N.receive(s, p.id);
  let r = 0;
  const draw = N.summon(s, () => [0.999, 0][r++]);
  assert.equal(draw.species, id);
  assert.equal(draw.rarity, "rainbow");
  assert.equal(N.rates(s).rainbow, 0.5);
  assert.equal(JSON.stringify(s.nursery.pets.fox), fox);
  N.pauseIncubation(s);
  assert(N.incubate(s, id).ok);
  assert.equal(s.nursery.incubator.target, 240);
  for (let k = 0; k < 240; k++)
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
      ).includes(`/rainbow/${id}-${form}.png`),
    );
  }
  const xp = s.nursery.pets[id].xp;
  assert.equal(N.receive(s, id).xp, 1600);
  assert.equal(s.nursery.pets[id].xp, xp + 1600);
  assert(!s.nursery.eggs.includes(id));
  assert(M.valid(JSON.parse(JSON.stringify(s)), ["recall"]));
}
assert.equal(M.pets.length, 50);
assert.equal(GuardianArt.progress().forms, 110);
console.log(
  "PASS: five new Rainbow families, disclosed gacha pool and unchanged rate, gacha-only eggs, 240-word hatch, three forms at levels 8/16, 1600 duplicate XP, save compatibility.",
);

// Owners of the original five retain pity and get a missing new species at hard pity.
const old = M.create();
N.ensure(old);
for (const id of ["astra", "iris", "nova", "orion", "halo"]) N.receive(old, id);
old.pet = "astra";
old.nursery.pets.astra.hatched = true;
old.nursery.pets.astra.xp = M.threshold(16);
old.coins = 5432;
old.nursery.ticketMisses = 14;
old.nursery.pity = 49;
old.nursery.pulls = 49;
old.nursery.tickets = 10;
const restored = JSON.parse(JSON.stringify(old));
N.ensure(restored);
assert.equal(restored.nursery.pity, 49);
const result = N.summon(restored, () => 0);
assert(result.guaranteed);
assert(ids.includes(result.species));
assert(!result.duplicate);
assert.equal(restored.nursery.pity, 0);
for (const id of ["astra", "iris", "nova", "orion", "halo"])
  assert.equal(restored.nursery.pets[id].copies, 1);
console.log(
  "PASS: original five Rainbow species and persisted pity survive restore; guaranteed next draw yields a missing new species.",
);

assert.equal(restored.pet, "astra");
assert.equal(restored.nursery.pets.astra.xp, M.threshold(16));
assert.equal(restored.coins, 5432);
assert.equal(restored.nursery.ticketMisses, 14);
