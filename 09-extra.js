/* Asso dei Cieli - Gelu inc. | eventi stagionali, fantasma, pilota, bonus giornaliero, codice segreto, drone, enciclopedia */

/* ---------- seasonal events: Halloween (25 Oct - 2 Nov) and Christmas (15 Dec - 6 Jan) ---------- */
function seasonNow(){
  const pref = SET.season || 'auto';
  if (pref === 'off') return null;
  if (pref === 'halloween' || pref === 'xmas') return pref;
  const d = new Date(), m = d.getMonth(), day = d.getDate();
  if ((m === 9 && day >= 25) || (m === 10 && day <= 2)) return 'halloween';
  if ((m === 11 && day >= 15) || (m === 0 && day <= 6)) return 'xmas';
  return null;
}
let SEASON = seasonNow();
const STREGA = { id:'strega', name: L('La Strega', 'The Witch'), hp: 150 };
const INVERNO = { id:'inverno', name: L('Re dell\'Inverno', 'The Winter King'), hp: 170 };
const SEASON_INFO = {
  halloween: { name: 'Halloween', boss: STREGA, gift: 'zucca',
    giftText: L('Regalo di Halloween: livrea Zucca per tutti gli aerei!', 'Halloween gift: Pumpkin paint job for every plane!') },
  xmas: { name: L('Natale', 'Christmas'), boss: INVERNO, gift: 'neve',
    giftText: L('Regalo di Natale: livrea Neve per tutti gli aerei!', 'Christmas gift: Snow paint job for every plane!') }
};
function applySeason(){
  SEASON = seasonNow();
  const info = SEASON && SEASON_INFO[SEASON];
  $('seasonBtn').hidden = !info;
  if (!info) return;
  $('seasonBtn').firstChild.nodeValue = info.name;
  $('seasonSub').textContent = 'Boss: ' + info.boss.name;
  // one gift per season per year: the seasonal paint job for every plane
  const flag = 'asso-gift-' + SEASON + '-' + new Date().getFullYear();
  if (!load(flag, false)){
    save(flag, true);
    for (const P of PLANES){
      const idx = LIVERIES[P.id].findIndex(l => l.key === info.gift) + 1;
      const key = P.id + ':' + idx;
      if (idx > 0 && !liveryOwned.includes(key)) liveryOwned.push(key);
    }
    save('asso-liveries', liveryOwned);
    setTimeout(() => toast('<span>' + info.giftText + '</span>'), 2600);
  }
}

// ambient decoration
const snow = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random(), r: rnd(1, 3), sp: rnd(30, 80), ph: rnd(0, 6) }));
const ambientBats = Array.from({ length: 4 }, (_, i) => ({ x: Math.random(), y: 0.1 + i * 0.12, sp: rnd(0.04, 0.09), ph: rnd(0, 6) }));
function seasonSkyTint(){
  if (!SEASON) return;
  const t = performance.now() / 1000;
  if (SEASON === 'halloween'){
    const gr = ctx.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, 'rgba(70,20,90,.35)'); gr.addColorStop(1, 'rgba(255,110,20,.22)');
    ctx.fillStyle = gr; ctx.fillRect(-20, -20, W + 40, H + 40);
    // big moon and a few bats far away
    const mx = W * 0.8, my = H * 0.12, mr = 34*k;
    ctx.fillStyle = 'rgba(255,217,160,.18)'; ctx.beginPath(); ctx.arc(mx, my, mr * 1.8, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffd9a0'; ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(200,140,90,.35)';
    ctx.beginPath(); ctx.arc(mx - 10*k, my - 6*k, 6*k, 0, Math.PI*2); ctx.arc(mx + 9*k, my + 9*k, 4*k, 0, Math.PI*2); ctx.fill();
    for (const b of ambientBats){
      const x = ((b.x + t * b.sp) % 1.2 - 0.1) * W, y = (b.y + Math.sin(t + b.ph) * 0.02) * H;
      ctx.globalAlpha = 0.55; drawBat(x, y, 0.45*k, t * 9 + b.ph, '#1a1022', 1); ctx.globalAlpha = 1;
    }
  } else {
    ctx.fillStyle = 'rgba(150,190,255,.14)'; ctx.fillRect(-20, -20, W + 40, H + 40);
  }
}
function drawSnow(dt){
  if (SEASON !== 'xmas') return;
  const t = performance.now() / 1000;
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  for (const f of snow){
    f.y += f.sp * k * dt / H; if (f.y > 1.02){ f.y = -0.02; f.x = Math.random(); }
    const x = (f.x + Math.sin(t * 0.8 + f.ph) * 0.015) * W;
    ctx.beginPath(); ctx.arc(x, f.y * H, f.r * k, 0, Math.PI*2); ctx.fill();
  }
}

