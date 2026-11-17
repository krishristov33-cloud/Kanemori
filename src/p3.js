/* ============ RESOURCE NODES ============ */
const nodes=[];// {kind,x,z,mesh,charges,max,regrow}
const NODE_DEF={rock:{give:[['stone',1],['flint',.45]],max:3,regrow:90,verb:'Break stone'},ore:{give:[['iron',1],['stone',.3]],max:3,regrow:120,verb:'Mine rust rock'},
 fiber:{give:[['fiber',2]],max:2,regrow:60,verb:'Cut fiber grass'},herb:{give:[['herb',1]],max:2,regrow:70,verb:'Pick yomogi'},mush:{give:[['mushroom',1]],max:1,regrow:80,verb:'Pick mushroom'},bamboo:{give:[['bamboo',1]],max:3,regrow:90,verb:'Cut bamboo'}};
function mkNode(kind,x,z){const y=H(x,z);let m;
 if(kind==='rock'){m=new THREE.Mesh(new THREE.DodecahedronGeometry(rnd(.7,1.1),0),std(0x7c7b84));m.scale.y=.7;}
 else if(kind==='ore'){m=new THREE.Group();const b=new THREE.Mesh(new THREE.DodecahedronGeometry(.9,0),std(0x6a5a52));b.scale.y=.75;m.add(b);for(let i=0;i<4;i++){const v=new THREE.Mesh(new THREE.OctahedronGeometry(.22,0),emis(0xd2692a,.8));v.position.set(rnd(-.6,.6),rnd(.1,.5),rnd(-.6,.6));m.add(v);}}
 else if(kind==='fiber'){m=new THREE.Group();for(let i=0;i<7;i++){const b=new THREE.Mesh(new THREE.ConeGeometry(.07,1.3,3),std(0xa8b45a));b.position.set(rnd(-.3,.3),.6,rnd(-.3,.3));b.rotation.set(rnd(-.3,.3),0,rnd(-.3,.3));m.add(b);}}
 else if(kind==='herb'){m=new THREE.Group();for(let i=0;i<5;i++){const l=new THREE.Mesh(new THREE.OctahedronGeometry(.22,0),emis(0x5fd36a,.35));l.scale.set(1,.4,1.6);l.position.set(rnd(-.25,.25),.25,rnd(-.25,.25));l.rotation.y=R()*3;m.add(l);}
  const f=new THREE.Mesh(new THREE.SphereGeometry(.07,5,4),emis(0xffffff,1.2));f.position.y=.45;m.add(f);}
 else if(kind==='bamboo'){m=new THREE.Group();for(let i=0;i<5;i++){const b=new THREE.Mesh(new THREE.CylinderGeometry(.07,.08,rnd(4,6),6),std(0x7aa84a));b.position.set(rnd(-.6,.6),2.5,rnd(-.6,.6));b.rotation.z=rnd(-.08,.08);m.add(b);}}
 else {m=new THREE.Group();const st=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,.35,6),std(0xeae0cc));st.position.y=.17;m.add(st);const c=new THREE.Mesh(new THREE.SphereGeometry(.28,7,4,0,TAU,0,Math.PI/2),emis(0xd84a3a,.25));c.position.y=.32;m.add(c);}
 m.position.set(x,y,z);m.traverse(o=>{if(o.isMesh){o.castShadow=true;}});scene.add(m);const d=NODE_DEF[kind];const n={kind,x,z,y,mesh:m,charges:d.max,max:d.max,regrow:0};nodes.push(n);gAdd(n);
 if(kind==='rock'||kind==='ore')colliders.push({x,z,r:.8});return n;}
