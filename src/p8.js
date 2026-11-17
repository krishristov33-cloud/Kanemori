/* ============ v0.2: BOW (Hunter 2) ============ */
WEAPONS.yumi={name:'Hankyū short bow',ammo:'arrow',icon:'🏹',dmg:13,heavy:28,stL:6,stH:14,combo:1,speed:1,reach:30,arc:.3,len:1.2,col:0x6a4a30,ranged:true};
ITEMS.arrow=['➶','Arrows'];ITEMS.firearrow=['🔥','Fire arrows'];ITEMS.kunai=['🗡️','Kunai'];
/* ---- v0.3 ranged: daikyū longbow upgrade, throwing kunai, fire arrows, arrow pickup, draw-charge ---- */
WEAPONS.daikyu={name:'Daikyū longbow',icon:'🏹',dmg:19,heavy:42,stL:7,stH:16,combo:1,speed:1,reach:42,arc:.3,len:1.7,col:0x3a2414,ranged:true,ammo:'arrow'};
WEAPONS.kunai={name:'Throwing kunai',icon:'🗡️',dmg:11,heavy:22,stL:4,stH:9,combo:1,speed:1,reach:22,arc:.3,len:.45,col:0x50505a,ranged:true,thrown:true,ammo:'kunai'};
RECIPES.splice(2,0,{cat:'Weapons',id:'yumi',out:'w:yumi',cost:{wood:3,fiber:3,bamboo:1},need:'forge',skill:'bow',ds:'Needs Hunter: Yumi Bow. LMB quick shot 13, RMB power shot 28. Uses arrows.'},
 {cat:'Weapons',id:'arrow',out:'arrow',n:6,cost:{wood:1,stone:1},skill:'bow',ds:'6 arrows. Needs Hunter: Yumi Bow.'});
TIMING.yumi={L:[[.12,.45]],H:[.15+.35,.85]};TIMING.daikyu={L:[[.16,.55]],H:[.62,1.0]};TIMING.kunai={L:[[.07,.28]],H:[.16,.45]};
RECIPES.splice(4,0,{cat:'Weapons',id:'daikyu',out:'w:daikyu',cost:{bamboo:3,fiber:4,silk:1,wood:2},need:'forge',skill:'bow',ds:'Longbow upgrade: 19 quick / 42 power shot, longer range, flatter arc.'},
 {cat:'Weapons',id:'kunai_w',out:'w:kunai',cost:{iron:1,wood:1},need:'forge',ds:'Throwing kunai (weapon). Quick throws 11, heavy throw 22. Uses kunai ammo; recover them after throwing.'},
 {cat:'Weapons',id:'kunai',out:'kunai',n:6,cost:{iron:1,stone:1},need:'forge',ds:'6 kunai (ammo for the throwing kunai).'},
 {cat:'Weapons',id:'firearrow',out:'firearrow',n:3,cost:{arrow:3,sap:1,fiber:1},need:'fire',skill:'bow',ds:'3 fire arrows: burn the target. R switches arrow type.'});

function ammoFor(w){if(w.thrown)return'kunai';const pref=S.ammo||'arrow';if((S.inv[pref]||0)>0)return pref;const alt=pref==='arrow'?'firearrow':'arrow';return(S.inv[alt]||0)>0?alt:pref;}
function toggleAmmo(){S.ammo=(S.ammo||'arrow')==='arrow'?'firearrow':'arrow';toast('Arrows: '+(S.ammo==='firearrow'?'🔥 fire arrows ('+(S.inv.firearrow||0)+')':'➶ arrows ('+(S.inv.arrow||0)+')'));refreshHotbar();}
function fireArrow(heavy){const w=W(),am=ammoFor(w);if(!(S.inv[am]>0)){toast(w.thrown?'No kunai left. Pick them up or craft more (I → Weapons).':'No arrows. Craft them (I → Weapons) or pick spent ones up.');return;}const cost=heavy?w.stH:w.stL;if(S.st<cost*.5){toast('Too tired!');return;}useSt(cost);
 const T=TIMING[S.eq]||TIMING.yumi;const[hitAt,dur]=heavy?T.H:T.L[0];P.atk={heavy,t:0,dur,hitAt,hit:false,idx:0,bow:true};P.comboT=0;}
