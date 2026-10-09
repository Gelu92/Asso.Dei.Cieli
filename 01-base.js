/* Asso dei Cieli - Gelu inc. | basi: salvataggi, lingua, difficoltà, missioni, classifica, campagna, medaglie, sfida del giorno, cielo, dimensioni */

const $ = id => document.getElementById(id);
const cv = $('c');
let ctx = cv.getContext('2d');   // swapped briefly when drawing previews (encyclopedia)
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist2 = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
const vib = ms => { if (!SET.vib) return; try { navigator.vibrate && navigator.vibrate(ms); } catch(e){} };
const COIN = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#ffe36e"/><circle cx="12" cy="12" r="6.5" fill="none" stroke="#c99a2e" stroke-width="2"/></svg>';
const coinHTML = n => COIN + '<span>' + n + '</span>';

const WAVE_LEN = 40;
const MAX_LVL = 5;      // weapon power levels

/* ---------- storage ---------- */
function load(key, def){ try { const v = localStorage.getItem(key); return v == null ? def : JSON.parse(v); } catch(e){ return def; } }
function save(key, v){ try { localStorage.setItem(key, JSON.stringify(v)); } catch(e){} }
const SET = Object.assign({ music: 70, sfx: 80, vib: true, bombLeft: false, season: 'auto' }, load('asso-settings', {}) || {});
/* ---------- language: Italian (source) and English ---------- */
const LANG = (() => {
  const saved = load('asso-lang', null);
  if (saved === 'it' || saved === 'en') return saved;
  const nav = (navigator.language || 'it').toLowerCase();
  return nav.startsWith('it') ? 'it' : 'en';
})();
const NUM = LANG === 'en' ? 'en-US' : 'it-IT';
const L = (it, en) => LANG === 'en' ? en : it;
const EN = {
  // menu, overlays, settings
  "Squadriglia del tramonto": "Sunset Squadron",
  "Trascina il dito per pilotare. Il fuoco è automatico.": "Drag your finger to fly. Firing is automatic.",
  "Recluta": "Rookie", "Pilota": "Pilot", "Asso": "Ace",
  "Record": "Best", "Monete": "Coins", "Decolla": "Take off", "Campagna": "Campaign", "Sfida": "Challenge",
  "Infinita": "Endless", "Senza boss": "No bosses", "Hangar": "Hangar", "Missioni": "Missions", "Classifica": "Scores",
  "Medaglie": "Medals", "Musica": "Music", "Come si gioca": "How to play", "Impostazioni": "Settings",
  "Missione 1": "Mission 1", "Obiettivo": "Objective", "Ricompensa": "Reward", "Indietro": "Back",
  "Completa le missioni per guadagnare monete. Quando ne finisci una, ne arriva subito un'altra.": "Complete missions to earn coins. As soon as you finish one, a new one arrives.",
  "Aerei": "Planes", "Livrea": "Paint job", "Potenziamenti": "Upgrades",
  "In pausa": "Paused", "Riprendi": "Resume", "Torna al menu": "Back to menu",
  "Missione finita": "Mission over", "Abbattuto!": "Shot down!", "Punti": "Score", "Nuovo record!": "New best!",
  "Ondata": "Wave", "Abbattimenti": "Kills", "Riprova": "Try again", "Menu": "Menu",
  "Profilo pilota": "Pilot profile", "Statistiche": "Stats", "Abbattimenti per tipo": "Kills by type",
  "Ogni medaglia vale 75 monete.": "Each medal is worth 75 coins.",
  "Effetti sonori": "Sound effects", "Vibrazione": "Vibration", "Effetti ridotti": "Reduced effects",
  "Per telefoni meno potenti. Si attiva da solo se il gioco rallenta.": "For less powerful phones. Turns on by itself if the game slows down.",
  "Pulsante bomba": "Bomb button", "A sinistra": "Left", "A destra": "Right", "Salvataggio": "Save data",
  "I progressi restano solo in questo browser. Per portarli su un altro telefono o sulla versione online, esporta il codice e importalo là.": "Progress is kept only in this browser. To move it to another phone or to the online version, export the code and import it there.",
  "Esporta progressi": "Export progress", "Importa progressi": "Import progress", "Il tuo codice": "Your code",
  "Copia codice": "Copy code", "Rivedi il tutorial": "Show the tutorial again", "Cancella tutti i progressi": "Delete all progress",
  "Tocca di nuovo per confermare: perderai monete, aerei, record e medaglie.": "Tap again to confirm: you will lose coins, planes, records and medals.",
  "Fatto": "Done", "Avanti": "Next", "Salta": "Skip", "1 di 3": "1 of 3", "presenta": "presents", "Lingua": "Language",
  "Condividi punteggio": "Share score", "Salta": "Skip", "Senza stress": "No stress", "Profilo": "Profile", "Enciclopedia": "Encyclopedia", "Nome da pilota": "Pilot name", "Stemma": "Emblem", "Arcobaleno": "Rainbow", "Eventi stagionali": "Seasonal events", "Natale": "Christmas", "No": "Off", "Auto": "Auto", "A turni": "Party", "2-4 amici": "2-4 friends", "Evento": "Event", "Spettro": "Wraith", "Colpi perforanti che attraversano i nemici": "Piercing shots that pass through enemies", "Abisso": "Abyss", "Aurora": "Aurora", "Oro": "Gold", "Zucca": "Pumpkin", "Neve": "Snow", "Eclissi": "Eclipse", "Il tempo rallenta per tutti tranne te": "Time slows for everyone but you", "Condividi": "Share", "Copia testo": "Copy text", "Chiudi": "Close",
  // aria labels
  "Abilità speciale": "Special ability", "Audio": "Sound", "Campo di gioco": "Game field", "Difficoltà": "Difficulty",
  "Gelu inc. presenta Asso dei Cieli": "Gelu inc. presents Asso dei Cieli", "Pausa": "Pause",
  "Posizione pulsante bomba": "Bomb button position", "Potenza": "Power", "Sgancia bomba": "Drop bomb",
  // upgrades
  "Cadenza di fuoco": "Fire rate", "Le mitragliatrici sparano più rapide": "Your guns fire faster",
  "Corazza": "Armour", "Una vita in più a inizio partita": "One extra life at the start",
  "Potenza iniziale": "Starting power", "Parti con un livello di potenza in più": "Start with one more power level",
  "Stiva bombe": "Bomb bay", "Una bomba in più, iniziale e massima": "One more bomb, at the start and at most",
  "Calamita": "Magnet", "Attiri i bonus da più lontano": "Pull power-ups in from further away",
  // planes
  "Falco": "Falcon", "Equilibrato": "Balanced", "Due mitragliatrici, 3 vite": "Two machine guns, 3 lives",
  "Rondine": "Swallow", "Veloce": "Fast", "Spara più rapido ed è più difficile da colpire, ma ha una vita in meno": "Fires faster and is harder to hit, but has one life less",
  "Toro": "Bull", "Corazzato": "Armoured", "Due vite in più e colpi doppi, ma spara più lento": "Two extra lives and double-damage shots, but fires slower",
  "Vespa": "Wasp", "Colpi laterali": "Side guns", "Quattro cannoni, due sparano in diagonale": "Four guns, two fire diagonally",
  "Fenice": "Phoenix", "Segreto": "Secret", "Tre cannoni e rinasce una volta per partita": "Three guns, and rises again once per game",
  // liveries
  "Originale": "Original", "Notte": "Night", "Corsa": "Racer", "Artico": "Arctic", "Ombra": "Shadow", "Deserto": "Desert",
  "Mimetica": "Camo", "Calabrone": "Hornet", "Ape regina": "Queen bee", "Brace": "Ember", "Fiamma blu": "Blue flame",
  // difficulty
  "Nemici più lenti e fragili, una vita in più. Punti x0,75": "Slower, weaker enemies and one extra life. Score x0.75",
  "La sfida normale": "The standard challenge",
  "Nemici più duri e veloci, meno bonus. Punti e monete x1,5": "Tougher, faster enemies and fewer power-ups. Score and coins x1.5",
  // campaign
  "Primo decollo": "First flight", "Resisti 45 secondi": "Survive for 45 seconds",
  "La squadriglia nemica è stata avvistata al largo. Sei appena uscito dall'accademia: resta in volo e fatti le ossa.": "The enemy squadron has been spotted offshore. You have just left the academy: stay in the air and learn the ropes.",
  "Cieli puliti": "Clear skies", "Abbatti 40 nemici": "Shoot down 40 enemies",
  "I caccia nemici disturbano le rotte dei pescatori. Il comando ti chiede di liberare il cielo.": "Enemy fighters are harassing the fishing routes. Command wants the sky cleared.",
  "Il Barone": "The Baron", "Sconfiggi il Barone Rosso": "Defeat the Red Baron",
  "Il Barone Rosso, l'asso nemico più temuto, guida l'attacco di oggi. È ora di affrontarlo.": "The Red Baron, the most feared enemy ace, leads today's attack. Time to face him.",
  "Scorta al convoglio": "Convoy escort", "Scorta il cargo per 50 secondi": "Escort the cargo plane for 50 seconds",
  "Un aereo cargo porta rifornimenti alla base. I nemici proveranno ad abbatterlo: restagli vicino e proteggilo.": "A cargo plane is carrying supplies to the base. The enemy will try to shoot it down: stay close and protect it.",
  "Campo minato": "Minefield", "Distruggi 15 mine": "Destroy 15 mines",
  "Il nemico ha riempito di mine volanti la rotta delle navi. Bonificala prima che passino.": "The enemy has filled the shipping lane with flying mines. Clear it before the ships pass.",
  "Caccia alla flotta": "Hunt the fleet", "Affonda 4 navi da guerra": "Sink 4 warships",
  "Una flotta di corazzate punta verso la costa. Affondane abbastanza da costringerla a ritirarsi.": "A fleet of battleships is heading for the coast. Sink enough of them to force a retreat.",
  "Il Dirigibile": "The Airship", "Sconfiggi il Dirigibile entro 90 secondi": "Defeat the Airship within 90 seconds",
  "Il Dirigibile nemico sta per raggiungere il porto con il suo carico di bombe. Hai poco tempo.": "The enemy Airship is about to reach the harbour with its load of bombs. You don't have long.",
  "L'ultimo volo": "The last flight", "Sconfiggi l'Ala Fantasma": "Defeat the Phantom Wing",
  "Di notte l'Ala Fantasma guida l'ultimo attacco alla costa. Se cade lei, la costa è salva.": "At night the Phantom Wing leads the final attack on the coast. If it falls, the coast is safe.",
  "Tempesta": "Storm", "Resisti 60 secondi sotto la pioggia": "Survive 60 seconds in the rain",
  "Il nemico ha ricostruito la flotta aerea e attacca nel mezzo di un temporale. Tieni la posizione.": "The enemy has rebuilt its air force and attacks in the middle of a thunderstorm. Hold your position.",
  "Assi nella nebbia": "Aces in the fog", "Abbatti 60 nemici nella nebbia": "Shoot down 60 enemies in the fog",
  "I loro assi si nascondono nella nebbia e colpiscono all'improvviso. Stanali uno per uno.": "Their aces hide in the fog and strike without warning. Flush them out one by one.",
  "La rivincita del Barone": "The Baron's revenge", "Sconfiggi di nuovo il Barone Rosso": "Defeat the Red Baron again",
  "Il Barone Rosso è sopravvissuto, e vuole la rivincita. Questa volta è più forte.": "The Red Baron survived, and he wants revenge. This time he is stronger.",
  "Ponte aereo": "Airlift", "Scorta il cargo per 70 secondi": "Escort the cargo plane for 70 seconds",
  "La città è isolata dalla tempesta. Un cargo di medicinali deve passare a ogni costo.": "The storm has cut the city off. A cargo plane full of medicine must get through at any cost.",
  "Notte di mine": "Night of mines", "Distruggi 25 mine": "Destroy 25 mines",
  "Nella notte e nella nebbia il nemico ha riempito il cielo di mine. Trovale prima che trovino te.": "In the dark and the fog the enemy has filled the sky with mines. Find them before they find you.",
  "La grande flotta": "The grand fleet", "Affonda 7 navi da guerra": "Sink 7 warships",
  "La flotta nemica al completo sfida la tempesta per sbarcare sulla costa. Fermala.": "The entire enemy fleet braves the storm to land on the coast. Stop it.",
  "Inseguimento": "The chase", "Sconfiggi lo Stormo Nero entro 100 secondi": "Defeat the Black Flight within 100 seconds",
  "Lo Stormo Nero ha rubato i piani della base e scappa verso casa. Raggiungilo prima che sia troppo tardi.": "The Black Flight has stolen the base's plans and is racing home. Catch it before it's too late.",
  "Lo Stormo Nero è fuggito": "The Black Flight got away",
  "Il Colosso": "The Colossus", "Sconfiggi il Colosso": "Defeat the Colossus",
  "Dalla nebbia emerge il Colosso, la fortezza volante del nemico. È la sua ultima carta: abbattilo e la guerra è finita.": "Out of the fog comes the Colossus, the enemy's flying fortress. It is their last card: bring it down and the war is over.",
  "Capitolo 1 · La costa": "Chapter 1 · The coast", "Capitolo 2 · La tempesta": "Chapter 2 · The storm",
  "Il Dirigibile ha raggiunto il porto": "The Airship reached the harbour", "Il cargo è stato abbattuto": "The cargo plane was shot down",
  "Sei stato abbattuto": "You were shot down", "Missione compiuta!": "Mission complete!", "Missione fallita": "Mission failed",
  // medals
  "Primo volo": "First flight", "Gioca la prima partita": "Play your first game",
  "Cento": "Hundred", "Abbatti 100 nemici in totale": "Shoot down 100 enemies in total",
  "Mille": "Thousand", "Abbatti 1.000 nemici in totale": "Shoot down 1,000 enemies in total",
  "Cacciatore": "Hunter", "Sconfiggi il primo boss": "Defeat your first boss",
  "Collezionista": "Collector", "Sconfiggi tutti e quattro i boss diversi": "Defeat all four different bosses",
  "Veterano": "Veteran", "Raggiungi l'ondata 5": "Reach wave 5", "Leggenda": "Legend", "Raggiungi l'ondata 10": "Reach wave 10",
  "Vero asso": "True ace", "Raggiungi l'ondata 3 in difficoltà Asso": "Reach wave 3 on Ace difficulty",
  "Arsenale": "Arsenal", "Arriva alla potenza 5": "Reach power level 5",
  "Inarrestabile": "Unstoppable", "Raggiungi il moltiplicatore x5": "Reach the x5 multiplier",
  "Intoccabile": "Untouchable", "Sconfiggi un boss senza farti colpire": "Defeat a boss without getting hit",
  "Dalle ceneri": "From the ashes", "Sblocca la Fenice": "Unlock the Phoenix",
  "Tesoriere": "Treasurer", "Guadagna 5.000 monete in totale": "Earn 5,000 coins in total",
  "Ogni giorno": "Every day", "Gioca una sfida del giorno": "Play a daily challenge",
  "La costa è salva": "The coast is safe", "Completa il capitolo 1 della campagna": "Complete chapter 1 of the campaign",
  "Fine della guerra": "End of the war", "Completa tutta la campagna": "Complete the whole campaign",
  "Senza fine": "Never ending", "Resisti 3 minuti in modalità infinita": "Survive 3 minutes in endless mode",
  // stats
  "Partite": "Games", "Tempo di volo": "Flight time", "Nemici abbattuti": "Enemies shot down", "Boss sconfitti": "Bosses defeated",
  "Ondata più alta": "Highest wave", "Infinita, tempo record": "Endless, best time", "Monete guadagnate": "Coins earned",
  "Sfide del giorno": "Daily challenges",
  "Caccia": "Fighters", "Zig-zag": "Zig-zag", "Bombardieri": "Bombers", "Kamikaze": "Kamikaze", "Elicotteri": "Helicopters",
  "Mine": "Mines", "Navi": "Ships",
  // daily challenge
  "Pioggia di kamikaze": "Kamikaze rain", "Arrivano solo kamikaze, ma i punti valgono il triplo": "Only kamikaze, but points are tripled",
  "Corsa ai boss": "Boss rush", "Ogni ondata dura solo 12 secondi": "Each wave lasts only 12 seconds",
  "Una vita sola": "One life", "Hai una sola vita. Il cuore diventa uno scudo": "You have a single life. Hearts become shields",
  "Turbo": "Turbo", "Tutto va più veloce del 30%": "Everything is 30% faster",
  "Mine volanti fin dalla prima ondata": "Flying mines from the very first wave",
  "Senza bonus": "No power-ups", "Niente bonus, ma i punti valgono il triplo": "No power-ups, but points are tripled",
  // bosses
  "Barone Rosso": "Red Baron", "Stormo Nero": "Black Flight", "Ala Fantasma": "Phantom Wing",
  "Il caccia pesante nemico": "The enemy's heavy fighter", "Lento, enorme e pieno di cannoni": "Slow, huge and bristling with guns",
  "Tre assi in formazione": "Three aces in formation", "Sparisce e ricompare": "It vanishes and reappears",
  "La fortezza volante del nemico": "The enemy's flying fortress",
  // abilities
  "Raffica": "Barrage", "Spari tripli e potenziati per qualche secondo": "Triple, boosted fire for a few seconds",
  "Scatto": "Dash", "Invulnerabile, travolgi chi tocchi": "Invulnerable, smash through anything you touch",
  "Muraglia": "Bulwark", "Una cupola che ferma i proiettili": "A dome that stops bullets",
  "Sciame": "Swarm", "Tre anelli di colpi in tutte le direzioni": "Three rings of shots in every direction",
  "Ondata di fuoco": "Firestorm", "Un anello di fuoco brucia tutto lo schermo": "A ring of fire sweeps the whole screen",
  // weather & banners & pops
  "Arriva un temporale": "A thunderstorm is coming", "Nebbia fitta: i nemici sbucano all'ultimo": "Thick fog: enemies appear at the last moment",
  "Modalità infinita": "Endless mode", "Nessun boss. Resisti più che puoi": "No bosses. Survive as long as you can",
  "Ondata 1": "Wave 1", "Abbatti tutto ciò che vola": "Shoot down anything that flies",
  "Boss in arrivo": "Boss incoming", "Furia!": "Fury!", "La Fenice rinasce": "The Phoenix rises",
  "Hai un'ultima possibilità": "You have one last chance", "Più nemici, più veloci": "More enemies, and faster",
  "Elicotteri e navi da guerra": "Helicopters and warships", "Cala la notte. Attento alle mine": "Night falls. Watch out for mines",
  "I nemici sono più veloci": "The enemies are faster",
  "I gregari rientrano": "Wingmen heading home", "Scudo!": "Shield!", "+1 vita": "+1 life", "+1 bomba": "+1 bomb",
  "Arrivano i gregari!": "Wingmen inbound!", "Potenza massima!": "Max power!", "CARGO": "CARGO",
  // tutorial
  "Pilota col dito": "Fly with your finger",
  "Appoggia il dito in un punto qualsiasi dello schermo e trascinalo: l'aereo segue il movimento. Spara da solo.": "Put your finger anywhere on the screen and drag: the plane follows. It fires by itself.",
  "Bonus": "Power-ups",
  "Potenza: un cannone in più, fino al livello 5": "Power: one more gun, up to level 5",
  "Due gregari volano e sparano con te": "Two wingmen fly and shoot with you",
  "Scudo che assorbe un colpo": "Shield that absorbs one hit", "Una bomba in più": "One more bomb", "Una vita in più": "One more life",
  "Se vieni colpito perdi un livello di potenza e i gregari. Abbattere nemici di fila fa salire il moltiplicatore fino a x5.": "If you get hit you lose a power level and your wingmen. Shooting enemies down in a row raises the multiplier up to x5.",
  "Bomba e boss": "Bomb and bosses",
  "Il pulsante rosso in basso cancella i proiettili nemici. Quello col fulmine si carica abbattendo nemici e lancia l'abilità speciale del tuo aereo. Alla fine di ogni ondata arriva un boss: sconfiggilo e raccogli il pezzo raro che lascia cadere.": "The red button at the bottom wipes out enemy bullets. The lightning one charges as you shoot enemies down and fires your plane's special ability. At the end of every wave a boss arrives: defeat it and grab the rare piece it drops."
};
const T = s => (LANG === 'en' && typeof s === 'string' && EN[s] !== undefined) ? EN[s] : s;
// translate every plain text node and label inside an element (used for the static page and the tutorial)
function translateDOM(root){
  if (LANG !== 'en' || !root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes){
    const t = n.nodeValue.trim();
    if (t && EN[t] !== undefined) n.nodeValue = n.nodeValue.replace(t, EN[t]);
  }
  for (const el of root.querySelectorAll('[aria-label]')){
    const a = el.getAttribute('aria-label');
    if (EN[a] !== undefined) el.setAttribute('aria-label', EN[a]);
  }
}

