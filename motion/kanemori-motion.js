/**
 * Kanemori — game-feel / motion module (Aether)
 * three.js r160+, no build step.
 *
 *   import * as THREE from 'three';
 *   import {
 *     FEEL, TimeScale, CameraFX, BellRing, HeroMotion,
 *     AfterImage, HitSpark, InkFlash, TellIndicator,
 *     JorogumoController, installFeel,
 *   } from './kanemori-motion.js';
 *
 * Tunables live on FEEL. Pass `{ feel }` to any constructor to override.
 * HeroMotion writes lean / squash / sway onto a dedicated pose child —
 * keep locomotion yaw on the parent so the two don't fight.
 */
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export const FEEL = {
  colors: {
    indigo: 0x1c2150,
    indigoDeep: 0x0c1028,
    signalRed: 0xe02020,
    sodiumOrange: 0xff9f1c,
    gold: 0xe0c15a,
    silk: 0xe8e0d0,
    ink: 0x0a0a12,
  },
  time: {
    frameRate: 60,
    hitStopLight: 2,
    hitStopHeavy: 4,
    hitStopBossStagger: 6,
    hitStopBellFreeze: 3,
    perfectDodgeScale: 0.3,
    perfectDodgeDuration: 0.5,
  },
  camera: {
    traumaDecay: 1.35,
    shakeLight: 0.16,
    shakeHeavy: 0.48,
    shakeParry: 0.36,
    maxOffset: 0.32,
    maxRoll: 0.045,
    fovKickHeavy: 4.5,
    fovKickParry: 2.5,
    fovKickTime: 0.18,
    lockOnPullPadding: 1.7,
    lockOnMinDist: 5.5,
    lockOnMaxDist: 16,
    defaultFov: 55,
  },
  hero: {
    leanLag: 2.5 / 60,
    leanAngle: 0.2,
    landSquash: 0.14,
    landSpring: 62,
    landDamp: 9,
    stanceRecovery: [1.18, 1.0, 0.8],
    idleSway: [0.036, 0.018, 0.007],
    shiverAmp: 0.014,
    limpAmount: 0.045,
  },
  afterImage: {
    count: 4,
    life: 0.38,
    color: 0xe0c15a,
    opacity: 0.5,
    spacing: 0.045,
  },
  combat: {
    dodgeDuration: 0.32,
    dodgeIFrames: 6,
    perfectDodgeWindow: 4,
  },
  spark: {
    life: 0.28,
    countLight: 8,
    countHeavy: 16,
    speed: 7,
  },
  tells: {
    kodama: { duration: 0.45, rattleHz: 18, rattleAmp: 0.16 },
    tanuki: { duration: 10 / 60, puffScale: 1.28 },
    mushroom: { duration: 0.55, swell: 1.24, glow: 2.4 },
  },
  bell: {
    fundamental: 138,
    freezeFrames: 3,
    rippleDuration: 1.15,
    rippleStrength: 0.09,
    volume: 0.24,
  },
  jorogumo: {
    maxHp: 100,
    phase2Hp: 0.5,
    weaveDuration: 0.72,
    strikeDuration: 0.55,
    silkLashTell: 6 / 60,
    silkLashWhipGap: 0.18,
    dropShadowTime: 0.8,
    retreatAfterAttacks: 3,
    retreatDuration: 0.7,
    stunDuration: 3,
    skitterStep: 0.11,
    silkPullTell: 0.4,
    silkPullParryWindow: 0.3,
    webPoolDuration: 4.5,
    webPoolRadius: 2.2,
  },
};

// ---------------------------------------------------------------------------
// Math helpers
// ---------------------------------------------------------------------------

const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();

