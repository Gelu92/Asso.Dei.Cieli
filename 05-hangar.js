/* Asso dei Cieli - Gelu inc. | hangar, potenziamenti e scatola misteriosa */

/* ---------- hangar ---------- */
function renderHangar(){
  $('hangarCoins').innerHTML = coinHTML(wallet);
  renderBoxRow();
  renderDrone();
  $('planeList').innerHTML = PLANES.map(P => {
    const has = owned.includes(P.id), sel = P.id === selPlane;
    if (P.secret && !has){
      const isSilver = P.secret === 'silver', got = isSilver ? silver : pieces, need = isSilver ? SILVER_NEEDED : PIECES_NEEDED;
      const dia = Array.from({ length: need }, (_, i) => `<i class="${i < got ? 'on' : ''}${isSilver ? ' silver' : ''}"></i>`).join('');
      return `<div class="plane secret wide"><canvas data-prev="${P.id}" width="128" height="128"></canvas>
        <h3>???</h3><div class="trait">${L('Aereo segreto', 'Secret plane')}</div><p>${isSilver ? L('Trova i pezzi d\'argento nelle scatole misteriose', 'Find the silver pieces in mystery boxes') : L('Raccogli i pezzi rari che lasciano i boss', 'Collect the rare pieces that bosses drop')}</p>
        <div class="pieces" aria-label="${got} / ${need}">${dia}</div>
        <button class="buy" disabled>${got} / ${need}</button></div>`;
    }
    const btn = sel ? `<button class="buy using" disabled>${L('In volo', 'Flying')}</button>`
      : has ? `<button class="buy" data-plane="${P.id}">${L('Scegli', 'Select')}</button>`
      : `<button class="buy" data-plane="${P.id}" ${wallet < P.cost ? 'disabled' : ''} aria-label="${L('Sblocca', 'Unlock')} ${P.name}: ${P.cost} ${L('monete', 'coins')}">${COIN}${P.cost}</button>`;
    return `<div class="plane${sel ? ' sel' : ''}${P.secret ? ' wide' : ''}"><canvas data-prev="${P.id}" width="128" height="128"></canvas>
      <h3>${P.name}</h3><div class="trait">${P.trait}</div><p>${P.desc}</p><p class="abl">${L('Speciale', 'Special')}: ${ABILITY[P.id].name}</p>${btn}</div>`;
  }).join('');
  for (const c of $('planeList').querySelectorAll('canvas')){
    const P = PLANES.find(x => x.id === c.dataset.prev), pc = c.getContext('2d');
    pc.clearRect(0, 0, 128, 128);
    g = pc;
    drawPlane(70, 72, 2.1 * P.size, 1, shadowOf(P));
    drawPlane(62, 62, 2.3 * P.size, 1, colOf(P));
    g = ctx;
  }
  // liveries of the plane in use
  const P = plane(), cur = liverySel[P.id] || 0;
  const opts = [{ name: T('Originale') }, ...LIVERIES[P.id]];
  $('liveryLabel').textContent = T('Livrea') + ' · ' + P.name;
  $('liveryList').innerHTML = opts.map((lv, i) => {
    const key = P.id + ':' + i, has = i === 0 || liveryOwned.includes(key);
    if (lv.exclusive && !has) return '';
    const btn = i === cur ? `<button class="buy using" disabled>${L('In uso', 'In use')}</button>`
      : has ? `<button class="buy" data-livery="${i}">${L('Scegli', 'Select')}</button>`
      : `<button class="buy" data-livery="${i}" ${wallet < LIVERY_COST ? 'disabled' : ''} aria-label="${LANG === 'en' ? 'Buy paint job' : 'Compra la livrea'} ${lv.name}: ${LIVERY_COST}">${COIN}${LIVERY_COST}</button>`;
    return `<div class="livery${i === cur ? ' sel' : ''}"><canvas data-liv="${i}" width="96" height="96"></canvas><h3>${lv.name}</h3>${btn}</div>`;
  }).join('');
  for (const c of $('liveryList').querySelectorAll('canvas')){
    const i = +c.dataset.liv, pc = c.getContext('2d');
    const col = i ? Object.assign({}, P.col, (({ name, ...r }) => r)(LIVERIES[P.id][i - 1])) : P.col;
    g = pc; drawPlane(48, 46, 1.7 * P.size, 1, col); g = ctx;
  }
  $('upgList').innerHTML = UPG.map(u => {
    const lvl = up[u.id], max = u.cost.length, maxed = lvl >= max, cost = u.cost[lvl];
    const pips = Array.from({ length: max }, (_, i) => `<i class="${i < lvl ? 'on' : ''}"></i>`).join('');
    const btn = maxed
      ? `<button class="buy" disabled>${L('Massimo', 'Max')}</button>`
      : `<button class="buy" data-id="${u.id}" ${wallet < cost ? 'disabled' : ''} aria-label="${L('Compra', 'Buy')} ${u.name}: ${cost}">${COIN}${cost}</button>`;
    return `<div class="upg"><h3>${u.name}</h3>${btn}<p>${u.desc}</p><div class="pips">${pips}</div></div>`;
  }).join('');
}
/* ---------- mystery box ---------- */
const BOX_COST = 100;
const goldIdx = id => LIVERIES[id].findIndex(l => l.key === 'gold') + 1;
function renderBoxRow(){
  $('boxTitle').textContent = L('Scatola misteriosa', 'Mystery box');
  $('boxDesc').textContent = L('Monete, livree d\'oro esclusive o pezzi d\'argento per un aereo segreto', 'Coins, exclusive gold paint jobs or silver pieces for a secret plane');
  $('boxBuy').innerHTML = COIN + BOX_COST;
  $('boxBuy').disabled = wallet < BOX_COST;
  $('boxBuy').setAttribute('aria-label', L('Apri una scatola misteriosa per ', 'Open a mystery box for ') + BOX_COST + L(' monete', ' coins'));
}
function rollBox(){
  const r = Math.random();
  if (r < 0.08) return { type: 'coins', n: 500, jackpot: true };
  if (r < 0.30 && silver < SILVER_NEEDED && !owned.includes('spettro')) return { type: 'silver' };
  if (r < 0.55){
    const free = PLANES.filter(P => owned.includes(P.id) && !liveryOwned.includes(P.id + ':' + goldIdx(P.id)));
    if (free.length) return { type: 'gold', plane: free[Math.floor(Math.random() * free.length)] };
  }
  const amounts = [40, 50, 60, 80, 100, 120, 150, 200, 250];
  return { type: 'coins', n: amounts[Math.floor(Math.pow(Math.random(), 1.6) * amounts.length)] };
}
function openBox(free = false){
  if (!free && wallet < BOX_COST){ sfx.deny(); return; }
  initAudio();
  if (!free){ wallet -= BOX_COST; save('asso-coins', wallet); }
  const prize = rollBox();
  let title, text;
  if (prize.type === 'coins'){
    wallet += prize.n; save('asso-coins', wallet);
    title = (prize.jackpot ? 'JACKPOT! ' : '') + '+' + prize.n + L(' monete', ' coins');
    text = prize.jackpot ? L('Il premio più raro della scatola!', 'The rarest prize in the box!') : L('Monete da spendere nell\'hangar.', 'Coins to spend in the hangar.');
  } else if (prize.type === 'gold'){
    const key = prize.plane.id + ':' + goldIdx(prize.plane.id);
    liveryOwned.push(key); save('asso-liveries', liveryOwned);
    title = L('Livrea d\'oro!', 'Gold paint job!');
    text = L('Una livrea esclusiva per ', 'An exclusive paint job for ') + prize.plane.name + L('. La trovi nell\'hangar, sotto Livrea.', '. Find it in the hangar, under Paint job.');
  } else {
    silver++; save('asso-silver', silver);
    title = L('Pezzo d\'argento ', 'Silver piece ') + silver + '/' + SILVER_NEEDED;
    text = L('Raccogline 5 per sbloccare un aereo segreto.', 'Collect 5 to unlock a secret plane.');
    if (silver >= SILVER_NEEDED && !owned.includes('spettro')){
      owned.push('spettro'); save('asso-planes', owned);
      title = L('Hai sbloccato lo Spettro!', 'You unlocked the Wraith!');
      text = L('Un aereo segreto con colpi perforanti e l\'abilità Eclissi, che rallenta il tempo.', 'A secret plane with piercing shots and the Eclipse ability, which slows time down.');
    }
  }
  // reveal after the box shakes
  const box = $('bigBox');
  box.classList.remove('open', 'shake'); void box.offsetWidth; box.classList.add('shake');
  $('prizeTitle').textContent = ''; $('prizeText').textContent = ''; $('prizeCanvas').hidden = true;
  $('boxAgain').hidden = true; $('boxClose').hidden = true;
  $('boxClose').textContent = T('Indietro');
  state = 'box'; show('boxOv'); sfx.dash();
  setTimeout(() => {
    box.classList.remove('shake'); box.classList.add('open');
    $('prizeTitle').textContent = title; $('prizeText').textContent = text;
    if (prize.type !== 'coins'){
      const P = prize.type === 'gold' ? prize.plane : PLANES.find(x => x.id === 'spettro');
      const c = $('prizeCanvas'), pc = c.getContext('2d');
      pc.clearRect(0, 0, 160, 160);
      const col = prize.type === 'gold' ? Object.assign({}, P.col, (({ name, key, exclusive, ...r }) => r)(EXCLUSIVE[0])) : P.col;
      g = pc; drawPlane(80, 80, 2.8, 1, col); g = ctx;
      c.hidden = false;
    }
    $('boxAgain').textContent = L('Apri un\'altra · ', 'Open another · ') + BOX_COST;
    $('boxAgain').disabled = wallet < BOX_COST;
    $('boxAgain').hidden = false; $('boxClose').hidden = false;
    prize.jackpot || prize.type !== 'coins' ? sfx.win() : sfx.buy();
    vib(prize.jackpot ? [60, 40, 60, 40, 120] : 40);
    refreshMenuStats(); onProgress();
  }, reduceMotion ? 150 : 950);
}
$('boxBuy').onclick = () => openBox();
$('boxAgain').onclick = () => openBox();
$('boxClose').onclick = () => openHangar();

