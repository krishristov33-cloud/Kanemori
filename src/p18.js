/* =====================================================================
   v0.5 SECTION: JORŌGUMO REDESIGN. A beautiful-terrifying yokai built in
   code: a woman's upper body in a layered black-gold kimono rising from a
   huge jorō spider (gold/indigo banded abdomen, 8 IK legs on a staccato
   tetrapod gait), glowing eyes, gold-silk lair with cocoons and egg sacs.
   Full move set with ground telegraphs: idle, stalk, leg-strike combo
   (3rd strike parryable), web shot, web pull, leap slam, summon
   spiderlings, phase-2 transformation, stagger, death (unravels to silk).
   ===================================================================== */
const JG={legs:[],t:0,eyes:[],eyes2:[],spikes:[],strands:[],sleeves:[],tele:[],proj:[],p2k:0,scale:1,bodyY:0,v:new V3(),dying:0};
const TOON=(()=>{const d=new Uint8Array([60,60,60,255,140,140,140,255,215,215,215,255,255,255,255,255]);const t=new THREE.DataTexture(d,4,1,THREE.RGBAFormat);t.minFilter=t.magFilter=THREE.NearestFilter;t.needsUpdate=true;return t;})();
function jgMat(col,o={}){const m=new THREE.MeshToonMaterial({color:col,gradientMap:TOON,...o});m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <opaque_fragment>',
 'float rimK=pow(1.-max(dot(normalize(vNormal),normalize(vViewPosition)),0.),2.6);outgoingLight+=vec3(1.,.82,.5)*rimK*.35;\n#include <opaque_fragment>');};return m;}
const JGT=(()=>{// painted textures
 const kimono=canvasTex(512,512,(c,w,h)=>{const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#1c1430');g.addColorStop(.6,'#2a1838');g.addColorStop(1,'#120c1e');c.fillStyle=g;c.fillRect(0,0,w,h);
  const r=mulberry(31);// gold web arcs + red spider lilies
  c.strokeStyle='rgba(230,190,90,.75)';c.lineWidth=2;for(let k=0;k<6;k++){const cx=r()*w,cy=r()*h;for(let i=0;i<8;i++){c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(i/8*TAU)*90,cy+Math.sin(i/8*TAU)*90);c.stroke();}for(let rr=20;rr<90;rr+=18){c.beginPath();for(let i=0;i<=8;i++){const a=i/8*TAU;const x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}}
  for(let k=0;k<16;k++){const cx=r()*w,cy=h*.45+r()*h*.55;c.strokeStyle='#d8302a';c.lineWidth=2.5;for(let i=0;i<7;i++){const a=-Math.PI/2+(i-3)*.42;c.beginPath();c.moveTo(cx,cy);c.quadraticCurveTo(cx+Math.cos(a)*14,cy+Math.sin(a)*22,cx+Math.cos(a)*24,cy+Math.sin(a)*16);c.stroke();}c.strokeStyle='#2f5a2a';c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+(r()-.5)*8,cy+40);c.stroke();}
  c.fillStyle='rgba(255,210,120,.9)';for(let i=0;i<220;i++){c.fillRect(r()*w,r()*h,1.5,1.5);}});
 const abd=canvasTex(256,512,(c,w,h)=>{c.fillStyle='#14182c';c.fillRect(0,0,w,h);for(let y=0;y<h;y+=46){c.fillStyle='#e6b52e';c.fillRect(0,y+10,w,14);c.fillStyle='#2c3a6a';c.fillRect(0,y+28,w,8);}
  c.fillStyle='#c4281e';c.beginPath();c.ellipse(w/2,h*.85,w*.18,h*.06,0,0,TAU);c.fill();c.fillStyle='rgba(255,230,140,.8)';for(let i=0;i<40;i++)c.fillRect(Math.random()*w,Math.random()*h,2,2);});
 const abdE=canvasTex(256,512,(c,w,h)=>{c.fillStyle='#000';c.fillRect(0,0,w,h);for(let y=0;y<h;y+=46){c.fillStyle='#ffc040';c.fillRect(0,y+13,w,8);}c.fillStyle='#ff4020';c.beginPath();c.ellipse(w/2,h*.85,w*.14,h*.045,0,0,TAU);c.fill();});
 const face=canvasTex(256,256,(c,w,h)=>{c.fillStyle='#f2e8e2';c.fillRect(0,0,w,h);const g=c.createRadialGradient(w/2,h*.6,10,w/2,h*.55,130);g.addColorStop(0,'rgba(255,200,200,.0)');g.addColorStop(1,'rgba(160,120,160,.35)');c.fillStyle=g;c.fillRect(0,0,w,h);
  c.fillStyle='#1a0e12';for(const sx of[-1,1]){c.beginPath();c.ellipse(w/2+sx*30,h*.47,20,6,sx*-.18,0,TAU);c.fill();c.strokeStyle='#1a0e12';c.lineWidth=3;c.beginPath();c.moveTo(w/2+sx*12,h*.41);c.quadraticCurveTo(w/2+sx*34,h*.37,w/2+sx*54,h*.43);c.stroke();}
  c.fillStyle='#c8102a';c.beginPath();c.ellipse(w/2,h*.71,13,5,0,0,TAU);c.fill();c.fillStyle='#8a0a1a';c.fillRect(w/2-13,h*.71-1,26,2);
  c.fillStyle='rgba(200,40,60,.5)';for(const sx of[-1,1]){c.beginPath();c.moveTo(w/2+sx*30,h*.5);c.lineTo(w/2+sx*36,h*.62);c.lineTo(w/2+sx*28,h*.5);c.fill();}});
 const silk=canvasTex(64,128,(c,w,h)=>{c.fillStyle='#e8e2d4';c.fillRect(0,0,w,h);c.strokeStyle='rgba(150,140,120,.6)';c.lineWidth=1.5;for(let y=-40;y<h+40;y+=6){c.beginPath();c.moveTo(0,y);c.lineTo(w,y+18);c.stroke();}c.strokeStyle='rgba(255,230,170,.5)';for(let y=-40;y<h+40;y+=9){c.beginPath();c.moveTo(0,y+20);c.lineTo(w,y);c.stroke();}});
 return{kimono,abd,abdE,face,silk};})();
const JGM={kimono:jgMat(0xffffff,{map:JGT.kimono}),obi:jgMat(0xb8202a),gold:jgMat(0xe6b04a,{emissive:0x7a4a10,emissiveIntensity:.5}),skin:jgMat(0xf2e6e0),face:jgMat(0xffffff,{map:JGT.face}),hair:jgMat(0x0c0a14),
 chitin:jgMat(0x1a1830),chitinL:jgMat(0x2a2c4c),abd:jgMat(0xffffff,{map:JGT.abd,emissive:0xffffff,emissiveMap:JGT.abdE,emissiveIntensity:.35}),eye:new THREE.MeshBasicMaterial({color:0xffd23a}),eye2:new THREE.MeshBasicMaterial({color:0xff4a20}),
 collar:jgMat(0xf4ead2),red:jgMat(0xc8202a),silk:new THREE.MeshLambertMaterial({map:JGT.silk,color:0xf0e8d8})};
