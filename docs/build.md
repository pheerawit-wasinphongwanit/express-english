# Build Log — ด่วนภาษา EXPRESS ENGLISH

## What shipped (files + how to run)

Origin: express-math feedback issue #3 (option A: sibling game, new repo) → pipeline
game-idea-grill → game-scope → game-story-design (adapted: bank design) → game-build-kit.
Stage 4 (cast/items/art) skipped — non-goal "no images" (recorded in story.md §Assumed decisions 5).

```
index.html        # shell: 3 screens (menu/play/result), passage card, form hints — zero-dep
core.js           # PRNG + bank sampler (System #1) + run-state machine (System #2)
data.js           # run rules, waves, tiers, UI copy (44/60 words), keys — pure data
bank-grammar.js   # 120 items (spot/fill × tier 1–4, Thai-learner error taxonomy)
bank-vocab.js     # 120 items (en→th tier 1–4 + 12 synonym at tier 4)
bank-context.js   # 60 items (mini-passage ≤40 words + Thai stem + EN choices, tier 3–4)
selftest.mjs      # zero-dep Node checker — run: node selftest.mjs
docs/             # decisions / scope / story (source of truth) / build (this file)
.github/          # feedback intake: issue template + ack/notify workflow (express-math lineage)
```

Run: open `index.html` (file:// works offline) · Test: `node selftest.mjs` (77 checks).

## Self-test results (tuning round 1, 2026-09-20)

```
===== SELF-TEST: 77 passed, 0 failed, 0 warn =====
weak   (acc .60, ~8.6s/q): median run 42s · scores 0–160   · best wave 2/4
mid    (acc .85, ~6.7s/q): median run 69s · scores 10–620  · best wave 3/4
strong (acc .97, ~5.5s/q): median run 101s · scores 90–1180 · best wave 4/4
```

All bands pass: weak ≥40s · mid/strong median in [60,125]s · max ≤150s · every tier T1–T5
reached by some simulated player · strong reaches W4 · weak never exceeds T2.

## Tuning decisions (via self-test, per scope's tuning-knob clause)

Language questions read slower than math (~30% fewer questions per run), so the math-game
numbers were re-tuned **within the declared knobs** (rewards / context reward / gates / tiers):

| Knob | Design draft | Shipped | Why |
|---|---|---|---|
| start bank | 45 วิ | 45 | unchanged |
| wave rewards | +4/+3/+2/+1 | same | unchanged |
| context reward | +8 วิ | **+5 วิ** | +8 let strong players chain contexts into 170–240s runs (over the 150s cap) |
| wave gates | 150/500/1,200 | **120/400/800** | fewer questions per run → gates must arrive earlier or W4 is unreachable |
| tier cutoffs | 300/900/1,500/2,600 | **200/500/800/1,050** | same reason; T5 stays rare-but-reachable (strong max ≈1,180 over 300 seeds) |
| milestone | +6 วิ / 10 ถูกติด | same | scope contract, not a knob — kept |

All tuned values are mirrored in `docs/story.md` + `docs/scope.md` + `data.js` (no code-only edits).

## Deviations from story.md

1. **correctIndex field added to every bank item** (= 0, correct-first authoring convention):
   story.md's item schema listed it; initial write omitted it and the self-test's
   answer-match check passed vacuously (undefined === undefined). Fixed by adding the field
   AND hardening the check (`correctIndex` must be 0–3). Lesson logged in memory/lessons.md.
2. Sentence counting in the self-test uses lookbehind split (a.m. / 2.1% are not sentence
   breaks) — test-only refinement, no content change.

## Hosting

- GitHub Pages เปิดจาก `main` (root) — live: https://pheerawit-wasinphongwanit.github.io/express-english/ (deploy 2026-09-20, user-confirmed)
- ตรวจ post-deploy: HTTP 200 ทั้ง index + 6 ไฟล์ js · title ถูกต้อง

## Playtest notes & fixes

- **Round 1 (2026-09-20, user):** เปิดจากลิงก์ Pages ได้ (ครั้งแรกเจอ 404 จากแคชช่วง provisioning ~30 วิ — แก้ด้วย cache-busted URL) · ผู้เล่นยืนยันเข้าเล่นได้และอนุมัติปิด origin issue (#3 express-math) · run เต็ม/kid-W1/daily ทยอยเล่นจริงต่อ — พบปัญหาตรงไหนแจ้งผ่าน feedback intake ได้เลย
- Origin issue #3 closed: https://github.com/pheerawit-wasinphongwanit/express-math/issues/3#issuecomment-5748241012