function releaseArrow(heavy){const w=W(),am=ammoFor(w);if(!(S.inv[am]>0))return;S.inv[am]--;refreshHotbar();const fire=am==='firearrow',thrown=!!w.thrown;const from=hero.position.clone().add(new V3(0,1.45,0));let dir;const tgt=P.lock&&P.lock.alive!==false?P.lock:null;
 if(tgt)dir=new V3().subVectors(tgt.pos.clone().add(new V3(0,tgt.isBoss?1.8:.8,0)),from).normalize();else{dir=new V3();camera.getWorldDirection(dir);dir.y+=.04;dir.normalize();}
 const m=thrown?new THREE.Mesh(new THREE.OctahedronGeometry(.16,0),std(0x50505a,{metalness:.8,roughness:.3})):new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.9,4),std(fire?0xff7a2a:0xe8dcc0,{emissive:fire?0xff5a10:heavy?0xffcf5a:0x000000,emissiveIntensity:fire||heavy?1.5:0}));m.position.copy(from);m.quaternion.setFromUnitVectors(new V3(0,1,0),dir);scene.add(m);
 const spd=(heavy?48:36)*(S.eq==='daikyu'?1.2:thrown?.75:1);projs.push({m,v:dir.multiplyScalar(spd),t:0,arrow:true,fire,thrown,ammo:am,dmg:Math.round((heavy?w.heavy:w.dmg)*(has('keen')?1.1:1)*(fire?1.15:1)),grav:(heavy?2:6)*(S.eq==='daikyu'?.6:thrown?1.6:1)});noise(.08,thrown?2200:3500,.15);}
/* ============ v0.2: EARTH WALL (Kami 3) ============ */
const walls=[];
function castEarth(){if(!has('earth')){toast('Learn Earth Wall first: Way of the Kami (K).');return;}if(S.sp<20){toast('Not enough spirit 霊力');return;}S.sp-=20;
 const x=hero.position.x+Math.sin(P.yaw)*2.2,z=hero.position.z+Math.cos(P.yaw)*2.2,y=H(x,z);const g=new THREE.Group();g.position.set(x,y-2.4,z);g.rotation.y=P.yaw;
 for(let i=-1;i<=1;i++){const b=new THREE.Mesh(new THREE.DodecahedronGeometry(1,0),std(0x7a7068));b.scale.set(.9,1.6,.6);b.position.set(i*1.4,1.1,0);b.castShadow=b.receiveShadow=true;g.add(b);}
 const roof=new THREE.Mesh(new THREE.BoxGeometry(4.4,.3,2.6),std(0x6a625a));roof.position.set(0,2.6,-1);roof.rotation.x=.25;g.add(roof);scene.add(g);
 const cs=[-1,0,1].map(i=>({x:x+Math.cos(P.yaw)*i*1.4,z:z-Math.sin(P.yaw)*i*1.4,r:.85}));cs.forEach(c=>colliders.push(c));
 walls.push({g,x,z,t:30,cs,rise:0,y});shake(.2);noise(.5,200,.5);burst(new V3(x,y+.5,z),0x9a8a7a,20,5,.6);toast('Earth wall: blocks yokai and counts as storm cover for 30 s');P.castT=.35;}
function updWalls(dt){for(let i=walls.length-1;i>=0;i--){const w=walls[i];w.t-=dt;w.rise=Math.min(1,w.rise+dt*4);w.g.position.y=w.y-2.4*(1-w.rise)-(w.t<1?(1-w.t)*2.4:0);
 if(w.t<=0){scene.remove(w.g);w.cs.forEach(c=>{const k=colliders.indexOf(c);if(k>=0)colliders.splice(k,1);});walls.splice(i,1);}}}
