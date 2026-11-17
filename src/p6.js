/* ============ WEATHER & DAY/NIGHT (Krea timings) ============ */
const DAY_LEN=720;// 12 min: 8 day + 4 night
const isNight=()=>S.time>.667;
const WX_SEQ={clear:['cloudy',240],cloudy:['rain',60],rain:['clear',120],storm:['clear',120],fog:['clear',90],warn:['storm',20]};
function setWeather(w,dur){S.weather=w;S.wxT=dur!=null?dur:(WX_SEQ[w]?WX_SEQ[w][1]:120);
 if(w==='warn'){$('warnbig').style.display='block';$('warnbig').innerHTML='⚠ 嵐 STORM COMING — birds flee, the sky turns orange.<br><span style="font-size:13px">Build a lean-to (B) and light a fire under it!</span>';tone(55,1.5,'sine',.3);setTimeout(()=>tone(55,1.5,'sine',.3),700);birdsFlee();}
 else $('warnbig').style.display='none';if(w==='storm')S._stormStart=true;}
function weatherTick(dt){S.wxT-=dt;if(S.wxT<=0){const w=S.weather;
 if(w==='rain'){if(S.stormArmed||R()<.4){S.stormArmed=false;setWeather('warn');return;}setWeather(R()<.3?'fog':'clear');return;}
 if(w==='storm'){S.stat.stormsSurvived++;toast('The storm passes. 嵐が去った');gainXP(40);}
 setWeather(WX_SEQ[w]?WX_SEQ[w][0]:'clear');}}
const birds=[];function birdsFlee(){for(let i=0;i<14;i++){const b=new THREE.Mesh(new THREE.ConeGeometry(.15,.5,3),std(0x111118));b.rotation.x=Math.PI/2;b.position.copy(hero.position).add(new V3(rnd(-25,25),rnd(8,14),rnd(-25,25)));scene.add(b);birds.push({m:b,v:new V3(rnd(-1,1),rnd(.3,.6),rnd(-1,1)).normalize().multiplyScalar(14),t:0});}}
const RAIN_N=2200;const rainGeo=new THREE.BufferGeometry();const rainPos=new Float32Array(RAIN_N*6);rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPos,3));
for(let i=0;i<RAIN_N;i++){const x=rnd(-30,30),y=rnd(0,30),z=rnd(-30,30);rainPos.set([x,y,z,x,y-.7,z],i*6);}
const rain=new THREE.LineSegments(rainGeo,new THREE.LineBasicMaterial({color:0xaabbdd,transparent:true,opacity:.5}));rain.frustumCulled=false;rain.visible=false;scene.add(rain);
let lightningT=8,flashT=0;const cSky={dayT:new THREE.Color(0x4a7ac8),dayM:new THREE.Color(0x9ab8e0),dayB:new THREE.Color(0xf0d8b0),nT:new THREE.Color(0x0a1030),nM:new THREE.Color(0x1c2550),nB:new THREE.Color(0x3d3a6a),
 duskT:new THREE.Color(0x2c356c),duskM:new THREE.Color(0x6a5f98),duskB:new THREE.Color(0xff9a5a),stT:new THREE.Color(0x2a2c38),stM:new THREE.Color(0x4a4c58),stB:new THREE.Color(0x6a6058),warnB:new THREE.Color(0xff7a2a)};
