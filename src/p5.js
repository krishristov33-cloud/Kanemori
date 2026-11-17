/* ============ BOSS: JORŌGUMO (2 phases, Krea numbers, Aether motion) ============ */
const BAL={guard:.3,anchorHits:4,anchorRegrow:15,recover:2.2,stun:2.5,bursts:4};// v0.2 tuning from bot playtest
const ARENA={x:-85,z:-100};ARENA.y=H(ARENA.x,ARENA.z);
const webG=new THREE.Group();scene.add(webG);
const webNodes=[];const anchorPos=[];for(let i=0;i<6;i++){const a=i/6*TAU+.3;const x=ARENA.x+Math.cos(a)*15,z=ARENA.z+Math.sin(a)*15;anchorPos.push([x,z]);
 const t=new THREE.Mesh(new THREE.CylinderGeometry(.7,1,18,7),std(0x4a3226));t.position.set(x,ARENA.y+9,z);t.castShadow=true;webG.add(t);colliders.push({x,z,r:1});
 const top=new THREE.Mesh(new THREE.ConeGeometry(4,7,7),std(0x1d3a28));top.position.set(x,ARENA.y+19,z);webG.add(top);}
{const pts=[],WY=ARENA.y+10;const ctr=new V3(ARENA.x,WY,ARENA.z);webNodes.push(ctr);
 for(let i=0;i<6;i++){const a=new V3(anchorPos[i][0],WY,anchorPos[i][1]);pts.push(ctr,a);webNodes.push(a.clone().lerp(ctr,.45));
  for(const k of[.3,.6,.85]){const b=new V3(anchorPos[(i+1)%6][0],WY,anchorPos[(i+1)%6][1]);pts.push(a.clone().lerp(ctr,1-k),b.clone().lerp(ctr,1-k));}}
 const g=new THREE.BufferGeometry().setFromPoints(pts);webG.add(new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xe8eef8,transparent:true,opacity:.55})));}
const arenaMist=[];for(let i=0;i<14;i++){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(rnd(2,3.5),0),new THREE.MeshBasicMaterial({color:0xcfd8f0,transparent:true,opacity:.18,depthWrite:false}));m.position.set(ARENA.x+rnd(-12,12),ARENA.y+rnd(6,10),ARENA.z+rnd(-12,12));webG.add(m);arenaMist.push(m);}
const bossG=new THREE.Group();scene.add(bossG);
const bUpper=new THREE.Group();bossG.add(bUpper);
{const kim=new THREE.Mesh(new THREE.CylinderGeometry(.35,.9,1.8,8),std(0x3a1a4a,{emissive:0x200820,emissiveIntensity:.3}));kim.position.y=.9;bUpper.add(kim);
 const obi=new THREE.Mesh(new THREE.CylinderGeometry(.42,.48,.3,8),std(0xc0202a));obi.position.y=1.3;bUpper.add(obi);
 const hd=new THREE.Mesh(new THREE.IcosahedronGeometry(.32,1),std(0xf2e6e0));hd.position.y=2.15;bUpper.add(hd);
 const hr=new THREE.Mesh(new THREE.IcosahedronGeometry(.36,1),std(0x0c0a12));hr.scale.set(1,1.2,1);hr.position.set(0,2.25,-.08);bUpper.add(hr);
 for(const sx of[-.11,.11]){const e=new THREE.Mesh(new THREE.BoxGeometry(.1,.03,.02),emis(0xffe03a,3));e.position.set(sx,2.17,.3);bUpper.add(e);}
 for(let i=0;i<2;i++){const pin=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.6,4),emis(0xffcf5a,1));pin.rotation.z=1.2-i*2.4;pin.position.set(0,2.5,-.1);bUpper.add(pin);}}
