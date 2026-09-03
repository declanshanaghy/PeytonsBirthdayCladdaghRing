/* Peyton's 19th birthday slideshow.
   Everything is driven off audio.currentTime so the show cannot drift away
   from the song, even if the network stalls. */

'use strict';

/* ------------------------------------------------------------------ data */

const SONG_DURATION = 225.88;   // web/music/BestToYou.mp3, measured

const TIMING = {
  titleHold:  9.0,              // title card stays up this long into the song
  fadeStart:  208.9,            // stage begins fading out
  finaleAt:   210.9,            // finale card takes over
  crossfade:  1.2               // must match .slide transition in styles.css
};

// Ring build, in process order. Label shown under the ring pane.
const RINGS = [
  ['01-20260902_011243-FreshResinPrint.jpg',                  'Fresh resin print'],
  ['02-20260902_011415-ResinPrintCloseUp.jpg',                'Resin print close-up'],
  ['03-20260902_144122-RawBrassCasting.jpg',                  'Raw brass casting'],
  ['04-20260902_151251-AfterMagneticTumbling.jpg',            'First rough cleanup'],
  ['06-20260902_155630-FirstSandingDown.jpg',                 'First sanding down'],
  ['07-20260902_161521-FinalPolish.jpg',                      'Final polish'],
  ['08-20260902_163752-NickelElectroplating.jpg',             'Nickel electroplating'],
  ['09-20260902_170130-GoldElectroplating.jpg',               'Gold electroplating'],
  ['10-20260902_170834-NickelAndGoldRings.jpg',               'Nickel and gold rings'],
  ['12-20260902_171040-FinishedGoldRing.jpg',                 'Finished gold ring'],
  ['15-20260902_171959-TwoFinishedGoldRings.jpg',             'Two finished gold rings'],
  ['16-20260902_172027-OurTwoRingsAndGrandfathersOriginal.jpg','Our two rings and Grandad’s original'],
  ['17-20260902_182815-FinalPeyPeyRing.jpg',                  'The final PeyPey ring']
];

// Memories, chronological. Caption shown under the memories pane.
const MEMORIES = [
  ['20250821_194011.jpg', 'Moving into college'],
  ['20250821_194047.jpg', 'Besties!'],
  ['20250821_202944.jpg', 'Best hairstylist ever'],
  ['20250822_165553.jpg', 'All moved in'],
  ['20250823_180428.jpg', 'College life begins'],
  ['20251224_173804.jpg', 'Christmas Eve, 2025'],
  ['20260610_143223.jpg', 'Happy days in Ireland'],
  ['20260611_153351.jpg', 'Galway girl'],
  ['20260615_135531.jpg', 'The Giant’s Causeway'],
  ['20260616_114007.jpg', 'Derry days'],
  ['20260616_140723.jpg', 'Visiting the Derry murals'],
  ['20260616_141539.jpg', 'Derry Brigade Martyrs'],
  ['20260617_142615.jpg', 'Windswept and grinning'],
  ['20260617_144429.jpg', 'The mad gollywogs'],
  ['20260619_134205.jpg', 'She thought it was a blowball!'],
  ['20260621_133348.jpg', 'Athlone show memories'],
  ['20260621_135338.jpg', 'More from the Athlone show'],
  ['20260621_142907.jpg', 'Athlone, one for the album'],
  ['20260621_181022.jpg', 'Fun with cousins in Naas'],
  ['20260625_032622.jpg', 'Happy days in Scotland']
];

// Each theme carries a birthday message and a palette. They rotate together.
const THEMES = [
  { message: 'Happy 19th Birthday, PeyPey!',    bgA: '#3a1f56', bgB: '#150c24',
    accent: '#ffd166', accentSoft: '#ffeab0', text: '#fff6e5',
    confetti: ['#ffd166', '#ff8fab', '#8ecae6', '#ffffff', '#c77dff'] },
  { message: 'Nineteen looks good on you',      bgA: '#5c1f3d', bgB: '#1c0a16',
    accent: '#ff9ebb', accentSoft: '#ffd0de', text: '#fff0f4',
    confetti: ['#ff9ebb', '#ffd166', '#ffffff', '#ff6f91', '#ffe5ec'] },
  { message: 'So proud of you, always',         bgA: '#0f4d3a', bgB: '#061a14',
    accent: '#7ee8b2', accentSoft: '#c5f7de', text: '#eafff5',
    confetti: ['#7ee8b2', '#ffd166', '#ffffff', '#4cc9a0', '#d8f3dc'] },
  { message: 'Here’s to the year ahead',   bgA: '#16305e', bgB: '#070d1c',
    accent: '#8ecae6', accentSoft: '#cbe9f7', text: '#eef8ff',
    confetti: ['#8ecae6', '#ffd166', '#ffffff', '#a0c4ff', '#bde0fe'] },
  { message: 'You are loved more than you know',bgA: '#6b2d10', bgB: '#1e0d05',
    accent: '#ffb26b', accentSoft: '#ffdcbb', text: '#fff3e8',
    confetti: ['#ffb26b', '#ff8fab', '#ffffff', '#ffd166', '#ffcfa8'] },
  { message: 'Made with love, by Dad',          bgA: '#3d1a63', bgB: '#120821',
    accent: '#c77dff', accentSoft: '#e5c6ff', text: '#f7edff',
    confetti: ['#c77dff', '#ffd166', '#ffffff', '#9d4edd', '#e0aaff'] }
];

