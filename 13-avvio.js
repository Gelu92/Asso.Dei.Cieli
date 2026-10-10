/* Asso dei Cieli - Gelu inc. | ciclo di gioco, tutorial, menu, impostazioni, condivisione, inglese, avvio */

/* ---------- loop ---------- */
let last = performance.now();
function frame(now){
  const raw = now - last;
  const dt = Math.min(0.05, raw / 1000); last = now;
  frameDt = dt;
  // if frames stay slow (under ~45 fps) for 3 seconds of play, switch to light effects for good
  if (state === 'play' && !perf.low && raw < 200){
    perf.ema += (raw - perf.ema) * 0.05;
    perf.slowT = perf.ema > 22 ? perf.slowT + dt : Math.max(0, perf.slowT - dt);
    if (perf.slowT > 3){ perf.low = true; try { localStorage.setItem('asso-lowfx', '1'); } catch(e){} resize(); }
  }
  music.want = musicWanted();
  engineTick();
  if (state === 'play') update(S.rule === 'turbo' ? dt * 1.3 : dt);
  else if (state === 'land') updateLanding(dt);
  else if (isMenuState()){ menuT += dt; moveClouds(dt); }
  draw();
  requestAnimationFrame(frame);
}

/* ---------- tutorial ---------- */
const TUT = [
  { title: 'Pilota col dito', html: `
      <svg class="ill" viewBox="0 0 120 90" aria-hidden="true">
        <path d="M30 70 Q60 40 90 62" fill="none" stroke="#2bb3a6" stroke-width="3" stroke-dasharray="5 6" stroke-linecap="round"/>
        <path d="M60 14 l14 10 v4 l-14 -2 l-14 2 v-4z M57 10 h6 v26 h-6z M53 34 h14 v3 h-14z" fill="#fff4e0"/>
        <circle cx="90" cy="62" r="9" fill="none" stroke="#ffe36e" stroke-width="3"/><circle cx="90" cy="62" r="3" fill="#ffe36e"/>
      </svg>
      <h2>Pilota col dito</h2>
      <p>Appoggia il dito in un punto qualsiasi dello schermo e trascinalo: l'aereo segue il movimento. Spara da solo.</p>` },
  { title: 'Bonus', html: `
      <h2>Bonus</h2>
      <div class="chips">
        <div class="chip"><b style="background:#2bb3a6">P</b>Potenza: un cannone in più, fino al livello 5</div>
        <div class="chip"><b style="background:#a46be0">G</b>Due gregari volano e sparano con te</div>
        <div class="chip"><b style="background:#4f7cff">S</b>Scudo che assorbe un colpo</div>
        <div class="chip"><b style="background:#ff9a4d">B</b>Una bomba in più</div>
        <div class="chip"><b style="background:#ff5d73">+</b>Una vita in più</div>
      </div>
      <p>Se vieni colpito perdi un livello di potenza e i gregari. Abbattere nemici di fila fa salire il moltiplicatore fino a x5.</p>` },
  { title: 'Bomba e boss', html: `
      <svg class="ill" viewBox="0 0 120 90" aria-hidden="true">
        <circle cx="60" cy="48" r="28" fill="#ff5d73" stroke="#fff4e0" stroke-width="4"/>
        <circle cx="56" cy="52" r="10" fill="#fff4e0"/><path d="M62 42 l6 -6 M68 36 l4 2 M68 36 l2 -4" stroke="#fff4e0" stroke-width="3" stroke-linecap="round" fill="none"/>
      </svg>
      <h2>Bomba e boss</h2>
      <p>Il pulsante rosso in basso cancella i proiettili nemici. Quello col fulmine si carica abbattendo nemici e lancia l'abilità speciale del tuo aereo. Alla fine di ogni ondata arriva un boss: sconfiggilo e raccogli il pezzo raro che lascia cadere.</p>` }
];
let tutI = 0, tutThen = null;
function openTutorial(then){
  tutI = 0; tutThen = then; state = 'tut'; setHud(false); renderTut(); show('tutOv');
}
function renderTut(){
  $('tutSlide').innerHTML = TUT[tutI].html;
  translateDOM($('tutSlide'));
  $('tutStep').textContent = (tutI + 1) + L(' di ', ' of ') + TUT.length;
  $('tutDots').innerHTML = TUT.map((_, i) => `<i class="${i === tutI ? 'on' : ''}"></i>`).join('');
  const lastSlide = tutI === TUT.length - 1;
  $('tutNext').textContent = lastSlide ? (tutThen ? T('Decolla') : L('Ho capito', 'Got it')) : T('Avanti');
  $('tutSkip').hidden = lastSlide;
}
function endTutorial(){
  save('asso-tut', true);
  const then = tutThen; tutThen = null;
  if (then) then(); else toMenu();
}
$('tutNext').onclick = () => { if (tutI < TUT.length - 1){ tutI++; renderTut(); } else endTutorial(); };
$('tutSkip').onclick = endTutorial;