const bFan=new THREE.Mesh(new THREE.CircleGeometry(.6,10,0,Math.PI),new THREE.MeshStandardMaterial({color:0xe3402c,side:THREE.DoubleSide,emissive:0x500000,emissiveIntensity:.4}));bFan.position.set(.6,1.6,.2);bUpper.add(bFan);
const bLower=new THREE.Group();bossG.add(bLower);
const bAbd=new THREE.Mesh(new THREE.SphereGeometry(1.4,10,8),std(0x1a1420));bAbd.scale.set(1,.8,1.3);bAbd.position.set(0,1,-1.6);bLower.add(bAbd);
for(let i=0;i<3;i++){const st=new THREE.Mesh(new THREE.TorusGeometry(1.1-i*.15,.08,4,14),emis(0xffc020,1.2));st.position.set(0,1.3,-1.2-i*.6);st.rotation.x=1.2;bLower.add(st);}
const bLegs=[];for(let i=0;i<8;i++){const side=i<4?-1:1,k=i%4;const root=new THREE.Group();root.position.set(side*.5,.9,-.6+k*.35-0.6);const up=new THREE.Mesh(new THREE.CylinderGeometry(.08,.06,1.6,5),std(0x241a2c));up.position.y=.8;root.add(up);
 const knee=new THREE.Group();knee.position.y=1.6;root.add(knee);const lo=new THREE.Mesh(new THREE.CylinderGeometry(.06,.02,1.9,5),std(0x241a2c));lo.position.y=-.95;knee.add(lo);root.rotation.z=side*-1.1;root.rotation.y=side*(k-1.5)*.35;knee.rotation.z=side*2.2;bLower.add(root);bLegs.push({root,knee,side,k});}
const bMistSkirt=new THREE.Mesh(new THREE.IcosahedronGeometry(1.3,1),new THREE.MeshBasicMaterial({color:0xdde4f8,transparent:true,opacity:.45,depthWrite:false}));bMistSkirt.scale.set(1,.6,1);bossG.add(bMistSkirt);
bossG.traverse(o=>{if(o.isMesh)o.castShadow=true;});
const silkLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new V3(),new V3()]),new THREE.LineBasicMaterial({color:0xffffff}));silkLine.frustumCulled=false;scene.add(silkLine);
const whip=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new V3(),new V3()]),new THREE.LineBasicMaterial({color:0xfff6e0}));whip.frustumCulled=false;whip.visible=false;scene.add(whip);
const marker=new THREE.Mesh(new THREE.CircleGeometry(1,24),new THREE.MeshBasicMaterial({color:0xff2a3a,transparent:true,opacity:.4,depthWrite:false}));marker.rotation.x=-Math.PI/2;marker.visible=false;scene.add(marker);
const webPools=[];
const shardMesh=new THREE.Mesh(new THREE.OctahedronGeometry(.45,0),emis(0xffcf5a,3,{metalness:.8}));shardMesh.visible=false;scene.add(shardMesh);
const shardBeacon=new THREE.Mesh(new THREE.CylinderGeometry(.6,.6,80,8,1,true),new THREE.MeshBasicMaterial({color:0xffcf5a,transparent:true,opacity:.18,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));
shardBeacon.position.set(ARENA.x,ARENA.y+40,ARENA.z);scene.add(shardBeacon);
const boss={isBoss:true,name:'Jorōgumo',max:900,hp:900,alive:true,active:false,phase:1,state:'idle',t:0,pos:bossG.position,radius:1.4,node:0,moves:0,attacks:0,stun:0,anchors:[],burn:0,target:new V3(),from:new V3(),
 low(){return this.pos.y-H(this.pos.x,this.pos.z)<3.2;},canMelee(){return this.phase===2||this.low();},
 reset(){this.hp=this.max;this.phase=1;this.state='idle';this.t=0;this.attacks=0;this.moves=0;this.active=false;this.pos.copy(webNodes[0]).y+=0;bLower.visible=false;bMistSkirt.visible=true;arenaMist.forEach(m=>m.visible=true);marker.visible=false;whip.visible=false;
  this.anchors.forEach(a=>{a.cut=false;a.m.visible=true;});webPools.forEach(p=>scene.remove(p.m));webPools.length=0;$('bossbar').style.display='none';},
 damage(d,dir,heavy,crit,fire){if(!this.alive||!this.active||this.state==='retreat'||this.state==='dying')return;if(fire)d=Math.round(d*1.5);if(this.state==='stunned')d=Math.round(d*1.25);else if(this.phase===2&&this.state!=='recoverP2'&&!fire){d=Math.max(1,Math.round(d*BAL.guard));if(!this._gT||performance.now()-this._gT>700){this._gT=performance.now();dmgNum(this.pos.clone().add(new V3(0,3,0)),'GUARDED','');}}
  this.hp-=d;dmgNum(this.pos.clone().add(new V3(0,2.2,0)),String(d),crit?'crit':fire?'fire':'');burst(this.pos.clone().add(new V3(0,1.5,0)),0xf0e0ff,10,5,.4);
  if(this.phase===1&&this.hp<=this.max*.5)this.toPhase2();if(this.hp<=0)this.defeat();},
 stagger(t,big){if(this.state==='dying')return;this.state='stunned';this.t=0;this.stunFor=t*1.5;whip.visible=false;marker.visible=false;dmgNum(this.pos.clone().add(new V3(0,3,0)),'STAGGER','crit');},
 cutAnchor(a){a.hp=(a.hp==null?BAL.anchorHits:a.hp)-1;if(a.hp>0){burst(new V3(a.x,ARENA.y+1.5,a.z),0xffffff,6,3);SFX.chop();dmgNum(new V3(a.x,ARENA.y+2,a.z),'thread '+a.hp,'');return;}a.hp=BAL.anchorHits;a.cut=true;a.m.visible=false;a.t=BAL.anchorRegrow;burst(new V3(a.x,ARENA.y+1.5,a.z),0xffffff,14,5);SFX.chop();toast('Anchor thread cut!');
  if(this.phase===1&&this.state!=='stunned'&&this.state!=='dying'){this.state='falling';this.t=0;this.from.copy(this.pos);}},
 toPhase2(){this.phase=2;bellRing(this.pos.clone().setY(ARENA.y),2);areaTitle('女郎蜘蛛','PHASE II · THE SPIDER','The mist burns off');bLower.visible=true;bMistSkirt.visible=false;arenaMist.forEach(m=>m.visible=false);
  this.state='land';this.t=0;this.from.copy(this.pos);marker.visible=false;whip.visible=false;this.anchors.forEach(a=>a.m.visible=false);},
 defeat(){this.alive=false;this.state='dying';this.t=0;bellRing(this.pos.clone(),2);slowmo(.35,1.4);$('bossbar').style.display='none';marker.visible=false;whip.visible=false;gainXP(500);
  shardMesh.visible=true;shardMesh.position.copy(this.pos).add(new V3(0,7,0));shardBeacon.position.set(this.pos.x,this.pos.y+40,this.pos.z);toast('The kakera is falling — catch it!');S.boss.dead=true;dropLoot(this.pos,'silk',has('skinner')?2:1);webPools.forEach(p=>scene.remove(p.m));webPools.length=0;}};
for(const[x,z]of anchorPos.filter((_,i)=>i%2===0)){const ax=lerp(x,ARENA.x,.12),az=lerp(z,ARENA.z,.12);const m=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,10,4),emis(0xeaf4ff,2.2));m.position.set(ax,ARENA.y+5,az);webG.add(m);
 const stake=new THREE.Mesh(new THREE.OctahedronGeometry(.35,0),emis(0xffffff,2));stake.position.set(ax,ARENA.y+.6,az);m.add(stake);stake.position.set(0,-4.4,0);boss.anchors.push({x:ax,z:az,m,cut:false,t:0});}
