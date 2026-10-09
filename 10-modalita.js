/* Asso dei Cieli - Gelu inc. | appontaggio, Zen, a turni, Boss Rush, missioni della campagna */

/* ---------- carrier landing: after a won campaign mission you bring the plane home ---------- */
let LD = null;
const LAND = { perfect: 150, good: 80, rough: 30 };
function startLanding(){
  state = 'land'; setHud(false); drag = null;
  S.en = []; S.eb = []; S.b = []; S.pk = []; S.boss = null; S.banner = null; S.slow = 0;
  setWeather(null);
  biome.from = biome.to = 'mare'; biome.mix = 1; islands = [];
  const deckL = 300*k, py = H*0.74;
  LD = {
    t: 0, phase: 'approach', x: W/2 + rnd(-0.25, 0.25) * W, py, v: 215*k,
    baseX: W * rnd(0.38, 0.62), cx: W/2, stern: py - H*1.3, deckL, deckW: 58*k,
    wind: rnd(-1, 1) * 14*k, drag: null, grade: null, coins: 0, endT: 0, bank: 0, wire: 0
  };
  LD.cx = LD.baseX;
  $('landSkip').hidden = false;
}
function landGauge(v){ return clamp((v / k - 60) / (260 - 60), 0, 1); }
function updateLanding(dt){
  const D = LD;
  D.t += dt;
  S.shake = Math.max(0, S.shake - dt);
  if (S.banner){ S.banner.life -= dt; if (S.banner.life <= 0) S.banner = null; }
  S.fx = S.fx.filter(f => (f.life -= dt) > 0);
  for (const f of S.fx){ f.x += f.vx * dt; f.y += f.vy * dt; }
  moveClouds(dt * Math.max(0.15, D.v / (140*k)));
  D.cx = D.baseX + Math.sin(D.t * 0.6) * W * 0.07;
  if (D.phase === 'approach'){
    // keyboard: up/down throttle, left/right steer
    const kv = (keys['arrowup'] || keys['w'] ? 1 : 0) - (keys['arrowdown'] || keys['s'] || keys[' '] ? 1 : 0);
    const kx = (keys['arrowright'] || keys['d'] ? 1 : 0) - (keys['arrowleft'] || keys['a'] ? 1 : 0);
    if (kv) D.v += kv * 130*k * dt;
    else if (!D.drag) D.v += 14*k * dt;          // the engine slowly pulls you faster if you let go
    if (kx){ D.x += kx * 200*k * dt; D.bank = kx; }
    D.x += D.wind * dt;
    D.v = clamp(D.v, 60*k, 260*k);
    D.x = clamp(D.x, 20*k, W - 20*k);
    D.bank *= 0.9;
    D.stern += D.v * dt;
    if (D.stern >= D.py + 22*k) touchdown();
  } else if (D.phase === 'roll'){
    D.v = Math.max(0, D.v - 260*k * dt);         // the arrester wire stops you
    D.stern += D.v * dt;
    D.x += (D.cx - D.x) * Math.min(1, dt * 2) * 0.3;
    D.endT -= dt; if (D.endT <= 0) landingDone();
  } else if (D.phase === 'bolter'){
    D.v = Math.min(260*k, D.v + 120*k * dt);
    D.stern += D.v * 0.5 * dt; D.py -= 180*k * dt;
    D.endT -= dt; if (D.endT <= 0) landingDone();
  }
}
function touchdown(){
  const D = LD, dx = Math.abs(D.x - D.cx), sp = D.v / k;
  let g;
  if (dx > D.deckW * 0.5) g = 'miss';
  else if (sp > 170) g = 'fast';
  else if (dx < D.deckW * 0.18 && sp >= 95 && sp <= 130) g = 'perfect';
  else if (dx < D.deckW * 0.35 && sp >= 80 && sp <= 150) g = 'good';
  else g = 'rough';
  D.grade = g;
  if (g === 'miss' || g === 'fast'){
    D.phase = 'bolter'; D.endT = 2.2;
    setBanner(L('Riattaccata!', 'Wave off!'), g === 'miss' ? L('Hai mancato il ponte', 'You missed the deck') : L('Troppo veloce per i cavi', 'Too fast for the wires'), 2.2);
    sfx.deny(); vib(80);
    return;
  }
  D.phase = 'roll'; D.endT = 2.4; D.coins = LAND[g];
  D.wire = g === 'perfect' ? 3 : g === 'good' ? 2 : 1;
  S.coins += D.coins;
  burst(D.x, D.py + 10*k, 14, ['#fff4e0', '#c9c2d8'], 120, 3);
  const T1 = { perfect: L('Appontaggio perfetto!', 'Perfect landing!'), good: L('Buon appontaggio', 'Good landing'), rough: L('Appontaggio duro', 'Hard landing') }[g];
  setBanner(T1, L('Bonus ', 'Bonus ') + '+' + D.coins + L(' monete', ' coins'), 2.4);
  if (g === 'perfect'){ sfx.win(); vib([30, 30, 60]); save('asso-land', true); S.shake = 0; }
  else { sfx.hit(); vib(60); S.shake = g === 'rough' ? 0.35 : 0.15; }
  sfx.coin();
}
function landingDone(){
  if (!LD) return;
  LD = null; $('landSkip').hidden = true;
  campaignOver(true);
}
function skipLanding(){ if (state === 'land') landingDone(); }
function landPointer(e){
  if (state !== 'land' || !LD || LD.phase !== 'approach') return;
  cv.setPointerCapture(e.pointerId);
  LD.drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, px: LD.x, v0: LD.v };
}
cv.addEventListener('pointerdown', landPointer);
cv.addEventListener('pointermove', e => {
  const D = LD;
  if (state !== 'land' || !D || !D.drag || D.drag.id !== e.pointerId || D.phase !== 'approach') return;
  const nx = clamp(D.drag.px + (e.clientX - D.drag.sx) * 1.1, 20*k, W - 20*k);
  D.bank = clamp((nx - D.x) * 0.15, -1, 1); D.x = nx;
  D.v = clamp(D.drag.v0 - (e.clientY - D.drag.sy) * 0.9 * k, 60*k, 260*k);   // drag down = slow down
});
const landUp = e => { if (LD && LD.drag && LD.drag.id === e.pointerId) LD.drag = null; };
cv.addEventListener('pointerup', landUp);
cv.addEventListener('pointercancel', landUp);

