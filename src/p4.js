/* ============ INPUT ============ */
const keys={},pressed={};let mouseL=false,mouseR=false,mdx=0,mdy=0;
const UIopen=()=>document.querySelector('.overlay:not(.hidden)');
addEventListener('keydown',e=>{const tg=e.target&&e.target.tagName;if(tg==='TEXTAREA'||tg==='INPUT'){if(e.code==='Escape'&&TALK.n){closeTalk();}return;}audioInit();if(e.code==='Tab'||e.code==='F1'||e.code==='Space')e.preventDefault();if(!keys[e.code])pressed[e.code]=true;keys[e.code]=true;onKey(e.code);});
addEventListener('keyup',e=>{keys[e.code]=false;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
const PL_OK='requestPointerLock' in Element.prototype;const locked=()=>document.pointerLockElement===renderer.domElement;
function requestLock(){try{const p=renderer.domElement.requestPointerLock();if(p&&p.catch)p.catch(()=>{});}catch(_){}}
const MSET={sens:+(lsGet('km_sens')||1),inv:lsGet('km_invy')==='1'};
renderer.domElement.addEventListener('mousedown',e=>{audioInit();if(UIopen())return;if(PL_OK&&!locked()&&!QS.has('shots')){requestLock();return;}// first click only locks
 if(e.button===0){pressed.LMB=true;mouseL=true;}if(e.button===2){pressed.RMB=true;mouseR=true;}});
addEventListener('mouseup',e=>{if(e.button===0)mouseL=false;if(e.button===2)mouseR=false;});
addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('mousemove',e=>{if(UIopen())return;if(locked()||(!PL_OK&&e.buttons)){mdx+=e.movementX*MSET.sens;mdy+=e.movementY*MSET.sens*(MSET.inv?-1:1);}});
let autoPauseT=0;document.addEventListener('pointerlockchange',()=>{if(PL_OK&&!locked()&&!UIopen()&&!document.body.classList.contains('menu')&&!QS.has('shots')){show('pause');autoPauseT=performance.now();}updLockOverlay();});document.addEventListener('pointerlockerror',()=>{kmWarn('Mouse capture was refused by the browser. Click the game again.');});
function updLockOverlay(){const el=$('clickplay');if(!el)return;const show=PL_OK&&!locked()&&!UIopen()&&!document.body.classList.contains('menu')&&!QS.has('shots');el.style.display=show?'flex':'none';}
const CTL=[['WASD','Move'],['Shift','Sprint'],['Space','Jump'],['Q','Dodge roll'],['LMB','Light attack (combo)'],['RMB','Heavy attack'],['F','Block · tap on hit = PARRY'],['Tab','Lock-on'],['X','Cast Fire ofuda'],['Z','Earth Wall talisman'],['J','Journal'],['H','Mount / dismount horse'],['R','Swap arrow type'],['E','Talk · gather · interact · fish'],['B','Build (campfire, lean-to)'],['I / C','Inventory & crafting'],['K','Skill tree'],['M','Scroll map'],['1-8','Hotbar: equip / use'],['Esc / P','Pause · save'],['F1','Controls'],['G','Post FX on/off']];
const ctlHTML=CTL.map(([k,v])=>`<div><kbd>${k}</kbd>${v}</div>`).join('');['ctlStart','ctlPause','ctlHelp'].forEach(i=>$(i).innerHTML=ctlHTML);

/* ============ PLAYER ============ */
const P={yaw:Math.PI,camYaw:Math.PI,camPitch:.32,vel:new V3(),vy:0,ground:true,dodge:0,dodgeDir:new V3(),iframe:0,atk:null,queue:null,combo:0,comboT:0,block:false,blockT:0,lock:null,
 stDelay:0,hurtT:0,regen:[],buffs:{},poison:0,slowT:0,rooted:0,stepT:0,landSquash:0,dead:false,lastSafe:null,perfect:0,lean:0,pullT:0};
const W=()=>WEAPONS[S.eq];
// v0.2 (Aether fix 2+3): per-weapon timing tables, heavy 0.15 s wind-up, finisher hold, shard-tier recovery
const TIMING={bokken:{L:[[.10,.42]],H:[.15+.10,.78]},katana:{L:[[.06,.36]],H:[.15+.07,.70]},yari:{L:[[.08,.32],[.08,.32],[.16,.55]],H:[.15+.09,.80]}};
const shardTier=()=>S.shards>=6?2:S.shards>=3?1:0;
function startAttackV03(heavy){if(P.atk||P.dodge>0||P.dead)return;const w=W();if(w.ranged){fireArrow(heavy);return;}const cost=heavy?w.stH:w.stL;if(S.st<cost*.5){toast('Too tired!');return;}useSt(cost);
 const T=TIMING[S.eq]||TIMING.katana,idx=heavy?0:P.combo,spd=has('flow')&&!heavy?1.18:1;
 let hitAt,dur;if(heavy){[hitAt,dur]=T.H;}else{[hitAt,dur]=T.L[Math.min(idx,T.L.length-1)];}
 const fin=!heavy&&idx===w.combo-1;const rec=[1,.85,.7][shardTier()];dur=hitAt+(dur-hitAt)*rec+(fin?.1:0);hitAt/=spd;dur/=spd;
 const sweep=S.eq==='yari'&&!heavy&&idx===2;
 P.atk={heavy,t:0,dur,hitAt,hit:false,idx,fin,sweep};
 if(!heavy){P.combo=(P.combo+1)%w.combo;}P.comboT=.9;SFX.swing();if(KMF.hero)try{KMF.hero.attack(heavy?'heavy':'light')}catch(e){}
 if(P.lock&&P.lock.alive!==false){P.yaw=Math.atan2(P.lock.pos.x-hero.position.x,P.lock.pos.z-hero.position.z);}}
function useSt(n){S.st=Math.max(0,S.st-n);P.stDelay=.6;}
function enemiesAll(){const a=minions.filter(m=>m.alive);if(boss.active&&boss.alive)a.push(boss);return a;}
function doHit(){const w=W(),a=P.atk;if(a.bow){releaseArrow(a.heavy);return;}const fwd=new V3(Math.sin(P.yaw),0,Math.cos(P.yaw));let any=false;
 const dmgBase=(a.heavy?w.heavy:w.dmg)*(has('keen')?1.1:1)*(P.buffs.might>0?1.1:1);
 for(const e of enemiesAll()){const d=new V3().subVectors(e.pos,hero.position);const dy=d.y;d.y=0;const dist=d.length()-(e.radius||.5);if(dist>w.reach+(a.heavy?.3:0))continue;
  if(e.isBoss&&!boss.canMelee()){continue;}if(Math.abs(dy)>3.2&&!e.isBoss)continue;
  const arc=a.sweep?1.3:w.arc;const ang=Math.acos(clamp(d.normalize().dot(fwd),-1,1));if(ang>arc&&dist>.6)continue;
  let dmg=dmgBase,crit=false;if(P.counter>0){dmg*=has('counter')?3:2;crit=true;P.counter=0;}if(a.fin){dmg*=1.25;crit=true;}
  dmg=Math.round(dmg*(.9+R()*.2));e.damage(dmg,fwd,a.heavy,crit);any=true;}
 // anchor threads
 if(boss.active)for(const an of boss.anchors){if(an.cut)continue;const d=Math.hypot(an.x-hero.position.x,an.z-hero.position.z);if(d<w.reach+.6){boss.cutAnchor(an);any=true;}}
 if(any){hitstop(a.fin?.06:a.heavy?.07:.035);if(a.heavy)shake(.25);SFX[a.heavy?'heavy':'hit']();const sp=hero.position.clone().add(new V3(Math.sin(P.yaw)*1.4,1.2,Math.cos(P.yaw)*1.4));
  if(a.fin||a.heavy){if(KMF.sparks)try{KMF.sparks.burst(sp,new V3(0,1,0),14,'gold')}catch(e){}else burst(sp,0xffcf5a,14,5,.5);}
  if(shardTier()>=2)tone(1320,.25,'sine',.05);}}
function playerHit(dmg,src,opt={}){if(P.dead)return'none';
 if(P.iframe>0){const ti=(.35-P.dodge)-.05;if(ti>.07)return'dodged';if(!P.perfectCd){if(KMF.after)try{KMF.after.burst(body,P.dodgeDir.clone().multiplyScalar(12),4)}catch(e){}P.perfectCd=1;slowmo(.3,.5);toast('Perfect dodge 見切り');burst(hero.position.clone().add(new V3(0,1,0)),0xffcf5a,14,3);setTimeout(()=>P.perfectCd=0,600);}return'dodged';}
 if(P.block){const win=has('parry2')?.22:.18;const since=P.blockT;
  if(since<=win&&opt.parry!==false){bellRing(hero.position.clone(),1);slowmo(.45,.35);toast('PARRY 弾き');P.counter=3;S.sp=Math.min(DERIV.maxSp(),S.sp+8);if(src&&src.stagger)src.stagger(1.2,true);burst(hero.position.clone().add(new V3(0,1.3,.4)),0xffe2a0,18,6);return'parried';}
  if(since<=.35||true){const chip=Math.round(dmg*.3);applyDmg(chip,src);useSt(12);SFX.block();shake(.1);return'blocked';}}
 applyDmg(dmg,src);if(opt.poison)P.poison=Math.max(P.poison,opt.poison);return'hit';}
function applyDmg(d,src){if(d<=0)return;S.hp-=d;dmgNum(hero.position.clone().add(new V3(0,2,0)),'-'+d,'pl');SFX.hurt();shake(.18);P.hurtT=.25;$('hurt').style.opacity='1';setTimeout(()=>$('hurt').style.opacity='0',180);
 if(S.hp<=0)die(src&&src.name?'Felled by '+src.name+'.':'You collapsed.');}
function die(why){if(P.dead)return;P.dead=true;S.hp=0;$('deadWhy').textContent=why+' You wake at your last shelter. Nothing is lost.';setTimeout(()=>{show('dead');},700);}
function respawn(){P.dead=false;const sh=structures.filter(s=>s.type==='leanto'||s.type==='hut').pop();const p=sh?[sh.x+2,sh.z+2]:(S.restPoint||[-2,118]);hero.position.set(p[0],H(p[0],p[1]),p[1]);
 S.hp=Math.round(DERIV.maxHp()*.6);S.st=DERIV.maxSt();S.warm=Math.max(S.warm,50);S.hun=Math.max(S.hun,40);P.poison=0;hide('dead');if(boss.active)boss.reset();}

/* ============ STRUCTURES ============ */
const structures=[];
function buildStruct(type,x,z,lit=true,fuel=240){const y=H(x,z),g=new THREE.Group();g.position.set(x,y,z);const s={type,x,z,g,lit,fuel};
 if(type==='campfire'){for(let i=0;i<6;i++){const st=new THREE.Mesh(new THREE.DodecahedronGeometry(.18,0),std(0x77767e));st.position.set(Math.cos(i/6*TAU)*.55,.1,Math.sin(i/6*TAU)*.55);g.add(st);}
  for(let i=0;i<3;i++){const l=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.9,5),std(0x5a3b2a));l.rotation.set(Math.PI/2.4,i*2.1,0);l.position.y=.2;g.add(l);}
  s.flame=new THREE.Mesh(new THREE.ConeGeometry(.32,.9,6),emis(0xff8a2a,2.6,{transparent:true,opacity:.9}));s.flame.position.y=.55;g.add(s.flame);
  s.light=new THREE.PointLight(0xff8a3a,10,14,1.5);s.light.position.y=1.2;g.add(s.light);}
 else if(type==='hut'){const wm=std(0x6a4a30),tm=std(0xb89a5a);const wl=new THREE.Mesh(new THREE.BoxGeometry(3.6,2.2,3.2),std(0x9a7a50));wl.position.y=1.1;g.add(wl);const rf=new THREE.Mesh(new THREE.CylinderGeometry(0,3.2,2,4),tm);rf.rotation.y=Math.PI/4;rf.position.y=3.1;rf.scale.z=.9;g.add(rf);
  const door=new THREE.Mesh(new THREE.PlaneGeometry(1,1.6),new THREE.MeshBasicMaterial({color:0x1a120a}));door.position.set(0,.8,1.61);g.add(door);const wn=new THREE.Mesh(new THREE.PlaneGeometry(.6,.5),emis(0xffb35a,1.5));wn.position.set(1.81,1.3,0);wn.rotation.y=Math.PI/2;g.add(wn);colliders.push({x,z,r:1.7});}
 else{const wm=std(0x6a4a30),tm=std(0xb89a5a);for(const sx of[-1.5,1.5]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,2.6,5),wm);p.position.set(sx,1.3,-1);g.add(p);}
  const roof=new THREE.Mesh(new THREE.BoxGeometry(3.6,.15,3.2),tm);roof.position.set(0,1.75,0);roof.rotation.x=-.55;g.add(roof);
  const back=new THREE.Mesh(new THREE.BoxGeometry(3.6,1.4,.12),tm);back.position.set(0,.6,-1.25);back.rotation.x=.2;g.add(back);colliders.push({x:x,z:z-1.2,r:.6});}
 g.rotation.y=P.yaw+Math.PI;g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});scene.add(g);structures.push(s);
 g.scale.set(1,.01,1);s.grow=0;return s;}