// seasonal enemy looks
function drawBat(x, y, s, phase, col = '#2a1838', dir = -1){
  const flap = Math.sin(phase) * 0.6;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s * dir);
  ctx.fillStyle = col;
  for (const sx of [-1, 1]){
    ctx.beginPath();
    ctx.moveTo(sx * 5, -2);
    ctx.quadraticCurveTo(sx * 18, -14 - flap * 10, sx * 30, -4 - flap * 12);
    ctx.lineTo(sx * 24, 2 - flap * 4); ctx.lineTo(sx * 18, -1 - flap * 3); ctx.lineTo(sx * 12, 4); ctx.lineTo(sx * 5, 4);
    ctx.closePath(); ctx.fill();
  }
  ctx.beginPath(); ctx.ellipse(0, 0, 6, 9, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-5, -7); ctx.lineTo(-3, -13); ctx.lineTo(-1, -7); ctx.moveTo(5, -7); ctx.lineTo(3, -13); ctx.lineTo(1, -7); ctx.fill();
  ctx.fillStyle = '#ff9a4d';
  ctx.beginPath(); ctx.arc(-2.2, -3, 1.4, 0, Math.PI*2); ctx.arc(2.2, -3, 1.4, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}
function drawPumpkin(e){
  const r = e.r, near = e.y > H * 0.42, on = Math.floor(e.t * (near ? 12 : 3)) % 2;
  ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(Math.sin(e.t * 2) * 0.25);
  ctx.fillStyle = e.flash > 0 ? '#ffffff' : '#ff8a1f';
  for (const ox of [-0.45, 0.45]){ ctx.beginPath(); ctx.ellipse(ox * r, 0, r * 0.7, r * 0.95, 0, 0, Math.PI*2); ctx.fill(); }
  ctx.beginPath(); ctx.ellipse(0, 0, r * 0.75, r, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#3d7a2a'; ctx.fillRect(-2*k, -r - 5*k, 4*k, 7*k);
  ctx.fillStyle = on ? '#ffe36e' : '#7a3a10';
  ctx.beginPath();
  ctx.moveTo(-r*0.5, -r*0.25); ctx.lineTo(-r*0.2, -r*0.25); ctx.lineTo(-r*0.35, -r*0.5);
  ctx.moveTo(r*0.5, -r*0.25); ctx.lineTo(r*0.2, -r*0.25); ctx.lineTo(r*0.35, -r*0.5);
  ctx.moveTo(-r*0.55, r*0.15); ctx.lineTo(r*0.55, r*0.15); ctx.lineTo(r*0.3, r*0.45); ctx.lineTo(0, r*0.3); ctx.lineTo(-r*0.3, r*0.45);
  ctx.fill();
  ctx.restore();
}
function drawGift(e){
  const r = e.r * 1.05, near = e.y > H * 0.42, on = Math.floor(e.t * (near ? 12 : 3)) % 2;
  ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.t * 0.8);
  ctx.fillStyle = e.flash > 0 ? '#ffffff' : (on && near ? '#ff5d73' : '#d9303a');
  ctx.fillRect(-r, -r, r * 2, r * 2);
  ctx.fillStyle = '#ffe36e';
  ctx.fillRect(-r * 0.18, -r, r * 0.36, r * 2); ctx.fillRect(-r, -r * 0.18, r * 2, r * 0.36);
  ctx.beginPath(); ctx.ellipse(-r * 0.35, -r * 1.05, r * 0.35, r * 0.2, -0.5, 0, Math.PI*2); ctx.ellipse(r * 0.35, -r * 1.05, r * 0.35, r * 0.2, 0.5, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

// seasonal bosses
function updateStrega(B, dt, p, spd){
  B.x = W/2 + Math.sin(B.t * 0.9) * Math.max(0, W/2 - 60*k);
  B.y = B.ty + Math.sin(B.t * 2.2) * 22*k;
  if (S.dead || (B.cd -= dt * S.df.fire) > 0) return;
  const pat = B.pat % 3;
  if (pat === 0){
    for (const ox of [-36, 0, 36]){ const bat = makeEnemy('f', B.x + ox*k); bat.y = B.y + 20*k; }
    sfx.dash(); B.cd = 1.4; B.pat++;
  } else if (pat === 1){
    const n = 14;
    for (let i = 0; i < n; i++) shootEB(B.x, B.y, B.t + i / n * Math.PI * 2, spd * 0.75, 5.5*k, '#ff8a1f');
    B.cd = 1.3; B.pat++;
  } else {
    const a = aimAt(B.x, B.y, p);
    for (const o of [-0.16, 0, 0.16]) shootEB(B.x, B.y + 14*k, a + o, spd * 1.1, 5*k, '#b06bff');
    B.burst++;
    if (B.burst >= 3){ B.burst = 0; B.cd = 1.2; B.pat++; } else B.cd = 0.28;
  }
}
function updateInverno(B, dt, p, spd){
  B.x = W/2 + Math.sin(B.t * 0.5) * Math.max(0, W/2 - 80*k);
  B.y = B.ty + Math.sin(B.t * 1.4) * 10*k;
  if (S.dead || (B.cd -= dt * S.df.fire) > 0) return;
  const pat = B.pat % 3;
  if (pat === 0){
    const n = 18;
    for (let i = 0; i < n; i++) shootEB(B.x, B.y, B.t * 0.7 + i / n * Math.PI * 2, spd * 0.6, 5*k, '#bfe6ff');
    B.cd = 1.2; B.pat++;
  } else if (pat === 1){
    const n = Math.max(8, Math.round(W / (26*k))), gap = Math.floor(rnd(1, n - 4));
    for (let i = 0; i < n; i++){
      if (i >= gap && i < gap + 3) continue;
      S.eb.push({ x: (i + 0.5) * W / n, y: B.y + 30*k, vx: 0, vy: spd * 0.55, r: 5*k, c: '#9fd8ff' });
    }
    B.cd = 1.5; B.pat++;
  } else {
    for (const ox of [-30, 30]){ const m = makeEnemy('m', B.x + ox*k); m.y = B.y + 40*k; }
    B.cd = 1.2; B.pat++;
  }
}
function drawWitch(B){
  const t = B.t, s = 1.25 * k, fl = false;
  ctx.save(); ctx.translate(B.x, B.y); ctx.scale(s, s);
  // cape fluttering behind (up the screen)
  ctx.fillStyle = fl ? '#ffffff' : '#3a1850';
  ctx.beginPath(); ctx.moveTo(-10, -4); ctx.quadraticCurveTo(-22 + Math.sin(t * 8) * 4, -30, -6, -42 + Math.sin(t * 6) * 3);
  ctx.quadraticCurveTo(4, -30, 10, -4); ctx.closePath(); ctx.fill();
  // broom across the body, bristles behind
  ctx.strokeStyle = '#8a5a2a'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(-34, -6); ctx.lineTo(36, 4); ctx.stroke();
  ctx.fillStyle = '#d9a040';
  ctx.beginPath(); ctx.moveTo(-34, -6); ctx.lineTo(-52, -18); ctx.lineTo(-56, -4); ctx.lineTo(-52, 8); ctx.closePath(); ctx.fill();
  // dress
  ctx.fillStyle = fl ? '#ffffff' : '#6b2a8a';
  ctx.beginPath(); ctx.moveTo(-12, 6); ctx.lineTo(12, 6); ctx.lineTo(4, -16); ctx.lineTo(-4, -16); ctx.closePath(); ctx.fill();
  // face, hat
  ctx.fillStyle = '#9fe0a0'; ctx.beginPath(); ctx.arc(0, 12, 7, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#1a1022';
  ctx.beginPath(); ctx.ellipse(0, 6, 15, 4, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-8, 6); ctx.lineTo(8, 6); ctx.lineTo(3 + Math.sin(t * 3) * 2, -22); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ff8a1f'; ctx.fillRect(-8, 2, 16, 3);
  ctx.fillStyle = '#ffe36e'; ctx.beginPath(); ctx.arc(-2.5, 13, 1.3, 0, Math.PI*2); ctx.arc(2.5, 13, 1.3, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}
function drawWinterKing(B){
  const t = B.t, s = 1.3 * k, fl = false;
  ctx.save(); ctx.translate(B.x, B.y); ctx.scale(s, s);
  // two reindeer pulling ahead (down the screen)
  for (const ox of [-12, 12]){
    const bob = Math.sin(t * 6 + ox) * 2;
    ctx.fillStyle = fl ? '#ffffff' : '#8a5a3a';
    ctx.beginPath(); ctx.ellipse(ox, 44 + bob, 6, 11, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(ox, 57 + bob, 4.5, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#d9b080'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(ox - 2, 54 + bob); ctx.lineTo(ox - 7, 48 + bob); ctx.lineTo(ox - 9, 51 + bob); ctx.moveTo(ox + 2, 54 + bob); ctx.lineTo(ox + 7, 48 + bob); ctx.lineTo(ox + 9, 51 + bob); ctx.stroke();
    ctx.fillStyle = ox < 0 ? '#ff5d73' : '#1a1530'; ctx.beginPath(); ctx.arc(ox, 61 + bob, 1.6, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,227,110,.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ox, 33 + bob); ctx.lineTo(ox * 0.6, 18); ctx.stroke();
  }
  // sleigh
  ctx.fillStyle = fl ? '#ffffff' : '#c8202c';
  ctx.beginPath(); ctx.moveTo(-22, -22); ctx.lineTo(22, -22); ctx.lineTo(24, 14); ctx.quadraticCurveTo(0, 26, -24, 14); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#ffe36e'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(-26, -24); ctx.lineTo(-26, 18); ctx.quadraticCurveTo(-26, 26, -20, 26); ctx.moveTo(26, -24); ctx.lineTo(26, 18); ctx.quadraticCurveTo(26, 26, 20, 26); ctx.stroke();
  // the king: blue robe, white beard, gold crown
  ctx.fillStyle = '#3a5fd0'; ctx.beginPath(); ctx.arc(0, -4, 12, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#f2e6d8'; ctx.beginPath(); ctx.arc(0, 4, 7, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(0, 10, 6, 5, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#ffe36e';
  ctx.beginPath(); ctx.moveTo(-6, -2); ctx.lineTo(-6, -8); ctx.lineTo(-3, -5); ctx.lineTo(0, -10); ctx.lineTo(3, -5); ctx.lineTo(6, -8); ctx.lineTo(6, -2); ctx.closePath(); ctx.fill();
  // gift sack
  ctx.fillStyle = '#7a4a2a'; ctx.beginPath(); ctx.arc(-13, -14, 8, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

/* ---------- ghost of your best daily run ---------- */
function loadGhost(){
  const g0 = load('asso-ghost', null);
  return g0 && g0.date === todayKey() && Array.isArray(g0.path) && g0.path.length > 5 ? g0 : null;
}
function saveGhost(){
  if (!S.ghostRec || S.ghostRec.length < 10) return;
  const prev = loadGhost();
  if (prev && prev.score >= S.score) return;
  save('asso-ghost', { date: todayKey(), score: S.score, path: S.ghostRec.slice(0, 9000) });
}
function drawGhost(){
  const G = S.ghost;
  if (!G || isMenuState()) return;
  const i = Math.floor(S.t / 0.1), path = G.path;
  if (i >= path.length){
    // the ghost's run ended here: a short fading puff
    const since = S.t - path.length * 0.1;
    if (since < 1.2){
      const [gx, gy] = path[path.length - 1];
      ctx.globalAlpha = 0.4 * (1 - since / 1.2); ctx.strokeStyle = '#9fd8ff'; ctx.lineWidth = 2*k;
      ctx.beginPath(); ctx.arc(gx * W, gy * H, (14 + since * 40) * k, 0, Math.PI*2); ctx.stroke(); ctx.globalAlpha = 1;
    }
    return;
  }
  const a = path[i], b = path[Math.min(path.length - 1, i + 1)], f = S.t / 0.1 - i;
  const gx = (a[0] + (b[0] - a[0]) * f) * W, gy = (a[1] + (b[1] - a[1]) * f) * H;
  ctx.globalAlpha = 0.38;
  drawPlane(gx, gy, k * 0.9, 1, { body:'#9fd8ff', accent:'#ffffff', glass:'#24305e', shade:'#7cb6dc' });
  ctx.font = `700 ${10*k}px "Chakra Petch", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillStyle = '#fff4e0'; ctx.fillText(L('RECORD ', 'BEST ') + G.score.toLocaleString(NUM), gx, gy + 24*k);
  ctx.globalAlpha = 1;
}
/* ---------- your pilot: a name and an emblem painted on the wing ---------- */
const EMBLEMS = {
  none: '',
  stella: 'M12 2l3 7h7l-5.5 4.5 2 7.5-6.5-4.5-6.5 4.5 2-7.5L2 9h7z',
  fulmine: 'M13 2L4 14h7l-1 8 9-12h-7z',
  cuore: 'M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.2 0 3.6 1.3 5.2 3.1 1.6-1.8 3-3.1 5.2-3.1 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z',
  corona: 'M3 18h18l-1-11-5 4-3-6-3 6-5-4z',
  fiamma: 'M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z',
  ancora: 'M11 3h2v3h3v2h-3v10c3 0 5-2 6-4l2 1c-1 3-4 6-9 6s-8-3-9-6l2-1c1 2 3 4 6 4V8H8V6h3z',
  luna: 'M15 3a9 9 0 1 0 6 15A8 8 0 0 1 15 3z',
  diamante: 'M12 2l8 10-8 10-8-10z'
};
const emblemPaths = {};
let pilot = Object.assign({ name: '', emblem: 'stella' }, load('asso-pilot', {}) || {});
if (!(pilot.emblem in EMBLEMS)) pilot.emblem = 'stella';
function drawEmblem(c2, x, y, size){
  const d = EMBLEMS[pilot.emblem];
  if (!d) return;
  const path = emblemPaths[pilot.emblem] || (emblemPaths[pilot.emblem] = new Path2D(d));
  c2.save(); c2.translate(x - size / 2, y - size / 2); c2.scale(size / 24, size / 24);
  c2.fillStyle = 'rgba(26,21,48,.55)'; c2.translate(1, 1.2); c2.fill(path); c2.translate(-1, -1.2);
  c2.fillStyle = '#ffe36e'; c2.fill(path);
  c2.restore();
}
function renderPilot(){
  $('pilotNameLabel').textContent = L('Nome da pilota', 'Pilot name');
  $('emblemLabel').textContent = L('Stemma sull\'ala', 'Wing emblem');
  $('pilotName').value = pilot.name;
  $('pilotName').placeholder = L('Il tuo nome', 'Your name');
  $('emblemList').innerHTML = Object.entries(EMBLEMS).map(([id, d]) =>
    `<button role="radio" data-emb="${id}" aria-checked="${id === pilot.emblem}" aria-label="${id}">${d ? `<svg viewBox="0 0 24 24"><path d="${d}"/></svg>` : '–'}</button>`).join('');
  const c = $('pilotPreview'), pc = c.getContext('2d'), P = plane();
  pc.clearRect(0, 0, 128, 128);
  g = pc; drawPlane(64, 62, 2.4 * P.size, 1, colOf(P)); g = ctx;
  drawEmblem(pc, 64 - 31 * P.size, 72, 16);
}
$('emblemList').addEventListener('click', e => {
  const b = e.target.closest('button[data-emb]'); if (!b) return;
  pilot.emblem = b.dataset.emb; save('asso-pilot', pilot); renderPilot(); sfx.pick();
});
$('pilotName').addEventListener('input', e => { pilot.name = e.target.value.trim().slice(0, 16); save('asso-pilot', pilot); });
/* ---------- daily login bonus: 7 days in a row, the seventh is a free mystery box ---------- */
const LOGIN_REWARDS = [20, 40, 60, 80, 100, 150, 'box'];
function yesterdayKey(){
  const d = new Date(); d.setDate(d.getDate() - 1);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function checkLogin(){
  if (state !== 'menu') return;   // never interrupt a game: it will show next time the menu opens
  const st = load('asso-login', null) || {};
  const today = todayKey();
  if (st.last === today) return;
  const streak = st.last === yesterdayKey() ? (st.streak % 7) + 1 : 1;
  const reward = LOGIN_REWARDS[streak - 1];
  $('loginEyebrow').textContent = L('Bonus giornaliero', 'Daily bonus');
  $('loginTitle').textContent = L('Giorno ', 'Day ') + streak + (streak > 1 ? L(' di fila!', ' in a row!') : '');
  $('loginDays').innerHTML = LOGIN_REWARDS.map((r, i) => {
    const cls = i + 1 < streak ? 'done' : i + 1 === streak ? 'today' : '';
    const prize = r === 'box' ? '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 18h36v24H6z" fill="#7b5cff"/><path d="M4 12h40v8H4z" fill="#a46be0"/><path d="M21 12h6v30h-6z" fill="#ffe36e"/></svg>' : `<b>${r}</b>`;
    return `<div class="${cls}">${L('G', 'D')}${i + 1}${prize}</div>`;
  }).join('');
  $('loginNote').textContent = reward === 'box'
    ? L('Settimo giorno: una scatola misteriosa gratis! Domani si riparte dal giorno 1.', 'Day seven: a free mystery box! Tomorrow the streak starts over.')
    : L('Torna domani per un premio più grande. Se salti un giorno si riparte da capo.', 'Come back tomorrow for a bigger reward. Skip a day and you start over.');
  $('loginClaim').innerHTML = reward === 'box' ? L('Apri la scatola', 'Open the box') : L('Ritira ', 'Collect ') + coinHTML(reward);
  $('loginClaim').onclick = () => {
    save('asso-login', { last: today, streak });
    initAudio();
    if (reward === 'box'){ openHangar(); openBox(true); return; }
    wallet += reward; save('asso-coins', wallet); refreshMenuStats();
    sfx.buy(); vib(30);
    toMenu();
  };
  state = 'login'; show('loginOv');
}
/* ---------- secret code: tap "Gelu inc." seven times quickly (or the classic code on a keyboard) ---------- */
function unlockSecret(){
  const first = !load('asso-secret', false);
  save('asso-secret', true);
  for (const P of PLANES){
    const idx = LIVERIES[P.id].findIndex(l => l.key === 'rainbow') + 1, key = P.id + ':' + idx;
    if (idx > 0 && !liveryOwned.includes(key)) liveryOwned.push(key);
  }
  save('asso-liveries', liveryOwned);
  initAudio(); sfx.win(); vib([30, 30, 30, 30, 90]);
  toast('<span>' + (first ? L('Codice segreto! Livrea Arcobaleno sbloccata per tutti gli aerei.', 'Secret code! Rainbow paint job unlocked for every plane.')
                          : L('Il codice lo conosci già!', 'You already know the code!')) + '</span>');
  onProgress();
}
(() => {
  let taps = [];
  document.querySelector('#menu .studio').addEventListener('click', () => {
    const now = performance.now();
    taps = taps.filter(t => now - t < 4000); taps.push(now);
    if (taps.length >= 7){ taps = []; unlockSecret(); }
  });
  const KONAMI = ['arrowup','arrowup','arrowdown','arrowdown','arrowleft','arrowright','arrowleft','arrowright','b','a'];
  let pos = 0;
  addEventListener('keydown', e => {
    if (state === 'play') return;
    pos = e.key.toLowerCase() === KONAMI[pos] ? pos + 1 : (e.key.toLowerCase() === KONAMI[0] ? 1 : 0);
    if (pos === KONAMI.length){ pos = 0; unlockSecret(); }
  });
})();
/* ---------- companion drone: follows you, shoots, levels up game after game ---------- */
const DRONE_SHAPES = { disco: L('Disco', 'Disc'), stella: L('Stella', 'Star'), goccia: L('Goccia', 'Drop') };
const DRONE_COLORS = ['#2bb3a6', '#ffe36e', '#ff5d73', '#9fd8ff', '#a46be0'];
let drone = Object.assign({ xp: 0, shape: 'disco', color: '#2bb3a6', on: true }, load('asso-drone', {}) || {});
const DRONE_MAX = 10;
const droneLevel = xp => Math.min(DRONE_MAX, 1 + Math.floor(Math.sqrt(xp / 40)));
const droneXpFor = lvl => 40 * (lvl - 1) * (lvl - 1);
function droneStats(lvl){
  return { rate: Math.max(0.22, 0.7 - 0.05 * (lvl - 1)), twin: lvl >= 4, dmg: lvl >= 7 ? 2 : 1 };
}
function droneGainXp(n){
  if (!drone.on || n <= 0) return;
  const before = droneLevel(drone.xp);
  drone.xp += n; save('asso-drone', drone);
  const after = droneLevel(drone.xp);
  if (after > before) toast('<span>' + L('Il drone è salito al livello ', 'Your drone reached level ') + after + '!</span>');
}
function updateDrone(dt){
  if (!drone.on || S.dead) return;
  const p = S.p, D = S.dr || (S.dr = { x: p.x, y: p.y + 60*k, fire: 0.5, t: 0 });
  const f = Math.min(1, dt * 5);
  D.t += dt;
  D.x += (p.x + Math.sin(D.t * 2) * 14*k - D.x) * f;
  D.y += (p.y + 46*k - D.y) * f;
  if ((D.fire -= dt) <= 0){
    const st = droneStats(droneLevel(drone.xp));
    D.fire = st.rate;
    const shot = ox => S.b.push({ x: D.x + ox, y: D.y - 8*k, vx: 0, vy: -640*k, dmg: st.dmg });
    if (st.twin){ shot(-4*k); shot(4*k); } else shot(0);
  }
}
function drawDroneShape(c2, x, y, sz, shape, color, t){
  c2.save(); c2.translate(x, y);
  c2.fillStyle = 'rgba(26,21,48,.25)'; c2.beginPath(); c2.ellipse(sz * 0.6, sz * 1.1, sz * 0.8, sz * 0.45, 0, 0, Math.PI*2); c2.fill();
  c2.fillStyle = color; c2.strokeStyle = '#fff4e0'; c2.lineWidth = Math.max(1, sz * 0.14);
  if (shape === 'stella'){
    c2.rotate(t * 2);
    c2.beginPath();
    for (let i = 0; i < 8; i++){ const r = i % 2 ? sz * 0.42 : sz; const a = i / 8 * Math.PI * 2; c2.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    c2.closePath(); c2.fill(); c2.stroke();
  } else if (shape === 'goccia'){
    c2.beginPath(); c2.moveTo(0, -sz * 1.15); c2.quadraticCurveTo(sz, 0, 0, sz * 0.75); c2.quadraticCurveTo(-sz, 0, 0, -sz * 1.15); c2.fill(); c2.stroke();
  } else {
    c2.beginPath(); c2.arc(0, 0, sz * 0.8, 0, Math.PI*2); c2.fill(); c2.stroke();
    c2.rotate(t * 20); c2.fillStyle = 'rgba(255,244,224,.45)'; c2.fillRect(-sz * 1.2, -sz * 0.08, sz * 2.4, sz * 0.16);
  }
  c2.fillStyle = '#1a1530'; c2.beginPath(); c2.arc(0, 0, sz * 0.25, 0, Math.PI*2); c2.fill();
  c2.restore();
}
function drawDrone(){
  if (!drone.on || S.dead || !S.dr) return;
  drawDroneShape(ctx, S.dr.x, S.dr.y, 9*k, drone.shape, drone.color, S.dr.t);
}
function renderDrone(){
  const lvl = droneLevel(drone.xp), st = droneStats(lvl);
  $('droneLabel').textContent = 'Drone';
  $('droneLvl').textContent = L('Livello ', 'Level ') + lvl + (lvl >= DRONE_MAX ? ' · MAX' : '');
  const lo = droneXpFor(lvl), hi = droneXpFor(lvl + 1);
  $('droneXp').style.width = (lvl >= DRONE_MAX ? 100 : (drone.xp - lo) / (hi - lo) * 100) + '%';
  $('droneXpTxt').textContent = lvl >= DRONE_MAX ? 'MAX' : (drone.xp - lo) + '/' + (hi - lo) + ' XP';
  $('droneStats').textContent = L('Spara ogni ', 'Fires every ') + st.rate.toFixed(2) + ' s' + (st.twin ? L(' · doppio colpo', ' · twin shot') : '') + (st.dmg > 1 ? L(' · danno doppio', ' · double damage') : '') + L('. Guadagna esperienza con ogni abbattimento.', '. Gains experience with every kill.');
  $('droneOn').setAttribute('aria-pressed', String(drone.on));
  $('droneOnTxt').textContent = drone.on ? L('Attivo', 'On') : L('Spento', 'Off');
  $('droneShape').innerHTML = Object.entries(DRONE_SHAPES).map(([id, n]) => `<button role="radio" data-shape="${id}" aria-checked="${id === drone.shape}">${n}</button>`).join('');
  $('droneColor').innerHTML = DRONE_COLORS.map(c => `<button role="radio" data-col="${c}" aria-checked="${c === drone.color}" style="background:${c}" aria-label="${c}"></button>`).join('');
  const pc = $('dronePreview').getContext('2d');
  pc.clearRect(0, 0, 96, 96);
  drawDroneShape(pc, 46, 44, 22, drone.shape, drone.color, 0.4);
}
$('droneShape').addEventListener('click', e => { const b = e.target.closest('button[data-shape]'); if (!b) return; drone.shape = b.dataset.shape; save('asso-drone', drone); renderDrone(); sfx.pick(); });
$('droneColor').addEventListener('click', e => { const b = e.target.closest('button[data-col]'); if (!b) return; drone.color = b.dataset.col; save('asso-drone', drone); renderDrone(); sfx.pick(); });
$('droneOn').onclick = () => { drone.on = !drone.on; save('asso-drone', drone); renderDrone(); };
/* ---------- encyclopedia: every enemy and boss, hidden until you meet it ---------- */
const ENCY_ENEMIES = [
  ['f', L('Caccia', 'Fighter'), L('Il caccia più comune. Scende dritto e, nelle ondate avanzate, spara.', 'The most common fighter. Flies straight down and shoots in later waves.')],
  ['w', L('Caccia a zig-zag', 'Weaver'), L('Si muove a zig-zag: difficile da centrare, regge due colpi.', 'Weaves side to side: hard to hit, takes two shots.')],
  ['b', L('Bombardiere', 'Bomber'), L('Lento e corazzato, spara a ventaglio. Lascia spesso un bonus.', 'Slow and armoured, fires spreads. Often drops a power-up.')],
  ['k', L('Kamikaze', 'Kamikaze'), L('Si ferma, lampeggia e si lancia dritto verso di te.', 'Stops, flashes, then dives straight at you.')],
  ['h', L('Elicottero', 'Helicopter'), L('Si ferma in alto e spara raffiche mirate, poi se ne va.', 'Hovers up high firing aimed bursts, then leaves.')],
  ['m', L('Mina volante', 'Flying mine'), L('Se non la distruggi in tempo esplode in un anello di proiettili.', 'Destroy it in time or it bursts into a ring of bullets.')],
  ['n', L('Nave da guerra', 'Warship'), L('Naviga sotto di te e spara verso l\'alto con due torrette.', 'Sails below you and fires upward from two turrets.')]
];
const ENCY_BOSSES = [
  ['barone', L('L\'asso nemico: ventagli, anelli e raffiche dalle ali.', 'The enemy ace: spreads, rings and bursts from its wings.')],
  ['dirigibile', L('Enorme e lento: spirali, torrette sui fianchi e mine.', 'Huge and slow: spirals, side turrets and mines.')],
  ['stormo', L('Tre assi in formazione che scendono in picchiata a turno.', 'Three aces in formation who take turns diving at you.')],
  ['fantasma', L('Sparisce e ricompare, lanciando muri di proiettili con un varco.', 'Vanishes and reappears, firing walls of bullets with a gap.')],
  ['colosso', L('La fortezza volante: usa i trucchi di tutti gli altri boss.', 'The flying fortress: uses every other boss\'s tricks.')],
  ['strega', L('Boss di Halloween: evoca pipistrelli e anelli di fuoco.', 'Halloween boss: summons bats and rings of fire.')],
  ['inverno', L('Boss di Natale: fiocchi di ghiaccio e regali esplosivi.', 'Christmas boss: ice flakes and exploding presents.')]
];
// draws one creature into a small canvas by pointing the game's drawing context at it for a moment
function encyPreview(c, kind){
  const pc = c.getContext('2d'), saved = ctx;
  pc.setTransform(1, 0, 0, 1, 0, 0); pc.clearRect(0, 0, c.width, c.height);
  ctx = pc; g = pc;
  pc.translate(c.width / 2, c.height / 2);
  const e = { x: 0, y: 0, t: 0.6, flash: 0, ph: 0, r: 14*k, s: 0.72*k, hp: 1, max: 1, aim: Math.PI / 2, gun: 0, muzzle: 0, rot: Math.PI };
  const B = { x: 0, y: 0, t: 0.6, flash: 0, alpha: 1, turretFlash: 0, enraged: false, members: [] };
  const fit = sc => pc.scale(sc, sc);
  try {
    switch (kind){
      case 'f': fit(2.4); drawPlane(0, 0, 0.72*k, -1, COL_F); break;
      case 'w': fit(2.4); drawPlane(0, 0, 0.72*k, -1, COL_W); break;
      case 'b': fit(1.25); drawPlane(0, 0, 1.45*k, -1, COL_B); break;
      case 'k': fit(2.6); drawPlane(0, 0, 0.62*k, 1, COL_K, 0, Math.PI); break;
      case 'h': fit(1.6); e.s = 0.95*k; drawHeli(e, COL_H); break;
      case 'm': fit(2); drawMine(e); break;
      case 'n': fit(0.55); drawShip(e); break;
      case 'barone': fit(0.7); drawPlane(0, 0, 2.6*k, -1, COL_BOSS); break;
      case 'dirigibile': fit(0.42); drawBlimp(B, false); break;
      case 'stormo': fit(0.9); for (const [ox, oy] of [[-24, 8], [0, -10], [24, 8]]) drawPlane(ox*k, oy*k, 0.8*k, -1, COL_ACE); break;
      case 'fantasma': fit(0.62); drawPlane(0, 0, 3.4*k, -1, COL_GHOST); break;
      case 'colosso': fit(0.4); drawPlane(0, 0, 4.2*k, -1, COL_COLOSSO); break;
      case 'strega': fit(0.8); drawWitch(B); break;
      case 'inverno': fit(0.55); pc.translate(0, -16*k); drawWinterKing(B); break;
    }
  } finally { ctx = saved; g = saved; }
}
function openEncy(){
  state = 'ency';
  $('encyTitle').textContent = T('Enciclopedia');
  $('encyNote').textContent = L('Ogni volta che incontri un nemico nuovo, compare qui.', 'Every new enemy you meet shows up here.');
  $('encyEnemiesLabel').textContent = L('Nemici', 'Enemies');
  $('encyBossesLabel').textContent = 'Boss';
  const card = (id, name, desc, kills, seen) => `<div class="${seen ? '' : 'unseen'}"><canvas data-ency="${id}" width="144" height="144"></canvas>
    <h3>${seen ? name : '???'}</h3><p>${seen ? desc : L('Non ancora incontrato.', 'Not met yet.')}</p>
    ${seen ? `<small>${L('Abbattuti: ', 'Shot down: ')}${kills.toLocaleString(NUM)}</small>` : ''}</div>`;
  $('encyEnemies').innerHTML = ENCY_ENEMIES.map(([id, n, d]) => card(id, n, d, pstats.byType[id] || 0, pstats.seen[id] || pstats.byType[id])).join('');
  $('encyBosses').innerHTML = ENCY_BOSSES.map(([id, d]) => card(id, bossById(id) ? bossById(id).name : (id === 'strega' ? STREGA.name : INVERNO.name), d, pstats.bossCount[id] || 0, pstats.seen[id] || pstats.bossCount[id] || pstats.bossKinds.includes(id))).join('');
  for (const c of document.querySelectorAll('#encyOv canvas[data-ency]')) encyPreview(c, c.dataset.ency);
  show('encyOv');
}
$('encyBtn').onclick = openEncy;
$('encyBack').onclick = () => { state = 'profile'; renderProfile(); show('profileOv'); };
