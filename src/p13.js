/* =====================================================================
   v0.4 SECTION: COMBAT — combo graph, branches, air/plunge, sprint lunge,
   hold-to-charge dash strike, root motion from Aether's rootSpeed knots,
   input buffer + cancel windows, ribbon weapon trails, afterimages, impacts.
   Uses motion/v04 clips (katana_light_a–d, finishers, jump/plunge/sprint,
   charge_windup/release, run/sprint_stop, additive leans) when loaded,
   falls back to v03 clips + procedural spin otherwise.
   ===================================================================== */
Object.assign(V4,{CM:V4.CM||null,MV:null,chain:'',comboT:0,buf:null,airN:0,chg:0,chgT:0,chgLvl:0,chgL:null,lmbT:0,lmbArm:false,forceHold:0,ghostT:0,mv:new V3(),wasSpd:0,stopL:null,add:null});
const V4RHY={katana:{ts:1.22,lunge:1,order:[0,1,2,3],tint:0xffe9b0},bokken:{ts:1.08,lunge:.9,order:[1,0,2],tint:0xffc98a},yari:{ts:1.0,lunge:1.35,order:[3,0,3],tint:0xbfe3ff}};
function kv(kn,t){if(!kn||!kn.length)return 0;if(t<=kn[0][0])return kn[0][1];for(let i=1;i<kn.length;i++){if(t<=kn[i][0]){const[a,b]=kn[i-1],[c,d]=kn[i];return lerp(b,d,(t-a)/Math.max(1e-4,c-a));}}return kn[kn.length-1][1];}
function v4Moves(){if(V4.MV)return V4.MV;const C=V4.CM||{},an=V03.anim,v4=!!(V4.v04&&an&&an.clips.katana_light_a);
 const mk=(clip,o={})=>{const m=C[clip];if(!m)return null;const hits=Object.entries(m.events||{}).filter(([k])=>/^hit/.test(k)).map(([,t])=>t).sort((x,y)=>x-y);
  return{clip,dur:m.duration,hits:hits.length?hits:[m.hit?m.hit[0]:m.duration*.35],cancel:m.cancel?m.cancel[0]:m.duration*.7,knots:m.rootSpeed&&m.rootSpeed.knots,ev:m.events||{},...o};};
 if(v4)V4.MV={L:[mk('katana_light_a'),mk('katana_light_b'),mk('katana_light_c'),mk('katana_light_d',{dm:1.15,reach:.35,arc:.6})],
  H:mk('katana_heavy_finisher_2',{heavy:1,dm:1.1,shake:.35,hs:.08,aoeR:2.2,label:'Overhead slam'}),
  LH:mk('katana_light_c',{heavy:1,dm:1,ts:.82,launch:1,label:'Rising cut'}),
  LLH:mk('katana_heavy_finisher_1',{heavy:1,dm:.8,arc:3.2,fin:1,shake:.22,label:'Whirlwind'}),
  LLLH:mk('katana_heavy_finisher_2',{heavy:1,dm:1.45,fin:1,shake:.45,hs:.1,aoeR:3.4,ts:1.1,label:'Heaven splitter'}),
  AIR:mk('jump_attack',{air:1,dm:1.1}),PLUNGE:mk('plunge_attack',{plunge:1,dm:1.6,heavy:1,aoeR:3.2,shake:.45,hs:.09}),
  SPRINT:mk('sprint_attack',{dm:1.3,sprint:1,arc:1.4}),CHARGE:mk('charge_release',{charge:1,heavy:1,dm:2.0,shake:.3,hs:.07})};
 else V4.MV={L:[{clip:'katana_light_1',dur:.55,hits:[.12],cancel:.3,knots:[[0,0],[.04,0],[.1,2.2],[.2,0]]},{clip:'katana_light_2',dur:.58,hits:[.13],cancel:.34,knots:[[0,0],[.05,0],[.11,2],[.2,0]]},
   {clip:'katana_light_3',dur:.8,hits:[.14],cancel:.45,knots:[[0,0],[.05,0],[.12,2.4],[.22,0]]},{clip:'katana_light_1',dur:.62,hits:[.1,.3],cancel:.45,spin:TAU,dm:.8,knots:[[0,2],[.3,2],[.4,0]]}],
  H:{clip:'katana_heavy',dur:1.05,hits:[.37],cancel:.75,heavy:1,shake:.3,aoeR:2,knots:[[0,0],[.25,0],[.37,3],[.5,0]]},
  LH:{clip:'katana_light_3',dur:.8,hits:[.16],cancel:.5,heavy:1,ts:.8,launch:1,knots:[[0,0],[.1,3],[.2,0]]},
  LLH:{clip:'katana_heavy',dur:1.05,hits:[.3,.42],cancel:.75,heavy:1,dm:.8,arc:3.2,spin:-TAU,fin:1},
  LLLH:{clip:'katana_heavy',dur:1.05,hits:[.37],cancel:.8,heavy:1,dm:1.45,fin:1,aoeR:3.4,shake:.45,knots:[[0,0],[.2,9],[.34,0]]},
  AIR:{clip:'katana_light_2',dur:.5,hits:[.13],cancel:.35,air:1,dm:1.1,knots:[[0,2],[.5,2]]},PLUNGE:{clip:'katana_heavy',dur:1.05,hits:[.37],cancel:.8,plunge:1,heavy:1,dm:1.6,aoeR:3.2,shake:.45,ev:{impact:.37}},
  SPRINT:{clip:'katana_light_1',dur:.6,hits:[.12],cancel:.4,sprint:1,dm:1.3,arc:1.4,knots:[[0,7],[.12,7],[.35,0]]},CHARGE:{clip:'katana_light_3',dur:.8,hits:[.14],cancel:.5,charge:1,heavy:1,dm:2,shake:.3,knots:[[0,0],[.04,11],[.2,11],[.3,0]],ev:{iframeStart:.04,iframeEnd:.22}}};
 return V4.MV;}
