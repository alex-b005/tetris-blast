/* ============================================================
   config.js — every tunable number and table in one place.
   Loaded first; everything below is a plain global.
   ============================================================ */

const COLS = 10;
const ROWS = 20;
const CELL = 32;
const BOARD_W = COLS * CELL;   // 320
const BOARD_H = ROWS * CELL;   // 640

/* ---------- timing (all in seconds) ---------- */

const LOCK_DELAY    = 0.50;   // grace period once a piece lands
const LOCK_RESETS   = 15;     // how many times moving can refresh it
const DAS_DELAY     = 0.14;   // hold time before auto-repeat kicks in
const ARR_RATE      = 0.032;  // auto-repeat interval
const SOFT_RATE     = 0.030;  // soft-drop repeat interval
const CLEAR_TIME    = 0.55;   // line-clear sequence length
const SPAWN_DELAY   = 0.08;   // pause between pieces

/* Gravity per level, in seconds per cell. */
function gravityFor(level) {
  return Math.max(0.055, 0.80 * Math.pow(0.855, level - 1));
}

/* ---------- pieces ---------- */

const PIECES = {
  I: { color: '#22e5ff', light: '#b6f6ff', matrix: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] },
  O: { color: '#ffd93d', light: '#fff3ae', matrix: [[1,1],[1,1]] },
  T: { color: '#ff4dff', light: '#ffc2ff', matrix: [[0,1,0],[1,1,1],[0,0,0]] },
  S: { color: '#4dff88', light: '#c4ffd8', matrix: [[0,1,1],[1,1,0],[0,0,0]] },
  Z: { color: '#ff4d6d', light: '#ffc0cb', matrix: [[1,1,0],[0,1,1],[0,0,0]] },
  J: { color: '#4d8cff', light: '#c2d8ff', matrix: [[1,0,0],[1,1,1],[0,0,0]] },
  L: { color: '#ff9f1c', light: '#ffdca8', matrix: [[0,0,1],[1,1,1],[0,0,0]] }
};

const PIECE_KEYS = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

/* Wall-kick offsets tried in order when a rotation is blocked. */
const KICKS = [
  [ 0,  0], [-1,  0], [ 1,  0], [-2,  0], [ 2,  0],
  [ 0, -1], [-1, -1], [ 1, -1], [ 0, -2]
];

/* ---------- scoring ---------- */

const LINE_SCORE = [0, 100, 300, 500, 800];
const COMBO_BONUS = 50;
const SOFT_DROP_PT = 1;
const HARD_DROP_PT = 2;

/* ---------- fighters ---------- */
/* Original arcade archetypes rather than lifts from real fighting
   games — those characters are trademarked, and a knock-off would
   be the one thing in here you couldn't safely publish. Each entry
   is a palette for the shared sprite plus its own beam and shout. */

