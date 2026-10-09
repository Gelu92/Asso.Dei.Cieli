/* Asso dei Cieli - Gelu inc. | scenario: nuvole, mare, isole, barche, ambientazioni */

/* ---------- clouds ---------- */
const cloudImg = document.createElement('canvas');
(() => {
  cloudImg.width = 240; cloudImg.height = 120;
  const c = cloudImg.getContext('2d');
  const blobs = [[70,70,40],[115,55,50],[165,72,38],[120,82,44],[90,85,30],[150,88,30]];
  for (const [x,y,r] of blobs){
    const g = c.createRadialGradient(x, y - r*0.3, r*0.2, x, y, r);
    g.addColorStop(0, 'rgba(255,244,224,1)');
    g.addColorStop(1, 'rgba(255,214,200,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI*2); c.fill();
  }
})();
let clouds = [];
function makeClouds(){
  clouds = []; for (let i = 0; i < 9; i++) clouds.push(newCloud(rnd(-120, H)));
  // start with one island already in view
  islands = [{ img: islandImgs[0], x: W * rnd(0.15, 0.85), y: H * 0.55, s: 0.65 * k, rot: rnd(0, 6) }];
  biome.from = biome.to = 'mare'; biome.mix = 1;
}
function newCloud(y){
  const layer = Math.random() < 0.7 ? 0 : 1;
  return { x: rnd(-80, W + 80), y, s: rnd(0.6, 1.4) * (layer ? 1.5 : 1), sp: layer ? rnd(140,180) : rnd(40,70), a: layer ? 0.28 : rnd(0.35,0.6), layer };
}
function moveClouds(dt){
  for (const c of clouds){ c.y += c.sp * k * dt; if (c.y > H + 80) Object.assign(c, newCloud(-140 - rnd(0, 100))); }
  moveSea(dt);
}

/* ---------- the sea far below: islands and boats drifting by ---------- */
function smoothBlob(c2, pts, cx, cy, sc){
  const n = pts.length, P = pts.map(([x, y]) => [cx + (x - cx) * sc, cy + (y - cy) * sc]);
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const m0 = mid(P[n - 1], P[0]);
  c2.beginPath(); c2.moveTo(m0[0], m0[1]);
  for (let i = 0; i < n; i++){ const m = mid(P[i], P[(i + 1) % n]); c2.quadraticCurveTo(P[i][0], P[i][1], m[0], m[1]); }
  c2.closePath();
}
const islandImgs = Array.from({ length: 4 }, () => {
  const c = document.createElement('canvas'); c.width = c.height = 300;
  const c2 = c.getContext('2d'), n = 13, base = rnd(70, 100), stretch = rnd(0.9, 1.35);
  const pts = Array.from({ length: n }, (_, i) => {
    const a = i / n * Math.PI * 2, r = base * rnd(0.62, 1.08);
    return [150 + Math.cos(a) * r * stretch, 150 + Math.sin(a) * r];
  });
  smoothBlob(c2, pts, 150, 150, 1.32); c2.fillStyle = 'rgba(159,216,255,.14)'; c2.fill();   // lagoon
  smoothBlob(c2, pts, 150, 150, 1.08); c2.fillStyle = 'rgba(255,232,190,.42)'; c2.fill();   // sand
  smoothBlob(c2, pts, 150, 150, 1);    c2.fillStyle = 'rgba(47,74,82,.42)';    c2.fill();   // land
  smoothBlob(c2, pts, 150, 150, 0.55); c2.fillStyle = 'rgba(47,74,82,.25)';    c2.fill();   // hill
  for (let i = 0; i < 22; i++){                                                            // palm tops
    const a = rnd(0, Math.PI * 2), r = rnd(base * 0.3, base * 0.85);
    c2.fillStyle = `rgba(${Math.random() < 0.5 ? '43,179,166' : '36,60,66'},.32)`;
    c2.beginPath(); c2.arc(150 + Math.cos(a) * r * stretch, 150 + Math.sin(a) * r, rnd(2.5, 5), 0, Math.PI * 2); c2.fill();
  }
  return c;
});
/* ---------- landscapes below: sea, desert, ice, city, volcano ---------- */
const BIOMES = ['mare', 'deserto', 'ghiaccio', 'citta', 'vulcano'];
const BIOME_TINT = {
  mare: null,
  deserto: 'rgba(235,180,100,.40)',
  ghiaccio: 'rgba(215,235,255,.42)',
  citta: 'rgba(30,30,52,.50)',
  vulcano: 'rgba(70,18,22,.50)'
};
const BIOME_SUB = {
  deserto: L('Sorvoli il deserto', 'Over the desert'),
  ghiaccio: L('Sopra i ghiacci del nord', 'Over the northern ice'),
  citta: L('Sopra la città', 'Over the city'),
  vulcano: L('Sorvoli il vulcano', 'Over the volcano')
};
const biome = { from: 'mare', to: 'mare', mix: 1 };
function setBiome(b){
  if (!BIOMES.includes(b) || b === biome.to) return;
  biome.from = biome.to; biome.to = b; biome.mix = 0;
  propT = 0.5;
}
const biomeForLevel = lvl => BIOMES[(lvl - 1) % BIOMES.length];
const isWater = () => biome.to === 'mare' || biome.to === 'ghiaccio';
function sprite(w, h, draw){ const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return c; }
const BIOME_IMGS = {
  deserto: [
    ...Array.from({ length: 3 }, () => sprite(360, 200, (c2, w, h) => {
      // sand ripples: soft parallel waves with a lit edge and a shadow edge
      for (let i = 0; i < 6; i++){
        const y0 = 30 + i * 28, amp = rnd(8, 16), ph = rnd(0, 6);
        const wave = (dy) => { c2.beginPath(); for (let x = 0; x <= w; x += 12) c2.lineTo(x, y0 + dy + Math.sin(x / 50 + ph) * amp); };
        c2.lineWidth = 7; c2.lineCap = 'round';
        c2.strokeStyle = 'rgba(150,95,45,.22)'; wave(4); c2.stroke();
        c2.strokeStyle = 'rgba(255,228,175,.28)'; wave(0); c2.stroke();
      }
    })),
    sprite(220, 220, (c2) => {
      // oasis: water, sand ring, palms
      c2.fillStyle = 'rgba(255,225,170,.6)'; c2.beginPath(); c2.ellipse(110, 110, 90, 70, 0, 0, Math.PI*2); c2.fill();
      c2.fillStyle = 'rgba(80,190,200,.75)'; c2.beginPath(); c2.ellipse(110, 112, 55, 38, 0.2, 0, Math.PI*2); c2.fill();
      for (let i = 0; i < 7; i++){
        const a = i / 7 * Math.PI * 2, x = 110 + Math.cos(a) * 72, y = 110 + Math.sin(a) * 54;
        c2.fillStyle = 'rgba(46,125,91,.8)';
        for (let j = 0; j < 5; j++){ const b = j / 5 * Math.PI * 2; c2.beginPath(); c2.ellipse(x + Math.cos(b) * 8, y + Math.sin(b) * 8, 9, 3.5, b, 0, Math.PI*2); c2.fill(); }
      }
    })
  ],
  ghiaccio: Array.from({ length: 4 }, () => sprite(240, 240, (c2) => {
    // iceberg: jagged white top with a blue shaded side and a dark-water halo
    const n = 9, pts = Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2, r = rnd(50, 95); return [120 + Math.cos(a) * r, 120 + Math.sin(a) * r * 0.8]; });
    c2.fillStyle = 'rgba(40,70,110,.35)'; c2.beginPath(); pts.forEach(([x, y], i) => i ? c2.lineTo(x + 8, y + 10) : c2.moveTo(x + 8, y + 10)); c2.closePath(); c2.fill();
    c2.fillStyle = 'rgba(245,250,255,.95)'; c2.beginPath(); pts.forEach(([x, y], i) => i ? c2.lineTo(x, y) : c2.moveTo(x, y)); c2.closePath(); c2.fill();
    c2.fillStyle = 'rgba(160,205,240,.7)'; c2.beginPath(); c2.moveTo(120, 120); pts.slice(0, 4).forEach(([x, y]) => c2.lineTo(x, y)); c2.closePath(); c2.fill();
  })),
  citta: Array.from({ length: 5 }, () => sprite(260, 260, (c2) => {
    // a city block seen from above: rooftops, a courtyard, lit windows
    c2.fillStyle = 'rgba(60,58,80,.75)'; c2.fillRect(10, 10, 240, 240);
    c2.strokeStyle = 'rgba(255,227,110,.35)'; c2.lineWidth = 3; c2.setLineDash([12, 10]); c2.strokeRect(4, 4, 252, 252); c2.setLineDash([]);
    for (let i = 0; i < 6; i++){
      const x = 20 + (i % 3) * 78, y = 20 + Math.floor(i / 3) * 118, w = rnd(50, 68), h = rnd(70, 100);
      c2.fillStyle = ['#4a4560', '#5b5470', '#3d3a52', '#6b6380'][i % 4]; c2.fillRect(x, y, w, h);
      c2.fillStyle = 'rgba(255,255,255,.12)'; c2.fillRect(x, y, w, 6);
      c2.fillStyle = 'rgba(255,227,110,.75)';
      for (let j = 0; j < 6; j++) if (Math.random() < 0.6) c2.fillRect(x + 6 + (j % 3) * ((w - 16) / 3), y + 14 + Math.floor(j / 3) * 26, 6, 6);
    }
  })),
  vulcano: [
    sprite(300, 300, (c2) => {
      // cone with a glowing crater
      const gr = c2.createRadialGradient(150, 150, 10, 150, 150, 140);
      gr.addColorStop(0, 'rgba(110,40,30,.95)'); gr.addColorStop(0.6, 'rgba(60,24,30,.9)'); gr.addColorStop(1, 'rgba(40,18,26,0)');
      c2.fillStyle = gr; c2.beginPath(); c2.arc(150, 150, 140, 0, Math.PI*2); c2.fill();
      const lava = c2.createRadialGradient(150, 150, 4, 150, 150, 40);
      lava.addColorStop(0, '#ffe36e'); lava.addColorStop(0.5, '#ff8a1f'); lava.addColorStop(1, 'rgba(255,90,30,0)');
      c2.fillStyle = lava; c2.beginPath(); c2.arc(150, 150, 40, 0, Math.PI*2); c2.fill();
      c2.strokeStyle = 'rgba(255,120,40,.8)'; c2.lineWidth = 5; c2.lineCap = 'round';
      c2.beginPath(); c2.moveTo(160, 178); c2.quadraticCurveTo(190, 220, 175, 280); c2.stroke();
    }),
    ...Array.from({ length: 2 }, () => sprite(260, 200, (c2) => {
      // lava river across dark rock
      c2.fillStyle = 'rgba(40,20,26,.6)'; c2.beginPath(); c2.ellipse(130, 100, 125, 85, 0, 0, Math.PI*2); c2.fill();
      c2.strokeStyle = 'rgba(255,138,31,.85)'; c2.lineWidth = 9; c2.lineCap = 'round';
      c2.beginPath(); c2.moveTo(15, rnd(60, 140)); c2.bezierCurveTo(80, rnd(0, 200), 170, rnd(0, 200), 245, rnd(60, 140)); c2.stroke();
      c2.strokeStyle = 'rgba(255,227,110,.8)'; c2.lineWidth = 3; c2.stroke();
    }))
  ]
};
const PROP_EVERY = { mare: [6, 11], deserto: [2.5, 5], ghiaccio: [3.5, 7], citta: [1.2, 2.2], vulcano: [5, 9] };
let propT = 2;
let islands = [], boats = [], islandT = 2, boatT = 3;
function moveSea(dt){
  const sp = 26 * k * dt;
  if (biome.mix < 1) biome.mix = Math.min(1, biome.mix + dt / 3);
  propT -= dt;
  if (propT <= 0){
    const b = biome.to, list = b === 'mare' ? islandImgs : BIOME_IMGS[b];
    const img = list[Math.floor(Math.random() * list.length)];
    const s = (b === 'citta' ? rnd(0.5, 0.7) : rnd(0.45, 0.85)) * k;
    islands.push({ img, x: b === 'citta' ? rnd(0, W) : rnd(-40, W + 40), y: -img.height * s / 2 - 20, s, rot: b === 'citta' ? 0 : b === 'deserto' ? rnd(-0.15, 0.15) : rnd(0, 6) });
    const [a, z] = PROP_EVERY[b]; propT = rnd(a, z);
  }
  for (const i of islands) i.y += sp;
  islands = islands.filter(i => i.y < H + Math.max(i.img.width, i.img.height) * i.s);
  boatT -= dt;
  if (boatT <= 0 && isWater()){
    const dir = Math.random() < 0.5 ? 1 : -1;
    boats.push({ x: dir > 0 ? -20 : W + 20, y: rnd(H * 0.1, H * 0.7), vx: dir * rnd(10, 22) * k, t: 0 });
    boatT = rnd(5, 10);
  }
  for (const b of boats){ b.x += b.vx * dt; b.y += sp; b.t += dt; }
  boats = boats.filter(b => b.x > -40 && b.x < W + 40 && b.y < H + 30);
}
function drawSea(starA){
  const fade = 1 - starA * 0.35;
  // ground colour of the landscape, cross-fading when it changes
  for (const [b, a] of [[biome.from, 1 - biome.mix], [biome.to, biome.mix]]){
    if (!BIOME_TINT[b] || a <= 0) continue;
    ctx.globalAlpha = a; ctx.fillStyle = BIOME_TINT[b]; ctx.fillRect(-20, -20, W + 40, H + 40);
  }
  ctx.globalAlpha = fade;
  for (const i of islands){
    ctx.save(); ctx.translate(i.x, i.y); ctx.rotate(i.rot);
    ctx.drawImage(i.img, -i.img.width / 2 * i.s, -i.img.height / 2 * i.s, i.img.width * i.s, i.img.height * i.s);
    ctx.restore();
  }
  if (biome.to === 'vulcano'){
    const t = performance.now() / 1000;
    ctx.fillStyle = 'rgba(255,138,31,.7)';
    for (let i = 0; i < 18; i++){ const x = ((i * 97 + t * 14) % (W + 40)) - 20, y = H - ((i * 211 + t * 40 * (1 + i % 3)) % (H + 40)); ctx.fillRect(x, y, 2*k, 2*k); }
  }
  for (const b of boats){
    const dir = Math.sign(b.vx), L = 9 * k;
    // wake: two fading lines in a V behind the hull
    ctx.strokeStyle = 'rgba(255,244,224,.28)'; ctx.lineWidth = 1.2 * k;
    ctx.beginPath();
    ctx.moveTo(b.x - dir * L, b.y); ctx.lineTo(b.x - dir * L * 5, b.y - 7 * k);
    ctx.moveTo(b.x - dir * L, b.y); ctx.lineTo(b.x - dir * L * 5, b.y + 7 * k);
    ctx.stroke();
    ctx.fillStyle = 'rgba(40,30,56,.7)';
    ctx.beginPath(); ctx.ellipse(b.x, b.y, L, 3 * k, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,244,224,.6)';
    ctx.fillRect(b.x - dir * 3 * k - 2 * k, b.y - 1.5 * k, 4 * k, 3 * k);
    if (starA > 0.3){
      ctx.fillStyle = `rgba(255,227,110,${0.5 + Math.sin(b.t * 4) * 0.3})`;
      ctx.beginPath(); ctx.arc(b.x + dir * L * 0.8, b.y, 1.8 * k, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