const nearWall=()=>walls.some(w=>Math.hypot(w.x-hero.position.x,w.z-hero.position.z)<3.4);
/* ============ v0.2: HUT tier + Kanemura SHRINE ============ */
RECIPES.splice(RECIPES.findIndex(r=>r.id==='leanto')+1,0,{cat:'Camp',id:'hut',out:'b:hut',cost:{wood:8,bamboo:4,fiber:4},ds:'Place with B. Full storm protection, +2 warmth/s, saves the game and is your respawn point.'});
ITEMS.hut_kit=['🛖','Hut kit'];
const SHRINE={x:-24,z:134};
{const g=new THREE.Group();g.position.set(SHRINE.x,H(SHRINE.x,SHRINE.z),SHRINE.z);g.rotation.y=.9;const base=new THREE.Mesh(new THREE.BoxGeometry(3,.4,3),std(0x8d8a86));base.position.y=.2;g.add(base);
 const hall=new THREE.Mesh(new THREE.BoxGeometry(2.2,1.8,1.8),std(0xb3241c,{emissive:0x400000,emissiveIntensity:.3}));hall.position.y=1.3;g.add(hall);const rf=new THREE.Mesh(new THREE.CylinderGeometry(0,2.2,1.2,4),std(0x2a2e40));rf.rotation.y=Math.PI/4;rf.position.y=2.8;g.add(rf);
 const rope=new THREE.Mesh(new THREE.TorusGeometry(.7,.06,4,12,Math.PI),std(0xe8dcb0));rope.position.set(0,2,.95);rope.rotation.z=Math.PI;g.add(rope);
 for(const sx of[-.6,.6]){const s=new THREE.Mesh(new THREE.PlaneGeometry(.15,.35),new THREE.MeshStandardMaterial({color:0xffffff,side:THREE.DoubleSide,emissive:0xffffff,emissiveIntensity:.3}));s.position.set(sx,1.7,.96);g.add(s);}
 const l=new THREE.PointLight(0xffb060,5,9,1.6);l.position.set(0,2,1.6);g.add(l);g.traverse(o=>{if(o.isMesh)o.castShadow=true});scene.add(g);colliders.push({x:SHRINE.x,z:SHRINE.z,r:1.6});}
function shrineRest(){try{if(V03.anim&&V03.anim.clips.pray)V03.anim.play('pray',{fade:.2});}catch(e){}S.hp=DERIV.maxHp();S.st=DERIV.maxSt();S.sp=DERIV.maxSp();S.warm=100;S.wet=0;P.poison=0;S.restPoint=[SHRINE.x+2.5,SHRINE.z+2.5];
 if(isNight())S.time=0.02;save();bellRing(hero.position.clone(),1);areaTitle('祈り','RESTED AT THE SHRINE','Health, stamina, spirit and warmth restored · game saved'+(S.time<0.05?' · you slept until dawn':''));}
