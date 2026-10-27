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
  A = GuardianArt,
  c = A.progress();
assert.equal(c.species, 50);
assert.equal(c.forms, 110);
assert.equal(c.totalForms, 110);
assert.deepEqual(c.completedTiers, [
  "normal",
  "rare",
  "epic",
  "legend",
  "rainbow",
]);
// Completion requires every planned form, not merely a total count.
const completeHashes = new Set();
for (const pet of M.pets) {
  assert.equal(Object.keys(A.assets[pet.id]).length, M.formCount(pet.id));
  for (let form = 1; form <= M.formCount(pet.id); form++) {
    const url = A.assets[pet.id][form];
    const file = fs.readFileSync(path.join(__dirname, "..", url));
    assert.equal(file.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    assert.equal(file[25], 6);
    assert(file.readUInt32BE(16) >= 1024 && file.readUInt32BE(20) >= 1024);
    completeHashes.add(crypto.createHash("sha256").update(file).digest("hex"));
    assert(A.draw(pet, form).includes('data-pet-art="painted"'));
  }
}
assert.equal(
  completeHashes.size,
  110,
  "all 110 forms must have independent image assets",
);
const s = M.create();
N.ensure(s);
for (const pet of M.pets.filter((p) => p.rarity === "rainbow")) {
  N.receive(s, pet.id);
  s.nursery.pets[pet.id].hatched = true;
  s.nursery.eggs = s.nursery.eggs.filter((id) => id !== pet.id);
  const hashes = [];
  for (const form of [1, 2, 3]) {
    const url = A.assets[pet.id][form],
      file = fs.readFileSync(path.join(__dirname, "..", url));
    assert(url.includes(`/rainbow/${pet.id}-${form}.png`));
    assert.equal(file.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    assert(file.readUInt32BE(16) >= 1024);
    assert(file.readUInt32BE(20) >= 1024);
    assert.equal(file[25], 6);
    hashes.push(crypto.createHash("sha256").update(file).digest("hex"));
  }
  assert.equal(
    new Set(hashes).size,
    3,
    pet.id + " needs three independent sprites",
  );
  for (const [level, form] of [
    [1, 1],
    [7, 1],
    [8, 2],
    [15, 2],
    [16, 3],
    [35, 3],
  ]) {
    s.nursery.pets[pet.id].xp = M.threshold(level);
    const before = JSON.stringify(s),
      stage = M.stage(s, pet.id);
    assert.equal(stage.index, form);
    const html = A.draw(pet, stage.index, false);
    assert(html.includes(`href="${A.assets[pet.id][form]}"`));
    assert(html.includes(`data-form="${form}"`));
    assert.equal(JSON.stringify(s), before);
  }
  assert(A.draw(pet, 99, false).includes(A.assets[pet.id][3]));
  assert(!A.draw(pet, 0, true).includes('data-pet-art="painted"'));
}
console.log(
  "PASS: thirty independent Rainbow RGBA sprites; exact level-8 and level-16 switches; final cap; no save mutation; 50 species / 110 forms.",
);
