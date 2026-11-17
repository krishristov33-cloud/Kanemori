/* =====================================================================
   v0.5 SECTION: GHIBLI LOOK I. Quality tiers (Low / Medium / High / auto),
   GPU grass field (wind gusts, bends away from Ren / horse / boss),
   layered leaf-card cedars + broadleaf trees with soft spherical-normal
   shading, ferns, mossy rocks, baked canopy AO, painted cumulus clouds,
   pollen + drifting leaves, stronger golden hour / night / storm moods,
   painterly (Kuwahara) + grade post pass, GTAO on High.
   ===================================================================== */
const V5={v05:true,q:null,auto:lsGet('km_qauto')!=='0'&&!QS.has('noauto'),push:[],cnt:{}};
const QLV=['low','medium','high'];
V5.q=(()=>{const s=QS.get('q')||lsGet('km_q');if(QLV.includes(s))return s;
 // software rasterisers (SwiftShader / llvmpipe) or tiny mobile GPUs start on Low; everything else starts High and auto-steps down
 try{const gl=renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');const r=String(ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER));V5.gpu=r;if(/swiftshader|llvmpipe|software|softpipe/i.test(r))return 'low';}catch(e){}
 return 'high';})();
const QCFG={low:{cull:72,plants:.38,grass:6500,tile:42,shadow:0,pr:.75,bloom:0,ao:0,paint:0,ferns:.35,water:0,rays:0,motes:.4,leafCards:.6},
 medium:{cull:130,plants:1,grass:20000,tile:60,shadow:1024,pr:1,bloom:.55,ao:0,paint:2,ferns:.75,water:1,rays:.6,motes:.75,leafCards:1},
 high:{grass:34000,tile:72,shadow:2048,pr:PR_MAX,bloom:.7,ao:1,paint:3,ferns:1,water:2,rays:1,motes:1,leafCards:1}};
const QC=()=>QCFG[V5.q];
const V5U={uT:{value:0},uWind:{value:.6},uWindDir:{value:new THREE.Vector2(.82,.57)},uPush:{value:[0,1,2,3].map(()=>new THREE.Vector4(0,0,0,0))},uCam:{value:new V3()},
 uTile:{value:72},uSun:{value:new V3(0,1,0)},uSunC:{value:new THREE.Color(1,1,1)},uDay:{value:1},uGold:{value:0}};
const _v5m=new THREE.Matrix4(),_v5p=new V3(),_v5q=new THREE.Quaternion(),_v5s=new V3(),_v5e=new THREE.Euler();

/* ---- heightfield texture from the real terrain mesh: r height, g grass mask, b forest, a canopy AO ---- */
const HF=(()=>{const g=terrain.geometry,P=g.attributes.position,N=g.attributes.normal,SP=g.attributes.splat,n=TSEG+1,cell=TSIZE/TSEG,half=TSIZE/2;
 const data=new Float32Array(n*n*4);
 for(let i=0;i<P.count;i++){const x=P.getX(i),z=P.getZ(i),y=P.getY(i);const ix=Math.round((x+half)/cell),iz=Math.round((z+half)/cell);const o=(iz*n+ix)*4;
  let m=1;const ny=N.getY(i);m*=smooth(.72,.86,ny);if(y<WATER_SEA+2.5)m=0;const rd=Math.abs(x-RIVX(z));if(z<178&&rd<7.4)m*=smooth(6.4,7.4,rd);if(Math.hypot(x-66,z+104)<10.5)m=0;
  m*=1-smooth(.25,.6,SP.getX(i));m*=1-smooth(.15,.5,SP.getW(i));if(y>27)m=0;
  data[o]=y;data[o+1]=m;data[o+2]=SP.getZ(i);data[o+3]=1;}
 // houses / big colliders: no grass inside
 for(const c of colliders){if(c.r<1.4||c.ref)continue;const r=c.r+.3;for(let dz=-r;dz<=r;dz+=cell*.5)for(let dx=-r;dx<=r;dx+=cell*.5){if(dx*dx+dz*dz>r*r)continue;const ix=Math.round((c.x+dx+half)/cell),iz=Math.round((c.z+dz+half)/cell);if(ix<0||iz<0||ix>=n||iz>=n)continue;data[(iz*n+ix)*4+1]=0;}}
 // canopy ambient occlusion baked from the trees (soft dark pools under the crowns)
 for(const t of trees){const r=3.6*t.s,cx=t.x,cz=t.z;for(let dz=-r;dz<=r;dz+=cell)for(let dx=-r;dx<=r;dx+=cell){const d=Math.hypot(dx,dz)/r;if(d>1)continue;const ix=Math.round((cx+dx+half)/cell),iz=Math.round((cz+dz+half)/cell);if(ix<0||iz<0||ix>=n||iz>=n)continue;const o=(iz*n+ix)*4+3;data[o]*=1-.32*(1-d*d);}}
 const tex=new THREE.DataTexture(data,n,n,THREE.RGBAFormat,THREE.FloatType);tex.minFilter=tex.magFilter=THREE.NearestFilter;tex.needsUpdate=true;
 // the same AO goes onto the terrain as a vertex attribute
 const ao=new Float32Array(P.count);for(let i=0;i<P.count;i++){const ix=Math.round((P.getX(i)+half)/cell),iz=Math.round((P.getZ(i)+half)/cell);ao[i]=data[(iz*n+ix)*4+3];}g.setAttribute('aAO',new THREE.BufferAttribute(ao,1));
 return{tex,n,cell,half,data};})();
// exact mesh height (the triangles Ren actually stands on; fixes feet floating where H() and the 1.75 m mesh differ)
function meshH(x,z){const n=HF.n,c=HF.cell,gx=(x+HF.half)/c,gz=(z+HF.half)/c;const ix=Math.floor(gx),iz=Math.floor(gz);if(ix<0||iz<0||ix>=n-1||iz>=n-1)return H(x,z);
 const u=gx-ix,v=gz-iz,D=HF.data,h=(i,j)=>D[((iz+j)*n+ix+i)*4];
 // PlaneGeometry split: (a=0,0)(b=0,1)(d=1,0) and (b)(c=1,1)(d)
 return u+v<=1?h(0,0)+(h(1,0)-h(0,0))*u+(h(0,1)-h(0,0))*v:h(1,1)+(h(0,1)-h(1,1))*(1-u)+(h(1,0)-h(1,1))*(1-v);}
const HF_GLSL=`uniform sampler2D tHF;uniform float uHFn;uniform float uHFc;uniform float uHFh;
vec4 hfS(vec2 w){vec2 g=(w+uHFh)/uHFc;g=clamp(g,vec2(0.),vec2(uHFn-1.001));vec2 i=floor(g),f=g-i;float px=1./uHFn;
 vec4 a=texture2D(tHF,(i+.5)*px),b=texture2D(tHF,(i+vec2(1.,0.)+.5)*px),c=texture2D(tHF,(i+vec2(0.,1.)+.5)*px),d=texture2D(tHF,(i+vec2(1.,1.)+.5)*px);
 return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}`;
const NFB_NOFLIP=THREE.ShaderChunk.normal_fragment_begin.replace('normal *= faceDirection;','').replace('normal = normal * faceDirection;','');
const HFU={tHF:{value:HF.tex},uHFn:{value:HF.n},uHFc:{value:HF.cell},uHFh:{value:HF.half}};

/* ---- terrain: baked AO + warmer, more saturated painted palette ---- */
{const TM=terrain.material,prev=TM.onBeforeCompile;TM.onBeforeCompile=sh=>{prev(sh);Object.assign(sh.uniforms,{uGold:V5U.uGold});
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aAO;varying float vAO;').replace('#include <begin_vertex>','#include <begin_vertex>\nvAO=aAO;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vAO;uniform float uGold;').replace('diffuseColor.rgb*=col;',
  `float lum=dot(col,vec3(.299,.587,.114));col=mix(vec3(lum),col,1.28);col*=vec3(1.02,1.05,.9);col=mix(col,col*vec3(1.12,1.0,.78),uGold*.35);
   diffuseColor.rgb*=col*mix(.7,1.,vAO);`);};TM.needsUpdate=true;}

