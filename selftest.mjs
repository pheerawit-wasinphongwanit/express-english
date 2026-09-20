// selftest.mjs — zero-dependency Node checker. Run: node selftest.mjs
// Adapted from game-build-kit's graph walker for a bank-sampler arcade game:
// instead of storylet/ending reachability we prove BANK integrity, SAMPLER
// invariants, daily-seed determinism, engine math, and TIER reachability +
// run-length bands via simulation.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { DATA } = require('./data.js');
const Core = require('./core.js');
const { GRAMMAR } = require('./bank-grammar.js');
const { VOCAB } = require('./bank-vocab.js');
const { CONTEXT } = require('./bank-context.js');

const BANK = [...GRAMMAR, ...VOCAB, ...CONTEXT];
const byId = new Map(BANK.map((i) => [i.id, i]));

let pass = 0, fail = 0, warn = 0;
const ok = (cond, label, extra = '') => {
  if (cond) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; console.error(`  ✗ FAIL: ${label} ${extra}`); }
};

/* ---------- 1. bank integrity (docs/scope.md bank budget + docs/story.md rules) ---------- */
console.log('\n[1] Bank integrity (300 curated items)');
{
  ok(BANK.length === 300, `bank total = 300 (${BANK.length})`);
  ok(GRAMMAR.length === 120 && VOCAB.length === 120 && CONTEXT.length === 60,
    `families 120/120/60 (${GRAMMAR.length}/${VOCAB.length}/${CONTEXT.length})`);
  const cnt = (f, t) => BANK.filter((i) => i.family === f && i.tier === t).length;
  for (let t = 1; t <= 4; t++) ok(cnt('grammar', t) === 30 && cnt('vocab', t) === 30, `tier ${t}: grammar 30 + vocab 30 (${cnt('grammar', t)}/${cnt('vocab', t)})`);
  ok(cnt('context', 3) === 30 && cnt('context', 4) === 30, `context tier 3/4 = 30/30 (${cnt('context', 3)}/${cnt('context', 4)})`);
  const forms = { t1: GRAMMAR.filter((i) => i.tier === 1 && i.form === 'spot').length,
                  t2s: GRAMMAR.filter((i) => i.tier === 2 && i.form === 'spot').length,
                  t2f: GRAMMAR.filter((i) => i.tier === 2 && i.form === 'fill').length,
                  t3s: GRAMMAR.filter((i) => i.tier === 3 && i.form === 'spot').length,
                  t3f: GRAMMAR.filter((i) => i.tier === 3 && i.form === 'fill').length,
                  t4s: GRAMMAR.filter((i) => i.tier === 4 && i.form === 'spot').length,
                  t4f: GRAMMAR.filter((i) => i.tier === 4 && i.form === 'fill').length,
                  syn: VOCAB.filter((i) => i.form === 'syn').length };
  ok(forms.t1 === 30, `tier1 spot-only = 30 (${forms.t1})`);
  ok(forms.t2s === 16 && forms.t2f === 14, `tier2 spot/fill = 16/14 (${forms.t2s}/${forms.t2f})`);
  ok(forms.t3s === 14 && forms.t3f === 16, `tier3 spot/fill = 14/16 (${forms.t3s}/${forms.t3f})`);
  ok(forms.t4s === 12 && forms.t4f === 18, `tier4 spot/fill = 12/18 (${forms.t4s}/${forms.t4f})`);
  ok(forms.syn === 12, `tier4 synonym = 12 (${forms.syn})`);
  ok(VOCAB.filter((i) => i.tier === 4 && i.form === 'vocab').length === 18, 'tier4 en→th = 18');

  ok(new Set(BANK.map((i) => i.id)).size === 300, 'ids unique (300)');
  const prompts = BANK.filter((i) => i.prompt).map((i) => i.prompt);
  ok(new Set(prompts).size === prompts.length, `prompts unique (${prompts.length})`);
  ok(new Set(CONTEXT.map((i) => i.passage)).size === 30 + 30 - 0, 'context passages unique');

  let badShape = 0, badSpot = 0, badFill = 0, badCtx = 0, badLang = 0;
  for (const it of BANK) {
    if (it.choices.length !== 4 || new Set(it.choices.map((c) => c.toLowerCase())).size !== 4) badShape++;
    if (it.correctIndex !== 0) badShape++; // authoring convention
    if (it.family === 'grammar' && it.form === 'spot') {
      for (const c of it.choices) {
        if (!new RegExp(`(^|[^A-Za-z])${c.replace(/[^A-Za-z']/g, '')}([^A-Za-z']|$)`, 'i').test(it.prompt)) badSpot++;
      }
      if (it.prompt.includes('___')) badSpot++;
    }
    if (it.family === 'grammar' && it.form === 'fill' && !it.prompt.includes('___')) badFill++;
    if (it.family === 'context') {
      const words = it.passage.trim().split(/\s+/).length;
      const sentences = it.passage.split(/(?<=[.!?])\s+/).filter((s) => s.trim()).length;
      if (words > 40 || sentences < 2 || sentences > 3) badCtx++;
      if (!it.stem || !it.choices.every((c) => c && c.length > 0)) badCtx++;
    }
    if (it.family === 'vocab' && it.form === 'vocab' && !it.choices.every((c) => /[ก-๙]/.test(c))) badLang++;
    if (it.family === 'vocab' && it.form === 'syn' && !it.choices.every((c) => /^[A-Za-z ]+$/.test(c))) badLang++;
  }
  ok(badShape === 0, `every item: 4 distinct choices + correctIndex convention (${badShape} bad)`);
  ok(badSpot === 0, `spot: all 4 choice words appear in the sentence (${badSpot} bad)`);
  ok(badFill === 0, `fill: prompt contains ___ (${badFill} bad)`);
  ok(badCtx === 0, `context: passage ≤40 words, 2–3 sentences, stem present (${badCtx} bad)`);
  ok(badLang === 0, `vocab en→th choices Thai · syn choices English (${badLang} bad)`);
}

