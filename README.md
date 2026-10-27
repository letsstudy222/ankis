# LetsStudy

Static flashcards and Vietnamese-to-English vocabulary practice, published with GitHub Pages.

- `index.html`: existing bundled flashcards (existing browser storage preserved).
- `vocabulary.html`, `vocabulary.css`, `vocabulary.js`: dedicated typing and falling-word arcade modes.
- `vocabulary-data.js`: 104 entries supplied by the owner, with Vietnamese meanings and context sentences.

## Development

No build or package installation required. Serve the checkout:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open the served pages in a browser. For automated smoke coverage, with Python Playwright and Chromium installed:

```sh
BASE_URL=http://127.0.0.1:8000 python3 tests/vocabulary_smoke.py
```

The test uses isolated browser storage. It covers entry navigation, narrow viewport, five-word learning and resume, recognition and guided typing, review scheduling and persistence, hinted review, learned-only infinite/game pools, mobile layout and legacy migration. Existing flashcard functionality is separate from vocabulary progress.

## Learning and data

New learners start with groups of five: word/meaning/context exposure, shuffled multiple-choice recognition, then guided typing with the model visible. Each completed step persists, so interrupted groups can resume. This familiarization is not counted as successful unaided recall. Only familiarized entries enter review, infinite practice and arcade. First recall is due after ten minutes. Review selects up to twenty oldest due entries per session; missed or hinted answers are scheduled ten minutes later without an endless same-session loop. Clean retrieval advances intervals through 1, 3, 7, 14, 30 and 60 days, at most one stage per local calendar day. Home refreshes availability every thirty seconds. Learners can explicitly start another five-word group.

Existing records are preserved: legacy positive-stage entries count as familiarized; legacy stage-zero entries can enter the learning flow. Infinite and arcade shuffle familiarized entries per cycle and update the same records. Browser speech synthesis provides optional English pronunciation where supported.

Progress is browser-local under `letsstudy-vocabulary-v1`. Export/import JSON on the vocabulary home page for backups or manual transfer. There is no account, server-side storage or automatic device sync. Game sound is opt-in. Hiding the browser tab automatically pauses the game.

## Publication

GitHub Pages should publish `main` at `/ (root)`. Push changes to `main` and wait for the Pages deployment. The vocabulary route is `/ankis/vocabulary.html`. No external CDN, API key or backend is required by the vocabulary area.

## Keyboard controls

Tab / Shift+Tab navigates controls, and Enter / Space activates the focused button. Enter continues learning, submits guided typing/review, or advances after feedback. Keys 1–4 select a meaning during recognition. Alt+1 opens a hint and Alt+2 reveals the answer, including while the answer input is focused. Alt+3 speaks the learning word; Alt+4 pauses/resumes arcade. Escape leaves the current activity. Typing letters is never intercepted; composition and modified shortcuts are preserved. Buttons show shortcuts and recognition answers are numbered. Versioned static asset URLs avoid mixing new HTML with previously cached scripts.

Arcade automatically advances on a completed word, clears and refocuses the typing input, and starts the next falling word immediately. Review modes retain explicit feedback and Enter to continue.

## Trạm Sao: collection, incubation and gacha

Open **Linh thú & cửa hàng** from the vocabulary home. Each arcade completion awards score; every ten clean words raises the combo multiplier, up to x5. Existing per-word XP/coin diminishing returns and due-word bonuses remain. All equipment/egg purchases require **only enough coins**, never levels or study days.

The nursery has 60 original illustrated species: fifteen each in Normal (green) and Rare (blue), ten each in Epic (purple), Legend (red-orange) and Rainbow (multicolor). Some eggs can be bought directly with coins; others are summon-only. A single incubator advances on clean arcade words, with 30/60/100/160/240 words per rarity. Switching/caching eggs preserves incubation. Hatched species can accompany the ship. Each species has its own XP; duplicate acquisition converts directly to that species' XP (40/100/240/600/1600). Normal has one form after hatching; Rare/Epic have two (level 8 evolution); Legend/Rainbow have three (level 8 and 16 evolutions), with no day gate. Numeric levels/XP continue growing and existing saves retain all XP.

Each summon costs 10 earned tickets. A one-time 10-ticket welcome grant lets new/migrated collections try a draw. Combo x1/x2/x3/x4/x5 drops tickets at 1/2/6/8/10%, for the first three clean completions of a word per local day. Every 15 clean words without a random ticket guarantees one ticket, including repeats beyond the random-roll cap. This saved counter survives incorrect answers, sessions, dates and reloads; random tickets reset it, daily mission tickets do not. Daily missions also award 2+4+2 guaranteed tickets. Gacha base rates are 55/30/12/2.5/0.5%; Rainbow soft pity starts on attempt 41 and is guaranteed by attempt 50 without a Rainbow. Rainbow prefers unseen species until all ten are collected. Actual next-draw and per-species odds, saved history, and counters are visible in the UI.

The expedition map and study-day achievements remain separate long-term goals. Rest days never remove currency, pets or levels. Currency/tickets have no real-money purchase path. Everything is browser-local and included in the existing JSON backup. Legacy saves preserve learning, money, equipment and previously unlocked companions; this remains a single-player local save rather than a server account.

