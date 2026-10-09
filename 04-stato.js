/* Asso dei Cieli - Gelu inc. | stato della partita e HUD */

/* ---------- game state ---------- */
let state = 'menu';
let ST = stats();
function reset(mode = 'normal', mIdx = 0){
  const daily = mode === 'daily', endless = mode === 'endless', campaign = mode === 'campaign', rush = mode === 'rush', zen = mode === 'zen';
  const M = campaign ? CAMPAIGN[mIdx] : null;
  ST = stats();
  const rule = daily ? todayRule().id : null;
  const dkey = daily ? 'pilota' : diffSel, df = DIFFS[dkey];
  S = {
    t: 0, lt: 0, level: 1, phase: 'wave', phaseT: 0,
    score: 0, kills: 0, coins: 0, banked: false, spawn: 1.0, combo: 0, comboT: 0, bombs: ST.bombs,
    p: { x: W/2, y: H*0.8, r: 14*k*plane().r, hp: rule === 'unavita' ? 1 : ST.hp + df.hp0, inv: 1.2, fire: 0, lvl: ST.startLvl, bank: 0, shield: false, wing: 0, wfire: 0,
         wings: [{ x: W/2, y: H*0.85 }, { x: W/2, y: H*0.85 }] },
    b: [], eb: [], en: [], fx: [], pk: [], pop: [], boss: null, banner: null,
    shake: 0, dead: 0, flash: 0,
    mode, daily, endless, rule, party: mode === 'party', event: mode === 'event' ? SEASON : null, revived: false, comboDone: false, bossHit: false,
    scoreMul: ((rule === 'kamikaze' || rule === 'nudo') ? 3 : 1) * df.score,
    coinMul: (daily ? 2 : zen ? 0.5 : 1) * df.coins, zen, zenLeg: 0,
    df, dkey, sp: 0, ab: null,
    ghostRec: daily ? [] : null, gT: 0, ghost: daily ? loadGhost() : null,
    campaign, mission: M, mIdx, ktCount: 0, bossCalled: false, endT: 0, endWin: false, failWhy: '',
    escort: M && M.type === 'escort' ? { x: W/2, y: H*0.6, hp: 12, max: 12, flash: 0 } : null
  };
  sky.from = sky.to = 0; sky.mix = 1;
  setWeather(M && M.weather);
  biome.from = biome.to = (M && M.biome) || 'mare'; biome.mix = 1; islands = []; propT = 0.2;
  // seeded enemies: the same for everyone in today's challenge, and for every player in a party round
  const seed = daily ? hashStr('daily-' + todayKey()) : (mode === 'party' && party ? party.seed : null);
  srng = seed != null ? mulberry32(seed) : Math.random;
  if (rush){ S.rush = { list: ['barone', 'dirigibile', 'stormo', 'fantasma', 'colosso'], idx: 0, time: 0 }; S.level = 2; S.dkey = diffSel; setBanner('Boss Rush', L('Cinque boss di fila. Contro il tempo', 'Five bosses in a row. Against the clock'), 2.6); }
  else if (M){ S.level = M.level; sky.from = sky.to = M.sky; setBanner(M.title, M.goal, 3.2); }
  else if (daily){ const r = todayRule(); setBanner(r.name, r.desc, 3.2); }
  else if (S.event) setBanner(SEASON_INFO[S.event].name, 'Boss: ' + SEASON_INFO[S.event].boss.name, 3);
  else if (endless) setBanner('Modalità infinita', 'Nessun boss. Resisti più che puoi', 3);
  else if (zen) setBanner(L('Modalità Zen', 'Zen mode'), L('Niente vite, niente fretta', 'No lives, no rush'), 3);
  else setBanner('Ondata 1', 'Abbatti tutto ciò che vola');
  updateHUD(true);
}
const waveLen = () => S.rule === 'bossrush' ? 12 : WAVE_LEN;
function setBanner(txt, sub, life = 2.4){ S.banner = { txt: T(txt), sub: T(sub), life, max: life }; }
const mult = () => Math.min(5, 1 + Math.floor(S.combo / 5));

