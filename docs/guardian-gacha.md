# Celestial eggs: collection, pity and balance

Researched 2026-10-26. This supersedes the day/level purchase gates, three automatic species unlocks and shared companion evolution described in the original Star Station design. Expeditions still use study days; buying equipment/eggs and growing companions do not.

## Public sources actually read

- [Arknights public client gacha data](https://github.com/Kengxxiao/ArknightsGameData/blob/master/zh_CN/gamedata/excel/gacha_table.json): the standard banner description explicitly discloses its 6/5/4/3-star distribution as 2/8/50/40%, increases the highest rarity chance after 50 misses by two percentage points per miss, and carries the counter between standard banners. This source is community-hosted client data, not a new official policy statement. The useful design patterns are public base rates, a visible miss counter, reset on success, and persistence. Our five-tier rates and hard-50 rule are a new design for a learning game, not claimed to be Arknights' exact odds.
- [Genshin wish simulator](https://github.com/uzair-ashraf/genshin-impact-wish-simulator): README features include a details screen, inventory/rating filters, skip-able reveal presentation, and persistence of attempts/inventory in local storage. Its disclaimer notes third-party game assets. We take the interaction patterns, not its art/code or real-currency estimation feature. Creature sprites are original PNG illustrations; eggs retain original SVG illustrations.
- [Genshin wish export](https://github.com/biuuu/genshin-wish-export): preserving wish history as an inspectable/exportable record supports keeping the pity counter, recent results and species ownership inside the app's existing JSON backup.
- [Habitica egg hatching operation](https://github.com/HabitRPG/habitica/blob/develop/website/common/script/ops/hatch.js): validates material ownership before consuming ingredients and persists the resulting pet. Here purchase/draw/duplicate/incubation likewise validate current balances/ownership, and make the saved transaction before showing the result. Duplicate conversion is our own per-species-XP design.

General web search and many commercial sites are blocked by this environment's egress policy. These are primary implementation/data references read through GitHub, not an exhaustive survey or a claim of experimentally optimized learning outcomes.

## Species and acquisition

60 original species: fifteen Normal and fifteen Rare, ten each Epic/Legend/Rainbow. Colors are green (Normal), blue (Rare), purple (Epic), red-orange (Legend), and a multicolor/rainbow treatment (Rainbow). Text labels accompany color. Fourteen Normal species and twelve Rare species have direct coin acquisition (the starter Fox is a gift, not a free repeat purchase). Other Rare, all Epic/Legend/Rainbow species are gacha-exclusive. All 60 can appear in gacha. There is no paid currency.

Shop equipment retains its established coin prices, but all level/day requirements are removed, both in UI and execution logic. Egg prices are 400–2000 coins for fourteen purchasable Normal species, and 1800–4600 for twelve Rare species. Buying repeats is allowed and explicitly identifies the duplicate XP benefit before purchase.

## Exact gacha distribution

Each draw costs 10 earned tickets. Base distribution: Normal 55%, Rare 30%, Epic 12%, Legend 2.5%, Rainbow 0.5%. Within a rarity each eligible species is equally likely. During the first 40 consecutive non-Rainbow draws, rates remain at base. On attempts 41–49 the Rainbow chance is 1%, 1.5%, ..., 5%; the increase is subtracted from Normal, so total probability always remains 100%. Attempt 50 is 100% Rainbow. Any Rainbow resets its miss counter to zero; other rarities do not reset it. The counter persists on reload and backup import/export. The UI displays the actual next-draw distribution and per-species probabilities, not just the base table.

Rainbow draws prefer a not-yet-owned Rainbow species while any remain, including species owned as unhatched eggs. Thus there are exactly ten ultra-rare collection targets and no Rainbow duplicates until all ten have been collected. Including soft/hard pity, the exact mean wait is approximately 43.721 draws per Rainbow (effective long-run rate approximately 2.287%, distinct from the 0.5% base rate). At most 500 draws guarantee collection of all ten (assuming the player starts at zero and keeps using the same saved state). Once complete, Rainbow duplicates grant XP like other rarities.

## Tickets and pacing

Clean-word combo multipliers remain x1–x5 for scoring, but ticket probability is now independent of combo. Let m be clean completions without a word-ticket drop (0–19): the next clean completion has probability (m+1)/20. Thus attempts 1/2/…/20 have 5/10/…/100% chance. Any successful word ticket resets m=0. Every clean repeat is eligible, including repeats beyond XP/coin caps; wrong answers do not advance/reset m. Daily mission tickets do not reset it. The twentieth attempt always pays exactly one word ticket, regardless of RNG. Current persisted `ticketMisses` is reused; old 0–14 counters retain progress, validation now accepts 0–19, and JSON/date/reload behavior is unchanged. XP/coin variety incentives still apply. This supersedes the former combo probabilities, three-per-word cap and hard-15 guarantee.

Daily missions additionally grant guaranteed tickets: 5 distinct clean words = 2 tickets; 15 distinct = 4 more; 3 distinct clean due words = 2 more. Each mission pays once per local date. New/migrated collections receive a one-time welcome grant of 10 tickets, stored as part of collection creation. There are no resettable welcome buttons.

The increasing probability makes tickets substantially more frequent, with a maximum of 20 clean completions per word ticket. This probability sequence is a learning-game pacing choice; daily mission rewards and the gacha cost remain unchanged. No ticket gate depends on calendar days.

## Incubation, duplicates and XP

Receiving a new species creates exactly one unhatched egg and its own persistent species record. Choose one egg to incubate. Each clean arcade word advances incubation by one, regardless of repeat-XP/ticket caps: 30/60/100/160/240 words for Normal/Rare/Epic/Legend/Rainbow. Caching/pausing an egg retains its progress. There is no wall-clock or day timer. A hatched species can be equipped. Clean/effort XP from the existing economy goes to the currently selected species; global station XP is retained separately.

A repeat of any owned species (hatched, bagged or incubating) immediately grants 40/100/240/600/1600 XP according to rarity to that species only, and increments its received count. It never adds a second copy of the egg or silently completes incubation. Individual species retain quadratic XP/level thresholds. After approval of the art sample, Normal has one post-hatch form, Rare/Epic have two forms (evolution at level 8), and Legend/Rainbow have three forms (levels 8 and 16), with no active-day requirement. Existing XP is preserved. See [the art rollout](pet-art-rollout.md) for the original production plan, expansions and current 125-form collection.

## Persistence, tests and limits

The optional `guardian.nursery` extension is versioned. Legacy saves preserve all learning records, money, owned cosmetics, active species and previously unlocked old companions; existing companion XP is carried into those records. New exports include tickets, pity, egg inventory, paused incubation, per-species XP/copies and the last 50 draw results. Unknown species, impossible counters, invalid incubator progress and invalid inventory references are rejected at import. Existing valid old exports remain importable.

Pure tests include exactly forced attempt-50 pity, reset on early Rainbow, ten guaranteed distinct Rainbows across 500 forced draws, coin-only purchases, duplicate conversion, incubation switching/resuming/hatching, ticket boundaries/caps, once-only missions and old-save migration. A reproducible 100,000-draw base-rate simulation (pity disabled only in this test) produced 54,919 Normal / 30,111 Rare / 12,023 Epic / 2,431 Legend / 516 Rainbow, consistent with the configured probabilities. Browser tests exercise the real UI, independent save/restore, and mobile layout. This is local single-player storage, not server-verified anti-cheat or cross-device sync.

Collection expansion: 30 species (10 Normal, 5 in each other tier), 60 forms. The five new Normal coin eggs cost 1200–2000 coins; species share the unchanged Normal chance equally (5.5% each at base). Existing save ownership, incubation and XP remain valid.

## Expansion 2: five Rare families

Koi, bat, chameleon, seal and peacock add ten standalone real-alpha PNGs in `assets/pets/rare/`. Stage II deliberately changes expression, dominant palette and anatomy while retaining identity motifs. Egg prices 3000/3400/3800/4200/4600 coins, incubation 60 clean words, evolution level 8, duplicate 100 species XP. All appear in Rare gacha; the tier remains 30% split evenly across ten species (3% each). No day gate or save reset. Total 35 species / 70 forms, with ten Normal, ten Rare, five each Epic/Legend/Rainbow. Earlier batch counts are retained as historical records.

## Expansion 3: five Epic families

Beetle, lynx, octopus, scorpion and crane add ten real-alpha individual sprites. Gacha-only Epic eggs, 100 clean-word incubation, two forms with level-8 evolution, 240 duplicate species XP. Epic remains 12%, now 1.2% per species across ten. Total 40 species / 80 forms. No save reset or day gate.

## Expansion 4: five Legend families

Tiger, genbu, swan, elephant and dragon-horse add fifteen standalone real-alpha sprites. Gacha-only Legend eggs, 160 clean-word incubation, three forms at levels 8/16, 600 duplicate species XP. Legend remains 2.5%, now 0.25% each across ten species. Total 45 species / 95 forms. Each evolved stage changes expression, dominant palette and anatomy; mature Legend uses richer gold/armor/feather detailing than Epic but no rainbow effects. Original companion IDs, egg progress and saved study data are preserved. Earlier batch counts remain historical.

The per-species probability UI now divides by the live rarity-pool size instead of the original constant five. This fixes displayed odds after collection expansions; the underlying draw implementation already used the correct pool size. Browser checks assert every base per-species percentage and a 100% sum.

## Expansion 5: five Rainbow families

Aurora red panda, leviathan sea dragon, sphinx, moon rabbit and butterfly dragon add fifteen real-alpha sprites with three distinct stages. Gacha-only Rainbow eggs, 240 clean-word incubation, evolutions at levels 8/16, 1600 duplicate species XP. Rainbow remains 0.5% base, soft pity from draw 41 and guaranteed at 50; the unseen-species pool now has ten species including original ownership and unhatched eggs. Maximum 500 draws for all ten from zero, or 250 additional for five missing species when the original five are owned. No pity, tickets, egg progress, XP or learning data reset. Total 50 species / 110 forms, ten in each rarity. Any earlier five-Rainbow/250-draw or smaller collection counts describe historical rosters; this section is the current expansion rule.

## Expansion 6: common natural animals only

Five Normal (shiba, duck, hamster, frog, sparrow) and five Rare (squirrel, ferret, crab, puffin, gecko), fifteen original sprites. Modest earth/pastel palettes: about two natural material colors for Normal, two/three for Rare, plain small eyes, minimal flat shading; no jewels, auras, gold, neon, rainbow, stars or complex ornaments. Normal coin eggs 700/800/900/1000/1100 and 30-word hatch; Rare coin eggs 2000/2200/2400/2600/2800 and 60-word hatch, level-8 second form. Standard 40/100 duplicate XP. Epic, Legend and Rainbow remain at ten species each; owner preference is to prioritize Normal/Rare rather than adding more prestigious species without a new explicit request. Existing earlier artwork remains as-is. Total 60 species / 125 forms. Tier odds, pity and old save data unchanged; per-species Normal odds are 55/15%, Rare 30/15%. UI rounds individual percentages to three decimals.

## Functional equipment update

Flying targets add 0/1/2/3 percentage points to progressive word-ticket chance, capped at 100%; they do not change gacha rarity odds or hard/soft pity. New prices 0/4000/16000/45000. Other slot effects and prices are in README. Owners retain earlier purchases and receive their effects without paying again. Ships store at most one character hint, recharged by 18/12/8/5 unaided clean words; assisted answers do not recharge. Trails grant 0/1/2/3 extra coins only on each word’s first clean completion per local day. Sky bonuses grant 0/2/4/7 extra seconds per arcade word. Optional validated gear fields persist in the existing backup; no coins, tickets or learning records reset. Earlier cosmetic-only descriptions are historical.