/* ---------- 2. sampler invariants ---------- */
console.log('\n[2] Sampler invariants (2,000 serves per wave)');
{
  const N = 2000;
  for (let w = 0; w < DATA.waves.length; w++) {
    const cfg = DATA.waves[w];
    const rng = Core.mulberry32(1000 + w);
    const counts = {}; let bad = 0, badTier = 0;
    for (let i = 0; i < N; i++) {
      const q = Core.makeQuestion(rng, cfg, BANK);
      counts[q.form] = (counts[q.form] || 0) + 1;
      const item = byId.get(q.id);
      if (!item) bad++;
      else if (!(q.correctIndex >= 0 && q.correctIndex <= 3) || q.choices[q.correctIndex] !== item.choices[item.correctIndex]) bad++; // shuffle keeps the right answer marked (guards undefined==undefined)
      if (q.tier !== cfg.tier) badTier++;
      if (new Set(q.choices).size !== 4) bad++;
    }
    ok(bad === 0, `wave ${w + 1}: served answer text matches bank + 4 distinct choices (${bad} bad)`);
    ok(badTier === 0, `wave ${w + 1}: tier ${cfg.tier} items only (${badTier} leaks)`);
    // mix adherence ±10pp (weights sum to 100 per wave)
    for (const [form, weight] of Object.entries(cfg.mix)) {
      const got = (counts[form] || 0) / N * 100;
      ok(Math.abs(got - weight) <= 10, `wave ${w + 1} mix ${form}: ${got.toFixed(1)}% ≈ ${weight}%`);
    }
    for (const form of ['spot', 'fill', 'vocab', 'syn', 'context']) {
      if (!cfg.mix[form]) ok(!(counts[form] > 0), `wave ${w + 1}: ${form} never served (weight 0)`);
    }
  }
  // no-repeat-in-run over a very long run
  {
    const rng = Core.mulberry32(4242);
    const used = new Set(); let dup = 0;
    for (let i = 0; i < 120; i++) {
      const q = Core.makeQuestion(rng, DATA.waves[i % 4], BANK, used);
      if (used.has(q.id)) dup++;
      used.add(q.id);
    }
    ok(dup === 0, `no repeat within a 120-question run (${dup} dups)`);
  }
}

/* ---------- 3. daily-seed determinism ---------- */
console.log('\n[3] Determinism: same seed → identical question sequence');
{
  const run = (seed) => {
    const rng = Core.mulberry32(seed);
    const out = []; const used = new Set();
    let s = Core.newRun(DATA);
    for (let i = 0; i < 100 && !s.over; i++) {
      const q = Core.makeQuestion(rng, DATA.waves[s.wave], BANK, used);
      used.add(q.id);
      out.push(q.id + '|' + q.choices.join(','));
      const reward = q.form === 'context' ? DATA.contextRewardSec : undefined;
      Core.applyAnswer(s, DATA, rng() < 0.9, reward);
    }
    return out;
  };
  const a = run(Core.hashSeed('express-english:2026-09-20'));
  const b = run(Core.hashSeed('express-english:2026-09-20'));
  const c = run(Core.hashSeed('express-english:2026-09-21'));
  ok(JSON.stringify(a) === JSON.stringify(b), 'same date seed → identical sequence');
  ok(JSON.stringify(a) !== JSON.stringify(c) || a.length < 100, 'different date seed → different sequence');
}

/* ---------- 4. engine math (incl. context reward) ---------- */
console.log('\n[4] Multiplier + time-bank math');
{
  ok(Core.multiplierFrom(0) === 1 && Core.multiplierFrom(4) === 1, 'streak 0–4 → ×1');
  ok(Core.multiplierFrom(5) === 2 && Core.multiplierFrom(9) === 2, 'streak 5–9 → ×2');
  ok(Core.multiplierFrom(35) === 8 && Core.multiplierFrom(999) === 8, 'capped at ×8');
  const s = Core.newRun(DATA);
  for (let i = 0; i < 7; i++) Core.applyAnswer(s, DATA, true);
  Core.applyAnswer(s, DATA, false);
  ok(s.streak === 0 && s.mult === 1, 'wrong answer resets streak + multiplier');
  ok(s.bank === Math.max(0, Math.min(DATA.maxBankSec, DATA.startBankSec + 7 * DATA.waves[0].rewardSec) - DATA.wrongPenaltySec), 'bank math: rewards (capped) then −5 penalty');
  const t = Core.newRun(DATA);
  const before = t.bank;
  Core.applyAnswer(t, DATA, true, DATA.contextRewardSec);
  ok(t.bank === Math.min(DATA.maxBankSec, before + DATA.contextRewardSec), `context reward override +${DATA.contextRewardSec}s`);
}

