# Celestial eggs: collection, pity and balance

Researched 2026-10-26. This supersedes the day/level purchase gates, three automatic species unlocks and shared companion evolution described in the original Star Station design. Expeditions still use study days; buying equipment/eggs and growing companions do not.

## Public sources actually read

- [Arknights public client gacha data](https://github.com/Kengxxiao/ArknightsGameData/blob/master/zh_CN/gamedata/excel/gacha_table.json): the standard banner description explicitly discloses its 6/5/4/3-star distribution as 2/8/50/40%, increases the highest rarity chance after 50 misses by two percentage points per miss, and carries the counter between standard banners. This source is community-hosted client data, not a new official policy statement. The useful design patterns are public base rates, a visible miss counter, reset on success, and persistence. Our five-tier rates and hard-50 rule are a new design for a learning game, not claimed to be Arknights' exact odds.
- [Genshin wish simulator](https://github.com/uzair-ashraf/genshin-impact-wish-simulator): README features include a details screen, inventory/rating filters, skip-able reveal presentation, and persistence of attempts/inventory in local storage. Its disclaimer notes third-party game assets. We take the interaction patterns, not its art/code or real-currency estimation feature. All new creature illustrations here are original scalable SVG.
- [Genshin wish export](https://github.com/biuuu/genshin-wish-export): preserving wish history as an inspectable/exportable record supports keeping the pity counter, recent results and species ownership inside the app's existing JSON backup.
- [Habitica egg hatching operation](https://github.com/HabitRPG/habitica/blob/develop/website/common/script/ops/hatch.js): validates material ownership before consuming ingredients and persists the resulting pet. Here purchase/draw/duplicate/incubation likewise validate current balances/ownership, and make the saved transaction before showing the result. Duplicate conversion is our own per-species-XP design.

General web search and many commercial sites are blocked by this environment's egress policy. These are primary implementation/data references read through GitHub, not an exhaustive survey or a claim of experimentally optimized learning outcomes.

## Species and acquisition

25 original species: five per rarity. Colors are green (Normal), blue (Rare), purple (Epic), red-orange (Legend), and a multicolor/rainbow treatment (Rainbow). Text labels accompany color. Five Normal species and two Rare species have known, direct coin acquisition (the starter Fox is a gift, not a free repeat purchase). Other Rare, all Epic/Legend/Rainbow species are gacha-exclusive. All 25 can appear in gacha. There is no paid currency.

Shop equipment retains its established coin prices, but all level/day requirements are removed, both in UI and execution logic. Egg prices are 400–1000 coins for the four purchasable Normal species, and 1800/2400 for two Rare species. Buying repeats is allowed and explicitly identifies the duplicate XP benefit before purchase.

## Exact gacha distribution

Each draw costs 10 earned tickets. Base distribution: Normal 55%, Rare 30%, Epic 12%, Legend 2.5%, Rainbow 0.5%. Within a rarity each eligible species is equally likely. During the first 40 consecutive non-Rainbow draws, rates remain at base. On attempts 41–49 the Rainbow chance is 1%, 1.5%, ..., 5%; the increase is subtracted from Normal, so total probability always remains 100%. Attempt 50 is 100% Rainbow. Any Rainbow resets its miss counter to zero; other rarities do not reset it. The counter persists on reload and backup import/export. The UI displays the actual next-draw distribution and per-species probabilities, not just the base table.

Rainbow draws prefer a not-yet-owned Rainbow species while any remain, including species owned as unhatched eggs. Thus there are exactly five ultra-rare collection targets and no Rainbow duplicates until all five have been collected. Including soft/hard pity, the exact mean wait is approximately 43.721 draws per Rainbow (effective long-run rate approximately 2.287%, distinct from the 0.5% base rate). At most 250 draws guarantee collection of all five (assuming the player starts at zero and keeps using the same saved state). Once complete, Rainbow duplicates grant XP like other rarities.

## Tickets and pacing

Clean-word combo multipliers are x1 for 0–9, x2 for 10–19, x3 for 20–29, x4 for 30–39 and x5 for 40+ consecutive clean words. Per eligible completion, ticket probabilities are 1%, 2%, 6%, 8%, 10%, respectively. A typo resets the clean combo. Each word's first three clean completions on a local date may roll for a ticket; later completions still give run score and incubation progress, but do not roll random tickets. **Ticket guarantee update:** every 15 clean completions without a random ticket awards one guaranteed ticket, including repeats beyond that cap. An early random ticket resets this separate counter, incorrect answers and daily mission rewards do not. The counter persists across sessions, dates and backups, and the HUD shows how many correct words remain. The 15th completion awards at most one word ticket even if the random roll also succeeds. This uses the existing visible per-word variety incentive.

Daily missions additionally grant guaranteed tickets: 5 distinct clean words = 2 tickets; 15 distinct = 4 more; 3 distinct clean due words = 2 more. Each mission pays once per local date. New/migrated collections receive a one-time welcome grant of 10 tickets, stored as part of collection creation. There are no resettable welcome buttons.

At 20 eligible unique completions in a continuous run, random drops average approximately 0.35 tickets; completing all three daily missions adds 8 deterministic tickets. The 15-word guarantee now additionally sets a maximum dry spell of 15 clean words and accelerates earning relative to this original random-only estimate. Thus one draw takes roughly a day or two at this pace, while the five-Rainbow collection remains a months-long goal. These estimates vary with combo length, learned pool and due cards; they are not promises of an individual random outcome. No additional ticket gate depends on calendar days.

## Incubation, duplicates and XP

Receiving a new species creates exactly one unhatched egg and its own persistent species record. Choose one egg to incubate. Each clean arcade word advances incubation by one, regardless of repeat-XP/ticket caps: 30/60/100/160/240 words for Normal/Rare/Epic/Legend/Rainbow. Caching/pausing an egg retains its progress. There is no wall-clock or day timer. A hatched species can be equipped. Clean/effort XP from the existing economy goes to the currently selected species; global station XP is retained separately.

A repeat of any owned species (hatched, bagged or incubating) immediately grants 40/100/240/600/1600 XP according to rarity to that species only, and increments its received count. It never adds a second copy of the egg or silently completes incubation. Individual species retain quadratic XP/level thresholds. After approval of the art sample, Normal has one post-hatch form, Rare/Epic have two forms (evolution at level 8), and Legend/Rainbow have three forms (levels 8 and 16), with no active-day requirement. Existing XP is preserved. See [the art rollout](pet-art-rollout.md) for the 55-form production plan and shipped batches.

## Persistence, tests and limits

The optional `guardian.nursery` extension is versioned. Legacy saves preserve all learning records, money, owned cosmetics, active species and previously unlocked old companions; existing companion XP is carried into those records. New exports include tickets, pity, egg inventory, paused incubation, per-species XP/copies and the last 50 draw results. Unknown species, impossible counters, invalid incubator progress and invalid inventory references are rejected at import. Existing valid old exports remain importable.

Pure tests include exactly forced attempt-50 pity, reset on early Rainbow, five guaranteed distinct Rainbows across 250 forced draws, coin-only purchases, duplicate conversion, incubation switching/resuming/hatching, ticket boundaries/caps, once-only missions and old-save migration. A reproducible 100,000-draw base-rate simulation (pity disabled only in this test) produced 54,919 Normal / 30,111 Rare / 12,023 Epic / 2,431 Legend / 516 Rainbow, consistent with the configured probabilities. Browser tests exercise the real UI, independent save/restore, and mobile layout. This is local single-player storage, not server-verified anti-cheat or cross-device sync.

Collection expansion: 30 species (10 Normal, 5 in each other tier), 60 forms. The five new Normal coin eggs cost 1200–2000 coins; species share the unchanged Normal chance equally (5.5% each at base). Existing save ownership, incubation and XP remain valid.

## Expansion 2: five Rare families

Koi, bat, chameleon, seal and peacock add ten standalone real-alpha PNGs in `assets/pets/rare/`. Stage II deliberately changes expression, dominant palette and anatomy while retaining identity motifs. Egg prices 3000/3400/3800/4200/4600 coins, incubation 60 clean words, evolution level 8, duplicate 100 species XP. All appear in Rare gacha; the tier remains 30% split evenly across ten species (3% each). No day gate or save reset. Total 35 species / 70 forms, with ten Normal, ten Rare, five each Epic/Legend/Rainbow. Earlier batch counts are retained as historical records.

## Expansion 3: five Epic families

Beetle, lynx, octopus, scorpion and crane add ten real-alpha individual sprites. Gacha-only Epic eggs, 100 clean-word incubation, two forms with level-8 evolution, 240 duplicate species XP. Epic remains 12%, now 1.2% per species across ten. Total 40 species / 80 forms. No save reset or day gate.
