/* Asso dei Cieli - Gelu inc. | disegno di aerei, nemici, boss e schermo */

/* ---------- drawing ---------- */
let g = ctx;   // drawing target for planes (swapped for hangar previews)
function drawPlane(x, y, s, dir, col, bank=0, rot=0){
  const ctx = g;
  ctx.save();
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  ctx.scale(s * (1 - Math.abs(bank)*0.18), s * dir);
  ctx.fillStyle = col.body;
  ctx.beginPath();
  if (col.shape === 'swept'){
    // Rondine: slim fuselage, swept-back wings
    ctx.moveTo(0,-6); ctx.lineTo(23,10); ctx.lineTo(22,14); ctx.lineTo(0,9); ctx.lineTo(-22,14); ctx.lineTo(-23,10);
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0,13); ctx.lineTo(8,22); ctx.lineTo(0,20); ctx.lineTo(-8,22); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 2, 4, 20, 0, 0, Math.PI*2); ctx.fill();
    if (col.accent){
      ctx.fillStyle = col.shade;
      ctx.beginPath(); ctx.moveTo(0,9); ctx.lineTo(22,14); ctx.lineTo(22.5,12); ctx.lineTo(0,6); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(0,9); ctx.lineTo(-22,14); ctx.lineTo(-22.5,12); ctx.lineTo(0,6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = col.accent;
      ctx.fillRect(15, 9, 5, 2.4); ctx.fillRect(-20, 9, 5, 2.4); ctx.fillRect(-1.2, 12, 2.4, 8);
      ctx.fillStyle = col.glass;
      ctx.beginPath(); ctx.ellipse(0, -6, 2.4, 5, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(255,244,224,.55)';
      ctx.beginPath(); ctx.ellipse(0, -18, 7 + Math.sin(performance.now()/18)*2, 1.4, 0, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore(); return;
  }
  if (col.shape === 'heavy'){
    // Toro: broad straight wings, fat body
    ctx.moveTo(0,-5); ctx.lineTo(28,2); ctx.lineTo(28,12); ctx.lineTo(0,10); ctx.lineTo(-28,12); ctx.lineTo(-28,2);
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0,12); ctx.lineTo(12,18); ctx.lineTo(12,24); ctx.lineTo(0,22); ctx.lineTo(-12,24); ctx.lineTo(-12,18); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 3, 7.5, 20, 0, 0, Math.PI*2); ctx.fill();
    if (col.accent){
      ctx.fillStyle = col.shade;
      ctx.fillRect(-28, 9, 56, 3);
      for (const ox of [-16, 16]){ ctx.beginPath(); ctx.ellipse(ox, 1, 4, 8, 0, 0, Math.PI*2); ctx.fill(); }
      ctx.fillStyle = 'rgba(255,244,224,.5)';
      for (const ox of [-16, 16]){ ctx.beginPath(); ctx.ellipse(ox, -7.5, 7, 1.2, 0, 0, Math.PI*2); ctx.fill(); }
      ctx.fillStyle = col.accent;
      ctx.fillRect(22, 3, 4, 7); ctx.fillRect(-26, 3, 4, 7); ctx.fillRect(-2, 14, 4, 9);
      ctx.fillStyle = col.glass;
      ctx.beginPath(); ctx.ellipse(0, -5, 4, 6, 0, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore(); return;
  }
  if (col.delta){
    // kamikaze: swept delta wing
    ctx.moveTo(0,-18); ctx.lineTo(20,14); ctx.lineTo(6,10); ctx.lineTo(0,16); ctx.lineTo(-6,10); ctx.lineTo(-20,14);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = col.accent;
    ctx.beginPath(); ctx.moveTo(0,-10); ctx.lineTo(4,4); ctx.lineTo(-4,4); ctx.closePath(); ctx.fill();
    ctx.restore(); return;
  }
  ctx.moveTo(0,-4); ctx.lineTo(24,5); ctx.lineTo(24,11); ctx.lineTo(0,8); ctx.lineTo(-24,11); ctx.lineTo(-24,5);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0,12); ctx.lineTo(10,19); ctx.lineTo(10,23); ctx.lineTo(0,21); ctx.lineTo(-10,23); ctx.lineTo(-10,19);
  ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, 3, 5.5, 20, 0, 0, Math.PI*2); ctx.fill();
  if (col.accent){
    ctx.fillStyle = col.shade;
    ctx.beginPath(); ctx.moveTo(0,8); ctx.lineTo(24,11); ctx.lineTo(24,9); ctx.lineTo(0,5); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0,8); ctx.lineTo(-24,11); ctx.lineTo(-24,9); ctx.lineTo(0,5); ctx.closePath(); ctx.fill();
    if (col.engines){
      for (const ox of [-14, 14]){ ctx.beginPath(); ctx.ellipse(ox, 3, 3.2, 7, 0, 0, Math.PI*2); ctx.fill(); }
      ctx.fillStyle = 'rgba(255,244,224,.5)';
      for (const ox of [-14, 14]){ ctx.beginPath(); ctx.ellipse(ox, -4.5, 6, 1, 0, 0, Math.PI*2); ctx.fill(); }
    }
    ctx.fillStyle = col.accent;
    if (col.shape === 'stripes'){
      // Vespa: black bands on wings and tail, extra gun pods
      for (const ox of [9, 15, 21]){ ctx.fillRect(ox, 4 + ox*0.2, 2.4, 6); ctx.fillRect(-ox - 2.4, 4 + ox*0.2, 2.4, 6); }
      ctx.fillRect(-5.5, 6, 11, 2.2); ctx.fillRect(-5.5, 12, 11, 2.2);
      ctx.fillRect(-17, -1, 2, 7); ctx.fillRect(15, -1, 2, 7);
    } else {
      ctx.beginPath(); ctx.arc(19, 7.5, 2.6, 0, Math.PI*2); ctx.arc(-19, 7.5, 2.6, 0, Math.PI*2); ctx.fill();
    }
    ctx.fillRect(-1.5, 14, 3, 9);
    ctx.fillStyle = col.glass;
    ctx.beginPath(); ctx.ellipse(0, -5, 3, 5.5, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,244,224,.55)';
    ctx.beginPath(); ctx.ellipse(0, -18, 9 + Math.sin(performance.now()/20)*2, 1.6, 0, 0, Math.PI*2); ctx.fill();
  }
  ctx.restore();
}
function drawHeli(e, col){
  ctx.save();
  ctx.translate(e.x, e.y); ctx.scale(e.s, e.s);
  ctx.fillStyle = col.body;
  ctx.fillRect(-2, -28, 4, 20); ctx.fillRect(-8, -30, 16, 3.5);
  ctx.beginPath(); ctx.ellipse(0, 0, 10, 13, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = col.shade;
  ctx.fillRect(-14, -9, 2.5, 18); ctx.fillRect(11.5, -9, 2.5, 18);
  ctx.fillStyle = col.glass;
  ctx.beginPath(); ctx.ellipse(0, 6, 6.5, 5.5, 0, 0, Math.PI*2); ctx.fill();
  ctx.rotate(performance.now() / 55);
  ctx.fillStyle = 'rgba(255,244,224,.38)';
  ctx.fillRect(-28, -1.6, 56, 3.2); ctx.fillRect(-1.6, -28, 3.2, 56);
  ctx.fillStyle = col.accent;
  ctx.beginPath(); ctx.arc(0, 0, 2.6, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}
function drawShip(e){
  const s = k, fl = e.flash > 0;
  ctx.save(); ctx.translate(e.x, e.y);
  // wake behind the stern (top) and foam at the bow (bottom)
  const wake = ctx.createLinearGradient(0, -56*s, 0, -100*s);
  wake.addColorStop(0, 'rgba(255,244,224,.35)'); wake.addColorStop(1, 'rgba(255,244,224,0)');
  ctx.fillStyle = wake;
  ctx.beginPath(); ctx.moveTo(-9*s, -56*s); ctx.lineTo(-24*s, -100*s); ctx.lineTo(24*s, -100*s); ctx.lineTo(9*s, -56*s); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,244,224,.3)';
  ctx.beginPath(); ctx.ellipse(0, 64*s, 9*s, 4*s, 0, 0, Math.PI*2); ctx.fill();
  // hull
  ctx.fillStyle = fl ? '#ffffff' : '#55506a';
  ctx.beginPath();
  ctx.moveTo(0, 64*s); ctx.lineTo(14*s, 30*s); ctx.lineTo(14*s, -46*s);
  ctx.quadraticCurveTo(13*s, -60*s, 0, -61*s); ctx.quadraticCurveTo(-13*s, -60*s, -14*s, -46*s);
  ctx.lineTo(-14*s, 30*s); ctx.closePath(); ctx.fill();
  // deck and superstructure
  ctx.fillStyle = fl ? '#ffffff' : '#77708f';
  ctx.beginPath(); ctx.moveTo(0, 54*s); ctx.lineTo(9*s, 30*s); ctx.lineTo(9*s, -44*s); ctx.lineTo(-9*s, -44*s); ctx.lineTo(-9*s, 30*s); ctx.closePath(); ctx.fill();
  ctx.fillStyle = fl ? '#ffffff' : '#433e58';
  ctx.fillRect(-6*s, -14*s, 12*s, 24*s);
  ctx.fillStyle = '#ff5d73';
  ctx.fillRect(-6*s, -2*s, 12*s, 3*s);
  ctx.fillStyle = '#2e2a3e';
  ctx.beginPath(); ctx.arc(0, -8*s, 3.5*s, 0, Math.PI*2); ctx.fill();   // funnel
  // turrets that track the player
  for (const [ty, idx] of [[30, 1], [-34, 0]]){
    ctx.save(); ctx.translate(0, ty*s); ctx.rotate((e.aim || Math.PI/2) - Math.PI/2);
    ctx.fillStyle = '#2e2a3e';
    ctx.fillRect(-1.5*s, 0, 3*s, 15*s); ctx.fillRect(2.5*s, 0, 2.5*s, 13*s);
    ctx.beginPath(); ctx.arc(0, 0, 6.5*s, 0, Math.PI*2); ctx.fill();
    if (e.muzzle > 0 && e.gun === idx){ ctx.fillStyle = '#ffe36e'; ctx.beginPath(); ctx.arc(1*s, 17*s, 4*s, 0, Math.PI*2); ctx.fill(); }
    ctx.restore();
  }
  // damage bar once hit
  if (e.hp < e.max){
    const w = 34*s;
    ctx.fillStyle = 'rgba(26,21,48,.5)'; ctx.fillRect(-w/2, -72*s, w, 4*s);
    ctx.fillStyle = '#ff5d73'; ctx.fillRect(-w/2, -72*s, w * e.hp / e.max, 4*s);
  }
  ctx.restore();
}
function drawMine(e){
  ctx.save();
  ctx.translate(e.x, e.y); ctx.rotate(e.t * 1.5);
  const r = e.r;
  ctx.fillStyle = e.flash > 0 ? '#ffffff' : '#2e2a3e';
  for (let i = 0; i < 8; i++){
    const a = i / 8 * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a-0.22)*r*0.8, Math.sin(a-0.22)*r*0.8);
    ctx.lineTo(Math.cos(a)*r*1.4, Math.sin(a)*r*1.4);
    ctx.lineTo(Math.cos(a+0.22)*r*0.8, Math.sin(a+0.22)*r*0.8);
    ctx.fill();
  }
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.fill();
  const near = e.y > H*0.42;
  const on = Math.floor(e.t * (near ? 12 : 3)) % 2;
  ctx.fillStyle = on ? '#ff5d73' : '#7a2a3a';
  ctx.beginPath(); ctx.arc(0, 0, r*0.4, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}