const _c1=new THREE.Color(),_c2=new THREE.Color(),_c3=new THREE.Color();
function updSky(dt){const t=S.time;// 0..1, day 0-.667
 let dayK;if(t<.667){dayK=smooth(0,.06,t)*smooth(.667,.6,t);}else dayK=0;const dusk=Math.max(1-Math.abs(t-.64)/.06,1-Math.abs(t-.02)/.05,0);
 _c1.copy(cSky.nT).lerp(cSky.dayT,dayK);_c2.copy(cSky.nM).lerp(cSky.dayM,dayK);_c3.copy(cSky.nB).lerp(cSky.dayB,dayK);
 if(dusk>0){_c1.lerp(cSky.duskT,dusk*.7);_c2.lerp(cSky.duskM,dusk*.7);_c3.lerp(cSky.duskB,dusk*.8);}
 const wet=S.weather==='rain'||S.weather==='cloudy'?.6:S.weather==='storm'?.9:S.weather==='fog'?.5:0;
 _c1.lerp(cSky.stT,wet*.8);_c2.lerp(cSky.stM,wet*.8);_c3.lerp(cSky.stB,wet*.8);if(S.weather==='warn'){_c3.lerp(cSky.warnB,.7);_c2.lerp(cSky.warnB,.35);}
 skyU.top.value.lerp(_c1,dt*1.5);skyU.mid.value.lerp(_c2,dt*1.5);skyU.bot.value.lerp(_c3,dt*1.5);scene.fog.color.copy(skyU.mid.value).lerp(skyU.bot.value,.4);
 const fogFar=S.weather==='fog'?55:S.weather==='storm'?90:S.weather==='rain'?140:isNight()?170:260;const inWeb=Math.hypot(hero.position.x-ARENA.x,hero.position.z-ARENA.z)<32&&boss.phase===1&&boss.alive;
 scene.fog.far=lerp(scene.fog.far,inWeb?70:fogFar,dt);scene.fog.near=scene.fog.far*.12;
 const sa=t*TAU*1.5-Math.PI*.5;sun.position.set(hero.position.x+Math.cos(sa)*80,hero.position.y+Math.max(15,Math.sin(Math.min(Math.PI,t/.667*Math.PI))*90),hero.position.z+40);sun.target.position.copy(hero.position);
 sun.intensity=lerp(.35,1.5,dayK)*(1-wet*.55);sun.color.set(dayK>.3?0xffe8c8:0x9fb0ff);hemi.intensity=lerp(.8,1.35,dayK)*(1-wet*.25);if(flashT>0){flashT-=dt;hemi.intensity+=flashT*8;}
 renderer.toneMappingExposure=lerp(1.35,1.15,dayK);lamps.forEach(l=>l.material.emissiveIntensity=dayK>.5?.6:2.4);townLight.intensity=dayK>.5?3:12;
 const raining=['rain','storm'].includes(S.weather);rain.visible=raining;rain.material.opacity=S.weather==='storm'?.7:.45;
 if(raining){rain.position.set(hero.position.x,hero.position.y-5,hero.position.z);const fall=(S.weather==='storm'?32:22)*dt,wind=S.weather==='storm'?8*dt:0;for(let i=0;i<RAIN_N;i++){let y=rainPos[i*6+1]-fall;let x=rainPos[i*6]+wind;if(y<0){y+=30;x=rnd(-30,30);}if(x>30)x-=60;
  rainPos[i*6]=x;rainPos[i*6+1]=y;rainPos[i*6+3]=x-wind*2;rainPos[i*6+4]=y-.8;}rainGeo.attributes.position.needsUpdate=true;}
 if(rainGain)rainGain.gain.value=lerp(rainGain.gain.value,raining?(S.weather==='storm'?.35:.18):0,dt);if(windGain)windGain.gain.value=lerp(windGain.gain.value,S.weather==='storm'?.3:S.weather==='warn'?.15:.03,dt);
 if(S.weather==='storm'){lightningT-=dt;if(lightningT<=0){lightningT=rnd(4,9);flashT=.25;$('flash').style.opacity='.6';setTimeout(()=>$('flash').style.opacity='0',90);setTimeout(SFX.thunder,300);
  const fullCover=!!nearStruct('hut',3.6)||(has('hut')&&!!nearStruct('leanto',3.4))||Math.hypot(hero.position.x,hero.position.z-150)<22;if(!fullCover&&R()<.45){const dmg=Math.round(18*(sheltered()?.5:1));toast('⚡ Lightning strikes near you! Get under shelter.');applyDmg(dmg,{name:'lightning'});burst(hero.position.clone(),0xe8f0ff,30,8,.5);}}}
 for(let i=birds.length-1;i>=0;i--){const b=birds[i];b.t+=dt;b.m.position.addScaledVector(b.v,dt);if(b.t>6){scene.remove(b.m);birds.splice(i,1);}}}