function nearStruct(type,r,x=hero.position.x,z=hero.position.z){let best=null,bd=r;for(const s of structures){if(s.type!==type)continue;const d=Math.hypot(s.x-x,s.z-z);if(d<bd){bd=d;best=s;}}return best;}
const sheltered=()=>!!nearStruct('leanto',3.4)||!!nearStruct('hut',3.6)||nearWall()||Math.hypot(hero.position.x,hero.position.z-150)<22;
const nearFire=()=>{const f=nearStruct('campfire',5);return f&&f.lit?f:null;};
const nearForge=()=>Math.hypot(hero.position.x-FORGE.x,hero.position.z-FORGE.z)<6||!!nearFire();

/* ============ MINIONS & ANIMALS ============ */
const minions=[];
function buildMinion(type){const g=new THREE.Group();const parts={};
 if(type==='kodama'){const b=new THREE.Mesh(new THREE.CapsuleGeometry(.22,.3,3,8),std(0xe8f0dc,{emissive:0x9fd8a0,emissiveIntensity:.25}));b.position.y=.45;g.add(b);const h=new THREE.Mesh(new THREE.SphereGeometry(.26,8,6),std(0xeef4e4,{emissive:0xa0e0b0,emissiveIntensity:.3}));h.position.y=.88;g.add(h);parts.head=h;
  for(const sx of[-.09,.09]){const e=new THREE.Mesh(new THREE.SphereGeometry(.045,5,4),new THREE.MeshBasicMaterial({color:0x111111}));e.position.set(sx,.9,.22);g.add(e);}}
 else if(type==='tanuki'){const b=new THREE.Mesh(new THREE.SphereGeometry(.55,8,6),std(0x7a5a3e));b.scale.set(1,1.05,.95);b.position.y=.62;g.add(b);parts.belly=b;const bl=new THREE.Mesh(new THREE.SphereGeometry(.4,8,6),std(0xd9c3a0));bl.position.set(0,.55,.28);g.add(bl);
  const h=new THREE.Mesh(new THREE.SphereGeometry(.33,8,6),std(0x7a5a3e));h.position.y=1.32;g.add(h);const m=new THREE.Mesh(new THREE.BoxGeometry(.5,.12,.1),std(0x1c1612));m.position.set(0,1.36,.28);g.add(m);
  for(const sx of[-.2,.2]){const e=new THREE.Mesh(new THREE.ConeGeometry(.09,.18,4),std(0x5a402c));e.position.set(sx,1.62,0);g.add(e);const ey=new THREE.Mesh(new THREE.SphereGeometry(.04,4,3),emis(0xffd040,2));ey.position.set(sx*.6,1.38,.33);g.add(ey);}
  const leaf=new THREE.Mesh(new THREE.OctahedronGeometry(.15,0),std(0x5fae4a));leaf.scale.set(1,.3,1.6);leaf.position.y=1.66;g.add(leaf);
  const t=new THREE.Mesh(new THREE.ConeGeometry(.18,.7,6),std(0x5a402c));t.rotation.x=-2;t.position.set(0,.5,-.55);g.add(t);}
 else if(type==='mushroom'){const st=new THREE.Mesh(new THREE.CylinderGeometry(.28,.36,.8,8),std(0xeee0c8));st.position.y=.4;g.add(st);const cap=new THREE.Mesh(new THREE.SphereGeometry(.7,9,6,0,TAU,0,Math.PI/2),std(0xb33a5a,{emissive:0x501020,emissiveIntensity:.3}));cap.position.y=.75;g.add(cap);parts.cap=cap;
  for(let i=0;i<5;i++){const d=new THREE.Mesh(new THREE.SphereGeometry(.09,5,4),std(0xfff4dc));const a=i/5*TAU;d.position.set(Math.cos(a)*.42,1.08,Math.sin(a)*.42);g.add(d);}
  for(const sx of[-.1,.1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.05,5,4),emis(0xffe040,2.2));e.position.set(sx,.6,.3);g.add(e);}}
 else if(type==='spiderling'){const b=new THREE.Mesh(new THREE.SphereGeometry(.35,7,5),std(0x1a1420));b.position.y=.4;g.add(b);parts.belly=b;for(let i=0;i<6;i++){const l=new THREE.Mesh(new THREE.CylinderGeometry(.03,.02,.7,3),std(0x241a2c));l.position.set(Math.cos(i)*.35,.3,Math.sin(i)*.35);l.rotation.z=Math.cos(i)*1.2;l.rotation.x=Math.sin(i)*1.2;g.add(l);}for(const sx of[-.1,.1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.05,4,3),emis(0xffe03a,2.5));e.position.set(sx,.5,.3);g.add(e);}}
 else {const b=new THREE.Mesh(new THREE.BoxGeometry(.5,.55,1.3),std(0xa06a3e));b.position.y=1.1;g.add(b);const n=new THREE.Mesh(new THREE.BoxGeometry(.25,.6,.25),std(0xa06a3e));n.position.set(0,1.55,.6);n.rotation.x=.4;g.add(n);
  const h=new THREE.Mesh(new THREE.BoxGeometry(.25,.25,.45),std(0x8a5a32));h.position.set(0,1.85,.75);g.add(h);parts.legs=[];for(const[a,b2]of[[-.2,.5],[.2,.5],[-.2,-.5],[.2,-.5]]){const l=new THREE.Mesh(new THREE.CylinderGeometry(.05,.04,.85,4),std(0x6a4426));l.position.set(a,.42,b2);g.add(l);parts.legs.push(l);}
  for(const s of[-1,1]){const an=new THREE.Mesh(new THREE.ConeGeometry(.03,.5,3),std(0xd8c8a8));an.position.set(s*.1,2.15,.7);an.rotation.z=s*.4;g.add(an);}}
 g.traverse(o=>{if(o.isMesh)o.castShadow=true;});return{g,parts};}
