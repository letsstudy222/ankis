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

The test uses isolated browser storage. It covers entry navigation, narrow viewport, daily completion and persistence, answer checking, hints/context, game pause and collision. Existing flashcard functionality is separate from vocabulary progress.

## Learning and data

Daily planning uses the local calendar date, up to 20 oldest overdue entries and 10 unseen entries. Plans persist for the day. Clean retrieval advances intervals through 1, 3, 7, 14, 30 and 60 days. Mistakes/hints reset the interval to one day; daily practice reinserts missed entries after at least three intervening questions. Supplemental practice questions fill the gap when necessary. Infinite and arcade modes shuffle all entries per cycle and update the same learning records. Infinite mode does not immediately repeat the last word when starting a new cycle.

Progress is browser-local under `letsstudy-vocabulary-v1`. Export/import JSON on the vocabulary home page for backups or manual transfer. There is no account, server-side storage or automatic device sync. Game sound is opt-in. Hiding the browser tab automatically pauses the game.

## Publication

GitHub Pages should publish `main` at `/ (root)`. Push changes to `main` and wait for the Pages deployment. The vocabulary route is `/ankis/vocabulary.html`. No external CDN, API key or backend is required by the vocabulary area.