function startAttack(heavy){v4Request(heavy?'H':'L');}
function v4Request(type){if(P.dead)return;const w=W();if(w.ranged){startAttackV03(type==='H');return;}if(V4.chg)return;
 if(P.atk||P.dodge>0){V4.buf={type,t:.4};return;}v4Start(type);}
function v4Start(type){const MV=v4Moves(),w=W(),RH=V4RHY[S.eq]||V4RHY.katana,p=hero.position;if(w.ranged)return;
 const air=!P.ground&&!P.swim,spd=Math.hypot(P.vel.x,P.vel.z),hag=p.y-H(p.x,p.z);if(V4.comboT<=0&&!P.atk)V4.chain='';let name,M;
 if(type==='C')name='CHARGE';
 else if(air)name=(type==='H'||(hag>2.4&&P.vy<0)||V4.airN>=1)?'PLUNGE':'AIR';
 else if(type==='L'&&V4.sprintT>.2&&spd>6&&!V4.chain)name='SPRINT';
 else if(type==='H'){const n=V4.chain.length;name=n===0?'H':n===1?'LH':n===2?'LLH':'LLLH';}
 else{const n=V4.chain.length%(w.combo||3);name='L'+n;M=MV.L[RH.order[n%RH.order.length]]||MV.L[0];}
 M=M||MV[name];if(!M)return;
 const cost=(M.heavy?w.stH:w.stL)*(M.charge?1.2:M.sprint?1.1:1);if(S.st<cost*.5){toast('Too tired!');return;}useSt(cost);
 const ts=RH.ts*(M.ts||1)*[1,1.06,1.12][shardTier()]*(has('flow')&&!M.heavy?1.18:1);
 const a={v4:1,name,M,ts,t:0,dur:M.dur/ts,hits:M.hits.map(h=>h/ts),hi:0,cancel:M.cancel/ts,heavy:!!M.heavy,fin:!!M.fin,sweep:!!(M.arc&&M.arc>3),hit:false,hitSet:new Set(),lk:RH.lunge*(M.lungeK||1),dmK:1,
  idx:/^L\d$/.test(name)?+name[1]:0};a.hitAt=a.hits[0];
 if(M.charge){a.dmK=V4.chgLvl>=2?1.6:1;a.lk*=V4.chgLvl>=2?2.4:1.6;}
 if(P.lock&&P.lock.alive!==false)P.yaw=Math.atan2(P.lock.pos.x-p.x,P.lock.pos.z-p.z);else if(P.moving)P.yaw=Math.atan2(V4.mv.x,V4.mv.z);
 if(M.air){P.vy=Math.max(P.vy,2.6);V4.airN++;}if(M.plunge){P.vy=Math.max(P.vy,2);a.dive=0;}if(M.sprint)V4.sprintT=0;
 V4.chain=(type==='H'||type==='C'||M.sprint||M.air||M.plunge)?'':V4.chain+'L';
 V4.comboT=0;P.atk=a;P.comboT=.9;P.combo=V4.chain.length;SFX.swing();if(M.heavy)tone(170,.2,'triangle',.05,-.4);if(M.charge){noise(.25,1800,.2);tone(520,.3,'sawtooth',.04,1.2);}
 if(M.label&&M.fin)v4Callout(M.label);if(KMF.hero)try{KMF.hero.attack(M.heavy?'heavy':'light')}catch(e){}}
