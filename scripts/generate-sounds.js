/**
 * Generates bell.wav and chime.wav in assets/sounds/
 * Run: node scripts/generate-sounds.js
 */
const fs   = require('fs');
const path = require('path');

const SAMPLE_RATE     = 44100;
const BITS_PER_SAMPLE = 16;
const CHANNELS        = 1;

function writeWav(filename, samples) {
  const dataLength = samples.length * 2;
  const buf = Buffer.alloc(44 + dataLength);

  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataLength, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(CHANNELS, 22);
  buf.writeUInt32LE(SAMPLE_RATE, 24);
  buf.writeUInt32LE(SAMPLE_RATE * CHANNELS * BITS_PER_SAMPLE / 8, 28);
  buf.writeUInt16LE(CHANNELS * BITS_PER_SAMPLE / 8, 32);
  buf.writeUInt16LE(BITS_PER_SAMPLE, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataLength, 40);

  for (let i = 0; i < samples.length; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  fs.writeFileSync(filename, buf);
  console.log('wrote', path.basename(filename), `(${samples.length} samples)`);
}

function bellSamples(freq = 528, duration = 0.85, amplitude = 0.72, decay = 4.2) {
  const n = Math.round(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    // Add a soft 2nd harmonic (0.18×) for warmth
    out[i] = amplitude * Math.exp(-decay * t) * (
      Math.sin(2 * Math.PI * freq * t) +
      0.18 * Math.sin(2 * Math.PI * freq * 2 * t)
    );
  }
  return out;
}

function chimeSamples() {
  const note1   = bellSamples(784, 0.65, 0.62, 3.8);
  const silence = new Float32Array(Math.round(SAMPLE_RATE * 0.14));
  const note2   = bellSamples(1047, 0.90, 0.56, 3.2);
  const total   = new Float32Array(note1.length + silence.length + note2.length);
  total.set(note1, 0);
  total.set(note2, note1.length + silence.length);
  return total;
}

const outDir = path.join(__dirname, '..', 'assets', 'sounds');
fs.mkdirSync(outDir, { recursive: true });

writeWav(path.join(outDir, 'bell.wav'),  bellSamples());
writeWav(path.join(outDir, 'chime.wav'), chimeSamples());
console.log('Done.');