let best = +load('asso-best', 0) || 0;
let wallet = +load('asso-coins', 0) || 0;
const UPG = [
  { id:'fire',   name:'Cadenza di fuoco', desc:'Le mitragliatrici sparano più rapide', cost:[30,60,110,180,280] },
  { id:'armor',  name:'Corazza',          desc:'Una vita in più a inizio partita',      cost:[80,200] },
  { id:'power',  name:'Potenza iniziale', desc:'Parti con un livello di potenza in più',  cost:[90,220] },
  { id:'bomb',   name:'Stiva bombe',      desc:'Una bomba in più, iniziale e massima',  cost:[60,150] },
  { id:'magnet', name:'Calamita',         desc:'Attiri i bonus da più lontano',         cost:[30,70,130] }
];
let up = Object.assign({ fire:0, armor:0, power:0, bomb:0, magnet:0 }, load('asso-up', {}));
const PLANES = [
  { id:'falco', name:'Falco', trait:'Equilibrato', desc:'Due mitragliatrici, 3 vite', cost:0,
    hp:0, fire:0.15, dmg:1, r:1, speed:1, size:0.95, spread:false,
    col:{ body:'#fff4e0', accent:'#2bb3a6', glass:'#24305e', shade:'#e3cfb3' } },
  { id:'rondine', name:'Rondine', trait:'Veloce', desc:'Spara più rapido ed è più difficile da colpire, ma ha una vita in meno', cost:300,
    hp:-1, fire:0.11, dmg:1, r:0.72, speed:1.4, size:0.85, spread:false,
    col:{ body:'#bfe6ff', accent:'#ff5d73', glass:'#24305e', shade:'#8fc4e8', shape:'swept' } },
  { id:'toro', name:'Toro', trait:'Corazzato', desc:'Due vite in più e colpi doppi, ma spara più lento', cost:500,
    hp:2, fire:0.2, dmg:2, r:1.15, speed:0.85, size:1.05, spread:false,
    col:{ body:'#c9b27a', accent:'#5b1f33', glass:'#24305e', shade:'#a8925e', shape:'heavy', engines:true } },
  { id:'vespa', name:'Vespa', trait:'Colpi laterali', desc:'Quattro cannoni, due sparano in diagonale', cost:800,
    hp:0, fire:0.17, dmg:1, r:1, speed:1, size:0.95, spread:true,
    col:{ body:'#ffd23f', accent:'#1a1530', glass:'#1a1530', shade:'#e0b020', shape:'stripes' } },
  { id:'fenice', name:'Fenice', trait:'Segreto', desc:'Tre cannoni e rinasce una volta per partita', cost:0, secret:true,
    hp:0, fire:0.13, dmg:1, r:0.95, speed:1.1, size:1, spread:false, triple:true, revive:true,
    col:{ body:'#ff7a3d', accent:'#ffe36e', glass:'#5b1f33', shade:'#d9542a', shape:'swept' } },
  { id:'spettro', name:'Spettro', trait:'Segreto', desc:'Colpi perforanti che attraversano i nemici', cost:0, secret:'silver',
    hp:0, fire:0.14, dmg:1, r:0.9, speed:1.15, size:0.95, spread:false, pierce:true,
    col:{ body:'#c9d6ff', accent:'#7b5cff', glass:'#1a1530', shade:'#9aa8d8', shape:'swept' } }
];
const SILVER_NEEDED = 5;
let silver = +load('asso-silver', 0) || 0;
/* liveries: two extra paint schemes per plane */
const LIVERIES = {
  falco:   [{ name:'Notte', body:'#3b4a7a', accent:'#ffe36e', shade:'#2c3860', glass:'#9fd8ff' },
            { name:'Corsa', body:'#ff5d73', accent:'#fff4e0', shade:'#d94860', glass:'#1a1530' }],
  rondine: [{ name:'Artico', body:'#ffffff', accent:'#2bb3a6', shade:'#d8e6ee' },
            { name:'Ombra', body:'#2e2a3e', accent:'#ff9a4d', shade:'#1e1b2a', glass:'#ff9a4d' }],
  toro:    [{ name:'Deserto', body:'#e0c48a', accent:'#2e7d5b', shade:'#c2a46c' },
            { name:'Mimetica', body:'#5e6b4a', accent:'#ffe36e', shade:'#4a553a' }],
  vespa:   [{ name:'Calabrone', body:'#ff9a4d', accent:'#1a1530', shade:'#e07a30' },
            { name:'Ape regina', body:'#fff4e0', accent:'#a46be0', shade:'#e3cfb3', glass:'#a46be0' }],
  fenice:  [{ name:'Brace', body:'#b8304a', accent:'#ffe36e', shade:'#8e2236' },
            { name:'Fiamma blu', body:'#4f7cff', accent:'#9fd8ff', shade:'#3a5fd0', glass:'#fff4e0' }],
  spettro: [{ name:'Abisso', body:'#2e2a3e', accent:'#9fd8ff', shade:'#1e1b2a', glass:'#9fd8ff' },
            { name:'Aurora', body:'#2bb3a6', accent:'#ffe36e', shade:'#1d7d74', glass:'#1a1530' }]
};
// exclusive paint jobs: they can't be bought, only won (box) or gifted (seasonal events)
const EXCLUSIVE = [
  { key:'gold', name:'Oro', exclusive:'box', body:'#ffd76a', accent:'#7a4a10', shade:'#e0b040', glass:'#3a2a10' },
  { key:'zucca', name:'Zucca', exclusive:'halloween', body:'#ff8a1f', accent:'#1a1530', shade:'#d96a10', glass:'#5bff6a' },
  { key:'neve', name:'Neve', exclusive:'xmas', body:'#ffffff', accent:'#e0303a', shade:'#dde6f0', glass:'#2b8a4a' },
  { key:'rainbow', name:'Arcobaleno', exclusive:'secret', body:'#ff5d73', accent:'#ffffff', shade:'#d94860', glass:'#1a1530', rainbow:true }
];
for (const id in LIVERIES) LIVERIES[id].push(...EXCLUSIVE.map(x => ({ ...x })));
const LIVERY_COST = 150;
let liveryOwned = load('asso-liveries', []);
if (!Array.isArray(liveryOwned)) liveryOwned = [];
let liverySel = load('asso-livery', {});
if (!liverySel || typeof liverySel !== 'object') liverySel = {};
function colOf(P){
  const i = liverySel[P.id] || 0, L = i && LIVERIES[P.id] && LIVERIES[P.id][i - 1];
  if (!L) return P.col;
  const { name, ...colors } = L;
  if (L.rainbow){
    const h = (performance.now() / 12) % 360;
    colors.body = `hsl(${h},85%,68%)`; colors.shade = `hsl(${h},70%,55%)`; colors.accent = `hsl(${(h + 180) % 360},90%,60%)`;
  }
  return Object.assign({}, P.col, colors);
}
const PIECES_NEEDED = 5;
let pieces = +load('asso-pieces', 0) || 0;
let owned = load('asso-planes', ['falco']);
if (!Array.isArray(owned) || !owned.includes('falco')) owned = ['falco'];
let selPlane = load('asso-sel', 'falco');
if (!owned.includes(selPlane)) selPlane = 'falco';
const plane = () => PLANES.find(p => p.id === selPlane) || PLANES[0];

