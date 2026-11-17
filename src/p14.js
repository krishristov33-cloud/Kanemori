/* =====================================================================
   v0.4 SECTION: PREMIUM ENVIRONMENT — painted splat terrain (grass / path /
   riverbank / tri-planar rock on cliffs / snow) with detail normals, physical-
   ish sky (sun + moon disc, stars, cloud bands), time-of-day light palettes,
   height fog, texel-snapped soft shadows, forest god rays.
   ===================================================================== */
// ---- height fog (global chunk patch, before first compile) ----
{const C=THREE.ShaderChunk,base=(H(0,120)-3).toFixed(2);
 C.fog_pars_vertex='#ifdef USE_FOG\n\tvarying float vFogDepth;\n\tvarying float vFogWY;\n#endif';
 C.fog_vertex='#ifdef USE_FOG\n\tvFogDepth = - mvPosition.z;\n\tvFogWY = ( transpose( mat3( viewMatrix ) ) * ( mvPosition.xyz - viewMatrix[ 3 ].xyz ) ).y;\n#endif';
 C.fog_pars_fragment=C.fog_pars_fragment.replace('varying float vFogDepth;','varying float vFogDepth;\n\tvarying float vFogWY;');
 C.fog_fragment=C.fog_fragment.replace('gl_FragColor.rgb = mix(','float kmHF = exp( - max( vFogWY - ('+base+'), 0.0 ) * 0.05 );\n\tfogFactor = clamp( fogFactor * ( 0.5 + 0.5 * kmHF ) + kmHF * 0.22 * smoothstep( 6.0, 70.0, vFogDepth ), 0.0, 1.0 );\n\tgl_FragColor.rgb = mix(');}
// ---- painted textures (canvas, tileable) ----
function v4Tex(size,bg,draw,data){const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,size,size);
 const at=(x,y,f)=>{for(const ox of[-size,0,size])for(const oy of[-size,0,size]){if(x+ox<-40||x+ox>size+40||y+oy<-40||y+oy>size+40)continue;g.save();g.translate(x+ox,y+oy);f(g);g.restore();}};draw(g,size,at);
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=data?THREE.NoColorSpace:THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;}
const TEX4={};
TEX4.grass=v4Tex(512,'#808080',(g,s,at)=>{for(let i=0;i<260;i++){const x=R()*s,y=R()*s,r=rnd(10,40),l=rnd(38,62);at(x,y,c=>{c.fillStyle=`rgba(${l*2.55|0},${l*2.6|0},${l*2.4|0},.25)`;c.beginPath();c.ellipse(0,0,r,r*rnd(.5,1),R()*3,0,7);c.fill();});}
 for(let i=0;i<5200;i++){const x=R()*s,y=R()*s,a=R()*6.3,len=rnd(4,13),l=rnd(28,78);at(x,y,c=>{c.strokeStyle=`rgba(${l*2.5|0},${l*2.62|0},${l*2.3|0},.75)`;c.lineWidth=rnd(1,2.6);c.lineCap='round';c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(Math.cos(a+.4)*len*.5,Math.sin(a+.4)*len*.5,Math.cos(a)*len,Math.sin(a)*len);c.stroke();});}},true);
TEX4.dirt=v4Tex(512,'#8a7254',(g,s,at)=>{for(let i=0;i<300;i++){const x=R()*s,y=R()*s,r=rnd(8,46);const k=rnd(-22,22);at(x,y,c=>{c.fillStyle=`rgba(${138+k|0},${112+k|0},${80+k*.8|0},.35)`;c.beginPath();c.ellipse(0,0,r,r*rnd(.4,1),R()*3,0,7);c.fill();});}
 for(let i=0;i<1400;i++){const x=R()*s,y=R()*s,r=rnd(1,4.5),k=rnd(-30,40);at(x,y,c=>{c.fillStyle=`rgb(${120+k|0},${108+k|0},${92+k|0})`;c.beginPath();c.ellipse(0,0,r,r*rnd(.6,1),R()*3,0,7);c.fill();c.fillStyle='rgba(40,30,20,.35)';c.beginPath();c.ellipse(r*.3,r*.4,r*.9,r*.5,0,0,7);c.fill();});}
 for(let i=0;i<80;i++){const x=R()*s,y=R()*s;at(x,y,c=>{c.strokeStyle='rgba(60,45,30,.35)';c.lineWidth=rnd(1,3);c.beginPath();c.moveTo(0,0);c.lineTo(rnd(-60,60),rnd(-8,8));c.stroke();});}});
