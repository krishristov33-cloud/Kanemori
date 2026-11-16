// KANEMORI v0.3 character animation layer (Aether). ES module, three.js r160+.
// CharacterAnimator: phase-synced idle/walk/run/sprint blend, smooth turning with lean, start/stop,
// one-shots with events, upper-body override layer (bow while walking), hit-stop speed scale.
// HorseAnimator: gait by speed (idle/walk/trot/gallop) with phase sync, plus 'rear'.
import * as THREE from 'three';

export const UPPER_BONES = ['spine', 'spine2', 'neck', 'head', 'hair', 'scarf1', 'scarf2', 'scarf3',
  'shoulder_L', 'upperArm_L', 'lowerArm_L', 'hand_L', 'shoulder_R', 'upperArm_R', 'lowerArm_R', 'hand_R'];

// Suggested forward root motion (m/s) while a one-shot plays: [speed, from, to] in clip seconds.
export const ROOT_MOTION = {
  dodge_roll: [5.0, 0.0, 0.55], katana_light_1: [2.5, 0.06, 0.2], katana_light_2: [2.0, 0.06, 0.2],
  katana_light_3: [3.5, 0.06, 0.22], katana_heavy: [4.0, 0.3, 0.45], hit_react: [-2.0, 0.0, 0.15],
  start: [4.5, 0.0, 0.36], stop: [2.2, 0.0, 0.25],
};
// Authored ground speed (m/s) for each locomotion clip. Feet are planted at exactly these speeds.
export const LOCO_SPEED = { idle: 0, walk: 1.4, run: 4.5, sprint: 7.0 };
// Lumen's controller: run 5.5, sprint 8 → blends run/sprint (5.5) and plays sprint at 8/7 = 1.14x cadence.
export const HORSE_SPEED = { idle: 0, walk: 1.4, trot: 3.2, gallop: 8.0 };

const wrapPi = a => Math.atan2(Math.sin(a), Math.cos(a));
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const damp = (cur, tgt, lambda, dt) => cur + (tgt - cur) * (1 - Math.exp(-lambda * dt));

export const TWO_HANDED = ['katana_heavy', 'block', 'parry'];
const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3(), _qa = new THREE.Quaternion(), _qb = new THREE.Quaternion();
/** Analytic two-bone IK in world space. Rotates upper + lower so `end` reaches target; elbow bends toward pole. */
export function twoBoneIK(upper, lower, end, target, pole, weight = 1) {
  if (weight <= 0) return;
  const pU = upper.getWorldPosition(new THREE.Vector3()), pL = lower.getWorldPosition(new THREE.Vector3()), pE = end.getWorldPosition(new THREE.Vector3());
  const a = pU.distanceTo(pL), b = pL.distanceTo(pE);
  const toT = target.clone().sub(pU); const d = clamp(toT.length(), 0.01, (a + b) * 0.999); const dir = toT.normalize();
  const m = pole.clone().sub(pU); m.addScaledVector(dir, -m.dot(dir)); if (m.lengthSq() < 1e-8) m.set(0, -1, 0); m.normalize();
  const cosA = clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1), sinA = Math.sqrt(1 - cosA * cosA);
  const elbow = pU.clone().addScaledVector(dir, a * cosA).addScaledVector(m, a * sinA);
  const rot = (bone, from, to) => {
    const q = _qa.setFromUnitVectors(from.normalize(), to.normalize());
    const wq = bone.getWorldQuaternion(new THREE.Quaternion()); const pq = bone.parent.getWorldQuaternion(new THREE.Quaternion());
    const nl = pq.invert().multiply(q.multiply(wq));
    bone.quaternion.slerp(nl, weight); bone.updateMatrixWorld(true);
  };
  rot(upper, pL.clone().sub(pU), elbow.clone().sub(pU));
  lower.getWorldPosition(pL); end.getWorldPosition(pE);
  rot(lower, pE.clone().sub(pL), target.clone().sub(pL));
}
export function filterClip(clip, bones, keep = true, suffix = '') {
  const set = new Set(bones);
  const tracks = clip.tracks.filter(t => set.has(t.name.split('.')[0]) === keep);
  return new THREE.AnimationClip(clip.name + suffix, clip.duration, tracks);
}

