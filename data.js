// data.js — PURE DATA: mechanical transcription of docs/story.md + docs/scope.md. No logic.
// Editing rule: change docs/story.md FIRST, then mirror here. Never code-only fixes.
(function (global) {
'use strict';

const DATA = {
  // run rules (scope: wave table + tuning knobs; story.md: state table)
  startBankSec: 45,         // scope default; language pacing tuned via rewards (build log)
  maxBankSec: 50,
  wrongPenaltySec: 5,
  milestoneEvery: 10,
  milestoneBonusSec: 6,
  milestoneBonusPts: 50,    // × wave
  basePts: 10,              // score per correct = basePts × wave × multiplier
  contextRewardSec: 5,      // context questions reward more (reading time) — story.md

  // waves (scope wave table + story.md wave mix); gates = score thresholds (tuning knob)
  waves: [
    { name: 'สถานีแรก ป.1–3', tier: 1, gate: 0,    rewardSec: 4, theme: '#34d399',
      mix: { spot: 40, vocab: 60 } },
    { name: 'ป.4–6',         tier: 2, gate: 120,  rewardSec: 3, theme: '#22c55e',
      mix: { spot: 30, fill: 25, vocab: 45 } },
    { name: 'ม.ต้น',         tier: 3, gate: 400,  rewardSec: 2, theme: '#0ea5e9',
      mix: { spot: 20, fill: 15, vocab: 35, context: 30 } },
    { name: 'ปลายทาง ม.ปลาย+', tier: 4, gate: 800, rewardSec: 1, theme: '#6366f1',
      mix: { spot: 15, fill: 15, vocab: 18, syn: 12, context: 40 } },
  ],

  // result tiers (story.md ending→tier matrix; thresholds = tuning knob)
  tiers: [
    { min: 0,    name: 'ผู้โดยสาร',           emoji: '🙂' },
    { min: 200,  name: 'นักเดินทางตัวจริง',   emoji: '🎫' },
    { min: 500,  name: 'นักแปลฝึกหัด',        emoji: '📖' },
    { min: 800,  name: 'วิศวกรสายด่วน',       emoji: '⚡' },
    { min: 1050, name: 'หัวรถจักรสองภาษา',   emoji: '🚂' },
  ],

  // UI copy (Thai) — budget ≤ 60 words total (scope). Audio: 4 beeps max.
  copy: {
    menu:   { title: 'ด่วนภาษา', sub: 'EXPRESS ENGLISH', play: 'เริ่มเล่น', daily: 'ด่วนประจำวัน',
              dailyHint: 'ทั้งวันโจทย์ชุดเดียวกัน เทียบกับเพื่อนได้',
              best: 'สถิติสูงสุด', today: 'วันนี้', hint: 'ถูกได้เวลา ผิดเสียเวลา', feedback: 'ฟีดแบ็ก' },
    play:   { count3: '3', count2: '2', count1: '1', go: 'ไป!', nextStation: 'สถานีถัดไป',
              secBonus: '+6 วิ', secPenalty: '−5 วิ',
              spotHint: 'จับคำที่ผิด', fillHint: 'เติมคำที่ถูก',
              paused: 'หยุดชั่วคราว', tapToResume: 'แตะเพื่อเล่นต่อ' },
    result: { timeUp: 'หมดเวลา', newBest: 'สถิติใหม่!', correct: 'ถูก', wrong: 'ผิด',
              maxStreak: 'สตรีค', stationReached: 'สถานี', again: 'อีกรอบ', menu: 'เมนู' },
  },
  beepCount: 4, // correct / wrong / milestone+wave / gameover

  // localStorage keys (scope: 2 game keys + mute preference)
  keys: { best: 'express-english:best', dailyPrefix: 'express-english:daily:', mute: 'express-english:mute' },

  // feedback intake (shell link, not a system — express-math lineage)
  feedbackUrl: 'https://github.com/pheerawit-wasinphongwanit/express-english/issues/new?labels=feedback&template=feedback.yml',
};

global.EXPRESS_DATA = DATA;
if (typeof module !== 'undefined' && module.exports) module.exports = { DATA };
})(typeof window !== 'undefined' ? window : globalThis);
