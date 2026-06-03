// Generates synthesized bell.wav and chime.wav into assets/sounds/
// Run: node scripts/gen-sounds.js
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets', 'sounds');

function writeWav(filename, samples, sampleRate) {
  const numSamples = samples.length;
  const buf = Buffer.alloc(44 + numSamples * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + numSamples * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);           // PCM
  buf.writeUInt16LE(1, 22);           // mono
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(numSamples * 2, 40);
  for (let i = 0; i < numSamples; i++) {
    buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(samples[i] * 32000))), 44 + i * 2);
  }
  const outPath = path.join(OUT, filename);
  fs.writeFileSync(outPath, buf);
  console.log(`Wrote ${outPath} (${buf.length} bytes)`);
}

const SR = 44100;

// Bell: 880 Hz fundamental with inharmonic partials typical of a small struck bell
// Each partial has its own decay rate — higher partials die faster
function genBell() {
  const dur = 1.2;
  const n = Math.floor(SR * dur);
  const partials = [
    { freq: 880,  amp: 0.50, decay: 4.0 },
    { freq: 1318, amp: 0.30, decay: 6.0 },
    { freq: 2200, amp: 0.15, decay: 9.0 },
    { freq: 3136, amp: 0.08, decay: 14.0 },
  ];
  // Short attack click (gives the "struck" transient)
  const attackSamples = Math.floor(SR * 0.003);
  const samples = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let v = 0;
    for (const p of partials) {
      v += p.amp * Math.exp(-t * p.decay) * Math.sin(2 * Math.PI * p.freq * t);
    }
    // Brief attack envelope
    const env = i < attackSamples ? i / attackSamples : 1;
    samples[i] = v * env;
  }
  return samples;
}

// Chime: lighter, higher, longer ring — two-note (perfect fifth: C6 + G6)
function genChime() {
  const dur = 1.8;
  const n = Math.floor(SR * dur);
  const partials = [
    // Note 1: 1047 Hz (C6)
    { freq: 1047, amp: 0.45, decay: 2.2 },
    { freq: 2093, amp: 0.20, decay: 3.5 },
    { freq: 3140, amp: 0.08, decay: 6.0 },
    // Note 2: 1568 Hz (G6), offset start by 60ms for cascade feel
    { freq: 1568, amp: 0.35, decay: 2.5, offset: 0.06 },
    { freq: 3136, amp: 0.12, decay: 4.0, offset: 0.06 },
  ];
  const attackSamples = Math.floor(SR * 0.002);
  const samples = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let v = 0;
    for (const p of partials) {
      const off = p.offset ?? 0;
      if (t < off) continue;
      const tLocal = t - off;
      const env = tLocal < attackSamples / SR ? tLocal / (attackSamples / SR) : 1;
      v += p.amp * Math.exp(-tLocal * p.decay) * Math.sin(2 * Math.PI * p.freq * tLocal) * env;
    }
    samples[i] = v;
  }
  return samples;
}

writeWav('bell.wav',  genBell(),  SR);
writeWav('chime.wav', genChime(), SR);
console.log('Done.');