TEX4.rock=v4Tex(512,'#77757a',(g,s,at)=>{for(let y=0;y<s;y+=rnd(6,22)){const k=rnd(-26,26);g.fillStyle=`rgba(${118+k|0},${116+k|0},${124+k|0},.55)`;g.fillRect(0,y,s,rnd(4,18));}
 for(let i=0;i<420;i++){const x=R()*s,y=R()*s,w=rnd(14,70),h=rnd(6,26),k=rnd(-30,30);at(x,y,c=>{c.fillStyle=`rgba(${120+k|0},${118+k|0},${126+k|0},.5)`;c.beginPath();c.moveTo(0,0);c.lineTo(w,rnd(-4,4));c.lineTo(w*rnd(.7,1),h);c.lineTo(rnd(-6,6),h*rnd(.8,1.2));c.closePath();c.fill();c.strokeStyle='rgba(40,38,46,.45)';c.lineWidth=1.2;c.stroke();});}
 for(let i=0;i<60;i++){const x=R()*s,y=R()*s;at(x,y,c=>{c.strokeStyle='rgba(30,28,34,.55)';c.lineWidth=rnd(1,2);c.beginPath();c.moveTo(0,0);let px=0,py=0;for(let k=0;k<5;k++){px+=rnd(-14,14);py+=rnd(4,16);c.lineTo(px,py);}c.stroke();});}});
TEX4.normal=(()=>{const n=256,c=document.createElement('canvas');c.width=c.height=n;const g=c.getContext('2d');g.fillStyle='#808080';g.fillRect(0,0,n,n);
 for(let i=0;i<900;i++){const x=R()*n,y=R()*n,r=rnd(2,12),l=rnd(60,200)|0;for(const ox of[-n,0,n])for(const oy of[-n,0,n]){const gr=g.createRadialGradient(x+ox,y+oy,0,x+ox,y+oy,r);gr.addColorStop(0,`rgba(${l},${l},${l},.5)`);gr.addColorStop(1,`rgba(${l},${l},${l},0)`);g.fillStyle=gr;g.fillRect(x+ox-r,y+oy-r,2*r,2*r);}}
 const src=g.getImageData(0,0,n,n).data,out=g.createImageData(n,n),h=(x,y)=>src[(((y+n)%n)*n+((x+n)%n))*4]/255;
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const dx=(h(x+1,y)-h(x-1,y))*3,dy=(h(x,y+1)-h(x,y-1))*3,l=Math.hypot(dx,dy,1),i=(y*n+x)*4;out.data[i]=(-dx/l*.5+.5)*255;out.data[i+1]=(-dy/l*.5+.5)*255;out.data[i+2]=(1/l*.5+.5)*255;out.data[i+3]=255;}
 g.putImageData(out,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.NoColorSpace;return t;})();
// ---- terrain splat material ----
{const TM=terrain.material;TM.normalMap=TEX4.normal;TM.normalScale.set(.85,.85);TEX4.normal.repeat.set(1.6,1.6);
 TM.onBeforeCompile=sh=>{Object.assign(sh.uniforms,{tGrass:{value:TEX4.grass},tDirt:{value:TEX4.dirt},tRock:{value:TEX4.rock}});
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 splat;varying vec4 vSplat;varying vec3 vTWP;varying vec3 vTWN;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\nvSplat=splat;vTWP=(modelMatrix*vec4(transformed,1.0)).xyz;vTWN=normalize(mat3(modelMatrix)*normal);');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D tGrass;uniform sampler2D tDirt;uniform sampler2D tRock;varying vec4 vSplat;varying vec3 vTWP;varying vec3 vTWN;')
   .replace('#include <map_fragment>',`
    vec3 tn=normalize(vTWN);vec2 wp=vTWP.xz;
    float gA=texture2D(tGrass,wp*.21).g,gB=texture2D(tGrass,wp*.047+.31).g,mac=texture2D(tGrass,wp*.0068+.7).g;
    float gd=mix(gA,gB,.45)*2.;
    vec3 grassC=vColor.rgb*mix(1.,gd,.8)*(.8+.4*mac);
    vec3 dirtC=texture2D(tDirt,wp*.19).rgb*(.9+.2*mac);
    vec3 bw=pow(abs(tn),vec3(4.));bw/=(bw.x+bw.y+bw.z);
    vec3 rockC=texture2D(tRock,vTWP.zy*.09).rgb*bw.x+texture2D(tRock,wp*.09).rgb*bw.y+texture2D(tRock,vTWP.xy*.09).rgb*bw.z;
    float rockW=smoothstep(.82,.6,tn.y+(gB-.5)*.12);
    float pathW=smoothstep(.2,.75,vSplat.x+(gA-.5)*.5);
    float bankW=smoothstep(.2,.85,vSplat.y+(gB-.5)*.6);
    vec3 col=grassC;
    col=mix(col,dirtC*vec3(1.1,1.05,.98)*1.12,bankW*.7);
    col=mix(col,dirtC,pathW);
    vec3 rockM=mix(rockC,rockC*vec3(.6,.82,.48),vSplat.z*.55*smoothstep(.35,.7,tn.y));
    col=mix(col,rockM,rockW);
    col=mix(col,vec3(.93,.95,1.)*(.9+.1*gA),vSplat.w*(1.-rockW*.6));
    diffuseColor.rgb*=col;`).replace('#include <color_fragment>','');};
 TM.needsUpdate=true;}