/* ---------- difficulty ---------- */
const DIFFS = {
  recluta: { name:'Recluta', hp:0.75, spawn:1.25, bullet:0.85, fire:0.75, drop:1.4, inv:1.7, hp0:1, score:0.75, coins:1 },
  pilota:  { name:'Pilota',  hp:1,    spawn:1,    bullet:1,    fire:1,    drop:1,   inv:1.3, hp0:0, score:1,    coins:1 },
  asso:    { name:'Asso',    hp:1.3,  spawn:0.82, bullet:1.12, fire:1.25, drop:0.7, inv:1.1, hp0:0, score:1.5,  coins:1.5 }
};
const DIFF_DESC = {
  recluta: 'Nemici più lenti e fragili, una vita in più. Punti x0,75',
  pilota: 'La sfida normale',
  asso: 'Nemici più duri e veloci, meno bonus. Punti e monete x1,5'
};
let diffSel = load('asso-diff', 'pilota');
if (!DIFFS[diffSel]) diffSel = 'pilota';

/* ---------- toast ---------- */
const toastQ = [];
let toastBusy = false;
function toast(html){
  toastQ.push(html);
  if (!toastBusy) nextToast();
}
function nextToast(){
  const el = $('toast'), html = toastQ.shift();
  if (!html){ toastBusy = false; el.classList.add('hide'); return; }
  toastBusy = true;
  el.innerHTML = html; el.classList.remove('hide');
  setTimeout(() => { el.classList.add('hide'); setTimeout(nextToast, 300); }, 2300);
}

