// core.js — PURE game logic: PRNG, bank sampler, run state machine. No DOM, no I/O.
// Tests (selftest.mjs) exercise exactly these functions — the engine only renders.
(function (global) {
'use strict';

/* ---------- deterministic PRNG (mulberry32) + string seed hash ---------- */
function hashSeed(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h >>> 0) || 1;
}
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const randInt = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
function pickWeighted(rng, mix) {
  const keys = Object.keys(mix);
  let total = 0; for (const k of keys) total += mix[k];
  let r = rng() * total;
  for (const k of keys) { r -= mix[k]; if (r < 0) return k; }
  return keys[keys.length - 1];
}
function shuffle(rng, arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ---------- bank sampler (System #1 — docs/story.md "Bank design") ----------
   Item = { id, family:'grammar'|'vocab'|'context', tier:1..4, form,
            prompt, passage?, stem?, choices[4], correctIndex }
   forms: 'spot' | 'fill' (grammar) · 'vocab' | 'syn' (vocab) · 'context'
   Serve-time: pick by wave mix + tier, exclude used ids (no-repeat-in-run),
   shuffle choice position deterministically. */
const FORM_FAMILY = { spot: 'grammar', fill: 'grammar', vocab: 'vocab', syn: 'vocab', context: 'context' };
function pickFrom(rng, pool) { return pool[Math.floor(rng() * pool.length)]; }

function makeQuestion(rng, waveCfg, bank, usedIds) {
  const used = usedIds || new Set();
  const tier = waveCfg.tier;
  const form = pickWeighted(rng, waveCfg.mix);

  const exact = bank.filter((i) => i.form === form && i.tier === tier && !used.has(i.id));
  let pool = exact.length ? exact
    : bank.filter((i) => i.form === form && i.tier === tier);
  if (!pool.length) { // family at same tier, any form
    const fam = FORM_FAMILY[form];
    pool = bank.filter((i) => FORM_FAMILY[i.form] === fam && i.tier === tier && !used.has(i.id));
    if (!pool.length) pool = bank.filter((i) => FORM_FAMILY[i.form] === fam && i.tier === tier);
    if (!pool.length && tier > 1) pool = bank.filter((i) => FORM_FAMILY[i.form] === fam && i.tier === tier - 1);
  }
  if (!pool.length) pool = bank.filter((i) => !used.has(i.id));
  if (!pool.length) pool = bank; // pathological: whole bank used — prefer repeat over crash

  const item = pickFrom(rng, pool);
  const order = shuffle(rng, [0, 1, 2, 3]);
  const choices = order.map((k) => item.choices[k]);
  return {
    id: item.id, family: item.family, form: item.form, tier: item.tier,
    prompt: item.prompt, passage: item.passage || null, stem: item.stem || null,
    choices, correctIndex: order.indexOf(item.correctIndex),
  };
}

/* ---------- run state machine (System #2 — one transition set) ---------- */
function multiplierFrom(streak) { return Math.min(8, 1 + Math.floor(streak / 5)); }
function waveIndexFor(score, waves) {
  let idx = 0;
  for (let i = 0; i < waves.length; i++) if (score >= waves[i].gate) idx = i;
  return idx;
}
function tierFor(score, tiers) {
  let t = tiers[0];
  for (const tier of tiers) if (score >= tier.min) t = tier;
  return t;
}
function newRun(D) {
  return { bank: D.startBankSec, score: 0, streak: 0, maxStreak: 0, mult: 1, wave: 0,
           correct: 0, wrong: 0, over: false, questionsAsked: 0 };
}
function tick(s, D, dtSec) {
  if (s.over) return;
  s.bank -= dtSec;
  if (s.bank <= 0) { s.bank = 0; s.over = true; }
}
// applyAnswer: rewardSec comes from the SERVED question's wave config
// (context questions override to D.contextRewardSec). Multiplier rises WITH the
// new streak (streak 5 → this answer scores ×2). Milestones every N correct.
function applyAnswer(s, D, correct, rewardSec) {
  const events = [];
  const w = D.waves[s.wave];
  const reward = rewardSec != null ? rewardSec : w.rewardSec;
  if (correct) {
    s.correct += 1; s.streak += 1;
    if (s.streak > s.maxStreak) s.maxStreak = s.streak;
    const newMult = multiplierFrom(s.streak);
    if (newMult > s.mult) { events.push('multup'); }
    s.mult = newMult;
    s.score += D.basePts * (s.wave + 1) * s.mult;
    s.bank = Math.min(D.maxBankSec, s.bank + reward);
    if (s.correct % D.milestoneEvery === 0) {
      s.bank = Math.min(D.maxBankSec, s.bank + D.milestoneBonusSec);
      s.score += D.milestoneBonusPts * (s.wave + 1);
      events.push('milestone');
    }
  } else {
    s.wrong += 1; s.streak = 0; s.mult = 1;
    s.bank = Math.max(0, s.bank - D.wrongPenaltySec);
    events.push('wrong');
  }
  const nw = waveIndexFor(s.score, D.waves);
  if (nw > s.wave) { s.wave = nw; events.push('waveup'); }
  if (s.bank <= 0) { s.bank = 0; s.over = true; events.push('over'); }
  return events;
}

const Core = { hashSeed, mulberry32, randInt, pickWeighted, shuffle, makeQuestion, FORM_FAMILY,
              multiplierFrom, waveIndexFor, tierFor, newRun, tick, applyAnswer };

global.EXPRESS_CORE = Core;
if (typeof module !== 'undefined' && module.exports) module.exports = Core;
})(typeof window !== 'undefined' ? window : globalThis);