function scatter(kind,count,test){let n=0;for(let i=0;i<count*30&&n<count;i++){const x=rnd(-180,170),z=rnd(-150,170);if(inWater(x,z)||nearFlat(x,z,-6)||!test(x,z))continue;const y=H(x,z);if(y<WATER_SEA+2.5)continue;mkNode(kind,x,z);n++;}}
scatter('rock',55,()=>true);scatter('fiber',60,(x,z)=>pathDist(x,z)<25||z>60);scatter('herb',55,(x,z)=>x<60);scatter('mush',40,(x,z)=>x<45&&z<110);
scatter('ore',18,(x,z)=>{const d=Math.abs(x-RIVX(z));return d>7&&d<20;});
// guarantee early materials near Kanemura start
for(let i=0;i<8;i++)mkNode('bamboo',RIVX(40+i*5)-13-rnd(0,4),40+i*5);
[[6,112,'rock'],[-10,110,'fiber'],[-15,118,'fiber'],[12,106,'herb'],[-4,98,'rock'],[20,100,'herb'],[-18,94,'mush']].forEach(([x,z,k])=>mkNode(k,x,z));
[[RIVX(110)+10,110],[RIVX(95)-11,95],[RIVX(80)+12,80]].forEach(([x,z])=>mkNode('ore',x,z));

/* ============ HERO: Ren ============ */
const hero=new THREE.Group();scene.add(hero);
const pose=new THREE.Group();hero.add(pose);const body=new THREE.Group();pose.add(body);// pose = Aether HeroMotion layer, body = built-in anim
const mInd=std(0x27305e),mJack=std(0x1d2133),mSkin=std(0xe2b48c),mHair=std(0x16131a),mScarf=std(0xb3241c),mRope=std(0xd8c48a),mStraw=std(0xb89a5a);
const hips=new THREE.Group();hips.position.y=1.0;body.add(hips);
const hakama=new THREE.Mesh(new THREE.CylinderGeometry(.3,.52,.95,8),mInd);hakama.position.y=-.35;hips.add(hakama);
function limb(mat,r1,r2,len){const g=new THREE.Group(),m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,len,6),mat);m.position.y=-len/2;m.castShadow=true;g.add(m);return g;}
const legL=limb(mInd,.13,.1,.95),legR=limb(mInd,.13,.1,.95);legL.position.set(-.16,0,0);legR.position.set(.16,0,0);hips.add(legL,legR);
for(const l of[legL,legR]){const f=new THREE.Mesh(new THREE.BoxGeometry(.16,.1,.3),mHair);f.position.set(0,-.95,.06);l.add(f);}
const chest=new THREE.Group();chest.position.y=.05;hips.add(chest);
const torso=new THREE.Mesh(new THREE.CylinderGeometry(.33,.28,.72,8),mJack);torso.position.y=.38;torso.castShadow=true;chest.add(torso);
const belt=new THREE.Mesh(new THREE.TorusGeometry(.3,.05,4,10),mRope);belt.rotation.x=Math.PI/2;belt.position.y=.06;chest.add(belt);
for(let i=0;i<3;i++){const o=new THREE.Mesh(new THREE.PlaneGeometry(.09,.22),new THREE.MeshStandardMaterial({color:0xf2ead6,side:THREE.DoubleSide}));o.position.set(-.18+i*.07,-.06,.29);chest.add(o);}
const mino=new THREE.Mesh(new THREE.ConeGeometry(.42,.6,7,1,true),new THREE.MeshStandardMaterial({color:0xb89a5a,flatShading:true,side:THREE.DoubleSide}));mino.position.set(-.12,.62,-.05);mino.rotation.z=.35;chest.add(mino);
const scarf=new THREE.Mesh(new THREE.TorusGeometry(.2,.07,5,10),mScarf);scarf.rotation.x=Math.PI/2;scarf.position.y=.76;chest.add(scarf);
const scarfTail=new THREE.Mesh(new THREE.BoxGeometry(.12,.5,.04),mScarf);scarfTail.position.set(.1,.6,-.25);chest.add(scarfTail);
const head=new THREE.Group();head.position.y=.98;chest.add(head);
const skull=new THREE.Mesh(new THREE.IcosahedronGeometry(.21,1),mSkin);skull.castShadow=true;head.add(skull);
const hair=new THREE.Mesh(new THREE.IcosahedronGeometry(.225,1),mHair);hair.scale.set(1,.75,1.05);hair.position.set(0,.07,-.03);head.add(hair);
const knot=new THREE.Mesh(new THREE.SphereGeometry(.08,6,5),mHair);knot.position.set(0,.2,-.2);head.add(knot);
for(const sx of[-.07,.07]){const e=new THREE.Mesh(new THREE.BoxGeometry(.05,.025,.02),mHair);e.position.set(sx,.02,.2);head.add(e);}
const armL=limb(mJack,.09,.07,.62),armR=limb(mJack,.09,.07,.62);armL.position.set(-.4,.68,0);armR.position.set(.4,.68,0);chest.add(armL,armR);
for(const a of[armL,armR]){const h=new THREE.Mesh(new THREE.SphereGeometry(.07,6,5),mSkin);h.position.y=-.66;a.add(h);}