/* ---------- missions ---------- */
const MISSIONS = [
  { id:'k_f',   ev:'kill_f',  n:[40,80,150],  txt:n => L(`Abbatti ${n} caccia`, `Shoot down ${n} fighters`) },
  { id:'k_w',   ev:'kill_w',  n:[20,40,80],   txt:n => L(`Abbatti ${n} caccia a zig-zag`, `Shoot down ${n} zig-zag fighters`) },
  { id:'k_k',   ev:'kill_k',  n:[10,25,50],   txt:n => L(`Abbatti ${n} kamikaze`, `Shoot down ${n} kamikaze`) },
  { id:'k_h',   ev:'kill_h',  n:[5,12,25],    txt:n => L(`Abbatti ${n} elicotteri`, `Shoot down ${n} helicopters`) },
  { id:'k_m',   ev:'kill_m',  n:[8,20,40],    txt:n => L(`Distruggi ${n} mine prima che esplodano`, `Destroy ${n} mines before they explode`) },
  { id:'k_b',   ev:'kill_b',  n:[5,12,25],    txt:n => L(`Abbatti ${n} bombardieri`, `Shoot down ${n} bombers`) },
  { id:'k_n',   ev:'kill_n',  n:[2,6,15],     txt:n => L(`Affonda ${n} navi da guerra`, `Sink ${n} warships`) },
  { id:'boss',  ev:'boss',    n:[1,3,6],      txt:n => n === 1 ? L('Sconfiggi un boss', 'Defeat a boss') : L(`Sconfiggi ${n} boss`, `Defeat ${n} bosses`) },
  { id:'nohit', ev:'nohit',   n:[1,2,3],      txt:n => n === 1 ? L('Sconfiggi un boss senza farti colpire', 'Defeat a boss without getting hit') : L(`Sconfiggi ${n} boss senza farti colpire`, `Defeat ${n} bosses without getting hit`) },
  { id:'wave',  ev:'wave',    n:[2,3,5],      txt:n => L(`Raggiungi l'ondata ${n}`, `Reach wave ${n}`), best:true },
  { id:'score', ev:'score',   n:[10000,30000,70000], txt:n => L(`Fai ${n.toLocaleString(NUM)} punti in una partita`, `Score ${n.toLocaleString(NUM)} points in one game`), best:true },
  { id:'combo', ev:'combo5',  n:[1,3,6],      txt:n => n === 1 ? L('Raggiungi il moltiplicatore x5', 'Reach the x5 multiplier') : L(`Raggiungi il moltiplicatore x5 in ${n} partite`, `Reach the x5 multiplier in ${n} games`) },
  { id:'pick',  ev:'pick',    n:[10,25,50],   txt:n => L(`Raccogli ${n} bonus`, `Collect ${n} power-ups`) },
  { id:'bomb',  ev:'bomb',    n:[5,12,25],    txt:n => `Usa ${n} bombe` }
];
const MISSION_REWARD = [50, 100, 180];
let mstate = load('asso-missions', null);
function newMission(exclude){
  const free = MISSIONS.filter(m => !exclude.includes(m.id));
  const m = free[Math.floor(Math.random() * free.length)];
  return { id: m.id, prog: 0 };
}
function missionInfo(a){
  const def = MISSIONS.find(m => m.id === a.id);
  const tier = Math.min(def.n.length - 1, mstate.tiers[a.id] || 0);
  return { def, tier, n: def.n[tier], reward: MISSION_REWARD[tier] };
}
if (!mstate || !Array.isArray(mstate.active) || mstate.active.some(a => !MISSIONS.find(m => m.id === a.id))){
  mstate = { active: [], tiers: {}, done: 0 };
}
while (mstate.active.length < 3) mstate.active.push(newMission(mstate.active.map(a => a.id)));
save('asso-missions', mstate);