const shadowOf = PL => ({ body:'rgba(36,20,50,.22)', shape: PL.col.shape });
const COL_F = { body:'#3a2440', accent:'#ff5d73', glass:'#ffe36e', shade:'#2a1830' };
const COL_W = { body:'#4a3a6e', accent:'#ffe36e', glass:'#ff9a4d', shade:'#352a52' };
const COL_B = { body:'#2e2a3e', accent:'#ff5d73', glass:'#ffe36e', shade:'#1e1b2a' };
const COL_K = { body:'#a8323e', accent:'#ffe36e', delta:true };
const COL_KAIM = { body:'#ff9a4d', accent:'#fff4e0', delta:true };
const COL_H = { body:'#3d4a3a', accent:'#ff5d73', glass:'#9fd8ff', shade:'#2a3328' };
const COL_BOSS = { body:'#8e2236', accent:'#ffe36e', glass:'#1a1530', shade:'#5b1f33', engines:true };
const COL_COLOSSO = { body:'#3d3a52', accent:'#ff5d73', glass:'#ffe36e', shade:'#2a2738', shape:'heavy' };
const COL_CARGO = { body:'#9fd8ff', accent:'#24305e', glass:'#24305e', shade:'#7cb6dc', shape:'heavy' };
const COL_WING = { body:'#e8dcff', accent:'#a46be0', glass:'#24305e', shade:'#c9b8ee' };
const COL_ACE = { body:'#1e1b2a', accent:'#ff5d73', glass:'#ff5d73', shade:'#0f0d18' };
const COL_GHOST = { body:'#2a2f4a', accent:'#9fd8ff', delta:true };

