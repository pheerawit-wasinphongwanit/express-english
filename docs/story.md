# Game Design — ด่วนภาษา EXPRESS ENGLISH
### (Stage 3: game-story-design → adapted เป็น bank + wave curve design ตาม `docs/decisions.md`)

> แหล่งความจริงสำหรับ build: ไฟล์นี้ + `docs/scope.md` — แก้อะไรต้องแก้ที่นี่ก่อน ห้าม code-only edits
> Canon [RF-0002]: explicit trigger ทุก outcome · no dead ends · จำกัด systems

## Premise recap (2 lines)
เกมภาษาอังกฤษ arcade ธีมรถไฟสายด่วนสายคู่ขนานด่วนคณิต: แตะตอบโจทย์อังกฤษให้ทันนาฬิกา time-bank — ถูก = รถวิ่งต่อ, ผิด = เบรกหนัก (และเห็นคำตอบที่ถูก = จำได้ทีหลัง)
ทะลุ 4 สถานี (ป.1–3 → ม.ปลาย+) เก็บสถิติสูงสุด + ด่วนประจำวัน (seed วันที่) · สีธีม: เขียว/น้ำเงิน

## Ending matrix → **Result-tier matrix** (arcade adaptation)

| id | ชื่อ (ธีมรถไฟสายภาษา) | tone | trigger (คะแนน) | foreshadowed by |
|---|---|---|---|---|
| T1 | ผู้โดยสาร 🙂 | อบอุ่น กำลังใจ | < 200 | จบที่ W1–W2 |
| T2 | นักเดินทางตัวจริง 🎫 | พอใจ | 200–499 | ถึง W2–W3 |
| T3 | นักแปลฝึกหัด 📖 | ภูมิใจ | 500–799 | ถึง W3 มั่นคง |
| T4 | วิศวกรสายด่วน ⚡ | มันส์สุดขีด | 800–1,049 | W4 + streak ≥ 20 |
| T5 | หัวรถจักรสองภาษา 🚂 | ตำนาน | ≥ 1,050 | W4 + streak ≥ 35 (mult 8) |
| ★ | แต๊ะ! สถิติใหม่ 🎉 | เปรี้ยวปลายลิ้น | any tier + ทำลาย `best` | overlay บน result ปกติ |

**No dead ends:** run จบจากเวลาหมดเสมอ → ตก tier พอดีเสมอ · ทุก tier พิสูจน์ reach ได้ใน playthrough matrix ล่าง

## Spine (run structure — anchors / tight vs open)

```
BOOT → เมนู (open: เล่นเรื่อยๆ / ด่วนประจำวัน + best + mute + ลิงก์ฟีดแบ็ก→GitHub issue)
→ นับถอย 3-2-1 (tight, 1.5s)
→ W1 (open: วงตอบโจทย์ player-paced) → [คะแนน ≥120] interstitial "🚉 สถานีถัดไป" (tight, 1.5s)
→ W2 (open) → [≥400] → W3 (open — context เข้ามา) → [≥800] → W4 (open, จนเวลาหมด)
→ GAME OVER → หน้าผล (tight) → อีก run / กลับเมนู
```

## Waves (≈ chapters): goal + question mix + สิ่งที่ต่างจาก wave ก่อน

| Wave | goal รู้สึกได้ | mix โจทย์ | เปลี่ยนจากก่อนหน้า |
|---|---|---|---|
| 1 สถานีแรก | อุ่นเครื่อง เด็กเล่นได้ | จับคำผิด 40% · คำศัพท์ 60% | — (ป.1–3: ประโยคสั้นมาก คำพื้นฐาน) |
| 2 ต่างจังหวะ | grammar หนักขึ้น | จับคำผิด 30% · เติมคำ 25% · คำศัพท์ 45% | fill-the-blank โผล่ · คำยาวขึ้น |
| 3 ทางแยก | อ่านบริบทจริง | จับคำผิด 20% · เติมคำ 15% · คำศัพท์ 35% · **context 30%** | context โผล่ (+5 วิ/ข้อ) |
| 4 ปลายทาง | โหมดเทพ | จับคำผิด 15% · เติมคำ 15% · คำศัพท์ 30% · **context 40%** | synonym EN→EN ปนใน vocab · ประโยคซับซ้อน |

## Qualities → **Run-state table** (ทั้งหมดอยู่ใน System #2 ตัวเดียว — เหมือนด่วนคณิต)

