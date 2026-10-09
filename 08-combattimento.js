/* Asso dei Cieli - Gelu inc. | esplosioni, meteo, abilità speciali, colpi e bonus */

/* ---------- effects ---------- */
// performance: particles are capped, and halved when the phone struggles (see frame())
const perf = { ema: 16.7, slowT: 0, low: load('asso-lowfx', 0) === 1 };
const FX_CAP = () => perf.low ? 220 : 500;
function burst(x, y, n, colors, spd=200, size=4){
  if (perf.low) n = Math.ceil(n / 2);
  n = Math.min(n, FX_CAP() - S.fx.length);
  for (let i = 0; i < n; i++){
    const a = rnd(0, Math.PI*2), v = rnd(0.2, 1) * spd * k;
    S.fx.push({ x, y, vx: Math.cos(a)*v, vy: Math.sin(a)*v, life: rnd(0.4, 0.9), max: 0.9, c: colors[i % colors.length], r: rnd(1.5, size)*k });
  }
}
const FIRE = ['#ffe36e','#ff9a4d','#ff5d73','#fff4e0'];
function explode(e){
  const big = e.type === 'b' || e.type === 'n';
  burst(e.x, e.y, big ? 40 : 18, FIRE, big ? 260 : 180, big ? 6 : 4);
  burst(e.x, e.y, big ? 12 : 6, ['rgba(60,40,70,.8)'], 80, big ? 10 : 7);
  S.shake = Math.max(S.shake, big ? 0.35 : 0.12);
  (sfx['kill_' + e.type] || (big ? sfx.big : sfx.boom))();
}
function addScore(pts, x, y){
  S.combo++; S.comboT = 1.6;
  const m = mult(), v = Math.round(pts * m * S.scoreMul);
  S.score += v;
  S.pop.push({ x, y, txt: '+' + v + (m > 1 ? ' x' + m : ''), life: 0.8 });
  if (m >= 5 && !S.comboDone){ S.comboDone = true; mEvent('combo5'); onProgress(); }
}
function addCoins(n, x, y){
  n = Math.max(1, Math.round(n * S.coinMul));
  S.coins += n;
  S.pop.push({ x, y: y + 16*k, txt: '+' + n + ' ◉', life: 0.9, gold: true });
}
function drop(x, y, chance){
  chance *= S.df.drop;
  if (S.rule === 'nudo' || Math.random() >= chance) return;
  const r = Math.random();
  let kind;
  if (S.p.hp < 3 && r < 0.25) kind = 'h';
  else if (r < 0.52){
    // power-ups thin out as you get stronger
    const pChance = S.p.lvl < 3 ? 1 : S.p.lvl < MAX_LVL ? 0.5 : 0.25;
    kind = Math.random() < pChance ? 'p' : 's';
  }
  else if (r < 0.66) kind = S.p.wing > 0 ? 's' : 'g';
  else if (r < 0.82) kind = 's';
  else kind = S.bombs < ST.maxBombs ? 'b' : 'p';
  S.pk.push({ x, y, kind, t: 0 });
}
function mineBlast(e){
  const n = 8 + Math.min(4, S.level - 3), spd = 150*k;
  for (let i = 0; i < n; i++){ const a = i / n * Math.PI * 2 + e.t; S.eb.push({ x: e.x, y: e.y, vx: Math.cos(a)*spd, vy: Math.sin(a)*spd, r: 5*k }); }
  burst(e.x, e.y, 16, FIRE, 160, 4);
  sfx.boom();
}