/* ---------- 5. simulation: tier reachability + run-length bands ---------- */
console.log('\n[5] Player simulations (300 seeds each — language reading is slower than math)');
const MODELS = [
  { name: 'weak   (acc .60, ~8.6s/q)', acc: 0.60, base: 7.6, perWave: 0.5 },
  { name: 'mid    (acc .85, ~6.7s/q)', acc: 0.85, base: 5.9, perWave: 0.5 },
  { name: 'strong (acc .97, ~5.5s/q)', acc: 0.97, base: 4.7, perWave: 0.4 },
];
function simulate(model, seed) {
  const rng = Core.mulberry32(seed);
  const s = Core.newRun(DATA);
  const used = new Set();
  let t = 0;
  while (!s.over) {
    const q = Core.makeQuestion(rng, DATA.waves[s.wave], BANK, used);
    used.add(q.id);
    const elapsed = model.base + s.wave * model.perWave + rng() * 1.5 + (q.form === 'context' ? 3 : 0);
    Core.tick(s, DATA, elapsed);
    if (s.over) break;
    const reward = q.form === 'context' ? DATA.contextRewardSec : undefined;
    Core.applyAnswer(s, DATA, rng() < model.acc, reward);
    t += elapsed;
  }
  return { t, score: s.score, wave: s.wave, tier: DATA.tiers.indexOf(Core.tierFor(s.score, DATA.tiers)) };
}
const results = {};
const med = (arr) => { const a = [...arr].sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; };
for (const m of MODELS) {
  const runs = [];
  for (let i = 0; i < 300; i++) runs.push(simulate(m, 7919 * i + 13));
  results[m.name] = runs;
  const ts = runs.map((r) => r.t);
  console.log(`  · ${m.name}: median run ${med(ts).toFixed(0)}s · scores ${Math.min(...runs.map(r => r.score))}–${Math.max(...runs.map(r => r.score))} · best wave ${Math.max(...runs.map(r => r.wave)) + 1}/4`);
  ok(Math.max(...ts) <= 150, `${m.name}: no run exceeds 150s (max ${Math.max(...ts).toFixed(0)}s)`);
}
ok(med(results[MODELS[0].name].map(r => r.t)) >= 40, 'weak model survives ≥ 40s (median)');
ok(med(results[MODELS[1].name].map(r => r.t)) >= 60 && med(results[MODELS[1].name].map(r => r.t)) <= 125, 'mid model median in [60,125]s');
ok(med(results[MODELS[2].name].map(r => r.t)) >= 60 && med(results[MODELS[2].name].map(r => r.t)) <= 125, 'strong model median in [60,125]s');
{
  const all = Object.values(results).flat();
  for (let ti = 0; ti < DATA.tiers.length; ti++) {
    ok(all.some((r) => r.tier === ti), `tier T${ti + 1} (${DATA.tiers[ti].name}) reached by some simulated player`);
  }
  ok(results[MODELS[2].name].some((r) => r.wave === 3), 'strong model reaches wave 4 (gate ' + DATA.waves[3].gate + ')');
  ok(results[MODELS[0].name].every((r) => r.tier <= 1), 'weak model never exceeds T2 (no fake achievement)');
}

/* ---------- 6. budgets (scope contract) ---------- */
console.log('\n[6] Budgets (docs/scope.md)');
{
  const tokens = [];
  const collect = (o) => { for (const v of Object.values(o)) typeof v === 'string' ? tokens.push(...v.split(/\s+/).filter(Boolean)) : collect(v); };
  collect(DATA.copy);
  for (const w of DATA.waves) tokens.push(...w.name.split(/\s+/));
  for (const t of DATA.tiers) tokens.push(...t.name.split(/\s+/));
  ok(tokens.length <= 60, `UI copy ≤ 60 words (${tokens.length})`);
  ok(DATA.beepCount <= 4, `beeps ≤ 4 (${DATA.beepCount})`);
  ok(DATA.waves.length === 4, 'exactly 4 waves (scope)');
  ok(DATA.tiers.length === 5, '5 result tiers');
  const screens = ['menu', 'play', 'result'];
  const html = await (await import('node:fs/promises')).readFile('./index.html', 'utf8');
  ok(screens.every((s) => html.includes(`id="${s}"`)), '3 screens (menu/play/result) in shell');
  ok(html.includes('bank-grammar.js') && html.includes('bank-vocab.js') && html.includes('bank-context.js'), 'bank files wired into shell');
}

/* ---------- summary ---------- */
console.log(`\n===== SELF-TEST: ${pass} passed, ${fail} failed, ${warn} warn =====`);
process.exit(fail === 0 ? 0 : 1);