function mEvent(ev, amount = 1){
  let changed = false;
  for (let i = 0; i < mstate.active.length; i++){
    const a = mstate.active[i], info = missionInfo(a);
    if (info.def.ev !== ev) continue;
    a.prog = info.def.best ? Math.max(a.prog, amount) : a.prog + amount;
    changed = true;
    if (a.prog >= info.n){
      wallet += info.reward; save('asso-coins', wallet);
      mstate.tiers[a.id] = (mstate.tiers[a.id] || 0) + 1;
      mstate.done++;
      mstate.active[i] = newMission(mstate.active.map(x => x.id));
      toast(`<span>${L('Missione completata', 'Mission complete')}: ${info.def.txt(info.n)}</span><span class="coins">${coinHTML('+' + info.reward)}</span>`);
      sfx.buy(); vib([30, 30, 30]);
      refreshMenuStats();
    }
  }
  if (changed) save('asso-missions', mstate);
}
function renderMissions(){
  $('missionsCoins').innerHTML = coinHTML(wallet);
  $('missionList').innerHTML = mstate.active.map(a => {
    const { def, n, reward } = missionInfo(a), pr = Math.min(a.prog, n);
    const shown = def.ev === 'score' ? `${pr.toLocaleString(NUM)} / ${n.toLocaleString(NUM)}` : `${pr} / ${n}`;
    return `<div class="mission"><h3>${def.txt(n)}</h3><span class="coins">${coinHTML(reward)}</span>
      <div class="bar"><span><i style="width:${pr / n * 100}%"></i></span><small>${shown}</small></div></div>`;
  }).join('');
  $('missionsDone').textContent = mstate.done ? L(`Missioni completate finora: ${mstate.done}`, `Missions completed so far: ${mstate.done}`) : '';
}