/* ---- GPU grass field: clumps wrap around the camera, height + mask from the heightfield ---- */
const GRASS=(()=>{const B=7,pos=[],uv=[],idx=[];let v=0;const r=mulberry(77);
 for(let b=0;b<B;b++){const a=r()*TAU,ox=(r()-.5)*.34,oz=(r()-.5)*.34,h=.45+r()*.6,w=.04+r()*.025,lean=(r()-.5)*.5,ca=Math.cos(a),sa=Math.sin(a);
  const rows=[[0,w],[.55,w*.75],[1,0]];for(const[t,ww]of rows){const ly=t*h,lx=lean*t*t*h*.4;for(const s of(ww>0?[-1,1]:[0])){const px=s*ww,pz=0;pos.push(ox+ca*px+sa*(pz+lx),ly,oz-sa*px+ca*(pz+lx));uv.push(s*.5+.5,t);}}
  idx.push(v,v+1,v+2,v+1,v+3,v+2,v+2,v+3,v+4);v+=5;}
 const g=new THREE.InstancedBufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aUV',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);
 g.setAttribute('normal',new THREE.Float32BufferAttribute(pos.map((_,i)=>i%3===1?1:0),3));
 const MAX=QCFG.high.grass,ai=new Float32Array(MAX*4);for(let i=0;i<MAX;i++){ai[i*4]=r();ai[i*4+1]=r();ai[i*4+2]=r();ai[i*4+3]=r();}
 g.setAttribute('aI',new THREE.InstancedBufferAttribute(ai,4));g.instanceCount=QCFG[V5.q].grass;g.boundingSphere=new THREE.Sphere(new V3(),1e5);
 const m=new THREE.MeshLambertMaterial({color:0xffffff,side:THREE.DoubleSide});
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,V5U,HFU);
  sh.vertexShader=sh.vertexShader.replace('#include <common>',`#include <common>
uniform float uT,uWind,uTile,uGold;uniform vec2 uWindDir;uniform vec4 uPush[4];uniform vec3 uCam;attribute vec4 aI;attribute vec2 aUV;varying vec3 vGC;varying float vGH;varying float vGust;
${HF_GLSL}
float gh1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float gn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(gh1(i),gh1(i+vec2(1,0)),f.x),mix(gh1(i+vec2(0,1)),gh1(i+vec2(1,1)),f.x),f.y);}`)
  .replace('#include <beginnormal_vertex>','vec3 objectNormal=vec3(0.,1.,0.);')
  .replace('#include <begin_vertex>',`
 vec2 wp=uCam.xz+mod(aI.xy*uTile-uCam.xz+uTile*.5,uTile)-uTile*.5;
 vec4 hf=hfS(wp);float dc=length(wp-uCam.xz);float fade=1.-smoothstep(uTile*.5-9.,uTile*.5-1.,dc);
 float patchN=gn(wp*.045+3.1),fine=gn(wp*.33);
 float sc=hf.g*fade*mix(.55,1.25,patchN)*mix(1.,.6,hf.b)*(.75+.5*aI.w);
 float rot=aI.z*6.2832;float cr=cos(rot),sr=sin(rot);vec3 lp=position;lp.xz=vec2(cr*lp.x-sr*lp.z,sr*lp.x+cr*lp.z);float h=aUV.y;lp.y*=sc;lp.xz*=mix(.8,1.25,aI.w);
 float g1=gn(wp*.06-uWindDir*uT*.55),gust=smoothstep(.35,.95,g1);
 vec2 bend=uWindDir*(.12+.7*gust)*uWind+vec2(sin(uT*2.1+wp.x*.9+aI.z*6.),cos(uT*1.7+wp.y*.8))*.07*(.4+uWind);
 float flat0=0.;for(int k=0;k<4;k++){vec4 P=uPush[k];if(P.z<=0.)continue;vec2 dv=wp-P.xy;float dd=length(dv);float kk=(1.-smoothstep(P.z*.35,P.z,dd))*P.w;bend+=dv/max(dd,.05)*kk*1.6;flat0=max(flat0,kk);}
 float hh=h*h;lp.xz+=bend*hh*max(lp.y,.2)*1.15;lp.y*=1.-min(.6,length(bend)*.32)*h-flat0*.35*h;
 vec3 transformed=vec3(wp.x,hf.r-.05,wp.y)+lp;objectNormal=normalize(vec3(bend.x*.35,1.,bend.y*.35));
 vec3 cBase=mix(vec3(.1,.27,.06),vec3(.07,.2,.08),hf.b),cTip=mix(vec3(.33,.6,.13),vec3(.22,.42,.13),hf.b);
 cTip=mix(cTip,vec3(.56,.68,.18),smoothstep(.55,.9,patchN)*.45);cTip=mix(cTip,cTip*vec3(1.25,.95,.6),uGold*.45);
 vGC=mix(cBase,cTip,smoothstep(0.,.9,h))*(.9+.2*fine)*mix(.6,1.,hf.a);
 if(aI.w>.955&&hf.b<.5&&h>.9){vGC=aI.z<.33?vec3(1.,.97,.9):aI.z<.66?vec3(1.,.82,.3):vec3(.95,.55,.75);}
 vGH=h;vGust=gust*h;`);
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vGC;varying float vGH;varying float vGust;')
   .replace('#include <color_fragment>','diffuseColor.rgb=vGC*(1.+vGust*.25);').replace('#include <normal_fragment_begin>',NFB_NOFLIP);};
 m.customProgramCacheKey=()=>'v5grass';
 const mesh=new THREE.Mesh(g,m);mesh.frustumCulled=false;mesh.receiveShadow=true;mesh.castShadow=false;scene.add(mesh);return{mesh,g};})();