/** Swap exported standard materials for soft toon materials (keeps vertex colours + kintsugi emissive). */
export function toonify(root, { steps = 3, gradient } = {}) {
  let tex = gradient;
  if (!tex) {
    const data = new Uint8Array(steps * 4);
    for (let i = 0; i < steps; i++) { const v = Math.round(90 + (165 * i) / (steps - 1)); data.set([v, v, v, 255], i * 4); }
    tex = new THREE.DataTexture(data, steps, 1, THREE.RGBAFormat);
    tex.minFilter = tex.magFilter = THREE.NearestFilter; tex.needsUpdate = true;
  }
  const cache = new Map();
  root.traverse(o => {
    if (!o.isMesh) return;
    o.castShadow = true; o.receiveShadow = true;
    const conv = m => {
      if (cache.has(m)) return cache.get(m);
      const t = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: tex, name: m.name, color: m.color });
      if (m.emissive) { t.emissive = m.emissive.clone(); t.emissiveIntensity = m.emissiveIntensity; }
      cache.set(m, t); return t;
    };
    o.material = Array.isArray(o.material) ? o.material.map(conv) : conv(o.material);
  });
  return root;
}

function readMeta(gltf) {
  let meta = null;
  gltf.scene.traverse(o => { if (!meta && o.userData?.kanemori?.clips) meta = o.userData.kanemori; });
  return meta || { clips: {} };
}

class Layer {
  constructor(action, clip, opts, meta) {
    this.action = action; this.clip = clip; this.meta = meta || { events: {} };
    this.t = opts.startAt || 0; this.w = (opts.fade ?? 0.08) > 0 ? 0 : 1;
    this.fadeIn = opts.fade ?? 0.08; this.fadeOut = opts.fadeOut ?? 0.15;
    this.loop = opts.loop ?? (this.meta.loop || false);
    this.timeScale = opts.timeScale ?? 1;
    this.onEvent = opts.onEvent; this.onDone = opts.onDone; this.name = clip.name.replace(/:upper$/, '');
    this.leaving = false; this.done = false; this.hold = opts.hold || false; this.opts = opts;
    action.reset(); action.enabled = true; action.setEffectiveTimeScale(0); action.setEffectiveWeight(0); action.play();
  }
  leave(fade) { if (!this.leaving) { this.leaving = true; this.fadeOut = fade ?? this.fadeOut; } }
  step(dt) {
    const d = this.clip.duration, prev = this.t;
    this.t += dt * this.timeScale;
    const ev = this.meta.events || {};
    for (const k in ev) {
      const et = ev[k]; if (typeof et !== 'number' || k === 'yaw') continue;
      if (this.loop) { const a = prev % d, b = this.t % d; if ((a < et && b >= et) || (b < a && (et > a || et <= b))) this.onEvent?.(k, this); }
      else if (prev < et && this.t >= et) this.onEvent?.(k, this);
    }
    if (!this.loop && !this.hold && this.t >= d - this.fadeOut) this.leaving = true;
    if (this.leaving) this.w = this.fadeOut > 0 ? this.w - dt / this.fadeOut : 0;
    else this.w = this.fadeIn > 0 ? Math.min(1, this.w + dt / this.fadeIn) : 1;
    if (this.w <= 0 && this.leaving) { this.w = 0; this.done = true; }
    if (!this.loop && this.t >= d && this.fadeOut <= 0) { this.done = true; this.w = 0; }
    this.action.time = this.loop ? this.t % d : Math.min(this.t, d - 1e-4);
  }
}