// v0.2 Ren look pass: jingasa hat, haori sleeves, red lacquer sode, longer scarf, waraji, pleated hakama panel
{const hat=new THREE.Mesh(new THREE.ConeGeometry(.5,.2,12),std(0xc9a764));hat.position.set(0,.24,0);hat.rotation.x=-.08;head.add(hat);const hb=new THREE.Mesh(new THREE.TorusGeometry(.48,.018,4,16),std(0x6a4a2a));hb.rotation.x=Math.PI/2;hb.position.y=.15;head.add(hb);
 const cap=new THREE.Mesh(new THREE.SphereGeometry(.05,6,4),std(0x8a6a3a));cap.position.y=.35;head.add(cap);
 for(const sx of[-.15,.15]){const st=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.3,3),std(0x2a2016));st.position.set(sx,-.02,.02);st.rotation.z=sx>0?-.25:.25;head.add(st);}
 const mSleeve=std(0x1f2a4a);for(const a of[armL,armR]){const sl=new THREE.Mesh(new THREE.CylinderGeometry(.11,.2,.42,7,1,true),new THREE.MeshStandardMaterial({color:0x1f2a4a,flatShading:true,side:THREE.DoubleSide}));sl.position.y=-.24;sl.castShadow=true;a.add(sl);
  const so=new THREE.Mesh(new THREE.BoxGeometry(.26,.05,.24),std(0xb3241c,{emissive:0x300000,emissiveIntensity:.3,roughness:.5}));so.position.set(0,.02,0);so.rotation.z=a===armL?.35:-.35;a.add(so);
  const so2=so.clone();so2.position.y=-.06;so2.scale.set(.9,1,.9);a.add(so2);}
 const haori=new THREE.Mesh(new THREE.CylinderGeometry(.36,.42,.62,8,1,true),new THREE.MeshStandardMaterial({color:0x1f2a4a,flatShading:true,side:THREE.DoubleSide}));haori.position.y=.3;haori.castShadow=true;chest.add(haori);
 const mon=new THREE.Mesh(new THREE.CircleGeometry(.08,10),emis(0xe8dcb0,.4));mon.position.set(0,.5,-.43);mon.rotation.y=Math.PI;chest.add(mon);
 const col=new THREE.Mesh(new THREE.BoxGeometry(.06,.5,.02),std(0xe8dcb0));col.position.set(-.06,.45,.36);col.rotation.z=.35;chest.add(col);const col2=col.clone();col2.position.x=.06;col2.rotation.z=-.35;chest.add(col2);
 const panel=new THREE.Mesh(new THREE.BoxGeometry(.32,.8,.04),std(0x343e70));panel.position.set(0,-.38,.4);panel.rotation.x=-.18;hips.add(panel);
 for(const l of[legL,legR]){const w=new THREE.Mesh(new THREE.BoxGeometry(.17,.04,.32),std(0xc9a764));w.position.set(0,-1.0,.06);l.add(w);}
 scarfTail.scale.set(1,1.8,1);scarfTail.position.set(.12,.45,-.3);const t2=scarfTail.clone();t2.position.x=-.02;t2.scale.set(.8,1.5,1);chest.add(t2);hero.userData.scarf=[scarfTail,t2];}
