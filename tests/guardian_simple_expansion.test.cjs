"use strict";
const assert = require("node:assert/strict");
require("../guardian-model.js");
require("../guardian-nursery.js");
require("../guardian-art.js");
const M = GuardianModel,
  N = GuardianNursery,
  normal = ["shiba", "duck", "hamster", "frog", "sparrow"],
  rare = ["squirrel", "ferret", "crab", "puffin", "gecko"];
for (const [rarity, ids] of [
  ["normal", normal],
  ["rare", rare],
])
  for (const [i, id] of ids.entries()) {
    const s = M.create();
    N.ensure(s);
    const fox = JSON.stringify(s.nursery.pets.fox),
      price = rarity === "normal" ? 700 + i * 100 : 2000 + i * 200,
      words = rarity === "normal" ? 30 : 60,
      xp = rarity === "normal" ? 40 : 100;
    s.coins = price - 1;
    assert(!N.buyEgg(s, id).ok);
    s.coins = price;
    assert(N.buyEgg(s, id).ok);
    assert.equal(s.coins, 0);
    assert.equal(JSON.stringify(s.nursery.pets.fox), fox);
    N.pauseIncubation(s);
    assert(N.incubate(s, id).ok);
    assert.equal(s.nursery.incubator.target, words);
    for (let k = 0; k < words; k++)
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
    for (const level of [1, 7, 8, 35]) {
      s.nursery.pets[id].xp = M.threshold(level);
      const form = rarity === "normal" ? 1 : level < 8 ? 1 : 2;
      assert.equal(M.stage(s, id).index, form);
      assert(
        GuardianArt.draw(
          M.pets.find((p) => p.id === id),
          form,
        ).includes(`/${rarity}/${id}-${form}.png`),
      );
    }
    const before = s.nursery.pets[id].xp;
    assert.equal(N.receive(s, id).xp, xp);
    assert.equal(s.nursery.pets[id].xp, before + xp);
    assert(M.valid(JSON.parse(JSON.stringify(s)), ["recall"]));
    const g = M.create();
    N.ensure(g);
    const pool = M.pets.filter((p) => p.rarity === rarity);
    let k = 0;
    const values = [
      rarity === "normal" ? 0 : 0.6,
      (pool.findIndex((p) => p.id === id) + 0.1) / pool.length,
    ];
    const drawn = N.summon(g, () => values[k++]);
    assert.equal(drawn.species, id);
    assert.equal(drawn.rarity, rarity);
  }
assert.equal(M.pets.length, 60);
assert.equal(GuardianArt.progress().forms, 125);
for (const tier of ["epic", "legend", "rainbow"])
  assert.equal(M.pets.filter((p) => p.rarity === tier).length, 10);
assert.deepEqual(N.rates(M.create()), {
  normal: 55,
  rare: 30,
  epic: 12,
  legend: 2.5,
  rainbow: 0.5,
});
console.log(
  "PASS: ten common species, exact coin prices, 30/60-word hatch, correct 1/2-form caps, duplicate XP, full common gacha pool, unchanged higher-tier counts/rates and save compatibility.",
);