function drawBossShadow(B, sh){
  if (B.kind === 'strega' || B.kind === 'inverno'){
    ctx.fillStyle = 'rgba(36,20,50,.2)';
    ctx.beginPath(); ctx.ellipse(B.x + sh*1.4, B.y + sh*2, 40*k, 24*k, 0, 0, Math.PI*2); ctx.fill();
  } else if (B.kind === 'stormo'){
    for (const m of B.members) if (!m.dead) drawPlane(m.x + sh*0.8, m.y + sh*1.2, 1.15*k*0.8, -1, SHADOW);
  } else if (B.kind === 'dirigibile'){
    ctx.fillStyle = 'rgba(36,20,50,.2)';
    ctx.beginPath(); ctx.ellipse(B.x + sh*1.8, B.y + sh*2.6, 36*k, 76*k, 0, 0, Math.PI*2); ctx.fill();
  } else if (B.kind === 'fantasma'){
    ctx.globalAlpha = B.alpha;
    drawPlane(B.x + sh*1.4, B.y + sh*2, B.s*0.8, -1, SHADOW_D);
    ctx.globalAlpha = 1;
  } else drawPlane(B.x + sh*1.4, B.y + sh*2, B.s*0.8, -1, B.kind === 'colosso' ? { body:'rgba(36,20,50,.22)', shape:'heavy' } : SHADOW);
}