function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function framesToSec(frames, feel) {
  return frames / (feel?.time?.frameRate || 60);
}
function hashNoise(t, seed = 0) {
  const x = Math.sin(t * 47.13 + seed * 19.17) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

// ---------------------------------------------------------------------------
// TimeScale
// ---------------------------------------------------------------------------

/**
 * Frame-time scaler. Call `update(rawDt)` once a frame and use the returned
 * dt for all gameplay / motion. Hit-stops consume real time, not scaled time.
 */
export class TimeScale {
  constructor({ feel = FEEL } = {}) {
    this.feel = feel;
    this._hitStop = 0;
    this._slowLeft = 0;
    this._slowScale = 1;
    this.scale = 1;
    this.frozen = false;
  }

  /** Freeze the world for N frames (at FEEL.time.frameRate). */
  hitStop(frames = this.feel.time.hitStopLight) {
    const sec = framesToSec(frames, this.feel);
    this._hitStop = Math.max(this._hitStop, sec);
  }

  /** Scale the clock to `scale` for `seconds` of real time (e.g. 0.3, 0.5). */
  slowMo(scale, seconds) {
    this._slowScale = scale;
    this._slowLeft = Math.max(this._slowLeft, seconds);
  }

  /** Perfect-dodge preset: 0.3× for 0.5 s. */
  perfectDodge() {
    const t = this.feel.time;
    this.slowMo(t.perfectDodgeScale, t.perfectDodgeDuration);
  }

  /**
   * @param {number} rawDt real delta seconds
   * @returns {number} scaled dt (0 during a hit-stop)
   */
  update(rawDt) {
    const dt = Math.min(Math.max(rawDt, 0), 0.08);
    if (this._hitStop > 0) {
      this._hitStop -= dt;
      this.scale = 0;
      this.frozen = true;
      return 0;
    }
    this.frozen = false;
    let scale = 1;
    if (this._slowLeft > 0) {
      this._slowLeft -= dt;
      scale = this._slowScale;
      if (this._slowLeft <= 0) this._slowScale = 1;
    }
    this.scale = scale;
    return dt * scale;
  }
}

// ---------------------------------------------------------------------------
// CameraFX
// ---------------------------------------------------------------------------

/**
 * Trauma-based shake, FOV kick, and a lock-on framing helper.
 * The game must set the camera's unshaken pose each frame, then call apply().
 */
export class CameraFX {
  constructor(camera, { feel = FEEL } = {}) {
    this.camera = camera;
    this.feel = feel;
    this.trauma = 0;
    this._fovKick = 0;
    this._fovKickVel = 0;
    this._baseFov = camera?.fov ?? feel.camera.defaultFov;
    this._seed = Math.random() * 100;
  }

  /** @param {'light'|'heavy'|'parry'|number} preset */
  shake(preset = 'heavy') {
    const c = this.feel.camera;
    const map = { light: c.shakeLight, heavy: c.shakeHeavy, parry: c.shakeParry };
    const amount = typeof preset === 'number' ? preset : (map[preset] ?? c.shakeHeavy);
    this.trauma = clamp(this.trauma + amount, 0, 1);
  }

  addTrauma(amount) {
    this.trauma = clamp(this.trauma + amount, 0, 1);
  }

  fovKick(degrees = this.feel.camera.fovKickHeavy, _seconds = this.feel.camera.fovKickTime) {
    this._fovKick = -Math.abs(degrees) * 0.45;
    this._fovKickVel = -Math.abs(degrees) * 4;
  }

  /**
   * Pull the camera back so both hero and target stay framed.
   * Mutates camera position / lookAt. Call before apply().
   */
  lockOnFrame(camera, heroPos, targetPos, targetSize = 1, tightness = 0.14) {
    const c = this.feel.camera;
    const mid = _v.copy(heroPos).lerp(targetPos, 0.38);
    mid.y += Math.max(1.15, targetSize * 0.28);
    const span = heroPos.distanceTo(targetPos) + targetSize * c.lockOnPullPadding;
    const dist = clamp(span * 0.75 + targetSize * 0.8, c.lockOnMinDist, c.lockOnMaxDist);
    // Stay behind the hero, looking toward the target — more stable than "away from mid".
    const back = _v2.copy(heroPos).sub(targetPos);
    back.y = 0;
    if (back.lengthSq() < 0.001) back.set(0, 0, 1);
    back.normalize();
    _v3.copy(mid).addScaledVector(back, dist);
    _v3.y = mid.y + Math.max(2.2, targetSize * 0.7);
    camera.position.lerp(_v3, tightness);
    camera.lookAt(mid);
  }

  /** Add shake + FOV kick on top of the camera pose the game just set. */
  apply(camera = this.camera, dt = 1 / 60) {
    if (!camera) return;
    const c = this.feel.camera;
    this.trauma = Math.max(0, this.trauma - c.traumaDecay * dt);
    const shake = this.trauma * this.trauma;
    if (shake > 0.0001) {
      const t = performance.now() * 0.001;
      const s = this._seed;
      camera.position.x += shake * c.maxOffset * hashNoise(t, s);
      camera.position.y += shake * c.maxOffset * 0.85 * hashNoise(t, s + 2);
      camera.position.z += shake * c.maxOffset * 0.55 * hashNoise(t, s + 4);
      camera.rotateZ(shake * c.maxRoll * hashNoise(t, s + 6));
    }
    if (this._baseFov == null) this._baseFov = camera.fov;
    this._fovKickVel += (-this._fovKick * 36 - this._fovKickVel * 10) * dt;
    this._fovKick += this._fovKickVel * dt;
    if (Math.abs(this._fovKick) < 0.02 && Math.abs(this._fovKickVel) < 0.1) {
      this._fovKick = 0;
      this._fovKickVel = 0;
    }
    const fov = this._baseFov + this._fovKick;
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  }

  resetFov(camera = this.camera) {
    if (!camera) return;
    camera.fov = this._baseFov;
    camera.updateProjectionMatrix();
    this._fovKick = 0;
    this._fovKickVel = 0;
  }
}

// ---------------------------------------------------------------------------
// BellRing — signature effect
// ---------------------------------------------------------------------------

/**
 * Signature beat: low bell tone + 2–3 frame freeze + screen ripple
 * (WebGL post pass, with a world-space ring + CSS vignette fallback).
 *
 * If renderer / scene / camera are given, call `render()` instead of
 * `renderer.render(scene, camera)` so the ripple can composite.
 */
export class BellRing {
  constructor({
    renderer = null,
    scene = null,
    camera = null,
    overlayParent = typeof document !== 'undefined' ? document.body : null,
    timeScale = null,
    feel = FEEL,
  } = {}) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.timeScale = timeScale;
    this.feel = feel;
    this.active = false;
    this._t = 0;
    this._intensity = 1;
    this._realClock = 0;
    this._centerNDC = new THREE.Vector2(0.5, 0.5);
    this._worldPos = new THREE.Vector3();
    this._audio = null;
    this._ring = null;
    this._ring2 = null;
    this._postOk = false;
    this._overlay = null;

    if (scene) {
      const ringGeo = new THREE.RingGeometry(0.6, 0.85, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: feel.colors.gold,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      });
      this._ring = new THREE.Mesh(ringGeo, ringMat);
      this._ring.rotation.x = -Math.PI / 2;
      this._ring.visible = false;
      this._ring.renderOrder = 10;
      scene.add(this._ring);

      this._ring2 = this._ring.clone();
      this._ring2.material = ringMat.clone();
      this._ring2.material.color.setHex(feel.colors.sodiumOrange);
      scene.add(this._ring2);
    }

    if (overlayParent && typeof document !== 'undefined') {
      this._overlay = document.createElement('div');
      this._overlay.className = 'kanemori-bell-vignette';
      Object.assign(this._overlay.style, {
        position: 'fixed',
        inset: '0',
        pointerEvents: 'none',
        opacity: '0',
        zIndex: '20',
        background:
          'radial-gradient(circle at 50% 50%, rgba(224,193,90,0.10) 0%, transparent 42%, rgba(224,193,90,0.22) 60%, transparent 78%)',
        mixBlendMode: 'screen',
        transition: 'opacity 40ms linear',
      });
      overlayParent.appendChild(this._overlay);
    }

    if (renderer && scene && camera) this._initPost(renderer);
  }

  _initPost(renderer) {
    try {
      if (!renderer.capabilities.isWebGL2) return;
      const size = new THREE.Vector2();
      renderer.getSize(size);
      const pr = renderer.getPixelRatio();
      this._rt = new THREE.WebGLRenderTarget(
        Math.max(1, Math.floor(size.x * pr)),
        Math.max(1, Math.floor(size.y * pr)),
        { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: true }
      );
      this._postScene = new THREE.Scene();
      this._postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const geo = new THREE.PlaneGeometry(2, 2);
      this._postMat = new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        uniforms: {
          tDiffuse: { value: this._rt.texture },
          uCenter: { value: this._centerNDC },
          uTime: { value: 0 },
          uStrength: { value: this.feel.bell.rippleStrength },
          uTint: { value: new THREE.Color(this.feel.colors.gold) },
        },
        vertexShader: /* glsl */ `
          in vec3 position;
          in vec2 uv;
          out vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          precision highp float;
          uniform sampler2D tDiffuse;
          uniform vec2 uCenter;
          uniform float uTime;
          uniform float uStrength;
          uniform vec3 uTint;
          in vec2 vUv;
          out vec4 fragColor;
          void main() {
            vec2 uv = vUv;
            float dist = distance(uv, uCenter);
            float wave = uTime * 0.78;
            float ring = 1.0 - smoothstep(0.0, 0.07, abs(dist - wave));
            float fall = 1.0 - uTime;
            vec2 dir = normalize(uv - uCenter + 1e-5);
            uv += dir * ring * uStrength * fall;
            vec4 col = texture(tDiffuse, uv);
            col.rgb += uTint * ring * fall * 0.22;
            // RT is linear; the default framebuffer is sRGB. Encode here because
            // RawShaderMaterial skips three's colorspace chunk.
            vec3 c = max(col.rgb, vec3(0.0));
            bvec3 cutoff = lessThan(c, vec3(0.0031308));
            vec3 lo = c * 12.92;
            vec3 hi = 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055;
            fragColor = vec4(mix(hi, lo, vec3(cutoff)), col.a);
          }`,
        depthTest: false,
        depthWrite: false,
      });
      this._postQuad = new THREE.Mesh(geo, this._postMat);
      this._postScene.add(this._postQuad);
      this._postOk = true;
      this._onResize = () => this.resize();
      if (typeof window !== 'undefined') window.addEventListener('resize', this._onResize);
    } catch (err) {
      console.warn('[Kanemori] BellRing post-pass disabled, using ring + vignette.', err);
      this._postOk = false;
    }
  }

  resize() {
    if (!this._rt || !this.renderer) return;
    const size = new THREE.Vector2();
    this.renderer.getSize(size);
    const pr = this.renderer.getPixelRatio();
    this._rt.setSize(Math.max(1, Math.floor(size.x * pr)), Math.max(1, Math.floor(size.y * pr)));
  }

  _ensureAudio() {
    if (this._audio) return this._audio;
    if (typeof window === 'undefined') return null;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    this._audio = new AC();
    return this._audio;
  }

  /**
   * Synthesize a low temple-bell tone (additive sine partials, no samples).
   * Safe to call from any gesture; resumes a suspended AudioContext.
   */
  playTone(intensity = 1, fundamental = this.feel.bell.fundamental) {
    const ctx = this._ensureAudio();
    if (!ctx) return;
    const go = () => this._synthBell(ctx, intensity, fundamental);
    if (ctx.state === 'suspended') ctx.resume().then(go).catch(go);
    else go();
  }

  _synthBell(ctx, intensity, freq) {
    const now = ctx.currentTime;
    const vol = this.feel.bell.volume * intensity;
    const master = ctx.createGain();
    master.gain.setValueAtTime(vol, now);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(2400, now);
    lp.frequency.exponentialRampToValueAtTime(900, now + 1.6);
    master.connect(lp);
    lp.connect(ctx.destination);

    const partials = [
      [1.0, 1.0, 2.9],
      [2.01, 0.5, 2.2],
      [2.4, 0.2, 1.35],
      [3.02, 0.32, 1.85],
      [4.15, 0.16, 1.05],
      [5.38, 0.09, 0.8],
      [6.72, 0.055, 0.55],
      [8.15, 0.03, 0.4],
    ];
    for (const [ratio, gain, decay] of partials) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq * ratio;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(gain, now + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, now + decay);
      osc.connect(g);
      g.connect(master);
      osc.start(now);
      osc.stop(now + decay + 0.05);
    }

    const nLen = 0.04;
    const noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * nLen), ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.35 * intensity, now);
    ng.gain.exponentialRampToValueAtTime(0.0001, now + nLen);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 420;
    bp.Q.value = 0.8;
    noise.connect(bp);
    bp.connect(ng);
    ng.connect(master);
    noise.start(now);
  }

  /**
   * Fire the signature: freeze, tone, ripple, vignette.
   * @param {object} [opts]
   * @param {THREE.Vector3} [opts.position] world origin of the ripple
   * @param {number} [opts.intensity]
   * @param {boolean} [opts.tone]
   * @param {boolean} [opts.freeze]
   * @param {TimeScale} [opts.timeScale]
   */
  ring({
    position = null,
    intensity = 1,
    tone = true,
    freeze = true,
    timeScale = this.timeScale,
    camera = this.camera,
  } = {}) {
    this.active = true;
    this._t = 0;
    this._realClock = 0;
    this._intensity = intensity;
    if (position) this._worldPos.copy(position);
    else if (camera) camera.getWorldPosition(this._worldPos);

    if (camera && position) {
      _v.copy(position).project(camera);
      this._centerNDC.set(_v.x * 0.5 + 0.5, _v.y * 0.5 + 0.5);
    } else {
      this._centerNDC.set(0.5, 0.5);
    }

    if (this._ring) {
      const p = position || this._worldPos;
      this._ring.position.set(p.x, p.y + 0.05, p.z);
      this._ring2.position.copy(this._ring.position);
      this._ring.visible = this._ring2.visible = true;
      this._ring.scale.setScalar(0.2);
      this._ring2.scale.setScalar(0.12);
    }
    if (this._overlay) {
      this._overlay.style.background =
        'radial-gradient(circle at 50% 50%, transparent 35%, rgba(224,193,90,0.18) 62%, rgba(12,16,40,0.62) 100%)';
      this._overlay.style.opacity = String(0.85 * intensity);
    }
    if (freeze && timeScale) timeScale.hitStop(this.feel.bell.freezeFrames);
    if (tone) this.playTone(intensity);
  }

  /** Smaller tone used by a perfect parry (no full-screen ripple). */
  parryRing({ position = null, timeScale = this.timeScale } = {}) {
    if (timeScale) timeScale.hitStop(this.feel.time.hitStopLight);
    this.playTone(0.55, this.feel.bell.fundamental * 1.5);
    if (this._overlay) {
      this._overlay.style.background =
        'radial-gradient(circle at 50% 45%, rgba(224,193,90,0.28) 0%, transparent 42%)';
      this._overlay.style.opacity = '0.7';
    }
    if (this._ring && position) {
      this._ring.position.set(position.x, position.y + 0.05, position.z);
      this._ring2.position.copy(this._ring.position);
      this._ring.visible = this._ring2.visible = true;
      this._ring.scale.setScalar(0.4);
      this._ring2.scale.setScalar(0.25);
      this._t = 0.45;
      this._realClock = 0.45;
      this._intensity = 0.5;
      this.active = true;
    } else {
      // fade the flash even without a ring
      this._t = 0.45;
      this._realClock = 0.45;
      this._intensity = 0.5;
      this.active = true;
    }
  }

  /**
   * Advance ripple visuals. Pass rawDt (real time) so the ring can stay
   * frozen for the 2–3 hit-stop frames, then exhale with the world.
   * When `scaledDt` is 0 the overlay holds; the ring only grows once time resumes.
   */
  update(scaledDt, rawDt = scaledDt) {
    if (!this.active) return;
    const dur = this.feel.bell.rippleDuration;
    // Overlay fades on real time so the flash is visible during the freeze.
    this._realClock += Math.max(rawDt, 0);
    const overlayT = clamp(this._realClock / dur, 0, 1);
    if (this._overlay) {
      const peak = 0.65 * this._intensity;
      const op = overlayT < 0.08 ? peak : peak * (1 - (overlayT - 0.08) / 0.92);
      this._overlay.style.opacity = String(Math.max(0, op));
    }
    // World ring + post ripple follow scaled time (hold during freeze).
    this._t += Math.max(scaledDt, 0);
    const t = clamp(this._t / dur, 0, 1);
    if (this._ring) {
      const s = 0.4 + t * 16 * this._intensity;
      this._ring.scale.setScalar(s);
      this._ring2.scale.setScalar(s * 0.72);
      this._ring.material.opacity = (1 - t) * 0.85 * this._intensity;
      this._ring2.material.opacity = (1 - t) * 0.55 * this._intensity;
    }
    if (this._postMat) {
      this._postMat.uniforms.uTime.value = t;
      this._postMat.uniforms.uStrength.value = this.feel.bell.rippleStrength * this._intensity * (1 - t);
      this._postMat.uniforms.uCenter.value.copy(this._centerNDC);
    }
    if (t >= 1 && overlayT >= 1) {
      this.active = false;
      if (this._ring) this._ring.visible = this._ring2.visible = false;
      if (this._overlay) this._overlay.style.opacity = '0';
    }
  }

  /**
   * Render the scene, applying the ripple post-pass when it is active.
   * Always safe: falls back to a normal renderer.render when the pass is off.
   */
  render(renderer = this.renderer, scene = this.scene, camera = this.camera) {
    if (!renderer || !scene || !camera) return;
    if (this._postOk && this.active && this._t / this.feel.bell.rippleDuration < 1) {
      const prev = renderer.getRenderTarget();
      renderer.setRenderTarget(this._rt);
      renderer.render(scene, camera);
      renderer.setRenderTarget(prev);
      // Raw blit — already in the output color space of the default framebuffer
      // after three encodes into the RT. Disable auto output transform by
      // rendering a RawShaderMaterial (no colorspace chunk).
      renderer.render(this._postScene, this._postCam);
    } else {
      renderer.render(scene, camera);
    }
  }

  dispose() {
    if (this._onResize && typeof window !== 'undefined') {
      window.removeEventListener('resize', this._onResize);
    }
    if (this._rt) this._rt.dispose();
    if (this._overlay && this._overlay.parentNode) this._overlay.parentNode.removeChild(this._overlay);
    if (this._ring && this.scene) {
      this.scene.remove(this._ring);
      this.scene.remove(this._ring2);
    }
    if (this._audio && this._audio.state !== 'closed') this._audio.close().catch(() => {});
  }
}

