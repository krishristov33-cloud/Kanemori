/* =====================================================================
   v0.5 SECTION: REN + COMBAT FEEL + UI. Secondary motion (scarf bones on a
   verlet chain, hair spring, hat wobble, dangling hat ties, obi tails),
   footprints + dust puffs, sharper hit flashes / spark streaks / weapon-
   weight shake, enemy hit-flash; fixes from v0.4 (mesh-exact foot IK, dash
   on slopes, bokken/yari socket + trails, gradient afterimages, god-ray
   tiers); paper-and-gold HUD, painted scroll map, graphics setting.
   ===================================================================== */
const SEC={on:false,chains:[],t:0};const _sA=new V3(),_sB=new V3(),_sC=new V3(),_sQ=new THREE.Quaternion(),_sQ2=new THREE.Quaternion();
const WINDV=()=>_sC.set(V5U.uWindDir.value.x,0,V5U.uWindDir.value.y).multiplyScalar(V5U.uWind.value*(.6+.4*Math.sin(performance.now()/1000*1.7)));
// a verlet rope: n points, rest length L each; root follows fn(); optional bone list to drive
function v5Rope(n,L,opt={}){const pts=[],prev=[];for(let i=0;i<n;i++){pts.push(new V3());prev.push(new V3());}return{n,L,pts,prev,init:false,drag:opt.drag||.06,grav:opt.grav||9,wind:opt.wind||1,stiff:opt.stiff||0,rest:opt.rest||null};}
function v5RopeStep(r,root,dt,dir){if(!r.init){for(let i=0;i<r.n;i++){r.pts[i].copy(root).addScaledVector(dir,r.L*i);r.prev[i].copy(r.pts[i]);}r.init=true;}
 r.pts[0].copy(root);r.prev[0].copy(root);const w=WINDV();const sub=2,h=dt/sub;
 for(let s=0;s<sub;s++){for(let i=1;i<r.n;i++){const p=r.pts[i],q=r.prev[i];const vx=(p.x-q.x)*(1-r.drag),vy=(p.y-q.y)*(1-r.drag),vz=(p.z-q.z)*(1-r.drag);q.copy(p);
   p.x+=vx+w.x*r.wind*h*h*6;p.y+=vy-r.grav*h*h;p.z+=vz+w.z*r.wind*h*h*6;
   if(r.rest&&r.stiff>0){const t=r.rest[i];p.lerp(t,r.stiff);}}
  for(let it=0;it<3;it++)for(let i=1;i<r.n;i++){const a=r.pts[i-1],b=r.pts[i];_sA.subVectors(b,a);const d=_sA.length()||1e-5;const k=(d-r.L)/d;if(i===1)b.addScaledVector(_sA,-k);else{a.addScaledVector(_sA,k*.5);b.addScaledVector(_sA,-k*.5);}}
  // body collision (capsule around Ren's torso)
  const hp=hero.position;for(let i=1;i<r.n;i++){const p=r.pts[i];const cy=clamp(p.y,hp.y+.3,hp.y+1.5);_sA.set(p.x-hp.x,p.y-cy,p.z-hp.z);const d=_sA.length();if(d<.27&&d>1e-4)p.addScaledVector(_sA,(.27-d)/d);}}}
// ribbon mesh following a rope
function v5RibbonMesh(n,width,col){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*2*3),3));const idx=[];for(let i=0;i<n-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}g.setIndex(idx);
 const uv=[];for(let i=0;i<n;i++)uv.push(0,i/(n-1),1,i/(n-1));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:col,side:THREE.DoubleSide}));m.frustumCulled=false;m.castShadow=true;m.userData.w=width;scene.add(m);return m;}
