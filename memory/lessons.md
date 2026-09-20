# Lessons (staging) — express-english

## [2026-09-20] Vacuous-pass in answer-match check
- Signal: self-test "served answer matches bank" passed 100% while every bank item lacked `correctIndex` (undefined === undefined).
- Root cause: comparing indexed lookups without asserting the index is valid; missing data can equal missing data.
- Lesson: every equality check on indexed/optional data must first assert the index/field exists (bound + defined).
- Scope: all selftests that verify data through lookups (banks, engines, API fixtures).

## [2026-09-20] Language game economy ≠ math game economy
- Signal: math-game time/score numbers made strong runs 170–240s and T5 unreachable when reused verbatim.
- Root cause: reading time (~+1.5–3s/q) cuts questions-per-run ~30%, so score pace and time drain both shift.
- Lesson: when porting an engine to a new subject, re-tune gates/tiers/rewards via simulation before playtest; never copy numbers blindly.
- Scope: any new sibling game built on an existing engine.