export class CharacterAnimator {
  /**
   * @param {object} gltf  result of GLTFLoader (or {scene, animations})
   * @param {object} opts  { object: the Object3D you move/rotate (default gltf.scene),
   *                         turnRate: deg/s, autoStartStop: true, turnInPlace: true, onFootstep(side) }
   */
  constructor(gltf, opts = {}) {
    this.root = gltf.scene; this.object = opts.object || gltf.scene;
    this.meta = readMeta(gltf).clips || {};
    this.mixer = new THREE.AnimationMixer(this.root);
    this.clips = Object.fromEntries(gltf.animations.map(c => [c.name, c]));
    this.opts = { turnRate: 720, autoStartStop: true, turnInPlace: true, leanGain: 0.06, maxLean: 16, ...opts };
    this.bones = {}; this.root.traverse(o => { if (o.isBone) this.bones[o.name] = o; if (o.userData?.hidden) o.visible = false; });
    this.loco = [];
    for (const name of ['idle', 'walk', 'run', 'sprint']) {
      const c = this.clips[name]; if (!c) continue;
      const lower = this.mixer.clipAction(filterClip(c, UPPER_BONES, false, ':lower'));
      const upper = this.mixer.clipAction(filterClip(c, UPPER_BONES, true, ':upper'));
      for (const a of [lower, upper]) { a.play(); a.setEffectiveTimeScale(0); a.setEffectiveWeight(0); }
      this.loco.push({ name, clip: c, lower, upper, v: this.meta[name]?.speed ?? LOCO_SPEED[name] ?? 0, w: name === 'idle' ? 1 : 0 });
    }
    this.phase = 0; this.idleT = 0;
    this.speed = 0; this.targetSpeed = 0; this.prevSpeed = 0; this.accel = 0;
    this.yaw = this.object.rotation.y; this.targetYaw = this.yaw; this.yawVel = 0;
    this.lean = 0; this.pitchLean = 0; this.speedScale = 1;
    this.full = []; this.upper = []; this._upperClips = {};
    this.onFootstep = opts.onFootstep; this.locked = false;
    this._q = new THREE.Quaternion(); this._e = new THREE.Euler();
    // v0.3.1
    this.aimPitch = 0; this._aim = 0; this._aimW = 0; this.aimClips = /^(bow_draw|bow_hold|bow_release|bow_quick|aim)/;
    this.leftHandIK = opts.leftHandIK ?? true; this._lhW = 0; this.twoHanded = new Set(opts.twoHanded || TWO_HANDED);
    this.ride = null; this.rideActs = {};
  }
  /** Bow aim pitch in degrees (+60 up … −45 down). Applied additively on spine/spine2 while a bow clip plays on any layer. */
  setAim(pitchDeg) { this.aimPitch = clamp(pitchDeg, -45, 60); }
  /** Desired ground speed (m/s) and facing yaw (radians, world). */
  setMove(speed, yaw) { this.targetSpeed = Math.max(0, speed); if (yaw !== undefined) this.targetYaw = yaw; }
  setYaw(yaw, snap = false) { this.targetYaw = yaw; if (snap) { this.yaw = yaw; this.object.rotation.y = yaw; } }
  /** 0 freezes (hit-stop), 0.3 = perfect-dodge slow-mo. Multiplies dt for everything here. */
  setSpeedScale(s) { this.speedScale = s; }
  get busy() { return this.full.some(l => !l.leaving); }
  current(layer = 'full') { const L = (layer === 'full' ? this.full : this.upper).filter(l => !l.leaving); return L[L.length - 1] || null; }

