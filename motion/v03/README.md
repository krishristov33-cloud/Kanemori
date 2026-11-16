# KANEMORI · Character Rig v0.3.1 (Aether)

Drop-in animated characters for Lumen's three.js build: a real skinned **Ren**, a **villager** with work loops, a **horse** with four gaits, a **cart**, and `locomotion.js`, which drives them. Everything is generated procedurally in code (no image or video services), so the source in `tools/` can rebuild every GLB in under a second.

Style: stylized mid-poly, soft toon (vertex colours + `MeshToonMaterial`), modern-mythic Japan, gold kintsugi accents. There is **no Japanese text** in any asset, node name, or demo UI.

## Files

| File | What |
|---|---|
| `ren.glb` | Ren: skinned mesh, 32-bone humanoid, 46 clips, plus attachables `katana`, `saya`, `bow`, and the hidden props `fishing_rod`, `kunai` and `hand_cannon` (all on `socket_hand_R`). |
| `villager.glb` | Same skeleton with different proportions (shorter, rounder, robe + apron). 21 clips. Hats: `hat_kasa` (shown), `hat_band` (hidden). Hidden props: `prop_hammer`, `prop_broom`, `prop_spear` (hand), `prop_crate`, `prop_bowl` (carry socket). |
| `horse.glb` | Stylized horse, 23-bone quadruped rig, 5 clips, `saddle` on `socket_saddle`. |
| `cart.glb` | Static cart with a driver's bench, `wheel_L` / `wheel_R` nodes (radius 0.46 m), and the empties `socket_hitch` and `socket_seat`. |
| `locomotion.js` | `CharacterAnimator`, `HorseAnimator`, `mountRider`, `CartHitch`, `twoBoneIK`, `toonify`, `filterClip`, `ROOT_MOTION`, `LOCO_SPEED`, `HORSE_SPEED`, `TWO_HANDED`. ES module, imports `three` (r160+, tested with 0.164.1). |
| `demo.html` | Playable test scene. `?auto=1` runs the scripted capture; `?shot=all` gives the wide shot. |
| `preview.html` | Contact-sheet viewer: `preview.html?f=ren.glb&clip=run&view=side&n=8`. |
| `clips.json` | Machine-readable clip list: durations, loop flags, authored speeds, events. The same data is embedded in each GLB at `scene.userData.kanemori.clips`. |
| `demo_ren.png`, `demo_all.png`, `demo_motion.mp4` (v0.3) and `demo_ride.png`, `demo_village.png`, `demo_motion_v031.mp4` (v0.3.1) | Headless captures. |
| `tools/` | Generator (`build.mjs`, `rigkit.mjs`, `humans.mjs`, `horse.mjs`) and the capture scripts. Run `node tools/build.mjs`. |

```bash
cd motion/v03 && python3 -m http.server 8080
# http://localhost:8080/demo.html
```

Demo controls (v0.3.1 additions): M mounts or dismounts the horse (stand within 4 m; then WASD rides, C toggles walk, the default is trot, Shift gallops). N drives the cart. While R is held, moving the mouse up or down aims the bow from −45° to +60°. 1 throws a kunai, 2 fires a quick shot, 3 fires the hand cannon, 4 gives a command, 5 greets with a bow, 6 gives an item, 7/8/9 toggle sit, sleep and pray, 0 turns 180°, and I toggles left-hand IK. Extra URL modes: `?auto=2` (riding and aim capture), `?shot=ride`, `?shot=village`, `?shot=block`.

Original controls: WASD move (camera-relative), Shift sprint, C toggles walk, drag/wheel for the camera. J is the light combo (1→2→3 inside the combo window), K heavy, L parry, hold Q to block, Space to dodge roll, F to jump. Hold R to draw the bow (it works while walking, on the upper-body layer) and release to shoot. G gathers, U fishes, Y toggles cooking, V toggles shivering, T talks, B toggles swimming, H plays a hit, X dies or rises.

