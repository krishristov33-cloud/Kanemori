/* =====================================================================
   v0.4 SECTION: MOVEMENT FEEL + WEIGHT + TERRAIN-AWARE BODY + HAT
   - critically damped springs (camera pivot, body lean, pelvis, visual Y)
   - acceleration / deceleration / turn-rate curves, momentum-preserving turns,
     slope-dependent speed, ground stick on downhill (old sawtooth = jitter)
   - body layer on top of Aether's CharacterAnimator: lean with accel + turn,
     slope tilt, hip weight shift, foot IK (per-foot terrain height, pelvis drop)
   - jingasa hat on Ren's socket_head
   ===================================================================== */
const V4={piv:null,pv:[{x:0,v:0},{x:0,v:0},{x:0,v:0}],lift:{x:0,v:0},shT:0,visY:{x:0,v:0},pitch:{x:0,v:0},roll:{x:0,v:0},pelvis:{x:0,v:0},
 yawRate:0,lastYaw:null,accF:0,lastSpd:0,sprintT:0,ik:QS.get('ik')!=='0',hat:null,stopK:0};
// implicit critically damped spring (stable for any dt)
function cspring(s,target,omega,dt){if(dt<=0)return s.x;const f=1+2*dt*omega,oo=omega*omega,hoo=dt*oo,hhoo=dt*hoo,det=1/(f+hhoo);const x=(f*s.x+dt*s.v+hhoo*target)*det;s.v=(s.v+hoo*(target-s.x))*det;s.x=x;return x;}
// under-damped spring (settle / overshoot), semi-implicit
function uspring(s,target,k,c,dt){if(dt<=0)return s.x;const n=Math.max(1,Math.ceil(dt/0.008)),h=dt/n;for(let i=0;i<n;i++){s.v+=(k*(target-s.x)-c*s.v)*h;s.x+=s.v*h;}return s.x;}

/* ---- locomotion: speed curve + turn curve + slope (called from updPlayer) ---- */
function v4Move(mv,speed,dt){const v=P.vel,p=hero.position,cur=Math.hypot(v.x,v.z);let ang=cur>.05?Math.atan2(v.x,v.z):P.yaw,ns=cur;
 if(P.moving&&speed>0){
  if(P.ground&&!P.swim){const ax=p.x+mv.x*1.4,az=p.z+mv.z*1.4;const gr=(H(ax,az)-H(p.x,p.z))/1.4;P.grade=gr;speed*=clamp(1-gr*.7,.62,1.12);}
  const ta=Math.atan2(mv.x,mv.z),d=wrapPi(ta-ang),air=P.ground?1:.35;
  if(cur<.6)ang=ta;
  else if(Math.abs(d)>2.5&&cur>4.5&&P.ground){ns=Math.max(0,cur-34*dt);V4.skid=.15;}            // hard reversal: brake, then turn
  else{const tr=lerp(15,5.2,clamp((cur-2)/6,0,1))*air;ang+=clamp(d,-tr*dt,tr*dt);}         // turn-rate curve: agile slow, committed fast
  if(!(V4.skid>0)){const acc=(speed>cur?(cur<2.5?30:cur<6?17:10):26)*air;ns=cur+clamp(speed-cur,-acc*dt,acc*dt);}
 }else{// stop: short ~0.1 s fall-off instead of an instant halt (Kris: 0.05 s+)
  const dec=P.ground?Math.max(42,cur/.085):6;ns=Math.max(0,cur-dec*dt);if(cur>4)V4.stopK=1;}
 if(V4.skid>0)V4.skid-=dt;
 v.set(Math.sin(ang)*ns,0,Math.cos(ang)*ns);}
function v4Face(mv,dt){// facing follows the velocity arc (natural turning), with a speed-dependent turn-rate limit
 const v=P.vel,cur=Math.hypot(v.x,v.z);if(!P.moving&&cur<.6)return;
 const ty=cur>.6?Math.atan2(v.x,v.z):Math.atan2(mv.x,mv.z);const dy=wrapPi(ty-P.yaw);const mr=lerp(18,8,clamp(cur/8,0,1));
 P.yaw=wrapPi(P.yaw+clamp(dy*16,-mr,mr)*dt);}
function v4Ground(p,gy,dt){// returns true if handled. Keeps feet glued on downhill instead of fall-and-snap
 if(P.ground&&P.vy<=0&&!P.swim&&p.y>gy&&p.y-gy<.65){p.y=gy;P.vy=0;return true;}return false;}