  /**
   * Play a one-shot or loop.
   * opts: { layer:'full'|'upper', fade, fadeOut, loop, hold (stay on last frame until stop()), timeScale,
   *         onEvent(name, layer), onDone(layer) }
   * Events come from the clip metadata (e.g. 'hit', 'release', 'parryStart', 'footL').
   */
  play(name, opts = {}) {
    const layer = opts.layer || 'full';
    let clip = this.clips[name]; if (!clip) { console.warn('[CharacterAnimator] no clip', name); return null; }
    if (layer === 'upper') { clip = this._upperClips[name] ||= filterClip(clip, UPPER_BONES, true, ':upper'); }
    const list = layer === 'upper' ? this.upper : this.full;
    for (const l of list) l.leave(opts.fade ?? 0.08);
    const action = this.mixer.clipAction(clip);
    // if the same action is still fading out, give it a fresh layer object
    const old = list.find(l => l.action === action); if (old) { list.splice(list.indexOf(old), 1); }
    const L = new Layer(action, clip, opts, this.meta[name]);
    list.push(L);
    return L;
  }
  stop(layer = 'full', fade = 0.15) { for (const l of (layer === 'upper' ? this.upper : this.full)) l.leave(fade); }
  /** Move an attachable mesh (e.g. 'katana', 'bow', 'fishing_rod') onto a socket bone. */
  attach(objName, socketName) {
    const o = this.root.getObjectByName(objName), s = this.bones[socketName] || this.root.getObjectByName(socketName);
    if (!o || !s) return false; s.add(o); o.position.set(0, 0, 0); o.quaternion.identity(); return true;
  }
  show(objName, on = true) { const o = this.root.getObjectByName(objName); if (o) o.visible = on; }
  /** Forward root speed (m/s) suggested by the active one-shot (see ROOT_MOTION), or null. */
  oneShotRootSpeed() {
    const l = this.current('full'); if (!l) return null; const r = ROOT_MOTION[l.name]; if (!r) return 0;
    return l.t >= r[1] && l.t <= r[2] ? r[0] : 0;
  }