function v4Callout(t){const el=$('title');if(!el)return;dmgNum(hero.position.clone().add(new V3(0,2.6,0)),t,'xp');}
function v4Front(r){const p=hero.position,fx=Math.sin(P.yaw),fz=Math.cos(P.yaw);for(const e of enemiesAll()){const dx=e.pos.x-p.x,dz=e.pos.z-p.z,d=Math.hypot(dx,dz)-(e.radius||.5);if(d<r&&(dx*fx+dz*fz)>0)return true;}return false;}
function v4Strike(a,opt={}){const w=W(),M=a.M,p=opt.center||hero.position;const fwd=new V3(Math.sin(P.yaw),0,Math.cos(P.yaw));let any=false;
 const dmgBase=(M.heavy?w.heavy:w.dmg)*(M.dm||1)*a.dmK*(has('keen')?1.1:1)*(P.buffs.might>0?1.1:1);const reach=opt.r||(w.reach+(M.reach||0)+(M.heavy?.3:0)),arc=M.arc!=null?M.arc:w.arc;
 for(const e of enemiesAll()){if(opt.once&&a.hitSet.has(e))continue;const d=new V3().subVectors(e.pos,p);const dy=d.y;d.y=0;const dist=d.length()-(e.radius||.5);if(dist>reach)continue;
  if(e.isBoss&&!boss.canMelee())continue;if(Math.abs(dy)>3.4&&!e.isBoss)continue;
  if(!opt.aoe){const ang=Math.acos(clamp(d.normalize().dot(fwd),-1,1));if(ang>arc&&dist>.6)continue;}
  let dmg=dmgBase,crit=false;if(P.counter>0){dmg*=has('counter')?3:2;crit=true;P.counter=0;}if(a.fin){dmg*=1.25;crit=true;}
  dmg=Math.round(dmg*(.9+R()*.2));e.damage(dmg,fwd,a.heavy||!!opt.heavy,crit);a.hitSet.add(e);any=true;if(M.launch&&e.stagger)try{e.stagger(.9)}catch(_){}}
 if(boss.active)for(const an of boss.anchors){if(an.cut)continue;if(Math.hypot(an.x-p.x,an.z-p.z)<reach+.6){boss.cutAnchor(an);any=true;}}
 if(any){hitstop(M.hs||(a.heavy?.07:.04));shake(M.shake||(a.heavy?.22:.09));SFX[a.heavy?'heavy':'hit']();const sp=hero.position.clone().add(new V3(fwd.x*1.3,1.2,fwd.z*1.3));
  if(a.fin||a.heavy){if(KMF.sparks)try{KMF.sparks.burst(sp,new V3(0,1,0),14,'gold')}catch(e){}else burst(sp,0xffcf5a,14,5,.5);}else burst(sp,0xfff2d0,6,4,.25);
  if(shardTier()>=2)tone(1320,.25,'sine',.05);}return any;}
