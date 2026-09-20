# Game Scope — ด่วนภาษา EXPRESS ENGLISH

> game-scope (Stage 2) · adapted สำหรับ arcade ตาม `docs/decisions.md` · canon [RF-0002]
> Contract rule: build อาจไป **ต่ำกว่า** budget ได้ แต่ **เกินไม่ได้เด็ดขาด**

## Done state (one sentence + playtest definition of shipped)

**หนึ่งประโยค:** เกมภาษาอังกฤษ arcade บนมือถือ — แตะตอบโจทย์ 4 ตัวเลือก (จับคำผิด · คำศัพท์ · ใจความจากบริบท) กับนาฬิกา time-bank, run ละ 60–120 วิ ผ่าน 4 สถานี (waves ป.1→ม.ปลาย+), เก็บสถิติสูงสุด + ด่วนประจำวันในเครื่อง, เปิดจากไฟล์ HTML เดียว zero-dep ได้ทั้งมือถือ/เดสก์ท็อป

**"Shipped" = playtest ผ่านทั้งหมด:**
1. ผู้เล่นจริง (เจ้าของเกม) เล่นจบ ≥1 run บนมือถือ — run ยาวเข้ากรอบ 60–120 วิ
2. **เด็ก (กลุ่มเป้าหมายประถม) เล่น W1 ได้จริง** — อ่านเข้าใจ ตอบได้ ไม่หนีจากเกม (assumption จาก decisions.md ข้อ 3)
3. Best score บันทึก/โชว์ถูก · daily run วันเดียวกันได้ลำดับโจทย์ชุดเดียวกันทุกเครื่อง (seed วันที่)
4. สลับแท็บกลาง run → เวลาหยุดอัตโนมัติ · Self-test ในไฟล์ 100% เขียว

## Rule of halves (บันทึกตรงไปตรงมา)

Draft แรก: คลัง 600 ข้อ · SRS ทบทวนคำผิด · passage เต็ม · listening — ครึ่งแรก: 300 · ไม่มี SRS · mini-passage · ไม่มีเสียงพูด → ครึ่งสอง: **300 ข้อ (120/120/60) · ไม่มีระบบใหม่เพิ่ม · mini-passage ≤40 คำคงอยู่** — นอกนี้ถูกครึ่งจนเหลือ 0

## Budgets

| Dimension | Budget (v1) |
|---|---|
| Playtime | run 60–120 วิ · session 5–15 นาที (~3–6 runs + daily) |
| Waves (สถานี) | 4: ป.1–3 · ป.4–6 · ม.ต้น · ม.ปลาย+ |
| ตระกูลโจทย์ | 3: จับคำผิด · คำศัพท์ · context |
| **คลังโจทย์ (curated)** | **300 ข้อ**: grammar 120 (tier 1234 = 30/30/30/30) · vocab 120 (30/30/30/30) · context 60 (tier 34 = 30/30) |
| Screens | 3: เมนู · เล่น · ผล |
| UI copy ไทย | ≤ 60 คำ (อ่านง่ายสำหรับเด็ก) |
| SFX | ≤ 4 beeps (WebAudio, ปิดได้, จำสถิติ mute) |
| Meta/persistence | localStorage 2 keys (`best`, `daily:<YYYY-MM-DD>`) |
| Endings | tier T1–T5 (ความหมายเดียวกับด่วนคณิต — arcade "ending" = อันดับจบ run) |

**Variety math (พิสูจน์ assumption คลังพอ):** run หนึ่งแสดง ~12–35 ข้อ · สร้าง pool ต่อ tier: W1 = 60 (grammar30+vocab30) · W2 = 60 · W3 = 90 (30+30+context30) · W4 = 90 → **ไม่มีข้อซ้ำใน run เดียว (sampler บังคับ)** · ระหว่าง run โอกาสชนกันในตำแหน่งเดียวกัน ≈ 1/pool (~1.1–1.7%) ต่อ slot — ยอมรับได้ใน v1 · daily = seed คงที่ต่อวันโดยตั้งใจ

## Systems allowed (≤2, named)

1. **Bank sampler** — deterministic PRNG (seed ได้) + คลัง tier-tagged + กฎ mix ต่อ wave + no-repeat-in-run + สับตำแหน่งคำตอบ
2. **Run-state mechanic** — state machine เดียว: time-bank + streak multiplier + wave progression + score อัปเดตจาก transition ถูก/ผิด (reuse โครงด่วนคณิต)

**Shell (scaffolding ไม่ใช่ system, มี cap แข็ง):** 3 screens · localStorage read/write ตรง ๆ · beep player — ห้ามงอกเกิน cap

## Wave table + tuning knobs (ล็อก ณ scope — ปรับได้หลัง playtest ถ้า run หลุดกรอบ 60–120 วิ)