  update(rawDt) {
    const dt = rawDt * this.speedScale;
    if (dt <= 0) { this.mixer.update(0); this._post(0); return; }
    // ---- speed + yaw
    this.prevSpeed = this.speed;
    this.speed = damp(this.speed, this.targetSpeed, this.targetSpeed > this.speed ? 7 : 9, dt);
    this.accel = damp(this.accel, (this.speed - this.prevSpeed) / dt, 10, dt);
    const fullActive = this.busy;
    const diff = wrapPi(this.targetYaw - this.yaw);
    if (!this.ride && this.opts.turnInPlace && !fullActive && this.speed < 0.25 && this.targetSpeed < 0.25 && Math.abs(diff) > 1.2 && this.clips.turn_L) {
      const dir = diff > 0 ? 1 : -1;
      if (Math.abs(diff) > 2.5 && this.clips.turn_180) this.play('turn_180', { fade: 0.1, fadeOut: 0, onDone: () => { this.yaw = wrapPi(this.yaw + dir * Math.PI); this.object.rotation.y = this.yaw; } });
      else this.play(dir > 0 ? 'turn_L' : 'turn_R', { fade: 0.1, fadeOut: 0, onDone: () => { this.yaw = wrapPi(this.yaw + dir * Math.PI / 2); this.object.rotation.y = this.yaw; } });
    }
    const turning = this.full.find(l => /^turn_/.test(l.name) && !l.done);
    let yawRate = 0;
    if (!this.ride && !turning && (this.speed > 0.05 || Math.abs(diff) < 1.2 || !this.opts.turnInPlace)) {
      const maxRate = THREE.MathUtils.degToRad(this.opts.turnRate) * (fullActive ? 0.35 : 1);
      yawRate = clamp(diff * 10, -maxRate, maxRate);
      this.yaw = wrapPi(this.yaw + yawRate * dt);
      this.object.rotation.y = this.yaw;
    }
    this.yawVel = damp(this.yawVel, yawRate, 8, dt);
    const leanTgt = clamp(this.yawVel * this.speed * this.opts.leanGain * 57.3 / 10, -this.opts.maxLean, this.opts.maxLean);
    this.lean = damp(this.lean, leanTgt, 8, dt);
    this.pitchLean = damp(this.pitchLean, clamp(this.accel * 1.2, -10, 10), 6, dt);
    // ---- auto start / stop
    if (this.opts.autoStartStop && !fullActive && !this.ride) {
      if (this.prevSpeed < 0.4 && this.targetSpeed > 3 && this.clips.start && !this._started) { this.play('start', { fade: 0.06, fadeOut: 0.14 }); this._started = true; }
      if (this.targetSpeed < 0.2 && this.speed > 3.2 && this.clips.stop && !this._stopped) { this.play('stop', { fade: 0.1, fadeOut: 0.2 }); this._stopped = true; }
    }
    if (this.targetSpeed > 0.5) this._stopped = false; if (this.targetSpeed < 0.3) this._started = false;
    // ---- locomotion weights + phase
    const moving = this.loco.filter(l => l.v > 0);
    const v = this.speed; let w = this.loco.map(() => 0), rate = 0;
    const idx = n => this.loco.findIndex(l => l.name === n);
    if (moving.length) {
      const first = moving[0];
      if (v <= first.v) {
        const a = v / first.v; const i0 = idx('idle'), i1 = this.loco.indexOf(first);
        if (i0 >= 0) w[i0] = 1 - a; w[i1] = i0 >= 0 ? a : 1;
        rate = Math.max(0.65, a) / first.clip.duration;
      } else {
        let k = moving.length - 1;
        for (let i = 0; i < moving.length - 1; i++) if (v <= moving[i + 1].v) { k = i; break; }
        const A = moving[k], B = moving[k + 1] || moving[k];
        const a = B === A ? 1 : clamp((v - A.v) / (B.v - A.v), 0, 1);
        w[this.loco.indexOf(A)] = 1 - a; w[this.loco.indexOf(B)] = a;
        const T = A.clip.duration * (1 - a) + B.clip.duration * a;
        rate = (1 / T) * (B === A || v > B.v ? v / B.v : 1);
      }
    } else w[0] = 1;
    // smooth weights a bit to hide speed jitter
    this.loco.forEach((l, i) => { l.w = damp(l.w, w[i], 14, dt); });
    const prevPhase = this.phase; this.phase = (this.phase + rate * dt) % 1; this.idleT += dt;
    if (this.onFootstep && v > 0.3) {
      if (prevPhase > this.phase) this.onFootstep('L'); else if (prevPhase < 0.5 && this.phase >= 0.5) this.onFootstep('R');
    }
    // ---- layers
    for (const L of this.full) L.step(dt);
    for (const L of this.upper) L.step(dt);
    for (const L of this.full.filter(l => l.done)) { L.action.setEffectiveWeight(0); L.action.stop(); L.onDone?.(L); }
    for (const L of this.upper.filter(l => l.done)) { L.action.setEffectiveWeight(0); L.action.stop(); L.onDone?.(L); }
    this.full = this.full.filter(l => !l.done); this.upper = this.upper.filter(l => !l.done);
    const sumF = this.full.reduce((a, l) => a + l.w, 0), F = Math.min(1, sumF);
    const sumU = this.upper.reduce((a, l) => a + l.w, 0), U = Math.min(1, sumU);
    for (const l of this.full) l.action.setEffectiveWeight(sumF > 1 ? l.w / sumF : l.w);
    for (const l of this.upper) l.action.setEffectiveWeight((sumU > 1 ? l.w / sumU : l.w) * (1 - F));
    const tot = this.loco.reduce((a, l) => a + l.w, 0) || 1;
    const R = this.ride ? 1 : 0;
    if (this.ride) {
      const h = this.ride.horse, ht = h.gaits.reduce((a, g) => a + g.w, 0) || 1;
      for (const g of h.gaits) {
        const name = 'ride_' + g.name, c = this.clips[name]; if (!c) continue;
        const act = this.rideActs[name] ||= (() => { const lo = this.mixer.clipAction(filterClip(c, UPPER_BONES, false, ':rlower')), up = this.mixer.clipAction(filterClip(c, UPPER_BONES, true, ':rupper')); for (const x of [lo, up]) { x.play(); x.setEffectiveTimeScale(0); } return { lo, up, c }; })();
        const t = g.name === 'idle' ? h.idleT % c.duration : h.phase * c.duration; act.lo.time = t; act.up.time = t;
        const rw = g.w / ht; act.lo.setEffectiveWeight(rw * (1 - F)); act.up.setEffectiveWeight(rw * (1 - F) * (1 - U));
      }
    } else for (const k in this.rideActs) { this.rideActs[k].lo.setEffectiveWeight(0); this.rideActs[k].up.setEffectiveWeight(0); }
    for (const l of this.loco) {
      const lw = (l.w / tot) * (1 - R), t = l.name === 'idle' ? this.idleT % l.clip.duration : this.phase * l.clip.duration;
      l.lower.time = t; l.upper.time = t;
      l.lower.setEffectiveWeight(lw * (1 - F)); l.upper.setEffectiveWeight(lw * (1 - F) * (1 - U));
    }
    this.mixer.update(dt);
    this._post(dt);
  }
  // procedural additive layer on top of the mixer: bank into turns, pitch with acceleration
  _post() {
    this.root.updateMatrixWorld(true);
    const b = this.bones, k = 1 - Math.min(1, this.full.reduce((a, l) => a + l.w, 0)) * 0.7;
    const lean = THREE.MathUtils.degToRad(this.lean) * k, pitch = THREE.MathUtils.degToRad(this.pitchLean) * k;
    const add = (bone, x, y, z) => { if (!bone) return; this._q.setFromEuler(this._e.set(x, y, z)); bone.quaternion.multiply(this._q); };
    add(b.hips, 0, 0, -lean * 0.35);
    add(b.spine, pitch * 0.5, lean * 0.25, -lean * 0.45);
    add(b.spine2, pitch * 0.3, lean * 0.2, -lean * 0.2);
    add(b.head, -pitch * 0.4, lean * 0.4, lean * 0.5);
    // bow aim pitch: rotate spine/spine2 about the character's world-right axis
    const aimOn = [...this.upper, ...this.full].some(l => !l.leaving && this.aimClips.test(l.name));
    this._aimW += ((aimOn ? 1 : 0) - this._aimW) * 0.2; this._aim += (this.aimPitch - this._aim) * 0.25;
    if (this._aimW > 0.01 && Math.abs(this._aim) > 0.1) {
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.root.getWorldQuaternion(_qb)).normalize();
      const ang = -THREE.MathUtils.degToRad(this._aim) * this._aimW;
      for (const [bone, f] of [[b.spine, 0.4], [b.spine2, 0.6]]) {
        if (!bone) continue; bone.updateMatrixWorld(true);
        const pq = bone.parent.getWorldQuaternion(new THREE.Quaternion()), wq = bone.getWorldQuaternion(new THREE.Quaternion());
        const r = new THREE.Quaternion().setFromAxisAngle(right, ang * f);
        bone.quaternion.copy(pq.invert().multiply(r.multiply(wq))); bone.updateMatrixWorld(true);
      }
      if (b.head) { b.head.quaternion.multiply(this._q.setFromEuler(this._e.set(-ang * 0.25, 0, 0))); }
    }
    // left hand onto the katana handle for two-handed clips
    const kat = this._katana ||= this.root.getObjectByName('katana');
    const two = this.leftHandIK && kat && kat.parent === b.socket_hand_R && this.full.some(l => !l.leaving && this.twoHanded.has(l.name));
    this._lhW += ((two ? 1 : 0) - this._lhW) * 0.25;
    if (this._lhW > 0.01 && b.upperArm_L && b.lowerArm_L && b.hand_L) {
      this.root.updateMatrixWorld(true);
      const tgt = kat.localToWorld(new THREE.Vector3(0, 0.0, -0.06)).add(new THREE.Vector3(0, 0.06, 0).applyQuaternion(b.hand_R.getWorldQuaternion(_qb)));
      const sh = b.upperArm_L.getWorldPosition(new THREE.Vector3());
      const pole = sh.clone().add(new THREE.Vector3(0.4, -0.6, -0.2).applyQuaternion(this.root.getWorldQuaternion(_qb)));
      twoBoneIK(b.upperArm_L, b.lowerArm_L, b.hand_L, tgt, pole, this._lhW);
    }
  }
}