// ---------------------------------------------------------------------------
// HeroMotion
// ---------------------------------------------------------------------------

/**
 * Procedural layer on a character pose node (child of the locomotion root).
 * Lean into turns with a 2–3 frame lag, squash on land, stance tiers 0/1/2
 * from shard count, and additive survival offsets (cold / wet / low HP).
 */
export class HeroMotion {
  constructor(pose, { feel = FEEL } = {}) {
    this.pose = pose;
    this.feel = feel;
    this.tier = 0;
    this.shardCount = 0;
    this.cold = 0;
    this.wet = 0;
    this.hungry = 0;
    this.lowHp = 0;
    this._velX = 0;
    this._velZ = 0;
    this._lagX = 0;
    this._lagZ = 0;
    this._leanX = 0;
    this._leanZ = 0;
    this._squash = 0;
    this._squashVel = 0;
    this._time = 0;
    this._shakeOff = 0;
    this._attackHold = 0;
  }

  /** 0–8 shards. Tiers: 0 (0–2, scrappy), 1 (3–5, tight), 2 (6+, calm). */
  setShardCount(n) {
    this.shardCount = clamp(n | 0, 0, 8);
    this.tier = this.shardCount >= 6 ? 2 : this.shardCount >= 3 ? 1 : 0;
  }

  setShardTier(tier) {
    this.tier = clamp(tier | 0, 0, 2);
    this.shardCount = this.tier === 0 ? 0 : this.tier === 1 ? 3 : 6;
  }