function v4Impact(a,r){const p=hero.position,fx=Math.sin(P.yaw),fz=Math.cos(P.yaw);const c=new V3(p.x+fx*1.1,H(p.x+fx*1.1,p.z+fz*1.1),p.z+fz*1.1);
 v4Strike(a,{aoe:true,r,center:c,heavy:true});groundRing(c.clone().add(new V3(0,.08,0)),0xffe2a0,r,.45);burst(c.clone().add(new V3(0,.2,0)),0x9a8a7a,22,6,.6);burst(c.clone().add(new V3(0,.3,0)),0xffcf5a,10,5,.35);
 shake(a.M.shake||.4);noise(.3,260,.45);tone(70,.35,'sine',.18,-.3);}
// per-frame attack tick (called from updPlayer)
function v4Tick(dt){const a=P.atk,M=a.M,p=hero.position;a.t+=dt;
 if(M.plunge){const pre=((M.ev&&M.ev.impact)||M.hits[0])/a.ts*.8;
  if(!a.dive&&a.t>.07){a.dive=1;P.vy=-26;}
  if(a.dive===1){if(!P.ground){a.t=Math.min(a.t,pre);if(a.layer&&a.layer.t>=pre*a.ts)a.layer.timeScale=0;}else{a.dive=2;a.t=Math.max(a.t,pre);if(a.layer)a.layer.timeScale=a.ts;v4Impact(a,M.aoeR||3.2);hitstop(M.hs||.09);}}}
 // root motion from the clip's rootSpeed knots (no foot sliding); stops short of enemies, refuses cliffs
 let rs=M.knots?kv(M.knots,a.t*a.ts)*a.ts*a.lk:0;if(M.air&&P.ground)rs=0;
 if(rs>0&&!M.charge&&!M.sprint&&v4Front(1.15))rs=0;
 if(rs>0){const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw),st=rs*dt,nx=p.x+fx*st,nz=p.z+fz*st;const rise=(H(nx,nz)-H(p.x,p.z))/Math.max(st,1e-4);
  const lim=(M.charge||M.sprint)?3.4:1.6;/* v0.5: dashes climb steep slopes and deflect along them instead of refusing */
  if(rise<lim||!P.ground){p.x=nx;p.z=nz;if(rise>1.6&&P.ground)p.y=Math.max(p.y,H(nx,nz));}
  else if(M.charge||M.sprint){for(const da of[.6,-.6,1.1,-1.1]){const ax=Math.sin(P.yaw+da),az=Math.cos(P.yaw+da),mx=p.x+ax*st*Math.cos(da),mz=p.z+az*st*Math.cos(da);const r2=(H(mx,mz)-H(p.x,p.z))/Math.max(st,1e-4);if(r2<lim){p.x=mx;p.z=mz;p.y=Math.max(p.y,H(mx,mz));break;}}}}
 if(M.charge){const e=M.ev||{};if(a.t>=(e.iframeStart||.08)/a.ts&&a.t<=(e.iframeEnd||.24)/a.ts+.05)P.iframe=1;
  if(rs>2){v4Strike(a,{once:true,r:1.7,aoe:true});V4.ghostT-=dt;if(V4.ghostT<=0){V4.ghostT=.03;v4Ghost(.34,0xffc070);}}}
 if(M.sprint&&rs>3){V4.ghostT-=dt;if(V4.ghostT<=0){V4.ghostT=.06;v4Ghost(.22,0x9fd8ff);}}
 while(a.hi<a.hits.length&&a.t>=a.hits[a.hi]){if(!M.plunge)v4Strike(a,M.charge?{once:true}:{});a.hi++;a.hit=true;}
 if(!M.plunge&&M.aoeR&&!a.imp){const it=(M.ev&&M.ev.impact)?M.ev.impact/a.ts:a.hits[a.hits.length-1]+.04;if(a.t>=it){a.imp=1;v4Impact(a,M.aoeR);}}
 if(V4.buf&&a.t>=a.cancel&&(!M.plunge||a.dive===2)){const b=V4.buf;V4.buf=null;P.atk=null;V4.comboT=.6;v4Start(b.type);return;}
 if(a.t>=a.dur){P.atk=null;V4.comboT=.55;if(V03.anim&&P.moving)V03.anim.stop('full',.12);}
 else if(P.moving&&a.t>=a.cancel+.08&&!M.air&&!(M.plunge&&a.dive!==2)){P.atk=null;V4.comboT=.55;if(V03.anim)V03.anim.stop('full',.16);}}