function v5RibbonUpd(m,r,side){const a=m.geometry.attributes.position,w=m.userData.w;for(let i=0;i<r.n;i++){const p=r.pts[i];const ww=w*(1-i/(r.n)*.35);a.setXYZ(i*2,p.x-side.x*ww,p.y-side.y*ww,p.z-side.z*ww);a.setXYZ(i*2+1,p.x+side.x*ww,p.y+side.y*ww,p.z+side.z*ww);}a.needsUpdate=true;m.geometry.computeVertexNormals();m.geometry.computeBoundingSphere();}
function v5SecInit(){const a=V03.anim;if(!a||!V03.ren||SEC.on)return;try{const ren=V03.ren;SEC.on=true;
 // scarf bone chain (Aether's rig has scarf1-3): verlet drives the bone directions, shape-matched to the clip pose
 const sc=['scarf1','scarf2','scarf3'].map(n=>ren.getObjectByName(n)).filter(Boolean);
 if(sc.length===3&&sc[1].parent===sc[0]&&sc[2].parent===sc[1]){SEC.scarf={b:sc,tip:sc[2].position.clone().multiplyScalar(1).length()>0?sc[2].position.clone():new V3(0,-.15,0),rope:null,last:sc.map(b=>b.quaternion.clone())};
  const L=sc[1].position.length();SEC.scarf.rope=v5Rope(4,L,{drag:.08,grav:7,wind:1.4,stiff:.14});SEC.scarf.rope.rest=[0,1,2,3].map(()=>new V3());}
 SEC.hair=ren.getObjectByName('hair');if(SEC.hair){SEC.hair0=SEC.hair.quaternion.clone();SEC.hairS={x:0,y:0,vx:0,vy:0};SEC.hairLast=SEC.hair.quaternion.clone();}
 SEC.head=ren.getObjectByName('head');SEC.spine=ren.getObjectByName('spine2')||ren.getObjectByName('spine');SEC.hips=ren.getObjectByName('hips');
 // hat ties (two dangling string ends from the chin knot) + obi tails at the back of the waist
 SEC.ties=[0,1].map(()=>({rope:v5Rope(5,.07,{drag:.1,grav:9,wind:1.6}),m:v5RibbonMesh(5,.006,0xe8dcc0)}));
 SEC.obi=[0,1].map(i=>({rope:v5Rope(6,.11,{drag:.07,grav:8,wind:1.2}),m:v5RibbonMesh(6,i?.05:.065,i?0x9e2a22:0x2a2a48)}));
 SEC.hatS={x:0,z:0,vx:0,vz:0};SEC.lastHead=null;SEC.headV=new V3();console.log('[kanemori] v0.5 secondary motion: scarf',!!SEC.scarf,'hair',!!SEC.hair);}catch(e){console.warn('[kanemori] v5 sec init',e);}}
function v5BoneDrive(b){// returns the base (clip) quaternion: if nothing animated this bone since our last write, reuse the stored base
 if(!b.userData.v5w||!b.quaternion.equals(b.userData.v5w))b.userData.v5base=b.quaternion.clone();return b.userData.v5base;}