/* ---------- flow ---------- */
const OVERLAYS = ['menu','hangarOv','pauseOv','overOv','missionsOv','boardOv','tutOv','profileOv','settingsOv','campaignOv','briefOv','shareOv','boxOv','partyOv','loginOv','encyOv'];
function show(id){ for (const o of OVERLAYS) $(o).hidden = o !== id; }
function isMenuState(){ return ['menu','hangar','missions','board','tut','profile','settings','campaign','brief','box','party','login','ency'].includes(state); }
function setHud(on){ $('hud').hidden = !on; $('bombBtn').hidden = !on; $('spBtn').hidden = !on; }
function bankCoins(){
  if (!S.coins || S.banked) return;
  S.banked = true; wallet += S.coins; save('asso-coins', wallet); refreshMenuStats();
}
function start(mode = 'normal', mIdx = 0){
  initAudio();
  if (!load('asso-tut', false)) return openTutorial(() => start(mode, mIdx));
  reset(mode, mIdx); state = 'play'; show(null); setHud(true);
}
function togglePause(){
  if (state === 'play'){ state = 'pause'; drag = null; show('pauseOv'); }
  else if (state === 'pause'){ state = 'play'; show(null); last = performance.now(); }
}
function gameOver(){
  if (S.campaign) return campaignOver(false);
  if (S.rush) return rushOver(false);
  if (S.party) return partyTurnOver();
  $('overTitle').textContent = T('Abbattuto!'); $('againBtn').textContent = T('Riprova');
  state = 'over'; setHud(false);
  bankCoins();
  mEvent('score', S.score);
  finishRun();
  let rec = false;
  const rank = recordRun();
  if (S.endless){
    const prev = +load('asso-endless', 0) || 0;
    rec = S.score > prev;
    if (rec) save('asso-endless', S.score);
    $('overEyebrow').textContent = T('Modalità infinita') + ' · ' + S.df.name;
    $('bestOverLabel').textContent = L('Record infinita', 'Endless best');
    $('bestOver').textContent = Math.max(prev, S.score).toLocaleString(NUM);
  } else if (S.daily){
    const prev = dailyBest();
    rec = S.score > prev;
    if (rec) save('asso-daily', { date: todayKey(), best: S.score });
    saveGhost();
    $('overEyebrow').textContent = L('Sfida del giorno · ', 'Daily challenge · ') + todayRule().name;
    $('bestOverLabel').textContent = L('Record di oggi', 'Today\'s best');
    $('bestOver').textContent = Math.max(prev, S.score).toLocaleString(NUM);
  } else {
    rec = S.score > best;
    if (rec){ best = S.score; save('asso-best', best); }
    $('overEyebrow').textContent = T('Missione finita') + ' · ' + S.df.name;
    $('bestOverLabel').textContent = T('Record');
    $('bestOver').textContent = best.toLocaleString(NUM);
  }
  $('finalScore').textContent = S.score.toLocaleString(NUM);
  $('kills').textContent = S.kills;
  $('waveOver').textContent = S.level;
  $('coinsOver').innerHTML = coinHTML('+' + S.coins);
  $('newRec').hidden = !rec;
  $('rankLine').hidden = rank < 0;
  if (rank >= 0) $('rankLine').textContent = (LANG === 'en' ? '#' + (rank + 1) + ' in your scores' : (rank + 1) + '° posto nella tua classifica');
  refreshMenuStats();
  show('overOv');
}
// every finished or abandoned run goes into the leaderboard (once)
function recordRun(){
  if (S.campaign || S.rush || S.party || S.zen || S.recorded || !(S.score > 0)) return -1;
  S.recorded = true;
  const d = new Date();
  return addToBoard({ score: S.score, wave: S.level, plane: plane().name, daily: !!S.daily, endless: !!S.endless, diff: S.dkey,
    date: String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') });
}
function toMenu(){
  if (state === 'pause'){ bankCoins(); finishRun(); recordRun(); mEvent('score', S.score); party = null; }
  state = 'menu'; setHud(false); refreshMenuStats(); show('menu');
  sky.from = sky.to = 0; sky.mix = 1;
  biome.from = biome.to = 'mare'; biome.mix = 1;
  checkLogin();
}
function openHangar(){
  initAudio();
  state = 'hangar'; setHud(false); renderHangar(); show('hangarOv');
  sky.from = sky.to = 0; sky.mix = 1;
}
function openMissions(){ initAudio(); state = 'missions'; renderMissions(); show('missionsOv'); }
function openBoard(){ initAudio(); state = 'board'; renderBoard(); show('boardOv'); }

/* ---------- settings ---------- */
let settingsFrom = 'menu', resetArmed = false;
function saveSettings(){ save('asso-settings', SET); applyMusicVolume(); applyBombSide(); }
function applyBombSide(){ $('bombBtn').classList.toggle('left', !!SET.bombLeft); $('spBtn').classList.toggle('left', !!SET.bombLeft); }
function renderSettings(){
  $('setMusic').value = SET.music; $('setMusicOut').textContent = SET.music + '%';
  $('setSfx').value = SET.sfx; $('setSfxOut').textContent = SET.sfx + '%';
  $('setVib').setAttribute('aria-pressed', String(SET.vib));
  $('setLow').setAttribute('aria-pressed', String(perf.low));
  for (const b of $('setSeason').querySelectorAll('button')) b.setAttribute('aria-checked', String(b.dataset.season === (SET.season || 'auto')));
  for (const b of $('setLang').querySelectorAll('button')) b.setAttribute('aria-checked', String(b.dataset.lang === LANG));
  for (const b of $('setBomb').querySelectorAll('button')) b.setAttribute('aria-checked', String((b.dataset.side === 'left') === !!SET.bombLeft));
  resetArmed = false; $('setReset').classList.remove('armed'); $('setResetNote').hidden = true;
  // during a paused run only the audio and control options make sense
  $('setTut').hidden = $('setReset').hidden = settingsFrom === 'pause';
  $('exportBtn').parentElement.hidden = $('exportBtn').parentElement.previousElementSibling.hidden =
    $('exportBtn').parentElement.previousElementSibling.previousElementSibling.hidden = settingsFrom === 'pause';
  $('saveBox').hidden = true; saveMode = null; importArmed = false;
}
function openSettings(){
  initAudio();
  settingsFrom = state === 'pause' ? 'pause' : 'menu';
  if (settingsFrom === 'menu') state = 'settings';
  renderSettings(); show('settingsOv');
}
$('setMusic').addEventListener('input', e => { SET.music = +e.target.value; $('setMusicOut').textContent = SET.music + '%'; saveSettings(); });
$('setSfx').addEventListener('input', e => { SET.sfx = +e.target.value; $('setSfxOut').textContent = SET.sfx + '%'; saveSettings(); });
$('setSfx').addEventListener('change', () => sfx.pick());
$('setVib').onclick = () => { SET.vib = !SET.vib; saveSettings(); renderSettings(); vib(40); };
$('setBomb').addEventListener('click', e => {
  const b = e.target.closest('button[data-side]'); if (!b) return;
  SET.bombLeft = b.dataset.side === 'left'; saveSettings(); renderSettings();
});
$('setLow').onclick = () => {
  perf.low = !perf.low; perf.slowT = 0; perf.ema = 16.7;
  try { localStorage.setItem('asso-lowfx', perf.low ? '1' : '0'); } catch(e){}
  resize(); renderSettings();
};
/* save code: every asso-* key, as JSON, base64 with a prefix */
const SAVE_PREFIX = 'ASSO1:';
function exportCode(){
  const data = {};
  try { for (const key of Object.keys(localStorage)) if (key.startsWith('asso-')) data[key] = localStorage.getItem(key); } catch(e){}
  const json = JSON.stringify(data);
  return SAVE_PREFIX + btoa(unescape(encodeURIComponent(json)));
}
function importCode(code){
  code = code.trim().replace(/\s+/g, '');
  if (!code.startsWith(SAVE_PREFIX)) throw new Error('prefix');
  const data = JSON.parse(decodeURIComponent(escape(atob(code.slice(SAVE_PREFIX.length)))));
  if (!data || typeof data !== 'object' || !Object.keys(data).some(key => key.startsWith('asso-'))) throw new Error('empty');
  for (const key of Object.keys(localStorage)) if (key.startsWith('asso-')) localStorage.removeItem(key);
  for (const [key, v] of Object.entries(data)) if (key.startsWith('asso-') && typeof v === 'string') localStorage.setItem(key, v);
}
let saveMode = null, importArmed = false;
$('exportBtn').onclick = () => {
  saveMode = 'export'; importArmed = false;
  $('saveBox').hidden = false; $('saveLabel').textContent = T('Il tuo codice');
  $('saveCode').value = exportCode(); $('saveCode').readOnly = true;
  $('saveAction').textContent = T('Copia codice'); $('saveMsg').textContent = '';
};
$('importBtn').onclick = () => {
  saveMode = 'import'; importArmed = false;
  $('saveBox').hidden = false; $('saveLabel').textContent = L('Incolla qui il codice', 'Paste the code here');
  $('saveCode').value = ''; $('saveCode').readOnly = false; $('saveCode').focus();
  $('saveAction').textContent = L('Importa', 'Import'); $('saveMsg').textContent = L('I progressi attuali verranno sostituiti.', 'Your current progress will be replaced.');
};
$('saveAction').onclick = () => {
  if (saveMode === 'export'){
    const ta = $('saveCode');
    const done = () => { $('saveMsg').textContent = L('Codice copiato. Incollalo con "Importa progressi" sull\'altro dispositivo.', 'Code copied. Paste it with "Import progress" on the other device.'); };
    const fallback = () => { ta.focus(); ta.select(); $('saveMsg').textContent = L('Codice selezionato: copialo con il menu del telefono.', 'Code selected: copy it with your phone\'s menu.'); };
    try { navigator.clipboard.writeText(ta.value).then(done, fallback); } catch(e){ fallback(); }
    return;
  }
  const code = $('saveCode').value;
  if (!code.trim()){ $('saveMsg').textContent = L('Incolla prima il codice esportato dall\'altro dispositivo.', 'First paste the code exported from the other device.'); return; }
  if (!importArmed){ importArmed = true; $('saveAction').textContent = L('Conferma importazione', 'Confirm import'); $('saveMsg').textContent = L('Tocca di nuovo per sostituire i progressi attuali con quelli del codice.', 'Tap again to replace your current progress with the one in the code.'); return; }
  try { importCode(code); location.reload(); }
  catch(e){ importArmed = false; $('saveAction').textContent = L('Importa', 'Import'); $('saveMsg').textContent = L('Il codice non è valido. Controlla di averlo copiato tutto, dall\'inizio "ASSO1:" alla fine.', 'That code is not valid. Make sure you copied all of it, from "ASSO1:" to the end.'); }
};
$('setSeason').addEventListener('click', e => {
  const b = e.target.closest('button[data-season]'); if (!b) return;
  SET.season = b.dataset.season; saveSettings(); applySeason(); renderSettings();
});
$('setLang').addEventListener('click', e => {
  const b = e.target.closest('button[data-lang]'); if (!b || b.dataset.lang === LANG) return;
  save('asso-lang', b.dataset.lang); location.reload();
});
$('setTut').onclick = () => openTutorial(null);
$('setReset').onclick = () => {
  if (!resetArmed){ resetArmed = true; $('setReset').classList.add('armed'); $('setResetNote').hidden = false; return; }
  const keep = ['asso-settings', 'asso-tut', 'asso-muted', 'asso-music'];
  try {
    for (const key of Object.keys(localStorage)) if (key.startsWith('asso-') && !keep.includes(key)) localStorage.removeItem(key);
  } catch(e){}
  location.reload();
};
$('settingsBtn').onclick = openSettings;
$('pauseSettings').onclick = openSettings;
$('settingsBack').onclick = () => { if (settingsFrom === 'pause') show('pauseOv'); else toMenu(); };
applyBombSide();

function renderDiff(){
  for (const b of $('diffSeg').querySelectorAll('button')) b.setAttribute('aria-checked', String(b.dataset.diff === diffSel));
  $('diffDesc').textContent = DIFF_DESC[diffSel];
}
$('diffSeg').addEventListener('click', e => {
  const b = e.target.closest('button[data-diff]');
  if (!b) return;
  diffSel = b.dataset.diff; save('asso-diff', diffSel); renderDiff();
  initAudio(); sfx.pick();
});
renderDiff();
$('playBtn').onclick = () => start('normal');
$('dailyBtn').onclick = () => start('daily');
$('rushBtn').onclick = () => start('rush');
$('seasonBtn').onclick = () => start('event');
$('landSkip').onclick = skipLanding;
$('zenBtn').onclick = () => start('zen');
$('partyBtn').onclick = openPartySetup;
$('campaignBtn').onclick = () => { initAudio(); state = 'campaign'; renderCampaign(); show('campaignOv'); };
$('campList').addEventListener('click', e => { const b = e.target.closest('.mis[data-mis]'); if (b && !b.disabled) openBrief(+b.dataset.mis); });
$('briefGo').onclick = () => start('campaign', briefIdx);
$('briefBack').onclick = () => { state = 'campaign'; renderCampaign(); show('campaignOv'); };
$('campaignBack').onclick = toMenu;
$('endlessBtn').onclick = () => start('endless');
$('againBtn').onclick = () => {
  if (S.campaign) start('campaign', S.won && S.mIdx + 1 < CAMPAIGN.length ? S.mIdx + 1 : S.mIdx);
  else start(S.mode || 'normal');
};
$('hangarPlay').onclick = () => start('normal');
$('hangarBtn').onclick = openHangar;
$('missionsBtn').onclick = openMissions;
$('boardBtn').onclick = openBoard;
$('howBtn').onclick = () => openTutorial(null);
$('missionsBack').onclick = toMenu;
$('profileBtn').onclick = () => { initAudio(); state = 'profile'; renderProfile(); show('profileOv'); };
$('profileBack').onclick = toMenu;
$('boardBack').onclick = toMenu;
$('overHangar').onclick = openHangar;
$('hangarBack').onclick = toMenu;
$('menuBtn').onclick = toMenu;
$('pauseBtn').onclick = togglePause;
$('resumeBtn').onclick = togglePause;
$('quitBtn').onclick = toMenu;
$('bombBtn').onclick = useBomb;
$('spBtn').onclick = useSpecial;
$('muteBtn').onclick = () => { muted = !muted; save('asso-muted', muted); renderMute(); };
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state === 'play') togglePause();
  if (ac){ if (document.hidden) ac.suspend(); else ac.resume(); }
});
// browsers only allow sound after a tap: the first one anywhere starts the menu music
document.addEventListener('pointerdown', () => initAudio(), { once: true });
document.addEventListener('keydown', () => initAudio(), { once: true });
addEventListener('resize', resize);


