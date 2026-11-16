# KANEMORI: Ren combat clips v0.4

Aether, 2026-11-16. Procedural, no generated media. Skeleton, bone names and rest pose are **identical to `motion/v03/ren.glb`**, so clips retarget by name with no remapping. v03 files are untouched and still work.

## Files (`motion/v04/`)
| file | what |
|---|---|
| `ren_combat.glb` | clips only: bone hierarchy plus the 20 v0.4 clips, no mesh (0.9 MB). Play on any v03 Ren instance. |
| `ren.glb` | full Ren (mesh, props, sockets) with all 46 v03 clips plus the 20 v0.4 clips (66 total). Drop-in replacement for v03 `ren.glb`. |
| `clips.json` | per clip: `duration`, `hit` [start,end], `cancel` [start,end], `events`, `rootSpeed` {start, peak, end, distance, `knots` [[t,v]], sampled `profile`}, `twoHanded`, `plane`, `check` (IK error, foot slide). |
| `preview.html` | contact sheet. Mesh from v03, clips from v04 (proves retarget). Last cell per row shows the blade-tip path, gold inside the hit window. `?only=a,b&cw=300&rh=330` |
| `combat_sheet.png` | screenshot of the preview |
| `tools/` | `combat.mjs` (clips), `build.mjs`, `slidecheck.mjs`, `shot.py`; rigkit and humans are copied from v03 and extended |

```js
const combat = await loader.loadAsync('motion/v04/ren_combat.glb');
const clip = THREE.AnimationClip.findByName(combat.animations, 'katana_light_c');
renAnimator.mixer.clipAction(clip).play();               // v03 Ren mesh, same bone names
const meta = clips.combat['katana_light_c'];            // hit/cancel windows, root speed
```

## Clips
All times are in seconds; root speed is +Z forward in root space.
| clip | dur | hit | cancel | events | root m/s (start→peak→end, dist) | 2H | plane |
|---|---|---|---|---|---|---|---|
| `katana_light_a` | 0.62 | 0.17–0.28 | 0.38–0.62 | hit 0.17 | 0→1.82→0, 0.22 m | yes | horizontal |
| `katana_light_b` | 0.66 | 0.2–0.3 | 0.42–0.66 | hit 0.2 | 0→1.44→0, 0.18 m | yes | diagonal_down |
| `katana_light_c` | 0.68 | 0.19–0.3 | 0.43–0.68 | hit 0.19 | 0→1.5→0, 0.15 m | yes | rising |
| `katana_light_d` | 0.64 | 0.2–0.33 | 0.42–0.64 | hit 0.2 | 0→2.13→0, 0.216 m | yes | thrust |
| `katana_heavy_finisher_1` | 1.3 | 0.34–0.86 | 1.05–1.3 | hit 0.36, hit2 0.7, armor 0.12, whoosh 0.34 | 0→0→0, 0 m | yes | horizontal_spin |
| `katana_heavy_finisher_2` | 1.45 | 0.46–0.57 | 1.1–1.45 | hit 0.48, impact 0.55, armor 0.1, camShake 0.55 | 0→2.78→0, 0.34 m | yes | vertical_down |
| `jump_attack` | 0.62 | 0.14–0.27 | 0.4–0.62 | hit 0.15 | 2→2→2, 1.24 m | yes | diagonal_down_air |
| `plunge_attack` | 1.15 | 0.22–0.34 | 0.8–1.15 | hit 0.24, impact 0.3, camShake 0.3 | 0→0→0, 0 m | yes | plunge_down |
| `sprint_attack` | 0.86 | 0.27–0.4 | 0.55–0.86 | hit 0.28, footL 0.4, footR 0.2 | 7→7→0, 2.11 m | no | horizontal_lunge |
| `charge_windup` | 1.2 loop | — | — | — | 0→0→0, 0 m | yes | — |
| `charge_release` | 0.95 | 0.18–0.3 | 0.62–0.95 | hit 0.2, dashStart 0.08, dashEnd 0.3, iframeStart 0.08, iframeEnd 0.24 | 0→11→0, 2.2 m | yes | horizontal_dash |
| `run_stop` | 0.7 | — | 0.3–0.7 | brake 0, footR 0.2 | 4.5→4.5→0, 0.3886 m | no | — |
| `sprint_stop` | 0.95 | — | 0.45–0.95 | brake 0, footR 0.15 | 7→7→0, 0.84 m | no | — |
**Light chain:** `katana_light_a`–`d` all start and end in the same chudan guard, with the left foot leading, so they chain in **any order**. Cross-fade about 0.08 s from the cancel window into the next clip's start. The planes are horizontal R→L, diagonal down (kesa), rising (kiriage) and thrust (tsuki).

**Finishers:**
- `katana_heavy_finisher_1` is a full 360° pivot on the planted left foot; the right foot orbits.
- `katana_heavy_finisher_2` is an overhead slam with a lunge step. The tip strikes the ground at `impact` 0.55, then a heavy recovery.

