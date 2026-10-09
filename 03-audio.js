/* Asso dei Cieli - Gelu inc. | audio: effetti sonori, motore, musica */

/* ---------- audio ---------- */
let ac = null, muted = !!load('asso-muted', false);
function initAudio(){
  if (!ac){ try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){ ac = null; } }
  if (ac && ac.state === 'suspended') ac.resume();
  musicInit();
  engineInit();
}
// engine drone: a low sawtooth with a little flutter, only while flying
const engine = { gain: null, osc: null };
function engineInit(){
  if (!ac || engine.osc) return;
  const o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain();
  o.type = 'sawtooth'; o.frequency.value = 62;
  f.type = 'lowpass'; f.frequency.value = 280;
  g.gain.value = 0;
  lfo.frequency.value = 7; lg.gain.value = 3;
  lfo.connect(lg).connect(o.frequency);
  o.connect(f).connect(g).connect(sfxOut());
  o.start(); lfo.start();
  engine.osc = o; engine.gain = g;
}
function engineTick(){
  if (!engine.osc) return;
  const on = (state === 'play' || state === 'land') && !S.dead && !muted;
  engine.gain.gain.setTargetAtTime(on ? 0.05 : 0, ac.currentTime, 0.15);
  if (on && state === 'land' && LD){ engine.osc.frequency.setTargetAtTime(40 + LD.v / k * 0.16, ac.currentTime, 0.2); return; }
  if (on) engine.osc.frequency.setTargetAtTime(62 + Math.abs(S.p.bank) * 18 + (S.ab ? 14 : 0), ac.currentTime, 0.2);
}
let sfxBus = null;
function sfxOut(){
  if (!sfxBus){ sfxBus = ac.createGain(); sfxBus.gain.value = SET.sfx / 100; sfxBus.connect(ac.destination); }
  return sfxBus;
}
function tone(freq, dur, type='square', vol=0.05, slide=0, delay=0){
  if (!ac || muted) return;
  const t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(sfxOut()); o.start(t); o.stop(t + dur);
}
function noise(dur, vol=0.15, freq=900){
  if (!ac || muted) return;
  const len = Math.floor(ac.sampleRate * dur), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random()*2-1) * (1 - i/len) ** 2;
  const src = ac.createBufferSource(), g = ac.createGain(), f = ac.createBiquadFilter();
  f.type = 'lowpass'; f.frequency.value = freq;
  src.buffer = buf; g.gain.value = vol;
  src.connect(f).connect(g).connect(sfxOut()); src.start();
}
const sfx = {
  shoot: () => tone(880, 0.05, 'square', 0.012, -300),
  hit:   () => tone(300, 0.06, 'square', 0.03, -120),
  boom:  () => noise(0.35, 0.18),
  // a different explosion for each kind of enemy
  kill_f: () => { noise(0.25, 0.16, 1400); tone(420, 0.12, 'square', 0.025, -300); },
  kill_w: () => { noise(0.3, 0.16, 1100); tone(520, 0.18, 'triangle', 0.04, -380); },
  kill_k: () => { noise(0.3, 0.2, 900); tone(900, 0.25, 'sawtooth', 0.03, -820); },
  kill_h: () => { noise(0.45, 0.22, 700); for (let i = 0; i < 3; i++) tone(110, 0.06, 'square', 0.05, -30, i * 0.07); },
  kill_m: () => { tone(1500, 0.08, 'triangle', 0.05); noise(0.3, 0.18, 1600); },
  kill_b: () => { noise(0.7, 0.25); tone(90, 0.5, 'sawtooth', 0.06, -50); },
  kill_n: () => { noise(1.2, 0.3, 380); tone(55, 1, 'sawtooth', 0.08, -25); tone(70, 0.6, 'square', 0.04, -30, 0.25); },
  special: () => { tone(330, 0.25, 'sawtooth', 0.05, 660); tone(660, 0.3, 'triangle', 0.06, 660, 0.1); noise(0.4, 0.12, 2500); },
  thunder: () => { noise(1.8, 0.35, 220); noise(0.6, 0.15, 900); },
  alarm:  () => { tone(880, 0.12, 'square', 0.035); tone(660, 0.12, 'square', 0.035, 0, 0.14); },
  big:   () => { noise(0.7, 0.25); tone(90, 0.5, 'sawtooth', 0.06, -50); },
  bomb:  () => { noise(1.1, 0.35, 600); tone(60, 0.9, 'sawtooth', 0.08, -30); },
  pick:  () => { tone(660, 0.08, 'triangle', 0.08); tone(990, 0.12, 'triangle', 0.08, 0, 0.07); },
  coin:  () => { tone(1320, 0.06, 'square', 0.025); tone(1760, 0.08, 'square', 0.025, 0, 0.05); },
  buy:   () => { [660, 880, 1320].forEach((f, i) => tone(f, 0.1, 'triangle', 0.08, 0, i*0.07)); },
  deny:  () => tone(160, 0.15, 'square', 0.05),
  shield:() => tone(520, 0.2, 'triangle', 0.07, 300),
  dash:  () => tone(700, 0.35, 'sawtooth', 0.04, -500),
  arm:   () => tone(1200, 0.05, 'square', 0.03),
  hurt:  () => { tone(200, 0.3, 'sawtooth', 0.08, -150); noise(0.3, 0.15); },
  warn:  () => { for (let i = 0; i < 3; i++){ tone(440, 0.18, 'square', 0.05, 0, i*0.3); tone(330, 0.18, 'square', 0.05, 0, i*0.3 + 0.15); } },
  win:   () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, 'triangle', 0.08, 0, i*0.11)); }
};
const ICON_SOUND = '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 8.5a5 5 0 0 1 0 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
const ICON_MUTE  = '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
function renderMute(){
  $('muteBtn').innerHTML = muted ? ICON_MUTE : ICON_SOUND;
  $('muteBtn').setAttribute('aria-label', muted ? 'Attiva audio' : 'Disattiva audio');
  for (const t of document.querySelectorAll('.music-toggle')) t.setAttribute('aria-pressed', String(musicOn));
  applyMusicVolume();
}