/* ============ SURVIVAL (Krea rates) ============ */
function survivalTick(dt){const fire=nearFire(),shel=sheltered(),raining=['rain','storm'].includes(S.weather),fighting=enemiesAll().some(e=>e.pos.distanceTo(hero.position)<10&&(e.isBoss||e.state==='chase'||e.state==='tell'||e.state==='attack'));
 let hd=1/6;if((keys.ShiftLeft&&P.moving)||fighting)hd*=2;S.hun=Math.max(0,S.hun-hd*dt);
 // wetness
 if(P.inWater)S.wet=Math.min(100,S.wet+40*dt);else if(raining&&!shel)S.wet=Math.min(100,S.wet+3*dt);
 if(fire)S.wet=Math.max(0,S.wet-6*dt);else if(shel)S.wet=Math.max(0,S.wet-2*dt);else if(!raining)S.wet=Math.max(0,S.wet-.5*dt);
 // warmth
 let wd=0;if(isNight())wd+=.5;if(raining&&!shel)wd+=S.weather==='storm'?2:1;if(S.weather==='storm'&&!shel)wd+=0;if(hero.position.y>24)wd+=1;if(S.wet>50)wd*=1.5;if(has('thick'))wd*=.6;if(P.buffs.tea>0)wd=0;
 let wu=0;if(fire)wu+=4;if(shel)wu+=2;if(nearStruct('hut',3.6))wu+=1;if(P.swim)wd+=1.5;if(!isNight()&&!raining&&S.weather!=='fog')wu+=.4;
 S.warm=clamp(S.warm+(wu-wd)*dt,0,100);
 if(S.hun<=0)hurtTick(1*dt,'starvation');if(S.warm<=0)hurtTick(2*dt,'the cold');
 if(P.poison>0){P.poison-=dt;hurtTick(3*dt,'poison');}
 // regen
 const stRate=25*(S.hun<=0?.5:1)*(P.buffs.tonic>0?2:1);if(P.stDelay>0)P.stDelay-=dt;else if(!(keys.ShiftLeft&&P.moving))S.st=Math.min(DERIV.maxSt(),S.st+stRate*dt);
 S.sp=Math.min(DERIV.maxSp(),S.sp+2*(fire?3:1)*dt);
 if(S.hun>60&&S.warm>40&&!fighting&&S.hp<DERIV.maxHp())S.hp=Math.min(DERIV.maxHp(),S.hp+.5*dt);
 for(const r of P.regen){const a=Math.min(r.left,r.rate*dt);r.left-=a;S.hp=Math.min(DERIV.maxHp(),S.hp+a);}P.regen=P.regen.filter(r=>r.left>0);
 for(const k in P.buffs)if(P.buffs[k]>0)P.buffs[k]-=dt;
 // campfires: fuel + rain
 for(const s of structures){if(s.type!=='campfire')continue;if(s.lit){s.fuel-=dt;const cov=!!nearStruct('leanto',3.4,s.x,s.z);if((raining&&!cov&&R()<dt*(S.weather==='storm'?.3:.08))||s.fuel<=0){s.lit=false;toast(s.fuel<=0?'A campfire burned out.':'Rain put out a campfire! Relight with E (1 wood) or a Fire ofuda.');}}
  s.flame.visible=s.lit;s.light.visible=s.lit;if(s.lit){s.flame.scale.set(1+Math.sin(performance.now()*.02+s.x)*.12,1+Math.sin(performance.now()*.03)*.2,1);s.light.intensity=9+Math.sin(performance.now()*.025)*2;}
  if(s.grow<1){s.grow=Math.min(1,s.grow+dt*3);s.g.scale.set(1,s.grow,1);}}
 for(const s of structures)if(s.type==='leanto'&&s.grow<1){s.grow=Math.min(1,s.grow+dt*3);s.g.scale.set(1,s.grow,1);}}
