/* =====================================================================
   v0.5 SECTION: GHIBLI LOOK II. Water (flowing normal ripples, sky/fresnel
   reflection, sun glint, bank + falls foam, spray), swim/horse splashes and
   ripple rings. Kanemura rebuilt as Japanese minka (curved kawara roofs,
   engawa, shoji, noren), chōchin lanterns + glowing torii/shrine at night,
   chimney smoke, villager idle routines (sweep, carry, chat, sit).
   ===================================================================== */
const WATER5=(()=>{const u={uT:{value:0},uNorm:{value:TEX4.normal},uSkyT:skyU.top,uSkyM:skyU.mid,uSkyB:skyU.bot,uSun:V5U.uSun,uSunC:V5U.uSunC,uDay:V5U.uDay,uQ:{value:2},uFalls:{value:new V3(RIVX(FALL_Z),0,FALL_Z)}};
 const mat=new THREE.ShaderMaterial({uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{}]),transparent:true,depthWrite:false,fog:true,side:THREE.DoubleSide,
  vertexShader:`#include <common>
#include <fog_pars_vertex>
varying vec3 vWP;varying vec2 vUv2;attribute vec2 aFlow;varying vec2 vFlow;
void main(){vec4 wp=modelMatrix*vec4(position,1.);vWP=wp.xyz;vFlow=aFlow;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`,
  fragmentShader:`#include <common>
#include <fog_pars_fragment>
uniform float uT,uDay,uQ;uniform sampler2D uNorm;uniform vec3 uSkyT,uSkyM,uSkyB,uSun,uSunC,uFalls;varying vec3 vWP;varying vec2 vFlow;
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float rivx(float z){return 72.+16.*sin(z*.017)+7.*sin(z*.05+1.);}
void main(){vec2 fl=vFlow;vec2 p=vWP.xz;
 vec3 n1=texture2D(uNorm,p*.11-fl*uT*.35).xyz*2.-1.,n2=texture2D(uNorm,p*.23+vec2(.37,.11)-fl*uT*.6).xyz*2.-1.,n3=texture2D(uNorm,p*.045+vec2(.7)-fl*uT*.12).xyz*2.-1.;
 vec3 nn=normalize(vec3((n1.xy+n2.xy*.7+n3.xy*.8)*(uQ>0.?1.:.5)*.55,1.)).xzy;
 vec3 V=normalize(cameraPosition-vWP);float fr=pow(1.-max(dot(nn,V),0.),3.)*.85+.12;
 vec3 Rr=reflect(-V,nn);float ry=Rr.y;vec3 sky=ry>0.04?mix(uSkyM,uSkyT,smoothstep(.04,.55,ry)):mix(uSkyB,uSkyM,smoothstep(-.1,.04,ry));
 // edge / foam masks
 float dRiv=abs(p.x-rivx(p.y))/6.5,dPool=length(p-vec2(66.,-104.))/9.,edge=vWP.y>-50.?min(p.y<178.?dRiv:9.,dPool):9.;
 float dF=length(p-uFalls.xz*vec2(1.,1.));float fallsK=1.-smoothstep(3.,14.,dF);
 vec3 deep=mix(vec3(.04,.18,.26),vec3(.06,.3,.36),uDay),shal=mix(vec3(.08,.3,.32),vec3(.22,.62,.58),uDay);
 vec3 col=mix(deep,shal,smoothstep(.45,1.,edge)*.8+.15);col=mix(col,sky*(.65+.35*uDay),fr);
 float sp=pow(max(dot(Rr,uSun),0.),uQ>1.?160.:90.);col+=uSunC*sp*(1.2+2.*uDay)*(1.-fallsK*.9);
 float fn=vn(p*1.6-fl*uT*1.4)*.6+vn(p*4.-fl*uT*2.3)*.4;
 float foam=smoothstep(.9,1.02,edge+fn*.12)*.6+fallsK*smoothstep(.45,.85,fn+fallsK*.2)*.75;
 foam+=smoothstep(.72,.95,fn)*.1*(uQ>0.?1.:0.);
 col=mix(col,vec3(.84,.9,.93)*(.55+.4*uDay),clamp(foam,0.,1.));col=min(col,vec3(.92));col=mix(col,col*.8,fallsK*.5);
 float a=mix(.78,.94,fr)*(1.-smoothstep(.97,1.06,edge)*.35);
 gl_FragColor=vec4(col,max(a,foam*.95));
#include <fog_fragment>
}`});
 Object.assign(mat.uniforms,u);
 // river ribbon rebuilt: 6 columns across, flow direction attribute
 const pos=[],idx=[],flow=[];const C=6;let n=0;for(let z=-170;z<=182;z+=2){const x=RIVX(z),y=riverY(z);const dx=RIVX(z+1)-RIVX(z-1),fl=new THREE.Vector2(dx,2).normalize();
  for(let c=0;c<=C;c++){pos.push(x-6.5+13*c/C,y,z);flow.push(fl.x,fl.y);}if(n>0)for(let c=0;c<C;c++){const a=(n-1)*(C+1)+c,b=n*(C+1)+c;idx.push(a,a+1,b,a+1,b+1,b);}n++;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aFlow',new THREE.Float32BufferAttribute(flow,2));g.setIndex(idx);
 river.geometry.dispose();river.geometry=g;river.material=mat;river.renderOrder=1;
 const pg=new THREE.CircleGeometry(9,40);const pf=[];for(let i=0;i<pg.attributes.position.count;i++){const x=pg.attributes.position.getX(i),y=pg.attributes.position.getY(i);const l=Math.hypot(x,y)||1;pf.push(-y/l*.3,x/l*.3+.2);}pg.setAttribute('aFlow',new THREE.Float32BufferAttribute(pf,2));
 pool.geometry=pg;pool.material=mat;pool.renderOrder=1;
 // waterfall: streaming streaks, bright lip and boiling foam at the base
 const fm=new THREE.ShaderMaterial({uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uT:{value:0},uDay:{value:1}}]),transparent:true,depthWrite:false,side:THREE.DoubleSide,fog:true,
  vertexShader:`#include <common>
#include <fog_pars_vertex>
varying vec2 vUv;void main(){vUv=uv;vec4 mvPosition=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`,
  fragmentShader:`#include <common>
#include <fog_pars_fragment>
uniform float uT,uDay;varying vec2 vUv;float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
void main(){vec2 uv=vUv;float s=vn(vec2(uv.x*26.,uv.y*3.+uT*4.2))*.6+vn(vec2(uv.x*60.,uv.y*6.+uT*6.5))*.4;
 vec3 c=mix(vec3(.18,.45,.55),vec3(.85,.95,1.),smoothstep(.35,.85,s));float lip=smoothstep(.9,1.,uv.y);float base=1.-smoothstep(0.,.22,uv.y);
 c=mix(c,vec3(1.),max(lip*.7,base*smoothstep(.2,.7,vn(uv*vec2(14.,4.)+vec2(0.,uT*1.5)))));c*=(.55+.45*uDay)*.7;
 float a=(.72+.25*s)*smoothstep(0.,.08,uv.x)*smoothstep(1.,.92,uv.x);gl_FragColor=vec4(c,a);
#include <fog_fragment>
}`});
 falls.material=fm;
 // spray at the base of the falls (GPU points)
 const N=260,b=new Float32Array(N*3),sd=new Float32Array(N*2);for(let i=0;i<N;i++){b[i*3]=RIVX(FALL_Z)+rnd(-6,6);b[i*3+1]=riverY(-112)-1.5;b[i*3+2]=FALL_Z+rnd(1,5);sd[i*2]=R()*10;sd[i*2+1]=rnd(.6,1.4);}
 const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(b,3));sg.setAttribute('aS',new THREE.BufferAttribute(sd,2));
 const sm=new THREE.ShaderMaterial({uniforms:{uT:u.uT,uDay:V5U.uDay,uScale:{value:500}},transparent:true,depthWrite:false,
  vertexShader:`uniform float uT,uScale;attribute vec2 aS;varying float vA;void main(){float t=fract(uT*.35*aS.y+aS.x);vec3 p=position+vec3(sin(aS.x*7.)*t*2.,t*t*-1.+t*5.*aS.y,t*3.*aS.y);vA=(1.-t)*smoothstep(0.,.1,t);vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=clamp(uScale*.7*(1.+t*1.5)/max(-mv.z,.1),2.,50.);gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`uniform float uDay;varying float vA;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;gl_FragColor=vec4(vec3(.92,.97,1.)*(.5+.5*uDay),vA*pow(1.-d,1.6)*.16);}`});
 const spray=new THREE.Points(sg,sm);spray.frustumCulled=false;scene.add(spray);
 return{u,mat,fm,spray,sm};})();
/* ---- ripple rings + splashes (Ren wading / swimming, horse crossings, things falling in) ---- */
const RIP={pool:[],t:0,ht:0};{const m0=new THREE.ShaderMaterial({uniforms:{uK:{value:0},uA:{value:1}},transparent:true,depthWrite:false,
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform float uK,uA;varying vec2 vUv;void main(){float r=length(vUv-.5)*2.;float ring=smoothstep(.12,0.,abs(r-uK))*(1.-uK);float ring2=smoothstep(.08,0.,abs(r-uK*.6))*(1.-uK)*.5;gl_FragColor=vec4(vec3(.95,.98,1.),(ring+ring2)*uA*.8);}`});
 const geo=new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2);for(let i=0;i<14;i++){const m=new THREE.Mesh(geo,m0.clone());m.visible=false;m.renderOrder=2;scene.add(m);RIP.pool.push({m,t:1,life:1,s:1});}}