function v5SecUpdate(dt){if(!SEC.on||dt<=0||!V03.ren||!V03.ren.parent)return;try{const ren=V03.ren;ren.updateMatrixWorld(true);
 // head velocity / accel (drives hair + hat)
 const hw=SEC.head?SEC.head.getWorldPosition(_sB).clone():hero.position.clone();if(!SEC.lastHead)SEC.lastHead=hw.clone();const v=hw.clone().sub(SEC.lastHead).divideScalar(dt);SEC.lastHead.copy(hw);const acc=v.clone().sub(SEC.headV).divideScalar(dt);SEC.headV.lerp(v,.5);
 const fwd=new V3(Math.sin(P.yaw),0,Math.cos(P.yaw)),rt=new V3(Math.cos(P.yaw),0,-Math.sin(P.yaw));const w=WINDV().clone();
 const aF=clamp(acc.dot(fwd),-40,40),aR=clamp(acc.dot(rt),-40,40);
 // hat: under-damped spring wobble + wind tug
 if(V4.hat){const H5=SEC.hatS;const tx=clamp(-aF*.004+w.dot(fwd)*.02,-.18,.18),tz=clamp(aR*.004-w.dot(rt)*.02,-.18,.18);H5.vx+=((tx-H5.x)*160-H5.vx*9)*dt;H5.x+=H5.vx*dt;H5.vz+=((tz-H5.z)*160-H5.vz*9)*dt;H5.z+=H5.vz*dt;
  V4.hat.rotation.set(.1+H5.x,0,.055+H5.z);}
 // hair: spring lag on the hair bone
 if(SEC.hair){const S5=SEC.hairS;const tx=clamp(-aF*.006,-.35,.35),ty=clamp(aR*.006,-.35,.35);S5.vx+=((tx-S5.x)*90-S5.vx*7)*dt;S5.x+=S5.vx*dt;S5.vy+=((ty-S5.y)*90-S5.vy*7)*dt;S5.y+=S5.vy*dt;
  const base=v5BoneDrive(SEC.hair);SEC.hair.quaternion.copy(base).multiply(_sQ.setFromEuler(_v5e.set(S5.x,0,S5.y)));SEC.hair.userData.v5w=SEC.hair.quaternion.clone();}
 // scarf chain
 if(SEC.scarf){const Sc=SEC.scarf,b=Sc.b,r=Sc.rope;for(const x of b){v5BoneDrive(x);x.quaternion.copy(x.userData.v5base);}ren.updateMatrixWorld(true);
  for(let i=0;i<3;i++)b[i].getWorldPosition(r.rest[i]);b[2].localToWorld(r.rest[3].copy(Sc.tip));
  v5RopeStep(r,r.rest[0],dt,_sA.set(0,-1,0));
  for(let i=0;i<3;i++){const bone=b[i];bone.updateMatrixWorld(true);const cw=i<2?b[i+1].getWorldPosition(new V3()):bone.localToWorld(Sc.tip.clone());const bw=bone.getWorldPosition(new V3());
   const cur=cw.sub(bw).normalize(),want=r.pts[i+1].clone().sub(r.pts[i]).normalize();if(cur.lengthSq()<.5||want.lengthSq()<.5)continue;
   _sQ.setFromUnitVectors(cur,want);bone.getWorldQuaternion(_sQ2);const pw=bone.parent.getWorldQuaternion(new THREE.Quaternion());bone.quaternion.copy(pw.invert().multiply(_sQ).multiply(_sQ2));bone.updateMatrixWorld(true);bone.userData.v5w=bone.quaternion.clone();}}
 // hat ties: from the chin knot
 if(V4.hat){const knot=V4.hat.localToWorld(_sB.set(0,-.225,.08)).clone();SEC.ties.forEach((T,i)=>{const root=knot.clone().addScaledVector(rt,i?.012:-.012);v5RopeStep(T.rope,root,dt,_sA.set(0,-1,0));v5RibbonUpd(T.m,T.rope,rt);T.m.visible=true;});}
 // obi tails: from the back of the waist
 const hip=SEC.hips||SEC.spine;if(hip){const hp=hip.getWorldPosition(_sB).clone();hp.y+=.12;hp.addScaledVector(fwd,-.2);SEC.obi.forEach((O,i)=>{const root=hp.clone().addScaledVector(rt,i?.06:-.05);v5RopeStep(O.rope,root,dt,_sA.set(0,-1,0).addScaledVector(fwd,-.2));v5RibbonUpd(O.m,O.rope,rt);O.m.visible=!RIDE.on||true;});}
}catch(e){if(!SEC._err){SEC._err=1;console.warn('[kanemori] v5 secondary',e);}}}

/* ---- footprints + dust puffs ---- */
const FOOT={pool:[],i:0,dust:[],di:0,last:{L:1,R:1}};
{const tex=canvasTex(64,128,(c,w,h)=>{c.fillStyle='rgba(40,28,18,.85)';c.beginPath();c.ellipse(w/2,h*.34,w*.3,h*.22,0,0,TAU);c.fill();c.beginPath();c.ellipse(w/2,h*.76,w*.24,h*.16,0,0,TAU);c.fill();});
 const geo=new THREE.PlaneGeometry(.16,.3).rotateX(-Math.PI/2);for(let i=0;i<48;i++){const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,opacity:0,polygonOffset:true,polygonOffsetFactor:-2}));m.visible=false;m.renderOrder=1;scene.add(m);FOOT.pool.push({m,t:0,a:0});}
 const dt2=canvasTex(64,64,(c)=>{const g=c.createRadialGradient(32,32,2,32,32,32);g.addColorStop(0,'rgba(255,255,255,.8)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,64,64);});
 for(let i=0;i<28;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:dt2,color:0xc8b494,transparent:true,depthWrite:false,opacity:0}));s.visible=false;scene.add(s);FOOT.dust.push({s,t:0,life:1,v:new V3(),sz:1});}}