/* ---------- leaderboard ---------- */
let board = load('asso-board', []);
if (!Array.isArray(board)) board = [];
function addToBoard(entry){
  board.push(entry);
  board.sort((a, b) => b.score - a.score);
  board = board.slice(0, 10);
  save('asso-board', board);
  return board.indexOf(entry);
}
function renderBoard(highlight = -1){
  if (!board.length){
    $('boardWrap').innerHTML = '<p class="empty">' + L('Ancora nessuna partita. Decolla e torna qui!', 'No games yet. Take off and come back here!') + '</p>';
    return;
  }
  $('boardWrap').innerHTML = `<table class="board"><thead><tr><th>#</th><th class="num">${L('Punti', 'Score')}</th><th>${L('Aereo', 'Plane')}</th><th class="num">${L('Ond.', 'Wave')}</th><th class="num">${L('Data', 'Date')}</th></tr></thead><tbody>` +
    board.map((e, i) => `<tr class="${i === highlight ? 'me' : ''}"><td>${i + 1}</td><td class="num">${e.score.toLocaleString(NUM)}</td><td>${T(e.plane)}${e.daily ? ` <span class="tag">${T('Sfida')}</span>` : ''}${e.endless ? ` <span class="tag">${T('Infinita')}</span>` : ''}${e.diff && e.diff !== 'pilota' ? ` <span class="tag ${e.diff}">${DIFFS[e.diff].name}</span>` : ''}</td><td class="num">${e.wave}</td><td class="num">${e.date}</td></tr>`).join('') +
    '</tbody></table>';
}

/* ---------- campaign ---------- */
const CAMPAIGN = [
  { biome:'mare', title:'Primo decollo', type:'survive', target:45, level:1, sky:0, reward:100,
    story:'La squadriglia nemica è stata avvistata al largo. Sei appena uscito dall\'accademia: resta in volo e fatti le ossa.',
    goal:'Resisti 45 secondi' },
  { biome:'mare', title:'Cieli puliti', type:'kills', target:40, level:1, sky:0, reward:120,
    story:'I caccia nemici disturbano le rotte dei pescatori. Il comando ti chiede di liberare il cielo.',
    goal:'Abbatti 40 nemici' },
  { biome:'deserto', title:'Il Barone', type:'boss', boss:'barone', bossAt:25, level:1, sky:1, reward:150,
    story:'Il Barone Rosso, l\'asso nemico più temuto, guida l\'attacco di oggi. È ora di affrontarlo.',
    goal:'Sconfiggi il Barone Rosso' },
  { biome:'mare', title:'Scorta al convoglio', type:'escort', target:50, level:2, sky:1, reward:180, pool:[['f',4],['k',3],['w',2]],
    story:'Un aereo cargo porta rifornimenti alla base. I nemici proveranno ad abbatterlo: restagli vicino e proteggilo.',
    goal:'Scorta il cargo per 50 secondi' },
  { biome:'ghiaccio', title:'Campo minato', type:'killType', kt:'m', target:15, level:2, sky:1, reward:180, pool:[['m',4],['f',2],['w',1]],
    story:'Il nemico ha riempito di mine volanti la rotta delle navi. Bonificala prima che passino.',
    goal:'Distruggi 15 mine' },
  { biome:'mare', title:'Caccia alla flotta', type:'killType', kt:'n', target:4, level:3, sky:2, reward:220, pool:[['n',3],['f',3],['h',1.5]],
    story:'Una flotta di corazzate punta verso la costa. Affondane abbastanza da costringerla a ritirarsi.',
    goal:'Affonda 4 navi da guerra' },
  { biome:'citta', title:'Il Dirigibile', type:'boss', boss:'dirigibile', bossAt:10, timer:90, level:3, sky:2, reward:260,
    story:'Il Dirigibile nemico sta per raggiungere il porto con il suo carico di bombe. Hai poco tempo.',
    goal:'Sconfiggi il Dirigibile entro 90 secondi' },
  { biome:'vulcano', title:'L\'ultimo volo', type:'boss', boss:'fantasma', bossAt:30, level:4, sky:3, reward:400,
    story:'Di notte l\'Ala Fantasma guida l\'ultimo attacco alla costa. Se cade lei, la costa è salva.',
    goal:'Sconfiggi l\'Ala Fantasma' },
  /* chapter 2: the storm */
  { biome:'mare', title:'Tempesta', type:'survive', target:60, level:4, sky:3, weather:'rain', reward:300,
    story:'Il nemico ha ricostruito la flotta aerea e attacca nel mezzo di un temporale. Tieni la posizione.',
    goal:'Resisti 60 secondi sotto la pioggia' },
  { biome:'ghiaccio', title:'Assi nella nebbia', type:'kills', target:60, level:4, sky:2, weather:'fog', reward:300,
    story:'I loro assi si nascondono nella nebbia e colpiscono all\'improvviso. Stanali uno per uno.',
    goal:'Abbatti 60 nemici nella nebbia' },
  { biome:'deserto', title:'La rivincita del Barone', type:'boss', boss:'barone', bossAt:20, level:5, sky:1, weather:'rain', reward:340,
    story:'Il Barone Rosso è sopravvissuto, e vuole la rivincita. Questa volta è più forte.',
    goal:'Sconfiggi di nuovo il Barone Rosso' },
  { biome:'citta', title:'Ponte aereo', type:'escort', target:70, level:5, sky:2, weather:'rain', reward:360, pool:[['f',3],['k',3],['h',1.5],['w',2]],
    story:'La città è isolata dalla tempesta. Un cargo di medicinali deve passare a ogni costo.',
    goal:'Scorta il cargo per 70 secondi' },
  { biome:'vulcano', title:'Notte di mine', type:'killType', kt:'m', target:25, level:5, sky:3, weather:'fog', reward:360, pool:[['m',4],['k',1.5],['f',2]],
    story:'Nella notte e nella nebbia il nemico ha riempito il cielo di mine. Trovale prima che trovino te.',
    goal:'Distruggi 25 mine' },
  { biome:'mare', title:'La grande flotta', type:'killType', kt:'n', target:7, level:6, sky:2, weather:'rain', reward:400, pool:[['n',3],['f',2],['h',2],['b',1]],
    story:'La flotta nemica al completo sfida la tempesta per sbarcare sulla costa. Fermala.',
    goal:'Affonda 7 navi da guerra' },
  { biome:'deserto', title:'Inseguimento', type:'boss', boss:'stormo', bossAt:15, timer:100, failMsg:'Lo Stormo Nero è fuggito', level:6, sky:3, reward:420,
    story:'Lo Stormo Nero ha rubato i piani della base e scappa verso casa. Raggiungilo prima che sia troppo tardi.',
    goal:'Sconfiggi lo Stormo Nero entro 100 secondi' },
  { biome:'vulcano', title:'Il Colosso', type:'boss', boss:'colosso', bossAt:30, level:6, sky:3, weather:'fog', reward:600,
    story:'Dalla nebbia emerge il Colosso, la fortezza volante del nemico. È la sua ultima carta: abbattilo e la guerra è finita.',
    goal:'Sconfiggi il Colosso' }
];
const CHAPTER_LEN = 8;
let camp = load('asso-campaign', null);
if (!camp || !Array.isArray(camp.done)) camp = { done: [], best: {} };
if (!camp.best || typeof camp.best !== 'object') camp.best = {};
const campNext = () => { let i = 0; while (i < CAMPAIGN.length && camp.done.includes(i)) i++; return i; };
let briefIdx = 0;
function renderCampaign(){
  const next = campNext();
  $('campaignProgress').textContent = camp.done.length === CAMPAIGN.length
    ? L('Campagna completata! Puoi rigiocare le missioni per migliorare il record.', 'Campaign complete! Replay missions to beat your best.')
    : L(`Missioni completate: ${camp.done.length} di ${CAMPAIGN.length}`, `Missions complete: ${camp.done.length} of ${CAMPAIGN.length}`);
  const CHAPTERS = [T('Capitolo 1 · La costa'), T('Capitolo 2 · La tempesta')];
  $('campList').innerHTML = CAMPAIGN.map((m, i) => {
    const done = camp.done.includes(i), open = done || i <= next, cls = done ? 'done' : i === next ? 'next' : 'locked';
    const st = done ? L('Fatta', 'Done') : i === next ? L('Gioca', 'Play') : L('Bloccata', 'Locked');
    const head = i % CHAPTER_LEN === 0
      ? `<div class="chap">${CHAPTERS[i / CHAPTER_LEN]}${i > 0 && next < i ? '<small>' + L('Si apre finendo il capitolo 1', 'Unlocks when you finish chapter 1') + '</small>' : ''}</div>` : '';
    return head + `<button class="mis ${cls}" data-mis="${i}" ${open ? '' : 'disabled'}><b>${i + 1}</b>
      <div><h3>${m.title}</h3><p>${m.goal}</p></div><span class="st">${st}</span></button>`;
  }).join('');
}
function openBrief(i){
  briefIdx = i; const m = CAMPAIGN[i], done = camp.done.includes(i);
  $('briefNum').textContent = L('Missione ', 'Mission ') + (i + 1) + L(' di ', ' of ') + CAMPAIGN.length;
  $('briefTitle').textContent = m.title;
  $('briefStory').textContent = m.story;
  $('briefGoal').textContent = m.goal;
  $('briefReward').innerHTML = done ? '<span>' + L('Già ottenuta', 'Already earned') + '</span>' : coinHTML(m.reward);
  $('briefBest').textContent = camp.best[i] ? camp.best[i].toLocaleString(NUM) : '–';
  state = 'brief'; show('briefOv');
}
function refreshCampaignSub(){
  const n = campNext();
  $('campaignSub').textContent = n >= CAMPAIGN.length ? L('Completata', 'Complete') : L('Missione ', 'Mission ') + (n + 1);
}