  /** Multiplier for attack recovery durations (scrappy > 1, calm < 1). */
  get recoveryMul() {
    return this.feel.hero.stanceRecovery[this.tier];
  }

  /** @param {{cold?:number,wet?:number,hungry?:number,lowHp?:number}} s 0–1 */
  setSurvival({ cold, wet, hungry, lowHp } = {}) {
    if (cold != null) this.cold = clamp(cold, 0, 1);
    if (wet != null) this.wet = clamp(wet, 0, 1);
    if (hungry != null) this.hungry = clamp(hungry, 0, 1);
    if (lowHp != null) this.lowHp = clamp(lowHp, 0, 1);
  }

  /** Horizontal velocity in the character's parent space (units / sec). */
  setVelocity(x, z) {
    this._velX = x;
    this._velZ = z;
  }

  /** Call on landing. `impact` 0–2 scales the squash. */
  land(impact = 1) {
    this._squashVel -= this.feel.hero.landSquash * 8 * impact;
    this._squash = Math.max(this._squash, this.feel.hero.landSquash * 0.4 * impact);
  }

  /** Tier 1+ holds a short end pose; tier 2 can be paired with a hit-stop. */
  attack(_kind = 'light') {
    const hold = [0.06, 0.14, 0.22][this.tier];
    this._attackHold = hold * this.recoveryMul;
  }

  shakeOff() {
    this._shakeOff = 0.4;
  }

  update(dt) {
    if (!this.pose || dt <= 0) return;
    const f = this.feel.hero;
    this._time += dt;
    this._attackHold = Math.max(0, this._attackHold - dt);

    const lag = Math.max(f.leanLag, 1 / 120);
    const k = 1 - Math.exp(-dt / lag);
    this._lagX += (this._velX - this._lagX) * k;
    this._lagZ += (this._velZ - this._lagZ) * k;
    const spd = Math.hypot(this._lagX, this._lagZ);
    const leanAmt = f.leanAngle * clamp(spd / 6, 0, 1);
    const tx = (-this._lagZ / (spd + 1e-5)) * leanAmt; // pitch into forward
    const tz = (this._lagX / (spd + 1e-5)) * leanAmt; // roll into strafe
    this._leanX = lerp(this._leanX, tx, 1 - Math.exp(-18 * dt));
    this._leanZ = lerp(this._leanZ, tz, 1 - Math.exp(-18 * dt));

    this._squashVel += (-this._squash * f.landSpring - this._squashVel * f.landDamp) * dt;
    this._squash += this._squashVel * dt;
    if (Math.abs(this._squash) < 0.0005 && Math.abs(this._squashVel) < 0.002) {
      this._squash = 0;
      this._squashVel = 0;
    }

    const swayAmp = f.idleSway[this.tier] * (spd < 0.4 ? 1 : 0.25);
    const swaySpeed = 1.15 + (2 - this.tier) * 0.35;
    const sway = Math.sin(this._time * swaySpeed) * swayAmp;
    const breath = Math.sin(this._time * 1.6) * swayAmp * 0.35;

    let shiver = 0;
    if (this.cold > 0.05) {
      shiver += this.cold * f.shiverAmp * hashNoise(this._time * 22, 3);
    }
    if (this._shakeOff > 0) {
      this._shakeOff -= dt;
      shiver += 0.05 * Math.sin(this._time * 40) * (this._shakeOff / 0.4);
    }

    const limp = this.lowHp * f.limpAmount;
    const limpBob = limp * Math.abs(Math.sin(this._time * 5.2)) * (spd > 0.3 ? 1 : 0.3);
    const sideLean = limp * 0.35 + this.hungry * 0.02;

    const sy = clamp(1 - this._squash + breath * 0.4 - limpBob, 0.72, 1.18);
    const sxz = Math.sqrt(1 / sy);

    this.pose.rotation.x = this._leanX;
    this.pose.rotation.z = this._leanZ + sway + shiver + sideLean;
    this.pose.rotation.y = limp * Math.sin(this._time * 2.6) * 0.08;
    this.pose.position.y = -this._squash * 0.55 - limpBob * 0.25 + (this.cold * -0.06);
    this.pose.scale.set(sxz, sy, sxz);
  }

  reset() {
    this._squash = this._squashVel = 0;
    this._leanX = this._leanZ = 0;
    this._lagX = this._lagZ = 0;
    if (this.pose) {
      this.pose.rotation.set(0, 0, 0);
      this.pose.position.y = 0;
      this.pose.scale.set(1, 1, 1);
    }
  }
}

// ---------------------------------------------------------------------------
// AfterImage
// ---------------------------------------------------------------------------

/**
 * Gold ghost copies of a mesh, used for a perfect dodge.
 */
export class AfterImage {
  constructor(scene, { feel = FEEL } = {}) {
    this.scene = scene;
    this.feel = feel;
    this._ghosts = [];
  }

  /**
   * Spawn fading gold copies of `source` (any Object3D).
   * Ghosts are shifted backward along `velocity`.
   */
  burst(source, velocity = null, count = this.feel.afterImage.count) {
    if (!source || !this.scene) return;
    source.updateMatrixWorld(true);
    const life = this.feel.afterImage.life;
    const color = this.feel.afterImage.color;
    const vel = velocity ? velocity.clone() : new THREE.Vector3(0, 0, -1);
    for (let i = 0; i < count; i++) {
      const ghost = this._cloneAsGold(source, color);
      if (!ghost) continue;
      const t = (i + 1) * this.feel.afterImage.spacing;
      ghost.position.addScaledVector(vel, -t);
      ghost.userData.life = life * (1 - i * 0.12);
      ghost.userData.maxLife = ghost.userData.life;
      ghost.userData.baseOpacity = this.feel.afterImage.opacity * (1 - i * 0.15);
      this.scene.add(ghost);
      this._ghosts.push(ghost);
    }
  }

  _cloneAsGold(source, color) {
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: this.feel.afterImage.opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      side: THREE.DoubleSide,
    });
    let ghost;
    try {
      ghost = source.clone(true);
    } catch {
      ghost = null;
    }
    if (!ghost) {
      ghost = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 1.0, 4, 8), mat);
      source.getWorldPosition(ghost.position);
      source.getWorldQuaternion(ghost.quaternion);
      return ghost;
    }
    ghost.traverse((n) => {
      if (n.isMesh) {
        n.material = mat;
        n.castShadow = n.receiveShadow = false;
      }
    });
    source.getWorldPosition(ghost.position);
    source.getWorldQuaternion(ghost.quaternion);
    source.getWorldScale(ghost.scale);
    return ghost;
  }

  update(dt) {
    for (let i = this._ghosts.length - 1; i >= 0; i--) {
      const g = this._ghosts[i];
      g.userData.life -= dt;
      const k = Math.max(0, g.userData.life / g.userData.maxLife);
      g.traverse((n) => {
        if (n.isMesh && n.material) n.material.opacity = g.userData.baseOpacity * k;
      });
      g.scale.multiplyScalar(1 + dt * 0.4);
      if (g.userData.life <= 0) {
        this.scene.remove(g);
        this._ghosts.splice(i, 1);
      }
    }
  }

  dispose() {
    for (const g of this._ghosts) this.scene.remove(g);
    this._ghosts.length = 0;
  }
}

// ---------------------------------------------------------------------------
// HitSpark
// ---------------------------------------------------------------------------

/**
 * Gold / sodium spark bursts for hits, plus an optional ink-stroke flash
 * via InkFlash (kept as a separate overlay so the game can fire it on
 * shard pickup, level-up, or a boss phase change).
 */