/* ---------- HUD ---------- */
const HEART = '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.2 0 3.6 1.3 5.2 3.1 1.6-1.8 3-3.1 5.2-3.1 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z"/></svg>';
let lastHud = {};
function objectiveText(){
  const M = S.mission, left = s => Math.max(0, Math.ceil(s));
  const mmss = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  switch (M.type){
    case 'survive': return L('Resisti ancora ', 'Survive ') + mmss(left(M.target - S.t));
    case 'escort': return L('Scorta ', 'Escort ') + mmss(left(M.target - S.t)) + ' · cargo ' + Math.max(0, S.escort.hp);
    case 'kills': return L('Abbattuti ', 'Kills ') + Math.min(S.kills, M.target) + '/' + M.target;
    case 'killType': return (M.kt === 'm' ? T('Mine') + ' ' : T('Navi') + ' ') + Math.min(S.ktCount, M.target) + '/' + M.target;
    default:
      if (M.timer) return L('Tempo ', 'Time ') + mmss(left(M.timer - S.t));
      return S.bossCalled ? L('Abbatti il boss', 'Shoot down the boss') : L('Il boss arriva tra ', 'Boss arrives in ') + left(M.bossAt - S.lt) + ' s';
  }
}
function updateHUD(force){
  if (force){ $('score').hidden = !!S.zen; $('hearts').hidden = !!S.zen; }
  if (force || lastHud.score !== S.score){ $('score').textContent = S.score; lastHud.score = S.score; }
  const ob = S.campaign ? objectiveText() : S.zen ? L('In volo da ', 'Flying for ') + Math.floor(S.t / 60) + ':' + String(Math.floor(S.t) % 60).padStart(2, '0') : S.rush ? 'Boss ' + Math.min(S.rush.idx + 1, 5) + '/5 · ' + fmtClock(S.rush.time) : '';
  if (force || lastHud.obj !== ob){ $('obj').textContent = ob; $('obj').hidden = !ob; lastHud.obj = ob; }
  if (force || lastHud.hp !== S.p.hp){
    const n = Math.max(3, S.p.hp);
    let h = '';
    for (let i = 0; i < n; i++) h += HEART.replace('<svg', `<svg class="${i < S.p.hp ? '' : 'off'}"`);
    $('hearts').innerHTML = h; lastHud.hp = S.p.hp;
  }
  const m = mult();
  if (force || lastHud.m !== m){ $('mult').hidden = m < 2; $('mult').textContent = 'x' + m; lastHud.m = m; }
  if (force || lastHud.level !== S.level){ $('wave').textContent = S.zen ? 'Zen' : S.rush ? 'Boss Rush' : S.campaign ? L('Missione ', 'Mission ') + (S.mIdx + 1) : S.endless ? L('Infinita · Livello ', 'Endless · Level ') + S.level : (S.daily ? T('Sfida') + ' · ' : '') + L('Ondata ', 'Wave ') + S.level; lastHud.level = S.level; }
  if (force || lastHud.coins !== S.coins){ $('coinsHud').innerHTML = coinHTML(S.coins); lastHud.coins = S.coins; }
  if (force || lastHud.bombs !== S.bombs){ $('bombN').textContent = S.bombs; $('bombBtn').disabled = S.bombs <= 0; lastHud.bombs = S.bombs; }
  const spv = S.ab ? 1 - S.ab.t / S.ab.dur : S.sp;
  if (force || Math.abs((lastHud.sp ?? -1) - spv) > 0.01 || lastHud.spr !== (S.sp >= 1)){
    $('spBtn').style.setProperty('--p', spv.toFixed(3));
    $('spBtn').classList.toggle('ready', S.sp >= 1 && !S.ab);
    $('spBtn').setAttribute('aria-label', T('Abilità speciale') + ': ' + ABILITY[plane().id].name + (S.sp >= 1 ? L(', pronta', ', ready') : ', ' + Math.round(S.sp * 100) + '%'));
    lastHud.sp = spv; lastHud.spr = S.sp >= 1;
  }
  if (force || lastHud.lvl !== S.p.lvl){
    $('pow').innerHTML = Array.from({ length: MAX_LVL }, (_, i) => `<i class="${i < S.p.lvl ? 'on' : ''}"></i>`).join('');
    $('pow').setAttribute('aria-label', T('Potenza') + ' ' + S.p.lvl + L(' di ', ' of ') + MAX_LVL);
    lastHud.lvl = S.p.lvl;
  }
}

