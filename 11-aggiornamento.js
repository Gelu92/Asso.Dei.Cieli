/* Asso dei Cieli - Gelu inc. | logica di gioco fotogramma per fotogramma */

/* ---------- update ---------- */
function updateEnemy(e, dt, p){
  e.t += dt; e.flash = Math.max(0, e.flash - dt);
  switch (e.type){
    case 'w': e.y += e.vy*dt; e.x = e.x0 + Math.sin(e.t * 2.4 + e.ph) * e.amp; break;
    case 'k':
      if (e.st === 'in'){ e.y += e.vy*dt; if (e.y > H*0.13){ e.st = 'aim'; e.at = 0.6; sfx.arm(); } }
      else if (e.st === 'aim'){
        e.at -= dt; e.y += 20*k*dt;
        e.rot = Math.atan2(p.y - e.y, p.x - e.x) + Math.PI/2;
        if (e.at <= 0){
          const a = Math.atan2(p.y - e.y, p.x - e.x), sp = 520*k*Math.sqrt(diff());
          e.vx = Math.cos(a)*sp; e.dvy = Math.sin(a)*sp; e.st = 'go'; sfx.dash();
        }
      } else {
        e.x += e.vx*dt; e.y += e.dvy*dt;
        if (!perf.low && Math.random() < 0.6) S.fx.push({ x: e.x, y: e.y, vx: 0, vy: 0, life: 0.3, max: 0.3, c: 'rgba(255,154,77,.7)', r: 3*k });
      }
      break;
    case 'h':
      if (e.st === 'in'){ e.y += e.vy*dt; if (e.y >= e.ty){ e.st = 'hover'; e.ht = 5; } }
      else if (e.st === 'hover'){
        e.ht -= dt;
        e.x = clamp(e.x + Math.sin(e.t*1.1 + e.ph) * 70*k*dt, 30*k, W - 30*k);
        e.y = e.ty + Math.sin(e.t*2) * 6*k;
        e.cd -= dt * S.df.fire;
        if (e.cd <= 0 && !S.dead){
          e.cd = Math.max(0.7, 1.1 - S.level * 0.05);
          const a = Math.atan2(p.y - e.y, p.x - e.x), spd = 235*k;
          for (const off of [-0.08, 0.08]) S.eb.push({ x: e.x, y: e.y + 10*k, vx: Math.cos(a+off)*spd, vy: Math.sin(a+off)*spd, r: 4.5*k });
        }
        if (e.ht <= 0) e.st = 'out';
      } else e.y += e.vy*1.3*dt;
      break;
    case 'm':
      e.y += e.vy*dt; e.x += Math.sin(e.t + e.ph) * 25*k*dt;
      if (e.y > H*0.58){ e.dead = true; mineBlast(e); }
      break;
    case 'n':
      // warship far below: drifts with the sea, two turrets track you and fire flak upward
      e.y += e.vy*dt; e.x += Math.sin(e.t * 0.4 + e.ph) * 6*k*dt;
      e.aim = aimAt(e.x, e.y, p);
      if (!S.dead && e.y > -20*k && e.y < H - 20*k && (e.cd -= dt * S.df.fire) <= 0){
        e.cd = 1.5; e.gun = 1 - e.gun;
        const gy = e.y + (e.gun ? 30 : -34)*k, a = aimAt(e.x, gy, p);
        for (const o of [-0.09, 0.09]) shootEB(e.x, gy, a + o, 180*k, 4.5*k);
        e.muzzle = 0.12;
      }
      e.muzzle = Math.max(0, (e.muzzle || 0) - dt);
      break;
    default: e.y += e.vy*dt;
  }
  // classic shooters
  const shooter = e.type === 'b' || (e.type === 'f' && effT() > 12);
  if (shooter && e.y > 10 && e.y < H*0.65 && !S.dead){
    e.cd -= dt * S.df.fire;
    if (e.cd <= 0){
      const spd = (e.type === 'b' ? 250 : 225) * k;
      const a = Math.atan2(p.y - e.y, p.x - e.x);
      if (e.type === 'b'){
        e.cd = Math.max(0.9, 1.7 - S.level * 0.12);
        for (const off of [-0.18, 0, 0.18]) S.eb.push({ x: e.x, y: e.y + 20*k, vx: Math.cos(a+off)*spd, vy: Math.sin(a+off)*spd, r: 5*k });
      } else {
        e.cd = rnd(1.5, 2.6);
        S.eb.push({ x: e.x, y: e.y + 12*k, vx: Math.cos(a)*spd, vy: Math.sin(a)*spd, r: 4.5*k });
      }
    }
  }
}