const weaponPivot=new THREE.Group();weaponPivot.position.y=-.66;armR.add(weaponPivot);let weaponMesh=null;
const sheath=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,1,5),std(0x111118));sheath.rotation.z=1.2;sheath.position.set(-.3,0,.1);chest.add(sheath);
function buildWeapon(id){if(weaponMesh)weaponPivot.remove(weaponMesh);const W=WEAPONS[id],g=new THREE.Group();
 if(id==='yumi'||id==='daikyu'){const c=new THREE.Mesh(new THREE.TorusGeometry(.75,.025,4,16,Math.PI*.9),std(0x5a3b2a));c.rotation.z=Math.PI/2;c.position.y=.1;g.add(c);}
 else if(id==='yari'){const sh=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,W.len,5),std(0x5a3b2a));sh.position.y=W.len*.25;g.add(sh);const tip=new THREE.Mesh(new THREE.ConeGeometry(.06,.4,4),std(W.col,{metalness:.8,roughness:.3}));tip.position.y=W.len*.75+.2;g.add(tip);}
 else{const grip=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.28,5),std(0x1a1a22));g.add(grip);const tsuba=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,.02,8),std(0xb8a060,{metalness:.7}));tsuba.position.y=.15;g.add(tsuba);
  const bl=new THREE.Mesh(new THREE.BoxGeometry(.04,W.len,.012),std(W.col,id==='katana'?{metalness:.85,roughness:.25,emissive:0x223040,emissiveIntensity:.3}:{}));bl.position.y=.15+W.len/2;bl.rotation.z=.04;g.add(bl);}
 if(id==='daikyu')g.scale.set(1,1.45,1);if(id!=='yumi'&&id!=='daikyu')g.rotation.x=Math.PI/2;g.traverse(o=>{if(o.isMesh)o.castShadow=true});weaponPivot.add(g);weaponMesh=g;sheath.visible=id==='katana';}
// slash trail
const trailGeo=new THREE.BufferGeometry();const TRN=14;trailGeo.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(TRN*2*3),3));{const idx=[];for(let i=0;i<TRN-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}trailGeo.setIndex(idx);}
const trailMat=new THREE.MeshBasicMaterial({color:0xfff2d0,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending});
const trail=new THREE.Mesh(trailGeo,trailMat);trail.frustumCulled=false;scene.add(trail);const trailPts=[];
// kintsugi cracks (data-driven: one set per kakera)
const goldMat=new THREE.MeshStandardMaterial({color:0xffc84a,emissive:0xffb020,emissiveIntensity:3.4,metalness:.8,roughness:.3});
const CRACKS=[[{p:armR,y0:-.05,y1:-.6,r:.095},{p:head,face:1}],[{p:armL,y0:-.05,y1:-.6,r:.095}],[{p:chest,y0:.1,y1:.7,r:.34}],[{p:legL,y0:-.05,y1:-.9,r:.135}],[{p:legR,y0:-.05,y1:-.9,r:.135}],[{p:chest,y0:.7,y1:.15,r:.33,a:3}],[{p:armR,y0:-.1,y1:-.55,r:.095,a:2}],[{p:head,face:2}]];
const crackMeshes=[];
function addCracks(k){const set=CRACKS[k];if(!set)return;const rr=mulberry(99+k);for(const c of set){const pts=[];
 if(c.face){for(let i=0;i<6;i++){const t=i/5;pts.push(new V3((c.face===1?.05:-.05)+(rr()-.5)*.06+(c.face===1?t*.1:-t*.1),.05-t*.16,.205-t*.02));}}
 else{let a=(c.a||0)+rr()*TAU;for(let i=0;i<8;i++){const t=i/7;a+=(rr()-.5)*1.1;const y=lerp(c.y0,c.y1,t);pts.push(new V3(Math.cos(a)*c.r,y,Math.sin(a)*c.r));}}
 const m=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.024,5,false),goldMat);c.p.add(m);crackMeshes.push(m);}}
// shadow blob
const blob=new THREE.Mesh(new THREE.CircleGeometry(.6,12),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.3,depthWrite:false}));blob.rotation.x=-Math.PI/2;scene.add(blob);

/* ============ STATE ============ */
const SAVE_KEY='kanemori.v1';
function freshState(){return{v:1,pos:[-2,0,118],yaw:Math.PI,hp:100,st:100,sp:60,hun:85,warm:80,wet:0,lvl:1,xp:0,skp:0,skills:{},inv:{herb:1,sap:1},weapons:['bokken'],eq:'bokken',
 shards:0,quest:0,time:0.32,weather:'clear',wxT:140,stormArmed:false,structures:[],boss:{dead:false},discovered:{},disc:[],stat:{gWood:0,gFiber:0,kills:0,fires:0,stormsSurvived:0,foundWeb:false,fish:0,cooked:0}};}