$('liveryList').addEventListener('click', e => {
  const b = e.target.closest('.buy[data-livery]');
  if (!b) return;
  initAudio();
  const P = plane(), i = +b.dataset.livery, key = P.id + ':' + i;
  if (i > 0 && !liveryOwned.includes(key)){
    if (wallet < LIVERY_COST){ sfx.deny(); return; }
    wallet -= LIVERY_COST; liveryOwned.push(key);
    save('asso-coins', wallet); save('asso-liveries', liveryOwned);
    sfx.buy(); vib(30);
  } else sfx.pick();
  liverySel[P.id] = i; save('asso-livery', liverySel);
  renderHangar(); refreshMenuStats();
});
$('planeList').addEventListener('click', e => {
  const b = e.target.closest('.buy[data-plane]');
  if (!b) return;
  initAudio();
  const P = PLANES.find(x => x.id === b.dataset.plane);
  if (!owned.includes(P.id)){
    if (wallet < P.cost){ sfx.deny(); return; }
    wallet -= P.cost; owned.push(P.id);
    save('asso-coins', wallet); save('asso-planes', owned);
    sfx.buy(); vib(30);
  } else sfx.pick();
  selPlane = P.id; save('asso-sel', selPlane);
  renderHangar(); refreshMenuStats();
});
$('upgList').addEventListener('click', e => {
  const b = e.target.closest('.buy[data-id]');
  if (!b) return;
  initAudio();
  const u = UPG.find(x => x.id === b.dataset.id), cost = u.cost[up[u.id]];
  if (cost == null || wallet < cost){ sfx.deny(); return; }
  wallet -= cost; up[u.id]++;
  save('asso-coins', wallet); save('asso-up', up);
  sfx.buy(); vib(20);
  renderHangar(); refreshMenuStats();
});

