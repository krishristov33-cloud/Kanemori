# Kanemori motion module

Drop-in **game-feel** layer for Lumen's three.js build of *KANEMORI 鐘守*. No bundler. Matches Aether's motion spec and Krea's design doc.

Style: mid-poly modern-mythic Japan — indigo, signal red, sodium orange, gold kintsugi.

## Files

| File | What |
|---|---|
| `kanemori-motion.js` | ES module. Import `three` as `three` (r160+). |
| `demo.html` | Self-contained test scene. Serve the folder; don't open as `file://`. |
| `README.md` | This file. |

```bash
python3 -m http.server 8080
# open http://localhost:8080/demo.html
```

Demo controls: WASD move, Shift sprint, Space dodge, J light, K heavy, L parry, B bell, 1/2/3 shard tier, N damage Jorōgumo, M cut an anchor, F lock-on, C cold, V wet, H low HP.

## Integration (copy-paste)

```js
import { FEEL, TimeScale, CameraFX, BellRing, HeroMotion, AfterImage, HitSpark, InkFlash, TellIndicator, JorogumoController } from './kanemori-motion.js';

const time = new TimeScale();
const cameraFX = new CameraFX(camera);
const bell = new BellRing({ renderer, scene, camera, timeScale: time });
const heroMotion = new HeroMotion(heroPose); // pose = child of the locomotion root
const afterimage = new AfterImage(scene);
const sparks = new HitSpark(scene);
const ink = new InkFlash(document.body);

function tick() {
  const rawDt = clock.getDelta();
  const dt = time.update(rawDt);          // 0 during hit-stop; 0.3× during a perfect dodge
  heroMotion.setVelocity(localX, localZ);
  heroMotion.update(dt);
  afterimage.update(dt);
  sparks.update(dt);
  joro.update(dt);
  bell.update(dt, rawDt);                 // rawDt lets the vignette show during the freeze
  // set the unshaken camera pose first, then:
  if (lockOn) cameraFX.lockOnFrame(camera, hero.position, target.position, targetRadius);
  cameraFX.apply(camera, rawDt);
  bell.render();                          // use this instead of renderer.render(scene, camera)
}
```

Or `installFeel({ renderer, scene, camera, heroPose })` to get `{ time, cameraFX, bell, hero, afterimage, sparks, ink }`.

**Hero setup:** keep walk yaw on the parent. Put the mesh under a pose child and hand that child to `HeroMotion` so lean / squash / sway don't fight locomotion.

## API

All tunables live on **`FEEL`**. Pass `{ feel }` to any constructor to override.

### `TimeScale`
- `hitStop(frames)` — freeze scaled dt for N frames at `FEEL.time.frameRate` (light 2, heavy 4, boss stagger 6, bell 3).
- `slowMo(scale, seconds)` — perfect dodge is `slowMo(0.3, 0.5)` or `perfectDodge()`.
- `update(rawDt) → scaledDt`

### `CameraFX`
- `shake('light' | 'heavy' | 'parry' | number)` — trauma-based, decay on `apply`.
- `fovKick(degrees)`
- `lockOnFrame(camera, heroPos, targetPos, targetSize, tightness)` — pulls back with target size, frames both bodies.
- `apply(camera, dt)` — call **after** the game sets the unshaken pose each frame.

### `BellRing` (signature)
Full-screen ripple post-pass (WebGL2) plus a world-space expanding ring, a CSS vignette, a 2–3 frame freeze, and a synthesized low bell (additive sine partials, no audio files).
- `ring({ position, intensity, tone, freeze, timeScale })`
- `parryRing({ position, timeScale })` — smaller tone, no full ripple.
- `playTone(intensity, hz)`
- `update(scaledDt, rawDt)` then `render()` instead of `renderer.render(...)`.
- Falls back to ring + vignette if the post-pass can't init.

### `HeroMotion(pose)`
- `setShardCount(0..8)` or `setShardTier(0|1|2)` — scrappy → tight → calm. Changes `recoveryMul` and idle sway.
- `setSurvival({ cold, wet, hungry, lowHp })` — 0–1 additive offsets (shiver, shake-off, limp).
- `setVelocity(x, z)` — lean follows with a 2–3 frame lag.
- `land(impact)`, `attack(kind)`, `shakeOff()`, `update(dt)`

### `AfterImage(scene)`
- `burst(sourceObject3D, velocity, count)` — gold ghosts for a perfect dodge.
- `update(dt)`

### `HitSpark(scene)` / `InkFlash(parent)`
- `sparks.burst(position, normal, count, 'gold'|'orange'|'red')`
- `ink.flash('gold'|'red'|'ink', ms)` — full-screen ink-stroke / gold-seam overlay for shard, level-up, phase change.

### `TellIndicator(object3D, type)`
`type`: `'kodama'` (head rattle), `'tanuki'` (puff-up), `'mushroom'` (cap swell + glow). Optional child names: `head`, `cap`.
- `play()`, `update(dt)`, `progress`, `onComplete`

### `JorogumoController(object3D, opts)`
Drives any placeholder along `webPoints` / `webEdges`. Events: `onTell`, `onAttack`, `onPhaseChange`, `onDefeat`, `onStun`, `onWebPool`.

- **Phase 1:** moves only along web lines, weave–weave–strike rhythm, silk lash (2 whips, 6-frame fan tell), drop strike (ground shadow sharpens 0.8 s), retreats up after every 3 attacks, `cutAnchor()` drops her stunned for 3 s.
- **Phase 2** at 50% HP: `BellRing`, skittering ground chase, web pools, silk pull (`parrySilk()` in the window to stagger her).
- `takeDamage(n)`, `cutAnchor(i)`, `parrySilk()`, `setTarget(obj)`, `start()`, `update(dt)`
- Optional `helpers: true` draws the web, drop shadow and silk line. A child named `legs` is hidden until phase 2; a child named `fan` is used for the lash tell.

## Hooking combat

```js
// light / heavy / parry / perfect dodge
time.hitStop(FEEL.time.hitStopLight);
time.hitStop(FEEL.time.hitStopHeavy);
cameraFX.shake('heavy');          // shake only on heavy and parry
bell.parryRing({ position: hero.position, timeScale: time });
time.perfectDodge();
afterimage.burst(heroPose, velocity);

// minion tell, then attack
const tell = new TellIndicator(kodama, 'kodama');
tell.play();

// boss
joro.on('onAttack', (e) => { /* apply damage if in range; e.parried for silk pull */ });
joro.on('onPhaseChange', () => { /* mist burns off, reveal legs */ });
joro.on('onDefeat', () => bell.ring({ position: joro.object.position }));
```

## Known gaps

- This is feel / motion only: no damage volumes, stamina, navmesh or animation clips. Lumen wires those.
- The post ripple needs WebGL2; the ring + vignette always run.
- Afterimages are mesh clones with a gold unlit material — skinned meshes should pass a simple stand-in if clone looks wrong.
- Later bosses (Ōmukade, Kappa, etc.) are not in this module; only Jorōgumo v0.1.