/* ------------------------------------------------------------- elements */

const $ = (id) => document.getElementById(id);

const audio      = $('audio');
const stage      = $('stage');
const banner     = $('banner');
const titleCard  = $('title-card');
const finaleCard = $('finale-card');
const finaleRing = $('finale-ring');
const startBtn   = $('start-btn');
const replayBtn  = $('replay-btn');
const confetti   = $('confetti');

const tracks = {
  rings: {
    items: RINGS,
    base: 'web/rings/',
    frame: $('frame-rings'),
    labelEl: $('label-rings'),
    slides: $('frame-rings').querySelectorAll('.slide'),
    front: 0,
    index: -1,
    gen: 0,
    settled: -1,
    timer: 0
  },
  other: {
    items: MEMORIES,
    base: 'web/other/',
    frame: $('frame-other'),
    labelEl: $('label-other'),
    slides: $('frame-other').querySelectorAll('.slide'),
    front: 0,
    index: -1,
    gen: 0,
    settled: -1,
    timer: 0
  }
};

// Slideshow window and the per-photo duration of each track.
const SHOW_START  = TIMING.titleHold;
const SHOW_LENGTH = TIMING.fadeStart - SHOW_START;
const RING_STEP   = SHOW_LENGTH / RINGS.length;
const OTHER_STEP  = SHOW_LENGTH / MEMORIES.length;
const THEME_STEP  = SHOW_LENGTH / THEMES.length;

finaleRing.src = tracks.rings.base + RINGS[RINGS.length - 1][0];

/* -------------------------------------------------------------- helpers */

const clampIndex = (n, len) => Math.max(0, Math.min(len - 1, n));

/** Swap text with a short fade so captions don't jump.
    The pending timer is tracked per element and cleared on each new request:
    without that, an older fade landing after a newer one writes stale text
    and the caption stays wrong for good. */
const textTimers = new WeakMap();
const textTargets = new WeakMap();

function setText(el, text) {
  if (textTargets.get(el) === text) return;
  textTargets.set(el, text);
  clearTimeout(textTimers.get(el));
  el.classList.add('is-swapping');
  textTimers.set(el, setTimeout(() => {
    el.textContent = textTargets.get(el);
    el.classList.remove('is-swapping');
  }, 550));
}

/** Show photo `i` of a track, crossfading between its two <img> layers. */
function showPhoto(track, i) {
  if (i === track.index) return;
  track.index = i;

  const [file, label] = track.items[i];
  const backIndex = 1 - track.front;
  const back = track.slides[backIndex];
  const front = track.slides[track.front];

  const reveal = () => {
    // Restart the Ken Burns drift on the layer we are bringing forward.
    back.style.animation = 'none';
    void back.offsetWidth;
    back.style.animation = '';
    back.classList.add('is-active');
    front.classList.remove('is-active');
    track.front = backIndex;
  };

  // Reveal once the photo has loaded, so it fades in whole rather than
  // half-painted -- but never let a slow or failed image stall the show.
  // The generation guard matters: if a photo is still pending when the next
  // one starts (a seek, or a slow load), its late callback must not fire, or
  // the two reveals both flip track.front and the pane ends up showing a
  // stale photo under the new caption.
  const gen = ++track.gen;
  clearTimeout(track.timer);
  const done = () => {
    if (track.gen !== gen || track.settled === gen) return;
    track.settled = gen;
    reveal();
  };
  back.onload = done;
  back.onerror = done;
  back.alt = label;
  back.src = track.base + file;
  if (back.complete) done();
  track.timer = setTimeout(done, 2000);

  setText(track.labelEl, label);
  preload(track, i + 1);
  preload(track, i + 2);
}

const preloaded = new Set();
function preload(track, i) {
  if (i >= track.items.length) return;
  const url = track.base + track.items[i][0];
  if (preloaded.has(url)) return;
  preloaded.add(url);
  const img = new Image();
  img.src = url;
}

