# Game Decisions

> game-idea-grill (Stage 1) — settled 2026-09-20 · working title **«ด่วนภาษา EXPRESS ENGLISH»**
> Origin: express-math feedback issue #3 ("อยากได้เกมภาษาอังกฤษใกล้เคียงด่วนคณิต") — sibling game, new repo
> Genre: **pure arcade English game** (commute, score-chasing) — NOT a story game

## Decisions
<!-- numbered, one line each, in tree order -->

1. โครงเกม = pure arcade English game แนวด่วนคณิต (user issue #3, option A 2026-09-20) — สืบทอด core loop: แตะ 4 ตัวเลือก · time-bank · streak · 4 waves · best + daily
2. Core emotion = flow/streak rush + "รู้ภาษาขึ้น" — ตอบถูกต่อเนื่อง คอมโบขึ้น คำที่เคยผิดโผล่ซ้ำได้ (spiral)
3. Player & session = มือถือ portrait มือเดียว · run 60–120 วิ · session 5–15 นาที — **รวมเด็กประถมเล่นด้วย** (user 2026-09-20) → ความยากเริ่มที่ระดับประถมต้น
4. Input = แตะคำตอบ 4 ตัวเลือกเท่านั้น — ไม่มี typing (สืบทอด)
5. ชนิดโจทย์ 3 ตระกูล (ตาม issue): **จับคำผิด** (ประโยคสั้น เลือกคำ/วลีที่ผิด) · **คำศัพท์ทั่วไป** (EN→ไทย เป็นหลัก; synonym EN→EN เฉพาะ W4) · **context** (mini-passage 2–3 ประโยค ≤40 คำ + ถามใจควาน — เฉพาะ W3–W4, reward +8 วิ) — full passage ยาว → cut list
6. ความยากแมป wave ตามช่วงชั้นไทย (user ปรับ 2026-09-20: เริ่มประถม): **W1 = ป.1–3 · W2 = ป.4–6 · W3 = ม.ต้น (B1) · W4 = ม.ปลาย+ (B1+/B2)** — ใช้กับทั้ง vocab และ grammar
7. คลังโจทย์ = **curated bank ~300 ข้อ** (grammar 120 · vocab 120 · context 60) แทน formula generator — สุ่ม deterministic ด้วย PRNG seed เดิมของ engine · Nexus เขียนคลังทั้งหมด + self-test ตรวจ (choices ไม่ซ้ำ, ถูกชัดเจน 1 ข้อ, ระดับตรง tier)
8. Vocab = คำศัพท์ความถี่สูงตามหลักสูตร (ป.1–3 → ม.ปลาย) ธีมประจำวัน/โรงเรียน/ครอบครัว/เดินทาง — ไม่มีเนื้อหาผู้ใหญ่
9. Meta/replay = localStorage: best + daily (seed รายวัน ทุกเครื่องเหมือนกัน) — ไม่มี backend/account (สืบทอด)
10. Presentation = typography-first + emoji + WebAudio beep ปิดได้ — ธีมรถไฟสายคู่ขนานด่วนคณิต สีธีมต่าง (เขียว/น้ำเงิน vs ส้ม/แดง)
11. Tech = single self-contained zero-dep HTML · file:// + GitHub Pages · reuse engine ด่วนคณิต (core/engine/data separation) [RF-0002]
12. คะแนน/เวลา = ชุดด่วนคณิตก่อน (45 วิ · ผิด −5 · milestone +6 · gate 150/500/1,200 · tier T1–T5) — จูนได้หลัง playtest เพราะโจทย์ภาษาอ่านช้ากว่าคณิต (อาจต้น run 50 วิ) บรรจุไว้ใน scope เป็น tuning knob
13. UI = ไทยล้วน ป้ายน้อยชิ้น อ่านง่ายสำหรับเด็ก · ชื่อเกม «ด่วนภาษา EXPRESS ENGLISH» · repo **`express-english`** (user สร้าง GitHub repo เอง — fine-grained PAT สร้างไม่ได้ [TT-0002]) — สร้างตอน implementation kickoff เท่านั้น
14. Offline = ยอมรับต้องมีเน็ตตอนโหลดใน v1 · PWA → cut list (สืบทอด)

**Pipeline adaptation (เหมือนด่วนคณิต):** `game-scope` ใช้ systems/content budget แทน storylet budget; `game-story-design` แทนด้วย feedback-loop + wave-curve + **bank design** (tier คลัง/สูตร distractor ต่อตระกูลโจทย์); ไม่มี ending matrix (แทนด้วย tier T1–T5)

## Assumptions not yet validated
<!-- what game-scope MUST enforce or check -->

- เด็กประถมเล่น W1 ได้จริง: คำศัพท์/ไวยากรณ์ ป.1–3 ต้องง่ายพอ แต่ไม่หนูกว่าที่ผู้ใหญ่เบื่อ — เช็คด้วย playtest จริง
- คลัง 300 ข้อ พอต่อการไม่ซ้ำเร็ว (สุ่มไม่ซ้ำใน run, หลากหลายระหว่าง run) — scope ต้องคิดเลข variety จริง
- Time-bank ของด่วนคณิตใช้กับโจทย์อ่าน-ตอบได้โดยไม่ต้องแปรรูป loop ใหญ่ (เช็คที่ playtest: run ยังอยู่ 60–120 วิ)
- context ≤40 คำ อ่านจบใน ~8–10 วิ สำหรับ ม.ต้นขึ้นไป — ปรับ reward +8 วิให้คุ้ม
- Distractor "near-miss" ของภาษา = รูปแบบผิดจริง (tense ผิด, คำที่สะกด/เสียงคล้าย, คำแปลสับสน เช่น borrow/lend) — ต้องมีกฎชัดต่อตระกูลใน story.md

## Killed ideas & why

- **English mode ใน express-math (option B):** ต้องแก้สัญญาทั้ง scope (done-state, 6 ชนิดโจทย์, UI budget) — เปลี่ยนตัวตนเกม · ผู้เล่นเดิมโหลดหน้าเดียวได้เฉพาะวิชาเดียวอยู่ดี → แยกเกมใหม่ดีกว่า
- **Typing คำตอบ:** ขัด input contract แตะอย่างเดียว + เด็กพิมพ์ช้า — คง tap-only
