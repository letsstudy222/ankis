"use strict";
const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  crypto = require("node:crypto");
require("../guardian-model.js");
require("../guardian-nursery.js");
require("../guardian-art.js");
const M = GuardianModel,
  N = GuardianNursery,
  A = GuardianArt;
const coverage = A.progress();
assert.equal(coverage.species, 40);
assert.equal(coverage.forms, 80);
assert.equal(coverage.totalForms, 80);
assert.deepEqual(coverage.completedTiers, [
  "normal",
  "rare",
  "epic",
  "legend",
  "rainbow",
]);
const s = M.create();
N.ensure(s);
for (const pet of M.pets.filter((p) => p.rarity === "rare")) {
  N.receive(s, pet.id);
  s.nursery.pets[pet.id].hatched = true;
  s.nursery.eggs = s.nursery.eggs.filter((id) => id !== pet.id);
  const hashes = [];
  for (const form of [1, 2]) {
    const url = A.assets[pet.id][form];
    assert(url.includes(`/rare/${pet.id}-${form}.png`));
    const file = fs.readFileSync(path.join(__dirname, "..", url));
    assert.equal(file.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    assert(file.readUInt32BE(16) >= 1024);
    assert(file.readUInt32BE(20) >= 1024);
    assert.equal(file[25], 6);
    hashes.push(crypto.createHash("sha256").update(file).digest("hex"));
    s.nursery.pets[pet.id].xp = M.threshold(form === 1 ? 7 : 8);
    const stateBefore = JSON.stringify(s),
      stage = M.stage(s, pet.id);
    assert.equal(stage.index, form);
    const output = A.draw(pet, stage.index, false);
    assert(output.includes(`href="${url}"`));
    assert(output.includes(`data-form="${form}"`));
    assert.equal(JSON.stringify(s), stateBefore);
  }
  assert.notEqual(
    hashes[0],
    hashes[1],
    `${pet.id}: final art must not reuse baby file`,
  );
  assert(A.draw(pet, 99, false).includes(`href="${A.assets[pet.id][2]}"`));
  assert(!A.draw(pet, 0, true).includes('data-pet-art="painted"'));
}
console.log(
  "PASS: twenty distinct high-resolution RGBA Rare sprites, 40/40 species and 80/80 forms, completed batches, exact level-8 asset switch, capped final form, unchanged save and separate eggs.",
);