function v5Ripple(x,z,y,size=2.4,life=1.2){const r=RIP.pool.find(o=>!o.m.visible)||RIP.pool[(RIP.i=(RIP.i||0)+1)%RIP.pool.length];r.m.position.set(x,y+.03,z);r.t=0;r.life=life;r.s=size;r.m.visible=true;}
function v5WaterY(x,z){if(Math.hypot(x-66,z+104)<9)return pool.position.y;return riverY(z);}
function v5WaterFx(dt){const p=hero.position;RIP.t-=dt;const spd=Math.hypot(P.vel.x,P.vel.z);
 const inW=(P.inWater||P.swim)&&inWater(p.x,p.z);
 if(inW&&(spd>.6||P.swim)&&RIP.t<=0){RIP.t=P.swim?.32:.22;const wy=v5WaterY(p.x,p.z);v5Ripple(p.x+rnd(-.2,.2),p.z+rnd(-.2,.2),wy,P.swim?3.2:(RIDE.on?4:2.4),1.3);
  if(spd>3)burst(new V3(p.x,wy+.15,p.z),0xe8f6ff,RIDE.on?8:4,3.5,.45,1,9);}
 if(inW&&!RIP.was){const wy=v5WaterY(p.x,p.z);burst(new V3(p.x,wy+.2,p.z),0xffffff,P.vy<-4?26:12,P.vy<-4?7:4,.6,1.2,10);v5Ripple(p.x,p.z,wy,5,1.6);try{noise(.25,1600,.18)}catch(e){}}
 RIP.was=inW;
 for(const r of RIP.pool){if(!r.m.visible)continue;r.t+=dt;const k=r.t/r.life;if(k>=1){r.m.visible=false;continue;}r.m.scale.setScalar(r.s*(.4+k*.9));r.m.material.uniforms.uK.value=k;}
 WATER5.u.uT.value+=dt;WATER5.fm.uniforms.uT.value+=dt;WATER5.fm.uniforms.uDay.value=.35+.65*V5U.uDay.value;WATER5.sm.uniforms.uScale.value=renderer.domElement.height*.8;}

