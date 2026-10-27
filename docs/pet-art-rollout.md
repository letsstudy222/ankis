# Approved style A production rollout

The owner approved the 1/2/3-form evolution sample and authorized integration into the site, with a bounded amount of illustration work per chat. Plan: preserve all 25 species and ship five species per batch, grouped by rarity. This is a finite 55-form collection, excluding egg art.

| Batch | Rarity | Species | Forms per species | Assets | Status |
| --- | --- | ---: | ---: | ---: | --- |
| 1 | Normal | 5 | 1 | 5 | Shipped |
| 2 | Rare | 5 | 2 | 10 | Shipped |
| 3 | Epic | 5 | 2 | 10 | Shipped |
| 4 | Legend | 5 | 3 | 15 | Shipped |
| 5 | Rainbow | 5 | 3 | 15 | Shipped |
| Total | | 25 | | 55 | 55/55 completed |

## Production assets

Batch 1 consists of five individually generated, real-alpha PNG sprites: `assets/pets/normal/{fox,sprout,rabbit,cat,turtle}-1.png`. They match the approved A direction: confident thick outlines, vibrant cel shading, large expressive head and compact anatomy. Sprout, rabbit, cat and turtle retain their own species silhouettes rather than being fox recolors. Each file is an independent complete asset, not a crop of the multi-character concept board. Original generated files are retained outside the checkout.

Batch 2 adds ten individually generated real-alpha PNGs: `assets/pets/rare/{axolotl,owl,jelly,deer,manta}-{1,2}.png`. Each evolved form was generated from its own hatchling reference so the face, palette and markings stay recognizable while gills/wings/tentacles/antlers/fins develop. The five families are shown side-by-side at the top of the existing review URL, and in-game comparison links open the relevant family without requiring ownership. No PNG crops, recolors or reused first-form files stand in for second forms.

`GuardianArt.assets` is the manifest. `draw()` uses the new sprite when a form is present; eggs and pending species use the existing SVG art. The SVG wrapper retains the established sizing/animation/accessibility behavior. A progress panel and per-species labels distinguish new production sprites from temporary legacy art. `pet-art-preview.html` is the live rollout gallery at the user's established URL; older concept pages are retained.

## Progression compatibility

`GuardianModel.formCount(id)` defines 1/2/2/3/3 forms by rarity. Eggs remain index 0. Hatched Normal stays in form 1 regardless of level; Rare/Epic have forms 1 and 2 (level 8); Legend/Rainbow have forms 1, 2 and 3 (levels 8 and 16). These retain the earlier first two evolution thresholds while capping each species to its approved form count. XP and numeric levels continue to grow; there is no XP, ownership or reward migration/reset. Legacy high-level companions map to the final permitted form. The old four-form path is no longer advertised.

Each later art batch should add only its approved species/form assets to the manifest, verify actual alpha and image loading, and update the gallery, progress text and this table. Do not label pending legacy art as freshly generated. Species/rates, purchases, tickets (including the 15-clean-word guarantee), pity, backup format and study scheduling remain unchanged.

Batch 3 adds ten individually generated transparent Epic sprites: `assets/pets/epic/{butterfly,wolf,lotus,whale,kirin}-{1,2}.png`. Each evolved sprite uses its hatchling as a reference, retains its palette and identity, and develops its silhouette. The established gallery shows both forms without requiring ownership. Normal, Rare and Epic are complete: 15 species / 25 forms; Legend and Rainbow remain pending (30 forms). Save data and reward rules are unchanged.

Batch 4 ships fifteen individually generated transparent Legend sprites: `assets/pets/legend/{dragon,phoenix,serpent,lion,griffin}-{1,2,3}.png`. Each next form references its preceding form to preserve identity while developing anatomy. Three-form comparisons are available at the established gallery URL; on phones forms stack at readable size. Levels 8 and 16 select forms II and III using existing species XP, with no save migration or reward changes. Current production coverage: 20 species / 40 forms; only Rainbow (5 species / 15 forms) remains. The owner now prefers direct site updates and text reports without sending images in chat.

## Legend evolution redesign (revision 2)