function update(dt){
  if (S.slow > 0){ S.slow -= dt; dt *= 0.3; }   // slow motion after a boss falls
  S.t += dt;
  const p = S.p;
  moveClouds(dt);
  if (sky.mix < 1) sky.mix = Math.min(1, sky.mix + dt / 3);
  if (S.banner){ S.banner.life -= dt; if (S.banner.life <= 0) S.banner = null; }
  S.flash = Math.max(0, S.flash - dt);
  if (S.comboT > 0){ S.comboT -= dt; if (S.comboT <= 0) S.combo = 0; }

  if (S.phase === 'wave'){
    S.lt += dt;
    S.spawn -= dt;
    if (S.spawn <= 0){
      if (!(S.endT > 0) && !S.rush) spawn();
      S.spawn = Math.max(0.26, 1.0 - effT() / 75) * srnd(0.7, 1.3) * S.df.spawn * (S.zen ? 1.35 : 1);
    }
    if (S.zen) zenTick();
    else if (S.endless && S.lt >= 30){
      // endless: no boss, the sky and the pressure just keep climbing
      S.level++; S.lt = 0;
      sky.from = sky.to; sky.to = skyIndex(S.level); sky.mix = 0;
      setWeather(rollWeather());
      setBiome(biomeForLevel(S.level));
      setBanner(L('Livello ', 'Level ') + S.level, WEATHER_SUB[S.weather] || 'Più nemici, più veloci', 2);
      mEvent('wave', S.level); mEvent('score', S.score); onProgress();
      if (S.level % 3 === 0) startGold(() => { S.phase = 'wave'; S.lt = 0; });
    }
    else if (S.rush ? (!S.boss && S.lt >= 1.5) : S.campaign ? (S.mission.boss && !S.bossCalled && S.lt >= S.mission.bossAt) : (!S.endless && !S.zen && S.lt >= waveLen())){
      S.bossCalled = true;
      S.phase = 'warn'; S.phaseT = 2.6; setBanner('Boss in arrivo', curBossName() + ': ' + BOSS_SUB[curBossDef().id].toLowerCase(), 2.6); sfx.warn(); vib([60,60,60]);
    }
  } else if (S.phase === 'warn'){
    S.phaseT -= dt;
    if (S.phaseT <= 0){ S.phase = 'boss'; S.bossHit = false; makeBoss(); }
  } else if (S.phase === 'clear'){
    S.phaseT -= dt;
    if (S.phaseT <= 0 && S.rush){ S.phase = 'wave'; S.lt = 0; }
    else if (S.phaseT <= 0 && !S.campaign) startGold(nextWave);
  } else if (S.phase === 'gold'){
    updateGold(dt);
  }
  if (S.campaign){ campaignTick(dt); if (state !== 'play') return; }
  if (S.rush){
    if (S.endT > 0){ S.endT -= dt; S.p.inv = Math.max(S.p.inv, 0.5); if (S.endT <= 0) return rushOver(true); }
    else if (!S.dead) S.rush.time += dt;
  }

  if (!S.dead){
    const sp = 330 * k * dt * plane().speed;
    const dx = (keys['arrowright']||keys['d'] ? 1 : 0) - (keys['arrowleft']||keys['a'] ? 1 : 0);
    const dy = (keys['arrowdown']||keys['s'] ? 1 : 0) - (keys['arrowup']||keys['w'] ? 1 : 0);
    if (dx || dy){
      p.x = clamp(p.x + dx*sp, p.r, W - p.r);
      p.y = clamp(p.y + dy*sp, H*0.3, H - p.r*1.6);
      p.bank = dx;
    }
    p.bank *= 0.88;
    p.inv = Math.max(0, p.inv - dt);
    p.fire -= dt;
    if (p.fire <= 0){
      // weapon grows with power level: 1 twin, 2 +centre, 3 +angled, 4 +wide, 5 faster
      const L = p.lvl;
      const raffica = S.ab && S.ab.id === 'falco';
      p.fire = ST.fireRate * (L >= 5 ? 0.8 : 1) * (raffica ? 0.35 : 1);
      const PL = plane(), v = -680 * k, y = p.y - 20*k, dmg = PL.dmg + (raffica ? 1 : 0), big = dmg > 1;
      const shot = (x, yy, vx) => S.b.push({ x, y: yy, vx, vy: v, dmg, big, pierce: !!PL.pierce });
      if (PL.triple){
        shot(p.x, y - 4*k, 0);
        shot(p.x - 9*k, y, -25*k);
        shot(p.x + 9*k, y, 25*k);
      } else {
        shot(p.x - 5*k, y, 0);
        shot(p.x + 5*k, y, 0);
        if (L >= 2) shot(p.x, y - 6*k, 0);
      }
      if (L >= 3){
        shot(p.x - 12*k, y + 6*k, -70*k);
        shot(p.x + 12*k, y + 6*k, 70*k);
      }
      if (PL.spread){
        shot(p.x - 16*k, y + 10*k, -190*k);
        shot(p.x + 16*k, y + 10*k, 190*k);
      }
      if (L >= 4){
        const w = PL.spread ? 300 : 150;
        shot(p.x - 18*k, y + 12*k, -w*k);
        shot(p.x + 18*k, y + 12*k, w*k);
      }
      sfx.shoot();
    }

    updateDrone(dt);
    // wingmen: two small escorts that follow with a little lag and fire with you
    if (p.wing > 0){
      p.wing -= dt;
      const f = Math.min(1, dt * 7);
      p.wings.forEach((w, i) => {
        const tx = p.x + (i ? 40 : -40)*k, ty = p.y + 16*k;
        w.x += (tx - w.x) * f; w.y += (ty - w.y) * f;
      });
      p.wfire -= dt;
      if (p.wfire <= 0){
        p.wfire = 0.24;
        for (const w of p.wings) S.b.push({ x: w.x, y: w.y - 12*k, vx: 0, vy: -680*k, dmg: 1 });
      }
      if (p.wing <= 0) S.pop.push({ x: p.x, y: p.y - 30*k, txt: 'I gregari rientrano', life: 1.2 });
    } else {
      for (const w of p.wings){ w.x = p.x; w.y = p.y + 30*k; }
    }
  } else {
    S.dead -= dt;
    if (S.dead <= 0) return gameOver();
  }

  for (const b of S.b){ b.x += b.vx*dt; b.y += b.vy*dt; }
  updateAbility(dt);
  if (S.ghostRec && !S.dead){
    S.gT += dt;
    while (S.gT >= 0.1){ S.gT -= 0.1; S.ghostRec.push([+(p.x / W).toFixed(3), +(p.y / H).toFixed(3)]); }
  }
  updateWeather(dt);
  // last life: a two-tone alarm and pulsing hearts
  const lowHp = p.hp === 1 && !S.dead && !(S.endT > 0);
  if (lowHp && (S.alarmT = (S.alarmT || 0) - dt) <= 0){ sfx.alarm(); S.alarmT = 1.6; }
  $('hearts').classList.toggle('low', lowHp);
  const edt = S.ab && S.ab.id === 'spettro' ? dt * 0.35 : dt;
  const ebs = edt * S.df.bullet;
  for (const b of S.eb){ b.x += b.vx*ebs; b.y += b.vy*ebs; }

  if (S.boss) updateBoss(S.boss, edt, p);

  // enemies
  for (const e of S.en){
    updateEnemy(e, edt, e.tg === 'escort' && S.escort && !S.escort.dead ? S.escort : p);
    if (e.dead) continue;
    for (const b of S.b){
      if (b.dead) continue;
      if (b.pierce && b.hits && b.hits.has(e)) continue;
      if (e.hw ? (Math.abs(b.x - e.x) < e.hw && Math.abs(b.y - e.y) < e.hh) : dist2(b, e) < (e.r + 4*k) ** 2){
        if (b.pierce){ (b.hits || (b.hits = new Set())).add(e); } else b.dead = true;
        e.hp -= b.dmg || 1; e.flash = 0.07; sfx.hit();
        burst(b.x, b.y, 3, ['#ffe36e','#fff4e0'], 90, 2.5);
        if (e.hp <= 0){ e.dead = true; kill(e); break; }
      }
    }
    if (e.type !== 'n' && !e.dead && !S.dead && p.inv <= 0 && dist2(e, p) < (e.r*0.8 + p.r) ** 2){
      if (e.type === 'b'){ e.hp -= 3; e.flash = 0.1; if (e.hp <= 0){ e.dead = true; kill(e); } }
      else { e.dead = true; explode(e); }
      hurt();
    }
  }
  S.en = S.en.filter(e => !e.dead && e.y < H + (e.hh || 0) + 60*k && e.y > -300 && e.x > -80 && e.x < W + 80);
  S.b = S.b.filter(b => b.y > -20 && b.y < H + 20 && b.x > -20 && b.x < W + 20 && !b.dead);

  if (!S.dead && p.inv <= 0){
    for (const b of S.eb){
      if (dist2(b, p) < (b.r + p.r*0.7) ** 2){ b.dead = true; hurt(); break; }
    }
  }
  S.eb = S.eb.filter(b => b.y < H + 20 && b.y > -40 && b.x > -20 && b.x < W + 20 && !b.dead);

  // pickups
  const pr = ST.pickR * k;
  for (const u of S.pk){
    u.t += dt; u.y += (u.kind === 'x' ? 48 : u.kind === 'c' ? 150 : 70)*k*dt; u.x += Math.sin(u.t*3) * 20*k*dt;
    if (up.magnet > 0 && !S.dead){
      const d = Math.sqrt(dist2(u, p));
      if (d < pr * 2.6 && d > 1){ const pull = 260*k*dt; u.x += (p.x - u.x) / d * pull; u.y += (p.y - u.y) / d * pull; }
    }
    if (!S.dead && dist2(u, p) < (p.r + pr) ** 2){
      u.dead = true; sfx.pick(); vib(20);
      if (u.kind !== 'x' && u.kind !== 'c') mEvent('pick');
      if (u.kind === 'c'){ addCoins(u.v, u.x, u.y - 10*k); sfx.coin(); }
      else if (u.kind === 'x'){
        pieces = Math.min(PIECES_NEEDED, pieces + 1); save('asso-pieces', pieces);
        S.pop.push({ x: u.x, y: u.y, txt: L('Pezzo raro ', 'Rare piece ') + pieces + '/' + PIECES_NEEDED, life: 1.4, gold: true });
        if (pieces >= PIECES_NEEDED && !owned.includes('fenice')){
          owned.push('fenice'); save('asso-planes', owned);
          toast('<span>' + L('Hai sbloccato la Fenice! La trovi nell\'hangar.', 'You unlocked the Phoenix! Find it in the hangar.') + '</span>'); onProgress();
          sfx.win();
        } else toast(`<span>${L('Pezzo raro raccolto', 'Rare piece collected')}: ${pieces} ${L('di', 'of')} ${PIECES_NEEDED}</span>`);
      }
      else if (u.kind === 'h' && S.rule === 'unavita'){ p.shield = true; S.pop.push({ x: u.x, y: u.y, txt: 'Scudo!', life: 1 }); }
      else if (u.kind === 'h'){ p.hp = Math.min(5, p.hp + 1); S.pop.push({ x: u.x, y: u.y, txt: '+1 vita', life: 1 }); }
      else if (u.kind === 's'){ p.shield = true; S.pop.push({ x: u.x, y: u.y, txt: 'Scudo!', life: 1 }); }
      else if (u.kind === 'b'){ S.bombs = Math.min(ST.maxBombs, S.bombs + 1); S.pop.push({ x: u.x, y: u.y, txt: '+1 bomba', life: 1 }); }
      else if (u.kind === 'g'){
        p.wing = 14; p.wfire = 0.1;
        for (const w of p.wings){ w.x = p.x; w.y = H + 40*k; }
        S.pop.push({ x: u.x, y: u.y, txt: 'Arrivano i gregari!', life: 1.2 });
      }
      else if (p.lvl < MAX_LVL){ p.lvl++; pstats.maxLvl = Math.max(pstats.maxLvl, p.lvl); onProgress(); S.pop.push({ x: u.x, y: u.y, txt: p.lvl === MAX_LVL ? 'Potenza massima!' : T('Potenza') + ' ' + p.lvl, life: 1.1 }); }
      else { addScore(500, u.x, u.y); }
      burst(u.x, u.y, 14, ['#ffe36e','#2bb3a6','#fff4e0'], 150, 3);
    }
  }
  S.pk = S.pk.filter(u => !u.dead && u.y < H + 30);

  for (const f of S.fx){ f.x += f.vx*dt; f.y += f.vy*dt; f.vx *= 0.96; f.vy *= 0.96; f.life -= dt; }
  S.fx = S.fx.filter(f => f.life > 0);
  for (const t of S.pop){ t.y -= 40*k*dt; t.life -= dt; }
  S.pop = S.pop.filter(t => t.life > 0);

  S.shake = Math.max(0, S.shake - dt);
  updateHUD();
}

