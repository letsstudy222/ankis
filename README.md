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

## Trạm Sao: persistent arcade progression

Open **Linh thú & cửa hàng** from the vocabulary home. Each arcade completion awards run score; clean combos raise the score multiplier. Persistent XP/coin rewards diminish for repeated words on the same local day, and due-word recall gives a bonus. Daily missions auto-claim without interrupting typing. Five distinct clean words count as an active study day; days need not be consecutive.

Original star companions hatch/evolve using both increasing XP levels and accumulated study days. Three species, five growth stages, fourteen cosmetics (four included, ten purchasable), six expedition sectors, five badges and best score/combo records give medium/long-term goals. Purchases visibly change the actual ship, falling target, beam or background. Shop cosmetics never change the scheduler, answer or word timing. Missed days and failed runs never remove accumulated levels, currency or ownership. All progression is included in the existing vocabulary JSON export/import; older saves remain compatible. Existing word records are not converted into invented past game rewards.

- `guardian-model.js`: pure progression/economy/validation rules.
- `guardian.js`: original inline SVG art, station/shop UI, HUD and game feedback.
- [Research, sources, reward tables and pacing](docs/guardian-design.md).

Additional verification:

```sh
node tests/guardian_model.test.cjs
BASE_URL=http://127.0.0.1:8000 python3 tests/guardian_browser.py
```

The model test simulates sixty active days and checks level thresholds, reward caps, daily reset, missions, species/evolution/expeditions, purchases and invalid saves. Browser integration checks real typing rewards, nonblocking transitions, boss arrival cue, actual equipment changes, no duplicate charges, companion names, reload persistence, export/import, rejected invalid saves, and a narrow-screen modal. Test activity lives only in isolated browser contexts and does not modify real user progress.
