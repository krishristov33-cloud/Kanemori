/* =====================================================================
   v0.3 SECTION: ANIMATION INTEGRATION LAYER — Aether's motion/v03
   ren.glb + villager.glb + horse.glb + cart.glb driven by locomotion.js
   (CharacterAnimator / HorseAnimator). Loaded at boot if present (re-checked
   every 30 s otherwise). Any failure keeps the procedural Ren (fallback).
   ?v03=0 forces the fallback.
   ===================================================================== */
const V03={state:'none',tries:0,LM:null,ren:null,anim:null,dummy:new THREE.Object3D(),villG:null,horseG:null,cartG:null,SkU:null,hidden:[],lastAtk:null,lastDodge:0,lastHp:0,riding:false,horse:null,horseAnim:null,cart:null};
window.KMV03=null;
async function probeV03(){if(V03.state!=='none'||location.protocol==='file:'||QS.get('v03')==='0')return;V03.tries++;
 try{const r=await fetch('motion/v03/locomotion.js',{method:'HEAD',cache:'no-store'});if(!r.ok)return;}catch(e){return;}
 V03.state='loading';
 try{const[LM,{GLTFLoader},SkU]=await Promise.all([import('./motion/v03/locomotion.js'),import('three/addons/loaders/GLTFLoader.js'),import('three/addons/utils/SkeletonUtils.js')]);V03.LM=LM;V03.SkU=SkU;
  const L=new GLTFLoader(),get=f=>L.loadAsync('motion/v03/'+f).catch(()=>null);
  // v0.4: Aether's motion/v04/ren.glb (66 clips, same skeleton) replaces v03 Ren when present; clips.json gives hit/cancel windows + root speed
  const v4ren=await fetch('motion/v04/clips.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null);
  const ren4=v4ren?await L.loadAsync('motion/v04/ren.glb').catch(()=>null):null;if(ren4&&v4ren){V4.CM=v4ren.combat||{};V4.v04=true;}
  const[ren,vil,hor,cart]=await Promise.all([ren4?Promise.resolve(ren4):get('ren.glb'),get('villager.glb'),get('horse.glb'),get('cart.glb')]);
  if(ren)attachRen(ren);V03.villG=vil;V03.horseG=hor;V03.cartG=cart;
  window.KMV03={makeVillager:vil?makeVillagerRig:null,makeHorse:hor?makeHorseRig:null,makeCart:cart?()=>{const c=SkU.clone(cart.scene);LM.toonify(c);c.traverse(o=>{if(o.isMesh)o.castShadow=true});return c;}:null};
  if(vil)buildPeople();if(hor&&horseMesh){scene.remove(horseMesh);horseMesh=null;if(cartMesh){scene.remove(cartMesh);cartMesh=null;}if(S.horse)mkHorse();}
  V03.state='loaded';console.log('[kanemori] Aether v03 rigs loaded: ren',!!ren,'villager',!!vil,'horse',!!hor,'cart',!!cart);}
 catch(e){V03.state='failed';console.warn('[kanemori] v03 motion load failed, keeping procedural Ren',e);}}
function attachRen(g){try{const LM=V03.LM;LM.toonify(g.scene);
  // hide the procedural body meshes (weapon pivot moves to Ren's hand socket)
  body.traverse(m=>{if(m.isMesh&&!isUnder(m,weaponPivot)&&m.visible){m.visible=false;V03.hidden.push(m);}});
  const holder=new THREE.Group();holder.add(g.scene);pose.add(holder);g.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.frustumCulled=false;}});
  V03.anim=new LM.CharacterAnimator(g,{object:V03.dummy,turnInPlace:false,autoStartStop:false,onFootstep:()=>{try{if(!P.inWater)noise(.04,900,.05)}catch(e){}}});
  V03.ren=g.scene;V03.holder=holder;V03.sockR=g.scene.getObjectByName('socket_hand_R');V03.oldParent=weaponPivot.parent;V03.oldPos=weaponPivot.position.clone();
  V03.kin=[];g.scene.traverse(o=>o.material&&[].concat(o.material).forEach(m=>{if(m.name==='kintsugi')V03.kin.push(m);}));
  v03Weapon();v4AttachHat(g.scene);try{v4SetupAnim(V03.anim);}catch(e){console.warn('[kanemori] v04 anim setup',e);}console.log('[kanemori] Ren GLB active'+(V4.v04?' v04':'')+' ('+Object.keys(V03.anim.clips).length+' clips)');}
 catch(e){console.warn('[kanemori] Ren GLB attach failed, procedural fallback',e);restoreProcRen();}}