/* ---- Japanese buildings ---- */
const BLDTEX=(()=>{
 const wall=canvasTex(256,256,(c,w,h)=>{c.fillStyle='#efe4cb';c.fillRect(0,0,w,h);for(let i=0;i<400;i++){c.fillStyle=`rgba(${180+R()*40|0},${160+R()*40|0},${120+R()*30|0},.12)`;c.fillRect(R()*w,R()*h,R()*20,R()*6);}
  c.fillStyle='#5a3a24';c.fillRect(0,h*.6,w,h*.4);for(let x=0;x<w;x+=16){c.fillStyle=x/16%2?'#4e321f':'#61412a';c.fillRect(x,h*.6,15,h*.4);}// lower board wall
  c.fillStyle='#3a2416';c.fillRect(0,0,w,10);c.fillRect(0,h*.58,w,10);c.fillRect(0,h-8,w,8);c.fillRect(0,0,10,h);c.fillRect(w-10,0,10,h);c.fillRect(w/2-5,0,10,h);});
 const shoji=canvasTex(128,128,(c,w,h)=>{c.fillStyle='#fbf3dc';c.fillRect(0,0,w,h);c.strokeStyle='#4a2e1c';c.lineWidth=3;for(let x=0;x<=w;x+=w/4){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}for(let y=0;y<=h;y+=h/5){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}c.lineWidth=7;c.strokeRect(0,0,w,h);});
 const tile=canvasTex(256,256,(c,w,h)=>{c.fillStyle='#3d4458';c.fillRect(0,0,w,h);const cw=w/8;for(let x=0;x<w;x+=cw){const g=c.createLinearGradient(x,0,x+cw,0);g.addColorStop(0,'#262b3a');g.addColorStop(.35,'#5a6378');g.addColorStop(.55,'#6c7590');g.addColorStop(1,'#2a3040');c.fillStyle=g;c.fillRect(x,0,cw,h);}
  for(let y=0;y<h;y+=h/6){c.fillStyle='rgba(15,18,28,.55)';c.fillRect(0,y,w,3);c.fillStyle='rgba(255,255,255,.08)';c.fillRect(0,y+3,w,2);}
  for(let i=0;i<60;i++){c.fillStyle=`rgba(${90+R()*60|0},${110+R()*40|0},${70+R()*30|0},${.12+R()*.15})`;c.fillRect(R()*w,R()*h,R()*18,R()*6);}});
 tile.wrapS=tile.wrapT=THREE.RepeatWrapping;
 const noren=canvasTex(128,64,(c,w,h)=>{c.fillStyle='#22345e';c.fillRect(0,0,w,h);c.fillStyle='#f4ead2';c.beginPath();c.arc(w/2,h*.45,12,0,TAU);c.fill();c.fillStyle='#22345e';c.beginPath();c.arc(w/2,h*.45,7,0,TAU);c.fill();c.fillStyle='#0c1630';for(let x=w/4;x<w;x+=w/4)c.fillRect(x-1,h*.25,2,h);});
 return{wall,shoji,tile,noren};})();