/* ---- painted leaf-card atlas: [cedar needles | broadleaf | fern] ---- */
const LEAF=(()=>{const W=768,Hh=256,c=document.createElement('canvas');c.width=W;c.height=Hh;const g=c.getContext('2d');const r=mulberry(91);
 // cedar: drooping fan of needle sprays
 g.save();g.translate(128,40);for(let i=0;i<260;i++){const a=Math.PI*.5+(r()-.5)*2.3,len=40+r()*150,x0=(r()-.5)*30;const l=r();g.strokeStyle=`hsl(${112+r()*26},${42+r()*18}%,${26+l*30}%)`;g.lineWidth=2+r()*4;g.lineCap='round';
  g.beginPath();g.moveTo(x0,0);const ex=x0+Math.cos(a)*len,ey=Math.sin(a)*len*.92;g.quadraticCurveTo(x0+Math.cos(a)*len*.5,Math.sin(a)*len*.3,ex,ey);g.stroke();
  for(let k=0;k<5;k++){const t=.3+k*.15,px=x0+(ex-x0)*t,py=ey*t*t;g.lineWidth=1.5+r()*2;g.beginPath();g.moveTo(px,py);g.lineTo(px+(r()-.5)*26,py+8+r()*16);g.stroke();}}
 g.restore();
 // broadleaf: round painted leaf clusters
 for(let i=0;i<340;i++){const a=r()*TAU,d=Math.sqrt(r())*100,x=384+Math.cos(a)*d,y=128+Math.sin(a)*d*.9;const l=r();g.fillStyle=`hsl(${78+r()*30},${48+r()*20}%,${30+l*32+(y<120?10:0)}%)`;
  g.beginPath();g.ellipse(x,y,6+r()*10,4+r()*6,r()*3,0,TAU);g.fill();}
 // fern frond
 g.save();g.translate(520,128);g.strokeStyle='#2f5a24';g.lineWidth=3;g.beginPath();g.moveTo(8,0);g.lineTo(240,0);g.stroke();
 for(let k=0;k<24;k++){const t=k/24,x=10+t*226,L=(1-t*.85)*58;for(const s of[-1,1]){g.fillStyle=`hsl(${100+r()*20},${45+r()*15}%,${24+r()*16}%)`;g.beginPath();g.moveTo(x,0);g.quadraticCurveTo(x+L*.5,s*L*.4,x+L*.35,s*L);g.quadraticCurveTo(x+L*.1,s*L*.4,x,0);g.fill();}}
 g.restore();
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;})();
function v5Canopy(m){m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,{uT:V5U.uT,uWind:V5U.uWind,uWindDir:V5U.uWindDir});
 Object.assign(sh.uniforms,{uGold:V5U.uGold});sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uGold;');sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uT,uWind;uniform vec2 uWindDir;')
  .replace('#include <begin_vertex>',`#include <begin_vertex>
#ifdef USE_INSTANCING
 vec3 ip=vec3(instanceMatrix[3]);
#else
 vec3 ip=vec3(0.);
#endif
 float hh=max(transformed.y-2.,0.);float ph=uT*1.3+ip.x*.21+ip.z*.17;float fl=sin(uT*5.+dot(transformed,vec3(3.1,1.7,2.3))+ip.x)*.04*hh*.25;
 transformed.xz+=uWindDir*(sin(ph)*.5+.6)*.012*hh*hh*(.4+uWind)+vec2(fl,-fl);`);sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>',NFB_NOFLIP).replace('#include <opaque_fragment>','outgoingLight+=diffuseColor.rgb*mix(vec3(.34,.38,.22),vec3(.62,.42,.14),uGold);\n#include <opaque_fragment>');};
 m.customProgramCacheKey=()=>'v5canopy';return m;}
// quad card helper: centre c, right vector rv, down vector dv (both scaled), atlas cell, spherical normal centre nc
function v5Card(out,c,rv,dv,cell,nc,col,colB){const P=[c.clone().sub(rv),c.clone().add(rv),c.clone().sub(rv).add(dv),c.clone().add(rv).add(dv)];const u0=cell/3,u1=(cell+1)/3;
 const U=[[u0,1],[u1,1],[u0,0],[u1,0]];const base=out.pos.length/3;
 P.forEach((p,i)=>{out.pos.push(p.x,p.y,p.z);const n=p.clone().sub(nc).normalize().lerp(new V3(0,1,0),.25).normalize();out.nor.push(n.x,n.y,n.z);out.uv.push(U[i][0],U[i][1]);const k=i<2?col:colB;out.col.push(k.r,k.g,k.b);});
 out.idx.push(base,base+2,base+1,base+1,base+2,base+3);}