/* ---------- pilot stats and medals ---------- */
let stats0 = load('asso-stats', null);
const statsDef = { games:0, time:0, kills:0, byType:{}, bosses:0, bossKinds:[], bestWave:0, coins:0, daily:0, endlessBest:0, maxLvl:1, pieces:0 };
let pstats = Object.assign({}, statsDef, stats0 && typeof stats0 === 'object' ? stats0 : {});
if (!Array.isArray(pstats.bossKinds)) pstats.bossKinds = [];
if (!pstats.byType || typeof pstats.byType !== 'object') pstats.byType = {};
if (!pstats.seen || typeof pstats.seen !== 'object') pstats.seen = {};
if (!pstats.bossCount || typeof pstats.bossCount !== 'object') pstats.bossCount = {};
const saveStats = () => save('asso-stats', pstats);

const MEDALS = [
  { id:'first',   name:'Primo volo',      desc:'Gioca la prima partita',                      ok: () => pstats.games >= 1 },
  { id:'k100',    name:'Cento',           desc:'Abbatti 100 nemici in totale',                ok: () => pstats.kills >= 100 },
  { id:'k1000',   name:'Mille',           desc:'Abbatti 1.000 nemici in totale',              ok: () => pstats.kills >= 1000 },
  { id:'boss1',   name:'Cacciatore',      desc:'Sconfiggi il primo boss',                     ok: () => pstats.bosses >= 1 },
  { id:'boss4',   name:'Collezionista',   desc:'Sconfiggi tutti e quattro i boss diversi',    ok: () => pstats.bossKinds.length >= 4 },
  { id:'wave5',   name:'Veterano',        desc:'Raggiungi l\'ondata 5',                       ok: () => pstats.bestWave >= 5 },
  { id:'wave10',  name:'Leggenda',        desc:'Raggiungi l\'ondata 10',                      ok: () => pstats.bestWave >= 10 },
  { id:'asso3',   name:'Vero asso',       desc:'Raggiungi l\'ondata 3 in difficoltà Asso',     ok: () => S.dkey === 'asso' && !S.endless && S.level >= 3 },
  { id:'maxpow',  name:'Arsenale',        desc:'Arriva alla potenza 5',                       ok: () => pstats.maxLvl >= MAX_LVL },
  { id:'combo',   name:'Inarrestabile',   desc:'Raggiungi il moltiplicatore x5',              ok: () => !!S.comboDone },
  { id:'nohit',   name:'Intoccabile',     desc:'Sconfiggi un boss senza farti colpire',       ok: () => !!S.nohitDone },
  { id:'spettro', name: L('Dall\'ombra', 'Out of the shadows'), desc: L('Sblocca lo Spettro', 'Unlock the Wraith'), ok: () => owned.includes('spettro') },
  { id:'fenice',  name:'Dalle ceneri',    desc:'Sblocca la Fenice',                           ok: () => owned.includes('fenice') },
  { id:'rich',    name:'Tesoriere',       desc:'Guadagna 5.000 monete in totale',             ok: () => pstats.coins >= 5000 },
  { id:'daily',   name:'Ogni giorno',     desc:'Gioca una sfida del giorno',                  ok: () => pstats.daily >= 1 },
  { id:'camp',    name:'La costa è salva', desc:'Completa il capitolo 1 della campagna',      ok: () => Array.from({ length: CHAPTER_LEN }, (_, i) => i).every(i => camp.done.includes(i)) },
  { id:'camp2',   name:'Fine della guerra', desc:'Completa tutta la campagna',               ok: () => camp.done.length >= CAMPAIGN.length },
  { id:'rush',    name: L('Corsa ai boss', 'Boss runner'), desc: L('Completa il Boss Rush', 'Complete the Boss Rush'), ok: () => !!(load('asso-rush', 0)) },
  { id:'party',   name: L('In compagnia', 'Party pilot'), desc: L('Gioca una sfida a turni con gli amici', 'Play a party round with friends'), ok: () => !!S.partyDone },
  { id:'strega',  name: L('Notte delle streghe', 'Witching hour'), desc: L('Sconfiggi la Strega di Halloween', 'Defeat the Halloween Witch'), ok: () => pstats.bossKinds.includes('strega') },
  { id:'inverno', name: L('Buone feste', 'Happy holidays'), desc: L('Sconfiggi il Re dell\'Inverno', 'Defeat the Winter King'), ok: () => pstats.bossKinds.includes('inverno') },
  { id:'segreto', name: L('Il segreto', 'Secret keeper'), desc: L('Scopri il codice segreto', 'Discover the secret code'), ok: () => !!load('asso-secret', false) },
  { id:'landing', name: L('Sul filo', 'Right on the wire'), desc: L('Fai un appontaggio perfetto', 'Make a perfect carrier landing'), ok: () => !!load('asso-land', false) },
  { id:'zen',     name: L('Mente zen', 'Zen mind'), desc: L('Vola 10 minuti in modalità Zen', 'Fly 10 minutes in Zen mode'), ok: () => !!S.zen && S.t >= 600 },
  { id:'endless', name:'Senza fine',      desc:'Resisti 3 minuti in modalità infinita',       ok: () => !!S.endless && S.t >= 180 }
];
const MEDAL_REWARD = 75;
let medals = load('asso-medals', []);
if (!Array.isArray(medals)) medals = [];
let newMedals = 0;
function onProgress(){
  for (const m of MEDALS){
    if (medals.includes(m.id)) continue;
    let ok = false;
    try { ok = m.ok(); } catch(e){}
    if (!ok) continue;
    medals.push(m.id); newMedals++;
    wallet += MEDAL_REWARD; save('asso-coins', wallet);
    save('asso-medals', medals);
    toast(`<span>${L('Medaglia', 'Medal')}: ${m.name}</span><span class="coins">${coinHTML('+' + MEDAL_REWARD)}</span>`);
    sfx.win();
  }
  $('medalDot').hidden = !newMedals;
  $('medalDot').textContent = newMedals || '';
}
// called once when a run ends (death or leaving from pause)
function finishRun(){
  if (S.statsDone) return;
  S.statsDone = true;
  droneGainXp(S.kills + (S.bossKills || 0) * 10);
  pstats.games++;
  pstats.time += Math.round(S.t);
  pstats.bestWave = Math.max(pstats.bestWave, S.endless ? 0 : S.level);
  pstats.coins += S.coins;
  if (S.daily) pstats.daily++;
  if (S.endless) pstats.endlessBest = Math.max(pstats.endlessBest, Math.round(S.t));
  saveStats();
  onProgress();
}
function fmtTime(sec){
  const h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, s = sec % 60;
  return h ? `${h} h ${m} min` : m ? `${m} min ${s} s` : `${s} s`;
}
const TYPE_NAMES = { f:'Caccia', w:'Zig-zag', b:'Bombardieri', k:'Kamikaze', h:'Elicotteri', m:'Mine', n:'Navi' };
function renderProfile(){
  newMedals = 0; onProgress();
  renderPilot();
  const num = n => n.toLocaleString(NUM);
  const rows = [
    ['Partite', num(pstats.games)],
    ['Tempo di volo', fmtTime(pstats.time)],
    ['Nemici abbattuti', num(pstats.kills)],
    ['Boss sconfitti', num(pstats.bosses)],
    ['Ondata più alta', num(pstats.bestWave)],
    ['Infinita, tempo record', fmtTime(pstats.endlessBest)],
    ['Monete guadagnate', num(pstats.coins)],
    ['Sfide del giorno', num(pstats.daily)]
  ];
  $('statGrid').innerHTML = rows.map(([a, b]) => `<div><span>${T(a)}</span><strong>${b}</strong></div>`).join('');
  $('typeGrid').innerHTML = Object.entries(TYPE_NAMES).map(([t, n]) => `<div><span>${n}</span><strong>${num(pstats.byType[t] || 0)}</strong></div>`).join('');
  $('medalCount').textContent = medals.length + L(' di ', ' of ') + MEDALS.length;
  $('medalList').innerHTML = MEDALS.map(m => {
    const has = medals.includes(m.id);
    return `<div class="medal${has ? ' got' : ''}"><i aria-hidden="true"></i><div><h3>${m.name}</h3><p>${m.desc}</p></div></div>`;
  }).join('');
}

