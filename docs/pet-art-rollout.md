# Approved style A production rollout

The owner approved the 1/2/3-form evolution sample and authorized integration into the site, with a bounded amount of illustration work per chat. Plan: preserve all 25 species and ship five species per batch, grouped by rarity. This is a finite 55-form collection, excluding egg art.

| Batch | Rarity | Species | Forms per species | Assets | Status |
| --- | --- | ---: | ---: | ---: | --- |
| 1 | Normal | 5 | 1 | 5 | Shipped |
| 2 | Rare | 5 | 2 | 10 | Shipped |
| 3 | Epic | 5 | 2 | 10 | Shipped |
| 4 | Legend | 5 | 3 | 15 | Pending |
| 5 | Rainbow | 5 | 3 | 15 | Pending |
| Total | | 25 | | 55 | 25/55 completed |

## Production assets

Batch 1 consists of five individually generated, real-alpha PNG sprites: `assets/pets/normal/{fox,sprout,rabbit,cat,turtle}-1.png`. They match the approved A direction: confident thick outlines, vibrant cel shading, large expressive head and compact anatomy. Sprout, rabbit, cat and turtle retain their own species silhouettes rather than being fox recolors. Each file is an independent complete asset, not a crop of the multi-character concept board. Original generated files are retained outside the checkout.

Batch 2 adds ten individually generated real-alpha PNGs: `assets/pets/rare/{axolotl,owl,jelly,deer,manta}-{1,2}.png`. Each evolved form was generated from its own hatchling reference so the face, palette and markings stay recognizable while gills/wings/tentacles/antlers/fins develop. The five families are shown side-by-side at the top of the existing review URL, and in-game comparison links open the relevant family without requiring ownership. No PNG crops, recolors or reused first-form files stand in for second forms.

`GuardianArt.assets` is the manifest. `draw()` uses the new sprite when a form is present; eggs and pending species use the existing SVG art. The SVG wrapper retains the established sizing/animation/accessibility behavior. A progress panel and per-species labels distinguish new production sprites from temporary legacy art. `pet-art-preview.html` is the live rollout gallery at the user's established URL; older concept pages are retained.

## Progression compatibility

`GuardianModel.formCount(id)` defines 1/2/2/3/3 forms by rarity. Eggs remain index 0. Hatched Normal stays in form 1 regardless of level; Rare/Epic have forms 1 and 2 (level 8); Legend/Rainbow have forms 1, 2 and 3 (levels 8 and 16). These retain the earlier first two evolution thresholds while capping each species to its approved form count. XP and numeric levels continue to grow; there is no XP, ownership or reward migration/reset. Legacy high-level companions map to the final permitted form. The old four-form path is no longer advertised.

Each later art batch should add only its approved species/form assets to the manifest, verify actual alpha and image loading, and update the gallery, progress text and this table. Do not label pending legacy art as freshly generated. Species/rates, purchases, tickets (including the 15-clean-word guarantee), pity, backup format and study scheduling remain unchanged.

Batch 3 adds ten individually generated transparent Epic sprites: `assets/pets/epic/{butterfly,wolf,lotus,whale,kirin}-{1,2}.png`. Each evolved sprite uses its hatchling as a reference, retains its palette and identity, and develops its silhouette. The established gallery shows both forms without requiring ownership. Normal, Rare and Epic are complete: 15 species / 25 forms; Legend and Rainbow remain pending (30 forms). Save data and reward rules are unchanged.