/* ---- camera: spring pivot + rigid offset (no frame-rate dependent lerp chase) ---- */
function v4CamPivot(tgt,dt){const pv=V4.pv;if(!V4.piv||V4.piv.distanceToSquared(tgt)>225){V4.piv=tgt.clone();pv[0].x=tgt.x;pv[1].x=tgt.y;pv[2].x=tgt.z;pv.forEach(s=>s.v=0);return V4.piv;}
 V4.piv.set(cspring(pv[0],tgt.x,16,dt),cspring(pv[1],tgt.y,9,dt),cspring(pv[2],tgt.z,16,dt));return V4.piv;}
function v4Shake(dt){// smooth trauma shake (was white noise each frame)
 if(TIME.shake<=0)return null;V4.shT+=dt;const a=Math.min(.6,TIME.shake),t=V4.shT*38;const n=(k)=>Math.sin(t*1.0+k)*.6+Math.sin(t*2.3+k*3)*.3+Math.sin(t*4.1+k*7)*.1;
 TIME.shake=Math.max(0,TIME.shake-dt*1.6);return [n(1)*a*.5,n(2)*a*.5,n(3)*a*.25];}

/* ---- body layer for Aether's rig: lean, slope tilt, weight shift, foot IK ---- */
const _v4q=new THREE.Quaternion(),_v4e=new THREE.Euler();const _v4a=new V3(),_v4b=new V3(),_v4c=new V3(),_v4up=new V3(0,1,0);
function v4Body(a,dt){const hold=V03.holder,b=a.bones,p=hero.position;if(!hold||dt<=0)return;
 const spd=Math.hypot(P.vel.x,P.vel.z);const onFoot=!RIDE.on&&!P.swim&&!P.dead&&P.dodge<=0;
 // yaw rate + forward accel (smoothed)
 if(V4.lastYaw===null)V4.lastYaw=P.yaw;const yr=wrapPi(P.yaw-V4.lastYaw)/dt;V4.lastYaw=P.yaw;V4.yawRate=lerp(V4.yawRate,clamp(yr,-8,8),Math.min(1,dt*10));
 const acc=(spd-V4.lastSpd)/dt;V4.lastSpd=spd;V4.accF=lerp(V4.accF,clamp(acc,-60,40),Math.min(1,dt*12));
 // slope under the body
 const fy=P.yaw,e=.55,fx=Math.sin(fy),fz=Math.cos(fy),rx=Math.cos(fy),rz=-Math.sin(fy);
 const sP=onFoot&&P.ground?Math.atan2(H(p.x+fx*e,p.z+fz*e)-H(p.x-fx*e,p.z-fz*e),2*e):0,sR=onFoot&&P.ground?Math.atan2(H(p.x+rx*e,p.z+rz*e)-H(p.x-rx*e,p.z-rz*e),2*e):0;
 let tp=0,tr=0;
 if(onFoot){const ad=V4.add?.35:1;tp=sP*.2+clamp(V4.accF*.006,-.16,.1)*(P.ground?1:.3)*ad;tr=sR*.1-clamp(V4.yawRate*spd*.011,-.2,.2)*ad;}
 const atkSpin=v4AtkPose?v4AtkPose(dt):null;
 hold.rotation.x=uspring(V4.pitch,tp,170,15,dt);hold.rotation.z=uspring(V4.roll,tr,150,16,dt);hold.rotation.y=atkSpin?atkSpin.yaw:0;
 // visual Y smoothing (terrain steps) + pelvis drop from foot IK
 const vy=(onFoot&&P.ground)?cspring(V4.visY,p.y,24,dt):(V4.visY.x=p.y,V4.visY.v=0,p.y);const vOff=clamp(vy-p.y,-.2,.2);
 if(!RIDE.on){let baseY=0;
  if(V4.ik&&onFoot&&P.ground&&b.foot_L&&b.foot_R){
   // hip weight shift: pelvis sways over the stance foot
   if(b.hips&&spd>.4&&!V4.add){const ph=a.phase||0,k=clamp(spd/5,0,1);_v4q.setFromEuler(_v4e.set(0,Math.sin(ph*TAU)*.05*k,Math.sin(ph*TAU)*.045*k));b.hips.quaternion.multiply(_v4q);}
   V03.ren.updateMatrixWorld(true);
   const fl=b.foot_L.getWorldPosition(_v4a),fr=b.foot_R.getWorldPosition(_v4b);const dL=clamp(meshH(fl.x,fl.z)-p.y,-.5,.5),dR=clamp(meshH(fr.x,fr.z)-p.y,-.5,.5);/* v0.5: exact mesh triangles (was analytic H: feet floated a few cm) */
   const w=lerp(1,.55,clamp(spd/6,0,1));const pel=cspring(V4.pelvis,clamp(Math.min(dL,dR,0)*w,-.38,0),18,dt);
   hold.position.y=pel+vOff+(atkSpin?atkSpin.dy:0);hold.updateMatrixWorld(true);
   const legs=[[b.upperLeg_L,b.lowerLeg_L,b.foot_L,dL],[b.upperLeg_R,b.lowerLeg_R,b.foot_R,dR]];
   for(const[u,l,f,d]of legs){if(!u||!l||!f)continue;const lift=clamp((d*w)-pel,0,.45);if(lift<.004)continue;
    const fp=f.getWorldPosition(_v4c).clone();const tgt=fp.addScaledVector(_v4up,lift);const knee=l.getWorldPosition(new V3());const pole=knee.add(new V3(fx,0,fz).multiplyScalar(1.2));
    V03.LM.twoBoneIK(u,l,f,tgt,pole,1);}
  }else{V4.pelvis.x=lerp(V4.pelvis.x,0,Math.min(1,dt*10));hold.position.y=V4.pelvis.x+vOff+(atkSpin?atkSpin.dy:0);}
 }}