const JGR=new THREE.Group();JGR.name='v5_jorogumo';bossG.add(JGR);
const JGB=new THREE.Group();JGR.add(JGB);// body pivot (height, pitch, roll)
{// spider body
 const ceph=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),JGM.chitin);ceph.scale.set(1.25,.75,1.45);ceph.position.set(0,0,.5);JGB.add(ceph);
 const abd=new THREE.Mesh(new THREE.SphereGeometry(1,24,18),JGM.abd);abd.scale.set(1.75,1.45,2.35);abd.position.set(0,.75,-2.55);abd.rotation.x=-.35;JGB.add(abd);JG.abd=abd;
 const spin=new THREE.Mesh(new THREE.ConeGeometry(.35,.6,8),JGM.chitinL);spin.rotation.x=-Math.PI/2-.3;spin.position.set(0,.1,-4.75);JGB.add(spin);
 // fangs (chelicerae) under the front, glow in phase 2
 JG.fangs=[];for(const sx of[-1,1]){const f=new THREE.Mesh(new THREE.ConeGeometry(.12,.7,6),JGM.chitinL);f.position.set(sx*.32,-.55,1.75);f.rotation.x=Math.PI*.82;JGB.add(f);JG.fangs.push(f);}
 // waist: kimono skirt flowing out of the cephalothorax
 const skirt=new THREE.Mesh(new THREE.LatheGeometry([[1.05,-.2],[.95,.2],[.72,.6],[.5,.95],[.42,1.15]].map(([x,y])=>new THREE.Vector2(x,y)),20),JGM.kimono);skirt.position.set(0,.4,1.1);JGB.add(skirt);
}
const JGW=new THREE.Group();JGW.position.set(0,1.55,1.1);JGB.add(JGW);// woman (waist pivot)
{const torso=new THREE.Mesh(new THREE.LatheGeometry([[.42,0],[.36,.25],[.4,.6],[.46,.95],[.5,1.15],[.22,1.32],[.12,1.42]].map(([x,y])=>new THREE.Vector2(x,y)),18),JGM.kimono);torso.scale.z=.8;JGW.add(torso);
 const obi=new THREE.Mesh(new THREE.CylinderGeometry(.43,.4,.36,18),JGM.obi);obi.position.y=.32;obi.scale.z=.82;JGW.add(obi);
 const cord=new THREE.Mesh(new THREE.TorusGeometry(.42,.025,6,24),JGM.gold);cord.rotation.x=Math.PI/2;cord.scale.y=.82;cord.position.y=.32;JGW.add(cord);
 const bow=new THREE.Group();bow.position.set(0,.36,-.38);for(const sx of[-1,1]){const w=new THREE.Mesh(new THREE.SphereGeometry(.24,10,8),JGM.gold);w.scale.set(1.2,.6,.4);w.position.x=sx*.22;bow.add(w);}const tail=new THREE.Mesh(new THREE.BoxGeometry(.3,.7,.06),JGM.obi);tail.position.y=-.35;bow.add(tail);JGW.add(bow);
 // layered collar (eri): white + red V
 for(const[c,off]of[[JGM.collar,0],[JGM.red,.035]]){for(const sx of[-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(.08,.62,.05),c);p.position.set(sx*(.1+off),1.12,.33-off*.5);p.rotation.z=sx*.42;p.rotation.x=-.2;JGW.add(p);}}
 // neck + head
 const neck=new THREE.Mesh(new THREE.CylinderGeometry(.075,.09,.3,10),JGM.skin);neck.position.y=1.5;JGW.add(neck);
 const head=new THREE.Group();head.position.y=1.82;JGW.add(head);JG.head=head;
 const face=new THREE.Mesh(new THREE.SphereGeometry(.2,20,16),JGM.face);face.scale.set(.92,1.15,.95);face.rotation.y=-Math.PI/2;head.add(face);
 for(const sx of[-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.022,8,6),JGM.eye);e.position.set(sx*.068,.015,.17);e.scale.set(1.4,.7,.6);head.add(e);JG.eyes.push(e);}
 // phase-2 spider eyes (hidden until the transformation)
 for(const[x,y,s]of[[-.05,.12,.018],[.05,.12,.018],[-.11,.08,.014],[.11,.08,.014],[-.025,.18,.012],[.025,.18,.012]]){const e=new THREE.Mesh(new THREE.SphereGeometry(s,8,6),JGM.eye2);e.position.set(x,y,.165);e.visible=false;head.add(e);JG.eyes2.push(e);}
 // hair: big shimada bun + side wings, gold kanzashi pins, loose strands
 const hb=new THREE.Mesh(new THREE.SphereGeometry(.23,16,12,0,TAU,0,Math.PI*.62),JGM.hair);hb.position.set(0,.03,-.02);hb.scale.set(1.05,1.1,1.1);head.add(hb);
 const bun=new THREE.Mesh(new THREE.SphereGeometry(.17,14,10),JGM.hair);bun.position.set(0,.28,-.08);bun.scale.set(1.4,.8,1);head.add(bun);
 for(const sx of[-1,1]){const w=new THREE.Mesh(new THREE.SphereGeometry(.13,12,8),JGM.hair);w.position.set(sx*.2,.05,-.06);w.scale.set(.7,1.1,1.2);head.add(w);}
 for(let i=0;i<4;i++){const pin=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.55,4),JGM.gold);pin.position.set(0,.3,-.08);pin.rotation.z=(i-1.5)*.45;pin.rotation.x=.3;head.add(pin);
  const orn=new THREE.Mesh(new THREE.OctahedronGeometry(.035,0),JGM.gold);orn.position.set(Math.sin((i-1.5)*.45)*-.27,.3+Math.cos((i-1.5)*.45)*.27,-.08);head.add(orn);}
 const hairM=new THREE.MeshToonMaterial({color:0x0c0a14,gradientMap:TOON,side:THREE.DoubleSide});
 for(let i=0;i<7;i++){const g=new THREE.PlaneGeometry(.09,1.6,1,6).translate(0,-.8,0);const s=new THREE.Mesh(g,hairM);s.position.set((i-3)*.05,.05,-.2);s.rotation.x=.25;head.add(s);JG.strands.push({m:s,base:s.rotation.clone(),ph:i*.7});}
 // arms with long furisode sleeves
 for(const sx of[-1,1]){const sh=new THREE.Group();sh.position.set(sx*.42,1.18,0);JGW.add(sh);const up=new THREE.Mesh(new THREE.CylinderGeometry(.09,.08,.6,8).translate(0,-.3,0),JGM.kimono);sh.add(up);
  const el=new THREE.Group();el.position.y=-.6;sh.add(el);const fo=new THREE.Mesh(new THREE.CylinderGeometry(.075,.05,.55,8).translate(0,-.27,0),JGM.kimono);el.add(fo);
  const hand=new THREE.Mesh(new THREE.SphereGeometry(.06,8,6),JGM.skin);hand.scale.set(1,1.5,.6);hand.position.y=-.6;el.add(hand);
  const nails=new THREE.Mesh(new THREE.ConeGeometry(.05,.18,5),JGM.red);nails.position.y=-.72;nails.rotation.x=Math.PI;el.add(nails);
  const slv=new THREE.Mesh(new THREE.PlaneGeometry(.55,1.1,2,4).translate(0,-.55,0),new THREE.MeshToonMaterial({map:JGT.kimono,gradientMap:TOON,side:THREE.DoubleSide}));slv.position.set(0,-.05,0);slv.rotation.y=Math.PI/2;el.add(slv);
  sh.rotation.z=sx*.35;el.rotation.x=-.5;JG.sleeves.push({sh,el,slv,hand,sx,sw:0,sv:0});}
}
// 8 legs: hip on the cephalothorax, femur + tibia solved by 2-bone IK toward planted feet
{const L1=2.9,L2=3.4;for(let i=0;i<8;i++){const side=i<4?-1:1,k=i%4;const a=(-.9+k*.62);// spread angle from front to back
  const hip=new V3(side*.95,-.05,.95-k*.55);const rest=new V3(side*Math.cos(a)*4.6,0,Math.sin(-a)*4.0+.4);
  const fem=new THREE.Mesh(new THREE.CylinderGeometry(.14,.1,1,8).translate(0,.5,0),JGM.chitin);const tib=new THREE.Mesh(new THREE.CylinderGeometry(.1,.035,1,8).translate(0,.5,0),JGM.chitin);
  const knee=new THREE.Mesh(new THREE.SphereGeometry(.17,10,8),JGM.gold);const band=new THREE.Mesh(new THREE.TorusGeometry(.12,.035,6,14),JGM.gold);
  const spike=new THREE.Mesh(new THREE.ConeGeometry(.06,.5,5),JGM.gold);spike.visible=false;JG.spikes.push(spike);
  for(const m of[fem,tib,knee,band,spike])JGR.add(m);
  JG.legs.push({i,side,k,hip,rest,L1,L2,fem,tib,knee,band,spike,foot:new V3(),from:new V3(),to:new V3(),st:1,grp:(k+(side>0?1:0))%2,lift:0,over:null,kneeP:new V3()});}}