function hpBar(){const g=new THREE.Group();const bg=new THREE.Mesh(new THREE.PlaneGeometry(1,.1),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.6,depthTest:false}));const fg=new THREE.Mesh(new THREE.PlaneGeometry(1,.1),new THREE.MeshBasicMaterial({color:0xff4b4b,depthTest:false}));
 fg.position.z=.001;g.add(bg,fg);g.renderOrder=10;bg.renderOrder=10;fg.renderOrder=11;g.visible=false;return{g,fg};}
function spawnMinion(type,x,z){const D=MINION_DEF[type],{g,parts}=buildMinion(type);if(type==='spiderling')g.scale.setScalar(1);const y=H(x,z);g.position.set(x,y,z);scene.add(g);const hb=hpBar();hb.g.position.y=type==='deer'?2.5:type==='tanuki'?2.1:type==='kodama'?1.4:type==='spiderling'?1:1.6;g.add(hb.g);
 const night=isNight();const m={type,D,g,parts,hb,pos:g.position,hp:D.hp*(night?1.3:1),max:D.hp*(night?1.3:1),alive:true,state:'idle',t:0,cd:rnd(.5,2),home:new V3(x,y,z),dir:R()*TAU,radius:type==='tanuki'?.6:.45,
  name:{spiderling:'a spiderling',kodama:'a kodama',tanuki:'a tanuki trickster',mushroom:'a mushroom yokai',deer:'a deer'}[type],stun:0,burn:0,kb:new V3(),night,
  damage(d,dir,heavy,crit){if(!this.alive)return;this.hp-=d;dmgNum(this.pos.clone().add(new V3(0,1.4,0)),String(d),crit?'crit':'');this.hb.g.visible=true;this.kb.copy(dir).multiplyScalar(heavy?9:4.5);
   burst(this.pos.clone().add(new V3(0,.8,0)),type==='kodama'?0xc8ffd0:type==='mushroom'?0xff80b0:0xffe2a0,8,4,.4);
   if(this.state==='tell'&&type==='mushroom'){this.hp-=d;dmgNum(this.pos.clone().add(new V3(0,2,0)),'POP!','crit');}
   if(heavy||this.state!=='attack')this.stagger(heavy?.6:.25);if(this.D.flee||this.D.animal)this.state='flee',this.t=0;
   if(this.hp<=0)killMinion(this);},
  stagger(t,big){this.stun=Math.max(this.stun,t);if(big)P.counter=3;if(this.state==='tell'||this.state==='attack'){this.state='recover';this.t=0;}if(big)dmgNum(this.pos.clone().add(new V3(0,1.8,0)),'STAGGER','crit');}};
 minions.push(m);return m;}