function v5Geo(o){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(o.pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(o.nor,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(o.uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(o.col,3));g.setIndex(o.idx);return g;}
const TREE5=(()=>{const r=mulberry(4242);
 // cedar: dark core cones + drooping needle-card skirts per tier, lighter on top (Ghibli layered crowns)
 const ced={pos:[],nor:[],uv:[],col:[],idx:[]};const tiers=7;
 for(let k=0;k<tiers;k++){const t=k/(tiers-1),y=3.4+t*7.6,R0=2.9*(1-t*.78)+.25,nc=new V3(0,y-.6,0);const n=Math.max(4,Math.round(9-t*5));
  const cTop=new THREE.Color().setHSL(.33+r()*.03,.5,.3+t*.12),cBot=new THREE.Color().setHSL(.37,.48,.14+t*.06);
  for(let i=0;i<n;i++){const a=i/n*TAU+r()*.5+k;const out=new V3(Math.cos(a),0,Math.sin(a));const rt=new V3(-out.z,0,out.x);
   const c=out.clone().multiplyScalar(R0*.5).add(new V3(0,y+.45,0));const w=R0*.75*(.85+r()*.3),L=R0*1.2;
   const dv=out.clone().multiplyScalar(L*.85).add(new V3(0,-L*.62,0));v5Card(ced,c,rt.multiplyScalar(w),dv,0,nc,cTop,cBot);}
  // inner cross cards to fill the crown
  for(let i=0;i<2;i++){const a=r()*TAU,rt=new V3(Math.cos(a),0,Math.sin(a)).multiplyScalar(R0*.8);v5Card(ced,new V3(0,y+.9,0),rt,new V3(0,-1.6*(1-t*.5),0),0,nc,cTop,cBot);}}
 {const c=new THREE.Color(0x3b6a3c);v5Card(ced,new V3(0,12.4,0),new V3(.5,0,0),new V3(0,-1.6,0),0,new V3(0,11,0),c,c);v5Card(ced,new V3(0,12.4,0),new V3(0,0,.5),new V3(0,-1.6,0),0,new V3(0,11,0),c,c);}
 const cedCards=v5Geo(ced);
 const cedCore=mergeColored([{g:new THREE.ConeGeometry(1.6,3.6,7).translate(0,4.6,0),c:0x1d4426,jit:.1},{g:new THREE.ConeGeometry(1.5,3.6,7).translate(0,6.9,0),c:0x22502c,jit:.1},{g:new THREE.ConeGeometry(1.0,3.2,6).translate(0,9.1,0),c:0x285a30,jit:.1}]);
 // cedar trunk with root flare, reddish bark
 const trunk=mergeColored([{g:new THREE.CylinderGeometry(.16,.42,10.5,7).translate(0,5.25,0),c:0x6a3c26,jit:.12},{g:new THREE.CylinderGeometry(.42,.75,.8,7).translate(0,.3,0),c:0x553020}]);
 // broadleaf: forked trunk + 6 fluffy leaf blobs with spherical normals
 const bl={pos:[],nor:[],uv:[],col:[],idx:[]};const blobs=[[0,6.2,0,2.6],[1.7,5.4,.6,1.9],[-1.6,5.6,-.4,2.0],[.4,5.2,-1.7,1.8],[-.5,7.6,.4,1.8],[.9,4.6,1.6,1.6]];
 for(const[bx,by,bz,br]of blobs){const nc=new V3(bx,by,bz);const nCard=Math.round(br*7);
  for(let i=0;i<nCard;i++){const u=r()*2-1,a=r()*TAU,s=Math.sqrt(1-u*u);const n=new V3(s*Math.cos(a),u*.8+.15,s*Math.sin(a)).normalize();const c=nc.clone().addScaledVector(n,br*.7);
   const rt=new V3().crossVectors(n,new V3(0,1,0));if(rt.lengthSq()<.01)rt.set(1,0,0);rt.normalize().multiplyScalar(br*.62);const dv=new V3().crossVectors(rt,n).normalize().multiplyScalar(br*1.25);c.addScaledVector(dv,-.5);
   const lt=.5+.5*n.y;const cT=new THREE.Color().setHSL(.24+r()*.04,.5,.22+lt*.2),cB=new THREE.Color().setHSL(.27,.5,.12+lt*.12);v5Card(bl,c,rt,dv,1,nc,cT,cB);}}
 const blCards=v5Geo(bl);
 const blWood=mergeColored([{g:new THREE.CylinderGeometry(.3,.5,4.6,7).translate(0,2.3,0),c:0x5a4232,jit:.1},{g:new THREE.CylinderGeometry(.12,.24,3,6).rotateZ(-.7).translate(1,4.8,.3),c:0x5a4232},{g:new THREE.CylinderGeometry(.12,.24,3,6).rotateZ(.7).translate(-1,4.9,-.2),c:0x5a4232},{g:new THREE.CylinderGeometry(.1,.2,2.6,6).rotateX(.7).translate(0,4.8,1),c:0x5a4232},
  {g:new THREE.IcosahedronGeometry(2.1,1).translate(0,6,0),c:0x22401c,jit:.15},{g:new THREE.IcosahedronGeometry(1.4,1).translate(1.5,5.3,.5),c:0x22401c,jit:.15},{g:new THREE.IcosahedronGeometry(1.4,1).translate(-1.4,5.5,-.4),c:0x22401c,jit:.15}]);
 return{cedCards,cedCore,trunk,blCards,blWood};})();
{// re-dress every tree: cedars in the forest, broadleaf keyaki/maple elsewhere (and a few in the forest)
 const cardMat=v5Canopy(new THREE.MeshLambertMaterial({map:LEAF,vertexColors:true,alphaTest:.42,side:THREE.DoubleSide}));
 const coreMat=windMat(new THREE.MeshLambertMaterial({vertexColors:true}),.012);
 treeMesh.geometry=TREE5.trunk;treeMesh.material=new THREE.MeshLambertMaterial({vertexColors:true});
 const nB=trees.filter(t=>t.kind==='tree').length;
 const tint=new THREE.Color();let nC=0,nL=0;
trees.forEach((t,i)=>{const forest=t.x<45&&t.z<115;const r=hash(t.x*.37,t.z*.71);t.v5k=forest?(r<.12?'bl':'ced'):(r<.25?'ced':'bl');t.v5s=t.v5k==='bl'?nL++:nC++;});
// v0.5 perf: each kind gets its own compact instance buffer (was 4 x trees.length, mostly zero-scaled)
V5.ced=new THREE.InstancedMesh(TREE5.cedCards,cardMat,Math.max(1,nC));V5.cedCore=new THREE.InstancedMesh(TREE5.cedCore,coreMat,Math.max(1,nC));
V5.bl=new THREE.InstancedMesh(TREE5.blCards,cardMat,Math.max(1,nL));V5.blW=new THREE.InstancedMesh(TREE5.blWood,new THREE.MeshLambertMaterial({vertexColors:true}),Math.max(1,nL));
for(const m of[V5.ced,V5.cedCore,V5.bl,V5.blW]){m.castShadow=true;m.receiveShadow=true;scene.add(m);}
// low-quality LOD: every other leaf card
const halfCards=g=>{const h=g.clone(),ix=g.index.array,o=[];for(let k=0;k<ix.length;k+=6)if((k/6)%2===0)for(let j=0;j<6;j++)o.push(ix[k+j]);h.setIndex(o);return h;};
TREE5.cedCardsLo=halfCards(TREE5.cedCards);TREE5.blCardsLo=halfCards(TREE5.blCards);
trees.forEach((t,i)=>{const r=hash(t.x*.37,t.z*.71),forest=t.x<45&&t.z<115;
  tint.setHSL(0,0,1);if(t.v5k==='bl'){tint.setRGB(.9+r*.25,.95+r*.1,.85);if(!forest&&r>.9)tint.setRGB(1.35,.95,.6);}else tint.setRGB(.9+r*.15,.95+r*.1,.95);
  (t.v5k==='bl'?V5.bl:V5.ced).setColorAt(t.v5s,tint);});
const _setTree0=setTree;
setTree=function(i,shake=0){_setTree0(i,shake);const t=trees[i];if(!t)return;treeMesh.getMatrixAt(i,_v5m);const stump=t.wood<=0;const z=_v5m.clone().makeScale(0,0,0);
  const isC=t.v5k!=='bl',M=stump?z:_v5m;if(isC){V5.ced.setMatrixAt(t.v5s,M);V5.cedCore.setMatrixAt(t.v5s,M);}else{V5.bl.setMatrixAt(t.v5s,M);V5.blW.setMatrixAt(t.v5s,M);}
  if(!isC&&!stump)treeMesh.setMatrixAt(i,z);
  for(const m of[V5.ced,V5.cedCore,V5.bl,V5.blW])m.instanceMatrix.needsUpdate=true;treeMesh.instanceMatrix.needsUpdate=true;};
trees.forEach((t,i)=>setTree(i));}

/* ---- ferns on the forest floor + moss on the decorative rocks ---- */
{const r=mulberry(515),f={pos:[],nor:[],uv:[],col:[],idx:[]};const cA=new THREE.Color(0x6a9a48),cB=new THREE.Color(0x24401c);
 for(let k=0;k<7;k++){const a=k/7*TAU+r()*.4,dir=new V3(Math.cos(a),0,Math.sin(a)),rt=new V3(-dir.z,0,dir.x).multiplyScalar(.28);const L=.9+r()*.4;
  // two-segment arching frond (card split in half for the arch)
  const c1=new V3(0,.05,0),d1=dir.clone().multiplyScalar(L*.5).add(new V3(0,.45,0)),c2=c1.clone().add(d1),d2=dir.clone().multiplyScalar(L*.5).add(new V3(0,-.3,0));
  const base=f.pos.length/3;for(const[p,u,col]of[[c1.clone().sub(rt),[2/3,.5],cB],[c1.clone().add(rt),[2/3,.5],cB],[c2.clone().sub(rt),[2.5/3,.5],cA],[c2.clone().add(rt),[2.5/3,.5],cA],[c2.clone().add(d2).sub(rt.clone().multiplyScalar(.4)),[1,.5],cA],[c2.clone().add(d2).add(rt.clone().multiplyScalar(.4)),[1,.5],cA]]){f.pos.push(p.x,p.y,p.z);f.nor.push(0,1,0);f.col.push(col.r,col.g,col.b);f.uv.push(u[0],0);}
  // uv.y: across the frond (0..1)
  for(let i=0;i<6;i++)f.uv[(base+i)*2+1]=i%2?1:0;
  f.idx.push(base,base+2,base+1,base+1,base+2,base+3,base+2,base+4,base+3,base+3,base+4,base+5);}
 const geo=v5Geo(f);const mat=v5Canopy(new THREE.MeshLambertMaterial({map:LEAF,vertexColors:true,alphaTest:.4,side:THREE.DoubleSide}));
 const N=Math.round(2600*QC().ferns),im=new THREE.InstancedMesh(geo,mat,N);let n=0;
 for(let i=0;i<N*6&&n<N;i++){const x=rnd(-170,44),z=rnd(-150,112);if(inWater(x,z)||pathDist(x,z)<2.4||nearFlat(x,z,-2))continue;const y=meshH(x,z);if(y<WATER_SEA+3)continue;const s=rnd(.7,1.5);
  _v5p.set(x,y,z);_v5e.set(0,R()*TAU,0);_v5q.setFromEuler(_v5e);_v5s.set(s,s,s);_v5m.compose(_v5p,_v5q,_v5s);im.setMatrixAt(n++,_v5m);}
 im.count=n;im.receiveShadow=true;scene.add(im);V5.ferns=im;}
if(ART.rocks){const m=ART.rocks.material=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true});m.onBeforeCompile=sh=>{
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWN;varying vec3 vWP;').replace('#include <begin_vertex>','#include <begin_vertex>\nvec4 wpp=vec4(transformed,1.);\n#ifdef USE_INSTANCING\nwpp=instanceMatrix*wpp;vWN=normalize(mat3(instanceMatrix)*normal);\n#else\nvWN=normal;\n#endif\nvWP=(modelMatrix*wpp).xyz;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWN;varying vec3 vWP;').replace('#include <color_fragment>',`#include <color_fragment>
 float mn=fract(sin(dot(floor(vWP.xz*3.),vec2(12.9,78.2)))*43758.5)*.25;float moss=smoothstep(.35,.7,normalize(vWN).y+mn-.12);diffuseColor.rgb=mix(diffuseColor.rgb*vec3(.95,.93,1.),vec3(.27,.45,.16)*(.85+mn),moss);`);};
 m.customProgramCacheKey=()=>'v5moss';}

/* ---- painted cumulus clouds (big soft billboards around the horizon, tinted by time of day) ---- */
const CLOUDS=(()=>{const texs=[0,1,2].map(v=>{const r=mulberry(300+v);return canvasTex(512,256,(c,w,h)=>{const puffs=[];const n=14+v*4;
  for(let i=0;i<n;i++){const t=i/(n-1),x=w*(.14+.72*t)+(r()-.5)*40,top=h*(.25+.35*Math.abs(t-.5)*1.6)+(r()-.5)*30;const rad=40+r()*60*(1-Math.abs(t-.5));puffs.push([x,Math.max(top,rad*.9),rad]);}
  for(const[x,y,rr]of puffs){const g=c.createRadialGradient(x,y+rr*.35,rr*.2,x,y,rr);g.addColorStop(0,'rgba(170,176,205,.95)');g.addColorStop(.7,'rgba(185,190,214,.9)');g.addColorStop(1,'rgba(190,195,220,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,rr,0,TAU);c.fill();}
  for(const[x,y,rr]of puffs){const g=c.createRadialGradient(x-rr*.25,y-rr*.4,rr*.05,x,y-rr*.1,rr*.95);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.6,'rgba(250,248,245,.75)');g.addColorStop(1,'rgba(240,240,248,0)');c.fillStyle=g;c.beginPath();c.arc(x,y-rr*.08,rr*.9,0,TAU);c.fill();}
  const fl=c.createLinearGradient(0,h*.55,0,h);fl.addColorStop(0,'rgba(0,0,0,0)');fl.addColorStop(1,'rgba(0,0,0,1)');c.globalCompositeOperation='destination-out';c.fillStyle=fl;c.fillRect(0,h*.55,w,h*.45);});});
 const list=[];const r=mulberry(808);for(let i=0;i<18;i++){const m=new THREE.SpriteMaterial({map:texs[i%3],transparent:true,depthWrite:false,fog:false,opacity:.95});const s=new THREE.Sprite(m);
  const a=r()*TAU,d=560+r()*260,h=70+r()*150,sc=220+r()*260;s.scale.set(sc,sc*.5,1);s.renderOrder=-1;scene.add(s);list.push({s,a,d,h,sc,sp:(r()-.5)*.004});}
 return{list,col:new THREE.Color()};})();

/* ---- pollen (day) + drifting leaves around the camera: one GPU point system ---- */
const MOTES=(()=>{const N=900,base=new Float32Array(N*3),seed=new Float32Array(N*4);const r=mulberry(612);
 for(let i=0;i<N;i++){base[i*3]=r()*40-20;base[i*3+1]=r()*9;base[i*3+2]=r()*40-20;seed[i*4]=r()*100;seed[i*4+1]=.5+r();seed[i*4+2]=r();seed[i*4+3]=i<N*.72?0:1;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(base,3));g.setAttribute('aSeed',new THREE.BufferAttribute(seed,4));
 const U={uT:V5U.uT,uWind:V5U.uWind,uWindDir:V5U.uWindDir,uCam:V5U.uCam,uDay:V5U.uDay,uScale:{value:500},uCnt:{value:1},uGold:V5U.uGold,uGround:{value:0}};
 const m=new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,
  vertexShader:`uniform float uT,uWind,uDay,uScale,uCnt,uGold,uGround;uniform vec2 uWindDir;uniform vec3 uCam;attribute vec4 aSeed;varying float vA;varying float vK;varying float vR;varying vec3 vC;
  void main(){vec3 p=position;float s=aSeed.x,t=uT*aSeed.y;vK=aSeed.w;
   vec2 drift=uWindDir*uT*(vK>.5?2.2:.5)*(.5+uWind);vec3 off=vec3(drift.x+sin(t*.7+s)*1.2,sin(t*1.1+s*3.)*.6-(vK>.5?mod(uT*.35+s,9.):0.),drift.y+cos(t*.6+s*2.)*1.2);
   vec3 rel=p+off;rel.xz=mod(rel.xz-uCam.xz+20.,40.)-20.;rel.y=mod(rel.y,9.);vec3 w=vec3(uCam.x+rel.x,uGround+.3+rel.y,uCam.z+rel.z);
   vec4 mv=modelViewMatrix*vec4(w,1.);float d=-mv.z;float edge=smoothstep(20.,13.,length(rel.xz));
   vA=edge*smoothstep(.5,2.,d)*step(aSeed.z,uCnt)*(vK>.5?(.75+.25*uWind):uDay*(.35+.65*uGold+.3));vR=t*2.+s;
   vC=vK>.5?mix(vec3(.45,.62,.2),vec3(.85,.62,.2),fract(s*7.3)*.8):vec3(1.,.93,.7);
   gl_PointSize=clamp(uScale*(vK>.5?.12:.035)/max(d,.1),1.5,vK>.5?26.:6.);gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`varying float vA;varying float vK;varying float vR;varying vec3 vC;void main(){vec2 q=gl_PointCoord-.5;
   if(vK>.5){float c=cos(vR),s=sin(vR);q=mat2(c,-s,s,c)*q;q.x*=1.+.8*abs(sin(vR*.7));float d=length(q*vec2(2.4,1.25));if(d>.5)discard;gl_FragColor=vec4(vC*(.8+.4*(.5-q.y)),vA*.9);}
   else{float d=length(q)*2.;if(d>1.)discard;gl_FragColor=vec4(vC,vA*pow(1.-d,2.)*.9);}}`});
 const p=new THREE.Points(g,m);p.frustumCulled=false;p.renderOrder=2;scene.add(p);return{p,U};})();