## Skeleton (humans)

`root › hips › spine › spine2 › neck › head › hair` · `spine2 › scarf1 › scarf2 › scarf3` · `spine2 › shoulder_L/R › upperArm › lowerArm › hand` · `hips › upperLeg_L/R › lowerLeg › foot › toe`

Sockets have no skin weights: `socket_hand_R` (weapon, blade along local +Z), `socket_hand_L` (bow), `socket_back` (bow across the back), `socket_hip_L` (sheathed katana angle), `socket_carry` (crate in front of the chest) and `socket_head` (hats).

Y-up, the character faces +Z, units are metres. Ren is about 1.8 m tall and the villager about 1.65 m. All bones have identity rest rotation, so additive tweaks are simple Euler offsets. On local axes, +X pitches forward for the spine and head, +X swings a hanging limb backward, and +Y turns left.

Weights are smooth: each vertex blends up to 4 bones by segment distance, limited per body part so arms never pull the torso.

## Motion design notes

- **Locomotion is IK-authored.** Feet follow exact stance paths: heel strike, a flat plant, then heel-off rolling over the toe. The legs are solved with 2-bone IK, and the hips drop smoothly whenever a planted foot would over-reach. **At the authored speed the planted foot has zero IK error, so there is no foot sliding.** Phase 0 is left heel contact in every cycle, so walk, run and sprint blend phase-matched.
- **Authored ground speeds:** walk **1.4 m/s**, run **4.5 m/s**, sprint **7.0 m/s**, swim **1.6 m/s**. Villager: walk **1.1 m/s**, carry **1.0 m/s**. Horse: walk **1.4**, trot **3.2**, gallop **8.0 m/s**. Between those speeds the animator blends neighbouring cycles and interpolates cadence. Above sprint (the game's 9 m/s) it raises cadence by v/7.0, which gives about 1.3× at 9 m/s with slight stretch.
- **Overlap and follow-through are simulated, then baked.** The scarf is a 3-link pendulum driven by the chest's real acceleration plus air drag at the clip's travel speed. The hair tuft and the horse tail are damped springs. So the scarf streams back on a sprint, whips around in the roll, and settles in idle.
- **Attacks:** the light attacks have a **0.06 s anticipation**, then a fast ease-out strike and a long settle. The heavy has a **0.15 s wind-up**, a held tension beat until 0.30 s, then the strike. Hit events land just after the fastest frames.
- Clips are baked at 30 fps; `shiver` and `fear_cower` use 60 fps for the tremble. They are stored as quaternion tracks, plus `hips.position` (the horse uses `spine.position`).

## Clip list

### Ren (`ren.glb`, 4134 tris, 46 clips)

| Clip | Duration (s) | Loop | Authored speed (m/s) | Events (s) |
|---|---|---|---|---|
| `idle` | 3.2 | yes | 0 | – |
| `walk` | 1 | yes | 1.4 | footL 0, footR 0.5 |
| `run` | 0.68 | yes | 4.5 | footL 0, footR 0.34 |
| `sprint` | 0.58 | yes | 7 | footL 0, footR 0.29 |
| `start` | 0.36 | no | – | – |
| `stop` | 0.6 | no | – | – |
| `turn_L` | 0.7 | no | – | yaw 90 |
| `turn_R` | 0.7 | no | – | yaw -90 |
| `jump_up` | 0.4 | no | – | takeoff 0.2 |
| `fall` | 0.8 | yes | – | – |
| `land` | 0.5 | no | – | impact 0.06 |
| `dodge_roll` | 0.7 | no | – | iframeStart 0.05, iframeEnd 0.45 |
| `katana_light_1` | 0.55 | no | – | hit 0.12, comboWindow 0.3 |
| `katana_light_2` | 0.58 | no | – | hit 0.13, comboWindow 0.34 |
| `katana_light_3` | 0.8 | no | – | hit 0.14, comboWindow 0.5 |
| `katana_heavy` | 1.05 | no | – | hit 0.37, armor 0.1 |
| `block` | 1 | yes | – | – |
| `parry` | 0.45 | no | – | parryStart 0.03, parryEnd 0.18 |
| `hit_react` | 0.5 | no | – | stagger 0.07 |
| `death` | 1.8 | no | – | ground 1.2 |
| `bow_draw` | 0.75 | no | – | drawn 0.62 |
| `bow_hold` | 1.2 | yes | – | – |
| `bow_release` | 0.55 | no | – | release 0.02 |
| `swim` | 1.3 | yes | 1.6 | – |
| `gather` | 1.3 | no | – | pick 0.46 |
| `cook` | 2.4 | yes | – | – |
| `fish_cast` | 1.5 | no | – | cast 0.55 |
| `shiver` | 1.6 | yes | – | – |
| `talk_gesture` | 2.6 | yes | – | – |
| `bow_greet` | 1.8 | no | – | bowed 0.5 |
| `give_item` | 1.4 | no | – | give 0.55 |
| `pray` | 3 | yes | – | – |
| `sleep` | 4 | yes | – | – |
| `command_gesture` | 1.3 | no | – | command 0.42 |
| `sit_rest` | 3 | yes | – | – |
| `turn_180` | 1 | no | – | yaw 180 |
| `bow_quick` | 0.5 | no | – | release 0.2 |
| `kunai_throw` | 0.6 | no | – | release 0.22 |
| `hand_cannon_fire` | 1.3 | no | – | fire 0.45 |
| `ride_idle` | 3 | yes | 0 | – |
| `ride_walk` | 0.9 | yes | 1.4 | – |
| `ride_trot` | 0.56 | yes | 3.2 | – |
| `ride_gallop` | 0.42 | yes | 8 | – |
| `mount` | 1.2 | no | – | seated 1.2 |
| `dismount` | 1.2 | no | – | grounded 1.2 |
| `cart_drive` | 1.2 | yes | – | – |

### Villager (`villager.glb`, 3482 tris, 21 clips)

| Clip | Duration (s) | Loop | Authored speed (m/s) | Events (s) |
|---|---|---|---|---|
| `idle` | 3.2 | yes | 0 | – |
| `walk` | 0.8 | yes | 1.1 | footL 0, footR 0.4 |
| `talk_gesture` | 2.6 | yes | – | – |
| `wave` | 1.6 | yes | – | – |
| `hammer_work` | 1 | yes | – | impact 0.22 |
| `sweep` | 1.6 | yes | – | – |
| `carry` | 1 | yes | 1 | footL 0, footR 0.5 |
| `sit` | 2 | yes | – | – |
| `fear_cower` | 1.2 | yes | – | – |
| `bow_greet` | 1.8 | no | – | bowed 0.5 |
| `give_item` | 1.4 | no | – | give 0.55 |
| `pray` | 3 | yes | – | – |
| `sleep` | 4 | yes | – | – |
| `cook_stir` | 2 | yes | – | – |
| `celebrate` | 1 | yes | – | – |
| `fight_ready` | 1.2 | yes | – | – |
| `spear_thrust` | 0.7 | no | – | hit 0.24 |
| `hit_react` | 0.5 | no | – | stagger 0.07 |
| `death` | 1.8 | no | – | ground 1.2 |
| `run` | 0.62 | yes | 3.5 | footL 0, footR 0.31 |
| `panic_run` | 0.6 | yes | 4 | footL 0, footR 0.3 |

### Horse (`horse.glb`, 3356 tris incl. saddle)

| Clip | Duration (s) | Loop | Authored speed (m/s) | Events (s) |
|---|---|---|---|---|
| `idle` | 3 | yes | 0 | – |
| `walk` | 0.9 | yes | 1.4 | – |
| `trot` | 0.56 | yes | 3.2 | – |
| `gallop` | 0.42 | yes | 8 | – |
| `rear` | 1.8 | no | – | landFront 1.55 |

`turn_L` / `turn_R` author the full 90° inside the clip (the hips end rotated). `CharacterAnimator` rotates the object by ±90° on the last frame, so the feet never slide. Event `yaw` is informational.

## locomotion.js API

```js
import { CharacterAnimator, HorseAnimator, toonify, ROOT_MOTION } from './motion/v03/locomotion.js';

const gltf = await new GLTFLoader().loadAsync('motion/v03/ren.glb');
toonify(gltf.scene);                       // MeshToonMaterial, keeps vertex colours and the kintsugi emissive
scene.add(gltf.scene);
const ren = new CharacterAnimator(gltf, { onFootstep: side => sfx.step(side) });
```

- `setMove(speedMps, yawRadians)`: the desired ground speed and facing. The animator smooths speed, turns with an angular-velocity limit (720°/s; 35% of that during an attack), banks the hips, spine and head into turns from yaw rate × speed, and pitches with acceleration. Standing turns over about 70° play `turn_L` / `turn_R`.
- `ren.speed`, `ren.yaw`: smoothed values. Move the root with these so the feet stay matched.
- **Start/stop** run automatically (`autoStartStop: true`): `start` plays when you go from standing to faster than 3 m/s, and `stop` (a foot plant) plays when you release from more than 3.2 m/s.
- `play(name, { layer, fade, fadeOut, loop, hold, timeScale, onEvent, onDone })` returns a layer handle (`.t`, `.name`, `.leave()`).
  - `layer: 'full'` (default) overrides the whole body and crossfades out of locomotion. A new full one-shot crossfades from the previous one, which is how combos chain.
  - `layer: 'upper'` overrides spine and up only, so **legs keep walking**. Use it for the bow: `play('bow_draw', {layer:'upper', hold:true})`, then `play('bow_release', {layer:'upper'})`.
  - `onEvent(name, layer)` fires on clip events (`hit`, `release`, `parryStart`, `parryEnd`, `iframeStart`, `takeoff`, `impact`, `pick`, `cast`, …).
  - `hold: true` freezes on the last frame until `stop()` (death, held draw). `loop: true` loops until `stop(layer, fade)`.
- `setSpeedScale(s)`: multiplies dt for everything, so `0` is hit-stop and `0.3` is perfect-dodge slow-mo. Alternatively pass the scaled dt from `TimeScale.update()` to `update()`.
- `attach('katana', 'socket_hand_R')` / `attach('katana', 'socket_hip_L')` draws and sheathes. `attach('bow', 'socket_hand_L' | 'socket_back')`. `show('fishing_rod', true)`.
- `oneShotRootSpeed()`: the suggested forward m/s for the current one-shot from `ROOT_MOTION` (dodge 5.0 for 0–0.55 s, light attacks a short step, heavy lunge, hit knockback −2). It returns `null` when nothing is playing.
- `HorseAnimator(gltf)`: `setMove(speed, yaw)` picks idle/walk/trot/gallop with hysteresis, crossfades phase-synced, banks into turns, and turns the neck toward the target yaw. `play('rear')`.

### Integration snippet for Lumen (replacing the primitive Ren)

```js
// boot
const [renG, horseG] = await Promise.all(['motion/v03/ren.glb', 'motion/v03/horse.glb'].map(f => loader.loadAsync(f)));
toonify(renG.scene); toonify(horseG.scene);
hero.add(renG.scene);                    // hero = your existing locomotion root (position from physics)
const anim = new CharacterAnimator(renG, { object: renG.scene, onFootstep: s => playStep(s, groundType) });
// keep HeroMotion (squash/lean) on a parent of renG.scene if you like; the two stack cleanly.

// per frame
const dt = time.update(rawDt);           // Aether's TimeScale: hit-stop gives dt = 0
anim.setMove(input.len > 0 ? (sprint ? 7.0 : walk ? 1.4 : 4.5) : 0, input.yaw);
anim.update(dt);
const os = anim.oneShotRootSpeed();
const fwd = os ?? anim.speed;            // drive the controller from the animator's smoothed speed
hero.position.addScaledVector(dirFromYaw(anim.yaw), fwd * dt);   // or feed fwd into your collision mover

// combat
function lightAttack() {
  anim.attach('katana', 'socket_hand_R');
  const cur = anim.current('full');
  const n = cur?.name.startsWith('katana_light') && cur.t >= anim.meta[cur.name].events.comboWindow ? (+cur.name.slice(-1) % 3) + 1 : 1;
  anim.play('katana_light_' + n, { fade: 0.05, onEvent: e => e === 'hit' && resolveHit(n) });
}
anim.play('parry', { onEvent: e => { if (e === 'parryStart') parryOpen = true; if (e === 'parryEnd') parryOpen = false; } });
anim.play('dodge_roll', { onEvent: e => { if (e === 'iframeStart') iframes = true; if (e === 'iframeEnd') iframes = false; } });
anim.play('bow_draw', { layer: 'upper', hold: true });            // while walking
anim.play('bow_release', { layer: 'upper', onEvent: e => e === 'release' && spawnArrow() });

// kintsugi tiers: the gold crack lines use the 'kintsugi' material
renG.scene.traverse(o => o.material && [].concat(o.material).forEach(m => { if (m.name === 'kintsugi') m.emissiveIntensity = 0.35 + shards * 0.25; }));

// horse + cart
const horse = new HorseAnimator(horseG); horse.setMove(speed, yaw); horse.update(dt);
// rider: parent renG.scene to horseG.scene.getObjectByName('socket_saddle') (no riding pose yet, see below)
```


## v0.3.1 additions

All v0.3 clip names and APIs are unchanged; everything here is additive.

**Riding.** `ride_idle`, `ride_walk` (0.9 s), `ride_trot` (0.56 s, posting on each diagonal beat) and `ride_gallop` (0.42 s, two-point seat leaning forward, counter-pitching against the horse's rock). Their durations equal the horse's gait cycles. The animator weights them by the horse's gait weights and samples them at `horse.phase`, so Ren's bob matches the saddle. `mount` / `dismount` (1.2 s) are authored in saddle space, from the horse's left side (+0.55 m), and `dismount` is the exact reverse of `mount`. `cart_drive` is a loop: seated on the bench, reins in hand, bouncing over the road.

```js
const ride = mountRider(renAnim, horseAnim, { onSeated: () => {} });   // parents Ren to socket_saddle, plays 'mount'
// each frame: horseAnim.setMove(speed, yaw); horseAnim.update(dt); renAnim.update(dt);  (move horseAnim.object yourself)
ride.dismount(() => {/* Ren is back in the horse's parent, standing at the left side */});
// upper-body layers still work while riding: renAnim.play('bow_quick', { layer: 'upper' })

const hitch = new CartHitch(cartGltf.scene, horseGltf.scene);           // rigid tow bar to the horse's rear hitch
// each frame after moving the horse: hitch.update();  (wheels spin from the distance actually travelled)
hitch.seat(renAnim);                                                    // Ren on the bench playing 'cart_drive'
```

**Bow aim pitch.** `renAnim.setAim(deg)` takes −45 (down) to +60 (up). It's additive: spine (40%) and spine2 (60%) rotate about the character's world-right axis while any bow clip (`bow_draw`, `bow_hold`, `bow_release`, `bow_quick`) plays on either layer. So arms, bow and arrow line all pitch together, on foot or on horseback. The aim eases toward the target, and the head counter-rotates slightly.

**Ranged clips.** `bow_quick` (short-bow snap shot, `release` 0.2 s, upper-layer friendly). `kunai_throw` (`release` 0.22 s; show `kunai` before playing and hide it on release). `hand_cannon_fire` (raise and aim, `fire` 0.45 s, a heavy 0.05 s recoil that rocks back about 14 cm, then recovery; show and hide the `hand_cannon` prop).

**Left-hand IK.** `renAnim.leftHandIK = true` is the default. While the katana is on `socket_hand_R` and a clip in `TWO_HANDED` (`katana_heavy`, `block`, `parry`; pass `twoHanded` in the options to change it) plays, a world-space two-bone IK puts the left wrist on the handle behind the right hand, with the elbow pole down and out. It blends in and out with the clip. `twoBoneIK(upper, lower, end, target, pole, weight)` is exported for other uses (e.g. hands on reins or a cart shaft).

**Turn 180.** `turn_180` (1.0 s, two steps). The animator plays it automatically for standing turns over about 145° and rotates the root by π on the last frame.

**Ren social and commands.** `command_gesture` (point forward, `command` 0.42 s, used for companion orders), `bow_greet`, `give_item` (`give` 0.55 s), `sit_rest`, `sleep`, `pray`.

**Villager daily life and companions** (matched to `data/npcs.json` roles and Krea's Living World doc):

| Use | Clips |
|---|---|
| Work slots (smith, herbalist, innkeeper, fishmonger, charcoal burner) | `hammer_work`, `sweep`, `carry`, `cook_stir` (with `prop_bowl`) |
| Greeting and trade | `bow_greet`, `give_item` (`give` event = the handoff), `talk_gesture`, `wave` |
| Shrine and evening | `pray`, `sit`, `sleep` (for the `home` schedule slot) |
| Festival and living events | `celebrate`, `fear_cower`, `panic_run` (4.0 m/s; tanuki raid, storm, boss nearby) |
| Recruited companions (hunts and raids) | `fight_ready` + `spear_thrust` (`hit` 0.24 s) with `prop_spear`, `hit_react`, `death`, `run` (3.5 m/s, phase-synced, footstep events) |

**Speeds vs Lumen's controller (run 5.5, sprint 8).** Run is authored at 4.5 m/s and sprint at 7.0. At 5.5 the animator blends run and sprint 60/40, phase-matched with cadence interpolated, so the blended authored speed equals 5.5 and the feet track. At 8 it plays sprint at 8/7 = 1.14× cadence. Expect slight foot stretch, which reads fine at that speed.

## Verification

- Headless Chromium (SwiftShader) through Playwright: `demo.html` (normal, `?auto=1`, `?auto=2`, `?shot=all`, `?shot=ride`, `?shot=village`, `?shot=block`) and `preview.html` gave **0 console errors, 0 warnings, 0 page errors**.
- IK reach error on planted feet: **0.000 m** for every locomotion clip (Ren walk/run/sprint, villager walk/carry/run/panic_run, horse walk/trot/gallop).
- Captures: `demo_ren.png` (close-up, light attack 1), `demo_all.png` (wide: Ren, both villagers, galloping horse, horse with cart), and `demo_motion.mp4` (8 s at 30 fps: idle → walk → run → running turn → stop → light 1-2-3 → dodge roll).

## Known issues and next steps

- Aim pitch is procedural (spine rotation), not authored aim_up / aim_down clips. At +60° the shoulders lean back visibly rather than the arms lifting independently.
- Mount and dismount are authored for idle saddle height (ground 1.56 m below the saddle socket). Mounting on a slope will float or clip the feet slightly; ground IK isn't implemented.
- `ride_*` clips don't steer the reins per turn. The horse's turn lean comes from `HorseAnimator`, and the rider inherits it.
- `CartHitch` is a rigid tow bar with no wheel collision or slope tilt. The cart horse has no harness mesh.
- Kunai and cannon only provide the prop and the event; the projectile, muzzle flash and smoke are the game's job.
- Fingers aren't rigged (hands are mitts). The villager uses Ren's skeleton names, so animations can be retargeted between them as-is.
