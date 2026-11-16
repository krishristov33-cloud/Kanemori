# KANEMORI v0.4 — build notes (Lumen)

Built from v0.3 (backup: `backups/index_v03_pre_v04.html`, sources in `backups/src_v03/`). `index.html` is concatenated from `src/` by `./build.sh`. New sections: **p12** (movement feel, weight, foot IK, hat), **p13** (combat), **p14** (environment). Green steps: `index_v04_step1.html`, `index_v04_step2.html` (final).

## 1. Hat
A jingasa (wide conical straw hat) sits on Ren's `socket_head` in `ren.glb`. It is a lathe-turned cone with a painted straw-weave texture, a dark underside, a lacquer rim, a headband, a top knob with a gold crest ring, and two string ties knotted under the chin. It is tilted slightly forward and to the side. It is parented to the head bone, so it follows every animation, including combat, riding and swimming, and it also shows on the afterimages.

## 2. Fireflies
The old `PointsMaterial` had no sprite, which is why the fireflies rendered as big square "boxes". They are now 1,100 world fireflies plus a local swarm of 320 that wraps around the camera. Each one is a tiny soft round glow point (core plus halo, additive) drawn by a GPU shader:
- They wander on summed-sine noise paths, bob, and blink in and out on their own.
- They cluster along the river banks (42%) and Taki Pool (10%), with the rest in meadows and grass (28%) and on the forest floor.
- They fade with distance and fade in at night. The CPU does no per-frame work.

## 3. Jitter + stiffness (root causes and fixes)
Several causes stacked:
1. **The v0.2 procedural pose layer (`KMF.hero`) still ran on top of Aether's rigged Ren.** It added a second lean, squash-and-stretch on a skinned mesh, and a **22 Hz cold shiver noise** on the whole body. When disabled while the rig is active, the module's bell, sparks and afterimage effects are kept.
2. **Downhill fall-and-snap.** On a downhill slope, gravity pulled Ren below his stride height and the ground check snapped him back each frame. On a 3 s downhill sprint, v0.3 produced **94 vertical-velocity sawtooth flips**; v0.4 produces **0**. The fix is a ground stick (`v4Ground`).
3. **The camera chased with a frame-rate dependent `lerp(dt*12)`** and white-noise shake. It now uses a critically damped spring pivot with a rigid offset, a smooth trauma-based shake, and spring-smoothed collision lift. Camera jerk on the test run is 0.003 RMS.
4. **The shadow map swam** because the sun followed Ren every frame. It is now snapped to the shadow texel grid.
5. **Movement curves.** Acceleration curves give a quick start and a slower approach to top speed. The turn rate is high at low speed and lower at sprint, and velocity rotates along an arc instead of lerping through zero. A hard reversal now brakes first. Stopping decelerates over **about 0.13 s** (v0.3 took 0.37 s, from an exponential tail), and Aether's `run_stop`/`sprint_stop` clip plays at 1.35×. Facing follows the velocity arc, and visual Y is spring-smoothed.

## 4. Weight + terrain
- Aether's additive poses (`lean_fwd/back/left/right` and `weight_shift_L/R` against `additive_ref`) are driven by forward acceleration, turn rate × speed, uphill grade and stride phase. Weight also shifts slowly while idle.
- The whole body tilts slightly to the ground slope through an under-damped spring, so it settles after stops.
- **Foot IK:** each foot gets a terrain-height lookup. The pelvis drops to the lower foot, and a two-bone IK (`twoBoneIK` from locomotion.js) lifts the higher foot. It is weighted down while running.
- Uphill is up to 38% slower and downhill up to 12% faster.

## 5. Combat
Aether's **motion/v04/ren.glb** (66 clips) replaces the v03 Ren when it is present, and **clips.json** drives the hit and cancel windows and the root motion. The v03 clips plus a procedural spin are the fallback.
- **Light chain:** katana a → b → c → d (horizontal, kesa, rising, thrust). The bokken uses b-a-c, and the yari uses d-a-d, which is thrust-heavy with a longer lunge. Each weapon has its own rhythm through time scales: katana 1.22, bokken 1.08, yari 1.0.
- **Branches:**
  - H alone: **Overhead slam** (finisher_2, ground impact).
  - L→H: **Rising cut** (launch/stagger).
  - L,L→H: **Whirlwind** (finisher_1, 360°, two hits).
  - L,L,L→H: **Heaven splitter** (slam with a 3.4 m shockwave).