export class HorseAnimator {
  constructor(gltf, opts = {}) {
    this.root = gltf.scene; this.object = opts.object || gltf.scene;
    this.meta = readMeta(gltf).clips || {};
    this.mixer = new THREE.AnimationMixer(this.root);
    this.clips = Object.fromEntries(gltf.animations.map(c => [c.name, c]));
    this.gaits = ['idle', 'walk', 'trot', 'gallop'].filter(n => this.clips[n]).map(name => {
      const a = this.mixer.clipAction(this.clips[name]); a.play(); a.setEffectiveTimeScale(0); a.setEffectiveWeight(name === 'idle' ? 1 : 0);
      return { name, a, clip: this.clips[name], v: this.meta[name]?.speed ?? HORSE_SPEED[name], w: name === 'idle' ? 1 : 0 };
    });
    this.speed = 0; this.targetSpeed = 0; this.phase = 0; this.idleT = 0; this.gait = 'idle'; this.speedScale = 1; this.full = [];
    this.yaw = this.object.rotation.y; this.targetYaw = this.yaw; this.lean = 0;
    this.bones = {}; this.root.traverse(o => { if (o.isBone) this.bones[o.name] = o; });
  }
  setMove(speed, yaw) { this.targetSpeed = Math.max(0, speed); if (yaw !== undefined) this.targetYaw = yaw; }
  setSpeedScale(s) { this.speedScale = s; }
  play(name, opts = {}) {
    const clip = this.clips[name]; if (!clip) return null;
    for (const l of this.full) l.leave(opts.fade ?? 0.15);
    const L = new Layer(this.mixer.clipAction(clip), clip, { fade: 0.2, fadeOut: 0.25, ...opts }, this.meta[name]); this.full.push(L); return L;
  }
  pickGait(v) { // hysteresis thresholds
    const g = this.gait;
    if (v < 0.25) return 'idle';
    if (g === 'gallop') return v > 5.2 ? 'gallop' : v > 2.2 ? 'trot' : 'walk';
    if (g === 'trot') return v > 6.0 ? 'gallop' : v > 2.2 ? 'trot' : 'walk';
    return v > 6.0 ? 'gallop' : v > 2.6 ? 'trot' : 'walk';
  }
  update(rawDt) {
    const dt = rawDt * this.speedScale; if (dt <= 0) { this.mixer.update(0); return; }
    this.speed = damp(this.speed, this.targetSpeed, 2.5, dt);
    const diff = wrapPi(this.targetYaw - this.yaw), yr = clamp(diff * 3, -2.2, 2.2);
    this.yaw = wrapPi(this.yaw + yr * dt); this.object.rotation.y = this.yaw;
    this.lean = damp(this.lean, clamp(yr * this.speed * 1.4, -14, 14), 5, dt);
    this.gait = this.pickGait(this.speed);
    let rate = 0, mw = 0;
    for (const g of this.gaits) {
      g.w = damp(g.w, g.name === this.gait ? 1 : 0, 6, dt);
      if (g.v > 0) { rate += g.w / g.clip.duration * clamp(this.speed / g.v, 0.6, 1.5); mw += g.w; }
    }
    if (mw > 0) rate /= mw;
    this.phase = (this.phase + rate * dt) % 1; this.idleT += dt;
    for (const L of this.full) L.step(dt);
    for (const L of this.full.filter(l => l.done)) { L.action.setEffectiveWeight(0); L.action.stop(); L.onDone?.(L); }
    this.full = this.full.filter(l => !l.done);
    const F = Math.min(1, this.full.reduce((a, l) => a + l.w, 0));
    for (const l of this.full) l.action.setEffectiveWeight(l.w);
    const tot = this.gaits.reduce((a, g) => a + g.w, 0) || 1;
    for (const g of this.gaits) { g.a.time = g.name === 'idle' ? this.idleT % g.clip.duration : this.phase * g.clip.duration; g.a.setEffectiveWeight(g.w / tot * (1 - F)); }
    this.mixer.update(dt);
    const s = this.bones.spine; if (s) s.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -THREE.MathUtils.degToRad(this.lean))));
    const n = this.bones.neck1; if (n) n.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, diff * 0.25, 0)));
  }
}