// ---- sky: sun / moon disc, stars, cloud bands ----
Object.assign(skyU,{sunDir:{value:new V3(0,1,0)},sunCol:{value:new THREE.Color(1,.9,.7)},night:{value:0},tm:{value:0}});
sky.material.fragmentShader=`uniform vec3 top,mid,bot,sunDir,sunCol;uniform float night,tm;varying vec3 vP;
float h21(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}
void main(){vec3 d=normalize(vP);float h=d.y;vec3 c=h>0.04?mix(mid,top,smoothstep(0.04,0.55,h)):mix(bot,mid,smoothstep(-0.1,0.04,h));c+=bot*0.18*exp(-abs(h-0.02)*14.0);
 float sd=max(dot(d,sunDir),0.);float day=1.-night;
 c+=sunCol*day*(smoothstep(.9992,.9996,sd)*5.+pow(sd,28.)*.4+pow(sd,4.)*.14*(1.-smoothstep(0.,.5,h)));
 c+=vec3(.78,.85,1.)*night*(smoothstep(.9993,.9996,sd)*1.6+pow(sd,90.)*.15);
 vec3 q=floor(d*420.);float s=h21(q);c+=vec3(.85,.9,1.)*night*smoothstep(.9972,1.,s)*smoothstep(.02,.3,h)*(.55+.45*sin(tm*2.+s*300.));
 float cl=(sin(d.x*6.3+tm*.012+sin(d.z*3.1))*sin(d.z*8.7-tm*.009+sin(d.x*2.3))*.5+.5);cl=cl*cl*smoothstep(.04,.2,h)*(1.-smoothstep(.3,.65,h));
 c=mix(c,mix(mid,bot,.45)*1.18+sunCol*day*.12,cl*.32);
 gl_FragColor=vec4(c,1.0);}`;sky.material.needsUpdate=true;
