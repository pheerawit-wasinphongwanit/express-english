# ด่วนภาษา EXPRESS ENGLISH 📖🚂

Zero-dependency mobile-first arcade English game (Thai UI). Answer 4-choice
questions — spot the grammar error, everyday vocabulary, mini-passage context —
against a time-bank clock: correct answers add seconds, wrong answers cost 5s +
your streak. Ride through 4 stations from ป.1–3 to ม.ปลาย+; chase your best score
and the daily run. Sibling of [ด่วนคณิต EXPRESS MATH](https://github.com/pheerawit-wasinphongwanit/express-math).

## Run

Open `index.html` in any browser (works offline from `file://`, no build step, no CDN).
For a local server: `python3 -m http.server` in the repo root → http://localhost:8000/

## Test

```bash
node selftest.mjs
```

Checks bank integrity (300 items, tier quotas, unique choices, clear single answer,
passage word caps), sampler invariants (no repeat in run, wave mix, shuffled answer
position), daily-seed determinism, tier reachability + run-length bands via player
simulations, engine math, and the UI copy budget.

## Docs

- `docs/decisions.md` — concept grill (stage 1)
- `docs/scope.md` — scope contract: budgets, systems, non-goals, cut list
- `docs/story.md` — design data: waves, bank design + distractor rules, result tiers, feedback loop
- `docs/build.md` — build log & deviations