/* ---- moods: stronger golden hour, bluer moonlit night, heavy storm; wind strength per weather ---- */
const MOOD={gold:new THREE.Color(0xffa040),noonSky:new THREE.Color(0x5aa0e8),noonMid:new THREE.Color(0xa8d4f4),noonBot:new THREE.Color(0xf4ecd8),
 nightTop:new THREE.Color(0x0b1638),nightMid:new THREE.Color(0x203a70),nightBot:new THREE.Color(0x3c4c84),goldTop:new THREE.Color(0x4a5a9c),goldMid:new THREE.Color(0xffb460),goldBot:new THREE.Color(0xffd27e),goldHemi:new THREE.Color(0xffc878),goldGround:new THREE.Color(0x8a5a2a),goldFog:new THREE.Color(0xf2b066),
 cloudDay:new THREE.Color(1,1,1),cloudGold:new THREE.Color(1,.78,.62),cloudNight:new THREE.Color(.24,.3,.5),cloudStorm:new THREE.Color(.42,.44,.5)};
const _v5c=new THREE.Color(),_v5c2=new THREE.Color();
const _updSky4=updSky;
updSky=function(dt){_updSky4(dt);try{const t=S.time;const dayK=t<.667?smooth(0,.06,t)*smooth(.667,.6,t):0;const gold=Math.max(0,1-Math.abs(t-.6)/.09,1-Math.abs(t-.045)/.05)*(t<.667?1:0);
 const wx=S.weather,wet=wx==='rain'||wx==='cloudy'?.6:wx==='storm'?.9:wx==='fog'?.5:0;const k=Math.min(1,dt*1.2);
 // sky: saturated Ghibli blue at noon, peach-gold at golden hour, deep indigo at night
 if(wet<.5){const top=_v5c.copy(MOOD.nightTop).lerp(MOOD.noonSky,dayK).lerp(MOOD.goldTop,gold*.55);skyU.top.value.lerp(top,k*.6);
  const mid=_v5c2.copy(MOOD.nightMid).lerp(MOOD.noonMid,dayK).lerp(MOOD.goldMid,gold*.7);skyU.mid.value.lerp(mid,k*.6);
  const bot=_v5c.copy(MOOD.nightBot).lerp(MOOD.noonBot,dayK).lerp(MOOD.goldBot,gold*.8);skyU.bot.value.lerp(bot,k*.6);}
 scene.fog.color.copy(skyU.mid.value).lerp(skyU.bot.value,.5);if(gold>0&&wet<.5)scene.fog.color.lerp(MOOD.goldFog,gold*.6);
 // golden hour: warmer, stronger key light
 if(gold>0){sun.color.lerp(MOOD.gold,gold*.8);sun.intensity*=1+gold*.5;hemi.color.lerp(MOOD.goldHemi,gold*.55*(1-wet));hemi.groundColor.lerp(MOOD.goldGround,gold*.45*(1-wet));hemi.intensity*=1+gold*.25;}
 if(V5.paint)V5.paint.uniforms.uGold.value=V5U.uGold.value;
 // night: brighter blue moonlight so the valley still reads; storm darker
 if(dayK<.3){sun.intensity=Math.max(sun.intensity,.9*(1-wet*.5));hemi.intensity=Math.max(hemi.intensity,.95);}
 if(wx==='storm'){sun.intensity*=.55;renderer.toneMappingExposure*=.92;}
 V5U.uGold.value=lerp(V5U.uGold.value,gold*(1-wet),k);V5U.uDay.value=dayK*(1-wet);
 V5U.uWind.value=lerp(V5U.uWind.value,wx==='storm'?2.4:wx==='warn'?1.6:wx==='rain'?1.2:wx==='cloudy'?.85:.6,Math.min(1,dt*.5));
 V5U.uSun.value.copy(skyU.sunDir.value);V5U.uSunC.value.copy(sun.color);
 // clouds follow the camera on a big ring, tinted by the hour and the weather
 const cc=CLOUDS.col.copy(MOOD.cloudNight).lerp(MOOD.cloudDay,dayK).lerp(MOOD.cloudGold,gold*.85).lerp(MOOD.cloudStorm,wet*.8);
 for(const c of CLOUDS.list){c.a+=c.sp*dt;c.s.position.set(camera.position.x+Math.cos(c.a)*c.d,c.h-wet*30,camera.position.z+Math.sin(c.a)*c.d);c.s.material.color.copy(cc);c.s.material.opacity=.95*(dayK>.05?1:.55)+wet*.05;c.s.scale.set(c.sc*(1+wet*.6),c.sc*.5*(1+wet*.4),1);}
}catch(e){if(!V5._skyErr){V5._skyErr=1;console.warn('[kanemori] v5 sky',e);}}};

