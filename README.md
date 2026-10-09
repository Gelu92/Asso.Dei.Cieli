# Asso dei Cieli

**Gelu inc.**

Sparatutto verticale per cellulare. Guidi un aereo al tramonto e abbatti caccia, bombardieri, kamikaze, elicotteri, mine e navi. Alla fine di ogni ondata arriva un boss diverso.

## Come si gioca

- Trascina il dito per pilotare, il fuoco è automatico.
- Il pulsante rosso sgancia una bomba che cancella i proiettili nemici; quello col fulmine lancia l'abilità speciale del tuo aereo.
- Abbattimenti di fila aumentano il moltiplicatore fino a x5.
- Con le monete compri aerei, livree e potenziamenti nell'hangar.
- Da computer: frecce o WASD per muoverti, Spazio per la bomba, E per l'abilità, Esc per la pausa.

## Modalità

Campagna (16 missioni con atterraggio sulla portaerei), Sfida del giorno, Infinita, Boss Rush, A turni con gli amici, Zen ed eventi stagionali (Halloween e Natale). Tre difficoltà: Recluta, Pilota, Asso. Il gioco è in italiano e in inglese.

## Pubblicarlo su GitHub Pages

1. Crea un nuovo repository su GitHub, per esempio `asso-dei-cieli`.
2. Carica tutti i file direttamente nella radice del repository, senza cartelle.
3. Vai in **Settings → Pages**.
4. In **Build and deployment** scegli **Deploy from a branch**, branch `main`, cartella `/ (root)`, e salva.
5. Dopo un paio di minuti il gioco è online su `https://TUO-NOME.github.io/asso-dei-cieli/`.

## Installarlo sul telefono

Apri l'indirizzo di GitHub Pages dal telefono:

- **Android (Chrome):** menu ⋮ → **Installa app** oppure **Aggiungi a schermata Home**.
- **iPhone (Safari):** pulsante Condividi → **Aggiungi alla schermata Home**.

Si apre a schermo intero con la sua icona e funziona anche senza connessione dopo la prima apertura.

## Aggiornamenti

Quando carichi una versione nuova, i telefoni la scaricano da soli alla prima apertura con internet. Se vuoi essere sicuro che la vecchia copia offline venga buttata, aumenta anche il numero nella prima riga di `sw.js` (`asso-dei-cieli-v%s` → `v%d`).

I salvataggi (monete, aerei, record) restano nel telefono e non si perdono con gli aggiornamenti. Per passarli su un altro telefono usa **Impostazioni → Esporta salvataggio**.

## File

| File | A cosa serve |
|---|---|
| `index.html` | La pagina: menu, schermate e caricamento dei file |
| `style.css` | Colori, pulsanti e aspetto delle schermate |
| `01-base.js` | Salvataggi, lingua, difficoltà, missioni, classifica, campagna, medaglie |
| `02-scenario.js` | Nuvole, mare, isole e ambientazioni |
| `03-audio.js` | Effetti sonori e musica |
| `04-stato.js` | Stato della partita e indicatori a schermo |
| `05-hangar.js` | Hangar, potenziamenti e scatola misteriosa |
| `06-comandi.js` | Comandi col dito e con la tastiera |
| `07-nemici.js` | Nemici, boss e pioggia d'oro |
| `08-combattimento.js` | Esplosioni, meteo, abilità speciali, colpi e bonus |
| `09-extra.js` | Eventi stagionali, fantasma, pilota, bonus giornaliero, codice segreto, drone, enciclopedia |
| `10-modalita.js` | Appontaggio, Zen, A turni, Boss Rush, missioni |
| `11-aggiornamento.js` | La logica di gioco a ogni fotogramma |
| `12-disegno.js` | Il disegno di tutto quello che vedi |
| `13-avvio.js` | Ciclo di gioco, tutorial, menu, impostazioni, condivisione, testi in inglese |
| `manifest.webmanifest` | Nome, colori e icone per l'installazione |
| `sw.js` | Permette di giocare offline |
| `icon-*.png`, `apple-touch-icon.png` | Icone dell'app |
| `.nojekyll` | Dice a GitHub Pages di pubblicare i file così come sono |

I file `.js` vanno caricati in quest'ordine: è già scritto così in `index.html`.