let _hurtAcc=0;function hurtTick(a,why){S.hp-=a;_hurtAcc+=a;if(_hurtAcc>3){_hurtAcc=0;dmgNum(hero.position.clone().add(new V3(0,2,0)),'-3','pl');}if(S.hp<=0)die('Overcome by '+why+'.');}

/* ============ INVENTORY / XP ============ */
function give(it,n=1,quiet){S.inv[it]=(S.inv[it]||0)+n;if(!quiet)toast('+'+n+' '+(ITEMS[it]?ITEMS[it][0]+' '+ITEMS[it][1]:it));if(it==='wood')S.stat.gWood+=n;if(it==='fiber')S.stat.gFiber+=n;refreshHotbar();}
const xpNeed=l=>Math.round(100*Math.pow(l,1.5));
function gainXP(n){S.xp+=n;dmgNum(hero.position.clone().add(new V3(0,2.4,0)),'+'+n+' XP','heal');while(S.xp>=xpNeed(S.lvl)){S.xp-=xpNeed(S.lvl);S.lvl++;S.skp++;SFX.lvl();bellRing(hero.position.clone(),1);
 areaTitle('LV '+S.lvl,'LEVEL UP 昇級','+1 skill point (K) · +10 HP · +5 stamina · +5 spirit');S.hp=DERIV.maxHp();}}
Object.assign(DERIV,{maxHp:()=>100+(S.lvl-1)*10+S.shards*20,maxSp:()=>50+(S.lvl-1)*5+S.shards*10+(has('well')?25:0),maxSt:()=>100+(S.lvl-1)*5});
function canCraft(r){if(r.skill&&!has(r.skill))return false;for(const k in r.cost)if((S.inv[k]||0)<costOf(r,k))return false;if(r.need==='forge'&&!nearForge())return false;if(r.need==='fire'&&!nearFire())return false;return true;}
function costOf(r,k){let c=r.cost[k];if(has('thrift')){const top=Object.keys(r.cost).sort((a,b)=>r.cost[b]-r.cost[a])[0];if(k===top&&c>1)c--;}return c;}
function craft(id){const r=RECIPES.find(x=>x.id===id);if(!r||!canCraft(r))return;try{questEvent('craft',id);}catch(e){}for(const k in r.cost)S.inv[k]-=costOf(r,k);
 if(r.out.startsWith('w:')){const w=r.out.slice(2);if(!S.weapons.includes(w))S.weapons.push(w);equip(w);areaTitle(WEAPONS[w].icon,'FORGED: '+WEAPONS[w].name.toUpperCase(),'Equipped');}
 else if(r.out.startsWith('b:')){give(r.out.slice(2)+'_kit',1);toast('Press B to place it.');}else give(r.out,r.n||1);
 if(r.cat==='Cooking')S.stat.cooked++;S.crafted=S.crafted||{};if(!S.crafted[id]){S.crafted[id]=1;gainXP(10);}SFX.craft();renderInv();}
ITEMS.campfire_kit=['🔥','Campfire kit'];ITEMS.leanto_kit=['⛺','Lean-to kit'];
function equip(w){S.eq=w;buildWeapon(w);P.combo=0;refreshHotbar();}
function useItem(it){if(!(S.inv[it]>0))return;const f=FOOD[it];
 if(it==='salve'){P.regen.push({left:40,rate:14});toast('Healing salve applied');}
 else if(it==='tea'){P.buffs.tea=90;S.warm=Math.min(100,S.warm+20);toast('Fever tea: warmth holds for 90 s');}
 else if(it==='tonic'){P.buffs.tonic=60;toast('Stamina tonic: regen ×2');}
 else if(f){S.hun=Math.min(100,S.hun+f.hun);if(f.hp)f.hp>0?P.regen.push({left:f.hp,rate:f.slow?1:5}):applyDmg(-f.hp,{name:'bad food'});if(f.warm)S.warm=Math.min(100,S.warm+f.warm);if(f.sp)S.sp=Math.min(DERIV.maxSp(),S.sp+f.sp);
  if(it==='gmeat')P.buffs.might=120*(has('feast')?2:1);if(it==='skewer'&&has('feast'))P.regen.push({left:30,rate:1});toast('Ate '+ITEMS[it][1]);noise(.15,800,.1);}
 else return;S.inv[it]--;refreshHotbar();}