/* ---- post: painterly Kuwahara + Ghibli grade, GTAO on High; bloom per tier ---- */
const PAINT_SHADER={uniforms:{tDiffuse:{value:null},uRes:{value:new THREE.Vector2(1280,720)},uRad:{value:3},uMix:{value:.75},uSat:{value:1.12},uGold:{value:0}},
 vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
 fragmentShader:`precision highp float;uniform sampler2D tDiffuse;uniform vec2 uRes;uniform float uRad,uMix,uSat,uGold;varying vec2 vUv;
 void main(){vec2 px=1./uRes;vec4 src=texture2D(tDiffuse,vUv);vec3 m[4];vec3 s[4];for(int k=0;k<4;k++){m[k]=vec3(0.);s[k]=vec3(0.);}
  float n=0.;for(int j=0;j<=3;j++){for(int i=0;i<=3;i++){if(float(i)>uRad||float(j)>uRad)continue;
   vec3 a=texture2D(tDiffuse,vUv+vec2(-float(i),-float(j))*px).rgb,b=texture2D(tDiffuse,vUv+vec2(float(i),-float(j))*px).rgb,c=texture2D(tDiffuse,vUv+vec2(-float(i),float(j))*px).rgb,d=texture2D(tDiffuse,vUv+vec2(float(i),float(j))*px).rgb;
   m[0]+=a;s[0]+=a*a;m[1]+=b;s[1]+=b*b;m[2]+=c;s[2]+=c*c;m[3]+=d;s[3]+=d*d;n+=1.;}}
  float best=1e9;vec3 col=src.rgb;for(int k=0;k<4;k++){vec3 mu=m[k]/n;vec3 v=abs(s[k]/n-mu*mu);float sv=v.r+v.g+v.b;if(sv<best){best=sv;col=mu;}}
  col=mix(src.rgb,col,uMix);float l=dot(col,vec3(.2126,.7152,.0722));col=mix(vec3(l),col,uSat);col=mix(col,col*vec3(1.14,1.0,.74)+vec3(.035,.018,0.)*(1.-l),uGold*.7);
  gl_FragColor=vec4(col,src.a);}`};
