# Word Orbit interface and practice update

The owner supplied https://parroto.app/vi/games as the inspiration. Direct access, the www host and a text-fetch fallback were blocked by this environment’s network proxy (HTTP 403). No Parroto page, screenshot or gameplay could be inspected; this implementation does not claim to reproduce verified Parroto mechanics. The scene, icons and interface here are original SVG/CSS work based on the owner’s falling-word shooter brief.

## Learning decisions

- Continue familiarization before testing: five-word exposure, meaning recognition and guided spelling remain available. New words never enter the arcade before introduction.
- Recommend due review before more new words or gameplay. After five newly familiarized words in a local day, recommend a rest or untimed practice instead of continually prompting another new group; this is a suggestion, not a new-word limit. An optional per-word `introducedOn` day is saved for this recommendation; legacy records remain valid. Each arcade round contains every familiar word once, prioritizing due words, then stage-zero memories, then others; shuffle inside those groups.
- Recall remains the scoring task. There is one readable Vietnamese target, a letter-length pattern and a single focused answer input. Correct completion immediately advances without Enter.
- Give fragile stage-zero memories 30% more base thinking time. Each five consecutive clean answers reduces base time by 2%, capped at 8%; a supported/incorrect answer resets this run adjustment. Length allowance and purchased sky seconds are added afterwards. These are conservative product defaults, not experimentally validated optimal intervals.
- Three shields allow two timed-out words to become coached relearning instead of an immediate game over. The third timeout ends the flight with the missed word and a weak-word recap. No penalty to the existing wallet.
- A learner can also request relearning with Alt+2. Show the English word, Vietnamese meaning, context and optional pronunciation; stop the clock and ask the learner to type it. Record exactly one failed recall when the answer is exposed, including if the learner quits. Completing this supported copy must not count as clean recall or earn clean-word coins/tickets, combo, incubation or ship-hint recharge. Existing once-per-word effort XP and base score rules remain.
- Reinsert a missed word after three other distinct words when the queue has enough variety. At most two such insertions per word per flight; do not duplicate one already due in that window. Small pools continue their normal shuffle instead of inventing fillers or newly introduced words.
- Finish with a list of words that needed support and an optional untimed review restricted to that list. Keep the established 10-minute failed/assisted retry and daily spacing schedule. Clean stages can advance at most once per local day.

Retrieval practice and distributed practice are the relevant general learning principles. Background references: Roediger & Karpicke (2006), https://doi.org/10.1111/j.1467-9280.2006.01693.x ; Dunlosky et al. (2013), https://doi.org/10.1177/1529100612453266 . These links were not retrievable in this restricted environment; no fresh literature review or outcome guarantee is claimed.

## Presentation and performance

Original vector space scene is a small local SVG (`assets/scenes/orbit.svg`), with tier-neutral teal, cream and warm accents. Cosmetic sky choices overlay distinct tints, while ships, targets, trails and companion still use the actual equipped inventory. Letter hits, progress ring, brief destruction sparkle, engine glow and drifting stars communicate action without obscuring text. The selected hatched companion patrols only the arena; there is no corner pet or dock.

Keep effects bounded and remove each within one second. Existing timer uses one animation-frame loop; the clock display updates once per second. CSS animation pauses with the game and respects reduced motion. Desktop and 390-pixel mobile layouts keep the answer in view; no external fonts/assets, analytics or new dependencies. Local save key/version, backup compatibility, purchases, pet roster and gacha rules are preserved.

## Validation

- `node tests/vocabulary_practice.test.cjs`: queue ordering/coverage, timings, bounded pace, additive gear bonus, distinct-word spacing, retry caps, small pools.
- `BASE_URL=http://127.0.0.1:8008 python3 tests/vocabulary_flight_browser.py`: real interface, supported recall/save/rewards, spacing, weak-word review, actual timer-driven shield losses using browser virtual time, mobile and reduced motion.
- Existing vocabulary, equipment, ticket, economy and companion browser checks cover regressions in learning/keyboard, purchases, gacha guarantee, and arena-only animation.