function v5Dust(p,n=2,sz=.6,col=0xc8b494,up=.6){for(let k=0;k<n;k++){const d=FOOT.dust[FOOT.di++%FOOT.dust.length];d.s.position.copy(p).add(new V3(rnd(-.15,.15),.1,rnd(-.15,.15)));d.v.set(rnd(-.5,.5),up*rnd(.6,1.2),rnd(-.5,.5));d.t=0;d.life=rnd(.5,.9);d.sz=sz*rnd(.8,1.3);d.s.material.color.setHex(col);d.s.visible=true;}}
function v5Surface(x,z){if(inWater(x,z))return'water';if(pathDist(x,z)<2.8)return'dirt';if(Math.abs(x-RIVX(z))<10.5)return'bank';if(H(x,z)>26)return'snow';return'grass';}
function v5Step(foot,side){const p=foot.getWorldPosition(new V3());const surf=v5Surface(p.x,p.z);if(surf==='water')return;const gy=meshH(p.x,p.z);
 const f=FOOT.pool[FOOT.i++%FOOT.pool.length];f.m.position.set(p.x,gy+.02,p.z);f.m.rotation.y=P.yaw;f.t=0;f.a=surf==='grass'?.18:surf==='snow'?.55:.42;f.m.visible=true;f.m.material.opacity=f.a;
 const spd=Math.hypot(P.vel.x,P.vel.z);if(spd>4.5&&surf!=='grass')v5Dust(new V3(p.x,gy,p.z),spd>7?3:2,.5+spd*.05,surf==='snow'?0xf0f4ff:0xc8b494);else if(spd>6.5)v5Dust(new V3(p.x,gy,p.z),1,.45,0xb8c8a0);}
function v5FootUpdate(dt){const a=V03.anim;if(a&&a.bones&&!RIDE.on&&!P.swim){for(const[k,b]of[['L',a.bones.foot_L],['R',a.bones.foot_R]]){if(!b)continue;const wp=b.getWorldPosition(_sB);const h=wp.y-meshH(wp.x,wp.z);
   if(P.ground&&h<.09&&FOOT.last[k]>=.13)v5Step(b,k);FOOT.last[k]=h;}}
 if(P.ground&&!FOOT.wasG&&P.vy<=0&&FOOT.fallV<-7)v5Dust(hero.position.clone(),6,.9);FOOT.wasG=P.ground;FOOT.fallV=P.vy;
 if(P.dodge>0&&!FOOT.dodge)v5Dust(hero.position.clone(),4,.7);FOOT.dodge=P.dodge>0;
 for(const f of FOOT.pool){if(!f.m.visible)continue;f.t+=dt;const k=1-f.t/14;if(k<=0){f.m.visible=false;continue;}f.m.material.opacity=f.a*Math.min(1,k*3);}
 for(const d of FOOT.dust){if(!d.s.visible)continue;d.t+=dt;const k=d.t/d.life;if(k>=1){d.s.visible=false;continue;}d.s.position.addScaledVector(d.v,dt);d.v.multiplyScalar(1-dt*2.5);d.s.scale.setScalar(d.sz*(.5+k*1.5));d.s.material.opacity=.45*(1-k)*Math.min(1,k*6);}}

/* ---- combat feel: hit flash star + spark streaks + enemy white flash + weapon-weight shake ---- */
const HFX={flash:[],fi:0,spark:null,sv:[],st:0,ef:[]};const WEIGHT={bokken:.75,katana:1,yari:1.2,yumi:.6,daikyu:.6};
{const tex=canvasTex(128,128,(c,w,h)=>{c.translate(64,64);for(let i=0;i<8;i++){c.rotate(Math.PI/4);const L=i%2?40:62;const g=c.createLinearGradient(0,0,L,0);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.beginPath();c.moveTo(0,-5);c.lineTo(L,0);c.lineTo(0,5);c.fill();}
  const g=c.createRadialGradient(0,0,0,0,0,26);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(-30,-30,60,60);});
 for(let i=0;i<6;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));s.visible=false;s.renderOrder=4;scene.add(s);HFX.flash.push({s,t:1,life:.1});}
 const N=80,g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*6),3));g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(N*6),3));
 HFX.spark=new THREE.LineSegments(g,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));HFX.spark.frustumCulled=false;HFX.spark.renderOrder=4;scene.add(HFX.spark);
 for(let i=0;i<N;i++)HFX.sv.push({p:new V3(),v:new V3(),t:1,life:.3,c:new THREE.Color()});}