// play the move's clip on Aether's animator
function v4PlayAtk(an,at){const M=at.M;const c=an.clips[M.clip]?M.clip:'katana_light_1';at.layer=an.play(c,{fade:M.charge?.04:.08,fadeOut:.2,timeScale:at.ts});}
// additive pose for the v03 fallback (spin finishers)
function v4AtkPose(dt){const a=P.atk;if(!a||!a.v4)return null;const M=a.M;if(!M.spin)return null;const h0=a.hits[0]-.06,h1=a.hits[a.hits.length-1]+.08;return{yaw:M.spin*smooth(h0,h1,a.t),dy:0};}

/* ---- input: press = light/heavy (buffered), hold = charge, release = dash strike ---- */
function v4Input(ui,dt,mv){V4.mv.copy(mv);const w=W();if(V4.comboT>0)V4.comboT-=dt;if(V4.buf){V4.buf.t-=dt;if(V4.buf.t<=0)V4.buf=null;}if(P.ground)V4.airN=0;
 const spd=Math.hypot(P.vel.x,P.vel.z);if(keys.ShiftLeft&&spd>6)V4.sprintT+=dt;else V4.sprintT=Math.max(0,V4.sprintT-dt*2.5);
 const held=(mouseL&&!ui)||V4.forceHold>0;if(V4.forceHold>0)V4.forceHold-=dt;
 if(ui||FISH.on){if(V4.chg)v4ChargeEnd(false);return;}
 if(pressed.LMB){V4.lmbT=0;V4.lmbArm=true;startAttack(false);}if(pressed.RMB)startAttack(true);
 if(held&&V4.lmbArm&&!w.ranged){V4.lmbT+=dt;if(!V4.chg&&V4.lmbT>.3&&P.ground&&P.dodge<=0&&(!P.atk||(P.atk.v4&&P.atk.t>=P.atk.hitAt+.04&&!P.atk.M.heavy)))v4ChargeStart();}
 if(!held){if(V4.chg)v4ChargeEnd(true);V4.lmbArm=false;}
 if(V4.chg)v4ChargeTick(dt);}
function v4ChargeStart(){P.atk=null;V4.buf=null;V4.chg=1;V4.chgT=0;V4.chgLvl=0;const an=V03.anim;
 if(an){const c=an.clips.charge_windup?'charge_windup':'katana_heavy';V4.chgL=an.play(c,{fade:.12,loop:c==='charge_windup',hold:c!=='charge_windup',timeScale:c==='charge_windup'?1:.6});}
 tone(220,.4,'sine',.05,.8);}
function v4ChargeTick(dt){V4.chgT+=dt;if(V4.chgL&&V4.chgL.name==='katana_heavy'&&V4.chgL.t>.3)V4.chgL.timeScale=0;
 const lv=V4.chgT>=1.0?2:V4.chgT>=.42?1:0;if(lv>V4.chgLvl){V4.chgLvl=lv;tone(lv===2?990:660,.25,'sine',.08);const tip=v4Blade(_tA,_tB)?_tB.clone():hero.position.clone().add(new V3(0,1.2,0));burst(tip,lv===2?0xfff0b0:0xffc060,lv===2?24:12,3,.45);if(lv===2){shake(.08);groundRing(hero.position.clone().add(new V3(0,.08,0)),0xffd27a,2.2,.4);}}
 S.st=Math.max(0,S.st-5*dt);P.stDelay=.6;
 if(P.lock&&P.lock.alive!==false){const ty=Math.atan2(P.lock.pos.x-hero.position.x,P.lock.pos.z-hero.position.z);P.yaw+=wrapPi(ty-P.yaw)*Math.min(1,dt*10);}
 else if(P.moving){const ty=Math.atan2(V4.mv.x,V4.mv.z);P.yaw+=wrapPi(ty-P.yaw)*Math.min(1,dt*6);}}