function restoreProcRen(){for(const m of V03.hidden)m.visible=true;V03.hidden=[];if(V03.holder)pose.remove(V03.holder);if(V03.oldParent){V03.oldParent.add(weaponPivot);weaponPivot.position.copy(V03.oldPos);weaponPivot.rotation.set(0,0,0);}V03.anim=null;V03.ren=null;}
function isUnder(m,anc){let p=m;while(p){if(p===anc)return true;p=p.parent;}return false;}
let _v03eq='';
function v03Weapon(){const a=V03.anim;if(!a)return;_v03eq=S.eq;const w=W();const own=k=>S.weapons.includes(k);
 if(S.eq==='katana'){a.show('katana',true);a.attach('katana','socket_hand_R');weaponPivot.visible=false;}
 else{if(own('katana')){a.show('katana',true);a.attach('katana','socket_hip_L');}else a.show('katana',false);a.show('saya',own('katana'));
  if(w.ranged&&!w.thrown){weaponPivot.visible=false;}else{weaponPivot.visible=true;if(V03.sockR){V03.sockR.add(weaponPivot);weaponPivot.position.set(0,0,0);weaponPivot.rotation.set(0,0,0);}}}
 const hasBow=own('yumi')||own('daikyu');a.show('bow',hasBow);if(hasBow)a.attach('bow',w.ranged&&!w.thrown?'socket_hand_L':'socket_back');}
function makeVillagerRig(d){const LM=V03.LM,o=V03.SkU.clone(V03.villG.scene);LM.toonify(o);const wrap=new THREE.Group();wrap.add(o);const sc=(d.look&&d.look.scale)||1;o.scale.setScalar(sc);
 o.traverse(m=>{if(m.isMesh){m.castShadow=true;m.frustumCulled=false;}});
 // tint the robe from the persona colour where the material allows it
 if(d.look&&d.look.robe){o.traverse(m=>{if(m.isMesh&&m.material&&/robe|cloth|kimono|body/i.test(m.material.name||'')){m.material=m.material.clone();if(m.material.color)m.material.color.lerp(new THREE.Color(d.look.robe),.6);}});}
 const anim=new LM.CharacterAnimator({scene:o,animations:V03.villG.animations},{object:new THREE.Object3D(),turnInPlace:false,autoStartStop:false});
 const hatOn=d.look&&d.look.hat;anim.show('hat_kasa',!!hatOn||/farmer|stable|fish|hunt|scout/i.test(d.role||''));anim.show('hat_band',!hatOn&&/smith|guard/i.test(d.role||''));
 const role=(d.role||'').toLowerCase();wrap.userData.work=/smith|cast/.test(role)?'hammer_work':/shop|herb|inn|monger|merchant/.test(role)?'sweep':null;wrap.userData.prop=/smith|cast/.test(role)?'prop_hammer':/shop|herb|inn/.test(role)?'prop_broom':null;
 wrap.userData.anim=anim;wrap.userData.v03=true;return wrap;}
function makeHorseRig(){const LM=V03.LM,o=V03.SkU.clone(V03.horseG.scene);LM.toonify(o);o.traverse(m=>{if(m.isMesh){m.castShadow=true;m.frustumCulled=false;}});const wrap=new THREE.Group();wrap.add(o);
 wrap.userData.anim=new LM.HorseAnimator({scene:o,animations:V03.horseG.animations},{object:new THREE.Object3D()});wrap.userData.legs=[];wrap.userData.v03=true;wrap.userData.saddle=o.getObjectByName('socket_saddle');return wrap;}
// per-NPC animation (called from villageUpdate via mesh.userData)
function v03NpcAnim(n,sp,dt,talking){const ud=n.mesh.userData;if(!ud.anim)return;const a=ud.anim;a.setMove(sp,0);
 if(n.comp&&n.atkT>0&&!ud.atkPlayed&&a.clips.spear_thrust){ud.atkPlayed=true;a.show('prop_spear',true);a.play('spear_thrust',{fade:.06});}if(n.atkT<=0)ud.atkPlayed=false;
 const home=n.mode==='home'&&sp<.05;const atWork=n.mode==='work'&&sp<.05&&!talking;const want=talking?'talk_gesture':n.comp&&sp<.05&&a.clips.fight_ready&&enemiesAll().some(e=>Math.hypot(e.pos.x-n.x,e.pos.z-n.z)<14)?'fight_ready':home&&a.clips.sit?'sit':atWork&&ud.work?ud.work:(n.d.persona&&S.weather==='storm'&&sp<.05?'fear_cower':null);
 if(want!==ud.cur){if(ud.cur)a.stop('full',.3);if(want)a.play(want,{loop:true,fade:.3});ud.cur=want;if(ud.prop)a.show(ud.prop,want===ud.work);if(n.comp)a.show('prop_spear',true);}
 a.update(dt);}