| Wave | ระดับ | ถูกได้เวลา | เงื่อนไขเข้า wave |
|---|---|---|---|
| 1 สถานีแรก | ป.1–3 (A1) | +4 วิ | เริ่มเกม |
| 2 | ป.4–6 (A2) | +3 วิ | คะแนน ≥ 120 |
| 3 | ม.ต้น (B1) | +2 วิ · context +5 วิ | ≥ 400 |
| 4 ปลายทาง | ม.ปลาย+ (B1+/B2) | +1 วิ · context +5 วิ | ≥ 800 |

- เริ่ม run: เวลา **45 วิ** · ผิด: −5 วิ + รีเซ็ตสตรีค · milestone ทุก 10 ถูกติด: +6 วิ + โบนัส 50×wave · เพดานเวลา 50 วิ
- คะแนน/ข้อ = 10 × wave × multiplier · multiplier = 1 + ⌊streak/5⌋ สูงสุด 8 · tier T1–T5 = <200 / 200–499 / 500–799 / 800–1,049 / ≥1,050 (จูนด้วย self-test แล้ว — โจทย์ภาษาทำข้อได้น้อยกว่าคณิต ~30%)
- **Tuning knobs (ปรับได้หลัง playtest โดยไม่ถือว่าแก้สัญญา):** เวลาต้น run 45→50 · reward ต่อ wave · context +5 · gate 120/400/800 · เกณฑ์ tier — ทุกตัวต้องผ่าน self-test + playtest ยืนยันกรอบ 60–120 วิ
- โจทย์ทุกข้อ: คำตอบถูกชัดเจน 1 ข้อเดียว · ตัวเลือกไม่ซ้ำ · ไม่มีคำหยาบ/เนื้อหาผู้ใหญ่ · context ≤ 40 คำ

## Non-goals (ชัดเจนว่า "ไม่ทำ" ไม่ใช่ลืม)

- ไม่มี typing/keypad — แตะ 4 ตัวเลือกเท่านั้น (เด็กพิมพ์ช้า)
- ไม่มี SRS/spaced repetition หรือระบบทบทวนคำผิด (เป็น system ที่ 3 — ไป cut list)
- ไม่มี full passage ยาว · ไม่มี listening/เสียงพูด (TTS)
- ไม่มี accounts, backend, leaderboard ออนไลน์
- ไม่มี adaptive difficulty, ไม่มี tutorial
- ไม่มีรูปภาพ/AI art — typography + emoji เท่านั้น
- ไม่มี settings screen (ปุ่ม mute ประจำเมนู/หน้าเล่น) · ไม่มีปุ่ม pause มือ (auto-pause เท่านั้น)
- ไม่มี "โหมดเด็ก" แยก — ความง่ายของเด็กมาจาก W1 ป.1–3 อย่างเดียว
- ไม่มี EN UI / localization · ไม่มีผสมโจทย์คณิต

## Cut list (ดึงขึ้นมาได้เฉพาะเมื่อเกมเสร็จก่อนงบ)

1. PWA offline (service-worker cache)
2. แชร์การ์ดคะแนน daily (Web Share API)
3. SRS ทบทวนคำที่ตอบผิด (deck ส่วนตัว)
4. TTS อ่านโจทย์/คำศัพท์ (pronunciation)
5. Listening comprehension (เสียง + ตัวเลือก)
6. Adaptive difficulty · ปุ่ม pause มือ · haptics · ปฏิทิน streak รายสัปดาห์
7. ขยายคลัง 300 → 600 ข้อ (ชุดธุรกิจ/TOEIC-lite)
8. EN UI toggle

## Done checklist

- [ ] Single self-contained HTML เปิดจาก file:// ได้ทั้งมือถือ (portrait, thumb-zone) และเดสก์ท็อป [RF-0002]
- [ ] คลัง 300 ข้อครบตามตาราง tier · ทุกข้อ: ตัวเลือกไม่ซ้ำ · ถูกชัดเจน 1 ข้อ · tier-tag ตรง — พิสูจน์ด้วย self-test ในไฟล์
- [ ] Sampler: ไม่ซ้ำใน run · mix ตาม wave · สับตำแหน่งคำตอบ · deterministic (daily วันเดียวกัน = ลำดับเดียวกันทุกเครื่อง)
- [ ] Time-bank 45 / +1–4 (+5 context) / −5 / milestone +6 — run จริงอยู่ใน 60–120 วิ (playtest ยืนยัน)
- [ ] Multiplier 1→8 ทุก 5 ถูกติด · รีเซ็ตเมื่อผิด · wave gates 120/400/800 · tier T1–T5 ทำงานถูก
- [ ] localStorage: `best` + `daily:<date>` · mute จำได้ · auto-pause เมื่อ visibilitychange
- [ ] UI ไทย ≤ 60 คำ · beeps ≤ 4 · ไม่มี asset ภายนอก
- [ ] Playtest ผ่านครบ 4 ข้อของนิยาม shipped — **รวมเด็กเล่น W1**