function v5HitFx(pos,dir,heavy,tint){const f=HFX.flash[HFX.fi++%HFX.flash.length];f.s.position.copy(pos);f.t=0;f.life=heavy?.14:.09;f.s.visible=true;f.s.material.color.setHex(tint||0xfff4dc);f.s.material.rotation=R()*TAU;f.sz=heavy?2.6:1.6;
 const n=heavy?18:10;for(let k=0;k<n;k++){const s=HFX.sv[HFX.st++%HFX.sv.length];s.p.copy(pos);s.v.copy(dir).multiplyScalar(rnd(4,10)).add(new V3(rnd(-4,4),rnd(-1,5),rnd(-4,4)));s.t=0;s.life=rnd(.15,.32);s.c.setHex(R()<.5?0xffe2a0:(tint||0xffffff));}}
function v5EnemyFlash(e){const g=e.g||(e.isBoss?bossG:null);if(!g)return;const list=[];g.traverse(o=>{if(o.isMesh&&o.material&&!Array.isArray(o.material)&&o.material.emissive){if(!o.userData.v5own){o.material=o.material.clone();o.userData.v5own=1;o.userData.v5em=o.material.emissive.clone();o.userData.v5ei=o.material.emissiveIntensity;}list.push(o);}});
 for(const o of list){o.material.emissive.setRGB(1,1,1);o.material.emissiveIntensity=1.4;}HFX.ef.push({list,t:.075});}
function v5HitFxUpdate(dt){for(const f of HFX.flash){if(!f.s.visible)continue;f.t+=dt;const k=f.t/f.life;if(k>=1){f.s.visible=false;continue;}f.s.scale.setScalar(f.sz*(.6+k*.8));f.s.material.opacity=1-k;}
 const pa=HFX.spark.geometry.attributes.position,ca=HFX.spark.geometry.attributes.color;HFX.sv.forEach((s,i)=>{if(s.t<s.life){s.t+=dt;s.v.y-=14*dt;s.p.addScaledVector(s.v,dt);}const k=clamp(1-s.t/s.life,0,1);const tail=s.p.clone().addScaledVector(s.v,-.035);
  pa.setXYZ(i*2,s.p.x,s.p.y,s.p.z);pa.setXYZ(i*2+1,tail.x,tail.y,tail.z);ca.setXYZ(i*2,s.c.r*k*1.6,s.c.g*k*1.6,s.c.b*k*1.6);ca.setXYZ(i*2+1,0,0,0);});pa.needsUpdate=true;ca.needsUpdate=true;
 for(let i=HFX.ef.length-1;i>=0;i--){const e=HFX.ef[i];e.t-=dt;if(e.t<=0){for(const o of e.list){o.material.emissive.copy(o.userData.v5em);o.material.emissiveIntensity=o.userData.v5ei;}HFX.ef.splice(i,1);}}}
const _v4Strike0=v4Strike;
v4Strike=function(a,opt={}){const before=new Set(a.hitSet);const any=_v4Strike0(a,opt);try{if(any){const wgt=WEIGHT[S.eq]||1;const heavy=!!(a.heavy||a.fin||opt.heavy||(a.M&&a.M.charge));
  const RH=V4RHY[S.eq]||V4RHY.katana;const fwd=new V3(Math.sin(P.yaw),0,Math.cos(P.yaw));
  for(const e of a.hitSet){if(before.has(e))continue;const hp=e.pos.clone();hp.y+=e.isBoss?2.2:.9;hp.addScaledVector(fwd,-(e.radius||.5)*.6);v5HitFx(hp,fwd,heavy,RH.tint);v5EnemyFlash(e);}
  if(!a.hitSet.size){const hp=hero.position.clone().addScaledVector(fwd,1.3);hp.y+=1.2;v5HitFx(hp,fwd,heavy,0xffffff);}
  shake((heavy?.2:.07)*wgt);if(wgt>1.05)hitstop(.015*(wgt-1)*10);}}catch(e){}return any;};