/* ============ MAGIC: Fire ofuda ============ */
const projs=[];
function castFire(){if(!has('fire')){toast('Learn the Fire talisman first: Way of the Kami (K).');return;}const cost=Math.round(15*(has('emberward')?.7:1));if(S.sp<cost){toast('Not enough spirit 霊力');return;}
 S.sp-=cost;SFX.cast();const card=new THREE.Mesh(new THREE.PlaneGeometry(.25,.5),new THREE.MeshStandardMaterial({color:0xf6eed8,emissive:0xff7a2a,emissiveIntensity:1.6,side:THREE.DoubleSide}));
 const from=hero.position.clone().add(new V3(0,1.4,0));card.position.copy(from);scene.add(card);let dir;
 const tgt=P.lock&&P.lock.alive!==false?P.lock:null;if(tgt)dir=new V3().subVectors(tgt.pos.clone().add(new V3(0,1.2,0)),from).normalize();else{dir=new V3();camera.getWorldDirection(dir);dir.y=Math.max(dir.y,-.1);dir.normalize();}
 P.castT=.35;projs.push({m:card,v:dir.multiplyScalar(26),t:0});if(has('emberward'))S.warm=Math.min(100,S.warm+20);}
function updProjs(dt){for(let i=projs.length-1;i>=0;i--){const p=projs[i];p.t+=dt;p.m.position.addScaledVector(p.v,dt);p.m.rotation.z+=dt*12;if(R()<.6)burst(p.m.position,0xff8a2a,1,1,.3,.8,0);
 if(p.arrow){p.v.y-=p.grav*dt;p.m.quaternion.setFromUnitVectors(new V3(0,1,0),p.v.clone().normalize());let ah=null;for(const e of [...enemiesAll(),...minions.filter(m=>m.alive&&m.D.animal)]){if(e.pos.clone().add(new V3(0,e.isBoss?1.8:.8,0)).distanceTo(p.m.position)<(e.isBoss?2.2:1.1)){ah=e;break;}}
  const gy2=H(p.m.position.x,p.m.position.z);if(p.fire&&R()<.7)burst(p.m.position,0xff7a2a,1,1,.25,.6,0);if(p.thrown)p.m.rotation.x+=dt*20;
  if(ah||p.t>2.5||p.m.position.y<gy2){if(ah){if(ah.isBoss&&!ah.alive){}else ah.damage(p.dmg,p.v.clone().normalize(),false,false);if(p.fire){ah.burn=3;burst(p.m.position,0xff6a1a,10,4,.4);}SFX.hit();hitstop(.03);if(p.thrown&&R()<.5&&!ah.isBoss)dropLoot(ah.pos,'kunai',1);}
   else if(p.m.position.y<gy2+.5&&!p.fire&&R()<(p.thrown?.85:.6)){dropLoot(new V3(p.m.position.x,gy2,p.m.position.z),p.ammo||'arrow',1);}scene.remove(p.m);projs.splice(i,1);}continue;}
 let hit=null;for(const e of enemiesAll()){if(e.pos.clone().add(new V3(0,e.isBoss?1.8:.8,0)).distanceTo(p.m.position)<(e.isBoss?2.4:1.2)){hit=e;break;}}
 for(const s of structures)if(s.type==='campfire'&&!s.lit&&Math.hypot(s.x-p.m.position.x,s.z-p.m.position.z)<1.5&&p.m.position.y<H(s.x,s.z)+2){s.lit=true;s.fuel=240;toast('The ofuda lights the fire!');hit=hit||'fire';}
 const gy=H(p.m.position.x,p.m.position.z);
 if(hit||p.t>1.6||p.m.position.y<gy){if(hit&&hit!=='fire'){const d=25;hit.damage(d,p.v.clone().normalize(),false,false,true);hit.burn=3;}burst(p.m.position,0xff6a1a,18,5,.5);noise(.25,600,.25);scene.remove(p.m);projs.splice(i,1);}}}