/* ---------- share score: a 1080×1350 card with the emblem, the score and your plane ---------- */
const WING_PATH = 'M84 58 C62 40 30 34 6 26 C20 42 34 48 46 52 C32 53 20 54 8 50 C22 61 40 64 54 64 C44 67 34 69 22 69 C40 78 62 76 82 68 Z';
let shareFile = null, shareText = '';
function shareSummary(){
  const won = S.campaign && S.won;
  let mode;
  if (S.campaign) mode = L('Missione ', 'Mission ') + (S.mIdx + 1) + ' · ' + S.mission.title + ' · ' + (won ? L('compiuta', 'complete') : L('fallita', 'failed'));
  else if (S.daily) mode = L('Sfida del giorno', 'Daily challenge') + ' · ' + todayRule().name;
  else if (S.endless) mode = T('Modalità infinita') + ' · ' + L('livello ', 'level ') + S.level + ' · ' + S.df.name;
  else mode = L('Ondata ', 'Wave ') + S.level + ' · ' + S.df.name;
  return mode;
}
function makeShareCanvas(){
  const CW = 1080, CH = 1350, c = document.createElement('canvas');
  c.width = CW; c.height = CH;
  const x = c.getContext('2d');
  const pal = PALETTES[sky.to].c;
  const bg = x.createLinearGradient(0, 0, 0, CH);
  bg.addColorStop(0, pal[0]); bg.addColorStop(0.55, pal[1]); bg.addColorStop(1, pal[2]);
  x.fillStyle = bg; x.fillRect(0, 0, CW, CH);
  if (PALETTES[sky.to].stars){
    x.fillStyle = 'rgba(255,244,224,.7)';
    for (const st of stars){ x.beginPath(); x.arc(st.x * CW, st.y * CH * 0.7, st.r * 2, 0, Math.PI * 2); x.fill(); }
  }
  x.globalAlpha = 0.35;
  for (const [cx, cy, sc] of [[150, 980, 2.2], [880, 760, 2.6], [520, 1240, 3]]) x.drawImage(cloudImg, cx - 120*sc, cy - 60*sc, 240*sc, 120*sc);
  x.globalAlpha = 1;
  // emblem
  x.save(); x.translate(CW/2 - 220*2.1/2, 70); x.scale(2.1, 2.1);
  const wing = new Path2D(WING_PATH);
  x.fillStyle = '#ffe36e'; x.fill(wing);
  x.save(); x.translate(220, 0); x.scale(-1, 1); x.fill(wing); x.restore();
  for (const [r, col] of [[32, '#ff5d73'], [25, '#1a1530'], [19, '#2bb3a6']]){ x.fillStyle = col; x.beginPath(); x.arc(110, 60, r, 0, Math.PI*2); x.fill(); }
  x.fillStyle = '#fff4e0'; x.font = '26px Bungee, Impact, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
  x.fillText('G', 110, 69);
  x.restore();
  const text = (str, y, font, color, shadow) => {
    x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle';
    if (shadow){ x.fillStyle = shadow; x.fillText(str, CW/2, y + 8); }
    x.fillStyle = color; x.fillText(str, CW/2, y);
  };
  text('ASSO DEI CIELI', 400, '96px Bungee, Impact, sans-serif', '#ffe36e', '#b85c7a');
  text('G E L U   I N C .', 478, '700 30px "Chakra Petch", sans-serif', 'rgba(255,244,224,.75)');
  text(T('Punti').toUpperCase(), 590, '700 34px "Chakra Petch", sans-serif', 'rgba(255,244,224,.7)');
  text(S.score.toLocaleString(NUM), 690, '150px Bungee, Impact, sans-serif', '#fff4e0', 'rgba(26,21,48,.45)');
  text(shareSummary(), 800, '700 36px "Chakra Petch", sans-serif', '#fff4e0');
  if (pilot.name){ drawEmblem(x, CW/2 - (pilot.name.length * 11 + 40), 535, 24); text(pilot.name, 535, '700 38px "Chakra Petch", sans-serif', '#ffe36e'); }
  // the plane
  const PL = plane();
  g = x;
  drawPlane(CW/2 + 40, 1010 + 60, 5.2 * PL.size, 1, shadowOf(PL));
  drawPlane(CW/2, 1000, 6 * PL.size, 1, colOf(PL));
  g = ctx;
  // stats strip
  x.fillStyle = 'rgba(26,21,48,.55)'; x.fillRect(80, 1150, CW - 160, 120);
  const cols = [[T('Abbattimenti'), S.kills], [S.campaign ? L('Missione', 'Mission') : T('Ondata'), S.campaign ? S.mIdx + 1 : S.level], [PL.name, '']];
  cols.forEach(([label, val], i) => {
    const cx = 80 + (CW - 160) * (i + 0.5) / 3;
    x.textAlign = 'center'; x.textBaseline = 'middle';
    if (val === ''){ x.fillStyle = '#ffe36e'; x.font = '40px Bungee, Impact, sans-serif'; x.fillText(label, cx, 1210); return; }
    x.fillStyle = 'rgba(255,244,224,.65)'; x.font = '700 26px "Chakra Petch", sans-serif'; x.fillText(String(label).toUpperCase(), cx, 1185);
    x.fillStyle = '#fff4e0'; x.font = '48px Bungee, Impact, sans-serif'; x.fillText(String(val), cx, 1235);
  });
  text(L('Riesci a battermi?', 'Can you beat me?'), 1315, '700 30px "Chakra Petch", sans-serif', 'rgba(255,244,224,.85)');
  return c;
}
function openShare(){
  const c = makeShareCanvas();
  const online = /github\.io$/.test(location.hostname) || /^https?:$/.test(location.protocol) && !/claude/.test(location.hostname);
  shareText = L(`Ho fatto ${S.score.toLocaleString(NUM)} punti ad Asso dei Cieli di Gelu inc.! ${shareSummary()}. Riesci a battermi?`,
                `I scored ${S.score.toLocaleString(NUM)} points in Asso dei Cieli by Gelu inc.! ${shareSummary()}. Can you beat me?`) + (online ? ' ' + location.href.split('#')[0] : '');
  $('shareImg').src = c.toDataURL('image/png');
  $('shareImg').alt = shareText;
  shareFile = null;
  c.toBlob(b => { if (b) shareFile = new File([b], 'asso-dei-cieli.png', { type: 'image/png' }); }, 'image/png');
  const canShare = !!(navigator.share && navigator.canShare);
  $('shareGo').hidden = !canShare;
  $('shareNote').textContent = L('Tieni premuto sull\'immagine per salvarla, oppure copia il testo.', 'Long-press the image to save it, or copy the text.');
  show('shareOv');
}
$('shareBtn').onclick = () => { initAudio(); openShare(); };
$('shareClose').onclick = () => show('overOv');
$('shareCopy').onclick = () => {
  const ok = () => { $('shareNote').textContent = L('Testo copiato.', 'Text copied.'); };
  const no = () => { $('shareNote').textContent = shareText; };
  try { navigator.clipboard.writeText(shareText).then(ok, no); } catch(e){ no(); }
};
$('shareGo').onclick = async () => {
  try {
    if (shareFile && navigator.canShare({ files: [shareFile] })) await navigator.share({ files: [shareFile], text: shareText, title: 'Asso dei Cieli' });
    else await navigator.share({ text: shareText, title: 'Asso dei Cieli' });
  } catch(e){
    if (e && e.name !== 'AbortError') $('shareNote').textContent = L('Qui la condivisione non è disponibile: tieni premuto sull\'immagine per salvarla.', 'Sharing isn\'t available here: long-press the image to save it.');
  }
};