/* ---- v0.4 known issues ---- */
// (1) foot IK + ground on the exact mesh triangles, not the analytic H()
// (2) dash / sprint lunge adapt to steep slopes: climb up to ~3.4 rise, deflect sideways along the slope before refusing
// (3) bokken / yari attach along the hand socket's blade axis (+Z like the katana), so trails follow the blade
// (4) afterimages: vertical gradient + per-move tint (gold core, cool edge) and the hat fades first
function v5FixWeapons(){try{if(V03.sockR&&weaponPivot.parent===V03.sockR&&!W().ranged){weaponPivot.rotation.set(Math.PI/2,0,0);}}catch(e){}}
function v5GhostMat(){return new THREE.ShaderMaterial({uniforms:{uCol:{value:new THREE.Color(0x8fd0ff)},uCol2:{value:new THREE.Color(0xffffff)},uO:{value:0},uY0:{value:0}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
 vertexShader:`#include <common>
#include <skinning_pars_vertex>
varying float vY;varying vec3 vN;varying vec3 vV;void main(){
#include <skinbase_vertex>
#include <begin_vertex>
#include <beginnormal_vertex>
#include <skinnormal_vertex>
#include <skinning_vertex>
vec4 wp=modelMatrix*vec4(transformed,1.);vY=wp.y;vN=normalize(mat3(modelMatrix)*objectNormal);vV=normalize(cameraPosition-wp.xyz);gl_Position=projectionMatrix*viewMatrix*wp;}`,
 fragmentShader:`uniform vec3 uCol,uCol2;uniform float uO,uY0;varying float vY;varying vec3 vN;varying vec3 vV;void main(){float h=clamp((vY-uY0)/1.9,0.,1.);float rim=pow(1.-abs(dot(normalize(vN),vV)),1.5);
 float fadeTop=1.-smoothstep(.55+uO*.4,1.,h);vec3 c=mix(uCol2,uCol,rim*.8+h*.3);gl_FragColor=vec4(c*(.35+rim*1.1)*uO*fadeTop,1.);}`});}
function v5PatchGhosts(){if(!GH.pool.length||GH._v5)return;GH._v5=1;for(const G of GH.pool){const m=v5GhostMat();G.g.traverse(o=>{if(o.isMesh)o.material=m;});G.mat5=m;
  // proxy so v0.4 code (G.mat.color / opacity) keeps working
  G.mat={color:{setHex:h=>{m.uniforms.uCol.value.setHex(h);m.uniforms.uCol2.value.setHex(h).lerp(new THREE.Color(1,1,1),.6);}},set opacity(v){m.uniforms.uO.value=v*2.2;},get opacity(){return m.uniforms.uO.value/2.2;}};}}
function v5GhostY(){for(const G of GH.pool){if(G.mat5&&G.g.visible){G.mat5.uniforms.uY0.value=G.g.matrix.elements[13];}}}

/* ---- UI: paper-and-gold HUD skin, painted map, graphics quality ---- */
const BRUSH=(()=>{const c=document.createElement('canvas');c.width=512;c.height=48;const g=c.getContext('2d');const r=mulberry(11);
 for(let i=0;i<46;i++){const y=6+r()*36,x0=r()*30,x1=440+r()*70;g.strokeStyle=`rgba(10,10,16,${.18+r()*.3})`;g.lineWidth=2+r()*7;g.lineCap='round';g.beginPath();g.moveTo(x0,y);g.bezierCurveTo(150,y+(r()-.5)*8,320,y+(r()-.5)*8,x1,y+(r()-.5)*10);g.stroke();}
 return c.toDataURL();})();
const PAPER=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#efe2c2';g.fillRect(0,0,256,256);const r=mulberry(12);
 for(let i=0;i<1600;i++){g.fillStyle=`rgba(${120+r()*60|0},${90+r()*50|0},${50+r()*40|0},${r()*.07})`;g.fillRect(r()*256,r()*256,r()*30,r()*3);}
 for(let i=0;i<60;i++){g.fillStyle=`rgba(150,110,60,${r()*.05})`;g.beginPath();g.arc(r()*256,r()*256,10+r()*40,0,TAU);g.fill();}return c.toDataURL();})();