export class HitSpark {
  constructor(scene, { feel = FEEL } = {}) {
    this.scene = scene;
    this.feel = feel;
    this._pts = [];
    const geo = new THREE.SphereGeometry(0.035, 5, 4);
    this._geo = geo;
    this._gold = new THREE.MeshBasicMaterial({
      color: feel.colors.gold,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    this._orange = this._gold.clone();
    this._orange.color.setHex(feel.colors.sodiumOrange);
    this._red = this._gold.clone();
    this._red.color.setHex(feel.colors.signalRed);
  }

  /**
   * @param {THREE.Vector3} position
   * @param {THREE.Vector3} [normal] spray direction, default up
   * @param {number} [count]
   * @param {'gold'|'orange'|'red'} [tint]
   */
  burst(position, normal = null, count = this.feel.spark.countHeavy, tint = 'gold') {
    const mat = tint === 'red' ? this._red : tint === 'orange' ? this._orange : this._gold;
    const dir = normal ? normal.clone().normalize() : new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < count; i++) {
      const m = new THREE.Mesh(this._geo, mat);
      m.position.copy(position);
      const spread = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
        .normalize()
        .multiplyScalar(0.55);
      const vel = dir.clone().multiplyScalar(this.feel.spark.speed * (0.45 + Math.random() * 0.8)).add(
        spread.multiplyScalar(this.feel.spark.speed * 0.5)
      );
      m.userData.vel = vel;
      m.userData.life = this.feel.spark.life * (0.7 + Math.random() * 0.5);
      m.userData.maxLife = m.userData.life;
      this.scene.add(m);
      this._pts.push(m);
    }
  }

  sparks(position, normal, count, tint) {
    this.burst(position, normal, count, tint);
  }

  update(dt) {
    for (let i = this._pts.length - 1; i >= 0; i--) {
      const p = this._pts[i];
      p.userData.vel.y -= 18 * dt;
      p.position.addScaledVector(p.userData.vel, dt);
      p.userData.life -= dt;
      const k = Math.max(0, p.userData.life / p.userData.maxLife);
      p.scale.setScalar(0.4 + k * 0.8);
      if (p.userData.life <= 0) {
        this.scene.remove(p);
        this._pts.splice(i, 1);
      }
    }
  }

  dispose() {
    for (const p of this._pts) this.scene.remove(p);
    this._pts.length = 0;
    this._geo.dispose();
    this._gold.dispose();
    this._orange.dispose();
    this._red.dispose();
  }
}

// ---------------------------------------------------------------------------
// InkFlash
// ---------------------------------------------------------------------------

/** Full-screen ink-stroke / gold-seam flash for big moments (CSS overlay). */
export class InkFlash {
  constructor(parent = typeof document !== 'undefined' ? document.body : null) {
    this._el = null;
    if (!parent || typeof document === 'undefined') return;
    this._el = document.createElement('div');
    this._el.className = 'kanemori-ink-flash';
    Object.assign(this._el.style, {
      position: 'fixed',
      inset: '0',
      pointerEvents: 'none',
      zIndex: '21',
      opacity: '0',
      background:
        'linear-gradient(115deg, transparent 0%, rgba(224,193,90,0.0) 30%, rgba(224,193,90,0.55) 48%, rgba(224,32,32,0.25) 52%, rgba(12,16,40,0.0) 70%, transparent 100%)',
      mixBlendMode: 'screen',
      transform: 'translateX(-20%) scale(1.05)',
    });
    parent.appendChild(this._el);
  }

  /**
   * @param {'gold'|'red'|'ink'} [tone]
   * @param {number} [ms]
   */
  flash(tone = 'gold', ms = 280) {
    if (!this._el) return;
    const bg = {
      gold:
        'linear-gradient(115deg, transparent 0%, rgba(224,193,90,0.0) 28%, rgba(224,193,90,0.7) 48%, rgba(255,159,28,0.3) 54%, transparent 75%)',
      red:
        'linear-gradient(115deg, transparent 10%, rgba(224,32,32,0.0) 30%, rgba(224,32,32,0.65) 50%, transparent 72%)',
      ink:
        'linear-gradient(115deg, rgba(12,16,40,0.0) 20%, rgba(12,16,40,0.55) 50%, rgba(12,16,40,0.0) 80%)',
    }[tone] || tone;
    this._el.style.background = bg;
    this._el.style.transition = 'none';
    this._el.style.opacity = '1';
    this._el.style.transform = 'translateX(-18%) scale(1.04)';
    requestAnimationFrame(() => {
      this._el.style.transition = `opacity ${ms}ms ease-out, transform ${ms}ms ease-out`;
      this._el.style.opacity = '0';
      this._el.style.transform = 'translateX(18%) scale(1.08)';
    });
  }

  dispose() {
    if (this._el && this._el.parentNode) this._el.parentNode.removeChild(this._el);
  }
}

// ---------------------------------------------------------------------------
// TellIndicator
// ---------------------------------------------------------------------------

/**
 * Generic wind-up tell: scale pulse / glow, with per-type presets
 * (kodama head rattle, tanuki puff-up, mushroom cap swell + glow).
 *
 * Pass the minion root. Optional child names: `head`, `cap`.
 */
export class TellIndicator {
  constructor(object3D, type = 'kodama', { feel = FEEL } = {}) {
    this.object = object3D;
    this.type = type;
    this.feel = feel;
    this.playing = false;
    this._t = 0;
    this._duration = feel.tells[type]?.duration ?? 0.4;
    this._baseScale = object3D ? object3D.scale.clone() : new THREE.Vector3(1, 1, 1);
    this._head = object3D?.getObjectByName('head') || object3D;
    this._cap = object3D?.getObjectByName('cap') || object3D;
    this._baseEmissive = [];
    this._captureEmissive(object3D);
    this.onComplete = null;
  }

  static presets(feel = FEEL) {
    return feel.tells;
  }

  _captureEmissive(obj) {
    if (!obj) return;
    obj.traverse((n) => {
      if (n.isMesh && n.material && n.material.emissive) {
        this._baseEmissive.push({ mat: n.material, color: n.material.emissive.clone(), int: n.material.emissiveIntensity ?? 1 });
      }
    });
  }

  play(duration) {
    if (duration) this._duration = duration;
    else this._duration = this.feel.tells[this.type]?.duration ?? 0.4;
    this.playing = true;
    this._t = 0;
  }

  /** 0–1 while a tell is playing, else 0. Useful for AI / parry windows. */
  get progress() {
    return this.playing ? clamp(this._t / this._duration, 0, 1) : 0;
  }

  update(dt) {
    if (!this.object) return;
    if (!this.playing) {
      this._idle(dt);
      return;
    }
    this._t += dt;
    const p = this.feel.tells[this.type] || this.feel.tells.kodama;
    const t = clamp(this._t / this._duration, 0, 1);
    if (this.type === 'kodama') this._kodama(t, p);
    else if (this.type === 'tanuki') this._tanuki(t, p);
    else if (this.type === 'mushroom') this._mushroom(t, p);
    else this._tanuki(t, p);

    if (this._t >= this._duration) {
      this.playing = false;
      this._resetPose();
      if (this.onComplete) this.onComplete(this.type);
    }
  }

  _idle() {
    // gently restore
    this.object.scale.lerp(this._baseScale, 0.2);
  }

  _kodama(t, p) {
    const rattles = Math.sin(t * Math.PI * p.rattleHz * this._duration);
    if (this._head) this._head.rotation.z = rattles * p.rattleAmp;
    if (this._head && this._head !== this.object) {
      this._head.rotation.y = Math.sin(t * Math.PI * p.rattleHz * this._duration * 0.7) * p.rattleAmp * 0.6;
    }
    const pulse = 1 + 0.06 * Math.sin(t * Math.PI * 6);
    this.object.scale.setScalar(this._baseScale.x * pulse);
    this._glow(0.3 + 0.5 * Math.abs(rattles));
  }

  _tanuki(t, p) {
    const k = Math.sin(t * Math.PI); // puff then settle into the charge
    const s = lerp(1, p.puffScale, k);
    this.object.scale.set(this._baseScale.x * s, this._baseScale.y * (s * 0.92), this._baseScale.z * s);
    this._glow(k * 0.6);
  }

  _mushroom(t, p) {
    const k = Math.sin(t * Math.PI * 0.5); // swells and holds
    const swell = lerp(1, p.swell, k);
    if (this._cap) this._cap.scale.set(swell, swell * 0.85 + 0.15, swell);
    this.object.scale.setScalar(this._baseScale.x * (1 + 0.04 * k));
    this._glow(k * p.glow);
  }