function v4ChargeEnd(release){const lv=V4.chgLvl;V4.chg=0;V4.chgL=null;V4.lmbArm=false;if(release&&lv>=1)v4Start('C');else if(V03.anim)V03.anim.stop('full',.2);}

/* ---- additive leans / weight shift + stop clips (before the mixer update) ---- */
function v4SetupAnim(an){V4.MV=null;const c=an.clips;if(!c.additive_ref||!c.lean_fwd)return;V4.add={};
 for(const n of['lean_fwd','lean_back','lean_left','lean_right','weight_shift_L','weight_shift_R']){if(!c[n])continue;const clip=THREE.AnimationUtils.makeClipAdditive(c[n].clone(),0,c.additive_ref);const act=an.mixer.clipAction(clip);act.setEffectiveTimeScale(0);act.setEffectiveWeight(0);act.play();V4.add[n]={act,w:0};}}
function v4PreAnim(an,dt){if(dt<=0)return;const spd=Math.hypot(P.vel.x,P.vel.z),onFoot=!RIDE.on&&!P.swim&&!P.dead&&P.dodge<=0;
 // stop clips: run_stop / sprint_stop when releasing the stick at speed
 if(P.moving&&spd>1)V4.wasSpd=Math.max(V4.wasSpd*.9,spd);
 if(!P.moving&&V4.wasSpd>4&&onFoot&&P.ground&&!P.atk&&!V4.chg&&!an.busy){const c=V4.wasSpd>6.3&&an.clips.sprint_stop?'sprint_stop':an.clips.run_stop?'run_stop':an.clips.stop?'stop':null;if(c)V4.stopL=an.play(c,{fade:.07,fadeOut:.25,timeScale:c==='stop'?1.6:1.35});V4.wasSpd=0;}
 if(!P.moving)V4.wasSpd=Math.max(0,V4.wasSpd-dt*30);
 if(V4.stopL&&P.moving&&!V4.stopL.leaving&&!V4.stopL.done){an.stop('full',.12);V4.stopL=null;}
 if(V4.stopL&&V4.stopL.done)V4.stopL=null;
 if(!V4.add)return;const busy=an.busy?.35:1,k=onFoot?busy:0;const fw=clamp(V4.accF/24,-1,1),turn=clamp(V4.yawRate*spd/22,-1,1);
 const ph=an.phase||0,ws=spd>.4?Math.sin(ph*TAU)*.5*clamp(spd/5,0,1):Math.sin(performance.now()/1000*.55)*.35;
 const tw={lean_fwd:Math.max(0,fw)*.85+Math.max(0,(P.grade||0))*.6,lean_back:Math.max(0,-fw)*.9,lean_left:Math.max(0,turn)*.9,lean_right:Math.max(0,-turn)*.9,weight_shift_L:Math.max(0,ws),weight_shift_R:Math.max(0,-ws)};
 for(const n in V4.add){const A=V4.add[n];A.w=lerp(A.w,clamp((tw[n]||0)*k,0,1),Math.min(1,dt*9));A.act.setEffectiveWeight(A.w);}}