function drawCarrier(cx, stern, len, dw){
  const hw = dw * 0.75, bow = stern - len;
  ctx.save();
  // wake behind the stern
  const wk = ctx.createLinearGradient(0, stern, 0, stern + 220*k);
  wk.addColorStop(0, 'rgba(255,244,224,.45)'); wk.addColorStop(1, 'rgba(255,244,224,0)');
  ctx.fillStyle = wk;
  ctx.beginPath(); ctx.moveTo(cx - hw * 0.8, stern); ctx.lineTo(cx + hw * 0.8, stern); ctx.lineTo(cx + hw * 2.2, stern + 220*k); ctx.lineTo(cx - hw * 2.2, stern + 220*k); ctx.closePath(); ctx.fill();
  // shadow, hull
  ctx.fillStyle = 'rgba(26,21,48,.35)';
  ctx.beginPath(); ctx.moveTo(cx - hw + 10*k, stern + 12*k); ctx.lineTo(cx + hw + 10*k, stern + 12*k); ctx.lineTo(cx + hw + 10*k, bow + len * 0.25 + 12*k); ctx.quadraticCurveTo(cx + hw * 0.6 + 10*k, bow + 12*k, cx + 10*k, bow - 20*k + 12*k); ctx.quadraticCurveTo(cx - hw * 0.6 + 10*k, bow + 12*k, cx - hw + 10*k, bow + len * 0.25 + 12*k); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#5b5670';
  ctx.beginPath(); ctx.moveTo(cx - hw, stern); ctx.lineTo(cx + hw, stern); ctx.lineTo(cx + hw, bow + len * 0.25); ctx.quadraticCurveTo(cx + hw * 0.6, bow, cx, bow - 20*k); ctx.quadraticCurveTo(cx - hw * 0.6, bow, cx - hw, bow + len * 0.25); ctx.closePath(); ctx.fill();
  // flight deck
  ctx.fillStyle = '#3d3a52';
  ctx.beginPath(); ctx.moveTo(cx - dw/2 - 6*k, stern - 4*k); ctx.lineTo(cx + dw/2 + 6*k, stern - 4*k); ctx.lineTo(cx + dw/2 + 6*k, bow + len * 0.2); ctx.lineTo(cx, bow - 8*k); ctx.lineTo(cx - dw/2 - 6*k, bow + len * 0.2); ctx.closePath(); ctx.fill();
  // stern stripes
  ctx.fillStyle = '#ffe36e';
  for (let i = 0; i < 6; i++){ const x = cx - dw/2 + i * dw / 5.5; ctx.fillRect(x, stern - 12*k, dw / 11, 8*k); }
  // touchdown box
  ctx.strokeStyle = 'rgba(255,227,110,.75)'; ctx.lineWidth = 2*k;
  ctx.strokeRect(cx - dw * 0.18, stern - 70*k, dw * 0.36, 52*k);
  // centreline
  ctx.strokeStyle = 'rgba(255,244,224,.85)'; ctx.lineWidth = 2*k; ctx.setLineDash([12*k, 10*k]);
  ctx.beginPath(); ctx.moveTo(cx, stern - 16*k); ctx.lineTo(cx, bow + 10*k); ctx.stroke(); ctx.setLineDash([]);
  // deck edges
  ctx.strokeStyle = 'rgba(255,244,224,.4)'; ctx.lineWidth = 1.5*k;
  ctx.beginPath(); ctx.moveTo(cx - dw/2, stern - 14*k); ctx.lineTo(cx - dw/2, bow + len * 0.22); ctx.moveTo(cx + dw/2, stern - 14*k); ctx.lineTo(cx + dw/2, bow + len * 0.22); ctx.stroke();
  // arrester wires
  ctx.strokeStyle = 'rgba(255,244,224,.6)'; ctx.lineWidth = 1.5*k;
  for (let i = 1; i <= 4; i++){ const y = stern - 18*k - i * 14*k; ctx.beginPath(); ctx.moveTo(cx - dw/2 + 2*k, y); ctx.lineTo(cx + dw/2 - 2*k, y); ctx.stroke(); }
  // island tower on the right
  const ix = cx + hw - 4*k, iy = stern - len * 0.52;
  ctx.fillStyle = 'rgba(26,21,48,.35)'; ctx.fillRect(ix - 8*k + 8*k, iy - 30*k + 10*k, 16*k, 60*k);
  ctx.fillStyle = '#7a7390'; ctx.fillRect(ix - 8*k, iy - 30*k, 16*k, 60*k);
  ctx.fillStyle = '#9a93ad'; ctx.fillRect(ix - 8*k, iy - 30*k, 16*k, 8*k);
  ctx.fillStyle = 'rgba(255,227,110,.85)'; for (let i = 0; i < 3; i++) ctx.fillRect(ix - 5*k, iy - 14*k + i * 12*k, 3*k, 3*k);
  ctx.strokeStyle = '#c9c2d8'; ctx.lineWidth = 1.5*k; ctx.beginPath(); ctx.moveTo(ix, iy - 30*k); ctx.lineTo(ix, iy - 46*k); ctx.moveTo(ix - 6*k, iy - 40*k); ctx.lineTo(ix + 6*k, iy - 40*k); ctx.stroke();
  // landing lights blink on the stern
  if (Math.floor(performance.now() / 350) % 2){ ctx.fillStyle = '#ff5d73'; for (const s of [-1, 1]){ ctx.beginPath(); ctx.arc(cx + s * (dw/2 + 2*k), stern - 6*k, 3*k, 0, Math.PI*2); ctx.fill(); } }
  ctx.restore();
}
function drawLanding(){
  const D = LD;
  if (!D) return;
  drawCarrier(D.cx, D.stern, D.deckL, D.deckW);
  // the plane: big and high on approach, shrinking towards the deck
  const toGo = Math.max(0, D.py + 22*k - D.stern), alt = D.phase === 'approach' ? clamp(toGo / (H * 1.3), 0, 1) : D.phase === 'bolter' ? 0.6 : 0;
  const PL = plane(), sz = k * PL.size * (0.85 + alt * 0.35), shOff = 6*k + alt * 40*k;
  drawPlane(D.x + shOff * 0.6, D.py + shOff, sz * 0.8, 1, shadowOf(PL));
  drawPlane(D.x, D.py, sz, 1, colOf(PL), D.bank);
  drawEmblem(ctx, D.x - 13*k*PL.size * (sz / (k * PL.size)), D.py + 5*k, 7*k);
  if (D.phase === 'roll' && D.wire){
    // hook caught a wire
    ctx.strokeStyle = 'rgba(255,227,110,.9)'; ctx.lineWidth = 2*k;
    ctx.beginPath(); ctx.moveTo(D.cx - D.deckW/2, D.py + 24*k); ctx.quadraticCurveTo(D.x, D.py + 40*k, D.cx + D.deckW/2, D.py + 24*k); ctx.stroke();
  }
  for (const f of S.fx){ ctx.globalAlpha = clamp(f.life / f.max, 0, 1); ctx.fillStyle = f.c; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI*2); ctx.fill(); }
  ctx.globalAlpha = 1;
  drawClouds(1, 0);
  // speed gauge on the right edge, with the green "just right" band
  const gx = W - 30, gy = H * 0.24, gh = H * 0.42;
  ctx.fillStyle = 'rgba(26,21,48,.55)'; ctx.fillRect(gx - 7, gy - 4, 14, gh + 8);
  const band = (a, b, c) => { const y1 = gy + gh * (1 - landGauge(b * k)), y2 = gy + gh * (1 - landGauge(a * k)); ctx.fillStyle = c; ctx.fillRect(gx - 5, y1, 10, y2 - y1); };
  band(60, 80, 'rgba(255,154,77,.55)'); band(80, 95, 'rgba(255,227,110,.6)'); band(95, 130, '#2bb3a6'); band(130, 150, 'rgba(255,227,110,.6)'); band(150, 170, 'rgba(255,154,77,.55)'); band(170, 260, 'rgba(255,93,115,.55)');
  const my = gy + gh * (1 - landGauge(D.v));
  ctx.fillStyle = '#fff4e0'; ctx.beginPath(); ctx.moveTo(gx - 9, my); ctx.lineTo(gx - 18, my - 6); ctx.lineTo(gx - 18, my + 6); ctx.closePath(); ctx.fill();
  ctx.fillRect(gx - 8, my - 1.5, 16, 3);
  ctx.font = '700 11px "Chakra Petch", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText(L('VELOCITÀ', 'SPEED'), gx - 4, gy + gh + 10);
  ctx.fillText(Math.round(D.v / k * 1.6) + ' km/h', gx - 4, gy + gh + 24);
  // title and how-to while approaching
  if (D.phase === 'approach'){
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `${Math.min(26, W / 14)}px Bungee, Impact, sans-serif`;
    ctx.fillStyle = 'rgba(26,21,48,.5)'; ctx.fillText(L('APPONTAGGIO', 'CARRIER LANDING'), W/2, 92 + 2);
    ctx.fillStyle = '#ffe36e'; ctx.fillText(L('APPONTAGGIO', 'CARRIER LANDING'), W/2, 92);
    ctx.font = '700 13px "Chakra Petch", sans-serif'; ctx.fillStyle = '#fff4e0';
    ctx.fillText(L('Allineati alla linea bianca', 'Line up with the white line'), W/2, 120);
    ctx.fillText(L('Trascina in giù per rallentare: resta nel verde', 'Drag down to slow down: stay in the green'), W/2, 138);
    // distance to the deck
    const m = Math.max(0, Math.round(toGo / k * 0.6));
    ctx.font = '700 14px "Chakra Petch", sans-serif'; ctx.fillStyle = '#ffe36e';
    ctx.fillText(m + ' m', W/2, H - 40);
  }
  if (S.banner){
    const bn = S.banner, age = bn.max - bn.life;
    ctx.globalAlpha = Math.min(1, age * 3, bn.life * 2);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const size = Math.min(30, W / (bn.txt.length * 0.75));
    ctx.font = `${size}px Bungee, Impact, sans-serif`;
    ctx.fillStyle = 'rgba(26,21,48,.5)'; ctx.fillText(bn.txt.toUpperCase(), W/2, H*0.3 + 3);
    ctx.fillStyle = '#ffe36e'; ctx.fillText(bn.txt.toUpperCase(), W/2, H*0.3);
    ctx.font = '700 15px "Chakra Petch", sans-serif';
    ctx.fillStyle = '#fff4e0'; ctx.fillText(bn.sub, W/2, H*0.3 + size * 0.9 + 4);
    ctx.globalAlpha = 1;
  }
}