let themeIndex = -1;
function applyTheme(i) {
  if (i === themeIndex) return;
  themeIndex = i;
  const t = THEMES[i];
  const root = document.documentElement.style;
  root.setProperty('--bg-a', t.bgA);
  root.setProperty('--bg-b', t.bgB);
  root.setProperty('--accent', t.accent);
  root.setProperty('--accent-soft', t.accentSoft);
  root.setProperty('--text', t.text);
  root.setProperty('--glow', hexToGlow(t.accent));
  setText(banner, t.message);
  buildConfetti(t.confetti);
}

function hexToGlow(hex) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, 0.38)`;
}

function buildConfetti(palette) {
  confetti.textContent = '';
  const count = window.matchMedia('(max-width: 700px)').matches ? 18 : 34;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const bit = document.createElement('i');
    const dur = 7 + Math.random() * 9;
    bit.style.left = (Math.random() * 100).toFixed(2) + 'vw';
    bit.style.background = palette[i % palette.length];
    bit.style.animationDuration = dur.toFixed(2) + 's';
    bit.style.animationDelay = (-Math.random() * dur).toFixed(2) + 's';
    bit.style.setProperty('--sway', (Math.random() * 160 - 80).toFixed(0) + 'px');
    if (Math.random() < 0.4) bit.style.borderRadius = '50%';
    frag.appendChild(bit);
  }
  confetti.appendChild(frag);
}

/* ----------------------------------------------------------- the driver */

let phase = 'idle';   // idle | title | show | finale

function setPhase(next) {
  if (next === phase) return;
  phase = next;

  confetti.classList.toggle('is-front', next === 'title' || next === 'finale');

  if (next === 'title') {
    titleCard.classList.add('is-visible');
    stage.classList.remove('is-visible', 'is-fading');
    stage.setAttribute('aria-hidden', 'true');
    finaleCard.classList.remove('is-visible');
    replayBtn.classList.remove('is-shown');
  }

  if (next === 'show') {
    titleCard.classList.remove('is-visible');
    stage.classList.add('is-visible');
    stage.classList.remove('is-fading');
    stage.setAttribute('aria-hidden', 'false');
    finaleCard.classList.remove('is-visible');
  }

  if (next === 'finale') {
    titleCard.classList.remove('is-visible');
    stage.classList.add('is-fading');
    stage.setAttribute('aria-hidden', 'true');
    finaleCard.classList.add('is-visible');
  }
}

function tick() {
  const t = audio.currentTime;

  if (t < TIMING.titleHold) {
    setPhase('title');
    applyTheme(0);
  } else if (t < TIMING.finaleAt) {
    setPhase('show');
    const elapsed = t - SHOW_START;
    applyTheme(clampIndex(Math.floor(elapsed / THEME_STEP), THEMES.length));
    showPhoto(tracks.rings, clampIndex(Math.floor(elapsed / RING_STEP), RINGS.length));
    showPhoto(tracks.other, clampIndex(Math.floor(elapsed / OTHER_STEP), MEMORIES.length));
    if (t >= TIMING.fadeStart) stage.classList.add('is-fading');
  } else {
    setPhase('finale');
  }
}

/* A timer, not requestAnimationFrame: rAF stops in a hidden tab or on a locked
   phone, which would freeze the show while the song kept playing. Timers are
   throttled in the background rather than stopped, and because every decision
   is recomputed from audio.currentTime the show snaps straight back into sync
   when the screen comes back. */
setInterval(tick, 100);
audio.addEventListener('timeupdate', tick);
document.addEventListener('visibilitychange', tick);

/* ------------------------------------------------------------- controls */

function start() {
  audio.currentTime = 0;
  const played = audio.play();
  if (played && played.catch) {
    played.catch(() => {
      // Autoplay refused (rare after a tap) — leave the button up to retry.
      startBtn.classList.remove('is-hidden');
    });
  }
  startBtn.classList.add('is-hidden');
}

startBtn.addEventListener('click', start);

replayBtn.addEventListener('click', () => {
  tracks.rings.index = -1;
  tracks.other.index = -1;
  themeIndex = -1;
  startBtn.classList.add('is-hidden');
  audio.currentTime = 0;
  audio.play();
});

audio.addEventListener('ended', () => {
  replayBtn.classList.add('is-shown');
});

// Keyboard: space toggles, for convenience while watching on a laptop.
document.addEventListener('keydown', (e) => {
  if (e.code !== 'Space') return;
  e.preventDefault();
  if (audio.paused) { audio.currentTime === 0 ? start() : audio.play(); }
  else audio.pause();
});

applyTheme(0);
tick();

// Exposed for verification during development.
window.__show = { tracks, TIMING, SONG_DURATION, THEMES, phase: () => phase };