/* ---------- English: translate the game data once at start ---------- */
function translateData(){
  if (LANG !== 'en') return;
  const tr = (o, keys) => { for (const key of keys) if (typeof o[key] === 'string') o[key] = T(o[key]); };
  UPG.forEach(u => tr(u, ['name', 'desc']));
  PLANES.forEach(pl => tr(pl, ['name', 'trait', 'desc']));
  Object.values(LIVERIES).forEach(list => list.forEach(l => tr(l, ['name'])));
  Object.values(DIFFS).forEach(d => tr(d, ['name']));
  for (const key in DIFF_DESC) DIFF_DESC[key] = T(DIFF_DESC[key]);
  CAMPAIGN.forEach(m => tr(m, ['title', 'story', 'goal', 'failMsg']));
  MEDALS.forEach(m => tr(m, ['name', 'desc']));
  for (const key in TYPE_NAMES) TYPE_NAMES[key] = T(TYPE_NAMES[key]);
  DAILY.forEach(d => tr(d, ['name', 'desc']));
  BOSSES.forEach(b => tr(b, ['name'])); tr(COLOSSO, ['name']);
  for (const key in BOSS_SUB) BOSS_SUB[key] = T(BOSS_SUB[key]);
  for (const key in WEATHER_SUB) WEATHER_SUB[key] = T(WEATHER_SUB[key]);
  for (const key in ABILITY) tr(ABILITY[key], ['name', 'desc']);
}
translateData();
document.documentElement.lang = LANG;
translateDOM($('app'));
resize(); makeClouds(); reset();
applySeason();
refreshMenuStats(); renderDiff(); renderMute();