  _glow(amount) {
    for (const e of this._baseEmissive) {
      e.mat.emissiveIntensity = e.int + amount;
    }
  }

  _resetPose() {
    this.object.scale.copy(this._baseScale);
    if (this._head) {
      this._head.rotation.z = 0;
      if (this._head !== this.object) this._head.rotation.y = 0;
    }
    if (this._cap && this._cap !== this.object) this._cap.scale.set(1, 1, 1);
    for (const e of this._baseEmissive) e.mat.emissiveIntensity = e.int;
  }
}

// ---------------------------------------------------------------------------
// JorogumoController
// ---------------------------------------------------------------------------

/**
 * Jorōgumo v0.1 state machine. Drives any Object3D placeholder along web
 * points and emits events so the game can hook damage / VFX.
 *
 * Events (constructor callbacks or `.on(event, fn)`):
 *   onTell, onAttack, onPhaseChange, onDefeat, onStun, onWebPool
 */
export class JorogumoController {
  constructor(object3D, {
    webPoints = [],
    webEdges = null,
    anchorIndices = [],
    scene = null,
    helpers = true,
    feel = FEEL,
    target = null,
    timeScale = null,
    bellRing = null,
    inkFlash = null,
    onTell = null,
    onAttack = null,
    onPhaseChange = null,
    onDefeat = null,
    onStun = null,
    onWebPool = null,
  } = {}) {
    this.object = object3D;
    this.feel = feel;
    this.scene = scene;
    this.timeScale = timeScale;
    this.bellRing = bellRing;
    this.inkFlash = inkFlash;
    this.webPoints = webPoints.map((p) => p.clone());
    this.webEdges = webEdges || JorogumoController._defaultEdges(this.webPoints.length);
    this.anchorIndices = anchorIndices.length ? anchorIndices.slice() : [1, 3, 5];
    this.anchorsCut = new Set();
    this.target = target;
    this.hp = feel.jorogumo.maxHp;
    this.maxHp = feel.jorogumo.maxHp;
    this.phase = 1;
    this.state = 'idle';
    this.alive = true;
    this.attacksInCycle = 0;
    this.currentPoint = 0;
    this._t = 0;
    this._from = new THREE.Vector3();
    this._to = new THREE.Vector3();
    this._listeners = {
      onTell: onTell ? [onTell] : [],
      onAttack: onAttack ? [onAttack] : [],
      onPhaseChange: onPhaseChange ? [onPhaseChange] : [],
      onDefeat: onDefeat ? [onDefeat] : [],
      onStun: onStun ? [onStun] : [],
      onWebPool: onWebPool ? [onWebPool] : [],
    };
    this._shadow = null;
    this._pools = [];
    this._silkLine = null;
    this._legs = null;
    this._beat = 0; // 0 weave, 1 weave, 2 strike
    this._pendingAttack = null;
    this._pullParryOpen = false;
    this._skitterTimer = 0;
    this._helpers = helpers;

    if (object3D && this.webPoints[0]) {
      object3D.position.copy(this.webPoints[0]);
    }
    if (helpers && scene) this._buildHelpers(scene);
    this._findLegs();
    this._setLegsVisible(false);
  }

  static _defaultEdges(n) {
    const edges = [];
    if (n <= 1) return edges;
    const rim = Math.min(6, n - 1);
    for (let i = 1; i <= rim; i++) edges.push([0, i]);
    for (let i = 1; i < rim; i++) edges.push([i, i + 1]);
    if (rim >= 2) edges.push([rim, 1]);
    for (let i = rim + 1; i < n; i++) edges.push([0, i], [i % rim + 1, i]);
    return edges;
  }

  on(event, fn) {
    const key = event.startsWith('on') ? event : 'on' + event[0].toUpperCase() + event.slice(1);
    if (!this._listeners[key]) this._listeners[key] = [];
    this._listeners[key].push(fn);
  }

  _emit(event, payload) {
    const fns = this._listeners[event] || [];
    for (const fn of fns) fn(payload);
  }

  _buildHelpers(scene) {
    const gold = new THREE.Color(this.feel.colors.gold);
    const silk = new THREE.LineBasicMaterial({
      color: this.feel.colors.gold,
      transparent: true,
      opacity: 0.7,
      toneMapped: false,
    });
    const pts = [];
    for (const [a, b] of this.webEdges) {
      if (!this.webPoints[a] || !this.webPoints[b]) continue;
      pts.push(this.webPoints[a], this.webPoints[b]);
    }
    if (pts.length) {
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      this._webLines = new THREE.LineSegments(geo, silk);
      scene.add(this._webLines);
    }
    // Drop-strike ground shadow (sharpens over 0.8 s).
    const shMat = new THREE.MeshBasicMaterial({
      color: 0x0a0a12,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this._shadow = new THREE.Mesh(new THREE.CircleGeometry(1.4, 32), shMat);
    this._shadow.rotation.x = -Math.PI / 2;
    this._shadow.position.y = 0.04;
    this._shadow.visible = false;
    scene.add(this._shadow);

    const silkMat = new THREE.LineBasicMaterial({ color: gold, transparent: true, opacity: 0.9, toneMapped: false });
    this._silkLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), silkMat);
    this._silkLine.visible = false;
    scene.add(this._silkLine);
  }

  _findLegs() {
    if (!this.object) return;
    this._legs = this.object.getObjectByName('legs') || null;
  }

  _setLegsVisible(v) {
    if (this._legs) this._legs.visible = v;
  }

  setTarget(objectOrVec3) {
    this.target = objectOrVec3;
  }

  _targetPos() {
    if (!this.target) return null;
    if (this.target.isObject3D) {
      this.target.getWorldPosition(_v);
      return _v;
    }
    return this.target;
  }

  /** Deal damage. At 50% HP, triggers phase 2 + BellRing. */
  takeDamage(amount) {
    if (!this.alive || this.state === 'defeat') return;
    this.hp = Math.max(0, this.hp - amount);
    if (this.phase === 1 && this.hp <= this.maxHp * this.feel.jorogumo.phase2Hp) {
      this._enterPhase2();
    }
    if (this.hp <= 0) this._defeat();
  }

  /**
   * Cut an anchor thread. If she is on the web in phase 1, she drops and
   * is stunned for 3 seconds.
   */
  cutAnchor(index = null) {
    if (!this.alive || this.phase !== 1) return;
    const idx = index == null ? this.anchorIndices.find((i) => !this.anchorsCut.has(i)) : index;
    if (idx == null) return;
    this.anchorsCut.add(idx);
    if (this.state !== 'stunned' && this.state !== 'defeat') this._stun();
  }

  /** Call when the player parries during a silk-pull window. */
  parrySilk() {
    if (!this._pullParryOpen) return false;
    this._pullParryOpen = false;
    this._hideSilk();
    this._emit('onAttack', { type: 'silkPull', parried: true, hit: false });
    this._stun(1.2);
    if (this.timeScale) this.timeScale.hitStop(this.feel.time.hitStopBossStagger);
    return true;
  }

  get parryWindowOpen() {
    return this._pullParryOpen;
  }

  start() {
    if (this.state === 'idle') this._beginWeave();
  }

  _emitTell(type, extra = {}) {
    this._emit('onTell', { type, phase: this.phase, ...extra });
  }

  _enterPhase2() {
    this.phase = 2;
    this.attacksInCycle = 0;
    this._pullParryOpen = false;
    this._setLegsVisible(true);
    this.state = 'phaseChange';
    this._t = 0;
    const pos = this.object ? this.object.position : this.webPoints[0];
    if (this.bellRing) this.bellRing.ring({ position: pos, intensity: 1.15, timeScale: this.timeScale });
    if (this.inkFlash) this.inkFlash.flash('gold', 420);
    if (this.timeScale) this.timeScale.hitStop(this.feel.bell.freezeFrames);
    this._emit('onPhaseChange', { phase: 2, hp: this.hp });
  }