async function v5PatchFX(){if(!composer||composer._v5)return;composer._v5=1;try{
 const SP=composer.passes.find(p=>p.constructor&&p.constructor.name==='ShaderPass')?.constructor;const out=composer.passes.findIndex(p=>p.constructor&&p.constructor.name==='OutputPass');
 if(SP){V5.paint=new SP(PAINT_SHADER);composer.insertPass(V5.paint,out<0?composer.passes.length:out);}
 V5.bloom=composer.passes.find(p=>p.strength!==undefined&&p.radius!==undefined);
 try{const A=KM_CDN.base+'examples/jsm/postprocessing/GTAOPass.js';const {GTAOPass}=await import(A);V5.ao=new GTAOPass(scene,camera,innerWidth,innerHeight);V5.ao.output=GTAOPass.OUTPUT.Default;
  try{V5.ao.updateGtaoMaterial({radius:.6,distanceExponent:1.4,thickness:1.2,scale:1.1,samples:12});V5.ao.updatePdMaterial({lumaPhi:10,depthPhi:2,normalPhi:3,radius:4,rings:2,samples:8});}catch(e){}
  V5.ao.blendIntensity=.6;composer.insertPass(V5.ao,1);}catch(e){V5.ao=null;console.info('[kanemori] GTAO unavailable, baked AO only');}
 v5ApplyQ();}catch(e){console.warn('[kanemori] v5 fx',e);}}