/* ============ FISHING ============ */
const FISH={on:false,state:'',t:0,bite:0,mk:0,dir:1,zone:[.4,.6],bob:null};
function startFishing(){FISH.on=true;FISH.state='wait';FISH.t=0;FISH.bite=rnd(2,5);$('fish').style.display='block';$('fishTxt').textContent='Line cast… wait for the bite (E to reel when it bites)';$('fishbar').style.visibility='hidden';
 const p=hero.position.clone().add(new V3(Math.sin(P.yaw)*3,0,Math.cos(P.yaw)*3));p.y=inWater(p.x,p.z)&&Math.hypot(p.x-66,p.z+104)<9?pool.position.y+.1:riverY(p.z)+.05;
 FISH.bob=new THREE.Mesh(new THREE.SphereGeometry(.12,6,4),emis(0xff3a3a,1));FISH.bob.position.copy(p);scene.add(FISH.bob);FISH.atPool=Math.hypot(p.x-66,p.z+104)<10;SFX.splash();}
function endFishing(msg){FISH.on=false;$('fish').style.display='none';if(FISH.bob){scene.remove(FISH.bob);FISH.bob=null;}if(msg)toast(msg);}
function updFishing(dt){if(!FISH.on)return;FISH.t+=dt;if(FISH.bob)FISH.bob.position.y+=Math.sin(FISH.t*4)*.002;
 if(P.moving||P.atk){endFishing('The fish got away.');return;}
 if(FISH.state==='wait'&&FISH.t>FISH.bite){FISH.state='bite';FISH.t=0;$('fishTxt').textContent='BITE! Press E when the marker is in the green!';$('fishbar').style.visibility='visible';const w=.18;const c=rnd(.25,.75);FISH.zone=[c-w/2,c+w/2];
  $('fishzone').style.left=(FISH.zone[0]*100)+'%';$('fishzone').style.width=(w*100)+'%';FISH.mk=0;FISH.dir=1;SFX.splash();if(FISH.bob)FISH.bob.position.y-=.15;}
 if(FISH.state==='bite'){FISH.mk+=FISH.dir*dt*1.1;if(FISH.mk>1||FISH.mk<0){FISH.dir*=-1;FISH.mk=clamp(FISH.mk,0,1);}$('fishmk').style.left=(FISH.mk*100)+'%';if(FISH.t>5)endFishing('The fish slipped the hook.');}}
function reel(){if(FISH.state!=='bite')return;if(FISH.mk>=FISH.zone[0]&&FISH.mk<=FISH.zone[1]){const gold=FISH.atPool&&R()<.12;give('fish',1);S.stat.fish++;gainXP(2);if(gold){toast('✨ GOLDEN KOI! Someone in the valley would treasure this.');give('koi',1,true);}endFishing('Caught an ayu!');}else endFishing('Missed! The fish got away.');}
ITEMS.koi=['🎏','Golden koi'];