- `guardian-model.js`: base score/economy and legacy progression rules.
- `guardian-nursery.js`: collection migration, coin-only acquisition, per-species XP, egg incubation, ticket and pity rules.
- `guardian-art.js`: complete manifest of 60 species / 125 original PNG forms, SVG wrappers, separate vector egg illustrations and defensive fallback. Normal has one form, Rare/Epic two, Legend/Rainbow three, with evolution at levels 8 and 16. New art follows the rarity hierarchy: simple restrained lower tiers, richer Legend, prismatic Rainbow. Each multi-form in-game card links to its full evolution comparison. See [production history and art direction](docs/pet-art-rollout.md) and the established `pet-art-preview.html` gallery.
- `guardian.js`: station UI, collection/shop/gacha/history, HUD and real arena equipment.
- [Current research, exact odds, pity, pacing and persistence](docs/guardian-gacha.md).
- [Original research and rationale](docs/guardian-design.md).

Verification, against a running static server:

```sh
node tests/guardian_model.test.cjs
node tests/guardian_nursery.test.cjs
BASE_URL=http://127.0.0.1:8000 python3 tests/vocabulary_smoke.py
BASE_URL=http://127.0.0.1:8000 python3 tests/guardian_browser.py
BASE_URL=http://127.0.0.1:8000 python3 tests/guardian_nursery_browser.py
BASE_URL=http://127.0.0.1:8000 python3 tests/guardian_ticket_browser.py
BASE_URL=http://127.0.0.1:8000 python3 tests/guardian_art_browser.py
node tests/guardian_simple_expansion.test.cjs
BASE_URL=http://127.0.0.1:8000 python3 tests/guardian_simple_expansion_browser.py
node tests/guardian_rainbow_expansion.test.cjs
BASE_URL=http://127.0.0.1:8000 python3 tests/guardian_rainbow_expansion_browser.py
node tests/guardian_legend_expansion.test.cjs
BASE_URL=http://127.0.0.1:8000 python3 tests/guardian_legend_expansion_browser.py
node tests/guardian_epic_expansion.test.cjs
BASE_URL=http://127.0.0.1:8000 python3 tests/guardian_epic_expansion_browser.py
node tests/guardian_rare_expansion.test.cjs
BASE_URL=http://127.0.0.1:8000 python3 tests/guardian_rare_expansion_browser.py
node tests/guardian_expansion.test.cjs
BASE_URL=http://127.0.0.1:8000 python3 tests/guardian_expansion_browser.py
node tests/guardian_rainbow_art.test.cjs
BASE_URL=http://127.0.0.1:8000 python3 tests/guardian_rainbow_art_browser.py
node tests/guardian_legend_art.test.cjs
BASE_URL=http://127.0.0.1:8000 python3 tests/guardian_legend_art_browser.py
node tests/guardian_epic_art.test.cjs
BASE_URL=http://127.0.0.1:8000 python3 tests/guardian_epic_art_browser.py
node tests/guardian_rare_art.test.cjs
BASE_URL=http://127.0.0.1:8000 python3 tests/guardian_rare_art_browser.py
```

Pure tests cover legacy progression, coin-only purchases, 60 species, duplicate XP, incubation pause/resume/hatch, ticket boundaries/mission caps, exactly forced hard pity, early reset, guaranteed ten-Rainbow collection, probability sums, a reproducible 100,000-draw base-rate simulation, migration and backup validation. Browser integration covers actual typing, combo/ticket HUD, seamless transitions, real cosmetic changes, acquisition/hatching, gacha and duplicate display, preserved draw results, export/import, mobile layout and keyboard navigation. Test data only exists in isolated browser contexts.

The first collection expansion adds penguin, hedgehog, raccoon, otter and seahorse: coin eggs cost 1,200 / 1,400 / 1,600 / 1,800 / 2,000; all incubate in 30 clean words, stay in one form and award 40 species XP on duplicate. Normal gacha remains 55% total, now shared across ten species (5.5% each at base; soft pity reduces Normal). No save reset or daily gate.

Expansion 2 adds koi, bat, chameleon, seal and peacock: Rare coin eggs 3000 / 3400 / 3800 / 4200 / 4600, 60 clean-word incubation, two forms with level-8 evolution, duplicate 100 species XP. Rare remains 30% total, split across ten species at 3% each. Collection total: 35 species / 70 forms.

Expansion 3 adds beetle, lynx, octopus, scorpion and crane: Epic gacha eggs, 100-word incubation, two forms at level 8 and 240 duplicate species XP. Epic remains 12% total, shared across ten species (1.2% each). New art follows restrained three-material violet/charcoal/ivory palettes, with silhouette-led evolution and no legendary/rainbow ornamentation. Total 40 species / 80 forms.

Expansion 4 adds tiger, genbu, swan, elephant and dragon-horse: Legend gacha eggs, 160-word incubation, three forms at levels 8/16 and 600 duplicate species XP. Legend remains 2.5% total, shared across ten species (0.25% each). Rich but coherent palettes and more elaborate anatomy distinguish Legend from restrained lower tiers; rainbow effects remain reserved for Rainbow. Total 45 species / 95 forms.

Expansion 5 adds aurora red panda, leviathan sea dragon, sphinx, moon rabbit and butterfly dragon: Rainbow gacha eggs, 240-word incubation, three forms at levels 8/16 and 1600 duplicate species XP. Rainbow remains 0.5% base with unchanged soft/hard pity; unseen preference now covers ten species including the original five and eggs. At most 500 draws collect all ten from zero, or 250 additional draws collect five new species if the original five are owned. Existing pity, ownership and tickets are preserved. Total 50 species / 110 forms.

Expansion 6 follows the owner’s preference to grow common rosters only: five simple Normal animals and five restrained Rare animals, 15 sprites total. Normal eggs 700–1100 coins, 30 clean words; Rare eggs 2000–2800 coins, 60 clean words and level-8 evolution. Low-saturation natural two/three-color palettes, plain eyes and minimal shading, no glitter or ornaments. Higher-tier roster sizes stay fixed at ten each. Total 60 species / 125 forms.