Owner feedback: the original Legend evolution looked like a size change. Redrew ten stage-II/III sprites with explicit changes in expression, dominant color and anatomical silhouette. Stage I stays untouched. Dragon develops cobalt quadruped anatomy then silver/navy upright dragon anatomy; phoenix moves crimson adolescent to ivory/gold mature bird; serpent develops obsidian molten cobra then violet/gold royal coils; lion changes russet athlete to ivory solar guardian; griffin changes slate/copper predator to white/navy/gold imperial guardian. Identity motifs remain recognizable rather than locking the entire palette and baby face.

Revised files use `*-2-v2.png` and `*-3-v2.png` URLs in the manifest and gallery to prevent cached old PNGs appearing after update. Old stage-II/III assets are removed from the current tree. XP, stages, rarity, ownership and reward logic are unchanged. This is a replacement of ten forms: coverage stays 20 species / 40 of 55 forms.

## Batch 5: complete collection

Fifteen Rainbow sprites ship at `assets/pets/rainbow/{astra,iris,nova,orion,halo}-{1,2,3}.png`. Each successive stage deliberately changes expression, dominant palette and body structure, keeping selected identity motifs. Iris develops one, three, then nine tails. Original standalone transparent PNGs are generated individually; subsequent stages reference the previous stage. The existing gallery and in-game cards show all stages, with mobile-readable stacked triples. All five batches are complete: 25 species / 55 forms. Eggs retain separate SVG illustrations, with no changes to incubation, acquisition, gacha rates, pity, tickets, per-species XP or saved learning data.

## Expansion 1: five more Normal species

Penguin, hedgehog, raccoon, otter and seahorse add five individually generated transparent PNGs in `assets/pets/normal/`. Collection total is now 30 species / 60 forms. Normal contains ten species; the other tiers retain five each. All five new eggs are coin purchases (1200–2000 coins), also eligible for Normal gacha; Normal total remains 55%, split equally. Incubation requires 30 clean words, duplicate grants 40 species XP, no day gates. No save migration/reset is required because species records are keyed by stable IDs. The original 25-species / 55-form rollout above is retained as history.

## Expansion 2: five Rare families

Koi, bat, chameleon, seal and peacock add ten standalone real-alpha PNGs in `assets/pets/rare/`. Stage II deliberately changes expression, dominant palette and anatomy while retaining identity motifs. Egg prices 3000/3400/3800/4200/4600 coins, incubation 60 clean words, evolution level 8, duplicate 100 species XP. All appear in Rare gacha; the tier remains 30% split evenly across ten species (3% each). No day gate or save reset. Total 35 species / 70 forms, with ten Normal, ten Rare, five each Epic/Legend/Rainbow. Earlier batch counts are retained as historical records.

## Expansion 3: five Epic families

Beetle, lynx, octopus, scorpion and crane add ten real-alpha individual sprites. Gacha-only Epic eggs, 100 clean-word incubation, two forms with level-8 evolution, 240 duplicate species XP. Epic remains 12%, now 1.2% per species across ten. Total 40 species / 80 forms. No save reset or day gate.

## Rarity art direction (owner preference)

For new and revised designs: keep Normal to about two dominant material colors, compact uncomplicated anatomy and minimal markings. Rare can add a third material color and one distinctive structural feature. Epic uses around three coherent material colors and stronger silhouettes/evolution anatomy. Reserve elaborate crowns, luminous armor, layered effects and richer color for Legend; reserve prismatic/rainbow effects primarily for Rainbow. Keep line clarity and resolution high at every rarity: simplicity is a design choice, not blur or quality degradation. Existing artwork is retained unless specifically revised; the new Epic expansion follows this direction rather than retroactively claiming all earlier sprites were redrawn. Persist this owner preference for future batches.

## Expansion 4: five Legend families

Tiger, genbu, swan, elephant and dragon-horse add fifteen standalone real-alpha sprites. Gacha-only Legend eggs, 160 clean-word incubation, three forms at levels 8/16, 600 duplicate species XP. Legend remains 2.5%, now 0.25% each across ten species. Total 45 species / 95 forms. Each evolved stage changes expression, dominant palette and anatomy; mature Legend uses richer gold/armor/feather detailing than Epic but no rainbow effects. Original companion IDs, egg progress and saved study data are preserved. Earlier batch counts remain historical.