/* ============ INTERACTION ============ */
function findInteract(){const p=hero.position;let best=null,bd=3.2;{const ni=PEOPLE.length?npcNear():null;if(ni)return ni;}
 for(const o of gNear(p.x,p.z,4,_near)){const d=Math.hypot(o.x-p.x,o.z-p.z);if(o.kind==='tree'){if(o.wood>0&&d<1.2*o.s+1.6&&d<bd){bd=d;best={o,verb:'Chop cedar (wood)'};}}else if(o.charges>0&&d<bd){bd=d;best={o,verb:NODE_DEF[o.kind].verb};}}
 for(const s of structures){const d=Math.hypot(s.x-p.x,s.z-p.z);if(s.type==='campfire'&&d<2.6){return{fire:s,verb:s.lit?'Cook / craft at the fire':'Relight fire (1 wood)'};}}
 if(Math.hypot(p.x-FORGE.x,p.z-FORGE.z)<3)return{forge:1,verb:'Use the Kanemura forge'};if(Math.hypot(p.x-SHRINE.x,p.z-SHRINE.z)<3.6)return{shrine:1,verb:'Pray & rest at the shrine (heal, save)'};
 if(best)return best;
 const ahead=new V3(p.x+Math.sin(P.yaw)*3,0,p.z+Math.cos(P.yaw)*3);if(inWater(ahead.x,ahead.z)&&!P.inWater)return{fish:1,verb:'Fish'};return null;}
function interact(){if(FISH.on){reel();return;}const it=findInteract();if(!it)return;
 if(it.npc){openTalk(it.npc);return;}if(it.horse){if(S.cart)openCart();else toggleRide();return;}if(it.fish){startFishing();return;}if(it.shrine){shrineRest();return;}if(it.forge){openInv('Weapons');return;}
 if(it.fire){if(!it.fire.lit){if((S.inv.wood||0)>=1){S.inv.wood--;it.fire.lit=true;it.fire.fuel=240;SFX.fire();toast('Fire relit');}else toast('Need 1 wood');return;}openInv('Cooking');return;}
 const o=it.o;P.gatherT=.35;
 if(o.kind==='tree'){o.wood--;setTree(o.i,1);setTimeout(()=>setTree(o.i,0),120);SFX.chop();give('wood',1);if(R()<.25)give('sap',1);burst(new V3(o.x,o.y+1.2,o.z),0xb08850,6,3,.5);if(o.wood<=0){o.regrow=180;setTree(o.i);}}
 else{o.charges--;const d=NODE_DEF[o.kind];for(const[k,ch]of d.give){if(ch>=1)give(k,ch);else if(R()<ch)give(k,1);}if(o.kind==='rock'||o.kind==='ore')SFX.chop();else SFX.pick();
  if(o.charges<=0){o.mesh.visible=false;o.regrow=d.regrow;}}}
function regrowTick(dt){for(const t of trees)if(t.wood<=0){t.regrow-=dt;if(t.regrow<=0){t.wood=3;setTree(t.i);}}for(const n of nodes)if(n.charges<=0){n.regrow-=dt;if(n.regrow<=0){n.charges=n.max;n.mesh.visible=true;}}}
function placeBuild(){const opts=['hut','campfire','leanto'].filter(k=>S.inv[k+'_kit']>0);
 if(!opts.length){toast('No build kits. Craft a campfire or lean-to in the inventory (I).');openInv('Camp');return;}
 const type=opts.includes('hut')?'hut':opts.includes('leanto')&&(!opts.includes('campfire')||S.weather==='warn'||S.weather==='storm'||S._bPref==='leanto')?'leanto':opts[0];
 const x=hero.position.x+Math.sin(P.yaw)*2.4,z=hero.position.z+Math.cos(P.yaw)*2.4;if(inWater(x,z)){toast("Can't build on water");return;}
 S.inv[type+'_kit']--;buildStruct(type,x,z);if(type==='campfire'){S.stat.fires++;SFX.fire();}else{noise(.15,300,.4);setTimeout(()=>noise(.15,300,.4),150);setTimeout(()=>noise(.15,300,.4),300);}
 toast(({campfire:'Campfire',leanto:'Lean-to',hut:'Hut'})[type]+' built');S._bPref=type==='campfire'?'leanto':'campfire';refreshHotbar();save();}