| ตัวแปร | ความหมาย | start | range | เปลี่ยนเมื่อ | อ่านโดย |
|---|---|---|---|---|---|
| timeBank | เวลาคงเหลือ | 45 วิ | [0, **50**] | ถูก +wReward (context +5) · ผิด −5 · milestone +6 · ไหล −1/วิ | จบเกมที่ 0 · แถบเวลา |
| score | คะแนนสะสม | 0 | [0,∞) | ถูก +10×wave×mult · milestone +50×wave | wave gate · tier · best |
| streak | ถูกติดต่อ | 0 | [0,∞) | ถูก +1 · ผิด → 0 | multiplier · milestone |
| multiplier | ตัวคูณ | 1 | [1,8] | = 1+⌊streak/5⌋ cap 8 | คะแนน · UI |
| wave | สถานีปัจจุบัน | 1 | [1,4] | score ผ่าน gate 120/400/800 | mix · reward |
| correct/wrong | สถิติรอบ | 0 | [0,∞) | ทุกคำตอบ | หน้าผล |

## Bank design (แทน generator recipes — build เขียนคลังตามนี่ verbatim)

```js
Item = { id, family: "grammar"|"vocab"|"context", tier: 1|2|3|4, form, prompt, passage?, choices[4], correctIndex }
// id ไม่ซ้ำทั้งคลัง · ตัวเลือกไม่ซ้ำในข้อ · correctIndex ชัดเจน 1 ข้อ · sampler สับตำแหน่งตอนเสิร์ฟ (PRNG seed ได้, daily = seed("YYYY-MM-DD")) · no-repeat-in-run
```

### ตระกูล 1 — grammar (120 ข้อ = tier 30/30/30/30) · 2 รูปแบบ

| form | หน้าตา | ใช้ตั้งแต่ |
|---|---|---|
| spot | ประโยค EN สั้น มี 1 จุดผิด — เลือก "คำที่ผิด" จาก 4 คำในประโยค | tier 1 |
| fill | ประโยค EN มี ___ — เลือกคำที่ถูก 4 ตัวเลือก | tier 2 |

**Error taxonomy ตาม tier (จุดผิด = ข้อผิดพลาดจริงของผู้เรียนไทย):**
- **tier1 ป.1–3:** is/are · a/an · เอกพจน์/พหูพจน์ (cat/cats) · he/she · this/these
- **tier2 ป.4–6:** present simple บุรุษที่ 3 (-s) · have/has · past simple เริ่มต้น (go→went) · in/on/at เบื้องต้น
- **tier3 ม.ต้น:** tense ปน (past vs present perfect) · comparative -er/more · some/any · much/many · ลำดับคำในคำถาม
- **tier4 ม.ปลาย+:** passive · reported speech (backshift) · if-clause · relative clause (who/which/that) · gerund vs infinitive (enjoy **doing** / decide **to do**) · the/zero article

**กฎ near-miss distractor:**
- spot: 3 ตัวเลือกที่เหลือ = คำที่**ถูก**ในประโยค แต่ต้อง "น่าสงสัย" — ใช้ content word (คำศัพท์/กริยาหลัก) ใกล้จุดผิด ไม่ใช่คำฟุ่มเฟือย (the/a/to ที่ไม่เกี่ยว) · จุดผิดห้ามอยู่ปลายประโยคเสมอ (สลับตำแหน่ง)
- fill: distractor = รูปอื่นใน word family เดียว (go/goes/went/gone) หรือคู่สับสนจริง (borrow/lend · much/many · some/any) — ห้ามใช้รูปที่ไวยากรณ์แล้วดูผิดชัดเกิน (เช่น "goed")

### ตระกูล 2 — vocab (120 ข้อ = tier 30/30/30/30)

| form | หน้าตา | ใช้ตั้งแต่ |
|---|---|---|
| en→th | คำ EN → เลือกคำแปลไทย 4 ตัวเลือก | tier 1–4 (หลัก) |
| synonym | คำ EN → เลือกคำ EN ใกล้ความหมายที่สุด | tier 4 (ปน ~40% ของ tier) |

- คลังคำ = คำความถี่สูงตามหลักสูตร ป.1–3 (สัตว์/สี/ครอบครัว/อาหาร/ของใช้โรงเรียน) → ป.4–6 (กิจวัตร/เดินทาง/คำกริยาทั่วไป) → ม.ต้น (บริบทประจำวัน/คำ abstract เริ่มต้น) → ม.ปลาย+ (ธุรกิจ/ข่าว/สังคม)
- **กฎ near-miss:** distractor = คำใน **semantic field เดียวกัน** (สัตว์: แมว/หมา/นก/ปลา) หรือคู่สับสนจริง (คำเสียงคล้าย/รูปคล้าย เช่น quiet/quite คำแปล) — ห้ามคำแปล "ไกลโพ้น" ที่เดาไม่ยาก
- ห้ามคำซ้ำในคลัง >2 ข้อ (คำเดียวถามได้ 2 รูป เช่น en→th และ synonym)

### ตระกูล 3 — context (60 ข้อ = tier 30/30) · W3–W4 เท่านั้น

```js
passage: 2–3 ประโยค · ≤40 คำ · เรื่องประจำวัน (โรงเรียน/ซื้อของ/เดินทาง/แผนสุดสัปดาห์)
คำถาม (stem ภาษาไทย): ใจควานหลัก 60% · รายละเอียด 25% · คำในบริบท (เดาความหมายจากบริบท) 15%
```