boss.reset();
function spawnSpiderlings(){for(let i=0;i<3;i++){const a=R()*TAU;const m=spawnMinion('spiderling',boss.pos.x+Math.cos(a)*4,boss.pos.z+Math.sin(a)*4);m.state='chase';}}
function updBoss(dt,time){const B=boss;
 // anchors regrow
 for(const a of B.anchors){if(a.cut&&B.phase===1){a.t-=dt;if(a.t<=0){a.cut=false;a.m.visible=true;}}}
 for(let i=webPools.length-1;i>=0;i--){const p=webPools[i];p.t-=dt;p.m.material.opacity=.5*Math.min(1,p.t);if(p.t<=0){scene.remove(p.m);webPools.splice(i,1);continue;}if(Math.hypot(hero.position.x-p.x,hero.position.z-p.z)<p.r)P.slowT=.2;}
 const dP=Math.hypot(hero.position.x-ARENA.x,hero.position.z-ARENA.z);
 if(!B.alive){if(B.state==='dying'){B.t+=dt;const k=Math.min(1,B.t/2);bossG.scale.setScalar(Math.max(.01,1-k));if(R()<.5)burst(B.pos.clone().add(new V3(rnd(-1,1),1,rnd(-1,1))),0xffffff,1,2,1.2,1,-3);
   silkLine.visible=false;if(shardMesh.visible){const gy=H(shardMesh.position.x,shardMesh.position.z)+1.4;shardMesh.position.y=Math.max(gy,shardMesh.position.y-dt*2.2);shardMesh.rotation.y+=dt*2;
    if(Math.hypot(shardMesh.position.x-hero.position.x,shardMesh.position.z-hero.position.z)<3.2&&shardMesh.position.y<gy+3)claimShard();}}
  return;}
 if(!B.active){if(dP<24&&!P.dead){B.active=true;B.state='idle';B.t=0;$('bossbar').style.display='block';$('bossNm').textContent=J('女郎蜘蛛 JORŌGUMO — LADY OF THE CANOPY');areaTitle('女郎蜘蛛','JORŌGUMO','Lady of the Canopy · cut her anchor threads');bellTone(1);if(!S.stat.foundWeb){S.stat.foundWeb=true;}}
  else{B.pos.copy(webNodes[0]);B.pos.y=webNodes[0].y-2+Math.sin(time)*.3;bossG.rotation.y=time*.2;}}
 else if(dP>48||P.dead){B.reset();toast('Jorōgumo withdraws into the canopy.');}
 $('bossHP').style.width=(Math.max(0,B.hp)/B.max*100)+'%';
 if(B.burn>0){B.burn-=dt;if((B._bt=(B._bt||0)+dt)>.25){B._bt=0;B.damage(1,new V3(),false,false);}}
 const gy=H(B.pos.x,B.pos.z);silkLine.visible=B.phase===1&&B.active;if(silkLine.visible){const a=silkLine.geometry.attributes.position;a.setXYZ(0,B.pos.x,B.pos.y+2.5,B.pos.z);a.setXYZ(1,B.pos.x,ARENA.y+20,B.pos.z);a.needsUpdate=true;}
 if(!B.active)return;B.t+=dt;const toP=new V3().subVectors(hero.position,B.pos);toP.y=0;const dist=toP.length();
 const faceP=()=>{bossG.rotation.y+=wrapPi(Math.atan2(toP.x,toP.z)-bossG.rotation.y)*Math.min(1,dt*6);};
 bFan.rotation.z=0;
 if(B.phase===1){
  // graceful sway; legs hidden in mist
  bUpper.rotation.z=Math.sin(time*1.6)*.08;bMistSkirt.rotation.y+=dt;
  if(B.state==='idle'||B.state==='move'){if(B.state==='idle'){B.state='move';B.t=0;B.from.copy(B.pos);let n;do{n=(R()*webNodes.length)|0}while(n===B.node);B.node=n;B.target.copy(webNodes[n]);B.target.y=webNodes[n].y-3.5;}
   const k=smooth(0,1,B.t/1.0);B.pos.lerpVectors(B.from,B.target,k);B.pos.y+=Math.sin(k*Math.PI)*-1.2;faceP();
   if(B.t>=1.0){B.moves++;if(B.moves>=2){B.moves=0;const r=R();B.state=B.attacks===1&&R()<.5?'call':dist<9?'lash':r<.5?'drop':'shot';B.t=0;B.aim=hero.position.clone();if(B.state==='call'){spawnSpiderlings();toast('Spiderlings drop from the web!');}}else B.state='idle';}}
  else if(B.state==='lash'){faceP();bFan.rotation.z=Math.min(1,B.t/.45)*-1.6;marker.visible=true;marker.position.set(B.aim.x,H(B.aim.x,B.aim.z)+.1,B.aim.z);marker.scale.setScalar(2.2);marker.material.opacity=.25+.3*Math.min(1,B.t/.45);
   B.pos.y=lerp(B.pos.y,gy+4.5,dt*3);
   for(const at of[.45,.75]){if(B.t>=at&&B._last<at){whip.visible=true;const a=whip.geometry.attributes.position;a.setXYZ(0,B.pos.x,B.pos.y+1.6,B.pos.z);a.setXYZ(1,B.aim.x,H(B.aim.x,B.aim.z)+.3,B.aim.z);a.needsUpdate=true;noise(.12,4000,.2);
    if(Math.hypot(hero.position.x-B.aim.x,hero.position.z-B.aim.z)<2.4)playerHit(18,B);}}
   if(B.t>1.0){whip.visible=false;marker.visible=false;B.endAttack();}}
  else if(B.state==='shot'){faceP();marker.visible=true;marker.position.set(B.aim.x,H(B.aim.x,B.aim.z)+.1,B.aim.z);marker.scale.setScalar(1.6);marker.material.color.set(0xeaf0ff);
   if(B.t>.7&&B._last<=.7){const r=playerHit(0,B,{parry:false});if(Math.hypot(hero.position.x-B.aim.x,hero.position.z-B.aim.z)<1.8&&r!=='dodged'){P.rooted=1.5;toast('Rooted in silk! (Q to struggle free)');}
    const wp=new THREE.Mesh(new THREE.CircleGeometry(1.6,14),new THREE.MeshBasicMaterial({color:0xf0f4ff,transparent:true,opacity:.5,depthWrite:false}));wp.rotation.x=-Math.PI/2;wp.position.set(B.aim.x,H(B.aim.x,B.aim.z)+.12,B.aim.z);scene.add(wp);webPools.push({m:wp,x:B.aim.x,z:B.aim.z,r:1.6,t:4});}
   if(B.t>1.0){marker.visible=false;marker.material.color.set(0xff2a3a);B.endAttack();}}
  else if(B.state==='drop'){marker.visible=true;const k=Math.min(1,B.t/.8);marker.position.set(B.aim.x,H(B.aim.x,B.aim.z)+.1,B.aim.z);marker.scale.setScalar(lerp(4,3,k));marker.material.opacity=.15+.45*k;
   if(B.t<.8){B.aim.lerp(hero.position,dt*1.5);}else if(B.t<1.05){B.pos.lerp(new V3(B.aim.x,H(B.aim.x,B.aim.z),B.aim.z),Math.min(1,(B.t-.8)/.25));}
   if(B.t>=1.05&&B._last<1.05){shake(.4);groundRing(B.pos,0xffffff,4,.4);noise(.3,300,.5);if(Math.hypot(hero.position.x-B.aim.x,hero.position.z-B.aim.z)<3.2)playerHit(22,B);marker.visible=false;}
   if(B.t>2.6){B.state='rise';B.t=0;B.from.copy(B.pos);B.target.copy(webNodes[B.node]);B.target.y-=3.5;}}
  else if(B.state==='rise'){B.pos.lerpVectors(B.from,B.target,smooth(0,1,B.t/.7));if(B.t>.7)B.endAttack();}
  else if(B.state==='call'){bUpper.rotation.y=Math.sin(B.t*10)*.3;if(B.t>1.2){bUpper.rotation.y=0;B.endAttack();}}
  else if(B.state==='retreat'){B.pos.y=lerp(B.pos.y,ARENA.y+14,dt*2);if(B.t>2){B.state='idle';B.t=0;}}
  else if(B.state==='falling'){B.pos.y=Math.max(gy,B.pos.y-dt*16);if(B.pos.y<=gy+.01){shake(.3);groundRing(B.pos,0xffffff,3,.4);B.state='stunned';B.t=0;B.stunFor=BAL.stun;}}
  else if(B.state==='stunned'){bUpper.rotation.x=.5;if(B.t>(B.stunFor||3)){bUpper.rotation.x=0;B.state='rise';B.t=0;B.from.copy(B.pos);B.target.copy(webNodes[B.node]);B.target.y-=3.5;}}
 }else{ // phase 2: skittering spider, 8-leg staccato
  const legPhase=time*(B.state==='skitter'&&B.burst?22:4);bLegs.forEach((l,i)=>{l.root.rotation.x=Math.sin(legPhase+i*1.3+(l.side>0?Math.PI:0))*(B.burst?.5:.1);});
  bUpper.rotation.z=0;if(B.state!=='stunned')bUpper.rotation.x=-.15;
  if(B.state==='land'){B.pos.y=Math.max(gy,B.pos.y-dt*12);if(B.pos.y<=gy+.01){B.state='skitter';B.t=0;B.bursts=0;shake(.4);}}
  else if(B.state==='skitter'){faceP();B.pos.y=gy;const cyc=B.t%.42;B.burst=cyc<.24;if(B.burst&&dist>3){const off=Math.sin(B.bursts*1.7)*.8;const dir=Math.atan2(toP.x,toP.z)+off;B.pos.x+=Math.sin(dir)*11*dt;B.pos.z+=Math.cos(dir)*11*dt;}
   if(cyc<B._lc)B.bursts++;B._lc=cyc;
   if(B.bursts>=BAL.bursts){B.bursts=0;B.t=0;const r=R();B.state=dist<4.5?'combo':r<.4?'charge':r<.7?'ring':'combo';B.aim=hero.position.clone();B.hits=0;}}
  else if(B.state==='charge'){B.pos.y=gy;if(B.t<.55){faceP();bUpper.rotation.x=-.5;B.aim.copy(hero.position);marker.visible=true;marker.position.set(B.aim.x,H(B.aim.x,B.aim.z)+.1,B.aim.z);marker.scale.setScalar(1.5);}
   else if(B.t<1.0){marker.visible=false;const d=new V3().subVectors(B.aim,B.pos);d.y=0;if(d.length()>.5){d.normalize();B.pos.addScaledVector(d,18*dt);}if(!B.hitDone&&dist<2.2){B.hitDone=true;playerHit(25,B,{parry:false});}}
   else{B.hitDone=false;B.state='skitter';B.t=0;B.attacks++;if(B.attacks%3===0){B.state='recoverP2';B.t=0;}}}
  else if(B.state==='combo'){faceP();B.pos.y=gy;const times=[.45,.85,1.3];bUpper.rotation.x=-.3+Math.sin(B.t*12)*.15;
   for(let i=0;i<3;i++){if(B.t>=times[i]&&B._last<times[i]){if(dist<4.2){const r=playerHit(12,B,{parry:i===2});if(r==='parried'&&i===2){B.state='stunned';B.t=0;B.stunFor=2.4;break;}}noise(.08,2000,.2);}}
   if(B.state==='combo'&&B.t>1.7){B.state='skitter';B.t=0;B.attacks++;if(B.attacks%3===0){B.state='recoverP2';B.t=0;}}}
  else if(B.state==='ring'){B.pos.y=gy;if(B.t>.5&&B._last<=.5){groundRing(B.pos,0xeaf0ff,8,.6);const wp=new THREE.Mesh(new THREE.RingGeometry(1.5,7,24),new THREE.MeshBasicMaterial({color:0xf0f4ff,transparent:true,opacity:.5,depthWrite:false,side:THREE.DoubleSide}));
    wp.rotation.x=-Math.PI/2;wp.position.set(B.pos.x,gy+.12,B.pos.z);scene.add(wp);webPools.push({m:wp,x:B.pos.x,z:B.pos.z,r:7,t:6});}if(B.t>1.1){B.state='skitter';B.t=0;B.attacks++;if(B.attacks%3===0){B.state='recoverP2';B.t=0;}}}
  else if(B.state==='recoverP2'){B.pos.y=gy;bUpper.rotation.x=.3+Math.sin(B.t*20)*.05;if(B.t>BAL.recover){B.state='skitter';B.t=0;}}
  else if(B.state==='stunned'){B.pos.y=gy;bUpper.rotation.x=.6;if(B.t>(B.stunFor||2)){B.state='skitter';B.t=0;}}
  B.pos.x=clamp(B.pos.x,ARENA.x-20,ARENA.x+20);B.pos.z=clamp(B.pos.z,ARENA.z-20,ARENA.z+20);}
 B._last=B.t;}
boss.endAttack=function(){this.attacks++;this.t=0;if(this.attacks%3===0){this.state='retreat';}else this.state='idle';};
function claimShard(){shardMesh.visible=false;S.shards++;addCracks(S.shards-1);S.hp=DERIV.maxHp();S.sp=DERIV.maxSp();bellRing(hero.position.clone(),2);shardBeacon.visible=false;
 areaTitle('欠片 '+S.shards+'/8','KAKERA CLAIMED','A gold seam spreads across Ren\'s forearm · +20 max HP, +15 max spirit · Silk Step (v0.2)');
 burst(hero.position.clone().add(new V3(0,1.2,0)),0xffcf5a,40,6,1.2);save();setTimeout(()=>{$('winTxt').innerHTML=`Jorōgumo dissolves into silk and the first kakera falls into your hand. The gold seam on your arm hums with the bell's memory.<br><br>Level ${S.lvl} · ${S.stat.kills} yokai · ${S.stat.fish} fish · ${S.stat.cooked} meals cooked<br><br><b>To be continued:</b> seven sealed regions wait on the scroll map (M).`;show('win');},3500);}