/* ============ v0.2: SWIMMING (Taki Pool is deep; river is wading) ============ */
const inDeep=(x,z)=>Math.hypot(x-66,z+104)<7.5;
/* ============ v0.2: Aether motion module (optional, fallback to built-in feel) ============ */
const KMF={};let ripplePass=null,rippleRT=null,rippleScene=null,rippleMat=null;
const RIPPLE_SHADER={uniforms:{tDiffuse:{value:null},uCenter:{value:new THREE.Vector2(.5,.5)},uTime:{value:0},uStrength:{value:0},uTint:{value:new THREE.Color(0xe0c15a)}},
 vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}`,
 fragmentShader:`uniform sampler2D tDiffuse;uniform vec2 uCenter;uniform float uTime;uniform float uStrength;uniform vec3 uTint;varying vec2 vUv;
 void main(){vec2 uv=vUv;float dist=distance(uv,uCenter);float ring=1.0-smoothstep(0.0,0.07,abs(dist-uTime*0.78));float fall=1.0-uTime;vec2 dir=normalize(uv-uCenter+1e-5);uv+=dir*ring*uStrength*fall;
 vec4 col=texture2D(tDiffuse,uv);col.rgb+=uTint*ring*fall*0.22;gl_FragColor=col;
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`};
function rippleState(){const B=KMF.bell;if(!B||!B.active)return null;try{const dur=B.feel.bell.rippleDuration,t=clamp(B._t/dur,0,1);if(t>=1)return null;return{t,c:B._centerNDC,s:B.feel.bell.rippleStrength*B._intensity*(1-t),tint:B.feel.colors.gold};}catch(e){return null;}}
function setRippleUniforms(u,r){u.uTime.value=r.t;u.uStrength.value=r.s;u.uCenter.value.copy(r.c);}
function renderWithRipple(){const r=rippleState();if(window.KM&&KM.camOv){camera.position.copy(KM.camOv.p);camera.lookAt(KM.camOv.t);camera.updateMatrixWorld();}/* debug/screenshot camera override */
 if(FXQ.on&&composer){if(ripplePass){ripplePass.enabled=!!r;if(r)setRippleUniforms(ripplePass.uniforms,r);}composer.render();return;}
 if(!r){renderer.render(scene,camera);return;}
 try{if(!rippleRT){const sz=new THREE.Vector2();renderer.getDrawingBufferSize(sz);rippleRT=new THREE.WebGLRenderTarget(sz.x,sz.y,{type:THREE.HalfFloatType});
   rippleMat=new THREE.ShaderMaterial({uniforms:THREE.UniformsUtils.clone(RIPPLE_SHADER.uniforms),vertexShader:RIPPLE_SHADER.vertexShader,fragmentShader:RIPPLE_SHADER.fragmentShader,depthTest:false,depthWrite:false});
   rippleScene=new THREE.Scene();rippleScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),rippleMat));addEventListener('resize',()=>{const s2=new THREE.Vector2();renderer.getDrawingBufferSize(s2);rippleRT.setSize(s2.x,s2.y);});}
  renderer.setRenderTarget(rippleRT);renderer.render(scene,camera);renderer.setRenderTarget(null);rippleMat.uniforms.tDiffuse.value=rippleRT.texture;setRippleUniforms(rippleMat.uniforms,r);renderer.render(rippleScene,KMF._oc||(KMF._oc=new THREE.OrthographicCamera(-1,1,1,-1,0,1)));}
 catch(e){renderer.setRenderTarget(null);renderer.render(scene,camera);}}
async function loadMotion(){if(QS.get('motion')==='0')return;try{const M=await import('./motion/kanemori-motion.js');
  KMF.bell=new M.BellRing({scene,camera,overlayParent:document.body});// no renderer: we own the render path (bloom-safe ripple), module owns state/tone/ring/vignette
  KMF.sparks=new M.HitSpark(scene);KMF.after=new M.AfterImage(scene);KMF.ink=new M.InkFlash(document.body);
  KMF.pose=pose;KMF.hero=new M.HeroMotion(pose);KMF.ok=true;console.info('[KM] Aether motion module loaded');}
 catch(e){for(const k of Object.keys(KMF))delete KMF[k];kmWarn('Motion module not found — using built-in game feel ('+(e&&e.message||e)+')');}}
function motionUpdate(dt,raw){if(!KMF.ok)return;try{const sp=P.vel;const lx=Math.cos(P.yaw)*sp.x-Math.sin(P.yaw)*sp.z,lz=Math.sin(P.yaw)*sp.x+Math.cos(P.yaw)*sp.z;
 KMF.hero.setVelocity(lx,lz);KMF.hero.setShardCount(S.shards);KMF.hero.setSurvival({cold:clamp((30-S.warm)/30,0,1),wet:S.wet/100,hungry:S.hun<20?1:0,lowHp:S.hp<DERIV.maxHp()*.25?1:0});
 if(!(V03&&V03.anim))KMF.hero.update(P.dodge>0?0:dt);else if(!KMF._v4off){KMF._v4off=1;KMF.hero.reset();}/* v0.4: the old procedural pose layer (lean+22 Hz cold shiver+squash) was stacking on the rigged Ren = jitter */KMF.sparks.update(dt);KMF.after.update(dt);KMF.bell.update(dt,raw);}catch(e){kmWarn('Motion module error, switching to built-in feel: '+e.message);KMF.ok=false;pose.rotation.set(0,0,0);pose.position.set(0,0,0);pose.scale.set(1,1,1);}}