  _defeat() {
    this.alive = false;
    this.state = 'defeat';
    this._t = 0;
    this._pullParryOpen = false;
    this._hideSilk();
    if (this._shadow) this._shadow.visible = false;
    this._emit('onDefeat', { position: this.object ? this.object.position.clone() : null });
  }

  _stun(duration = this.feel.jorogumo.stunDuration) {
    this.state = 'stunned';
    this._t = 0;
    this._stunFor = duration;
    this._pullParryOpen = false;
    this._hideSilk();
    if (this._shadow) this._shadow.visible = false;
    // Drop toward the ground.
    if (this.object) {
      this._from.copy(this.object.position);
      this._to.set(this.object.position.x, 0.9, this.object.position.z);
    }
    this._emit('onStun', { duration, phase: this.phase });
  }

  _hideSilk() {
    if (this._silkLine) this._silkLine.visible = false;
  }

  _beginWeave() {
    if (!this.webPoints.length) {
      this.state = 'idle';
      return;
    }
    const neighbors = this._neighbors(this.currentPoint);
    let next = neighbors[Math.floor(Math.random() * Math.max(neighbors.length, 1))] ?? ((this.currentPoint + 1) % this.webPoints.length);
    // Prefer staying off the ground in phase 1.
    if (this.phase === 1) {
      const air = neighbors.filter((i) => this.webPoints[i].y > 2);
      if (air.length) next = air[Math.floor(Math.random() * air.length)];
    }
    this._from.copy(this.webPoints[this.currentPoint] || this.object.position);
    this._to.copy(this.webPoints[next]);
    this.currentPoint = next;
    this.state = 'weave';
    this._t = 0;
  }

  _neighbors(i) {
    const out = [];
    for (const [a, b] of this.webEdges) {
      if (a === i) out.push(b);
      else if (b === i) out.push(a);
    }
    return out;
  }

  _pickGroundPoint() {
    const grounds = this.webPoints.map((p, i) => [p, i]).filter(([p]) => p.y < 2);
    if (!grounds.length) return { p: new THREE.Vector3(0, 0.05, 0), i: 0 };
    const tgt = this._targetPos();
    if (tgt) {
      grounds.sort((a, b) => a[0].distanceTo(tgt) - b[0].distanceTo(tgt));
      return { p: grounds[0][0], i: grounds[0][1] };
    }
    return { p: grounds[0][0], i: grounds[0][1] };
  }

  _beginStrike() {
    // 50/50 silk lash vs drop strike in phase 1.
    const drop = Math.random() < 0.45 || this._beat === 2 && Math.random() < 0.3;
    if (drop) {
      this.state = 'dropTell';
      this._t = 0;
      this._from.copy(this.object.position);
      const g = this._pickGroundPoint();
      this._dropAt = g.p.clone();
      if (this._shadow) {
        this._shadow.visible = true;
        this._shadow.position.set(this._dropAt.x, 0.04, this._dropAt.z);
        this._shadow.scale.setScalar(2.4);
        this._shadow.material.opacity = 0.08;
      }
      this._emitTell('dropStrike', { at: this._dropAt.clone() });
    } else {
      this.state = 'lashTell';
      this._t = 0;
      this._emitTell('silkLash');
    }
  }

  _afterAttack() {
    this.attacksInCycle += 1;
    if (this.phase === 1 && this.attacksInCycle >= this.feel.jorogumo.retreatAfterAttacks) {
      this.attacksInCycle = 0;
      this._beginRetreat();
    } else {
      this._beat = 0;
      this._beginWeave();
    }
  }

  _beginRetreat() {
    this.state = 'retreat';
    this._t = 0;
    // Highest web point (canopy).
    let high = 0;
    for (let i = 0; i < this.webPoints.length; i++) {
      if (this.webPoints[i].y > this.webPoints[high].y) high = i;
    }
    this._from.copy(this.object.position);
    this._to.copy(this.webPoints[high]);
    this.currentPoint = high;
  }

  update(dt) {
    if (!this.object) return;
    this._updatePools(dt);
    if (!this.alive && this.state === 'defeat') {
      this._updateDefeat(dt);
      return;
    }
    if (dt <= 0) return; // frozen with the world
    this._t += dt;
    switch (this.state) {
      case 'idle':
        if (this._t > 0.4) this._beginWeave();
        break;
      case 'weave':
        this._tickWeave();
        break;
      case 'lashTell':
        this._tickLashTell();
        break;
      case 'lash':
        this._tickLash();
        break;
      case 'dropTell':
        this._tickDropTell();
        break;
      case 'dropStrike':
        this._tickDropStrike();
        break;
      case 'retreat':
        this._tickRetreat();
        break;
      case 'stunned':
        this._tickStunned();
        break;
      case 'phaseChange':
        if (this._t > 0.7) this._beginSkitter();
        break;
      case 'skitter':
        this._tickSkitter();
        break;
      case 'webPool':
        this._tickWebPool();
        break;
      case 'silkPullTell':
        this._tickPullTell();
        break;
      case 'silkPull':
        this._tickSilkPull();
        break;
      default:
        break;
    }
    this._poseBody(dt);
  }

  _smooth(t) {
    return t * t * (3 - 2 * t);
  }

  _tickWeave() {
    const dur = this.feel.jorogumo.weaveDuration;
    const k = this._smooth(clamp(this._t / dur, 0, 1));
    this.object.position.lerpVectors(this._from, this._to, k);
    // Graceful glide: slight bob, face along the thread.
    this.object.position.y += Math.sin(k * Math.PI) * 0.12;
    _v.copy(this._to).sub(this._from);
    if (_v.lengthSq() > 0.01) {
      const yaw = Math.atan2(_v.x, _v.z);
      this.object.rotation.y = lerp(this.object.rotation.y, yaw, 0.2);
    }
    if (this._t >= dur) {
      this._beat = (this._beat + 1) % 3;
      if (this._beat === 2) this._beginStrike();
      else this._beginWeave();
    }
  }

  _tickLashTell() {
    // 6-frame fan raise.
    const dur = this.feel.jorogumo.silkLashTell;
    const fan = this.object.getObjectByName('fan') || this.object;
    if (fan) fan.rotation.x = -0.8 * clamp(this._t / dur, 0, 1);
    if (this._t >= dur) {
      this.state = 'lash';
      this._t = 0;
      this._whipsLeft = 2;
      this._emit('onAttack', { type: 'silkLash', whip: 1, phase: 1 });
    }
  }

  _tickLash() {
    const gap = this.feel.jorogumo.silkLashWhipGap;
    const fan = this.object.getObjectByName('fan') || this.object;
    if (fan) fan.rotation.x = -0.8 + Math.sin(this._t * 30) * 0.25;
    if (this._whipsLeft === 2 && this._t >= gap) {
      this._whipsLeft = 1;
      this._emit('onAttack', { type: 'silkLash', whip: 2, phase: 1 });
    }
    if (this._t >= this.feel.jorogumo.strikeDuration) {
      if (fan && fan !== this.object) fan.rotation.x = 0;
      this._afterAttack();
    }
  }

  _tickDropTell() {
    const dur = this.feel.jorogumo.dropShadowTime;
    const k = clamp(this._t / dur, 0, 1);
    if (this._shadow) {
      // Sharpens: large + soft → small + dark.
      this._shadow.scale.setScalar(lerp(2.6, 0.9, k));
      this._shadow.material.opacity = lerp(0.08, 0.72, k * k);
    }
    // She rises slightly, gathering herself.
    if (this.object) this.object.position.y = lerp(this.object.position.y, this._from.y + 0.6, 0.08);
    if (this._t >= dur) {
      this.state = 'dropStrike';
      this._t = 0;
      this._from.copy(this.object.position);
      this._to.copy(this._dropAt);
      this._to.y = 0.9;
    }
  }

  _tickDropStrike() {
    const dur = 0.28;
    const k = this._smooth(clamp(this._t / dur, 0, 1));
    this.object.position.lerpVectors(this._from, this._to, k);
    if (this._t >= dur && !this._dropHit) {
      this._dropHit = true;
      if (this._shadow) this._shadow.material.opacity = 0.2;
      this._emit('onAttack', { type: 'dropStrike', at: this._to.clone(), phase: 1 });
      if (this.timeScale) this.timeScale.hitStop(this.feel.time.hitStopHeavy);
    }
    if (this._t >= dur + 0.25) {
      this._dropHit = false;
      if (this._shadow) this._shadow.visible = false;
      this._afterAttack();
    }
  }