function killMinion(m){m.alive=false;try{questEvent('kill',m.type||m.D.id);}catch(e){}S.stat.kills+=m.D.animal?0:1;if(m.D.animal)S.stat.hunts=(S.stat.hunts||0)+1;gainXP(Math.round(m.D.xp*(m.night?1.5:1)));
 burst(m.pos.clone().add(new V3(0,.8,0)),0xffffff,16,5,.7);
 for(const[it,a,b]of m.D.loot){let n=a+Math.floor(R()*(b-a+1));if(n>0)dropLoot(m.pos,it,n);}
 if(m.stolen){dropLoot(m.pos,m.stolen,1);}if(m.D.animal&&has('skinner'))dropLoot(m.pos,'hide',1);
 let k=1;const iv=setInterval(()=>{k-=.1;m.g.scale.setScalar(Math.max(.01,k));if(k<=0){clearInterval(iv);scene.remove(m.g);const i=minions.indexOf(m);if(i>=0)minions.splice(i,1);}},30);}
const loots=[];
function dropLoot(pos,item,n){const m=new THREE.Mesh(new THREE.OctahedronGeometry(.18,0),emis(item==='silk'?0xffffff:0xffcf5a,1.8));m.position.copy(pos).add(new V3(rnd(-.6,.6),.8,rnd(-.6,.6)));scene.add(m);loots.push({m,item,n,t:0,vy:3});}
function updLoot(dt){for(let i=loots.length-1;i>=0;i--){const l=loots[i];l.t+=dt;const gy=H(l.m.position.x,l.m.position.z)+.35;l.vy-=12*dt;l.m.position.y=Math.max(gy,l.m.position.y+l.vy*dt);l.m.rotation.y+=dt*3;
 const d=l.m.position.distanceTo(hero.position.clone().add(new V3(0,.6,0)));if(l.t>.4&&d<4.5){l.m.position.lerp(hero.position.clone().add(new V3(0,.8,0)),Math.min(1,dt*10));}
 if(l.t>.4&&d<1){give(l.item,l.n);scene.remove(l.m);loots.splice(i,1);SFX.pick();}else if(l.t>90){scene.remove(l.m);loots.splice(i,1);}}}