/* ---- ribbon weapon trail (all swings) ---- */
const _tA=new V3(),_tB=new V3();
const TRL={max:72,s:[],time:0,on:0,geo:new THREE.BufferGeometry()};
{const n=TRL.max;TRL.pos=new Float32Array(n*2*3);TRL.inf=new Float32Array(n*2*2);TRL.geo.setAttribute('position',new THREE.BufferAttribute(TRL.pos,3));TRL.geo.setAttribute('aInfo',new THREE.BufferAttribute(TRL.inf,2));
 const idx=[];for(let i=0;i<n-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}TRL.geo.setIndex(idx);TRL.geo.setDrawRange(0,0);
 TRL.u={uTint:{value:new THREE.Color(0xffe9b0)},uHot:{value:0}};
 TRL.mesh=new THREE.Mesh(TRL.geo,new THREE.ShaderMaterial({uniforms:TRL.u,transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,
  vertexShader:`attribute vec2 aInfo;varying vec2 vI;void main(){vI=aInfo;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform vec3 uTint;uniform float uHot;varying vec2 vI;void main(){float a=vI.x,v=vI.y;float edge=smoothstep(0.,.45,v)*(1.-smoothstep(.97,1.,v)*.5);
   vec3 c=mix(uTint,vec3(1.),pow(v,4.)*a);c=mix(c,vec3(1.,.55,.2),uHot*(1.-v)*.6);gl_FragColor=vec4(c*a*edge*(1.15-uHot*.45),1.);}`}));
 TRL.mesh.frustumCulled=false;TRL.mesh.renderOrder=3;scene.add(TRL.mesh);try{trail.visible=false;}catch(e){}}
function v4Blade(A,B){if(V03.anim&&S.eq==='katana'){const k=V03.ren.getObjectByName('katana');if(k&&k.visible&&k.parent&&/hand/.test(k.parent.name)){k.localToWorld(A.set(0,0,.14));k.localToWorld(B.set(0,0,.86));return true;}}
 if(weaponMesh&&weaponPivot.visible&&!W().ranged){const L=W().len||1;weaponMesh.localToWorld(A.set(0,.2,0));weaponMesh.localToWorld(B.set(0,.15+L*(S.eq==='yari'?1.05:1),0));return true;}return false;}
function v4TrailOn(){const a=P.atk;if(V4.chg)return .35;if(!a||!a.v4)return 0;const M=a.M;
 if(M.charge||M.sprint)return a.t<a.cancel?1:0;if(M.plunge)return a.dive===1||(a.dive===2&&a.t<a.cancel)?1:0;
 for(const h of a.hits)if(a.t>h-.11&&a.t<h+.12)return 1;return 0;}
function v4TrailUpdate(dt){TRL.time+=dt;const life=(P.atk&&P.atk.M&&P.atk.M.charge)?.34:.17;TRL.on=lerp(TRL.on,v4TrailOn(),Math.min(1,dt*35));
 const RH=V4RHY[S.eq]||V4RHY.katana;TRL.u.uTint.value.setHex((P.atk&&P.atk.M&&P.atk.M.charge)||V4.chg?0xffc070:RH.tint);TRL.u.uHot.value=(P.atk&&P.atk.M&&P.atk.M.charge)||V4.chg?1:0;
 if(dt>0){hero.updateMatrixWorld(true);if(v4Blade(_tA,_tB)){const last=TRL.s[TRL.s.length-1];
   if(last){const d=last.b.distanceTo(_tB),n=Math.min(5,Math.floor(d/.16));for(let k=1;k<n;k++){const f=k/n;TRL.s.push({a:last.a.clone().lerp(_tA,f),b:last.b.clone().lerp(_tB,f),t:lerp(last.t,TRL.time,f),on:lerp(last.on,TRL.on,f)});}}
   TRL.s.push({a:_tA.clone(),b:_tB.clone(),t:TRL.time,on:TRL.on});}}
 while(TRL.s.length&&(TRL.time-TRL.s[0].t>life||TRL.s.length>TRL.max))TRL.s.shift();
 const n=TRL.s.length;let any=false;for(let i=0;i<n;i++){const s=TRL.s[i],age=clamp((TRL.time-s.t)/life,0,1),al=s.on*Math.pow(1-age,1.6);if(al>.01)any=true;
  TRL.pos.set([s.a.x,s.a.y,s.a.z,s.b.x,s.b.y,s.b.z],i*6);TRL.inf.set([al,0,al,1],i*4);}
 TRL.geo.attributes.position.needsUpdate=true;TRL.geo.attributes.aInfo.needsUpdate=true;TRL.geo.setDrawRange(0,any&&n>1?(n-1)*6:0);}