const BMAT={wall:new THREE.MeshLambertMaterial({map:BLDTEX.wall}),wood:new THREE.MeshLambertMaterial({color:0x4a2e1c}),woodL:new THREE.MeshLambertMaterial({color:0x8a6440}),stone:new THREE.MeshLambertMaterial({color:0x8e8a82}),
 tile:new THREE.MeshLambertMaterial({map:BLDTEX.tile,side:THREE.DoubleSide}),ridge:new THREE.MeshLambertMaterial({color:0x2a2f3e}),
 shoji:new THREE.MeshLambertMaterial({map:BLDTEX.shoji,emissive:0xffb060,emissiveMap:BLDTEX.shoji,emissiveIntensity:.1}),
 noren:new THREE.MeshLambertMaterial({map:BLDTEX.noren,side:THREE.DoubleSide}),lantern:new THREE.MeshLambertMaterial({color:0xd8402c,emissive:0xff6a30,emissiveIntensity:.2}),
 lanternW:new THREE.MeshLambertMaterial({color:0xf6ecd0,emissive:0xffc070,emissiveIntensity:.2})};
// curved kawara roof (gabled, concave slopes, upturned eave corners), along local X, ridge at y=0
function v5Roof(len,span,drop,lift){const pos=[],uv=[],idx=[];const NS=8,NL=16;let base=0;
 for(const side of[-1,1]){for(let i=0;i<=NS;i++){const s=i/NS;for(let j=0;j<=NL;j++){const t=j/NL,x=(t-.5)*len,cx=Math.abs(t-.5)*2;
   const y=-Math.pow(s,1.45)*drop+Math.pow(cx,4)*Math.pow(s,2)*lift;const z=side*s*span*(1+Math.pow(cx,4)*.06);pos.push(x+Math.sign(x)*Math.pow(cx,6)*s*.25,y,z);uv.push(t*len/1.4,s*span/1.2);}}
  for(let i=0;i<NS;i++)for(let j=0;j<NL;j++){const a=base+i*(NL+1)+j,b=a+NL+1;if(side>0)idx.push(a,b,a+1,a+1,b,b+1);else idx.push(a,a+1,b,a+1,b+1,b);}base+=(NS+1)*(NL+1);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
const LANT=[];// {m,halo,x,y,z}
const HALO_TEX=canvasTex(64,64,(c)=>{const g=c.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,220,160,1)');g.addColorStop(.3,'rgba(255,170,90,.45)');g.addColorStop(1,'rgba(255,140,60,0)');c.fillStyle=g;c.fillRect(0,0,64,64);});
function v5Halo(parent,x,y,z,s=1.6,col=0xffb070){const h=new THREE.Sprite(new THREE.SpriteMaterial({map:HALO_TEX,color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0,fog:true}));h.position.set(x,y,z);h.scale.setScalar(s);parent.add(h);return h;}
function v5Chochin(parent,x,y,z,white){const g=new THREE.Group();g.position.set(x,y,z);const body=new THREE.Mesh(new THREE.SphereGeometry(.22,12,8),white?BMAT.lanternW:BMAT.lantern);body.scale.y=1.3;g.add(body);
 for(const sy of[-.27,.27]){const cap=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.05,10),BMAT.wood);cap.position.y=sy;g.add(cap);}const str=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.4,3),BMAT.wood);str.position.y=.48;g.add(str);
 parent.add(g);const halo=v5Halo(g,0,0,0,1.5,white?0xffd090:0xff8050);LANT.push({g,halo,ph:R()*10});return g;}