/* ---------- music: a small step sequencer, three tracks ---------- */
let musicOn = load('asso-music', true) !== false;
const music = { bus: null, timer: null, next: 0, step: 0, cycle: 0, mode: null, want: null, noise: null };
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const TRACKS = {
  //            bpm  chords (root, third, fifth as MIDI notes)
  menu: { bpm: 84,  prog: [[57,60,64],[53,57,60],[48,52,55],[55,59,62]] },          // Am F C G
  play: { bpm: 126, prog: [[57,60,64],[53,57,60],[48,52,55],[55,59,62]] },
  boss: { bpm: 144, prog: [[57,60,64],[57,60,64],[53,57,60],[52,56,59]] }           // Am Am F E
};
// lead melody: index into chord (0-2), 3 = octave root, null = rest
const LEAD = [0,null,1,2, null,1,0,null, 2,null,3,null, 2,1,null,null];
const BOSS_LEAD = [3,null,3,2, null,3,null,1, 3,null,2,null, 1,null,0,null];
function applyMusicVolume(){
  if (music.bus) music.bus.gain.setTargetAtTime(muted || !musicOn ? 0 : 0.6 * SET.music / 100, ac.currentTime, 0.08);
  if (sfxBus) sfxBus.gain.setTargetAtTime(SET.sfx / 100, ac.currentTime, 0.05);
}
function musicInit(){
  if (!ac || music.bus) return;
  music.bus = ac.createGain(); music.bus.gain.value = 0;
  const comp = ac.createDynamicsCompressor();
  music.bus.connect(comp).connect(ac.destination);
  const len = ac.sampleRate, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  music.noise = buf;
  music.next = ac.currentTime + 0.1;
  music.timer = setInterval(musicTick, 25);
  applyMusicVolume();
}
function mNote(midi, t, dur, type, vol, filter){
  const o = ac.createOscillator(), gn = ac.createGain();
  o.type = type; o.frequency.value = mtof(midi);
  gn.gain.setValueAtTime(0.0001, t);
  gn.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let node = o;
  if (filter){ const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filter; o.connect(f); node = f; }
  node.connect(gn).connect(music.bus);
  o.start(t); o.stop(t + dur + 0.02);
}
function mPad(chord, t, dur){
  for (const m of chord){
    const o = ac.createOscillator(), gn = ac.createGain(), f = ac.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.value = mtof(m); o.detune.value = rnd(-8, 8);
    f.type = 'lowpass'; f.frequency.value = 700;
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.linearRampToValueAtTime(0.022, t + dur * 0.3);
    gn.gain.linearRampToValueAtTime(0.0001, t + dur);
    o.connect(f).connect(gn).connect(music.bus); o.start(t); o.stop(t + dur + 0.05);
  }
}
function mKick(t, vol=0.5){
  const o = ac.createOscillator(), gn = ac.createGain();
  o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
  gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  o.connect(gn).connect(music.bus); o.start(t); o.stop(t + 0.22);
}
function mNoise(t, dur, vol, hp){
  const s = ac.createBufferSource(), f = ac.createBiquadFilter(), gn = ac.createGain();
  s.buffer = music.noise; f.type = 'highpass'; f.frequency.value = hp;
  gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(gn).connect(music.bus); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
}
function musicStep(i16, t){
  const tr = TRACKS[music.mode], bar = Math.floor(music.step / 16) % 4, ch = tr.prog[bar];
  const beat = 60 / tr.bpm;
  if (music.mode === 'menu'){
    if (i16 === 0) mPad(ch, t, beat * 4);
    if (i16 % 4 === 0) mNote(ch[(i16 / 4) % 3] + 12, t, 0.5, 'triangle', 0.04);
    if (i16 === 10 && bar % 2) mNote(ch[2] + 24, t, 0.6, 'sine', 0.025);
    return;
  }
  const boss = music.mode === 'boss';
  // bass: driving eighths, fifth on the off-beat of beat 4
  if (i16 % 2 === 0) mNote(ch[0] - 12 + (i16 === 14 ? 7 : 0), t, beat * 0.45, 'sawtooth', boss ? 0.09 : 0.07, boss ? 520 : 420);
  // arpeggio
  mNote(ch[i16 % 3] + 12 + (boss && i16 % 4 === 3 ? 12 : 0), t, beat * 0.22, 'square', 0.014, 2400);
  // drums
  if (i16 % 4 === 0 || (boss && (i16 === 10 || i16 === 14))) mKick(t, boss ? 0.6 : 0.5);
  if (i16 === 4 || i16 === 12) mNoise(t, 0.14, boss ? 0.2 : 0.15, 1200);
  if (i16 % 2 === 1) mNoise(t, 0.03, 0.05, 7000);
  // lead melody on every other 4-bar cycle (always during the boss)
  if (boss || music.cycle % 2 === 1){
    const idx = (boss ? BOSS_LEAD : LEAD)[i16];
    if (idx != null){
      const m = idx === 3 ? ch[0] + 12 : ch[idx];
      mNote(m + 12, t, beat * 0.5, 'triangle', boss ? 0.05 : 0.04);
    }
  }
  if (i16 === 0) mPad(ch, t, beat * 4 * 0.95);
}
function musicTick(){
  if (!ac) return;
  if (ac.currentTime > music.next + 0.5) music.next = ac.currentTime + 0.05;  // came back from a stall
  while (music.next < ac.currentTime + 0.12){
    if (music.want !== music.mode && (music.step % 16 === 0 || !music.mode || !music.want)){
      if (!music.mode) music.step = 0;   // start new tracks from the top of a bar
      music.mode = music.want;
    }
    const i16 = music.step % 16;
    if (music.mode){
      musicStep(i16, music.next);
      music.next += 60 / TRACKS[music.mode].bpm / 4;
    } else music.next += 0.125;
    music.step = (music.step + 1) % 64;
    if (music.step === 0) music.cycle++;
  }
}
function musicWanted(){
  if (state === 'land') return 'menu';
  if (state === 'play') return S.zen ? 'menu' : (S.phase === 'warn' || S.phase === 'boss') ? 'boss' : 'play';
  if (state === 'pause') return null;
  return 'menu';
}
for (const t of document.querySelectorAll('.music-toggle')){
  t.addEventListener('click', () => { initAudio(); musicOn = !musicOn; save('asso-music', musicOn); renderMute(); });
}
renderMute();