let S=freshState();
const DERIV={maxHp:()=>100+S.shards*20,maxSp:()=>60+S.shards*15+(S.skills.well?30:0),maxSt:()=>100+S.lvl*3};
const has=k=>!!S.skills[k];
function save(manual){try{S.pos=[hero.position.x,hero.position.y,hero.position.z];S.yaw=P.yaw;S.structures=structures.map(s=>({type:s.type,x:s.x,z:s.z,lit:s.lit,fuel:s.fuel}));
 lsSet(SAVE_KEY,JSON.stringify(S));if(manual)toast('Game saved 保存');}catch(e){kmWarn('Save failed: '+e.message);}}
function load(){const raw=lsGet(SAVE_KEY);if(!raw)return false;try{const d=JSON.parse(raw);if(!d||d.v!==1)return false;S=Object.assign(freshState(),d);S.stat=Object.assign(freshState().stat,d.stat||{});applyLoaded();return true;}catch(e){kmWarn('Save could not be read; starting fresh.');return false;}}

/* ============ AUDIO (synth, starts on first input) ============ */
let AC=null,master=null,muted=lsGet('km_mute')==='1',rainGain=null,windGain=null;
function audioInit(){if(AC)return;try{AC=new (window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=muted?0:.7;master.connect(AC.destination);
 const nb=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;AC._noise=nb;
 const mk=(f,q)=>{const s=AC.createBufferSource();s.buffer=nb;s.loop=true;const fl=AC.createBiquadFilter();fl.type='bandpass';fl.frequency.value=f;fl.Q.value=q;const g=AC.createGain();g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(master);s.start();return g;};
 rainGain=mk(2400,.6);windGain=mk(400,.4);}catch(e){AC=null;}}
function tone(f,dur,type='sine',vol=.2,slide=0){if(!AC)return;const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,f*slide),t+dur);
 g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.02);}
function noise(dur,f=1200,vol=.25,q=1){if(!AC)return;const t=AC.currentTime,s=AC.createBufferSource();s.buffer=AC._noise;const fl=AC.createBiquadFilter();fl.type='lowpass';fl.frequency.value=f;fl.Q.value=q;const g=AC.createGain();
 g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(fl);fl.connect(g);g.connect(master);s.start(t);s.stop(t+dur+.05);}
function bellTone(big=1){if(!AC)return;const base=big>1?110:196;[[1,1],[2.76,.5],[5.4,.28],[8.9,.12],[.5,.35]].forEach(([m,v],i)=>tone(base*m,(big>1?6:3.2)/(1+i*.4),'sine',.22*v*big));}
const SFX={swing:()=>noise(.12,2600,.12),hit:()=>{noise(.08,900,.3);tone(140,.12,'square',.08,.5);},heavy:()=>{noise(.18,500,.4);tone(90,.25,'sawtooth',.1,.4);},
 hurt:()=>{tone(220,.2,'sawtooth',.12,.5);},chop:()=>{noise(.1,700,.3);tone(180,.08,'triangle',.12,.7);},pick:()=>tone(880,.09,'triangle',.08,1.4),
 craft:()=>{tone(520,.1,'triangle',.1);setTimeout(()=>tone(780,.14,'triangle',.1),90);},thunder:()=>{noise(2.4,180,.7,.5);},fire:()=>noise(.4,400,.2),
 lvl:()=>{[523,659,784,1046].forEach((f,i)=>setTimeout(()=>tone(f,.3,'triangle',.12),i*90));},splash:()=>noise(.3,1600,.2),cast:()=>{tone(300,.35,'sawtooth',.08,3);noise(.3,3000,.12);},
 block:()=>{tone(600,.08,'square',.08,.8);noise(.06,3000,.15);}};

