# KANEMORI — original score

Lightweight game music for the Apex Team's stylized 3D three.js prototype.
All cues are original custom synthesis (Python / NumPy / SciPy, no sampled libraries,
no paid services). Encoded as OGG Vorbis, 48 kHz stereo, nominally 96 kbps.
Peaks are limited to ≤ −1 dBFS (4×-oversampled true-peak estimate).

Recurring temple-bell motif: four notes, scale-degree pattern 8–5–♭6–1 (a descending perfect fourth, a minor second up — the cracked-bell colour — then down to the tonic). In A: A5–E5–F5–A4. In D: D5–A4–B♭4–D4. In G: G5–D5–E♭5–G4. The ♭6 is kept even against yo-scale day music so the bell always sounds slightly foreign, like the shattered Kanemura bell staining the mountain. Bells are additive with inharmonic partial ratios 0.56, 0.92, 1.19, 1.71, 2.00, 2.74, 3.00 (plus a high 4.07 air partial) and long, partial-dependent decays.

Looping cues are an exact whole number of bars long. Reverb and delay tails were
applied circularly (FFT circular convolution, plus circular placement of any strike
whose decay crosses the wrap) so each file can loop from sample 0 to the last sample.
Stingers are one-shots and should be played through, not looped.

## Files

| File | Role | BPM | Key / scale | Duration | Samples | Loops | Loop end (samples) |
|---|---|---|---|---|---|---|---|
| `forest_explore.ogg` | Forest exploration (calm cedar air, koto, shakuhachi) | 64 (20 bars of 4/4) | D yo (D E G A C) | 75.000 s | 3600000 | yes, 0–end | 3600000 |
| `village_day.ogg` | Village / hub (warm shamisen, koto, gentle percussion) | 75 (20 bars of 4/4) | G yo (G A C D F) | 64.000 s | 3072000 | yes, 0–end | 3072000 |
| `night_ambient.ogg` | Night (eerie, sparse detuned bells, low drones) | 40 (12 bars of 4/4) | A hirajoshi / in (A Bb D E F) | 72.000 s | 3456000 | yes, 0–end | 3456000 |
| `combat.ogg` | Combat (driving taiko, in-scale tension) | 120 (32 bars of 4/4) | D in / hirajoshi (D Eb G A Bb) | 64.000 s | 3072000 | yes, 0–end | 3072000 |
| `boss_jorogumo.ogg` | Boss: Jorōgumo (heavier, spidery pizzicato, distorted bell) | 90 (24 bars of 4/4) | D in / hirajoshi (D Eb G A Bb) + Ab chromatic | 64.000 s | 3072000 | yes, 0–end | 3072000 |
| `title_theme.ogg` | Title theme (clearest motif statement, majestic / mysterious) | 60 (16 bars of 4/4) | A hirajoshi / in (A Bb D E F) | 64.000 s | 3072000 | yes, 0–end | 3072000 |
| `storm_ambience.ogg` | Storm ambience (rain, wind, thunder; distant bell) | — | atonal / distant A (muffled motif) | 64.000 s | 3072000 | yes, 0–end | 3072000 |
| `bell_ring.ogg` | Stinger: temple bell ring + motif | — | A hirajoshi (A E F A motif after A2 strike) | 12.100 s | 580799 | no (one-shot) | — |
| `level_up.ogg` | Stinger: level-up | — | A hirajoshi (rising A E F A + A5) | 5.600 s | 268799 | no (one-shot) | — |
| `shard_get.ogg` | Stinger: shard / kakera collected | — | A (bell-fragment sparkle + A–E motif head) | 4.000 s | 191999 | no (one-shot) | — |

All looping files are 48 kHz stereo OGG Vorbis at 96 kbps and well under the 1.5 MB cap. Decoded loop lengths match the bar-accurate sample counts exactly.

## Motif placement (by cue)

- **forest_explore.ogg**: tonic D4. Notes D5–A4–Bb4–D4.
- **village_day.ogg**: tonic G4. Notes G5–D5–Eb5–G4.
- **night_ambient.ogg**: tonic A4. Notes A5–E5–F5–A4.
- **combat.ogg**: tonic D4. Notes D5–A4–Bb4–D4.
- **boss_jorogumo.ogg**: tonic D4. Notes D5–A4–Bb4–D4.
- **title_theme.ogg**: tonic A4. Notes A5–E5–F5–A4.
- **storm_ambience.ogg**: tonic A3 (muffled, distant). Notes A5–E5–F5–A4.
- **bell_ring.ogg**: tonic A4. Notes A5–E5–F5–A4.
- **level_up.ogg**: tonic A3→A4. Rising form of the motif: A3–E4–F4–A4, then a bright A5.
- **shard_get.ogg**: tonic A5. Bell-fragment sparkle on A5 plus a short A5–E5 motif head (not the full four-note phrase).

## Technical notes

- Forest and village sit in yo scales (no semitones) for open, daylight colour;
  night, title, combat and the Jorōgumo theme sit in in / hirajoshi (1, ♭2, 4, 5, ♭6).
  The boss drone also leans on an Ab against D — a tritone — as a chromatic “poison” tone.
- Storm ambience is noise synthesis (rain bed + droplets, wind, thunder rumble) with a
  muffled, distant statement of the motif, as if the cracked bell were ringing in the typhoon.
- `work/render.py` is the renderer. Re-run it to regenerate the OGGs.
- These measurements were taken on the encoded OGGs; the files have not been auditioned by ear.

Generated for KANEMORI / Apex Team. Loop from 0 to end on every looping cue.