**กฎ near-miss (taxonomy ข้อสอบอ่านจริง):** (1) จริงแต่ไม่ใช่สิ่งที่ถาม (true-but-not-asked) · (2) ใจควานกลับด้าน/ตรงข้าม · (3) กว้างเกิน/แคบเกินไป — 3 แบบนี้ + คำตอบถูก = 4 ตัวเลือกพอดี

## Feedback loop (หัวใจส่ง emotion "flow/streak" + จังหวะเรียนรู้)

| เหตุการณ์ | ปฏิกิริยาบนจอ + เสียง |
|---|---|
| ตอบถูก | ปุ่มเขียว flash · score ลอยขึ้น · streak เต้น · beep#1 สั้นสูง |
| multiplier ขึ้น (ทุก 5 ถูกติด) | `🔥n ×N` bump · beep#1 พิทช์สูงขึ้นตาม tier |
| milestone ทุก 10 ถูกติด | "++6 วิ ⚡" burst · แถบเวลาเขียวกระพริบ · beep#3 |
| **ตอบผิด** | จอสั่น · ❌ บนปุ่มที่ผิด · **✓ เขียวบนคำตอบถูกค้าง ~1 วิ (โมเมนต์เรียนรู้ — ต่างจากด่วนคณิต)** · "−5 วิ" แดง · streak เส้นประ · beep#2 ต่ำ |
| context โผล่ | การ์ด passage เลื่อนขึ้นก่อนคำถาม · ไอคอน 📖 · ไม่มีเสียงใหม่ (ใช้ beep เดิม) |
| wave-up | interstitial "🚉 สถานีถัดไป" + ชื่อระดับถัดไป (ป.4–6 ฯลฯ) · สีธีมไล่ระดับ · beep#3 |
| เวลาหมด | สั่นหนัก · beep#4 · slow fade → หน้าผล (คะแนนใหญ่ → tier → ถูก/ผิด, streak สูงสุด, สถานี) · ปุ่ม "อีก run" ใหญ่สุด |

**Budget ที่ใช้:** UI copy ไทย = ตั้งเป้า ≤45/60 คำ (นับจริงใน self-test — เผื่อชื่อสถานี "ป.4–6" เพิ่ม) · beeps 4/4 (ถูก/ผิด/milestone-wave/จบ)

## Playthrough matrix (พิสูจน์ทุก tier reach ได้)

| run ตัวอย่าง | พฤติกรรม | ผลคร่าว | จบที่ |
|---|---|---|---|
| "น้องป.3 อุ่นเครื่อง" | W1 อ่านช้า ~9 วิ/ข้อ ผิดบ้าง | ~10 ข้อ ใน ~75 วิ · คะแนน ~140 | T1 ✓ (เด็กเล่น W1 ได้ = ข้อ ship) |
| "พี่ ม.2 ตั้งใจ" | W1–W2 แม่น เริ่มงง context W3 | ~26 ข้อ · streak สูงสุด ~11 · ~650 | T2 ✓ |
| "ผู้ใหญ่สายภาษา" | W1–W4 แม่น streak 40+ mult 8 · context กิน +5 วิช่วยต่อ run | W4: 40×mult/ข้อ · ~1,100+ · ~100–115 วิ | T5 ✓ + สถิติใหม่ ★ |

## Replay-depth / variety check
Free run: seed สุ่มใหม่ · pool ต่อ wave 60/60/90/90 + สับตำแหน่งคำตอบ ×4! → ไม่ซ้ำใน run (บังคับ) · ระหว่าง run โอกาสชนตำแหน่งเดียวกัน ~1–2% · Daily: seed คงที่ต่อวันโดยตั้งใจ · ความลึก replay = best-chasing + daily + "คำที่เคยพลาด จะเจออีกใน pool" (ไม่ใช่ SRS — แค่ธรรมชาติของคลัง)

## Assumed decisions (ใหม่จาก stage นี้ — ค้านได้)

1. grammar มี 2 รูปแบบ (spot ทุก tier · fill เริ่ม tier2) — นับรวมในงบ 120 เท่านั้น
2. context: passage + choices เป็น EN · **คำถาม (stem) เป็นไทย** — เพื่อเด็ก ม.ต้นไม่หลง
3. synonym EN→EN ปนเฉพาะ tier4 ~40% ของ vocab tier4 (12 ข้อ)
4. ตอบผิดแล้วโชว์ ✓ คำตอบถูกค้าง ~1 วิ — เพิ่มโมเมนต์เรียนรู้ ไม่เพิ่ม system
5. **Stage 4 (cast/items/art) ข้าม** — non-goal "ไม่มีรูปภาพ/AI art" → ไม่มี content ให้ออกแบบ (skip ตาม pipeline rule 3 — บันทึกไว้ที่นี่ตามกติกา)