/* ============ FX: particles, bell ripple, numbers ============ */
const parts=[];const pGeo=new THREE.IcosahedronGeometry(.12,0);
function burst(pos,col,n=10,spd=4,life=.6,size=1,grav=6){for(let i=0;i<n;i++){const m=new THREE.Mesh(pGeo,new THREE.MeshBasicMaterial({color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
 m.position.copy(pos);m.scale.setScalar(size*(.5+R()));scene.add(m);parts.push({m,v:new V3(rnd(-1,1),rnd(.2,1.4),rnd(-1,1)).normalize().multiplyScalar(spd*(.4+R())),life,max:life,grav});}}
function updParts(dt){for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.life-=dt;if(p.life<=0){scene.remove(p.m);p.m.material.dispose();parts.splice(i,1);continue;}
 p.v.y-=p.grav*dt;p.m.position.addScaledVector(p.v,dt);p.m.material.opacity=p.life/p.max;}}
const rings=[];
function groundRing(pos,col,maxR,dur,thick=.35){const m=new THREE.Mesh(new THREE.RingGeometry(.8,1,40),new THREE.MeshBasicMaterial({color:col,transparent:true,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));
 m.rotation.x=-Math.PI/2;m.position.copy(pos);m.position.y+=.15;scene.add(m);rings.push({m,t:0,dur,maxR,thick});return m;}
function updRings(dt){for(let i=rings.length-1;i>=0;i--){const r=rings[i];r.t+=dt;const k=r.t/r.dur;if(k>=1){scene.remove(r.m);r.m.geometry.dispose();r.m.material.dispose();rings.splice(i,1);continue;}
 const s=lerp(.5,r.maxR,1-Math.pow(1-k,2));r.m.scale.set(s,s,s);r.m.material.opacity=(1-k)*.9;}}
const TIME={freeze:0,slow:1,slowT:0,shake:0};
function hitstop(sec){TIME.freeze=Math.max(TIME.freeze,sec);}
function slowmo(scale,sec){TIME.slow=scale;TIME.slowT=sec;}
function shake(a){TIME.shake=Math.max(TIME.shake,a);}
function bellRing(pos,big=1){if(KMF.ok&&KMF.bell){try{KMF.bell.ring({position:pos,intensity:big>1?1.3:.9,tone:!muted,freeze:false});if(big>1&&KMF.ink)KMF.ink.flash('gold',600);hitstop(big>1?.12:.06);grassPulse=1;return;}catch(e){}}bellTone(big);hitstop(big>1?.12:.06);groundRing(pos,0xffcf5a,big>1?40:16,big>1?1.8:1.0);groundRing(pos,0xfff2c0,big>1?26:10,big>1?1.3:.7);
 const r=$('ripple');r.style.transition='none';r.style.opacity='1';r.style.transform='scale(.6)';requestAnimationFrame(()=>{r.style.transition='opacity .9s, transform .9s';r.style.opacity='0';r.style.transform='scale(1.8)';});
 grassPulse=1;}
let grassPulse=0;
const dnLayer=$('dmg'),dns=[];
function dmgNum(pos,txt,cls=''){const d=document.createElement('div');d.className='dn '+cls;d.textContent=J(txt)||txt;dnLayer.appendChild(d);dns.push({d,p:pos.clone().add(new V3(rnd(-.4,.4),0,rnd(-.4,.4))),t:0});}
const _v=new V3();
function updDns(dt){for(let i=dns.length-1;i>=0;i--){const n=dns[i];n.t+=dt;n.p.y+=dt*1.4;if(n.t>1){n.d.remove();dns.splice(i,1);continue;}
 _v.copy(n.p).project(camera);if(_v.z>1){n.d.style.display='none';continue;}n.d.style.display='';n.d.style.left=((_v.x+1)/2*innerWidth)+'px';n.d.style.top=((1-_v.y)/2*innerHeight)+'px';n.d.style.opacity=String(1-Math.max(0,n.t-.6)/.4);}}
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=J(t);const c=$('toasts');c.appendChild(e);while(c.children.length>6)c.firstChild.remove();setTimeout(()=>e.remove(),3200);}
let titleT=0;function areaTitle(a,b,c){if(!SHOWJP){const a2=J(a);if(!a2){a=b;b='';}else a=a2;b=J(b);c=J(c);}$('tA').textContent=a;$('tB').textContent=b;$('tC').textContent=c||'';$('title').style.opacity='1';titleT=4;}
