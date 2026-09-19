/* ============================================================
   sprites.js — 20x24 arcade-style fighter, two poses.

   Bigger canvas than before (was 16x16) so the figure gets a
   real silhouette: separate head, shoulders, guard, belt and
   stance. Characters face LEFT — they enter from the right
   edge of the well and fire across it.

   Legend
     .  transparent   O  outline       H  hair      h  hair shade
     B  headband      S  skin          s  skin shade
     E  eye           C  eye glow (firing only)
     G  gi / body     W  gi highlight  T  belt / trim
     P  pants / legs
   ============================================================ */

const SPRITE_W = 20;
const SPRITE_H = 24;

/* Fighting stance: guard up, weight back, fists tucked. */
const SPRITE_READY = [
  '....................',
  '......OOOOOO........',
  '.....OHHHHHHO.......',
  '....OHHHHHHHHO......',
  '....OBBBBBBBBO......',
  '....OBBBBBBBBOOO....',
  '....OSSSSSSSSO......',
  '....OSEOSSEOSO......',
  '....OSSSSSSSsO......',
  '.....OsSSSSsO.......',
  '.....OOSSSOO........',
  '...OOOGGGGGGOOO.....',
  '..OGWGGGGGGGGGGO....',
  '.OSSOWGGGGGGGGGGO...',
  '.OSSOWGGGGGGGGGGO...',
  '.OOSSOGGGGGGGGGGO...',
  '..OSSOGGGGGGGGGO....',
  '...OTTTTTTTTTTO.....',
  '...OPPPPOOPPPPO.....',
  '...OPPPO..OPPPO.....',
  '..OPPPO....OPPPO....',
  '..OPPO......OPPO....',
  '.OSSSO......OSSSO...',
  '.OOOOO......OOOOO...'
];

/* Release: both arms punched forward, body driving into it. */
const SPRITE_FIRE = [
  '....................',
  '.......OOOOOO.......',
  '......OHHHHHHO......',
  '.....OHHHHHHHHO.....',
  '.....OBBBBBBBBO.....',
  '.....OBBBBBBBBOOOO..',
  '.....OSSSSSSSSO.....',
  '.....OSCOSSCOSO.....',
  '.....OSSSSSSSsO.....',
  '......OsSSSSsO......',
  '......OOSSSOO.......',
  '....OOOGGGGGGOOO....',
  'OOOOWGGGGGGGGGGGO...',
  'OSSSSSSSGGGGGGGGO...',
  'OSSSSSSSGGGGGGGGO...',
  'OOOOSSSSGGGGGGGGO...',
  '....OOGGGGGGGGGO....',
  '....OTTTTTTTTTTO....',
  '....OPPPPOOPPPPO....',
  '...OPPPO...OPPPO....',
  '..OPPPO.....OPPPO...',
  '..OPPO.......OPPO...',
  '.OSSSO.......OSSSO..',
  '.OOOOO.......OOOOO..'
];

/* Where the lead fist sits in the firing pose, in sprite pixels,
   so beams and the charge orb line up with the art. */
const SPRITE_HAND = { x: 1.5, y: 13.5 };

/* ------------------------------------------------------------
   Direct blitter. Runs of identical colour collapse into one
   fillRect, which roughly halves the calls for a 20x24 figure.
   ------------------------------------------------------------ */
function drawSprite(ctx, sprite, palette, x, y, scale, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha === undefined ? 1 : alpha;

  for (let r = 0; r < sprite.length; r++) {
    const row = sprite[r];
    let c = 0;
    while (c < row.length) {
      const ch = row[c];
      if (ch === '.' || !palette[ch]) { c++; continue; }
      let run = 1;
      while (c + run < row.length && row[c + run] === ch) run++;
      ctx.fillStyle = palette[ch];
      ctx.fillRect(x + c * scale, y + r * scale, run * scale, scale);
      c += run;
    }
  }

  ctx.restore();
}

/* ------------------------------------------------------------
   Offscreen cache.

   Blitting a fighter costs a few hundred fillRects. Doing that
   every frame of every attack is wasteful when the art never
   changes, so each fighter/pose pair is rasterised once and
   then stamped with a single drawImage.
   ------------------------------------------------------------ */
const SpriteCache = (function () {
  const store = {};

  function build(sprite, palette, scale) {
    const cv = document.createElement('canvas');
    cv.width = SPRITE_W * scale;
    cv.height = SPRITE_H * scale;
    const c = cv.getContext('2d');
    c.imageSmoothingEnabled = false;
    drawSprite(c, sprite, palette, 0, 0, scale, 1);
    return cv;
  }

  return {
    /** @returns {HTMLCanvasElement} rasterised fighter, ready to stamp */
    get(fighter, pose, scale) {
      const key = fighter.id + '|' + pose + '|' + scale;
      if (!store[key]) {
        store[key] = build(pose === 'fire' ? SPRITE_FIRE : SPRITE_READY,
            fighter.palette, scale);
      }
      return store[key];
    },
    clear() { for (const k in store) delete store[k]; }
  };
})();

/** Draw a fighter portrait centred in a small canvas (sidebar preview). */
function drawFighterPortrait(ctx, fighter, w, h) {
  ctx.clearRect(0, 0, w, h);
  ctx.imageSmoothingEnabled = false;
  const scale = Math.max(1, Math.floor(Math.min(w / SPRITE_W, h / SPRITE_H)));
  const img = SpriteCache.get(fighter, 'ready', scale);
  ctx.drawImage(img, Math.round((w - img.width) / 2), Math.round((h - img.height) / 2));
}