**Air attacks:**
- `jump_attack` assumes the character is airborne; the game owns vertical motion. It ends in a pose that blends into v03 `fall`/`land`.
- `plunge_attack` holds the blade reversed and drives it down. The game should play it while falling and line up `impact` (0.30) with ground contact; it then pulls the blade out and recovers to guard.

**Motion attacks:**
- `sprint_attack` starts from the v03 sprint phase 0 and carries momentum: 7 m/s held, then decaying over two steps. It's a one-handed cut with the left arm flung out for balance.
- `charge_windup` is a loop: a low rear coil with the blade trembling. The tremble frequencies are whole multiples of the loop length, so the loop is seamless.
- `charge_release` is an 11 m/s dash strike covering 2.2 m, with i-frames from 0.08 to 0.24.

**Stops:**
- `run_stop` starts from v03 `run` phase 0 (left heel contact). The left foot brakes and stays planted while the root decelerates to 0 in 0.17 s. The right foot sets down at 0.2, then the weight shifts and settles to STAND.
- `sprint_stop` is a two-plant brake from `sprint` phase 0: the right foot lands ahead at 0.15 as the main brake, and the left steps up at 0.44.

**Additive poses:** `lean_fwd`, `lean_back`, `lean_left`, `lean_right`, `weight_shift_L` and `weight_shift_R`, plus the reference pose `additive_ref` (STAND). Use them like this:
```js
THREE.AnimationUtils.makeClipAdditive(lean, 0, additiveRef); mixer.clipAction(lean).setEffectiveWeight(k).play();
```

## How it moves
- **Arcs:** hands are driven by arm IK along spherical arcs around the chest, so swings curve instead of travelling in straight lines. Blade orientation is authored separately (pitch, yaw, roll), with the edge leading the cut.
- **Overlap:** joints break in succession. The hips lead the hand azimuth by 40 ms, the spine is on time, and the blade lags 30 ms then snaps through. Every swing has an anticipation hold, a fast `oo` strike, an `o` follow-through, and a settle back to guard.
- **Weight:** the hips drop and move into the strike, and step feet drag in afterwards.
- **Scarf and hair:** these come from the v03 pendulum and spring simulation, driven by body motion *including* root speed, so they trail dashes and whip on spins.
- **Two hands:** the left hand is IK-locked to the grip, 11.5 cm below the right, in every clip with `twoHanded: true`. The grip is clamped into both arms' reach every frame.
- **Planted feet:** feet are authored in world space and counter-moved against the integrated `rootSpeed` profile. If the game moves the root by `rootSpeed` (use `knots`, which are piecewise linear), planted feet do not slide.
- **Hips height:** the hips are soft-clamped to the planted legs' reach, as in the v03 gait generator.

## Integration notes
- **Root motion:** none is baked. Move the root by `rootSpeed.knots` (or `distance` with the profile shape). At `end: 0` the clip finishes standing in guard.
- **Hit and cancel windows:** `hit` is when the blade sweeps the target volume. `cancel` is when the next attack, a dodge or movement may interrupt; the heavies use late windows and `armor` events.
- **Left-hand IK:** the hand is already baked onto the handle. To keep the v03 runtime left-hand IK active on the new clips, add the names with `twoHanded: true` to `TWO_HANDED` in `locomotion.js`. It is not needed for correctness.
- **Katana:** these clips assume the katana is in `socket_hand_R` with identity transform (`anim.attach('katana','socket_hand_R')`).

## Verification
- **Headless Chromium (SwiftShader):** `preview.html` loads the v03 mesh with the v04 clips, and the full `ren.glb` (66 clips). **0 console errors or warnings.**
- **Bake check:** foot IK error is 0, arm IK error is 0, and foot slide is 0 at every frame on all 20 clips.
- **Independent GLB check** (`tools/slidecheck.mjs`): mixer sampling at 120 Hz on v03 `ren.glb`, with root moved by `knots`. Planted-foot drift: `run_stop` 0.0000 m, `sprint_stop` 0.0002 m, `charge_windup` 0, `heavy_finisher_2` 1 mm, light attacks ≤ 5 mm between 60 fps keys. The stops are baked at 120 fps, everything else at 60 fps.

## Known issues
- Blade-to-enemy and blade-to-ground collisions are not solved. The `finisher_2` tip reaches the ground plane at 0.55, but on slopes the game should raycast.
- In the `finisher_1` spin the hips stay over the left foot without leaning into the turn, which reads well from gameplay distance but is stiff up close.
- `sprint_attack` and `charge_release` assume flat ground over about 2.1–2.2 m.
- `plunge_attack` pre-impact legs are FK; if the fall is shorter than 0.3 s, start the clip later (scrub to `impact - fallTime`).
- The scabbard stays on the hip and has no draw animation; the katana must already be in hand.