function v5HudCss(){const st=document.createElement('style');st.id='v5hud';st.textContent=`
.bars{width:300px}.bar{height:15px;margin:7px 0;background:url(${BRUSH}) center/100% 100% no-repeat;clip-path:none;border-radius:2px}
.bar i{inset:2px 6px;border-radius:2px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.25),inset 0 2px 0 rgba(255,255,255,.18);-webkit-mask:url(${BRUSH}) center/100% 100%;mask:url(${BRUSH}) center/100% 100%}
.bar.hp i{background:linear-gradient(90deg,#8e1a1e,#e2412f 70%,#ff7a55)}.bar.st i{background:linear-gradient(90deg,#2f6d2c,#6cbf4c 70%,#b6ec7a)}.bar.sp i{background:linear-gradient(90deg,#24418e,#3d7fd8 70%,#8fd0ff)}
.bar b{font:italic 700 11px/15px Georgia,serif;letter-spacing:.06em;left:12px;text-transform:none}
.bar.xp{height:6px;background:rgba(10,10,16,.5);border:1px solid rgba(255,207,90,.5)}
#quest{background:linear-gradient(90deg,transparent,rgba(12,12,20,.72) 14%);border-right:2px solid rgba(255,207,90,.65);padding-right:14px}
#quest h4{font:italic 700 13px Georgia,serif;letter-spacing:.08em}#quest .t{font:700 15px Georgia,serif}
#hotbar .slot{background:url(${PAPER}) center/cover;color:#2a2016;border:2px solid #b8923a;box-shadow:0 0 0 1px #2a2016,0 4px 10px rgba(0,0,0,.45),inset 0 0 12px rgba(120,80,30,.35);border-radius:3px}
#hotbar .slot.eq{border-color:#ffd36e;box-shadow:0 0 0 1px #2a2016,0 0 14px rgba(255,207,90,.7),inset 0 0 12px rgba(120,80,30,.35);transform:translateY(-3px)}
#hotbar .slot .k{color:#6a4a1a}#hotbar .slot .n{color:#2a2016}
#mini{border:3px solid #c9a24a!important;box-shadow:0 0 0 2px #1a140c,0 0 0 5px rgba(201,162,74,.35),0 6px 16px #000a!important}
#compass{background:linear-gradient(90deg,transparent,rgba(12,12,20,.62) 15%,rgba(12,12,20,.62) 85%,transparent);border-bottom:1px solid rgba(255,207,90,.45);font-family:Georgia,serif}
#bossbar .nm{font:italic 700 16px Georgia,serif;color:#ffe2a0}#bossbar .bb{height:14px;border:1px solid #c9a24a;box-shadow:0 0 0 1px #000,0 0 18px rgba(255,180,60,.25)}
#mapcv{border:4px solid #3a2a16;box-shadow:0 0 0 2px #c9a24a,8px 8px 0 #000a}
.setrow select{padding:5px 8px;border-radius:5px;border:1px solid #9a8;background:rgba(255,250,235,.92);font:600 13px system-ui}`;document.head.appendChild(st);}
function v5QualityUI(){try{const card=document.querySelector('#settings .card');if(!card||$('sQual'))return;const row=document.createElement('div');row.className='setrow';
 row.innerHTML='<label>Graphics quality <select id="sQual"><option value="auto:high">Auto (starts High)</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label> <span style="opacity:.7;font-size:12px">grass density, shadows, ambient occlusion, bloom, painterly filter, water</span>';
 const h2=card.querySelector('h2');h2.after(row);$('sQual').value=V5.auto?'auto:high':V5.q;
 $('sQual').onchange=e=>{const v=e.target.value;if(v.startsWith('auto')){V5.auto=true;lsSet('km_qauto','1');setQuality('high',true);V5.upped=0;}else setQuality(v);toast('Graphics: '+(V5.auto?'Auto ('+V5.q+')':V5.q));};}catch(e){console.warn(e);}}