JGR.traverse(o=>{if(o.isMesh){o.castShadow=true;o.frustumCulled=false;}});
/* ---- lair: gold silk webs (ribbons that bloom), wall webs, cocoons, egg sacs ---- */
const LAIR={cocoons:[],sacs:[]};
{webG.children.forEach(o=>{if(o.isLineSegments)o.visible=false;});
 // v0.5: the six anchor cedars get painted card canopies instead of dark cones
 {const trunkM=new THREE.MeshLambertMaterial({color:0x6e4c36});webG.children.forEach(o=>{const t=o.geometry&&o.geometry.type;if(t==='ConeGeometry'&&o.geometry.parameters.height===7)o.visible=false;else if(t==='CylinderGeometry'&&o.geometry.parameters.height===18)o.material=trunkM;});
  for(const[x,z]of anchorPos){for(const[gm,mt]of[[TREE5.cedCards,V5.ced.material],[TREE5.cedCore,V5.cedCore.material]]){const m=new THREE.Mesh(gm,mt);m.position.set(x,ARENA.y+4,z);m.scale.setScalar(2.1);m.rotation.y=hash(x,z)*6;m.castShadow=true;webG.add(m);}}}
 const pos=[],WY=ARENA.y+10;const seg=(a,b,w)=>{const d=new V3().subVectors(b,a);const s=new V3(-d.z,0,d.x).normalize().multiplyScalar(w);const u=new V3(0,w,0);
  for(const o of[s,u])pos.push(a.x-o.x,a.y-o.y,a.z-o.z, a.x+o.x,a.y+o.y,a.z+o.z, b.x+o.x,b.y+o.y,b.z+o.z, a.x-o.x,a.y-o.y,a.z-o.z, b.x+o.x,b.y+o.y,b.z+o.z, b.x-o.x,b.y-o.y,b.z-o.z);};
 const ctr=new V3(ARENA.x,WY,ARENA.z),an=anchorPos.map(([x,z])=>new V3(x,WY+rnd(-.5,.5),z));
 an.forEach(a=>seg(ctr,a,.05));for(let r=.12;r<1;r+=.075){for(let i=0;i<6;i++){const a=an[i].clone().lerp(ctr,1-r),b=an[(i+1)%6].clone().lerp(ctr,1-r);a.y-=Math.sin(r*Math.PI)*.8;b.y-=Math.sin(r*Math.PI)*.8;seg(a,b,.025);}}
 // anchor guy-lines down to the trunks
 an.forEach(a=>seg(a,new V3(a.x,ARENA.y+3,a.z).lerp(ctr,.04),.03));
 // vertical wall webs between trunk pairs
 for(const i of[0,2,4]){const A=new V3(anchorPos[i][0],ARENA.y,anchorPos[i][1]),B=new V3(anchorPos[(i+1)%6][0],ARENA.y,anchorPos[(i+1)%6][1]);const c=A.clone().lerp(B,.5);c.y+=5;c.lerp(ctr.clone().setY(c.y),.08);
  const sp=[];for(let k=0;k<10;k++){const t=k/10*TAU;sp.push(c.clone().add(new V3((B.x-A.x)*.45*Math.cos(t),4.2*Math.sin(t),(B.z-A.z)*.45*Math.cos(t))));}
  sp.forEach(p=>seg(c,p,.02));for(let r=.2;r<=1;r+=.16)for(let k=0;k<10;k++){seg(c.clone().lerp(sp[k],r),c.clone().lerp(sp[(k+1)%10],r),.012);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 LAIR.web=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0xffe6a8,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:true}));webG.add(LAIR.web);
 // cocoons: hanging from the canopy web + leaning on trunks
 const cg=new THREE.LatheGeometry([[0,-.9],[.28,-.7],[.42,-.2],[.4,.3],[.26,.75],[0,.95]].map(([x,y])=>new THREE.Vector2(x,y)),12);
 for(let i=0;i<11;i++){const hang=i<7;let x,z,y;if(hang){const a=R()*TAU,r=rnd(4,12);x=ARENA.x+Math.cos(a)*r;z=ARENA.z+Math.sin(a)*r;y=WY-rnd(2.5,5);}else{const p=anchorPos[i%6];x=lerp(p[0],ARENA.x,.08);z=lerp(p[1],ARENA.z,.08);y=ARENA.y+.9;}
  const m=new THREE.Mesh(cg,JGM.silk);m.position.set(x,y,z);m.scale.setScalar(rnd(.9,1.3));if(!hang)m.rotation.z=rnd(-.4,.4);m.castShadow=true;webG.add(m);
  if(hang){const th=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,WY-y,3),LAIR.web.material);th.position.set(x,(WY+y)/2+.5,z);webG.add(th);}LAIR.cocoons.push({m,hang,ph:R()*TAU,y});}
 // egg sacs on the trunks (burst when she summons)
 for(let i=0;i<6;i++){const p=anchorPos[i];const s=new THREE.Mesh(new THREE.SphereGeometry(.45,10,8),new THREE.MeshLambertMaterial({color:0xf0e2b8,emissive:0xffb040,emissiveIntensity:.35}));s.position.set(lerp(p[0],ARENA.x,.09),ARENA.y+rnd(3,6),lerp(p[1],ARENA.z,.09));s.scale.y=1.3;webG.add(s);LAIR.sacs.push(s);}
 LAIR.light=new THREE.PointLight(0xffc060,0,26,1.6);LAIR.light.position.set(ARENA.x,ARENA.y+6,ARENA.z);scene.add(LAIR.light);}