/* ---- the jingasa (wide conical straw hat) on Ren's head socket ---- */
function v4MakeHat(){const g=new THREE.Group();g.name='v4_jingasa';
 const straw=canvasTex(256,128,(c,w,h)=>{const gr=c.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#d9b56a');gr.addColorStop(1,'#a8823f');c.fillStyle=gr;c.fillRect(0,0,w,h);
  for(let i=0;i<w;i+=3){c.fillStyle=(i/3)%2?'rgba(110,72,28,.32)':'rgba(255,236,185,.22)';c.fillRect(i,0,1.6,h);}for(let j=6;j<h;j+=14){c.fillStyle='rgba(80,52,20,.35)';c.fillRect(0,j,w,1.3);}});
 straw.wrapS=THREE.RepeatWrapping;straw.repeat.set(3,1);
 const prof=[[.47,-.045],[.475,-.03],[.44,-.008],[.33,.04],[.2,.098],[.085,.145],[.03,.162],[0,.166]].map(([x,y])=>new THREE.Vector2(x,y));
 const top=new THREE.Mesh(new THREE.LatheGeometry(prof,28),new THREE.MeshStandardMaterial({map:straw,roughness:.88,side:THREE.FrontSide}));
 const under=new THREE.Mesh(new THREE.LatheGeometry(prof.map(v=>new THREE.Vector2(v.x*.985,v.y-.012)).reverse(),28),new THREE.MeshStandardMaterial({color:0x5a3f22,roughness:.95}));
 const rim=new THREE.Mesh(new THREE.TorusGeometry(.468,.011,5,40),new THREE.MeshStandardMaterial({color:0x3a1712,roughness:.5,metalness:.1}));rim.rotation.x=Math.PI/2;rim.position.y=-.036;
 const band=new THREE.Mesh(new THREE.CylinderGeometry(.118,.124,.05,16,1,true),new THREE.MeshStandardMaterial({color:0x2a1d16,roughness:.9,side:THREE.DoubleSide}));band.position.y=.0;
 const knob=new THREE.Mesh(new THREE.SphereGeometry(.03,10,8),new THREE.MeshStandardMaterial({color:0x8a2a1e,roughness:.4,metalness:.2}));knob.position.y=.168;
 const crest=new THREE.Mesh(new THREE.TorusGeometry(.06,.006,4,20),new THREE.MeshStandardMaterial({color:0xd4b04a,metalness:.8,roughness:.3,emissive:0x5a4010,emissiveIntensity:.4}));crest.rotation.x=Math.PI/2;crest.position.y=.152;
 g.add(top,under,rim,band,knob,crest);
 // string ties: from the inner band at both temples down under the chin
 const tieM=new THREE.MeshStandardMaterial({color:0xe8dcc0,roughness:.8});
 for(const sx of[-1,1]){const cv=new THREE.CatmullRomCurve3([new V3(sx*.115,-.005,.0),new V3(sx*.11,-.11,.035),new V3(sx*.06,-.205,.075),new V3(0,-.225,.08)]);g.add(new THREE.Mesh(new THREE.TubeGeometry(cv,10,.0065,4),tieM));}
 const bow=new THREE.Mesh(new THREE.TorusGeometry(.018,.006,4,10),tieM);bow.position.set(.012,-.225,.083);g.add(bow);
 g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.frustumCulled=false;}});
 g.position.set(0,.035,.005);g.rotation.set(.1,0,.055);return g;}
function v4AttachHat(root){try{const s=root.getObjectByName('socket_head')||root.getObjectByName('head');if(!s||V4.hat)return;V4.hat=v4MakeHat();s.add(V4.hat);console.log('[kanemori] v0.4 jingasa on',s.name);}catch(e){console.warn('[kanemori] hat failed',e);}}