/**
 * Put Ren on a horse. Parents Ren's scene under the horse's socket_saddle, plays 'mount', then
 * drives ride_idle/walk/trot/gallop from the horse's gait weights and phase every frame.
 * Returns { dismount(onGround) }. Keep calling renAnim.update(dt) and horseAnim.update(dt) (horse first).
 */
export function mountRider(ren, horse, { onSeated, animate = true } = {}) {
  const socket = horse.root.getObjectByName('socket_saddle'); if (!socket) throw new Error('horse has no socket_saddle');
  ren.stop('full', 0.1); ren.stop('upper', 0.1);
  socket.add(ren.object); ren.object.position.set(0, 0, 0); ren.object.quaternion.identity(); ren.object.scale.setScalar(1 / socket.getWorldScale(new THREE.Vector3()).x);
  ren.ride = { horse }; ren.speed = 0; ren.targetSpeed = 0;
  if (animate && ren.clips.mount) ren.play('mount', { fade: 0.05, fadeOut: 0.25, onDone: () => onSeated?.() }); else onSeated?.();
  return {
    dismount(onGround) {
      const finish = () => {
        const scene = horse.object.parent, hips = ren.bones.hips;
        const wp = ren.object.getWorldPosition(new THREE.Vector3());
        const yaw = horse.yaw;
        // standing spot authored at +0.55 m to the horse's left of the saddle
        const off = new THREE.Vector3(0.55, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
        scene.add(ren.object); ren.object.scale.setScalar(1);
        ren.object.position.set(wp.x + off.x, horse.object.position.y, wp.z + off.z);
        ren.ride = null; ren.yaw = ren.targetYaw = yaw; ren.object.rotation.set(0, yaw, 0);
        onGround?.();
      };
      horse.setMove(0);
      if (ren.clips.dismount) ren.play('dismount', { fade: 0.15, fadeOut: 0, onDone: finish }); else finish();
    },
  };
}

/** Horse pulls a cart: cart yaw/position follow the horse's rear hitch point with a rigid tow bar; wheels spin from distance. */
export class CartHitch {
  constructor(cartRoot, horseObject, { hitchOnHorse = new THREE.Vector3(0, 0.95, -0.75), wheelRadius = 0.46 } = {}) {
    this.cart = cartRoot; this.horse = horseObject; this.hitchOnHorse = hitchOnHorse; this.r = wheelRadius;
    const h = cartRoot.getObjectByName('socket_hitch'); this.bar = h ? h.position.z : 2.2;
    this.wheels = ['wheel_L', 'wheel_R'].map(n => cartRoot.getObjectByName(n)).filter(Boolean);
    this.prev = null; this.distance = 0;
  }
  update() {
    const hp = this.horse.localToWorld(this.hitchOnHorse.clone());
    const c = this.cart.position; const dx = hp.x - c.x, dz = hp.z - c.z, L = Math.hypot(dx, dz) || 1;
    const yaw = Math.atan2(dx, dz);
    const nx = hp.x - (dx / L) * this.bar, nz = hp.z - (dz / L) * this.bar;
    const moved = this.prev ? (nx - this.prev.x) * Math.sin(yaw) + (nz - this.prev.z) * Math.cos(yaw) : 0;
    c.set(nx, this.horse.position.y, nz); this.cart.rotation.set(0, yaw, 0);
    this.prev = { x: nx, z: nz }; this.distance += moved;
    for (const w of this.wheels) w.rotation.x += moved / this.r;
    return moved;
  }
  /** Seat a driver (e.g. Ren with 'cart_drive') on the cart bench. */
  seat(renAnim) { const s = this.cart.getObjectByName('socket_seat'); if (!s) return; s.add(renAnim.object); renAnim.object.position.set(0, 0, 0); renAnim.object.rotation.set(0, 0, 0); renAnim.ride = null; renAnim.play('cart_drive', { loop: true, fade: 0.3 }); }
}