// painted scroll map: watercolour hill-shade valley drawn once into mapImg (also feeds the minimap), parchment + ink mountains behind
function v5PaintMapImg(){try{const N=MAPRES,c=mapImg.getContext('2d'),id=c.createImageData(N,N);const hs=(x,z)=>H(x,z);const sx=(WMAX-WMIN)/N,sz=(ZMAX-ZMIN)/N;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=WMIN+(i+.5)*sx,z=ZMIN+(j+.5)*sz,h=hs(x,z);let r,g,b;
  const dzh=hs(x+1,z-1)-hs(x-1,z+1);const shade=clamp(.85+dzh*.09,.55,1.2);const wob=(vnoise(x*.08,z*.08)-.5)*.12;
  if(h<WATER_SEA+.3||inWater(x,z)){const k=.85+wob;r=96*k;g=150*k;b=170*k;}
  else{const f=x<45&&z<115;const k=clamp((h+15)/55,0,1);r=lerp(f?92:150,200,k*.6);g=lerp(f?128:170,190,k*.5);b=lerp(f?84:104,160,k*.6);if(h>26){r=g=b=232;}r*=shade+wob;g*=shade+wob;b*=shade+wob;
   if(pathDist(x,z)<2.2){r=176;g=140;b=96;}}
  const o=(j*N+i)*4;id.data[o]=clamp(r,0,255);id.data[o+1]=clamp(g,0,255);id.data[o+2]=clamp(b,0,255);id.data[o+3]=255;}
 c.putImageData(id,0,0);
 // ink cedar glyphs over the forest
 c.save();const rr=mulberry(5);for(let k=0;k<900;k++){const x=WMIN+rr()*(WMAX-WMIN),z=ZMIN+rr()*(ZMAX-ZMIN);if(!(x<45&&z<115&&z>-150)||inWater(x,z)||pathDist(x,z)<4)continue;const[mx,mz]=w2m(x,z,N,N);c.fillStyle=`rgba(30,60,36,${.35+rr()*.3})`;c.beginPath();c.moveTo(mx,mz-2.6);c.lineTo(mx+1.6,mz+1.4);c.lineTo(mx-1.6,mz+1.4);c.fill();}
 // river ink edge
 c.strokeStyle='rgba(40,70,90,.55)';c.lineWidth=.8;for(const s of[-1,1]){c.beginPath();for(let z=-170;z<=178;z+=3){const[mx,mz]=w2m(RIVX(z)+s*6.5,z,N,N);z===-170?c.moveTo(mx,mz):c.lineTo(mx,mz);}c.stroke();}
 // village roofs
 c.fillStyle='rgba(60,40,30,.8)';for(const k in BLD){const b=BLD[k];const[mx,mz]=w2m(b.x,b.z,N,N);c.fillRect(mx-1.5,mz-1.2,3,2.4);}c.restore();}catch(e){console.warn('[kanemori] v5 map',e);}}
function v5MapBG(c,Wd,Hd){const img=new Image();c.fillStyle='#e9dcbc';c.fillRect(0,0,Wd,Hd);
 if(!v5MapBG.pat){const p=document.createElement('canvas');p.width=p.height=256;const g=p.getContext('2d');const im=new Image();im.src=PAPER;g.fillStyle='#ecdcb8';g.fillRect(0,0,256,256);const r=mulberry(77);
  for(let i=0;i<2200;i++){g.fillStyle=`rgba(${120+r()*60|0},${90+r()*50|0},${50+r()*40|0},${r()*.08})`;g.fillRect(r()*256,r()*256,r()*30,r()*3);}v5MapBG.pat=p;}
 c.fillStyle=c.createPattern(v5MapBG.pat,'repeat');c.fillRect(0,0,Wd,Hd);
 // ink-wash mountain range + clouds band
 const r=mulberry(9);c.save();for(let L=0;L<3;L++){c.fillStyle=`rgba(${70-L*10},${80-L*8},${90-L*10},${.12+L*.06})`;c.beginPath();c.moveTo(0,Hd*(.42+L*.08));for(let x=0;x<=Wd;x+=Wd/24){c.lineTo(x,Hd*(.3+L*.09)-Math.abs(Math.sin(x*.01+L*2))*Hd*(.14-L*.03)-r()*14);}c.lineTo(Wd,Hd);c.lineTo(0,Hd);c.fill();}
 c.fillStyle='rgba(255,255,255,.55)';for(let k=0;k<7;k++){const x=r()*Wd,y=Hd*(.18+r()*.25);c.beginPath();c.ellipse(x,y,60+r()*80,9+r()*6,0,0,TAU);c.fill();}
 // gold border
 c.strokeStyle='#b8923a';c.lineWidth=6;c.strokeRect(8,8,Wd-16,Hd-16);c.strokeStyle='#2a2016';c.lineWidth=1.5;c.strokeRect(14,14,Wd-28,Hd-28);c.restore();}
function v5PatchMap(){const d0=drawMap;drawMap=function(){const cv=$('mapcv'),c=cv.getContext('2d');const fr=c.fillRect;let first=true;
  // first full-canvas fill becomes the painted background; the old flat mountain silhouette is kept but tinted
  const fl=c.fill;let nf=0;c.fillRect=function(x,y,w,h){if(first&&x===0&&y===0&&w===cv.width){first=false;v5MapBG(c,cv.width,cv.height);return;}return fr.call(this,x,y,w,h);};
  c.fill=function(){if(nf++===0){const ga=c.globalAlpha;c.globalAlpha=.35;fl.apply(this,arguments);c.globalAlpha=ga;return;}return fl.apply(this,arguments);};
  try{d0();}finally{c.fillRect=fr;c.fill=fl;}};}