// opening logo: about two seconds, a tap skips it
(() => {
  const sp = $('splash');
  let gone = false;
  const hide = () => { if (gone) return; gone = true; sp.classList.add('out'); setTimeout(() => sp.remove(), 550); };
  sp.addEventListener('pointerdown', e => { e.stopPropagation(); hide(); });
  setTimeout(hide, reduceMotion ? 900 : 2300);
  setTimeout(checkLogin, reduceMotion ? 950 : 2400);
})();
requestAnimationFrame(frame);

/* installable app: only active when served from a real site (e.g. GitHub Pages) */
/* install button: Chrome hands us the install prompt, we show our own button for it */
let deferredInstall = null;
const isInstalled = () => matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true;
addEventListener('beforeinstallprompt', e => {
  e.preventDefault(); deferredInstall = e;
  if (!isInstalled()) $('installBtn').hidden = false;
});
addEventListener('appinstalled', () => {
  deferredInstall = null; $('installBtn').hidden = true;
  toast('<span>' + L('App installata! La trovi sulla schermata Home', 'App installed! Find it on your home screen') + '</span>');
});
$('installBtn').onclick = () => {
  initAudio();
  if (!deferredInstall) return;
  try {
    deferredInstall.prompt();
    deferredInstall.userChoice.then(() => { deferredInstall = null; $('installBtn').hidden = true; }).catch(() => {});
  } catch(e){}
};
if ('serviceWorker' in navigator && document.querySelector('link[rel="manifest"]')){
  addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}
