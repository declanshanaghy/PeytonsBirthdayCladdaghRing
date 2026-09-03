# Peyton's Birthday Claddagh Ring

A birthday slideshow for Peyton's 19th, and the photo log of the Claddagh ring
made for her — modelled on her great-grandfather's original.

**▶ [View the slideshow](https://declanshanaghy.github.io/PeytonsBirthdayCladdaghRing/)**

Two slideshows run side by side (stacked on a phone): the ring being made on the
left, memories of the year on the right, set to *Best To You*. It opens on a
title card, cycles through six birthday themes, and ends with the finished ring
exactly as the song does.

## Repo layout

| Path | What's in it |
|---|---|
| `index.html`, `styles.css`, `app.js` | The site |
| `photos-rings/` | Original ring build photos |
| `photos-other/` | Original memory photos |
| `music/` | Original audio |
| `web/` | Web-optimized copies the site actually loads |
| `scripts/optimize.sh` | Regenerates `web/` from the originals |

The originals are never touched. If you swap or add a photo, drop it in the
originals folder, add it to the relevant list at the top of `app.js`, then run
`./scripts/optimize.sh`.

## Editing the words

Everything readable lives in three arrays at the top of `app.js`:

- `RINGS` — each ring photo and its build-step label
- `MEMORIES` — each memory photo and its caption
- `THEMES` — the six birthday messages and their colour palettes

## Timing

The show is driven off `audio.currentTime`, not timers, so it cannot drift away
from the song even if the network stalls or the phone screen sleeps. The
constants are in `TIMING` in `app.js`; the song is 225.88s.

| Phase | Window |
|---|---|
| Title card | 0 – 9s |
| Slideshow | 9 – 210.9s (rings every 15.5s, memories every 10.1s) |
| Fade out | 208.9 – 210.9s |
| "Enjoy the last of your teens!" | 210.9 – 225.9s |

## The ring

Resin print → brass casting → magnetic tumbling → sanding → polish → nickel
electroplating → gold electroplating. The photos in `photos-rings/` are numbered
in the order the steps happened.