function v03Update(dt){const a=V03.anim;if(!a)return;try{
 if(_v03eq!==S.eq)v03Weapon();
 const spd=P.vel.length();a.setSpeedScale(TIME.freeze>0?0:1);
 if(P.swim){if(!V03.swimL){V03.swimL=a.play('swim',{loop:true,fade:.25});}}else if(V03.swimL){a.stop('full',.25);V03.swimL=null;}
 a.setMove(RIDE.on?0:spd,P.yaw);v4PreAnim(a,dt);
 // one-shots mirror the game state machine
 if(P.atk&&P.atk!==V03.lastAtk){const at=P.atk;V03.lastAtk=at;
  if(at.v4)v4PlayAtk(a,at);
  else if(at.bow){const w=W();if(w.thrown){const kc=a.clips.kunai_throw?'kunai_throw':'katana_light_1';a.show('kunai',true);a.play(kc,{layer:'upper',fade:.04,timeScale:(kc==='kunai_throw'?.22:.12)/Math.max(.04,at.hitAt),onEvent:e=>{if(e==='release')a.show('kunai',false);}});setTimeout(()=>{if(V03.anim)a.show('kunai',false);},450);}else if(!at.heavy&&a.clips.bow_quick){a.play('bow_quick',{layer:'upper',fade:.04,timeScale:.2/Math.max(.04,at.hitAt)});}else{a.play('bow_draw',{layer:'upper',fade:.08,timeScale:.62/Math.max(.1,at.hitAt||.3)});setTimeout(()=>{if(V03.anim)a.play('bow_release',{layer:'upper',fade:.05});},Math.max(60,(at.hitAt||.3)*1000));}}
  else if(at.heavy)a.play('katana_heavy',{fade:.06,timeScale:(.37/Math.max(.1,at.hitAt))});
  else{const n=(at.idx||0)%3+1,hit=[.12,.13,.14][n-1];a.play('katana_light_'+n,{fade:.05,timeScale:hit/Math.max(.04,at.hitAt)});}}
 if(!P.atk)V03.lastAtk=null;
 if(P.dodge>0&&!V03.dodging&&!(P.atk&&P.atk.v4)){V03.dodging=true;a.play('dodge_roll',{fade:.05,timeScale:.7/.35});}if(P.dodge<=0)V03.dodging=false;
 if(P.block&&!V03.blockL){V03.blockL=a.play('block',{layer:'upper',loop:true,fade:.1});}else if(!P.block&&V03.blockL){a.stop('upper',.15);V03.blockL=null;}
 if(P.gatherT>.3&&!V03.gath){V03.gath=true;a.play('gather',{layer:'upper',fade:.1,timeScale:1.6});}if(P.gatherT<=0)V03.gath=false;
 if(S.hp<V03.lastHp-4&&!P.atk&&!P.dead)a.play('hit_react',{layer:'upper',fade:.04});V03.lastHp=S.hp;
 if(P.dead&&!V03.deadP){V03.deadP=true;a.play('death',{hold:true,fade:.1});}else if(!P.dead&&V03.deadP){V03.deadP=false;a.stop('full',.2);}
 if(S.warm<20&&spd<.3&&!V03.shiv){V03.shiv=a.play('shiver',{layer:'upper',loop:true,fade:.4});}else if((S.warm>=20||spd>=.3)&&V03.shiv){a.stop('upper',.4);V03.shiv=null;}
 // riding: static sit pose (no riding clip yet) — freeze idle on the saddle
 if(RIDE.on!==V03.riding){V03.riding=RIDE.on;const ha=horseMesh&&horseMesh.userData.anim;
  if(RIDE.on){a.stop('full',.1);if(ha&&a.clips.ride_idle){a.ride={horse:ha};if(a.clips.mount)a.play('mount',{fade:.05,fadeOut:.25,timeScale:2});}else{V03.sitL=a.play(a.clips.sit_rest?'sit_rest':'idle',{hold:true,fade:.2,timeScale:a.clips.sit_rest?1:0});V03.holder.position.y=.15;}}
  else{a.ride=null;a.stop('full',.2);V03.holder.position.y=0;V03.holder.rotation.x=0;}}
 if(W().ranged&&!W().thrown&&a.setAim)a.setAim(clamp((.28-P.camPitch)*110,-45,60));
 TALK.n&&!V03.talkL?(V03.talkL=a.play('talk_gesture',{layer:'upper',loop:true,fade:.3})):(!TALK.n&&V03.talkL&&(a.stop('upper',.3),V03.talkL=null));
 a.update(dt);v4Body(a,dt);
 for(const m of V03.kin)m.emissiveIntensity=.35+S.shards*.25;
 }catch(e){console.warn('[kanemori] v03 animator error, procedural fallback',e);restoreProcRen();}}