/* ---------- weather: rain with lightning, or fog that hides the top of the screen ---------- */
const WEATHER_SUB = { rain: 'Arriva un temporale', fog: 'Nebbia fitta: i nemici sbucano all\'ultimo' };
function setWeather(w){
  S.weather = w || 'clear';
  S.wx = { lightT: rnd(2, 5), flash: 0, drops: [] };
  if (S.weather === 'rain'){
    const n = perf.low ? 50 : 100;
    for (let i = 0; i < n; i++) S.wx.drops.push({ x: rnd(0, W), y: rnd(0, H), len: rnd(10, 22), sp: rnd(700, 1000) });
  }
}
function rollWeather(){
  if (S.daily || S.level < 2) return 'clear';
  const r = Math.random();
  return r < 0.3 ? 'rain' : r < 0.5 ? 'fog' : 'clear';
}
function updateWeather(dt){
  const X = S.wx;
  if (!X) return;
  X.flash = Math.max(0, X.flash - dt * 2.2);
  if (S.weather !== 'rain') return;
  for (const d of X.drops){
    d.y += d.sp * k * dt; d.x -= d.sp * 0.22 * k * dt;
    if (d.y > H + 20){ d.y = -20; d.x = rnd(0, W + 120); }
    if (d.x < -30) d.x += W + 60;
  }
  if ((X.lightT -= dt) <= 0){
    X.lightT = rnd(5, 11); X.flash = 0.9;
    setTimeout(() => sfx.thunder(), rnd(250, 900));
  }
}
function drawFog(){
  if (S.weather !== 'fog') return;
  const g2 = ctx.createLinearGradient(0, 0, 0, H * 0.58);
  g2.addColorStop(0, 'rgba(205,195,220,.93)');
  g2.addColorStop(0.6, 'rgba(205,195,220,.7)');
  g2.addColorStop(1, 'rgba(205,195,220,0)');
  ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H * 0.58);
  const t = performance.now() / 1000;
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 5; i++){
    const x = ((i * 137 + t * 18) % (W + 260)) - 130, y = H * (0.12 + (i % 3) * 0.12);
    ctx.drawImage(cloudImg, x - 140*k, y - 60*k, 280*k, 130*k);
  }
  ctx.globalAlpha = 1;
}
function drawRain(){
  const X = S.wx;
  if (!X) return;
  if (S.weather === 'rain'){
    ctx.fillStyle = 'rgba(20,24,52,.2)'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(205,225,255,.38)'; ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (const d of X.drops){ ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + d.len * 0.22 * k, d.y - d.len * k); }
    ctx.stroke();
  }
  if (X.flash > 0){
    ctx.globalAlpha = Math.min(0.75, X.flash * (Math.random() < 0.15 ? 0.4 : 1));
    ctx.fillStyle = '#eef2ff'; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }
}

