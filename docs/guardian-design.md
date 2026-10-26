# Trạm Sao: original research and progression design

**Updated mechanics:** The egg/gacha release supersedes the purchase gates, shared companion stages, automatic species unlocks and x3 cap below. See [the current collection and gacha design](guardian-gacha.md) for the implemented rules. This document retains the original design rationale.

Research accessed 2026-10-26. Direct general web search, Finch, Habitica marketing, Duolingo blog and Learning Scientists were blocked by this environment's egress policy (403). The public source documents below were successfully retrieved and read. This is a comparative design review, not an experiment proving these rewards improve retention.

## Sources and decisions

1. [Habitica README](https://github.com/HabitRPG/habitica/blob/develop/README.md): completing real tasks gives experience and gold for equipment. [Pets UI text](https://github.com/HabitRPG/habitica/blob/develop/website/common/locales/en/pets.json), [feeding rules](https://github.com/HabitRPG/habitica/blob/develop/website/common/script/ops/feed.js), [achievements](https://github.com/HabitRPG/habitica/blob/develop/website/common/locales/en/achievements.json): pets hatch, can be equipped and fed toward growth; collection sets and long quest tracks give goals beyond levels. Adopt a visible companion, visible growth requirements, permanent cosmetic ownership, deterministic missions. Do not copy code, artwork, species or item names. Do not use Habitica's HP loss for missed study days.
2. [Pokemanki README](https://github.com/zjosua/Pokemanki/blob/master/README.md): a creature or egg belongs to a started deck, and learning/review levels and evolves it. Adopt a companion directly attached to study progress rather than an unrelated minigame. Build original star creatures, not Pokemon assets.
3. [Anki memory background](https://github.com/ankitects/anki-manual/blob/main/src/background.md) and [study controls](https://github.com/ankitects/anki-manual/blob/main/src/studying.md): active recall, spaced practice and keyboard-first review. [FSRS overview](https://github.com/open-spaced-repetition/fsrs4anki): memory scheduling depends on review history and recall, not game score. Keep the app's existing scheduler separate from the economy; do not call the existing fixed-interval scheduler FSRS. Reward diverse words and due recall instead of rushing or guessing. Keep automatic transitions and optional animations/audio.

## Implemented economy

- Every arcade completion gives score: 10 base + 2 per complete five alphabetic letters; combo multiplier rises every five clean words, capped at x3. An error resets the clean combo, but finishing still gives base score.
- Persistent clean-word rewards per local calendar day: first success 8 XP / 3 coins; second 3 XP / 1 coin; third 1 XP / 0 coins; later completions still score but add no XP/coins. First clean success when the word is due adds 4 XP / 2 coins. Mistyped completions still give 1 XP only on that word's first rewarded encounter of the day, no coins, no daily clean credit. This is a soft variety incentive, not a lockout on practice.
- Three daily missions, auto-claimed once: 5 distinct clean words (+10 coins), 15 distinct clean words (+20 coins), 3 distinct clean due words (+15 coins). A meaningful active day requires 5 distinct clean words. Days accumulate, need not be consecutive, and never decay.
- One shared companion bond level, with increasing thresholds: level L starts at 15*(L-1)^2 + 65*(L-1) cumulative XP. The first egg hatches with level 2 (80 XP) and 2 active days. Stages then require level 8 / 7 active days, level 16 / 21 days, level 28 / 45 days. Switching species preserves the bond.
- Original species: Hồ Ly Tinh Vân (starter); Kỳ Nhông Ngân Hà (7 days / 40 distinct clean words); Long Vũ Cực Quang (21 days / 80 distinct clean words). Conditions are explicit, permanent and deterministic.
- Six expedition sectors: 0, 60, 180, 450, 1000, 2200 cumulative clean clears, also requiring 0, 3, 7, 14, 30, 60 active days and 0, 10, 25, 45, 65, 90 distinct words. Each sector grants a one-time coin bonus; the final sector grants a cosmetic badge.
- Cosmetic shop: ships, targets, trails and backgrounds. Prices 150–2800 coins; later items also require levels and active days. Equipment changes real arena SVGs, laser colors, and backgrounds. Prices/requirements are visible before purchase. No paid currency, random loot or competitive server claims.
- Session boss silhouette every ten clears, a special arrival cue and score milestone; it uses the same recall interaction and timing, never blocks typing with a modal.
- Best run score and combo, badges, collection, daily missions and expedition progress persist in the same exported vocabulary save. No retroactive fabricated activity or rewards for historic records. Existing learning history remains intact.

## Pacing assumptions

With 15 distinct clean words daily, base rewards yield 120 XP and 45 coins, plus 30 mission coins. Due-word rewards can add more. A 150-coin item takes roughly two sessions at this pace; 700 coins around 1–2 weeks, 2800 coins several weeks. Progression levels slow quadratically; later evolution and sectors additionally require 21–60 active days. These are design estimates, not promised completion dates. Repeating a small pool yields lower income, while learning more vocabulary opens more earning opportunities. Rest days never consume coins, levels or pets. Home and the hangar explain all conditions.

## Storage and scope

Browser-local, offline-compatible and single-player. No account or anti-cheat guarantee; changing the local clock or local data can change rewards. Backups include the new progression state; older backups remain importable. All art is original SVG/CSS and all mechanics are authored here. Cosmetic ownership must be validated at import/equip; purchases must validate balance, gates and ownership again at execution.