- **Air:** an attack in the air is `jump_attack` with a brief hang. Heavy, high or a second air attack becomes `plunge_attack`, which dives at 26 m/s, freezes the clip until ground contact, then lines up `impact` for an AoE ring, dust, shake and hit-stop.
- **Sprint attack:** LMB after more than 0.2 s of sprinting gives `sprint_attack`, a lunge of about 2.6 m that keeps momentum, with afterimages.
- **Charge:** hold LMB for more than 0.3 s to play `charge_windup` (loop) with blade glow sprites and gathering sparks. Level 1 comes at 0.42 s and level 2 at 1.0 s, each with a chime, and level 2 adds a ring. On release, `charge_release` is a dash strike. Distance follows the 11 m/s root curve ×1.6 (×2.4 at level 2) with damage ×2 (×3.2). It has i-frames from Aether's window and hits everything along the path once. It leaves a hot gold ribbon trail and **afterimages**: 7 pooled clones of Ren, posed from the live skeleton, that fade over 0.34 s.
- **Weapon trails:** every swing draws a ribbon mesh from the katana socket (blade base to tip, sub-sampled so fast swings stay smooth). Each one is tinted per weapon and visible around each hit window.
- **Feel:** hit-stop and camera shake are set per move. An input buffer of 0.4 s is consumed at each move's cancel window. A dodge can cancel after the hit frame, and movement can cancel during recovery.
- **Root motion:** Ren moves by the clips' `rootSpeed.knots` × time scale, so planted feet don't slide. Lunges stop short of enemies and refuse cliffs; the check uses an H() raycast on slope rise, per Aether's flat-ground caveat. The clips are not added to `TWO_HANDED`, because the hand is already baked onto the handle.

## 6. Environment
- **Heightmap:**
  - Ridged highlands.
  - Terraced cliff bands that get a rock material.
  - Erosion gullies and micro relief.
  - All of it is kept calm around the village and the path.
  - The mesh is now 240² cells (indexed and smooth-shaded; it was flat-shaded 170²).
- **Splat material:** painted canvas textures for grass detail (two scales plus a macro anti-tiling layer), dirt path, riverbank pebbles, **tri-planar rock** on slopes with moss in the forest, and snow by height. A procedural detail normal map is added.
- **Sky:** a sun disc with a glow halo, a moon disc and twinkling stars at night, and painterly cloud bands.
- **Lights:**
  - Time-of-day palettes: golden low sun, warm-white noon, blue moon.
  - The hemisphere sky and ground colours shift with day, dusk and night.
  - A stronger key light with a softer fill.
  - Tighter soft shadows (±34 m) that are texel-snapped.
- **Fog:** height fog through a global fog chunk patch, so valleys gather mist and the peaks stay clear.
- **God rays:** soft additive light shafts between the cedars, aligned to the sun. They are strongest at a low sun.
- **Post:** bloom retuned, with split-tone grading (cool shadows, warm highlights).
- Auto-quality is unchanged and still works.

## Tests (headless Chromium, SwiftShader)
- `test.py` (core loop: craft, storm, combat, bow/wall/hut/shrine/swim, boss): **0 errors**.
- `t_v03.py` (rigs and riding): 0 errors; the v04 Ren loads with 66 clips.
- `t_village.py` (village, dialogue, trade, ranged, audio): **0 errors**.
- `t_v04.py` (new; it also takes the screenshots with `shots`): v04 loaded, hat on `socket_head`, additive poses bound, fireflies on the shader, jitter metrics, every combo branch, sprint, air, plunge and charge: **0 errors**.

## Known issues / next
- The charge dash and finisher_2 slam assume flat ground; on steep slopes the lunge is refused rather than adapted.
- Foot IK uses the analytic height H(). Where the 1.75 m terrain triangles differ from H by a few cm, feet can sink or float slightly.
- Afterimages show Ren's full silhouette, including the hat, in a single tint. There is no per-part fade.
- The procedural fallback weapons (bokken, yari) still use the v0.3 hand socket orientation, so their trails follow that.
- God rays and the heavier terrain shader have no extra auto-quality tier. The existing FX-off and shadows-off steps still apply.
- Terrain heights changed, so old v0.3 saves load at the same x/z but on new ground.