const SMOKE_SRC=[];
function v5Minka(x,z,rot,w,d,opt={}){const g=new THREE.Group(),y=meshH(x,z);g.position.set(x,y,z);g.rotation.y=rot;const wh=2.5,fh=.55;
 const add=(geo,mat,px,py,pz,sh=true)=>{const m=new THREE.Mesh(geo,mat);m.position.set(px,py,pz);m.castShadow=sh;m.receiveShadow=true;g.add(m);return m;};
 add(new THREE.BoxGeometry(w+.5,fh+.6,d+.5),BMAT.stone,0,(fh-.6)/2,0);// stone base sunk into the slope
 const walls=add(new THREE.BoxGeometry(w,wh,d),BMAT.wall,0,fh+wh/2,0);
 // posts
 for(const px of[-w/2,0,w/2])for(const pz of[-d/2,d/2])add(new THREE.BoxGeometry(.2,wh+.1,.2),BMAT.wood,px,fh+wh/2,pz);
 // shoji front panels + side windows (glow at night)
 add(new THREE.PlaneGeometry(w*.62,wh*.62),BMAT.shoji,0,fh+wh*.42,d/2+.02,false);
 for(const sx of[-1,1]){const p=add(new THREE.PlaneGeometry(d*.4,wh*.32),BMAT.shoji,sx*(w/2+.02),fh+wh*.58,0,false);p.rotation.y=sx*Math.PI/2;}
 // engawa veranda + steps
 add(new THREE.BoxGeometry(w+.6,.12,1.25),BMAT.woodL,0,fh,d/2+.62);for(const px of[-w/2-.2,w/2+.2])add(new THREE.BoxGeometry(.14,fh,.14),BMAT.wood,px,fh/2,d/2+1.15);
 add(new THREE.BoxGeometry(1.1,.22,.5),BMAT.stone,w*.2,.1,d/2+1.5);
 // noren over the door
 const nr=add(new THREE.PlaneGeometry(1.3,.6),BMAT.noren,w*.2,fh+wh-.45,d/2+.06,false);nr.userData.noren=1;
 // roof
 const span=d/2+1.0,drop=Math.min(2.2,span*.62),lift=.55;const roof=add(v5Roof(w+2.0,span,drop,lift),BMAT.tile,0,fh+wh+drop+.05,0);
 add(new THREE.BoxGeometry(w+2.1,.26,.34),BMAT.ridge,0,fh+wh+drop+.12,0);
 for(const sx of[-1,1]){const oni=add(new THREE.BoxGeometry(.2,.55,.5),BMAT.ridge,sx*(w/2+1.05),fh+wh+drop+.3,0);oni.rotation.z=sx*-.2;}
 // gable triangles
 {const tg=new THREE.BufferGeometry();const hw=d/2;tg.setAttribute('position',new THREE.Float32BufferAttribute([0,0,-hw, 0,0,hw, 0,drop*.92,0],3));tg.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,.5,.5],2));tg.computeVertexNormals();
  for(const sx of[-1,1]){const m=add(tg,new THREE.MeshLambertMaterial({color:0xe8dcc0,side:THREE.DoubleSide}),sx*(w/2-.02),fh+wh,0,false);}}
 // lanterns at the eaves
 v5Chochin(g,-w/2-.2,fh+wh-.15,d/2+1.0,!!opt.white);if(w>5.5)v5Chochin(g,w/2+.2,fh+wh-.15,d/2+1.0,!opt.white);
 if(opt.smoke!==false){const sp=new V3(-w*.25,fh+wh+drop+.4,-d*.15);g.updateMatrixWorld(true);SMOKE_SRC.push(g.localToWorld(sp.clone()));}
 scene.add(g);return g;}