/* ---------- special abilities: one per plane, charged by kills ---------- */
const ABILITY = {
  falco:   { name:'Raffica',          desc:'Spari tripli e potenziati per qualche secondo', dur:3.5 },
  rondine: { name:'Scatto',           desc:'Invulnerabile, travolgi chi tocchi',             dur:3 },
  toro:    { name:'Muraglia',         desc:'Una cupola che ferma i proiettili',              dur:4.5 },
  vespa:   { name:'Sciame',           desc:'Tre anelli di colpi in tutte le direzioni',      dur:1.2 },
  fenice:  { name:'Ondata di fuoco',  desc:'Un anello di fuoco brucia tutto lo schermo',     dur:1.3 },
  spettro: { name:'Eclissi',          desc:'Il tempo rallenta per tutti tranne te',          dur:4.5 }
};
function useSpecial(){
  if (state !== 'play' || S.dead || S.ab || S.sp < 1) return;
  const id = plane().id;
  S.sp = 0; S.ab = { id, t: 0, dur: ABILITY[id].dur, pulses: 0, hit: new Set(), bossHit: false };
  S.pop.push({ x: S.p.x, y: S.p.y - 40*k, txt: ABILITY[id].name + '!', life: 1.2, gold: true });
  sfx.special(); vib([30, 30, 60]);
  updateHUD(true);
}
function updateAbility(dt){
  const A = S.ab, p = S.p;
  if (!A) return;
  A.t += dt;
  if (A.id === 'rondine'){
    if (Math.random() < 0.7) S.fx.push({ x: p.x + rnd(-6, 6)*k, y: p.y + 18*k, vx: 0, vy: 160*k, life: 0.35, max: 0.35, c: 'rgba(159,216,255,.8)', r: 4*k });
    for (const e of S.en){
      if (e.dead || e.type === 'n' || dist2(e, p) > (e.r + 26*k) ** 2) continue;
      e.hp -= 10; e.flash = 0.1;
      if (e.hp <= 0){ e.dead = true; kill(e); }
    }
  } else if (A.id === 'toro'){
    const R = 62*k;
    for (const b of S.eb) if (!b.dead && dist2(b, p) < R * R){ b.dead = true; burst(b.x, b.y, 2, ['#ffe36e', '#fff4e0'], 80, 2); }
    for (const e of S.en){
      if (e.dead || e.type === 'n' || A.hit.has(e) || dist2(e, p) > (R + e.r) ** 2) continue;
      A.hit.add(e); e.hp -= 6; e.flash = 0.12;
      if (e.hp <= 0){ e.dead = true; kill(e); }
    }
  } else if (A.id === 'vespa'){
    while (A.pulses < 3 && A.t >= A.pulses * 0.4){
      const n = 20, off = A.pulses * 0.15;
      for (let i = 0; i < n; i++){ const a = off + i / n * Math.PI * 2; S.b.push({ x: p.x, y: p.y, vx: Math.cos(a) * 560*k, vy: Math.sin(a) * 560*k, dmg: 2, big: true }); }
      A.pulses++; sfx.shoot();
    }
  } else if (A.id === 'fenice'){
    const R = A.t / A.dur * Math.hypot(W, H);
    for (const b of S.eb) if (!b.dead && dist2(b, p) < R * R) b.dead = true;
    for (const e of S.en){
      if (e.dead || A.hit.has(e) || dist2(e, p) > (R + (e.hh || e.r)) ** 2) continue;
      A.hit.add(e); e.hp -= 9; e.flash = 0.15;
      if (e.hp <= 0){ e.dead = true; kill(e); }
    }
    const B = S.boss;
    if (B && !B.entering && !A.bossHit && dist2(B, p) < R * R){
      A.bossHit = true;
      if (B.kind === 'stormo'){ for (const m of B.members) if (!m.dead) damageBoss(B, m, 10); }
      else damageBoss(B, B, 30);
      if (B.hp <= 0) killBoss();
    }
  }
  if (A.t >= A.dur) S.ab = null;
}
function drawAbility(){
  const A = S.ab, p = S.p;
  if (!A || S.dead) return;
  const fade = Math.min(1, (A.dur - A.t) * 3);
  if (A.id === 'spettro'){
    ctx.globalAlpha = 0.16 * fade; ctx.fillStyle = '#7b5cff'; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 0.6 * fade; ctx.strokeStyle = '#c9d6ff'; ctx.lineWidth = 2*k;
    ctx.beginPath(); ctx.arc(p.x, p.y, 34*k, -Math.PI/2, -Math.PI/2 + Math.PI * 2 * (1 - A.t / A.dur)); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (A.id === 'toro'){
    const R = 62*k, t = performance.now() / 1000;
    ctx.globalAlpha = fade;
    ctx.fillStyle = 'rgba(255,227,110,.12)'; ctx.strokeStyle = `rgba(255,227,110,${0.7 + Math.sin(t * 9) * 0.2})`; ctx.lineWidth = 3*k;
    ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.globalAlpha = 1;
  } else if (A.id === 'rondine'){
    ctx.globalAlpha = 0.5 * fade; ctx.strokeStyle = '#9fd8ff'; ctx.lineWidth = 3*k;
    ctx.beginPath(); ctx.arc(p.x, p.y, 30*k, 0, Math.PI*2); ctx.stroke(); ctx.globalAlpha = 1;
  } else if (A.id === 'falco'){
    ctx.globalAlpha = 0.45 * fade; ctx.fillStyle = '#ffe36e';
    ctx.beginPath(); ctx.ellipse(p.x, p.y - 26*k, 10*k, 16*k, 0, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1;
  } else if (A.id === 'fenice'){
    const R = A.t / A.dur * Math.hypot(W, H);
    ctx.globalAlpha = Math.max(0, 1 - A.t / A.dur);
    ctx.strokeStyle = '#ff7a3d'; ctx.lineWidth = 22*k;
    ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle = '#ffe36e'; ctx.lineWidth = 8*k;
    ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, Math.PI*2); ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

/* ---------- actions ---------- */
function useBomb(){
  if (state !== 'play' || S.bombs <= 0 || S.dead) return;
  S.bombs--; S.flash = 0.5; S.shake = 0.6; S.p.inv = Math.max(S.p.inv, 0.6);
  sfx.bomb(); vib([40, 30, 80]);
  mEvent('bomb');
  for (const b of S.eb) burst(b.x, b.y, 2, ['#ffe36e','#fff4e0'], 60, 2.5);
  S.eb = [];
  for (const e of S.en){ e.hp -= 8; e.flash = 0.15; if (e.hp <= 0 && !e.dead){ e.dead = true; kill(e); } }
  const B = S.boss;
  if (B && !B.entering){
    if (B.kind === 'stormo'){ for (const m of B.members) if (!m.dead) damageBoss(B, m, 12); }
    else damageBoss(B, B, 22);
    if (B.hp <= 0) killBoss();
  }
  updateHUD();
}
function hurt(){
  const p = S.p;
  if (p.inv > 0 || S.dead || (S.ab && (S.ab.id === 'rondine' || S.ab.id === 'toro'))) return;
  if (S.zen) return zenHit();
  if (p.shield){
    p.shield = false; p.inv = 1.0; sfx.shield(); vib(30);
    burst(p.x, p.y, 24, ['#4f7cff','#fff4e0'], 220, 3);
    return;
  }
  p.hp--; p.inv = S.df.inv; S.combo = 0;
  if (p.lvl > 1){ p.lvl--; S.pop.push({ x: p.x, y: p.y - 30*k, txt: T('Potenza') + ' ' + p.lvl, life: 1 }); }
  if (p.wing > 0){ p.wing = 0; for (const w of p.wings) burst(w.x, w.y, 14, FIRE, 160, 3); }
  if (S.boss) S.bossHit = true;
  S.shake = 0.45; sfx.hurt(); vib(120);
  burst(p.x, p.y, 20, ['#fff4e0','#ff5d73','#ffe36e'], 220);
  if (p.hp <= 0 && plane().revive && !S.revived){
    // the Fenice rises once per run
    S.revived = true; p.hp = 2; p.inv = 3; p.shield = true;
    S.eb = []; S.flash = 0.6;
    burst(p.x, p.y, 70, ['#ff7a3d','#ffe36e','#fff4e0','#ff5d73'], 360, 7);
    setBanner('La Fenice rinasce', 'Hai un\'ultima possibilità', 2.4);
    sfx.win(); vib([60, 40, 120]);
    return;
  }
  if (p.hp <= 0){
    S.dead = 1.4;
    burst(p.x, p.y, 60, FIRE, 320, 7);
    sfx.big(); vib([100, 50, 200]);
  }
}
function kill(e){
  explode(e); S.kills++;
  if (!S.ab) S.sp = Math.min(1, S.sp + e.pts / 2200);
  addScore(e.pts, e.x, e.y);
  addCoins(e.coin, e.x, e.y);
  if (e.coin >= 4) sfx.coin();
  drop(e.x, e.y, e.type === 'n' ? 0.6 : e.type === 'b' ? 0.45 : e.type === 'h' ? 0.2 : 0.045);
  mEvent('kill_' + e.type);
  if (S.mission && S.mission.kt === e.type) S.ktCount++;
  pstats.kills++; pstats.byType[e.type] = (pstats.byType[e.type] || 0) + 1;
  onProgress();
}
function killBoss(){
  const b = S.boss;
  if (!b) return;
  const tall = b.kind === 'dirigibile' ? 70 : 30;
  for (let i = 0; i < 6; i++) burst(b.x + rnd(-60, 60)*k, b.y + rnd(-tall, tall)*k, 30, FIRE, 340, 8);
  burst(b.x, b.y, 30, ['rgba(60,40,70,.8)'], 140, 14);
  S.shake = 0.8; S.flash = 0.35; sfx.big(); vib([80, 40, 160]);
  if (!reduceMotion) S.slow = 1.1;
  S.kills++;
  addScore(3000 * S.level, b.x, b.y);
  addCoins(40 * S.level, b.x, b.y + 20*k);
  if (S.rule !== 'nudo'){
    S.pk.push({ x: b.x - 30*k, y: b.y, kind: S.bombs < ST.maxBombs ? 'b' : 's', t: rnd(0, 2) });
    S.pk.push({ x: b.x + 30*k, y: b.y, kind: S.p.hp < 3 ? 'h' : (S.p.lvl < MAX_LVL ? 'p' : 's'), t: rnd(0, 2) });
  }
  // rare piece toward the secret plane: it falls slowly, catch it before it leaves the screen
  if (pieces < PIECES_NEEDED) S.pk.push({ x: b.x, y: b.y + 40*k, kind: 'x', t: 0 });
  mEvent('boss');
  pstats.bosses++; S.bossKills = (S.bossKills || 0) + 1;
  pstats.bossCount[b.kind] = (pstats.bossCount[b.kind] || 0) + 1;
  if (!pstats.bossKinds.includes(b.kind)) pstats.bossKinds.push(b.kind);
  if (!S.bossHit) S.nohitDone = true;
  saveStats(); onProgress();
  if (!S.bossHit) mEvent('nohit');
  S.eb = [];
  S.boss = null;
  S.phase = 'clear'; S.phaseT = 3.2;
  if (S.campaign){ missionWin(); return; }
  if (S.rush){ S.rush.idx++; setBiome(BIOMES[S.rush.idx % BIOMES.length]); if (S.rush.idx >= S.rush.list.length){ rushWin(); return; } }
  setBanner(b.name + L(' abbattuto', ' down'), 'Bonus +' + (3000 * S.level) + L(' e ', ' and ') + (40 * S.level) + L(' monete', ' coins'), 3);
  sfx.win();
}