/* ---- afterimages: pooled clones of Ren posed from the live skeleton ---- */
const GH={pool:[],i:0,src:null};
function v4Ghost(life,col){if(!V03.ren||!V03.SkU)return;try{
 if(!GH.pool.length){for(let i=0;i<7;i++){const g=V03.SkU.clone(V03.ren);const mat=new THREE.MeshBasicMaterial({color:0x8fd0ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
   g.traverse(o=>{if(o.isMesh){o.material=mat;o.castShadow=false;o.receiveShadow=false;o.frustumCulled=false;}});g.visible=false;g.matrixAutoUpdate=false;scene.add(g);const nodes=[];g.traverse(o=>nodes.push(o));GH.pool.push({g,mat,nodes,t:0,life:1});}
  GH.src=[];V03.ren.traverse(o=>GH.src.push(o));}
 const G=GH.pool[GH.i++%GH.pool.length],src=GH.src;if(src.length!==G.nodes.length)return;
 for(let k=1;k<src.length;k++){const a=src[k],b=G.nodes[k];b.position.copy(a.position);b.quaternion.copy(a.quaternion);b.scale.copy(a.scale);b.visible=a.visible;}
 V03.ren.updateMatrixWorld(true);G.g.matrix.copy(V03.ren.matrixWorld);G.g.matrixWorldNeedsUpdate=true;G.g.visible=true;G.t=0;G.life=life;G.mat.color.setHex(col||0x8fd0ff);G.mat.opacity=.3;}catch(e){}}
function v4GhostUpdate(dt){for(const G of GH.pool){if(!G.g.visible)continue;G.t+=dt;const k=1-G.t/G.life;if(k<=0){G.g.visible=false;continue;}G.mat.opacity=.3*k*k;}}

/* ---- charge glow on the blade ---- */
const CHG={spr:null};{const tex=canvasTex(64,64,(c)=>{const g=c.createRadialGradient(32,32,1,32,32,32);g.addColorStop(0,'rgba(255,250,220,1)');g.addColorStop(.25,'rgba(255,200,110,.7)');g.addColorStop(1,'rgba(255,140,40,0)');c.fillStyle=g;c.fillRect(0,0,64,64);});
 CHG.spr=[0,1,2].map(()=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));s.visible=false;scene.add(s);return s;});}
function v4ChargeFx(dt){const on=V4.chg>0;const t=performance.now()/1000;
 if(on&&v4Blade(_tA,_tB)){const lv=V4.chgLvl,k=Math.min(1,V4.chgT/.42);CHG.spr.forEach((s,i)=>{s.visible=true;s.position.copy(_tA).lerp(_tB,[.35,.7,1][i]);const sc=(.22+lv*.16)*(.7+.3*Math.sin(t*30+i*2))*(.5+.5*k)*(i===2?1.4:1);s.scale.set(sc,sc,sc);s.material.opacity=.35+.35*k;s.material.color.setHex(lv>=2?0xfff4c8:0xffc070);});
  if(R()<dt*(10+lv*14)){const a=R()*TAU,r=rnd(.6,1.2);burst(hero.position.clone().add(new V3(Math.cos(a)*r,rnd(.2,1.6),Math.sin(a)*r)),0xffd27a,1,.8,.35,.8,-2);}}
 else CHG.spr.forEach(s=>{s.visible=false;});}
function v4FxUpdate(dt){try{v4TrailUpdate(dt);v4GhostUpdate(dt);v4ChargeFx(dt);}catch(e){if(!V4._fxErr){V4._fxErr=1;console.warn('[kanemori] v4 fx',e);}}}