const FIGHTERS = [
  {
    id: 'karateka',
    name: 'KARATEKA',
    shout: 'KI BLAST!',
    palette: {
      O: '#12101f', H: '#2e2116', B: '#e23a3a', S: '#ffcb92', s: '#d99a5f',
      E: '#12101f', C: '#22e5ff', G: '#f2f3fa', W: '#ffffff', T: '#2b2b7a', P: '#f2f3fa'
    },
    beam: { core: '#ffffff', mid: '#22e5ff', outer: '#0a5cff' }
  },
  {
    id: 'blaze',
    name: 'BLAZE',
    shout: 'BURN IT DOWN!',
    palette: {
      O: '#1c0a05', H: '#ffd93d', B: '#8b1a1a', S: '#ffcb92', s: '#d99a5f',
      E: '#1c0a05', C: '#ff9f1c', G: '#f0452a', W: '#ff7a5c', T: '#f2f3fa', P: '#f0452a'
    },
    beam: { core: '#ffffff', mid: '#ff9f1c', outer: '#d81414' }
  },
  {
    id: 'shinobi',
    name: 'SHINOBI',
    shout: 'VANISH!',
    palette: {
      O: '#040a14', H: '#0d1424', B: '#4dff88', S: '#ffcb92', s: '#d99a5f',
      E: '#040a14', C: '#4dff88', G: '#16305e', W: '#2b5090', T: '#4dff88', P: '#16305e'
    },
    beam: { core: '#ffffff', mid: '#4dff88', outer: '#00996b' }
  },
  {
    id: 'hexer',
    name: 'HEXER',
    shout: 'ERASED!',
    palette: {
      O: '#150428', H: '#efe6ff', B: '#ffd93d', S: '#f2d5b6', s: '#c9a179',
      E: '#150428', C: '#ff4dff', G: '#6a20d0', W: '#9a54f0', T: '#ffd93d', P: '#6a20d0'
    },
    beam: { core: '#ffffff', mid: '#ff4dff', outer: '#7b2cbf' }
  },
  {
    id: 'titan',
    name: 'TITAN',
    shout: 'CRUSHED!',
    palette: {
      O: '#1a1006', H: '#5a3a12', B: '#ffd93d', S: '#e8a86a', s: '#b87b42',
      E: '#1a1006', C: '#ffd93d', G: '#a8641e', W: '#d98c34', T: '#ffd93d', P: '#a8641e'
    },
    beam: { core: '#ffffff', mid: '#ffd93d', outer: '#ff7a00' }
  },
  {
    id: 'volt',
    name: 'VOLT',
    shout: 'OVERLOAD!',
    palette: {
      O: '#02101a', H: '#7fe9ff', B: '#22e5ff', S: '#cfd8e6', s: '#93a3b8',
      E: '#02101a', C: '#ffffff', G: '#123a5c', W: '#1f6d9e', T: '#22e5ff', P: '#123a5c'
    },
    beam: { core: '#ffffff', mid: '#a8f0ff', outer: '#00a2ff' }
  },
  {
    id: 'cipher',
    name: 'CIPHER',
    shout: 'SYSTEM CRASH!',
    palette: {
      O: '#0a0c10', H: '#1a120d', B: '#e23a3a', S: '#6b4226', s: '#432b16',
      E: '#0a0c10', C: '#ffb020', G: '#4a5560', W: '#8a97a3', T: '#ffb020', P: '#c41e1e'
    },
    beam: { core: '#fff6e0', mid: '#ffb020', outer: '#c46200' }
  }
];

/* ---------- impact words ---------- */

const WORDS = {
  1: ['SMASH!', 'BLAST!', 'BOOM!', 'CRACK!', 'POW!', 'ZAP!'],
  2: ['DOUBLE HIT!', 'COMBO!', 'BREAKER!', 'DOUBLE BLAST!'],
  3: ['TRIPLE THREAT!', 'ONSLAUGHT!', 'RAMPAGE!', 'DEVASTATE!'],
  4: ['TETRIS BLAST!', 'ANNIHILATED!', 'MAXIMUM POWER!', 'OBLITERATED!']
};

/* ---------- themes ---------- */
/* `swatch` is the little button gradient in the sidebar. */

const THEMES = [
  { id: 'neon',      name: 'NEON GRID',  swatch: 'linear-gradient(135deg,#ff3ea5,#22e5ff)' },
  { id: 'starfield', name: 'DEEP SPACE', swatch: 'linear-gradient(135deg,#0a1030,#4d8cff)' },
  { id: 'synthwave', name: 'SYNTHWAVE',  swatch: 'linear-gradient(180deg,#2b0a4a,#ff3ea5)' },
  { id: 'aurora',    name: 'AURORA',     swatch: 'linear-gradient(135deg,#4dff88,#22e5ff)' },
  { id: 'ocean',     name: 'DEEP BLUE',  swatch: 'linear-gradient(180deg,#0b2a6b,#22a0ff)' },
  { id: 'matrix',    name: 'DATA RAIN',  swatch: 'linear-gradient(180deg,#021a02,#4dff88)' }
];