// ---- lights: time-of-day palettes, softer tighter shadows, texel snapping ----
{const sc=sun.shadow.camera;sc.left=-34;sc.right=34;sc.top=34;sc.bottom=-34;sc.updateProjectionMatrix();sun.shadow.radius=3;sun.shadow.bias=-0.0004;sun.shadow.normalBias=0.04;}
const PAL={gold:new THREE.Color(0xffb067),noon:new THREE.Color(0xfff0dc),moon:new THREE.Color(0x8ea8ff),hSkyD:new THREE.Color(0xb9cff5),hSkyK:new THREE.Color(0xffbfa0),hSkyN:new THREE.Color(0x3d4f8c),hGrD:new THREE.Color(0x6b5a3a),hGrK:new THREE.Color(0x4a3030),hGrN:new THREE.Color(0x121624)};
const _pc=new THREE.Color(),_pc2=new THREE.Color(),_sx=new V3(),_sy=new V3(),_sz=new V3();
const _updSky0=updSky;
updSky=function(dt){_updSky0(dt);try{const t=S.time;const dayK=t<.667?smooth(0,.06,t)*smooth(.667,.6,t):0;const dusk=Math.max(1-Math.abs(t-.64)/.06,1-Math.abs(t-.02)/.05,0);
 const wet=S.weather==='rain'||S.weather==='cloudy'?.6:S.weather==='storm'?.9:S.weather==='fog'?.5:0;
 _sz.copy(sun.position).sub(sun.target.position).normalize();const el=_sz.y;
 _pc.copy(PAL.gold).lerp(PAL.noon,smooth(.2,.65,el)).lerp(PAL.moon,1-dayK);sun.color.copy(_pc);
 sun.intensity=lerp(.62,2.5,dayK)*(1-wet*.6);
 _pc.copy(PAL.hSkyN).lerp(PAL.hSkyD,dayK).lerp(PAL.hSkyK,dusk*.6);_pc2.copy(PAL.hGrN).lerp(PAL.hGrD,dayK).lerp(PAL.hGrK,dusk*.5);hemi.color.copy(_pc);hemi.groundColor.copy(_pc2);
 hemi.intensity=lerp(.78,1.0,dayK)*(1-wet*.2);if(flashT>0)hemi.intensity+=flashT*8;
 renderer.toneMappingExposure=lerp(1.28,1.08,dayK);
 skyU.sunDir.value.copy(_sz);skyU.sunCol.value.copy(sun.color).multiplyScalar(1-wet*.8);skyU.night.value=1-dayK;skyU.tm.value+=dt;
 // shadow texel snapping: stop the shadow map from swimming as Ren moves
 const cam=sun.shadow.camera,ts=(cam.right-cam.left)/sun.shadow.mapSize.x;_sx.crossVectors(_sz,new V3(0,1,0)).normalize();if(_sx.lengthSq()<1e-6)_sx.set(1,0,0);_sy.crossVectors(_sx,_sz).normalize();
 const tp=sun.target.position,u=tp.dot(_sx),v=tp.dot(_sy),du=Math.round(u/ts)*ts-u,dv=Math.round(v/ts)*ts-v;tp.addScaledVector(_sx,du).addScaledVector(_sy,dv);sun.position.addScaledVector(_sx,du).addScaledVector(_sy,dv);
 v4Shafts(dt,dayK,wet,el);}catch(e){if(!V4._skyErr){V4._skyErr=1;console.warn('[kanemori] v4 sky',e);}}};
// ---- god rays: soft additive light shafts between the cedars, aligned to the sun ----
const SHF={list:[],t:0};{const tex=canvasTex(64,256,(c,w,h)=>{const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.25,'rgba(255,255,255,.75)');g.addColorStop(.8,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,w,h);
  const m=c.getImageData(0,0,w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=Math.sin(x/w*Math.PI);m.data[(y*w+x)*4+3]*=k*k;}c.putImageData(m,0,0);});
 const geo=new THREE.PlaneGeometry(1,1);for(let i=0;i<14;i++){const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:tex,color:0xffe0a6,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:true}));m.matrixAutoUpdate=false;m.visible=false;m.renderOrder=1;scene.add(m);SHF.list.push({m,x:0,z:0,w:rnd(1.6,4.2),on:false});}}
function v4Shafts(dt,dayK,wet,el){SHF.t-=dt;const p=hero.position;const amt=dayK*(1-wet)*(.55+.45*(1-smooth(.25,.8,el)));
 for(const s of SHF.list){const d=Math.hypot(s.x-p.x,s.z-p.z);if(!s.on||d>55){if(SHF.t>0&&s.on)continue;const a=R()*TAU,r=rnd(10,42);const x=p.x+Math.cos(a)*r,z=p.z+Math.sin(a)*r;s.on=x<45&&z<115&&z>-150&&!inWater(x,z);s.x=x;s.z=z;s.y=H(x,z);}}
 if(SHF.t<=0)SHF.t=1.5;
 for(const s of SHF.list){const vis=s.on&&amt>.05&&s.q!==false;s.m.visible=vis;if(!vis)continue;const L=26;const c=new V3(s.x,s.y,s.z).addScaledVector(_sz,L*.5);
  const toC=camera.position.clone().sub(c).normalize();_sx.crossVectors(_sz,toC).normalize();_sy.crossVectors(_sx,_sz);
  s.m.matrix.makeBasis(_sx.clone().multiplyScalar(s.w),_sz.clone().multiplyScalar(L),_sy);s.m.matrix.setPosition(c);s.m.matrixWorldNeedsUpdate=true;
  const dd=Math.hypot(s.x-p.x,s.z-p.z);const dc=camera.position.distanceTo(new V3(s.x,s.y+6,s.z));s.m.material.opacity=.2*amt*smooth(55,30,dd)*smooth(8,20,dc);}}