function v5ApplyQ(){const c=QC();if(TREE5.cedCardsLo){const lo=V5.q==="low";V5.ced.geometry=lo?TREE5.cedCardsLo:TREE5.cedCards;V5.bl.geometry=lo?TREE5.blCardsLo:TREE5.blCards;}V5U.uTile.value=c.tile;GRASS.g.instanceCount=c.grass;
 const wantSh=c.shadow>0;if(renderer.shadowMap.enabled!==wantSh){renderer.shadowMap.enabled=wantSh;scene.traverse(o=>{if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.needsUpdate=true);}});}
 if(wantSh&&sun.shadow.mapSize.x!==c.shadow){sun.shadow.mapSize.set(c.shadow,c.shadow);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}}
 renderer.setPixelRatio(c.pr);if(composer){composer.setPixelRatio?composer.setPixelRatio(c.pr):0;composer.setSize(innerWidth,innerHeight);}
 if(V5.bloom){V5.bloom.enabled=c.bloom>0;V5.bloom.strength=c.bloom||.6;}
 if(V5.paint){V5.paint.enabled=c.paint>0;V5.paint.uniforms.uRad.value=c.paint;const s=new THREE.Vector2();renderer.getDrawingBufferSize(s);V5.paint.uniforms.uRes.value.copy(s);}
 if(V5.ao)V5.ao.enabled=!!c.ao;if(V5.ferns)V5.ferns.count=Math.min(V5.ferns.instanceMatrix.count,Math.round(V5.ferns.instanceMatrix.count*c.ferns/Math.max(QCFG.high.ferns,.01)));
 MOTES.U.uCnt.value=c.motes;try{SHF.list.forEach((s,i)=>{s.q=i<SHF.list.length*c.rays;});}catch(e){}
 if(window.WATER5)WATER5.u.uQ.value=c.water;
 try{scene.traverse(o=>{if(o.isInstancedMesh&&o.instanceMatrix.count===520){if(o.userData._n0===undefined)o.userData._n0=o.count;o.count=Math.round(o.userData._n0*(c.plants||1));}});}catch(e){}LCULL.t=0;
 const sel=document.getElementById('sQual');if(sel)sel.value=V5.auto?'auto:'+V5.q:V5.q;}
function setQuality(q,keepAuto){if(!QLV.includes(q))return;V5.q=q;lsSet('km_q',q);if(!keepAuto){V5.auto=false;lsSet('km_qauto','0');}v5ApplyQ();}
addEventListener('resize',()=>{if(V5.paint){const s=new THREE.Vector2();renderer.getDrawingBufferSize(s);V5.paint.uniforms.uRes.value.copy(s);}if(V5.ao)V5.ao.setSize(innerWidth,innerHeight);});
// auto quality: two slow 2-s windows in a row drop one tier; 3 fast ones (>55) at Low/Medium allow one step back up once
function v5AutoQ(fps){if(!V5.auto)return false;V5.fpsLog=(V5.fpsLog||[]).concat(fps).slice(-6);const i=QLV.indexOf(V5.q);
 if(fps<28){V5.low=(V5.low||0)+1;V5.hi=0;if(V5.low>=2&&i>0){V5.low=0;setQuality(QLV[i-1],true);kmWarn('Frame rate '+fps.toFixed(0)+' fps: graphics quality lowered to '+V5.q.toUpperCase()+' (Settings → Graphics).');return true;}return i>0;}
 V5.low=0;if(fps>55&&i<2&&!V5.upped){V5.hi=(V5.hi||0)+1;if(V5.hi>=3){V5.hi=0;V5.upped=1;setQuality(QLV[i+1],true);}}return true;}

/* ---- per-frame ---- */
// Low/Medium: distance-cull small non-instanced meshes (houses' props, villagers, lanterns, rocks...) by layer mask, rebuilt every 15 s
const LCULL={t:0,bt:99,list:[],R:-1,_v:new V3()};
function v5CullBuild(){LCULL.list=[];scene.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o===terrain||o.isSprite)return;const g=o.geometry;if(!g||!g.attributes||!g.attributes.position)return;if(!g.boundingSphere)g.computeBoundingSphere();if(!g.boundingSphere)return;const sc=Math.max(Math.abs(o.scale.x),Math.abs(o.scale.y),Math.abs(o.scale.z));if(g.boundingSphere.radius*sc>18)return;let p=o;while(p){if(p===hero||p===camera)return;p=p.parent;}if(o.userData._lm===undefined)o.userData._lm=o.layers.mask;LCULL.list.push(o);});}
function v5LowCull(dt){const R=QC().cull||0;LCULL.t-=dt;LCULL.bt+=dt;if(R!==LCULL.R){if(!R)for(const o of LCULL.list)o.layers.mask=o.userData._lm;LCULL.R=R;LCULL.t=0;}
 if(!R||LCULL.t>0)return;LCULL.t=.4;if(LCULL.bt>15){for(const o of LCULL.list)o.layers.mask=o.userData._lm;LCULL.bt=0;v5CullBuild();}
 const cx=camera.position.x,cz=camera.position.z,R2=R*R;let n=0;for(const o of LCULL.list){const e=o.matrixWorld.elements;const dx=e[12]-cx,dz=e[14]-cz;const far=dx*dx+dz*dz>R2;o.layers.mask=far?0:o.userData._lm;if(far)n++;}V5.culled=n;}
function v5EnvUpdate(dt){try{v5LowCull(dt);}catch(e){if(!V5._cullErr){V5._cullErr=1;console.warn('[kanemori] cull',e);}}const t=performance.now()/1000;V5U.uT.value=t;V5U.uCam.value.copy(camera.position);
 const P0=V5U.uPush.value;const hp=hero.position;P0[0].set(hp.x,hp.z,RIDE&&RIDE.on?2.4:1.3,P.ground||P.swim?1:.3);
 P0[1].set(0,0,0,0);try{if(horseMesh&&horseMesh.visible&&!RIDE.on){P0[1].set(horseMesh.position.x,horseMesh.position.z,2.2,1);}}catch(e){}
 P0[2].set(0,0,0,0);if(boss.active&&boss.alive&&boss.pos.y-H(boss.pos.x,boss.pos.z)<4)P0[2].set(boss.pos.x,boss.pos.z,5.5,1);
 // nearest moving minion
 let best=null,bd=30;for(const m of minions){if(!m.alive)continue;const d=Math.hypot(m.pos.x-hp.x,m.pos.z-hp.z);if(d<bd){bd=d;best=m;}}P0[3].set(best?best.pos.x:0,best?best.pos.z:0,best?1.1:0,best?1:0);
 MOTES.U.uGround.value=meshH(camera.position.x,camera.position.z);MOTES.U.uScale.value=renderer.domElement.height*.75;
 if(composer&&!composer._v5)v5PatchFX();}