probeV03();setInterval(()=>{if(V03.state==='none'&&V03.tries<40)probeV03();},30000);
/* =====================================================================
   v0.3 SECTION: WORLD ART — flowers, stone lanterns, varied rocks, fireflies,
   birds, koi, low fog banks, wind; all instanced/cheap.
   ===================================================================== */
const ART={ff:null,birds:[],koi:[],fog:[]};
{// flowers (instanced, wind sway) in meadows, path edges and the village
 const kinds=[[0xf2f0f6,0xf4d03f],[0xe85a8a,0xffe08a],[0x8a6ae8,0xffe08a],[0xf4a03a,0x7a3a10],[0xe83a3a,0x2a1a10]];
 for(const[pc,cc]of kinds){const parts=[{g:new THREE.CylinderGeometry(.015,.015,.45,3).translate(0,.22,0),c:0x4a7a3a}];for(let k=0;k<5;k++){const a=k/5*TAU;parts.push({g:new THREE.SphereGeometry(.07,4,3).scale(1,.35,1.6).translate(0,0,.08).rotateY(a).translate(0,.46,0),c:pc});}parts.push({g:new THREE.SphereGeometry(.045,4,3).translate(0,.48,0),c:cc});
  const geo=mergeColored(parts),N=520,im=new THREE.InstancedMesh(geo,windMat(vmat,.22),N);let n=0;
  for(let i=0;i<N*6&&n<N;i++){const cx=rnd(-185,185),cz=rnd(-150,178);const meadow=fbm(cx*.02,cz*.02)>.55||pathDist(cx,cz)<9||Math.hypot(cx,cz-148)<36;if(!meadow||inWater(cx,cz)||pathDist(cx,cz)<2.2)continue;const y=H(cx,cz);if(y<WATER_SEA+2.5||y>26)continue;
   for(let c=0;c<3&&n<N;c++){const x=cx+rnd(-1.2,1.2),z=cz+rnd(-1.2,1.2);_p.set(x,H(x,z),z);_e.set(0,R()*TAU,0);_q.setFromEuler(_e);const s=rnd(.8,1.4);_s.set(s,s,s);_m.compose(_p,_q,_s);im.setMatrixAt(n++,_m);}}
  im.count=n;scene.add(im);}}
{// stone lanterns (tōrō) along the path + glowing caps that light up at night
 const stoneM=std(0x9a968e),glowM=emis(0xffb35a,1.6);for(let i=0;i<pathPts.length-1;i++){const[a,b]=pathPts[i],[c,d]=pathPts[i+1];for(const t of[.33,.8]){const x=lerp(a,c,t)-3.2,z=lerp(b,d,t);if(inWater(x,z))continue;
  const g=new THREE.Group();g.position.set(x,H(x,z),z);const base=new THREE.Mesh(new THREE.CylinderGeometry(.35,.45,.3,6),stoneM);base.position.y=.15;g.add(base);const post=new THREE.Mesh(new THREE.CylinderGeometry(.14,.16,.9,6),stoneM);post.position.y=.75;g.add(post);
  const box=new THREE.Mesh(new THREE.BoxGeometry(.5,.42,.5),glowM);box.position.y=1.4;g.add(box);const cap=new THREE.Mesh(new THREE.ConeGeometry(.55,.38,4),stoneM);cap.rotation.y=Math.PI/4;cap.position.y=1.8;g.add(cap);g.traverse(o=>{if(o.isMesh)o.castShadow=true});scene.add(g);lamps.push(box);colliders.push({x,z,r:.4});}}}
{// varied mossy rocks & boulders (instanced, decorative)
 const geo=mergeColored([{g:new THREE.DodecahedronGeometry(1,0).scale(1,.62,.9),c:0x7a7870},{g:new THREE.DodecahedronGeometry(.7,0).scale(1,.3,1).translate(0,.45,0),c:0x5f8a4a}]);
 const N=260,im=new THREE.InstancedMesh(geo,vmat,N);let n=0;for(let i=0;i<N*5&&n<N;i++){const x=rnd(-190,190),z=rnd(-160,176);if(inWater(x,z)||pathDist(x,z)<3||nearFlat(x,z,-2))continue;const y=H(x,z);if(y<WATER_SEA+2)continue;
  _p.set(x,y-.15,z);_e.set(rnd(-.2,.2),R()*TAU,rnd(-.2,.2));_q.setFromEuler(_e);const s=R()<.12?rnd(1.6,2.6):rnd(.3,.9);_s.set(s,s,s);_m.compose(_p,_q,_s);im.setMatrixAt(n++,_m);if(s>1.5)colliders.push({x,z,r:s*.8});}im.count=n;ART.rocks=im;im.castShadow=im.receiveShadow=true;scene.add(im);}
{// v0.4 fireflies: tiny soft round glow points (GPU wander on noise paths, bob, blink fade), clustered at water + grass; a local swarm wraps around the camera
 const NW=1100,NL=320,N=NW+NL,base=new Float32Array(N*3),seed=new Float32Array(N*4);
 for(let i=0;i<NW;i++){let x=0,z=0;const r=R();for(let k=0;k<14;k++){
   if(r<.42){z=rnd(-128,176);x=RIVX(z)+(R()<.5?-1:1)*rnd(6.5,15);}            // river banks
   else if(r<.52){const a=R()*TAU,d=rnd(8.5,17);x=66+Math.cos(a)*d;z=-104+Math.sin(a)*d;} // Taki pool
   else if(r<.8){x=rnd(-150,120);z=rnd(-130,170);if(!(fbm(x*.02,z*.02)>.5||Math.hypot(x,z-148)<40))continue;} // meadows / grass
   else{x=rnd(-140,40);z=rnd(-140,110);}                                       // forest floor
   if(!inWater(x,z))break;}
  base[i*3]=x;base[i*3+1]=H(x,z)+rnd(.35,2.4);base[i*3+2]=z;seed[i*4]=R()*100;seed[i*4+1]=rnd(.55,1.25);seed[i*4+2]=rnd(.6,1.4);seed[i*4+3]=0;}
 for(let i=NW;i<N;i++){base[i*3]=rnd(-14,14);base[i*3+1]=rnd(.4,2.6);base[i*3+2]=rnd(-14,14);seed[i*4]=R()*100;seed[i*4+1]=rnd(.55,1.2);seed[i*4+2]=rnd(.5,1.1);seed[i*4+3]=1;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(base,3));g.setAttribute('aSeed',new THREE.BufferAttribute(seed,4));
 ART.ffU={uT:{value:0},uVis:{value:0},uScale:{value:400},uCam:{value:new V3()},uGround:{value:0}};
 const m=new THREE.ShaderMaterial({uniforms:ART.ffU,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  vertexShader:`uniform float uT,uVis,uScale,uGround;uniform vec3 uCam;attribute vec4 aSeed;varying float vA;varying float vB;
  void main(){vec3 p=position;float s=aSeed.x,t=uT*aSeed.y;
   vec3 off=vec3(sin(t*.53+s)*1.4+sin(t*1.71+s*3.1)*.45,sin(t*1.13+s*5.3)*.32+sin(t*2.9+s*1.7)*.1,cos(t*.47+s*2.3)*1.4+cos(t*1.93+s*7.1)*.45)*aSeed.z;
   if(aSeed.w>.5){vec3 rel=p+off;rel.xz=mod(rel.xz-uCam.xz+14.,28.)-14.;p=vec3(uCam.x+rel.x,uGround+rel.y,uCam.z+rel.z);off=vec3(0.);}
   p+=off;float bl=sin(uT*aSeed.y*1.9+s*9.)*.5+.5;bl=smoothstep(.25,.85,bl);
   vec4 mv=modelViewMatrix*vec4(p,1.);float d=-mv.z;
   vA=uVis*(.12+.88*bl)*smoothstep(130.,35.,d)*(aSeed.w>.5?smoothstep(14.,8.,length(p.xz-uCam.xz)):1.);vB=bl;
   gl_PointSize=clamp(uScale*.2/max(d,.1)*(.75+.5*bl),2.,22.);gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`varying float vA;varying float vB;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;
   float core=smoothstep(.42,.0,d),halo=pow(1.-d,2.)*.45;vec3 c=mix(vec3(.72,1.,.38),vec3(1.,.97,.72),core);gl_FragColor=vec4(c*(core*2.4+halo*1.3)*vA,1.);}`});
 ART.ff=new THREE.Points(g,m);ART.ff.frustumCulled=false;ART.ff.renderOrder=2;scene.add(ART.ff);}
{// birds: small flocks circling over the valley
 const wingG=new THREE.BufferGeometry();wingG.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,-.6,.1,-.2,0,0,.25, 0,0,0,0,0,.25,.6,.1,-.2],3));wingG.computeVertexNormals();const bm=new THREE.MeshBasicMaterial({color:0x1a1a22,side:THREE.DoubleSide});
 for(let f=0;f<4;f++){const c=[rnd(-120,80),rnd(-110,140)],r=rnd(25,55),h=rnd(28,48),sp=rnd(.08,.16)*(R()<.5?1:-1);for(let i=0;i<5;i++){const b=new THREE.Mesh(wingG,bm);scene.add(b);ART.birds.push({b,c,r:r+rnd(-4,4),h:h+rnd(-2,2),sp,ph:R()*TAU*.08+f*1.7,off:i*.06});}}}
{// koi in Taki Pool and the village pond-ish river bend
 const km=[std(0xff7a2a,{emissive:0x5a1a00,emissiveIntensity:.3}),std(0xf4f0e8),std(0xe8b84a,{metalness:.6,emissive:0x5a4010,emissiveIntensity:.6})];
 for(let i=0;i<9;i++){const k=new THREE.Mesh(new THREE.SphereGeometry(.22,6,4).scale(1,.4,2.2),km[i%3]);scene.add(k);const pool=i<6?[66,-104,5]:[RIVX(118),118,3];ART.koi.push({k,cx:pool[0],cz:pool[1],r:rnd(1.5,pool[2]),sp:rnd(.3,.7)*(R()<.5?1:-1),ph:R()*TAU});}}
{// low drifting fog banks in the forest (soft sprites)
 const cv=document.createElement('canvas');cv.width=cv.height=64;const g=cv.getContext('2d');const gr=g.createRadialGradient(32,32,2,32,32,32);gr.addColorStop(0,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);
 const tex=new THREE.CanvasTexture(cv);for(let i=0;i<26;i++){const m=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:0xcfd8ff,transparent:true,opacity:.22,depthWrite:false,fog:true}));const x=rnd(-150,40),z=rnd(-130,100);m.position.set(x,H(x,z)+2.2,z);m.scale.set(rnd(18,30),rnd(5,8),1);scene.add(m);ART.fog.push({m,x,z,ph:R()*TAU});}}
function artUpdate(dt){const t=performance.now()/1000;WIND.t.value=t*(S.weather==='storm'?2.2:S.weather==='warn'||S.weather==='rain'?1.5:1);
 const night=isNight();{const U=ART.ffU;U.uT.value=t;U.uVis.value=lerp(U.uVis.value,night?1:0,Math.min(1,dt*.6));ART.ff.visible=U.uVis.value>.01;U.uCam.value.copy(camera.position);U.uGround.value=H(camera.position.x,camera.position.z);U.uScale.value=renderer.domElement.height*.5*camera.projectionMatrix.elements[5];}
 for(const o of ART.birds){const a=t*o.sp+o.ph-o.off;o.b.position.set(o.c[0]+Math.cos(a)*o.r,o.h+Math.sin(t*.7+o.ph)*2,o.c[1]+Math.sin(a)*o.r);o.b.rotation.set(0,-a+(o.sp>0?Math.PI:0),Math.sin(t*9+o.ph*10)*.5);o.b.visible=!night&&S.weather!=='storm';}
 for(const o of ART.koi){const a=t*o.sp+o.ph;const x=o.cx+Math.cos(a)*o.r,z=o.cz+Math.sin(a)*o.r;o.k.position.set(x,(o.cz<-50?riverY(-104):riverY(o.cz))-.25,z);o.k.rotation.y=-a+(o.sp>0?0:Math.PI);}
 for(const f of ART.fog){f.m.position.x=f.x+Math.sin(t*.05+f.ph)*6;f.m.material.opacity=(night?.3:.16)+(S.weather==='storm'||S.weather==='rain'?.12:0);}}