/* ---------- daily challenge ---------- */
const DAILY = [
  { id:'kamikaze', name:'Pioggia di kamikaze', desc:'Arrivano solo kamikaze, ma i punti valgono il triplo' },
  { id:'bossrush', name:'Corsa ai boss',       desc:'Ogni ondata dura solo 12 secondi' },
  { id:'unavita',  name:'Una vita sola',       desc:'Hai una sola vita. Il cuore diventa uno scudo' },
  { id:'turbo',    name:'Turbo',               desc:'Tutto va più veloce del 30%' },
  { id:'mine',     name:'Campo minato',        desc:'Mine volanti fin dalla prima ondata' },
  { id:'nudo',     name:'Senza bonus',         desc:'Niente bonus, ma i punti valgono il triplo' }
];
function todayKey(){
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function todayRule(){
  let h = 7;
  for (const c of todayKey()) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return DAILY[h % DAILY.length];
}
function dailyBest(){
  const d = load('asso-daily', null);
  return d && d.date === todayKey() ? d.best : 0;
}
function refreshDaily(){
  const r = todayRule(), b = dailyBest();
  $('dailySub').textContent = r.name;
  const eb = +load('asso-endless', 0) || 0;
  const rb = +load('asso-rush', 0) || 0;
  $('rushSub').textContent = rb ? fmtClock(rb) : L('5 boss', '5 bosses');
  $('endlessSub').textContent = eb ? T('Record') + ' ' + eb.toLocaleString(NUM) : T('Senza boss');
}
const stats = () => ({
  fireRate: plane().fire * (1 - 0.09 * up.fire),
  hp: Math.max(1, 3 + plane().hp + up.armor),
  startLvl: Math.min(3, 1 + up.power),
  bombs: 2 + up.bomb,
  maxBombs: 3 + up.bomb,
  pickR: 18 + 14 * up.magnet
});
function refreshMenuStats(){
  $('bestMenu').textContent = best;
  $('coinsMenu').innerHTML = coinHTML(wallet);
  refreshDaily();
  refreshCampaignSub();
}
refreshMenuStats();

/* ---------- sky ---------- */
const PALETTES = [
  { c:['#24305e','#b85c7a','#f2a65a'], stars:0 },
  { c:['#1c2350','#7a3f78','#d9604f'], stars:0.35 },
  { c:['#0f1433','#2b2a5e','#5a3d72'], stars:0.85 },
  { c:['#0a0f26','#15204a','#2a3a6e'], stars:1 }
];
const skyIndex = lvl => lvl <= 4 ? lvl - 1 : 2 + ((lvl - 1) % 2);
let grads = [];
const sky = { from: 0, to: 0, mix: 1 };
const stars = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), r: rnd(0.5, 1.6), tw: rnd(0, 6) }));

/* ---------- sizing ---------- */
let W = 0, H = 0, DPR = 1, k = 1;
let S = {};
function resize(){
  const r = cv.getBoundingClientRect();
  DPR = Math.min(window.devicePixelRatio || 1, perf.low ? 1.25 : 2);
  W = r.width; H = r.height;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  k = clamp(Math.min(W / 420, H / 760), 0.75, 1.3);
  grads = PALETTES.map(p => {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, p.c[0]); g.addColorStop(0.55, p.c[1]); g.addColorStop(1, p.c[2]);
    return g;
  });
  if (S.p){ S.p.x = clamp(S.p.x, 0, W); S.p.y = clamp(S.p.y, 0, H); }
}