/* ---------- zen mode: no lives, no bosses, just flying ---------- */
const ZEN_LEG = 40;
function zenTick(){
  if (!S.zen || S.lt < ZEN_LEG) return;
  S.lt = 0; S.zenLeg = (S.zenLeg || 0) + 1;
  sky.from = sky.to; sky.to = [0, 1, 2, 1][S.zenLeg % 4]; sky.mix = 0;
  const b = BIOMES[S.zenLeg % BIOMES.length];
  setBiome(b);
  const r = Math.random();
  setWeather(r < 0.25 ? 'rain' : 'clear');
  setBanner(BIOME_SUB[b] || L('Sopra il mare', 'Over the sea'), S.weather === 'rain' ? L('Un po\' di pioggia', 'A little rain') : L('Respira e vola', 'Breathe and fly'), 2.4);
  onProgress();
}
function zenHit(){
  const p = S.p;
  if (p.inv > 0) return;
  p.inv = 0.8; S.combo = 0;
  burst(p.x, p.y, 10, ['#fff4e0', '#9fd8ff'], 150, 2.5);
  sfx.shield(); vib(20);
}

/* ---------- party: 2-4 friends take turns on the same phone, same enemies for everyone ---------- */
let party = null, partyN = 2;
let partyNames = load('asso-party-names', null);
if (!Array.isArray(partyNames)) partyNames = [];
const defaultName = i => (i === 0 && pilot.name) ? pilot.name : L('Giocatore ', 'Player ') + (i + 1);
const esc = str => String(str).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function openPartySetup(){
  initAudio(); state = 'party';
  const inputs = Array.from({ length: partyN }, (_, i) =>
    `<input id="pname${i}" maxlength="14" autocomplete="off" aria-label="${defaultName(i)}" value="${esc(partyNames[i] || defaultName(i))}">`).join('');
  $('partyCard').innerHTML = `
    <div class="eyebrow">${L('Sfida a turni', 'Party mode')}</div>
    <h2>${L('Tra amici', 'With friends')}</h2>
    <p class="note">${L('Ognuno gioca una partita con gli stessi nemici, passandosi il telefono. Vince chi fa più punti.', 'Everyone plays one game against the same enemies, passing the phone around. Highest score wins.')}</p>
    <div class="seg four" role="radiogroup" aria-label="${L('Numero di giocatori', 'Number of players')}" id="pcount">
      ${[2, 3, 4].map(n => `<button role="radio" data-n="${n}" aria-checked="${n === partyN}">${n} ${L('giocatori', 'players')}</button>`).join('')}
    </div>
    <div class="pnames">${inputs}</div>
    <button class="btn" id="pstart">${L('Inizia', 'Start')}</button>
    <button class="btn ghost" id="pback">${T('Indietro')}</button>`;
  show('partyOv');
  $('pcount').onclick = e => { const b = e.target.closest('button[data-n]'); if (!b) return; readNames(); partyN = +b.dataset.n; openPartySetup(); };
  $('pstart').onclick = () => {
    readNames();
    party = { n: partyN, names: partyNames.slice(0, partyN), scores: [], waves: [], turn: 0, seed: (Math.random() * 4294967296) >>> 0 };
    partyTurnScreen();
  };
  $('pback').onclick = toMenu;
}
function readNames(){
  for (let i = 0; i < partyN; i++){ const el = $('pname' + i); if (el) partyNames[i] = el.value.trim() || defaultName(i); }
  save('asso-party-names', partyNames);
}
function partyTurnScreen(){
  state = 'party'; setHud(false);
  const name = party.names[party.turn];
  $('partyCard').innerHTML = `
    <div class="eyebrow">${L('Turno ', 'Turn ')}${party.turn + 1}${L(' di ', ' of ')}${party.n}</div>
    <div class="turnname">${esc(name)}</div>
    <p class="note">${party.turn === 0 ? L('Si comincia! Gli altri guardano.', 'Here we go! Everyone else watches.') : L('Passa il telefono a ', 'Hand the phone to ') + esc(name) + '.'}</p>
    ${party.turn > 0 ? `<p class="note">${L('Punteggio da battere: ', 'Score to beat: ')}<b>${Math.max(...party.scores).toLocaleString(NUM)}</b></p>` : ''}
    <button class="btn" id="pgo">${T('Decolla')}</button>
    <button class="btn ghost" id="pquit">${L('Annulla la sfida', 'Cancel the round')}</button>`;
  show('partyOv');
  $('pgo').onclick = () => start('party');
  $('pquit').onclick = () => { party = null; toMenu(); };
}
function partyTurnOver(){
  if (state === 'over') return;
  state = 'over'; setHud(false);
  bankCoins(); finishRun();
  party.scores[party.turn] = S.score; party.waves[party.turn] = S.level;
  party.turn++;
  if (party.turn < party.n){ partyTurnScreen(); return; }
  S.partyDone = true; onProgress();
  const order = party.names.map((n, i) => ({ n, s: party.scores[i], w: party.waves[i] })).sort((a, b) => b.s - a.s);
  $('partyCard').innerHTML = `
    <div class="eyebrow">${L('Sfida a turni', 'Party mode')}</div>
    <h2>${L('Vince ', '')}${esc(order[0].n)}${L('!', ' wins!')}</h2>
    <div class="podium">${order.map((o, i) => `<div><b>${i + 1}</b><span>${esc(o.n)}</span><strong>${o.s.toLocaleString(NUM)}</strong></div>`).join('')}</div>
    <button class="btn" id="pagain">${L('Rivincita', 'Rematch')}</button>
    <button class="btn ghost" id="pmenu">${T('Menu')}</button>`;
  show('partyOv'); sfx.win();
  $('pagain').onclick = () => { party = { ...party, scores: [], waves: [], turn: 0, seed: (Math.random() * 4294967296) >>> 0 }; partyTurnScreen(); };
  $('pmenu').onclick = () => { party = null; toMenu(); };
}
/* ---------- boss rush ---------- */
function fmtClock(sec){ return Math.floor(sec / 60) + ':' + (sec % 60).toFixed(1).padStart(4, '0'); }
function rushWin(){
  if (S.endT > 0) return;
  S.endT = 2.6; S.eb = [];
  setBanner(L('Boss Rush completato!', 'Boss Rush complete!'), fmtClock(S.rush.time), 2.6);
  sfx.win(); vib([40, 40, 80]);
}
function rushOver(win){
  if (state === 'over') return;
  state = 'over'; setHud(false);
  bankCoins(); finishRun();
  const prev = +load('asso-rush', 0) || 0, t = S.rush.time;
  const rec = win && (!prev || t < prev);
  if (rec) save('asso-rush', +t.toFixed(1));
  onProgress();
  $('overEyebrow').textContent = 'Boss Rush · ' + S.df.name;
  $('overTitle').textContent = win ? L('Boss Rush completato!', 'Boss Rush complete!') : L('Abbattuto!', 'Shot down!');
  $('finalScore').textContent = S.score.toLocaleString(NUM);
  $('bestOverLabel').textContent = L('Tempo record', 'Best time');
  const best = +load('asso-rush', 0) || 0;
  $('bestOver').textContent = best ? fmtClock(best) : '–';
  $('kills').textContent = S.kills; $('waveOver').textContent = Math.min(S.rush.idx, 5) + '/5';
  $('coinsOver').innerHTML = coinHTML('+' + S.coins);
  $('newRec').hidden = !rec;
  $('rankLine').hidden = false;
  $('rankLine').textContent = win ? L('Tempo: ', 'Time: ') + fmtClock(t) : L('Boss sconfitti: ', 'Bosses defeated: ') + S.rush.idx + L(' su 5', ' of 5');
  $('againBtn').textContent = T('Riprova');
  refreshMenuStats();
  show('overOv');
}
/* ---------- campaign missions in play ---------- */
function missionWin(){
  if (S.endT > 0) return;
  S.endT = 2.6; S.endWin = true; S.eb = [];
  setBanner('Missione compiuta!', S.mission.title, 2.6);
  sfx.win(); vib([40, 40, 80]);
}
function missionFail(why){
  if (S.endT > 0) return;
  S.endT = 2.2; S.endWin = false; S.failWhy = why;
  setBanner('Missione fallita', why, 2.2);
  sfx.hurt(); vib(150);
}
function campaignTick(dt){
  const M = S.mission;
  if (S.endT > 0){
    S.endT -= dt; S.p.inv = Math.max(S.p.inv, 0.5);
    if (S.endT <= 0){ if (S.endWin) startLanding(); else campaignOver(false); }
    return;
  }
  if (S.dead) return;
  if (S.escort && !S.escort.dead) updateEscort(dt);
  if (S.endT > 0) return;
  if ((M.type === 'survive' || M.type === 'escort') && S.t >= M.target) missionWin();
  else if (M.type === 'kills' && S.kills >= M.target) missionWin();
  else if (M.type === 'killType' && S.ktCount >= M.target) missionWin();
  else if (M.timer && S.t >= M.timer) missionFail(M.failMsg || T('Il Dirigibile ha raggiunto il porto'));
}
function updateEscort(dt){
  const E = S.escort;
  E.flash = Math.max(0, E.flash - dt);
  E.x = W/2 + Math.sin(S.t * 0.45) * W * 0.22;
  E.y = H*0.58 + Math.sin(S.t * 0.8) * 16*k;
  const hit = dmg => {
    E.hp -= dmg; E.flash = 0.12; burst(E.x, E.y, 6, FIRE, 120, 3); sfx.hit();
    if (E.hp <= 0){
      E.dead = true; burst(E.x, E.y, 60, FIRE, 320, 7); S.shake = 0.6; sfx.big();
      missionFail(T('Il cargo è stato abbattuto'));
    }
  };
  for (const b of S.eb){
    if (E.dead) return;
    if (!b.dead && dist2(b, E) < (26*k) ** 2){ b.dead = true; hit(1); }
  }
  for (const e of S.en){
    if (E.dead) return;
    if (!e.dead && e.type !== 'n' && e.type !== 'm' && dist2(e, E) < (e.r + 24*k) ** 2){ e.dead = true; explode(e); hit(e.type === 'k' ? 3 : 2); }
  }
}
function campaignOver(win){
  if (state === 'over') return;
  state = 'over'; setHud(false);
  bankCoins(); finishRun();
  const M = S.mission, i = S.mIdx, first = win && !camp.done.includes(i);
  if (win){
    if (first){ camp.done.push(i); wallet += M.reward; save('asso-coins', wallet); }
    camp.best[i] = Math.max(camp.best[i] || 0, S.score);
    save('asso-campaign', camp);
  }
  S.won = win;
  onProgress();
  $('overEyebrow').textContent = L('Campagna · Missione ', 'Campaign · Mission ') + (i + 1) + ' · ' + S.df.name;
  $('overTitle').textContent = T(win ? 'Missione compiuta!' : 'Missione fallita');
  $('finalScore').textContent = S.score.toLocaleString(NUM);
  $('bestOverLabel').textContent = L('Record missione', 'Mission best');
  $('bestOver').textContent = Math.max(camp.best[i] || 0, S.score).toLocaleString(NUM);
  $('kills').textContent = S.kills;
  $('waveOver').textContent = S.level;
  $('coinsOver').innerHTML = coinHTML('+' + (S.coins + (first ? M.reward : 0)));
  $('newRec').hidden = true;
  let line;
  if (!win) line = (S.failWhy || T('Sei stato abbattuto')) + L('. Riprova!', '. Try again!');
  else if (first && i === CAMPAIGN.length - 1) line = L('Hai completato la campagna: la guerra è finita! Ricompensa: ', 'You completed the campaign: the war is over! Reward: ') + M.reward + L(' monete.', ' coins.');
  else if (first && i === CHAPTER_LEN - 1) line = L('Capitolo 1 completato! Ricompensa: ', 'Chapter 1 complete! Reward: ') + M.reward + L(' monete. Si apre il capitolo 2: la tempesta.', ' coins. Chapter 2, the storm, is now open.');
  else if (first) line = L('Ricompensa: ', 'Reward: ') + M.reward + L(' monete. Si è sbloccata la missione ', ' coins. Mission ') + (i + 2) + L('.', ' is unlocked.');
  else line = L('Missione già completata: la ricompensa si ottiene solo la prima volta.', 'Mission already completed: the reward is only given the first time.');
  $('rankLine').hidden = false; $('rankLine').textContent = line;
  $('againBtn').textContent = win && i + 1 < CAMPAIGN.length ? L('Prossima missione', 'Next mission') : T('Riprova');
  refreshMenuStats();
  show('overOv');
}