/* ---- chimney / hearth smoke (GPU points rising and leaning with the wind) ---- */
let SMOKE=null;
function v5BuildSmoke(){const per=34,src=SMOKE_SRC.slice(0,12);const N=src.length*per;if(!N)return;const b=new Float32Array(N*3),sd=new Float32Array(N*2);
 src.forEach((p,k)=>{for(let i=0;i<per;i++){const o=(k*per+i);b[o*3]=p.x;b[o*3+1]=p.y;b[o*3+2]=p.z;sd[o*2]=i/per+R()*.02;sd[o*2+1]=R();}});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(b,3));g.setAttribute('aS',new THREE.BufferAttribute(sd,2));
 const m=new THREE.ShaderMaterial({uniforms:{uT:V5U.uT,uWind:V5U.uWind,uWindDir:V5U.uWindDir,uDay:V5U.uDay,uScale:{value:500}},transparent:true,depthWrite:false,
  vertexShader:`uniform float uT,uWind,uScale;uniform vec2 uWindDir;attribute vec2 aS;varying float vA;varying float vT;void main(){float t=fract(uT*.07+aS.x);vT=t;
   vec3 p=position+vec3(uWindDir.x*t*t*7.*(.5+uWind)+sin(t*6.+aS.y*9.)*.4,t*7.,uWindDir.y*t*t*7.*(.5+uWind)+cos(t*5.+aS.y*7.)*.4);
   vA=smoothstep(0.,.12,t)*(1.-t);vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=clamp(uScale*(.5+t*2.4)/max(-mv.z,.1),2.,160.);gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`uniform float uDay;varying float vA;varying float vT;void main(){vec2 q=gl_PointCoord-.5;float d=length(q)*2.;if(d>1.)discard;vec3 c=mix(vec3(.55,.58,.68),vec3(.9,.88,.86),uDay);gl_FragColor=vec4(c,vA*pow(1.-d,1.5)*.28);}`});
 SMOKE=new THREE.Points(g,m);SMOKE.frustumCulled=false;SMOKE.renderOrder=2;scene.add(SMOKE);}
function v5RebuildVillage(){try{
 // replace v0.1 box houses (town group) with minka at the same spots
 const olds=[...town.children];for(const h of olds){const box=h.children.find(c=>c.geometry&&c.geometry.type==='BoxGeometry');const w=box?box.geometry.parameters.width:6,d=box?box.geometry.parameters.depth:5;
  h.visible=false;v5Minka(h.position.x,h.position.z,h.rotation.y,w,d,{white:R()<.5});}
 // extra rows of minka along the approach so the village reads as a town (from Krea's market ref)
 for(const[x,z,r,w,d]of[[-30,138,1.4,5,4],[30,126,-1.9,5.5,4.5],[-22,118,.9,5,4],[24,172,3.3,6,4.5],[-34,166,1.9,5,4]]){if(colliders.some(c=>!c.ref&&Math.hypot(c.x-x,c.z-z)<c.r+3.5))continue;v5Minka(x,z,r,w,d,{white:R()<.5});colliders.push({x,z,r:Math.max(w,d)*.55});}
 // temple: swap the flat cylinder roofs for curved kawara roofs
 scene.traverse(o=>{if(!o.isGroup||Math.abs(o.position.x+4)>.1||Math.abs(o.position.z-176)>.1)return;const roofs=o.children.filter(c=>c.geometry&&c.geometry.type==='CylinderGeometry'&&c.geometry.parameters.radialSegments===4);
  roofs.forEach((r,i)=>{r.visible=false;const big=r.geometry.parameters.radiusBottom>7;const m=new THREE.Mesh(v5Roof(big?14:10,big?6.8:5,big?2.6:2.2,.9),BMAT.tile);m.position.set(0,r.position.y+(big?1.6:1.4),0);m.castShadow=true;o.add(m);
   const rd=new THREE.Mesh(new THREE.BoxGeometry(big?14:10,.32,.4),BMAT.ridge);rd.position.copy(m.position).y+=.1;o.add(rd);});
  v5Chochin(o,-3,4.3,5.2,false);v5Chochin(o,3,4.3,5.2,false);V5.temple=o;});
 // lantern string across the main street
 {const cordM=new THREE.LineBasicMaterial({color:0x2a1c12}),poleG=new THREE.CylinderGeometry(.07,.09,5,6);
  for(const z of[134,142]){const x0=-6.5,x1=6.5,y0=meshH(x0,z)+4.6,y1=meshH(x1,z)+4.6;const pts=[];
   for(const x of[x0,x1]){const p=new THREE.Mesh(poleG,BMAT.wood||BMAT.post||new THREE.MeshLambertMaterial({color:0x4a3220}));p.position.set(x,meshH(x,z)+2.4,z);p.castShadow=true;scene.add(p);}
   for(let i=0;i<=16;i++){const t=i/16;pts.push(new V3(lerp(x0,x1,t),lerp(y0,y1,t)-Math.sin(t*Math.PI)*.7,z));}
   scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),cordM));
   for(let i=1;i<8;i++){const t=i/8,x=lerp(x0,x1,t);v5Chochin(scene,x,lerp(y0,y1,t)-Math.sin(t*Math.PI)*.7-.32,z,i%2===0);}}}
 v5BuildSmoke();
 // torii + shrine glow materials, stone lantern caps
 V5.toriiM=[];V5.glowM=[];scene.traverse(o=>{if(!o.isMesh||!o.material||Array.isArray(o.material))return;const m=o.material;if(m.color&&m.color.getHex()===0xe3402c&&m.emissive&&!V5.toriiM.includes(m))V5.toriiM.push(m);
  if(m.emissive&&m.emissive.getHex()===0xffb35a&&!V5.glowM.includes(m))V5.glowM.push(m);});
 V5.toriiHalo=[];scene.traverse(o=>{if(o.isGroup&&o.children.length>=4&&o.children.some(c=>c.material&&V5.toriiM.includes(c.material))&&o.children.filter(c=>c.geometry&&c.geometry.type==='CylinderGeometry').length>=2){const s=o.scale.x;V5.toriiHalo.push(v5Halo(o,0,5.2,0,7,0xff5030));}});
 console.log('[kanemori] v0.5 village: minka',SMOKE_SRC.length,'lanterns',LANT.length,'torii',V5.toriiHalo.length);}catch(e){console.warn('[kanemori] v5 village',e);}}
function v5VillageFx(dt){const t=performance.now()/1000;const night=1-V5U.uDay.value;const nk=smooth(.25,.8,night);
 BMAT.shoji.emissiveIntensity=.08+nk*1.1;BMAT.lantern.emissiveIntensity=.25+nk*2.2;BMAT.lanternW.emissiveIntensity=.25+nk*1.8;
 for(const l of LANT){const fl=.85+.15*Math.sin(t*7+l.ph)*Math.sin(t*3.1+l.ph*2);l.halo.material.opacity=nk*.85*fl;l.g.rotation.z=Math.sin(t*1.3+l.ph)*.06*(.5+V5U.uWind.value);}
 if(V5.toriiM)for(const m of V5.toriiM)m.emissiveIntensity=.3+nk*.9;if(V5.toriiHalo)for(const h of V5.toriiHalo)h.material.opacity=nk*.35;
 if(V5.glowM)for(const m of V5.glowM)m.emissiveIntensity=.5+nk*2.2;
 if(SMOKE)SMOKE.material.uniforms.uScale.value=renderer.domElement.height*.9;}
/* ---- villager idle routines: sweep, carry, chat, sit (Aether's clips), picked per villager on a timer ---- */
const _v03NpcAnim0=v03NpcAnim;
v03NpcAnim=function(n,sp,dt,talking){const ud=n.mesh.userData;const a=ud.anim;if(!a)return;
 if(talking||n.comp||sp>.05||n.mode==='home'||(S.weather==='storm'&&n.d.persona)){ud.v5r=null;if(sp>.05&&ud.v5carry&&a.clips.carry){a.setMove(sp,0);if(ud.cur!=='carry'){if(ud.cur)a.stop('full',.3);a.play('carry',{loop:true,fade:.3});ud.cur='carry';}a.update(dt);return;}return _v03NpcAnim0(n,sp,dt,talking);}
 a.setMove(0,0);ud.v5rt=(ud.v5rt||0)-dt;
 if(!ud.v5r||ud.v5rt<=0){const near=PEOPLE.find(o=>o!==n&&o.mesh.visible&&Math.hypot(o.x-n.x,o.z-n.z)<3.2&&!o.comp);const opts=[];
  if(n.mode==='work'&&ud.work)opts.push(ud.work,ud.work);if(near)opts.push('talk_gesture','talk_gesture');opts.push('sweep','sit','idle','carry');if(a.clips.cook_stir&&/inn|cook/.test((n.d.role||'').toLowerCase()))opts.push('cook_stir');
  let pick=opts[(R()*opts.length)|0];if(!a.clips[pick])pick='idle';ud.v5r=pick;ud.v5rt=rnd(7,14);ud.v5carry=R()<.3;ud.v5near=near||null;}
 if(ud.v5r==='talk_gesture'&&ud.v5near){const o=ud.v5near;const ty=Math.atan2(o.x-n.x,o.z-n.z);n.yaw+=Math.atan2(Math.sin(ty-n.yaw),Math.cos(ty-n.yaw))*Math.min(1,dt*3);n.mesh.rotation.y=n.yaw;}
 const want=ud.v5r==='idle'?null:ud.v5r;if(want!==ud.cur){if(ud.cur)a.stop('full',.35);if(want)a.play(want,{loop:true,fade:.35});ud.cur=want;if(ud.prop)a.show(ud.prop,want===ud.work||(want==='sweep'&&ud.prop==='prop_broom'));}
 a.update(dt);};
