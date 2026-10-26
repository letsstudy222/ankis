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