const SPAWN_ZONES=[{type:'kodama',n:9,test:(x,z)=>x<40&&z<100},{type:'tanuki',n:7,test:(x,z)=>x<50&&z<105&&z>-90},{type:'mushroom',n:7,test:(x,z)=>x<30&&z<80},{type:'deer',n:6,test:(x,z)=>z>-40&&z<120}];
function spawnTick(force){for(const zd of SPAWN_ZONES){const cnt=minions.filter(m=>m.alive&&m.type===zd.type).length;const want=zd.n+(isNight()&&!MINION_DEF[zd.type].animal?2:0);
 if(cnt<want){for(let tries=0;tries<30;tries++){const x=rnd(-170,100),z=rnd(-140,110);if(!zd.test(x,z)||inWater(x,z)||nearFlat(x,z,2))continue;if(!force&&Math.hypot(x-hero.position.x,z-hero.position.z)<45)continue;if(Math.hypot(x+85,z+100)<30)continue;spawnMinion(zd.type,x,z);break;}}}}
const _t=new V3();
function updMinion(m,dt,time){if(!m.alive)return;const D=m.D,toP=_t.subVectors(hero.position,m.pos);toP.y=0;const dist=toP.length();m.t+=dt;
 if(dist>110){m.g.visible=false;return;}m.g.visible=true;
 if(m.burn>0){m.burn-=dt;if((m._bt=(m._bt||0)+dt)>.5){m._bt=0;m.damage(2,new V3(),false,false);}}
 let mv=0,face=null;m.kb.multiplyScalar(Math.max(0,1-dt*8));
 if(m.stun>0){m.stun-=dt;m.g.rotation.z=Math.sin(time*30)*.1;}else{m.g.rotation.z=0;
 if(D.flee){ // kodama/deer
  if(m.state!=='flee'&&dist<(D.animal?14:9)){m.state=D.animal?'freeze':'rattle';if(m.state!==m._ls)m.t=0;}
  if(m.state==='rattle'||m.state==='freeze'){if(m.parts.head)m.parts.head.rotation.z=Math.sin(time*40)*.4;face=Math.atan2(toP.x,toP.z);if(m.t>(D.animal?.5:.55)){m.state='flee';m.t=0;}}
  else if(m.state==='flee'){const zig=D.animal?0:Math.sin(m.t*6)*1.2;m.dir=Math.atan2(-toP.x,-toP.z)+zig;mv=D.speed;if(m.parts.head)m.parts.head.rotation.z=0;if(dist>30&&m.t>3){m.state='idle';m.t=0;}}
  else{if(m.t>m.cd){m.dir+=rnd(-1.5,1.5);m.cd=rnd(1.5,4);m.t=0;}mv=D.animal?1.1:.8;}}
 else{ // tanuki / mushroom
  const ag=D.aggro*(has('stealth')?.5:1)*(isNight()?1.2:1)*(S.weather==='fog'?.6:1);
  if(m.state==='idle'||m.state==='wander'){if(m.t>m.cd){m.dir+=rnd(-1.5,1.5);m.cd=rnd(2,4);m.t=0;}mv=.7;if(dist<ag)m.state='chase',m.t=0;}
  else if(m.state==='chase'){face=Math.atan2(toP.x,toP.z);m.dir=face;mv=D.speed;if(m.cd>0)m.cd-=dt;
   if(dist<D.reach+(m.type==='tanuki'?2.6:m.type==='spiderling'?1:0)&&m.cd<=0){m.state='tell';m.t=0;m.aim=hero.position.clone();}if(dist>ag*2.2)m.state='idle';}
  else if(m.state==='tell'){face=Math.atan2(toP.x,toP.z);const k=m.t/D.tell;
   if(m.type==='tanuki'||m.type==='spiderling'){m.parts.belly.scale.setScalar(1+k*.3);}else{m.parts.cap.scale.set(1+k*.35,1+k*.5,1+k*.35);m.parts.cap.material.emissiveIntensity=.3+k*2.5;}
   if(m.t>=D.tell){m.state='attack';m.t=0;m.hitDone=false;if(m.type==='mushroom'){groundRing(m.pos,0xd070ff,D.reach,.5);burst(m.pos.clone().add(new V3(0,1,0)),0xc070ff,20,4,.8,1.4,1);noise(.4,900,.2);}}}
  else if(m.state==='attack'){if(m.type==='tanuki'||m.type==='spiderling'){m.dir=face=Math.atan2(m.aim.x-m.pos.x,m.aim.z-m.pos.z);mv=m.t<.4?11:0;m.parts.belly.scale.setScalar(1.3-m.t*.6);
    if(!m.hitDone&&dist<1.5&&m.t<.45){m.hitDone=true;const r=playerHit(Math.round(D.dmg*(m.night?1.3:1)),m);if(r==='hit'&&m.type==='tanuki'&&R()<.35)steal(m);}}
   else{if(!m.hitDone){m.hitDone=true;if(dist<D.reach)playerHit(D.dmg,m,{poison:4});}m.parts.cap.scale.setScalar(1);m.parts.cap.material.emissiveIntensity=.3;}
   if(m.t>.55){m.state='recover';m.t=0;}}
  else if(m.state==='recover'){if(m.parts.belly)m.parts.belly.scale.setScalar(1);if(m.parts.cap){m.parts.cap.scale.setScalar(1);m.parts.cap.material.emissiveIntensity=.3;}if(m.t>.6){m.state=m.stolen?'flee':'chase';m.cd=D.cd;m.t=0;}}
  else if(m.state==='flee'){m.dir=Math.atan2(-toP.x,-toP.z);mv=D.speed*1.2;if(m.t>5){m.state='idle';}}}}
 m._ls=m.state;
 const sp=mv*dt;m.pos.x+=Math.sin(m.dir)*sp+m.kb.x*dt;m.pos.z+=Math.cos(m.dir)*sp+m.kb.z*dt;
 if(Math.hypot(m.pos.x-m.home.x,m.pos.z-m.home.z)>60&&m.state==='idle')m.dir=Math.atan2(m.home.x-m.pos.x,m.home.z-m.pos.z);
 m.pos.x=clamp(m.pos.x,WMIN+5,WMAX-5);m.pos.z=clamp(m.pos.z,ZMIN+5,ZMAX-8);collide(m.pos,m.radius);
 const bob=m.type==='kodama'?Math.abs(Math.sin(time*6))*.15:m.type==='deer'&&mv>3?Math.abs(Math.sin(m.t*9))*.6:mv>0?Math.abs(Math.sin(m.t*10))*.08:0;
 m.pos.y=H(m.pos.x,m.pos.z)+bob;const fy=face!==null?face:m.dir;m.g.rotation.y+=wrapPi(fy-m.g.rotation.y)*Math.min(1,dt*10);
 if(m.parts.legs)m.parts.legs.forEach((l,i)=>l.rotation.x=mv>0?Math.sin(m.t*12+i*1.6)*.6:0);
 if(m.hb.g.visible){m.hb.fg.scale.x=Math.max(.001,m.hp/m.max);m.hb.fg.position.x=-(1-m.hp/m.max)/2;m.hb.g.quaternion.copy(camera.quaternion).premultiply(m.g.quaternion.clone().invert());}}
function steal(m){const keysI=Object.keys(S.inv).filter(k=>S.inv[k]>0&&!['ofuda'].includes(k));if(!keysI.length)return;const k=pick(keysI);S.inv[k]--;m.stolen=k;m.state='flee';m.t=0;toast('The tanuki stole your '+ITEMS[k][1]+'! Chase it!');}
function collide(p,r){for(const c of gNear(p.x,p.z,4,_near)){if(c.kind==='tree'&&c.wood<=0)continue;const cr=c.kind==='tree'?.55*c.s:(c.kind==='rock'||c.kind==='ore')?.8:0;if(!cr)continue;const dx=p.x-c.x,dz=p.z-c.z,d=Math.hypot(dx,dz),m=cr+r;if(d<m&&d>1e-4){p.x=c.x+dx/d*m;p.z=c.z+dz/d*m;}}
 for(const c of colliders){if(c.ref)continue;const dx=p.x-c.x,dz=p.z-c.z,d=Math.hypot(dx,dz),m=c.r+r;if(d<m&&d>1e-4){p.x=c.x+dx/d*m;p.z=c.z+dz/d*m;}}}
const _near=[];