  _tickRetreat() {
    const dur = this.feel.jorogumo.retreatDuration;
    const k = this._smooth(clamp(this._t / dur, 0, 1));
    this.object.position.lerpVectors(this._from, this._to, k);
    if (this._t >= dur) {
      this._beat = 0;
      this._beginWeave();
    }
  }

  _tickStunned() {
    const fall = Math.min(this._t / 0.28, 1);
    this.object.position.lerpVectors(this._from, this._to, this._smooth(fall));
    this.object.rotation.z = Math.sin(this._t * 18) * 0.04 * (1 - fall);
    if (this._t >= (this._stunFor || this.feel.jorogumo.stunDuration)) {
      this.object.rotation.z = 0;
      if (this.phase === 2) this._beginSkitter();
      else {
        this._beat = 0;
        this._beginWeave();
      }
    }
  }

  _beginSkitter() {
    this.state = 'skitter';
    this._t = 0;
    this._skitterTimer = 0;
    this._skitterSteps = 0;
    this._pickSkitterTarget();
  }

  _pickSkitterTarget() {
    const tgt = this._targetPos();
    this._from.copy(this.object.position);
    if (tgt) {
      const dir = _v2.copy(tgt).sub(this.object.position);
      dir.y = 0;
      const dist = dir.length();
      if (dist > 0.001) dir.multiplyScalar(Math.min(3.2, Math.max(1.1, dist - 1.4)) / dist);
      this._to.copy(this.object.position).add(dir);
      this._to.y = 0.9;
    } else {
      const g = this._pickGroundPoint();
      this._to.copy(g.p);
      this._to.y = 0.9;
    }
  }

  _tickSkitter() {
    // Staccato: short dashes with sudden stops, then a retarget.
    const step = this.feel.jorogumo.skitterStep;
    const period = step * 2.2;
    const cycle = this._t % period;
    const moving = cycle < step * 1.15;
    if (moving) {
      const k = clamp(cycle / (step * 1.15), 0, 1);
      this.object.position.lerpVectors(this._from, this._to, this._smooth(k));
    }
    const stepIndex = Math.floor(this._t / period);
    if (stepIndex > this._skitterSteps) {
      this._skitterSteps = stepIndex;
      this._from.copy(this.object.position);
      this._pickSkitterTarget();
    }
    _v.copy(this._to).sub(this.object.position);
    if (_v.lengthSq() > 0.01) this.object.rotation.y = Math.atan2(_v.x, _v.z);
    // After a short chase, either spit a web pool or silk-pull.
    if (this._t > 1.6) {
      if (Math.random() < 0.5) this._beginWebPool();
      else this._beginSilkPull();
    }
  }

  _beginWebPool() {
    this.state = 'webPool';
    this._t = 0;
    this._emitTell('webPool');
  }

  _tickWebPool() {
    if (this._t >= 0.28 && !this._pooled) {
      this._pooled = true;
      const at = this.object.position.clone();
      at.y = 0.05;
      this._spawnPool(at);
      this._emit('onAttack', { type: 'webPool', at, radius: this.feel.jorogumo.webPoolRadius, phase: 2 });
      this._emit('onWebPool', { at, radius: this.feel.jorogumo.webPoolRadius, duration: this.feel.jorogumo.webPoolDuration });
    }
    if (this._t >= 0.7) {
      this._pooled = false;
      this._beginSkitter();
    }
  }

  _spawnPool(at) {
    if (!this.scene) return;
    const mat = new THREE.MeshBasicMaterial({
      color: this.feel.colors.silk,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(new THREE.CircleGeometry(this.feel.jorogumo.webPoolRadius, 24), mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.copy(at);
    this.scene.add(mesh);
    this._pools.push({ mesh, life: this.feel.jorogumo.webPoolDuration });
  }

  _updatePools(dt) {
    for (let i = this._pools.length - 1; i >= 0; i--) {
      const p = this._pools[i];
      p.life -= dt > 0 ? dt : 0;
      p.mesh.material.opacity = 0.35 * clamp(p.life / 0.6, 0, 1);
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this._pools.splice(i, 1);
      }
    }
  }

  _beginSilkPull() {
    this.state = 'silkPullTell';
    this._t = 0;
    this._pullParryOpen = false;
    this._emitTell('silkPull');
  }

  _tickPullTell() {
    const dur = this.feel.jorogumo.silkPullTell;
    this._drawSilk(clamp(this._t / dur, 0, 1) * 0.4);
    if (this._t >= dur) {
      this.state = 'silkPull';
      this._t = 0;
      this._pullParryOpen = true;
    }
  }

  _tickSilkPull() {
    const window = this.feel.jorogumo.silkPullParryWindow;
    this._drawSilk(1);
    if (this._t >= window) {
      this._pullParryOpen = false;
      if (!this._pulled) {
        this._pulled = true;
        this._emit('onAttack', { type: 'silkPull', parried: false, hit: true, phase: 2 });
      }
    }
    if (this._t >= window + 0.35) {
      this._pulled = false;
      this._hideSilk();
      this._beginSkitter();
    }
  }

  _drawSilk(frac) {
    if (!this._silkLine) return;
    const tgt = this._targetPos();
    if (!tgt) return;
    const a = this.object.position.clone();
    const b = a.clone().lerp(tgt, frac);
    this._silkLine.geometry.dispose();
    this._silkLine.geometry = new THREE.BufferGeometry().setFromPoints([a, b]);
    this._silkLine.visible = true;
  }

  _updateDefeat(dt) {
    this._t += Math.max(dt, 0.016 * 0.3);
    // Curl up and drift upward as dissolving silk.
    const k = clamp(this._t / 2.4, 0, 1);
    this.object.scale.setScalar(lerp(1, 0.15, k));
    this.object.position.y += dt * 1.4;
    this.object.rotation.y += dt * 0.8;
    this.object.traverse((n) => {
      if (n.isMesh && n.material && n.material.transparent !== undefined) {
        n.material.transparent = true;
        n.material.opacity = 1 - k;
      }
    });
    if (k >= 1) this.object.visible = false;
  }

  _poseBody(dt) {
    // Phase 1: graceful idle sway. Phase 2: staccato twitch on the legs.
    if (this.phase === 1 && (this.state === 'weave' || this.state === 'idle' || this.state === 'retreat')) {
      this.object.rotation.z = Math.sin(this._t * 2.2) * 0.04;
    }
    if (this.phase === 2 && this._legs) {
      this._legs.rotation.y += dt * 8;
    }
  }

  dispose() {
    if (this.scene) {
      if (this._webLines) this.scene.remove(this._webLines);
      if (this._shadow) this.scene.remove(this._shadow);
      if (this._silkLine) this.scene.remove(this._silkLine);
      for (const p of this._pools) this.scene.remove(p.mesh);
    }
  }
}

// ---------------------------------------------------------------------------
// Convenience installer
// ---------------------------------------------------------------------------

/**
 * Wire the common feel objects in one call. Returns the instances so the
 * game can keep its own loop.
 */
export function installFeel({
  renderer,
  scene,
  camera,
  heroPose,
  overlayParent = typeof document !== 'undefined' ? document.body : null,
  feel = FEEL,
} = {}) {
  const time = new TimeScale({ feel });
  const cameraFX = new CameraFX(camera, { feel });
  const bell = new BellRing({ renderer, scene, camera, overlayParent, timeScale: time, feel });
  const hero = heroPose ? new HeroMotion(heroPose, { feel }) : null;
  const afterimage = scene ? new AfterImage(scene, { feel }) : null;
  const sparks = scene ? new HitSpark(scene, { feel }) : null;
  const ink = new InkFlash(overlayParent);
  return { FEEL: feel, time, cameraFX, bell, hero, afterimage, sparks, ink };
}