function drawRageGlow(x, y, r, t){
  const g2 = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
  g2.addColorStop(0, `rgba(255,93,115,${0.35 + Math.sin(t * 7) * 0.12})`);
  g2.addColorStop(1, 'rgba(255,93,115,0)');
  ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}
function drawBoss(B){
  const fl = B.flash > 0;
  if (B.enraged){
    if (B.kind === 'stormo'){ for (const m of B.members) if (!m.dead) drawRageGlow(m.x, m.y, 46*k, B.t); }
    else if (B.alpha > 0.3) drawRageGlow(B.x, B.y, (B.kind === 'dirigibile' ? 110 : 90) * k, B.t);
  }
  const tint = (draw) => { if (!fl) return; ctx.globalAlpha = 0.45; draw(); ctx.globalAlpha = 1; };
  if (B.kind === 'strega' || B.kind === 'inverno'){
    B.kind === 'strega' ? drawWitch(B) : drawWinterKing(B);
    if (fl){ ctx.globalAlpha = 0.3; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(B.x, B.y, 46*k, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1; }
    return;
  }
  if (B.kind === 'barone'){ drawPlane(B.x, B.y, B.s, -1, COL_BOSS); tint(() => drawPlane(B.x, B.y, B.s, -1, COL_FLASH)); }
  else if (B.kind === 'colosso'){
    drawPlane(B.x, B.y, B.s, -1, COL_COLOSSO); tint(() => drawPlane(B.x, B.y, B.s, -1, { ...COL_FLASH, shape:'heavy' }));
    const t = performance.now() / 1000;
    ctx.fillStyle = `rgba(255,154,77,${0.55 + Math.sin(t * 12) * 0.25})`;
    for (const ox of [-70, -42, 42, 70]){ ctx.beginPath(); ctx.ellipse(B.x + ox*k, B.y - 16*k, 5*k, 9*k, 0, 0, Math.PI*2); ctx.fill(); }
  }
  else if (B.kind === 'stormo'){
    for (const m of B.members) if (!m.dead){
      drawPlane(m.x, m.y, 1.15*k, -1, COL_ACE);
      if (m.flash > 0){ ctx.globalAlpha = 0.45; drawPlane(m.x, m.y, 1.15*k, -1, COL_FLASH); ctx.globalAlpha = 1; }
    }
  } else if (B.kind === 'fantasma'){
    ctx.globalAlpha = B.alpha;
    drawPlane(B.x, B.y, B.s, -1, COL_GHOST);
    if (fl){ ctx.globalAlpha = B.alpha * 0.45; drawPlane(B.x, B.y, B.s, -1, COL_FLASH_D); ctx.globalAlpha = B.alpha; }
    // glowing engine slits
    ctx.fillStyle = '#9fd8ff';
    ctx.globalAlpha = B.alpha * (0.6 + Math.sin(B.t * 8) * 0.3);
    for (const ox of [-22, 22]){ ctx.beginPath(); ctx.ellipse(B.x + ox*k, B.y - 40*k, 6*k, 2*k, 0, 0, Math.PI*2); ctx.fill(); }
    ctx.globalAlpha = 1;
  } else drawBlimp(B, fl);
}

function drawBlimp(B, fl){
  const s = k;
  ctx.save(); ctx.translate(B.x, B.y);
  // tail fins (at the top: the nose points down at you)
  ctx.fillStyle = fl ? '#ffffff' : '#4a4560';
  for (const sx of [-1, 1]){
    ctx.beginPath(); ctx.moveTo(sx*10*s, -62*s); ctx.lineTo(sx*34*s, -96*s); ctx.lineTo(sx*12*s, -90*s); ctx.closePath(); ctx.fill();
  }
  ctx.fillRect(-2.5*s, -100*s, 5*s, 30*s);
  // envelope
  const gr = ctx.createLinearGradient(-40*s, 0, 40*s, 0);
  gr.addColorStop(0, fl ? '#ffffff' : '#433e58');
  gr.addColorStop(0.42, fl ? '#ffffff' : '#9a93b3');
  gr.addColorStop(1, fl ? '#ffffff' : '#4f4966');
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.ellipse(0, 0, 40*s, 84*s, 0, 0, Math.PI*2); ctx.fill();
  // panel seams
  ctx.strokeStyle = 'rgba(26,21,48,.3)'; ctx.lineWidth = 1.5*s;
  for (const yy of [-60, -36, -12, 12, 36, 60]){
    const hw = 40 * Math.sqrt(1 - (yy/84) ** 2);
    ctx.beginPath(); ctx.moveTo(-hw*s, yy*s); ctx.quadraticCurveTo(0, (yy + 6)*s, hw*s, yy*s); ctx.stroke();
  }
  // red band near the nose
  ctx.fillStyle = '#ff5d73';
  const bw = 40 * Math.sqrt(1 - (48/84) ** 2);
  ctx.beginPath(); ctx.moveTo(-bw*s, 44*s); ctx.quadraticCurveTo(0, 50*s, bw*s, 44*s);
  ctx.lineTo(bw*0.92*s, 52*s); ctx.quadraticCurveTo(0, 58*s, -bw*0.92*s, 52*s); ctx.closePath(); ctx.fill();
  // turrets
  for (const [ox, oy] of TURRETS){
    ctx.fillStyle = '#2e2a3e';
    ctx.beginPath(); ctx.arc(ox*s, oy*s, 6.5*s, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = B.turretFlash > 0 ? '#ffe36e' : '#ff5d73';
    ctx.beginPath(); ctx.arc(ox*s, oy*s, 2.6*s, 0, Math.PI*2); ctx.fill();
  }
  // nose cap
  ctx.fillStyle = '#2e2a3e';
  ctx.beginPath(); ctx.ellipse(0, 78*s, 9*s, 5*s, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}
const COL_FLASH = { body:'#ffffff', accent:'#ffffff', glass:'#ffffff', shade:'#ffffff' };
const COL_FLASH_D = { body:'#ffffff', accent:'#ffffff', delta:true };
const SHADOW = { body:'rgba(36,20,50,.22)' };
const SHADOW_D = { body:'rgba(36,20,50,.22)', delta:true };
const PK_COL = { h:'#ff5d73', p:'#2bb3a6', s:'#4f7cff', b:'#ff9a4d', g:'#a46be0' };
const PK_TXT = { h:'+', p:'P', s:'S', b:'B', g:'G' };

function drawSky(){
  const fa = PALETTES[sky.from].stars, ta = PALETTES[sky.to].stars;
  ctx.fillStyle = grads[sky.from]; ctx.fillRect(-20, -20, W + 40, H + 40);
  if (sky.mix > 0 && sky.from !== sky.to){
    ctx.globalAlpha = sky.mix; ctx.fillStyle = grads[sky.to]; ctx.fillRect(-20, -20, W + 40, H + 40); ctx.globalAlpha = 1;
  }
  const starA = fa + (ta - fa) * sky.mix;
  seasonSkyTint();
  if (starA > 0){
    const now = performance.now() / 1000;
    ctx.fillStyle = '#fff4e0';
    for (const s of stars){
      ctx.globalAlpha = starA * (0.5 + 0.5 * Math.sin(now * 2 + s.tw)) * (1 - s.y * 0.6);
      ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  return starA;
}
function drawClouds(layer, starA){
  for (const c of clouds) if (c.layer === layer){
    ctx.globalAlpha = c.a * (1 - starA * 0.55);
    ctx.drawImage(cloudImg, c.x - 120*c.s*k, c.y - 60*c.s*k, 240*c.s*k, 120*c.s*k);
  }
  ctx.globalAlpha = 1;
}

function draw(){
  ctx.save();
  if (S.shake > 0 && !reduceMotion){
    const m = S.shake * 14 * k;
    ctx.translate(rnd(-m, m), rnd(-m, m));
  }
  const starA = drawSky();
  drawSea(starA);
  drawClouds(0, starA);
  if (!isMenuState() && state !== 'land' && S.en) for (const e of S.en) if (e.type === 'n') drawShip(e);

  if (isMenuState()){ ctx.restore(); return drawMenuScene(); }
  if (state === 'land'){ drawLanding(); ctx.restore(); return; }

  const p = S.p, sh = 22 * k;
  // shadows
  ctx.fillStyle = 'rgba(36,20,50,.22)';
  for (const e of S.en){
    if (e.type === 'n') continue;
    if (e.type === 'h' || e.type === 'm'){
      ctx.beginPath(); ctx.ellipse(e.x + sh*0.6, e.y + sh, e.r*0.9, e.r*0.7, 0, 0, Math.PI*2); ctx.fill();
    } else if (e.type === 'k') drawPlane(e.x + sh*0.6, e.y + sh, e.s*0.8, 1, SHADOW_D, 0, e.rot);
    else if (!(SEASON === 'halloween' && (e.type === 'f' || e.type === 'w'))) drawPlane(e.x + sh*0.6, e.y + sh, e.s*0.8, -1, SHADOW);
  }
  if (S.boss) drawBossShadow(S.boss, sh);
  if (!S.dead) drawPlane(p.x + sh*0.6, p.y + sh, k*0.8*plane().size, 1, shadowOf(plane()));

  // pickups
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const u of S.pk){
    if (u.kind === 'c'){
      const r = (u.v >= 5 ? 11 : 8) * k, sx = Math.abs(Math.cos(u.t * 4));
      ctx.save(); ctx.translate(u.x, u.y); ctx.scale(Math.max(0.25, sx), 1);
      ctx.fillStyle = u.v >= 5 ? '#ff9a4d' : '#ffe36e'; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#c99a2e'; ctx.lineWidth = 2*k; ctx.beginPath(); ctx.arc(0, 0, r * 0.6, 0, Math.PI*2); ctx.stroke();
      ctx.restore();
      continue;
    }
    if (u.kind === 'x'){
      // rare piece: spinning golden gem with a halo
      const r = 15*k, glow = 0.35 + Math.sin(u.t*5)*0.15;
      ctx.fillStyle = `rgba(255,227,110,${glow})`;
      ctx.beginPath(); ctx.arc(u.x, u.y, r*2, 0, Math.PI*2); ctx.fill();
      ctx.save(); ctx.translate(u.x, u.y); ctx.scale(Math.cos(u.t*3), 1);
      ctx.fillStyle = '#ffe36e'; ctx.strokeStyle = '#fff4e0'; ctx.lineWidth = 2*k;
      ctx.beginPath(); ctx.moveTo(0, -r*1.3); ctx.lineTo(r, 0); ctx.lineTo(0, r*1.3); ctx.lineTo(-r, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ff7a3d';
      ctx.beginPath(); ctx.moveTo(0, -r*0.6); ctx.lineTo(r*0.45, 0); ctx.lineTo(0, r*0.6); ctx.lineTo(-r*0.45, 0); ctx.closePath(); ctx.fill();
      ctx.restore();
      continue;
    }
    const pulse = 1 + Math.sin(u.t*6)*0.08, r = 13*k*pulse;
    ctx.fillStyle = PK_COL[u.kind];
    ctx.beginPath(); ctx.arc(u.x, u.y, r, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#fff4e0'; ctx.lineWidth = 2.5*k; ctx.stroke();
    ctx.fillStyle = '#fff4e0'; ctx.font = `${15*k}px Bungee, Impact, sans-serif`;
    ctx.fillText(PK_TXT[u.kind], u.x, u.y + 1*k);
  }

  for (const e of S.en){
    if (e.type === 'n') continue;
    if (e.type === 'm'){ SEASON === 'halloween' ? drawPumpkin(e) : SEASON === 'xmas' ? drawGift(e) : drawMine(e); continue; }
    if (SEASON === 'halloween' && (e.type === 'f' || e.type === 'w')){ drawBat(e.x, e.y, e.s * 1.15, e.t * 14 + e.ph, e.flash > 0 ? '#ffffff' : e.type === 'w' ? '#4a2a6a' : '#2a1838'); continue; }
    if (e.type === 'h'){ drawHeli(e, e.flash > 0 ? COL_FLASH : COL_H); continue; }
    if (e.type === 'k'){
      const aiming = e.st === 'aim' && Math.floor(e.at * 14) % 2 === 0;
      drawPlane(e.x, e.y, e.s, 1, e.flash > 0 ? COL_FLASH_D : aiming ? COL_KAIM : COL_K, 0, e.rot);
      continue;
    }
    const col = e.flash > 0 ? COL_FLASH : e.type === 'b' ? COL_B : e.type === 'w' ? COL_W : COL_F;
    drawPlane(e.x, e.y, e.s, -1, col);
    if ((e.type === 'b') && e.hp < e.max){
      const w = 40*k;
      ctx.fillStyle = 'rgba(26,21,48,.5)'; ctx.fillRect(e.x - w/2, e.y - 42*k, w, 4*k);
      ctx.fillStyle = '#ff5d73'; ctx.fillRect(e.x - w/2, e.y - 42*k, w * e.hp / e.max, 4*k);
    }
  }

  if (S.boss) drawBoss(S.boss);
  drawFog();

  if (S.escort && !S.escort.dead){
    const E = S.escort;
    drawPlane(E.x + sh*0.9, E.y + sh*1.3, k*1.3, 1, { body:'rgba(36,20,50,.22)', shape:'heavy' });
    drawPlane(E.x, E.y, k*1.55, 1, E.flash > 0 ? { ...COL_FLASH, shape:'heavy' } : COL_CARGO);
    const w = 52*k, y = E.y - 46*k;
    ctx.fillStyle = 'rgba(26,21,48,.55)'; ctx.fillRect(E.x - w/2, y, w, 5*k);
    ctx.fillStyle = E.hp > E.max * 0.35 ? '#2bb3a6' : '#ff5d73'; ctx.fillRect(E.x - w/2, y, w * Math.max(0, E.hp) / E.max, 5*k);
    ctx.font = `700 ${10*k}px "Chakra Petch", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillStyle = '#fff4e0'; ctx.fillText(T('CARGO'), E.x, y - 2*k);
  }
  drawDrone();
  if (!S.dead && p.wing > 0){
    const fading = p.wing < 2 && Math.floor(p.wing * 8) % 2 === 0;
    if (!fading) for (const w of p.wings){
      drawPlane(w.x + sh*0.4, w.y + sh*0.7, k*0.42, 1, SHADOW);
      drawPlane(w.x, w.y, k*0.52, 1, COL_WING, p.bank * 0.6);
    }
  }
  drawGhost();
  drawAbility();
  if (!S.dead && (p.inv <= 0 || (S.ab && S.ab.id === 'rondine') || Math.floor(p.inv * 12) % 2 === 0)){
    drawPlane(p.x, p.y, k*plane().size, 1, colOf(plane()), p.bank);
    drawEmblem(ctx, p.x - 13*k*plane().size, p.y + 5*k, 7*k);
  }
  if (!S.dead && p.shield){
    const t = performance.now() / 1000;
    ctx.strokeStyle = `rgba(79,124,255,${0.55 + Math.sin(t*5)*0.2})`;
    ctx.lineWidth = 3*k;
    ctx.beginPath(); ctx.arc(p.x, p.y + 2*k, 30*k, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = 'rgba(79,124,255,.12)'; ctx.fill();
  }

  ctx.fillStyle = '#ffe36e';
  for (const b of S.b){
    const bw = b.big ? 3.4 : 2.2, bl = b.big ? 8.5 : 7;
    ctx.beginPath(); ctx.ellipse(b.x, b.y, bw*k, bl*k, Math.atan2(b.vx, -b.vy), 0, Math.PI*2); ctx.fill();
  }
  for (const b of S.eb){
    ctx.fillStyle = b.c || '#ff5d73'; ctx.globalAlpha = 0.35;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r*1.8, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff4e0';
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r*0.4, 0, Math.PI*2); ctx.fill();
  }

  for (const f of S.fx){
    ctx.globalAlpha = clamp(f.life / f.max, 0, 1);
    ctx.fillStyle = f.c;
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  drawClouds(1, starA);
  drawSnow(Math.min(0.05, frameDt));

  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `700 ${14*k}px "Chakra Petch", sans-serif`;
  for (const t of S.pop){
    ctx.globalAlpha = clamp(t.life * 1.5, 0, 1);
    ctx.fillStyle = t.gold ? '#ffe36e' : '#fff4e0'; ctx.fillText(T(t.txt), t.x, t.y);
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  drawRain();
  if (S.phase === 'warn'){
    // hazard stripes at top and bottom + red pulse while the boss approaches
    const t = performance.now() / 1000, a = Math.min(1, (2.6 - S.phaseT) * 3, S.phaseT * 3);
    ctx.globalAlpha = a * (0.12 + Math.sin(t * 8) * 0.06);
    ctx.fillStyle = '#ff5d73'; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = a * 0.9;
    const bh = 18, off = (t * 60) % 36;
    for (const y of [64, H - bh - 96]){
      ctx.save(); ctx.beginPath(); ctx.rect(0, y, W, bh); ctx.clip();
      ctx.fillStyle = '#1a1530'; ctx.fillRect(0, y, W, bh);
      ctx.fillStyle = '#ffe36e';
      for (let x = -36 + (y < H/2 ? off : -off); x < W + 36; x += 36){
        ctx.beginPath(); ctx.moveTo(x, y + bh); ctx.lineTo(x + 18, y + bh); ctx.lineTo(x + 36, y); ctx.lineTo(x + 18, y); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
  if (S.flash > 0){
    ctx.globalAlpha = Math.min(0.7, S.flash * 1.4);
    ctx.fillStyle = '#fff4e0'; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }
  if (S.boss && !S.boss.entering){
    const B = S.boss, x = 16, w = W - 32, y = S.campaign ? 104 : 84;
    ctx.fillStyle = 'rgba(26,21,48,.55)'; ctx.fillRect(x, y, w, 8);
    ctx.fillStyle = '#ff5d73'; ctx.fillRect(x, y, w * Math.max(0, B.hp) / B.max, 8);
    ctx.font = '700 11px "Chakra Petch", sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.fillStyle = '#fff4e0'; ctx.fillText(B.name.toUpperCase() + (B.enraged ? L(' · FURIA', ' · FURY') : ''), x, y - 3);
    if (B.kind === 'stormo'){
      ctx.fillStyle = 'rgba(26,21,48,.8)';
      for (const f of [1/3, 2/3]) ctx.fillRect(x + w*f - 1, y, 2, 8);
    }
  }
  if (S.banner){
    const bn = S.banner, age = bn.max - bn.life;
    ctx.globalAlpha = Math.min(1, age * 3, bn.life * 2);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const size = Math.min(34, W / (bn.txt.length * 0.75));
    ctx.font = `${size}px Bungee, Impact, sans-serif`;
    ctx.fillStyle = 'rgba(26,21,48,.5)'; ctx.fillText(bn.txt.toUpperCase(), W/2, H*0.42 + 3);
    ctx.fillStyle = '#ffe36e'; ctx.fillText(bn.txt.toUpperCase(), W/2, H*0.42);
    ctx.font = `700 15px "Chakra Petch", sans-serif`;
    ctx.fillStyle = '#fff4e0'; ctx.fillText(bn.sub, W/2, H*0.42 + size * 0.9 + 4);
    ctx.globalAlpha = 1;
  }
}

let menuT = 0, frameDt = 0.016;
function drawMenuScene(){
  const x = W/2 + Math.sin(menuT*0.8) * W*0.25, y = H*0.88 + Math.cos(menuT*1.6)*12*k;
  const PL = plane();
  drawPlane(x + 13*k, y + 22*k, k*0.8*PL.size, 1, shadowOf(PL));
  drawPlane(x, y, k*PL.size, 1, colOf(PL), Math.cos(menuT*0.8)*0.6);
}

