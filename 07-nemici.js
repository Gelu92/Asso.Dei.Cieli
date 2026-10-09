/* Asso dei Cieli - Gelu inc. | nemici, boss e pioggia d'oro */

/* ---------- spawning ---------- */
// enemies get tougher as the wave number and your own weapon power grow
const toughness = () => (1 + 0.22 * (S.p.lvl - 1) + 0.12 * (S.level - 1)) * S.df.hp;
const diff = () => 1 + (S.level - 1) * 0.3 + S.lt / 70;
const effT = () => S.lt + (S.level - 1) * 20;
// spawn randomness can be seeded, so a daily challenge or a party turn sends everyone the same enemies
function mulberry32(a){
  return function(){
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
let srng = Math.random;
const srnd = (a, b) => a + srng() * (b - a);
const hashStr = str => { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
function makeEnemy(type, x){
  const d = Math.sqrt(diff()), m = 30 * k;
  const e = { type, x: x ?? srnd(m, W - m), y: -40 * k, flash: 0, t: 0, ph: srnd(0, 6), cd: srnd(1.2, 2.5), st: 'in' };
  switch (type){
    case 'f': Object.assign(e, { vy: srnd(120,170)*d*k, r: 15*k, s: 0.72*k, hp: 1, pts: 100, coin: 1 }); break;
    case 'w': { const amp = srnd(40,80)*k; Object.assign(e, { vy: srnd(90,120)*d*k, r: 15*k, s: 0.72*k, hp: 2, pts: 150, coin: 2, amp, x0: clamp(e.x, m+amp, W-m-amp) }); break; }
    case 'b': Object.assign(e, { vy: 55*k, r: 30*k, s: 1.45*k, hp: 6 + (S.level - 1) * 2, pts: 400, coin: 5, cd: srnd(0.6, 1.2) }); break;
    case 'k': Object.assign(e, { vy: 160*k, r: 13*k, s: 0.62*k, hp: 1, pts: 120, coin: 2, rot: Math.PI }); break;
    case 'h': Object.assign(e, { vy: 130*k, r: 18*k, s: 0.95*k, hp: 4 + (S.level - 1), pts: 250, coin: 4, ty: srnd(H*0.12, H*0.32), cd: 0.8 }); break;
    case 'm': Object.assign(e, { vy: 65*d*k, r: 14*k, hp: 3, pts: 80, coin: 1 }); break;
    case 'n': Object.assign(e, { y: -80*k, vy: 42*k, r: 14*k, hw: 15*k, hh: 60*k, hp: 14, pts: 600, coin: 8, cd: 1.4, gun: 0, x: srnd(40*k, W - 40*k) }); break;
  }
  e.hp = Math.max(1, Math.round(e.hp * toughness()));
  if (S.escort) e.tg = srng() < 0.55 ? 'escort' : 'player';
  e.max = e.hp;
  S.en.push(e);
  pstats.seen[type] = 1;
  return e;
}
function spawn(){
  if (S.rule === 'kamikaze'){ makeEnemy('k'); if (srng() < 0.25) makeEnemy('k'); return; }
  if (S.mission && S.mission.pool){
    const pool = S.mission.pool;
    let r = srng() * pool.reduce((a, q) => a + q[1], 0), pick = 'f';
    for (const [t, w] of pool){ if ((r -= w) <= 0){ pick = t; break; } }
    if (pick === 'n' && S.en.some(e => e.type === 'n')) pick = 'f';
    makeEnemy(pick); return;
  }
  const lt = effT();
  const pool = [['f', 4]];
  if (S.rule === 'mine') pool.push(['m', 1.6]);
  if (lt > 8) pool.push(['w', 3]);
  if (lt > 14) pool.push(['sq', 2]);
  if (lt > 20) pool.push(['b', Math.min(1.8, 0.5 + lt/60)]);
  if (S.level >= 2 || S.lt > 15) pool.push(['k', 1.6]);
  if (S.level >= 2) pool.push(['h', 1.1]);
  if (S.level >= 3) pool.push(['m', 1.3]);
  if (S.level >= 2 && isWater() && !S.en.some(e => e.type === 'n')) pool.push(['n', 0.7]);   // one warship at a time
  let r = srng() * pool.reduce((a, p) => a + p[1], 0), pick = 'f';
  for (const [t, w] of pool){ if ((r -= w) <= 0){ pick = t; break; } }
  if (pick === 'sq'){
    const cx = srnd(70*k, W - 70*k);
    makeEnemy('f', cx);
    makeEnemy('f', cx - 40*k).y -= 30*k;
    makeEnemy('f', cx + 40*k).y -= 30*k;
  } else makeEnemy(pick);
}
/* ---------- bosses: four of them, then they come back stronger ---------- */
const BOSSES = [
  { id:'barone',     name:'Barone Rosso',  hp:110 },
  { id:'dirigibile', name:'Il Dirigibile', hp:190 },
  { id:'stormo',     name:'Stormo Nero',   hp:48 },    // per aircraft, three of them
  { id:'fantasma',   name:'Ala Fantasma',  hp:150 }
];
const BOSS_SUB = {
  barone: 'Il caccia pesante nemico',
  dirigibile: 'Lento, enorme e pieno di cannoni',
  stormo: 'Tre assi in formazione',
  fantasma: 'Sparisce e ricompare',
  colosso: 'La fortezza volante del nemico',
  strega: L('Arriva sulla scopa con i suoi pipistrelli', 'Here she comes on her broom, with her bats'),
  inverno: L('Porta ghiaccio e regali esplosivi', 'He brings ice and exploding presents')
};
const bossDef = lvl => BOSSES[(lvl - 1) % BOSSES.length];
const bossTier = lvl => Math.floor((lvl - 1) / BOSSES.length);
const bossName = lvl => bossDef(lvl).name + ['', ' II', ' III', ' IV', ' V'][Math.min(4, bossTier(lvl))];
const shootEB = (x, y, a, spd, r = 5*k, c) => S.eb.push({ x, y, vx: Math.cos(a)*spd, vy: Math.sin(a)*spd, r, c });
const aimAt = (x, y, p) => Math.atan2(p.y - y, p.x - x);

const COLOSSO = { id:'colosso', name:'Il Colosso', hp:240 };
const bossById = id => id === 'colosso' ? COLOSSO : id === 'strega' ? STREGA : id === 'inverno' ? INVERNO : BOSSES.find(b => b.id === id);
const curBossDef = () => S.event ? (S.event === 'halloween' ? STREGA : INVERNO) : S.rush ? bossById(S.rush.list[S.rush.idx]) : S.mission && S.mission.boss ? (S.mission.boss === 'colosso' ? COLOSSO : BOSSES.find(b => b.id === S.mission.boss)) : bossDef(S.level);
const curBossName = () => S.event || S.rush || (S.mission && S.mission.boss) ? curBossDef().name : bossName(S.level);
function makeBoss(){
  const d = curBossDef();
  pstats.seen[d.id] = 1;
  const hp = Math.round(d.hp * 1.35 * (1 + 0.45 * (S.level - 1)) * (1 + 0.12 * (S.p.lvl - 1)) * S.df.hp);
  const B = { kind: d.id, name: curBossName(), x: W/2, y: -140*k, ty: H*0.2, hp, max: hp,
              t: 0, cd: 1.2, pat: 0, burst: 0, flash: 0, entering: true, alpha: 1, turretFlash: 0 };
  if (d.id === 'barone') Object.assign(B, { s: 2.6*k, hw: 60*k, hh: 34*k });
  if (d.id === 'dirigibile') Object.assign(B, { y: -240*k, hw: 40*k, hh: 82*k });
  if (d.id === 'strega') Object.assign(B, { hw: 40*k, hh: 36*k });
  if (d.id === 'inverno') Object.assign(B, { hw: 50*k, hh: 46*k });
  if (d.id === 'colosso') Object.assign(B, { s: 4.2*k, hw: 95*k, hh: 45*k, ty: H*0.18, y: -200*k });
  if (d.id === 'fantasma') Object.assign(B, { s: 3.4*k, hw: 64*k, hh: 34*k, phaseF: 'fight', ft: 4.5 });
  if (d.id === 'stormo'){
    B.members = [-1, 0, 1].map(i => ({ ox: i*72*k, oy: i ? 0 : -34*k, hp, max: hp, flash: 0,
      cd: 1 + (i + 1) * 0.4, state: 'form', x: W/2 + i*72*k, y: -140*k - (i ? 0 : 40*k) }));
    B.hp = B.max = hp * 3; B.diveT = 3.5;
  }
  S.boss = B;
}

function enrage(B){
  B.enraged = true; B.rageT = 1.2;
  S.shake = Math.max(S.shake, 0.45); B.flash = 0.25;
  setBanner('Furia!', B.name + L(' è infuriato', ' is enraged'), 1.8);
  sfx.warn(); vib([50, 40, 50]);
}
// second phase: one extra attack per boss, every few seconds
function rageAttack(B, p, spd){
  if (B.kind === 'strega'){
    for (let i = 0; i < 20; i++) shootEB(B.x, B.y, B.t * 3 + i / 20 * Math.PI * 2, spd * 0.7, 5*k, '#ff8a1f');
    for (const ox of [-30, 30]){ const bat = makeEnemy('f', B.x + ox*k); bat.y = B.y; }
  } else if (B.kind === 'inverno'){
    for (const off of [0, Math.PI / 18]) for (let i = 0; i < 18; i++) shootEB(B.x, B.y, off + B.t + i / 18 * Math.PI * 2, spd * (off ? 0.55 : 0.75), 5*k, '#bfe6ff');
  } else if (B.kind === 'barone' || B.kind === 'colosso'){
    const n = B.kind === 'colosso' ? 22 : 16;
    for (let i = 0; i < n; i++) shootEB(B.x, B.y, B.t * 2 + i / n * Math.PI * 2, spd * 0.7);
  } else if (B.kind === 'dirigibile'){
    for (const sx of [-1, 1]){ const kz = makeEnemy('k', B.x + sx * 50*k); kz.y = B.y + 20*k; }
    sfx.dash();
  } else if (B.kind === 'stormo'){
    for (const m of B.members) if (!m.dead)
      for (let i = 0; i < 8; i++) shootEB(m.x, m.y, i / 8 * Math.PI * 2 + B.t, spd * 0.75);
  } else {
    // two lances from the screen edges, crossing where you are
    for (const x0 of [8, W - 8]){
      const a = aimAt(x0, B.y, p);
      for (let i = 0; i < 5; i++) shootEB(x0 - Math.cos(a) * i * 22*k, B.y - Math.sin(a) * i * 22*k, a, spd * 0.95);
    }
  }
}
function nextWave(){
  S.level++; S.lt = 0; S.phase = 'wave'; S.spawn = 1.2;
  setBiome(biomeForLevel(S.level));
  sky.from = sky.to; sky.to = skyIndex(S.level); sky.mix = 0;
  const subs = { 2: 'Elicotteri e navi da guerra', 3: 'Cala la notte. Attento alle mine' };
  setWeather(rollWeather());
  setBanner(L('Ondata ', 'Wave ') + S.level, WEATHER_SUB[S.weather] || (S.level <= 5 && BIOME_SUB[biome.to]) || subs[S.level] || 'I nemici sono più veloci');
  mEvent('wave', S.level); mEvent('score', S.score);
  pstats.bestWave = Math.max(pstats.bestWave, S.level); onProgress();
}
/* ---------- gold rain: a short breather with coins falling from the sky ---------- */
function startGold(after){
  S.phase = 'gold'; S.goldT = 8; S.goldAfter = after; S.goldSpawn = 0;
  setBanner(L('Pioggia d\'oro!', 'Golden rain!'), L('Prendi più monete che puoi', 'Grab as many coins as you can'), 2.2);
  sfx.win();
}
function updateGold(dt){
  S.goldT -= dt;
  if ((S.goldSpawn -= dt) <= 0 && S.goldT > 0.8){
    S.goldSpawn = 0.11;
    S.pk.push({ x: rnd(24*k, W - 24*k), y: -20*k, kind: 'c', v: Math.random() < 0.15 ? 5 : Math.random() < 0.4 ? 2 : 1, t: rnd(0, 6) });
    if (Math.random() < 0.025 && S.rule !== 'nudo') S.pk.push({ x: rnd(30*k, W - 30*k), y: -20*k, kind: ['p', 's', 'b', 'g'][Math.floor(Math.random() * 4)], t: 0 });
  }
  if (S.goldT <= 0){ const after = S.goldAfter; S.goldAfter = null; after(); }
}
function updateBoss(B, dt, p){
  B.t += dt; B.flash = Math.max(0, B.flash - dt); B.turretFlash = Math.max(0, B.turretFlash - dt);
  const spd = (205 + S.level * 20) * k * (B.enraged ? 1.08 : 1);
  if (!B.entering && !B.enraged && B.hp <= B.max * 0.5) enrage(B);
  if (B.enraged && !S.dead && (B.rageT -= dt) <= 0){ rageAttack(B, p, spd); B.rageT = 2.6; }
  dt = B.enraged ? dt * 1.3 : dt;   // everything else runs faster in the second phase
  if (B.kind === 'stormo') updateStormo(B, dt, p, spd);
  else if (B.entering){
    B.y += (B.kind === 'dirigibile' ? 75 : 95) * k * dt;
    if (B.y >= B.ty){ B.y = B.ty; B.entering = false; B.t = 0; }
  } else {
    if (B.kind === 'barone') updateBarone(B, dt, p, spd);
    else if (B.kind === 'dirigibile') updateDirigibile(B, dt, p, spd);
    else if (B.kind === 'colosso') updateColosso(B, dt, p, spd);
    else if (B.kind === 'strega') updateStrega(B, dt, p, spd);
    else if (B.kind === 'inverno') updateInverno(B, dt, p, spd);
    else updateFantasma(B, dt, p, spd);
    if (!S.dead && p.inv <= 0 && B.alpha > 0.5 &&
        Math.abs(p.x - B.x) < B.hw*0.8 + p.r && Math.abs(p.y - B.y) < B.hh*0.8 + p.r) hurt();
  }
  if (!B.entering){
    for (const b of S.b){
      if (b.dead) continue;
      const target = bossTarget(B, b);
      if (!target) continue;
      b.dead = true;
      damageBoss(B, target, b.dmg || 1);
      if (Math.random() < 0.3) sfx.hit();
      burst(b.x, b.y, 2, ['#ffe36e','#fff4e0'], 90, 2.5);
    }
  }
  if (B.hp <= 0) killBoss();
}
function bossTarget(B, b){
  if (B.kind === 'stormo'){
    for (const m of B.members) if (!m.dead && dist2(b, m) < (26*k) ** 2) return m;
    return null;
  }
  if (B.alpha < 0.5) return null;
  return (Math.abs(b.x - B.x) < B.hw && Math.abs(b.y - B.y) < B.hh) ? B : null;
}
function damageBoss(B, target, dmg){
  target.hp -= dmg; target.flash = 0.06;
  if (!S.ab) S.sp = Math.min(1, S.sp + dmg * 0.0025);
  if (B.kind !== 'stormo') return;
  if (target.hp <= 0 && !target.dead){
    target.dead = true;
    burst(target.x, target.y, 36, FIRE, 280, 6);
    S.shake = Math.max(S.shake, 0.4); sfx.big(); vib(60);
    addScore(800 * S.level, target.x, target.y);
    addCoins(8, target.x, target.y);
  }
  B.hp = B.members.reduce((a, m) => a + Math.max(0, m.hp), 0);
}

function updateBarone(B, dt, p, spd){
  B.x = W/2 + Math.sin(B.t * 0.7) * Math.max(0, W/2 - 70*k);
  B.y = B.ty + Math.sin(B.t * 1.3) * 18*k;
  if (S.dead || (B.cd -= dt * S.df.fire) > 0) return;
  const a = aimAt(B.x, B.y, p), pat = B.pat % 3;
  if (pat === 0){
    for (let i = -2; i <= 2; i++) shootEB(B.x, B.y + 30*k, a + i*0.16, spd, 5.5*k);
    B.cd = 1.1; B.pat++;
  } else if (pat === 1){
    const n = 12 + S.level * 2;
    for (let i = 0; i < n; i++) shootEB(B.x, B.y, B.t + i / n * Math.PI * 2, spd*0.8);
    B.cd = 1.5; B.pat++;
  } else {
    shootEB(B.x - 34*k, B.y + 10*k, a, spd*1.2);
    shootEB(B.x + 34*k, B.y + 10*k, a, spd*1.2);
    B.burst++;
    if (B.burst >= 4){ B.burst = 0; B.cd = 1.2; B.pat++; } else B.cd = 0.22;
  }
}

const TURRETS = [[-30,-44],[30,-44],[-30,34],[30,34]];
function updateDirigibile(B, dt, p, spd){
  B.x = W/2 + Math.sin(B.t * 0.35) * Math.max(0, W/2 - 60*k);
  B.y = B.ty + Math.sin(B.t * 0.8) * 8*k;
  if (S.dead || (B.cd -= dt * S.df.fire) > 0) return;
  const pat = B.pat % 3;
  if (pat === 0){
    // double spiral from the nose
    const a = B.t * 3.2;
    shootEB(B.x, B.y + 60*k, a, spd*0.62);
    shootEB(B.x, B.y + 60*k, a + Math.PI, spd*0.62);
    B.burst++; B.cd = 0.09;
    if (B.burst >= 28){ B.burst = 0; B.cd = 1.2; B.pat++; }
  } else if (pat === 1){
    // broadside from all four turrets
    for (const [ox, oy] of TURRETS){
      const x = B.x + ox*k, y = B.y + oy*k, a = aimAt(x, y, p);
      for (const o of [-0.12, 0, 0.12]) shootEB(x, y, a + o, spd*0.85, 4.5*k);
    }
    B.turretFlash = 0.18; B.cd = 1.5; B.pat++;
  } else {
    // drops two mines
    for (const ox of [-26, 26]){ const m = makeEnemy('m', B.x + ox*k); m.y = B.y + 70*k; }
    B.cd = 1.2; B.pat++;
  }
}

// the Colosso mixes every other boss's tricks, and launches fighters from its belly
function updateColosso(B, dt, p, spd){
  B.x = W/2 + Math.sin(B.t * 0.4) * Math.max(0, W/2 - 120*k);
  B.y = B.ty + Math.sin(B.t * 0.9) * 10*k;
  if (S.dead || (B.cd -= dt * S.df.fire) > 0) return;
  const pat = B.pat % 4;
  if (pat === 0){
    for (const ox of [-80, 80]){
      const x = B.x + ox*k, y = B.y + 10*k, a = aimAt(x, y, p);
      for (let i = -3; i <= 3; i++) shootEB(x, y, a + i * 0.11, spd * 0.9);
    }
    B.cd = 1.3; B.pat++;
  } else if (pat === 1){
    const a = B.t * 3;
    for (let j = 0; j < 3; j++) shootEB(B.x, B.y + 40*k, a + j * Math.PI * 2 / 3, spd * 0.6);
    B.burst++; B.cd = 0.1;
    if (B.burst >= 24){ B.burst = 0; B.cd = 1.1; B.pat++; }
  } else if (pat === 2){
    const n = Math.max(8, Math.round(W / (26*k))), gap = Math.floor(rnd(1, n - 4));
    for (let i = 0; i < n; i++){
      if (i >= gap && i < gap + 3) continue;
      S.eb.push({ x: (i + 0.5) * W / n, y: B.y + 40*k, vx: 0, vy: spd * 0.55, r: 5*k });
    }
    B.cd = 1.6; B.pat++;
  } else {
    for (const ox of [-40, 0, 40]){ const f = makeEnemy('f', B.x + ox*k); f.y = B.y + 40*k; }
    makeEnemy('k', B.x).y = B.y + 30*k;
    sfx.dash(); B.cd = 1.4; B.pat++;
  }
}
function updateFantasma(B, dt, p, spd){
  if (B.phaseF === 'fight'){
    B.x = clamp(B.x + Math.sin(B.t * 1.6) * 110*k*dt, 70*k, W - 70*k);
    B.y = B.ty + Math.sin(B.t * 1.1) * 14*k;
    B.ft -= dt;
    if (B.ft <= 0){ B.phaseF = 'out'; B.ft = 0.6; sfx.shield(); }
    if (!S.dead && (B.cd -= dt * S.df.fire) <= 0){
      if (B.pat % 2 === 0){
        // wall of shots with a gap
        const n = Math.max(8, Math.round(W / (26*k))), gap = Math.floor(rnd(1, n - 4));
        for (let i = 0; i < n; i++){
          if (i >= gap && i < gap + 3) continue;
          S.eb.push({ x: (i + 0.5) * W / n, y: B.y + 24*k, vx: 0, vy: spd*0.6, r: 5*k });
        }
        B.cd = 1.5; B.pat++;
      } else {
        // fast lance aimed at you
        shootEB(B.x, B.y + 24*k, aimAt(B.x, B.y, p), spd*1.35);
        B.burst++; B.cd = 0.07;
        if (B.burst >= 6){ B.burst = 0; B.cd = 1.0; B.pat++; }
      }
    }
  } else if (B.phaseF === 'out'){
    B.ft -= dt; B.alpha = Math.max(0.05, B.ft / 0.6);
    if (B.ft <= 0){
      B.phaseF = 'in'; B.ft = 0.6;
      B.x = rnd(80*k, W - 80*k); B.ty = rnd(H*0.14, H*0.26); B.y = B.ty;
    }
  } else {
    B.ft -= dt; B.alpha = Math.min(1, 1 - B.ft / 0.6);
    if (B.ft <= 0){
      B.phaseF = 'fight'; B.ft = rnd(3.5, 4.5); B.alpha = 1; B.cd = 0.5;
      const n = 10 + S.level;
      for (let i = 0; i < n; i++) shootEB(B.x, B.y, B.t + i / n * Math.PI * 2, spd*0.65);
    }
  }
}

function updateStormo(B, dt, p, spd){
  const alive = B.members.filter(m => !m.dead);
  B.x = W/2 + Math.sin(B.t * 0.8) * Math.max(0, W/2 - 110*k);
  B.y = H*0.18 + Math.sin(B.t * 1.5) * 12*k;
  if (B.entering && B.t > 1.8) B.entering = false;
  for (const m of alive){
    m.flash = Math.max(0, m.flash - dt);
    if (m.state === 'form'){
      const f = Math.min(1, dt * 3);
      m.x += (B.x + m.ox - m.x) * f; m.y += (B.y + m.oy - m.y) * f;
      if (!B.entering && !S.dead && (m.cd -= dt * S.df.fire) <= 0){
        m.cd = rnd(1.0, 1.5) - Math.min(0.4, S.level * 0.04);
        const a = aimAt(m.x, m.y, p);
        for (const o of [-0.1, 0.1]) shootEB(m.x, m.y + 16*k, a + o, spd);
      }
    } else {
      m.y += 400*k*dt; m.x += (m.tx - m.x) * Math.min(1, dt * 2.5);
      if (m.y > H + 60*k){ m.state = 'form'; m.y = -70*k; m.x = B.x + m.ox; }
    }
    if (!S.dead && p.inv <= 0 && dist2(m, p) < (22*k + p.r) ** 2) hurt();
  }
  if (B.entering) return;
  B.diveT -= dt;
  if (B.diveT <= 0){
    const ready = alive.filter(m => m.state === 'form' && m.y > 0);
    if (ready.length){
      const m = ready[Math.floor(Math.random() * ready.length)];
      m.state = 'dive'; m.tx = p.x; sfx.dash();
    }
    B.diveT = Math.max(1.5, 3.4 - S.level * 0.15) * (alive.length === 1 ? 0.55 : 1);
  }
}

