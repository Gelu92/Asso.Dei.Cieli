/* Asso dei Cieli - Gelu inc. | comandi: dito e tastiera */

/* ---------- input ---------- */
const keys = {};
let drag = null;
cv.addEventListener('pointerdown', e => {
  if (state !== 'play') return;
  cv.setPointerCapture(e.pointerId);
  drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, px: S.p.x, py: S.p.y };
});
cv.addEventListener('pointermove', e => {
  if (!drag || drag.id !== e.pointerId || state !== 'play') return;
  const f = 1.25 * (0.85 + plane().speed * 0.15);
  const nx = drag.px + (e.clientX - drag.sx) * f;
  const ny = drag.py + (e.clientY - drag.sy) * f;
  S.p.bank = clamp((nx - S.p.x) * 0.15, -1, 1);
  S.p.x = clamp(nx, S.p.r, W - S.p.r);
  S.p.y = clamp(ny, H * 0.3, H - S.p.r * 1.6);
});
const endDrag = e => { if (drag && drag.id === e.pointerId) drag = null; };
cv.addEventListener('pointerup', endDrag);
cv.addEventListener('pointercancel', endDrag);
addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
  if ((e.key === 'Escape' || e.key === 'p') && (state === 'play' || state === 'pause')) togglePause();
  if ((e.key === ' ' || e.key === 'b') && state === 'play'){ e.preventDefault(); useBomb(); }
  if ((e.key === 'e' || e.key === 'Shift') && state === 'play'){ e.preventDefault(); useSpecial(); }
});
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