/* ---- telegraph decals (fill up as the wind-up completes; flash on the hit frame) ---- */
const TELE_M=()=>new THREE.ShaderMaterial({uniforms:{uK:{value:0},uKind:{value:0},uHit:{value:0},uCol:{value:new THREE.Color(0xff3a2a)}},transparent:true,depthWrite:false,
 vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform float uK,uKind,uHit;uniform vec3 uCol;varying vec2 vUv;void main(){vec2 q=vUv-.5;float a;
  if(uKind<.5){float r=length(q)*2.;if(r>1.)discard;float rim=smoothstep(.9,.97,r)*(1.-smoothstep(.98,1.,r));float fill=step(r,uK)*.32;a=rim*.9+fill+smoothstep(uK-.05,uK,r)*step(r,uK)*.4;}
  else{float x=abs(q.x)*2.,y=vUv.y;float rim=smoothstep(.85,.95,x);float fill=step(1.-y,uK)*.3;a=(rim*.8+fill)*step(x,1.);}
  vec3 c=mix(uCol,vec3(1.,.95,.8),uHit);gl_FragColor=vec4(c,a*(.75+uHit*.6));}`});
for(let i=0;i<8;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),TELE_M());m.visible=false;m.renderOrder=2;scene.add(m);JG.tele.push({m,t:0,dur:1,hold:0});}
function jgTele(x,z,r,dur,o={}){const T=JG.tele.find(t=>!t.m.visible)||JG.tele[0];const m=T.m;m.visible=true;T.t=0;T.dur=dur;T.hold=o.hold||.18;T.follow=o.follow||null;
 m.material.uniforms.uKind.value=o.line?1:0;m.material.uniforms.uCol.value.setHex(o.col||0xff3a2a);m.material.uniforms.uHit.value=0;
 if(o.line){m.scale.set(o.w||1.6,1,o.len||8);m.rotation.y=o.yaw||0;const cx=x+Math.sin(o.yaw||0)*(o.len||8)/2,cz=z+Math.cos(o.yaw||0)*(o.len||8)/2;m.position.set(cx,meshH(cx,cz)+.1,cz);}
 else{m.scale.set(r*2,1,r*2);m.rotation.y=0;m.position.set(x,meshH(x,z)+.1,z);}return T;}
function jgTeleUpd(dt){for(const T of JG.tele){if(!T.m.visible)continue;T.t+=dt;const u=T.m.material.uniforms;u.uK.value=clamp(T.t/T.dur,0,1);if(T.follow){const f=T.follow();T.m.position.set(f.x,meshH(f.x,f.z)+.1,f.z);}
  if(T.t>=T.dur){u.uHit.value=1;T.follow=null;}if(T.t>=T.dur+T.hold)T.m.visible=false;}}
/* ---- silk projectiles ---- */
const JG_PM=new THREE.MeshBasicMaterial({color:0xfff4d8});
function jgShoot(from,to,dur,onHit){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.28,1),JG_PM);m.position.copy(from);scene.add(m);
 const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints([from.clone(),from.clone()]),new THREE.LineBasicMaterial({color:0xffe6a8,transparent:true,opacity:.8}));ln.frustumCulled=false;scene.add(ln);
 JG.proj.push({m,ln,from:from.clone(),to:to.clone(),t:0,dur,onHit});}
function jgProjUpd(dt){for(let i=JG.proj.length-1;i>=0;i--){const p=JG.proj[i];p.t+=dt;const k=Math.min(1,p.t/p.dur);p.m.position.lerpVectors(p.from,p.to,k);p.m.position.y+=Math.sin(k*Math.PI)*1.5;
  const a=p.ln.geometry.attributes.position;a.setXYZ(0,p.from.x,p.from.y,p.from.z);a.setXYZ(1,p.m.position.x,p.m.position.y,p.m.position.z);a.needsUpdate=true;
  if(k>=1){try{p.onHit&&p.onHit(p.to);}catch(e){}scene.remove(p.m);p.ln.material.opacity=.6;p.fade=(p.fade||0)+dt;if(p.fade>.25||!p.keep){scene.remove(p.ln);JG.proj.splice(i,1);}}}}
/* ---- rig update: legs (gait + IK), body, woman, hair, sleeves ---- */
const _j1=new V3(),_j2=new V3(),_j3=new V3(),_jq=new THREE.Quaternion(),_jup=new V3(0,1,0);
function jgPlace(mesh,a,b,thick=1){_j1.subVectors(b,a);const L=_j1.length();mesh.position.copy(a);mesh.quaternion.setFromUnitVectors(_jup,_j1.normalize());mesh.scale.set(thick,L,thick);}
function jgLegs(dt,groundY,moving){const B=boss;JGR.updateMatrixWorld(true);const sc=JG.scale;
 // stepping: a leg steps when its planted foot drifts too far from its rest spot; tetrapod groups alternate
 let stepping=[0,0];for(const L of JG.legs)if(L.st<1)stepping[L.grp]++;
 for(const L of JG.legs){const restW=JGB.localToWorld(_j2.copy(L.rest).multiplyScalar(1));restW.addScaledVector(JG.v,.18);
  const gy=groundY===null?meshH(restW.x,restW.z):groundY;restW.y=gy;
  if(L.over){L.over(L);continue;}
  if(L.st>=1){const d=Math.hypot(L.foot.x-restW.x,L.foot.z-restW.z);if(!L.init||d>1.5*sc||Math.abs(L.foot.y-gy)>2){if(!L.init){L.foot.copy(restW);L.init=true;}else if(stepping[1-L.grp]===0||d>3.2){L.from.copy(L.foot);L.to.copy(restW);L.st=0;L.dur=moving>6?.12:.2;stepping[L.grp]++;}}}
  if(L.st<1){L.st=Math.min(1,L.st+dt/L.dur);const k=smooth(0,1,L.st);L.foot.lerpVectors(L.from,L.to,k);L.foot.y+=Math.sin(k*Math.PI)*(.9+moving*.05)*sc;if(L.st>=1){if(moving>4&&R()<.3)try{noise(.03,3000,.04)}catch(e){}}}}}
function jgIK(){const sc=JG.scale;for(const L of JG.legs){const hipW=JGB.localToWorld(_j1.copy(L.hip)).clone();const foot=L.foot;const L1=L.L1*sc,L2=L.L2*sc;
  const d=Math.min(hipW.distanceTo(foot),L1+L2-.01);const dir=_j2.subVectors(foot,hipW).normalize();
  // knee: up and outward from the body (classic spider arch)
  const out=_j3.subVectors(hipW,JGB.getWorldPosition(new V3())).setY(0).normalize();const pole=new V3(out.x,1.6,out.z).normalize();
  const a=(L1*L1+d*d-L2*L2)/(2*L1*d);const ang=Math.acos(clamp(a,-1,1));const perp=pole.clone().sub(dir.clone().multiplyScalar(pole.dot(dir))).normalize();
  const knee=hipW.clone().addScaledVector(dir,Math.cos(ang)*L1).addScaledVector(perp,Math.sin(ang)*L1);L.kneeP.copy(knee);
  jgPlace(L.fem,hipW,knee,sc);jgPlace(L.tib,knee,foot,sc);L.knee.position.copy(knee);L.knee.scale.setScalar(sc);L.band.position.copy(knee).lerp(foot,.28);L.band.quaternion.copy(L.tib.quaternion).multiply(_jq.setFromAxisAngle(new V3(1,0,0),Math.PI/2));L.band.scale.setScalar(sc);
  L.spike.position.copy(knee);L.spike.quaternion.copy(L.fem.quaternion);L.spike.translateY(.25*sc);L.spike.scale.setScalar(sc*(.6+JG.p2k*.8));}}
function jgPose(dt,time){const B=boss,s=B.state,t=B.t;const brt=Math.sin(time*1.6);
 // woman idle: breathing, slow serpentine sway, head tilt; sleeves + hair on springs
 let lean=0,twist=Math.sin(time*.7)*.12,headT=Math.sin(time*.9)*.12,armL=-.4,armR=-.4,armFwd=0;
 if(s==='combo'||s==='lash')lean=.25;if(s==='shot'||s==='webshot'){armR=-1.9;armFwd=1;}if(s==='pull'){armR=-2.2;armFwd=1;lean=-.1;}
 if(s==='call'||s==='summon'){armL=armR=-2.6;headT=-.35;}if(s==='stunned'||s==='recoverP2'){lean=.6;headT=.4;armL=armR=.2;}
 if(s==='transform'){const k=clamp(t/2.2,0,1);lean=-.5*Math.sin(k*Math.PI);headT=-.7*Math.sin(Math.min(1,t/1.2)*Math.PI*.5);armL=armR=-2.8*Math.sin(k*Math.PI);}
 if(s==='drop'||s==='leap'){lean=t<.7?.35:-.2;armL=armR=-1.2;}
 JGW.rotation.x=lerp(JGW.rotation.x,lean+brt*.03,Math.min(1,dt*6));JGW.rotation.y=lerp(JGW.rotation.y,twist,Math.min(1,dt*3));JG.head.rotation.x=lerp(JG.head.rotation.x,headT,Math.min(1,dt*5));
 // head looks at Ren
 const toP=_j1.subVectors(hero.position,bossG.position);const yaw=wrapPi(Math.atan2(toP.x,toP.z)-bossG.rotation.y);JG.head.rotation.y=lerp(JG.head.rotation.y,clamp(yaw,-1,1),Math.min(1,dt*4));
 for(const S2 of JG.sleeves){const want=S2.sx<0?armL:armR;S2.sh.rotation.x=lerp(S2.sh.rotation.x,want*(S2.sx>0||armFwd===0?1:.6),Math.min(1,dt*7));S2.sh.rotation.z=S2.sx*(.35+Math.abs(want)*.08);
  const acc=JG.v.length();S2.sv+=((-acc*.03+Math.sin(time*1.3+S2.sx)*.08-S2.sw)*40-S2.sv*5)*dt;S2.sw+=S2.sv*dt;S2.slv.rotation.x=S2.sw-S2.sh.rotation.x*.6;}
 const wd=V5U.uWind.value;for(const h of JG.strands){h.m.rotation.x=h.base.x+.15+Math.sin(time*1.7+h.ph)*.08*(1+wd)+JG.v.length()*.02+JG.p2k*(-.9+Math.sin(time*3+h.ph)*.25);h.m.rotation.z=Math.sin(time*1.1+h.ph)*.12*(1+JG.p2k*2);h.m.scale.y=1+JG.p2k*.8;}
 // eyes pulse; phase-2 eyes
 const pulse=.8+.2*Math.sin(time*5);JGM.eye.color.setRGB(1*pulse,.82*pulse,.23);JG.eyes2.forEach((e,i)=>{e.visible=JG.p2k>i/6*.9;});
 JGM.abd.emissiveIntensity=.35+JG.p2k*.9+(s==='summon'||s==='call'?Math.abs(Math.sin(t*12))*.8:0);JGM.gold.emissiveIntensity=.5+JG.p2k*.8;
 JG.fangs.forEach((f,i)=>{f.rotation.x=Math.PI*.82+(s==='combo'||s==='pull'?Math.sin(time*18+i)*.12:0);});
 JG.spikes.forEach(sp=>sp.visible=JG.p2k>.05);}
/* ---- state machine ---- */
JG.attacks=0;
function jgFace(dt,rate=5){const toP=_j1.subVectors(hero.position,bossG.position);bossG.rotation.y+=wrapPi(Math.atan2(toP.x,toP.z)-bossG.rotation.y)*Math.min(1,dt*rate);}
function jgMove(dir,spd,dt){JG.v.lerp(dir.clone().multiplyScalar(spd),Math.min(1,dt*8));bossG.position.x+=JG.v.x*dt;bossG.position.z+=JG.v.z*dt;}
function jgHitPlayer(x,z,r,dmg,opt={}){if(Math.hypot(hero.position.x-x,hero.position.z-z)<r)return playerHit(dmg,boss,opt);return'miss';}
function jgNext1(){const B=boss;const dist=Math.hypot(hero.position.x-B.pos.x,hero.position.z-B.pos.z);B.moves=0;const r=R();
 B.state=B.attacks===1&&r<.5?'call':dist<9&&r<.4?'lash':r<.55?'drop':'shot';B.t=0;B.aim=hero.position.clone();B._fired=0;
 if(B.state==='call'){toast('Spiderlings drop from the web!');}}
function jgNext2(){const B=boss;const dist=Math.hypot(hero.position.x-B.pos.x,hero.position.z-B.pos.z);const r=R();B._fired=0;B.t=0;B.aim=hero.position.clone();
 if(JG.attacks>0&&JG.attacks%3===0){B.state='recoverP2';JG.attacks++;return;}
 B.state=dist<6?(r<.65?'combo':'pull'):dist<13?(r<.35?'combo':r<.6?'pull':r<.82?'webshot':'leap'):(r<.5?'leap':r<.8?'pull':'webshot');
 if(JG.attacks%5===4)B.state='summon';JG.attacks++;}
updBoss=function(dt,time){const B=boss;JG.t+=dt;jgTeleUpd(dt);jgProjUpd(dt);bUpper.visible=false;bLower.visible=false;bMistSkirt.visible=false;
 for(const a of B.anchors){if(a.cut&&B.phase===1){a.t-=dt;if(a.t<=0){a.cut=false;a.m.visible=true;}}}
 for(let i=webPools.length-1;i>=0;i--){const p=webPools[i];p.t-=dt;p.m.material.opacity=.5*Math.min(1,p.t);if(p.t<=0){scene.remove(p.m);webPools.splice(i,1);continue;}if(Math.hypot(hero.position.x-p.x,hero.position.z-p.z)<p.r)P.slowT=.2;}
 // lair ambience
 LAIR.cocoons.forEach(c=>{if(c.hang){c.m.rotation.z=Math.sin(time*.7+c.ph)*.08;c.m.position.y=c.y+Math.sin(time*.5+c.ph)*.1;}});LAIR.web.material.opacity=.55+.2*Math.sin(time*1.3)+(B.active?.15:0);
 const near=Math.hypot(hero.position.x-ARENA.x,hero.position.z-ARENA.z)<40;LAIR.light.intensity=near?(B.active?14:7)*(.85+.15*Math.sin(time*2)):0;
 const dP=Math.hypot(hero.position.x-ARENA.x,hero.position.z-ARENA.z);const WY=webNodes[0].y;
 if(!B.alive){if(B.state==='dying'){B.t+=dt;jgDeath(dt,time);}else bossG.visible=false;return;}
 if(!B.active){if(dP<24&&!P.dead){B.active=true;B.state='reveal';B.t=0;$('bossbar').style.display='block';$('bossNm').textContent=J('女郎蜘蛛 JORŌGUMO — LADY OF THE CANOPY');areaTitle('女郎蜘蛛','JORŌGUMO','Lady of the Canopy · cut her glowing anchor threads');bellTone(1);if(!S.stat.foundWeb)S.stat.foundWeb=true;}
  else{// waiting high in her web: slow pacing on the silk
   const a=time*.15;bossG.position.set(ARENA.x+Math.cos(a)*3,WY,ARENA.z+Math.sin(a)*3);bossG.rotation.y=-a;JG.v.set(-Math.sin(a)*.45,0,Math.cos(a)*.45);}}
 else if(dP>48||P.dead){B.reset();toast('Jorōgumo withdraws into the canopy.');}
 $('bossHP').style.width=(Math.max(0,B.hp)/B.max*100)+'%';
 if(B.burn>0){B.burn-=dt;if((B._bt=(B._bt||0)+dt)>.25){B._bt=0;B.damage(1,new V3(),false,false);}}
 silkLine.visible=B.phase===1&&B.active&&B.pos.y<WY-.5;if(silkLine.visible){const a=silkLine.geometry.attributes.position;a.setXYZ(0,B.pos.x,B.pos.y+3.6,B.pos.z);a.setXYZ(1,B.pos.x,WY+.2,B.pos.z);a.needsUpdate=true;}
 const gy=meshH(B.pos.x,B.pos.z);let groundY=B.pos.y>gy+3?WY:null,moving=JG.v.length(),bodyH=2.35;
 if(B.active){B.t+=dt;const toP=_j1.subVectors(hero.position,B.pos);toP.y=0;const dist=toP.length();const dirP=toP.clone().normalize();
  if(B.phase===1){groundY=B.pos.y>gy+3?WY:null;
   if(B.state==='reveal'){// she rises on her web, unfolds, eyes ignite
    jgFace(dt,2);if(B.t<.05)JG.revealT=0;if(B.t>2.2){B.state='idle';B.t=0;}}
   else if(B.state==='idle'||B.state==='move'){// stalk across the web plane between nodes
    if(B.state==='idle'){B.state='move';B.t=0;let n;do{n=(R()*webNodes.length)|0}while(n===B.node);B.node=n;B.target.copy(webNodes[n]);}
    const d=_j2.subVectors(B.target,B.pos);d.y=0;const L=d.length();if(L>.4)jgMove(d.normalize(),5,dt);else JG.v.multiplyScalar(.8);B.pos.y=lerp(B.pos.y,WY,Math.min(1,dt*3));jgFace(dt,3);
    if(L<.6||B.t>2.2){B.moves++;if(B.moves>=2)jgNext1();else B.state='idle';}}
   else if(B.state==='shot'){// web shot: telegraph circle follows Ren, silk glob flies at 0.75 s
    jgFace(dt,6);JG.v.multiplyScalar(.85);if(!B._fired){B._fired=1;B._T=jgTele(hero.position.x,hero.position.z,1.7,.75,{col:0xfff0c0,follow:()=>B.aim});}
    if(B.t<.6)B.aim.lerp(hero.position,Math.min(1,dt*4));
    if(B.t>=.75&&B._fired===1){B._fired=2;const from=B.pos.clone().add(new V3(0,4.2,0));const to=B.aim.clone();to.y=meshH(to.x,to.z);
     jgShoot(from,to,.28,p=>{const r=jgHitPlayer(p.x,p.z,1.8,0,{parry:false});if(r==='hit'||r==='blocked'){P.rooted=1.5;toast('Rooted in silk! (Q to struggle free)');}
      const wp=new THREE.Mesh(new THREE.CircleGeometry(1.6,16),new THREE.MeshBasicMaterial({color:0xf0f4ff,transparent:true,opacity:.5,depthWrite:false}));wp.rotation.x=-Math.PI/2;wp.position.set(p.x,meshH(p.x,p.z)+.12,p.z);scene.add(wp);webPools.push({m:wp,x:p.x,z:p.z,r:1.6,t:4});});}
    if(B.t>1.3)B.endAttack();}
   else if(B.state==='lash'){// two silk lashes from above at the marked spot
    jgFace(dt,6);JG.v.multiplyScalar(.85);if(!B._fired){B._fired=1;jgTele(B.aim.x,B.aim.z,2.4,.55,{});}
    for(const at of[.55,.95]){if(B.t>=at&&B._last<at){whip.visible=true;const a=whip.geometry.attributes.position;a.setXYZ(0,B.pos.x,B.pos.y+4,B.pos.z);a.setXYZ(1,B.aim.x,meshH(B.aim.x,B.aim.z)+.3,B.aim.z);a.needsUpdate=true;noise(.12,4000,.2);jgHitPlayer(B.aim.x,B.aim.z,2.4,18);if(at<.9){B.aim.lerp(hero.position,.6);jgTele(B.aim.x,B.aim.z,2.4,.4,{});}}}
    if(B.t>1.25){whip.visible=false;B.endAttack();}}
   else if(B.state==='drop'){// leap slam down from the canopy
    if(B.t<.85){jgFace(dt,6);JG.v.multiplyScalar(.85);B.aim.lerp(hero.position,dt*1.6);if(!B._fired){B._fired=1;B._T=jgTele(B.aim.x,B.aim.z,3.4,.85,{follow:()=>B.aim});}bodyH=2.35-.8*smooth(0,.85,B.t);}
    else if(B.t<1.25){const k=smooth(.85,1.25,B.t);if(!B._from)B._from=B.pos.clone();B.pos.lerpVectors(B._from,new V3(B.aim.x,meshH(B.aim.x,B.aim.z),B.aim.z),k);B.pos.y+=Math.sin(k*Math.PI)*2.5;groundY=null;}
    if(B.t>=1.25&&B._last<1.25){B._from=null;shake(.45);groundRing(B.pos.clone(),0xffe2a0,4,.45);burst(B.pos.clone().add(new V3(0,.3,0)),0x9a8a7a,24,7,.6);noise(.3,300,.5);jgHitPlayer(B.aim.x,B.aim.z,3.4,22);v5Dust(B.pos.clone(),8,1.6);}
    if(B.t>1.25){groundY=null;B.pos.y=meshH(B.pos.x,B.pos.z);}
    if(B.t>2.9){B.state='rise';B.t=0;B.from.copy(B.pos);B.target.copy(webNodes[B.node]);}}
   else if(B.state==='rise'){// climbs her thread back up
    B.pos.lerpVectors(B.from,B.target,smooth(0,1,B.t/1.1));groundY=WY;if(B.t>1.1){B.pos.copy(B.target);B.endAttack();}}
   else if(B.state==='call'){JG.v.multiplyScalar(.85);if(B.t>.6&&B._last<=.6){spawnSpiderlings();LAIR.sacs.forEach(s=>burst(s.position.clone(),0xfff0c0,6,3,.5));}if(B.t>1.4)B.endAttack();}
   else if(B.state==='retreat'){B.pos.y=lerp(B.pos.y,WY,dt*2);if(B.t>1.5){B.state='idle';B.t=0;}}
   else if(B.state==='falling'){// anchor cut: she drops off the web, legs flailing
    groundY=null;B.pos.y=Math.max(gy,B.pos.y-dt*16);JG.legs.forEach(L=>L.over=L2=>{const w=JGB.localToWorld(_j2.copy(L2.rest).multiplyScalar(.75));w.y=B.pos.y+1.5+Math.sin(time*20+L2.i)*.6;L2.foot.lerp(w,.4);});
    if(B.pos.y<=gy+.01){JG.legs.forEach(L=>{L.over=null;L.init=false;});shake(.35);groundRing(B.pos.clone(),0xffffff,3.5,.4);v5Dust(B.pos.clone(),8,1.4);B.state='stunned';B.t=0;B.stunFor=BAL.stun;}}
   else if(B.state==='stunned'){groundY=null;B.pos.y=gy;bodyH=1.4;if(B.t>(B.stunFor||3)){B.state='rise';B.t=0;B.from.copy(B.pos);B.target.copy(webNodes[B.node]);}}
  }else{// ===== phase 2: on the ground =====
   groundY=null;B.pos.y=lerp(B.pos.y,gy,Math.min(1,dt*10));
   if(B.state==='transform'){JG.v.multiplyScalar(.8);const k=clamp(B.t/2.6,0,1);JG.p2k=k;JG.scale=1+.15*smooth(0,1,k);bodyH=2.35-1.2*Math.sin(k*Math.PI);
    if(!B._tf){B._tf=1;JG.legs.forEach(L=>L.over=L2=>{const w=JGB.localToWorld(_j2.copy(L2.rest).multiplyScalar(.55));w.y=meshH(w.x,w.z)+.2;L2.foot.lerp(w,.15);});}
    if(((B.t*6)|0)!==((B._last*6)|0)){burst(B.pos.clone().add(new V3(rnd(-2,2),3,rnd(-2,2))),0xffc040,6,4,.6);}
    if(B.t>=2.6&&B._last<2.6){JG.legs.forEach(L=>{L.over=null;});shake(.6);groundRing(B.pos.clone(),0xffc040,9,.6);bellRing(B.pos.clone(),2);noise(.5,200,.6);tone(80,1.2,'sawtooth',.12,.5);}
    if(B.t>3.1){B.state='stalk';B.t=0;JG.attacks=0;}}
   else if(B.state==='stalk'||B.state==='land'||B.state==='skitter'){// circle and close in with staccato bursts
    if(B.state!=='stalk'){B.state='stalk';B.t=0;}jgFace(dt,6);const tang=new V3(-dirP.z,0,dirP.x).multiplyScalar(Math.sin(B.t*.9+1)>0?1:-1);const want=dist>7?dirP.clone().add(tang.multiplyScalar(.5)):dist<4.5?dirP.clone().multiplyScalar(-.6).add(tang):tang;
    const burstK=(B.t%.5)<.3?1:.25;jgMove(want.normalize(),9*burstK,dt);B.burst=burstK>.5;if(B.t>rnd(1.4,1.6)+(JG.attacks===0?.6:0))jgNext2();}
   else if(B.state==='combo'){// leg-strike combo: L stab, R stab, both-legs overhead (3rd parryable, gold flash)
    jgFace(dt,B.t<.3?6:2);JG.v.multiplyScalar(.85);const hits=[.55,1.0,1.6],front=[JG.legs[0],JG.legs[4]];
    if(!B._fired){B._fired=1;B._marks=[0,0,0];}
    for(let i=0;i<3;i++){const tTel=hits[i]-(i===2?.55:.4);if(B.t>=tTel&&!B._marks[i]){B._marks[i]=1;const ap=hero.position.clone();B['_a'+i]=ap;jgTele(ap.x,ap.z,i===2?2.4:1.5,hits[i]-tTel,{col:i===2?0xffc040:0xff3a2a});if(i===2){toast('Parry the third strike! (F)');burst(B.pos.clone().add(new V3(0,5,0)),0xffd36e,10,3,.4);}}
     if(B.t>=hits[i]&&B._last<hits[i]){const ap=B['_a'+i];const r=jgHitPlayer(ap.x,ap.z,i===2?2.4:1.5,i===2?20:12,{parry:i===2});noise(.08,2000,.2);if(i===2){shake(.3);groundRing(ap.clone(),0xffe2a0,2.4,.35);}
      if(r==='parried'&&i===2){B.state='stunned';B.t=0;B.stunFor=2.4;break;}}}
    // animate the striking legs: raise, then stab into the marked spot
    front.forEach((L,j)=>{const idx=j===0?0:1;L.over=L2=>{const ap=B['_a'+idx]||B['_a2'];const hipW=JGB.localToWorld(_j2.copy(L2.hip));const tH=hits[idx],tH3=hits[2];let target=null;
      for(const[t0,th,a]of[[tH-.4,tH,B['_a'+idx]],[tH3-.55,tH3,B._a2]]){if(!a)continue;if(B.t>=t0&&B.t<th+.25){const k=clamp((B.t-t0)/(th-t0),0,1);const up=hipW.clone().add(new V3(0,3.2*JG.scale,0)).addScaledVector(dirP,1.2);const down=new V3(a.x,meshH(a.x,a.z),a.z);target=k<1?up.lerp(down,Math.pow(k,6)):down;}}
      if(target)L2.foot.lerp(target,.5);};});
    if(B.t>2.2){front.forEach(L=>L.over=null);B.state='stalk';B.t=0;}}
   else if(B.state==='webshot'){jgFace(dt,6);JG.v.multiplyScalar(.85);if(!B._fired){B._fired=1;jgTele(hero.position.x,hero.position.z,1.8,.7,{col:0xfff0c0,follow:()=>B.aim});}if(B.t<.55)B.aim.lerp(hero.position,Math.min(1,dt*5));
    if(B.t>=.7&&B._fired===1){B._fired=2;const from=B.pos.clone().add(new V3(0,4.6*JG.scale,0)).addScaledVector(dirP,.8);const to=B.aim.clone();to.y=meshH(to.x,to.z);
     jgShoot(from,to,.25,p=>{const r=jgHitPlayer(p.x,p.z,1.8,6,{parry:false});if(r==='hit'){P.rooted=1.3;toast('Rooted in silk! (Q to struggle free)');}const wp=new THREE.Mesh(new THREE.CircleGeometry(2.2,16),new THREE.MeshBasicMaterial({color:0xf0f4ff,transparent:true,opacity:.5,depthWrite:false}));wp.rotation.x=-Math.PI/2;wp.position.set(p.x,meshH(p.x,p.z)+.12,p.z);scene.add(wp);webPools.push({m:wp,x:p.x,z:p.z,r:2.2,t:5});});}
    if(B.t>1.3){B.state='stalk';B.t=0;}}
   else if(B.state==='pull'){// web pull: aim line 0.65 s, silk snaps out; if it lands, Ren is dragged in, then a stab
    jgFace(dt,B.t<.5?6:1);JG.v.multiplyScalar(.85);const yaw=bossG.rotation.y;
    if(!B._fired){B._fired=1;jgTele(B.pos.x,B.pos.z,0,.65,{line:true,yaw,len:Math.min(18,dist+2),w:1.4,col:0xfff0c0});}
    if(B.t>=.65&&B._fired===1){B._fired=2;const fwd=new V3(Math.sin(yaw),0,Math.cos(yaw));const rel=_j2.subVectors(hero.position,B.pos);const along=rel.dot(fwd),side=Math.abs(rel.x*fwd.z-rel.z*fwd.x);
     const hand=B.pos.clone().add(new V3(0,4.4*JG.scale,0));const tip=along>0&&along<18&&side<1.4?hero.position.clone().add(new V3(0,1,0)):hand.clone().addScaledVector(fwd,16);
     jgShoot(hand,tip,.12,()=>{});const r=along>0&&along<18&&side<1.4?playerHit(4,B,{parry:false}):'miss';if(r==='hit'){B._pull=1;toast('Silk snares you — dodge as she strikes!');}else B._pull=0;}
    if(B._pull&&B.t<1.3){const d=_j2.subVectors(B.pos,hero.position);d.y=0;const L=d.length();if(L>3.4){d.normalize();hero.position.addScaledVector(d,Math.min(L-3.4,14*dt));hero.position.y=Math.max(hero.position.y,H(hero.position.x,hero.position.z));}
     whip.visible=true;const a=whip.geometry.attributes.position;a.setXYZ(0,B.pos.x,B.pos.y+4.4*JG.scale,B.pos.z);a.setXYZ(1,hero.position.x,hero.position.y+1,hero.position.z);a.needsUpdate=true;}else whip.visible=false;
    if(B._pull&&B.t>=1.3&&!B._st){B._st=1;B._a0=hero.position.clone();jgTele(B._a0.x,B._a0.z,1.6,.45,{});}
    if(B._st===1&&B.t>=1.75){B._st=2;jgHitPlayer(B._a0.x,B._a0.z,1.6,16);noise(.1,2000,.25);}
    if(B.t>2.2){B._st=0;B._pull=0;whip.visible=false;B.state='stalk';B.t=0;}}
   else if(B.state==='leap'){// crouch 0.75 s (circle tracks Ren), jump arc, crushing landing with web burst; then 1 s opening
    if(B.t<.75){jgFace(dt,6);JG.v.multiplyScalar(.8);B.aim.lerp(hero.position,dt*2.2);if(!B._fired){B._fired=1;jgTele(B.aim.x,B.aim.z,4,.75+.55,{follow:()=>B.aim});}bodyH=2.35-1.1*smooth(0,.75,B.t);}
    else if(B.t<1.3){if(!B._from){B._from=B.pos.clone();B._to=new V3(B.aim.x,0,B.aim.z);}const k=smooth(.75,1.3,B.t);B.pos.x=lerp(B._from.x,B._to.x,k);B.pos.z=lerp(B._from.z,B._to.z,k);B.pos.y=meshH(B.pos.x,B.pos.z)+Math.sin(k*Math.PI)*7;
     JG.legs.forEach(L=>L.over=L2=>{const w=JGB.localToWorld(_j2.copy(L2.rest).multiplyScalar(.6));w.y-=1.2;L2.foot.lerp(w,.5);});}
    if(B.t>=1.3&&B._last<1.3){B._from=null;JG.legs.forEach(L=>{L.over=null;L.init=false;});shake(.6);groundRing(B.pos.clone(),0xffe2a0,4.5,.5);v5Dust(B.pos.clone(),10,1.8);noise(.35,250,.6);jgHitPlayer(B.pos.x,B.pos.z,4,25);
     const wp=new THREE.Mesh(new THREE.RingGeometry(1.5,6,24),new THREE.MeshBasicMaterial({color:0xf0f4ff,transparent:true,opacity:.5,depthWrite:false,side:THREE.DoubleSide}));wp.rotation.x=-Math.PI/2;wp.position.set(B.pos.x,meshH(B.pos.x,B.pos.z)+.12,B.pos.z);scene.add(wp);webPools.push({m:wp,x:B.pos.x,z:B.pos.z,r:6,t:5});}
    if(B.t>1.3&&B.t<2.3)bodyH=1.6;if(B.t>2.4){B.state='stalk';B.t=0;}}
   else if(B.state==='summon'){JG.v.multiplyScalar(.85);if(B.t>.7&&B._last<=.7){spawnSpiderlings();toast('Spiderlings pour from her abdomen!');burst(B.pos.clone().add(new V3(0,2.5,-3)),0xffc040,14,4,.6);}if(B.t>1.6){B.state='stalk';B.t=0;}}
   else if(B.state==='recoverP2'){JG.v.multiplyScalar(.8);bodyH=1.7+Math.sin(B.t*6)*.1;if(B.t>BAL.recover){B.state='stalk';B.t=0;}}
   else if(B.state==='stunned'){JG.v.multiplyScalar(.8);bodyH=1.25;JG.legs.forEach(L=>{if(!L.over)return;L.over=null;});if(B.t>(B.stunFor||2)){B.state='stalk';B.t=0;}}
   else if(B.state==='charge'||B.state==='ring'){B.state='stalk';B.t=0;}
   B.pos.x=clamp(B.pos.x,ARENA.x-20,ARENA.x+20);B.pos.z=clamp(B.pos.z,ARENA.z-20,ARENA.z+20);}
  B._last=B.t;}
 // body height + tilt from the feet
 JG.bodyY=lerp(JG.bodyY||bodyH,bodyH,Math.min(1,dt*8));JGB.position.y=JG.bodyY*JG.scale+Math.sin(time*2.2)*.06;JGR.scale.setScalar(1);
 JGB.scale.setScalar(JG.scale);JGB.rotation.x=lerp(JGB.rotation.x,clamp(-JG.v.length()*.012,-.15,.1)+(boss.state==='leap'&&boss.t<.75?.15:0),Math.min(1,dt*6));
 jgLegs(dt,groundY,moving);jgIK();jgPose(dt,time);}
function jgDeath(dt,time){const B=boss,t=B.t;// legs curl inward, she reaches up, then unravels into gold silk
 bossG.visible=true;JG.legs.forEach(L=>{L.over=null;const w=JGB.localToWorld(_j2.copy(L.rest).multiplyScalar(.35));w.y=meshH(w.x,w.z)+1.2*smooth(.3,1.4,t);L.foot.lerp(w,Math.min(1,dt*3));});
 JG.bodyY=lerp(JG.bodyY,.9,Math.min(1,dt*2));JGB.position.y=JG.bodyY;JGW.rotation.x=lerp(JGW.rotation.x,-.6,dt*2);JG.sleeves.forEach(s=>{s.sh.rotation.x=lerp(s.sh.rotation.x,-2.7,dt*3);});
 jgIK();if(t>1.6&&R()<.7){const p=B.pos.clone().add(new V3(rnd(-2,2),rnd(.5,4),rnd(-2,2)));burst(p,R()<.5?0xffd36e:0xffffff,1,2,1.6,1,-3);}
 const k=smooth(2.2,4,t);bossG.scale.setScalar(Math.max(.01,1-k));JGM.gold.emissiveIntensity=1+k*3;
 silkLine.visible=false;if(shardMesh.visible){const gy=H(shardMesh.position.x,shardMesh.position.z)+1.4;shardMesh.position.y=Math.max(gy,shardMesh.position.y-dt*2.2);shardMesh.rotation.y+=dt*2;
  if(Math.hypot(shardMesh.position.x-hero.position.x,shardMesh.position.z-hero.position.z)<3.2&&shardMesh.position.y<gy+3)claimShard();}}
{const r0=boss.reset.bind(boss);boss.reset=function(){r0();JG.p2k=0;JG.scale=1;JG.attacks=0;JG.v.set(0,0,0);JG.legs.forEach(L=>{L.over=null;L.init=false;});bossG.scale.setScalar(1);bossG.visible=true;this.radius=2.2;this.pos.y=webNodes[0].y;JG.tele.forEach(t=>t.m.visible=false);};
 const t2=boss.toPhase2.bind(boss);boss.toPhase2=function(){t2();this.state='transform';this.t=0;this._tf=0;this.from.copy(this.pos);JG.attacks=0;JG.legs.forEach(L=>{L.over=null;L.init=false;});};
 const dm=boss.damage.bind(boss);boss.damage=function(d,dir,heavy,crit,fire){if(this.state==='transform'||this.state==='reveal')return;return dm(d,dir,heavy,crit,fire);};
 boss.low=function(){return this.pos.y-meshH(this.pos.x,this.pos.z)<3.6;};boss.radius=2.2;}
/* ---- v0.5 aggregator: per-frame + late init ---- */
function v5Update(dt,raw){try{shardBeacon.visible=!(boss.active&&boss.alive);v5EnvUpdate(raw);v5WaterFx(dt);v5VillageFx(dt);if(!SEC.on&&V03.anim)v5SecInit();v5SecUpdate(dt);v5FootUpdate(dt);v5HitFxUpdate(raw);v5PatchGhosts();v5GhostY();
 if(V03.sockR&&weaponPivot.parent===V03.sockR&&weaponPivot.rotation.x===0)v5FixWeapons();}catch(e){if(!V5._uErr){V5._uErr=1;console.warn('[kanemori] v5 update',e);}}}
function v5Late(){v5RebuildVillage();v5HudCss();v5QualityUI();v5PaintMapImg();v5PatchMap();v5ApplyQ();boss.reset();
 Object.assign(window.KM,{photo:(p,t)=>{V5.photo=p?{p:new V3(...p),t:new V3(...t)}:null;},trees,V5,setQuality,meshH,JG,LAIR,GRASS,SEC,FOOT,HFX,WATER5,QCFG,v5Ripple});try{const t0=performance.now();renderer.compile(scene,camera);V5.compileMs=Math.round(performance.now()-t0);}catch(e){}
 console.log('[kanemori] v0.5 ready · quality',V5.q,V5.auto?'(auto)':'');}

/* photo camera for showcase shots (KM.photo) */
{const _uc=updCamera;updCamera=function(dt){_uc(dt);if(V5.photo){camera.position.copy(V5.photo.p);camera.lookAt(V5.photo.t);}};}
