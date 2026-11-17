<script type="module">
import * as THREE from 'three';
window.__kmBooted=true;
const V3=THREE.Vector3,TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const wrapPi=a=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const $=id=>document.getElementById(id);
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const R=mulberry(1337),rnd=(a,b)=>a+(b-a)*R(),pick=a=>a[(R()*a.length)|0];
const QS=new URLSearchParams(location.search);
/* ============ LOCALIZATION: English by default, 'Show Japanese names' restores kanji/romaji ============ */
const CJK_RE=/[\u3000-\u303f\u3040-\u30ff\u3400-\u9fff\uff00-\uffef]+/;const CJK_G=new RegExp(CJK_RE.source,'g');
let SHOWJP=(()=>{try{return localStorage.getItem('km_jp')==='1'}catch(e){return false}})();
/* one English name map for romanized labels (people/place names stay) */
const NAME_EN=[['Hankyū short bow','Short bow'],['Daikyū longbow','Longbow'],['Hankyū','Short bow'],['Daikyū','Longbow'],['Yumi Bow','Bow mastery'],['Yumi bow','Short bow'],
 ['Yari spear','Spear'],['Yari','Spear'],['Throwing kunai','Throwing knife'],['Kunai','Throwing knives'],['kunai','knives'],['Bokken (wood)','Wooden sword'],['Bokken','Wooden sword'],['Katana','Steel sword'],
 ['Yomogi herb','Mugwort herb'],['Yomogi','Mugwort'],['Kodama sap','Spirit sap'],['Jorōgumo silk','Spider silk'],['Fire ofuda','Fire charm'],['Fire Ofuda','Fire Charm'],['Earth Wall talisman','Earth Wall charm'],['Ofuda','Charm'],['ofuda','charm'],
 ['Way of the Kami','Way of the Spirits'],['Kami branch','Spirit branch'],['Kami','Spirit'],['kami','spirits'],['Kakera','Bell shards'],['kakera','bell shards'],['Kodama','Tree spirit'],['kodama','tree spirit'],
 ['Grilled ayu','Grilled fish'],['Ayu','Grilled fish'],['ayu','grilled fish'],['tanuki trickster','raccoon-dog trickster'],['mushroom yokai','mushroom monster'],['Mushroom yokai','Mushroom monster'],['Tanuki','Raccoon-dog'],['tanuki','raccoon-dog'],['Yokai','Monsters'],['yokai','monsters'],['torii','shrine gate'],['Torii','Shrine gate'],[' mon',' coins']];
const NAME_RE=(()=>{const v=[];for(const[a,b]of NAME_EN){v.push([a,b]);if(a!==a.toUpperCase())v.push([a.toUpperCase(),b.toUpperCase()]);}v.sort((x,y)=>y[0].length-x[0].length);const map=new Map(v);
 const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return{map,re:new RegExp('(?<![A-Za-zÀ-ž])('+v.map(x=>esc(x[0])).join('|')+')(?![A-Za-zÀ-ž])','g')};})();
const EN=s=>String(s).replace(NAME_RE.re,m=>NAME_RE.map.get(m)||m);
const J=s=>{s=String(s==null?'':s);if(SHOWJP)return s;return EN(s).replace(CJK_G,'').replace(/\(\s*\)/g,'').replace(/^[\s·—:-]+|[\s·—:-]+$/g,'').replace(/\s*·\s*·\s*/g,' · ').replace(/\s{2,}/g,' ').trim();};
function wrapJP(root){const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),list=[];while(w.nextNode()){const n=w.currentNode;if(CJK_RE.test(n.nodeValue)&&!(n.parentNode&&n.parentNode.classList&&n.parentNode.classList.contains('jpx')))list.push(n);}
 for(const n of list){const f=document.createDocumentFragment();n.nodeValue.split(new RegExp('('+CJK_RE.source+')')).forEach(part=>{if(!part)return;if(CJK_RE.test(part)){const sp=document.createElement('span');sp.className='jpx';sp.textContent=part;f.appendChild(sp);}else f.appendChild(document.createTextNode(part));});n.parentNode.replaceChild(f,n);}}
const JP_ORIG=new WeakMap();
function enNode(n){if(SHOWJP)return;const p=n.parentNode;if(!p||p.closest&&p.closest('textarea,input,.tkl.me,script,style'))return;const v=n.nodeValue;if(!v||!NAME_RE.re.test(v)){NAME_RE.re.lastIndex=0;return;}NAME_RE.re.lastIndex=0;const nv=EN(v);if(nv!==v){if(!JP_ORIG.has(n))JP_ORIG.set(n,v);n.nodeValue=nv;}}
function enTree(root){const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const l=[];while(w.nextNode())l.push(w.currentNode);l.forEach(enNode);}
const ENOBS=new MutationObserver(ms=>{if(SHOWJP)return;for(const m of ms){if(m.type==='characterData')enNode(m.target);else for(const a of m.addedNodes){if(a.nodeType===3)enNode(a);else if(a.nodeType===1)enTree(a);}}});
function setJP(on){SHOWJP=on;try{localStorage.setItem('km_jp',on?'1':'0')}catch(e){}document.body.classList.toggle('showjp',on);
 if(on){const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);while(w.nextNode()){const n=w.currentNode;if(JP_ORIG.has(n)){n.nodeValue=JP_ORIG.get(n);JP_ORIG.delete(n);}}}else enTree(document.body);
 if(!ENOBS._on){ENOBS.observe(document.body,{subtree:true,childList:true,characterData:true});ENOBS._on=1;}}
const lsGet=k=>{try{return localStorage.getItem(k)}catch(e){return null}},lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};

/* ============ DATA (data-driven so later regions slot in) ============ */
const REGIONS=[ // map coords: x,z centre, radius; playable:true only in v0.1 slice
 {id:'kanemura',jp:'鐘村',en:'Kanemura',sub:'Shrine town at the foot of the mountain',x:0,z:150,r:38,playable:true},
 {id:'sugi',jp:'杉の森',en:'Sugi no Mori',sub:'The giant cedar forest',x:-60,z:20,r:95,playable:true},
 {id:'kawa',jp:'川',en:'Kawa River',sub:'The river that runs from the falls',x:80,z:20,r:40,playable:true},
 {id:'taki',jp:'滝壺',en:'Taki Pool',sub:'Where the river falls from the upper mountain',x:66,z:-112,r:24,playable:true},
 {id:'web',jp:'女郎蜘蛛の巣',en:"Jorōgumo's Web",sub:'Boss seal · Kakera 1',x:-85,z:-100,r:30,playable:true,boss:'jorogumo'},
 // sealed regions (shown on the scroll map only)
 {id:'kurayami',jp:'暗闇洞',en:'Kurayami Caves',boss:'Ōmukade',mx:.16,my:.42},{id:'kawagorge',jp:'川峡',en:'Kawa Gorge',boss:'Kappa Shōgun',mx:.82,my:.46},
 {id:'takinokami',jp:'滝の神',en:'Taki no Kami',boss:'Koi Ryū',mx:.62,my:.33},{id:'hotaru',jp:'蛍潟',en:'Hotaru Lagoon',boss:'Ningyo',mx:.1,my:.7},
 {id:'arashi',jp:'嵐海岸',en:'Arashi Coast',boss:'Umibōzu',mx:.88,my:.82},{id:'take',jp:'竹高原',en:'Take Highlands',boss:'Kamaitachi',mx:.3,my:.24},
 {id:'yuki',jp:'雪の峰',en:'Yuki no Mine',boss:'Yuki-onna',mx:.5,my:.1}];
const ITEMS={wood:['🪵','Cedar wood'],stone:['🪨','Stone'],flint:['🔥','Flint'],iron:['⛓️','Iron ore'],fiber:['🌾','Plant fiber'],herb:['🌿','Yomogi herb'],mushroom:['🍄','Mushroom'],
 sap:['💧','Kodama sap'],hide:['🟫','Hide'],meat:['🥩','Raw meat'],fish:['🐟','Raw fish'],silk:['🕸️','Jorōgumo silk'],bamboo:['🎋','Bamboo'],ofuda:['📜','Fire ofuda'],
 salve:['🩹','Healing salve'],tea:['🍵','Fever tea'],tonic:['🧪','Stamina tonic'],gfish:['🍢','Grilled ayu'],gmeat:['🍖','Venison skewer'],skewer:['🍲','Mushroom stew']};
const WEAPONS={ // Krea balance v0.1
 bokken:{name:'Bokken (wood)',icon:'🪵',dmg:8,heavy:18,stL:10,stH:22,combo:3,speed:1.0,reach:2.3,arc:1.1,len:1.0,col:0x9a7148},
 katana:{name:'Katana',icon:'🗡️',dmg:14,heavy:32,stL:12,stH:25,combo:4,speed:1.18,reach:2.7,arc:1.15,len:1.15,col:0xdfe6f0},
 yari:{name:'Yari spear',icon:'🔱',dmg:12,heavy:28,stL:12,stH:24,combo:3,speed:0.95,reach:3.0,arc:0.55,len:2.3,col:0xc9d0da}};
const RECIPES=[
 {cat:'Weapons',id:'katana',out:'w:katana',cost:{iron:3,wood:2,hide:1},need:'forge',ds:'Balanced, fast. Light 14 / heavy 32, 4-hit combo.'},
 {cat:'Weapons',id:'yari',out:'w:yari',cost:{iron:2,bamboo:3,fiber:1},need:'forge',ds:'Reach 3 m. Light 12 / heavy thrust 28.'},
 {cat:'Camp',id:'campfire',out:'b:campfire',cost:{wood:3,stone:1},ds:'Place with B. Warmth, dries you, cooks. Rain puts it out unless under a lean-to.'},
 {cat:'Camp',id:'leanto',out:'b:leanto',cost:{wood:4,fiber:2},ds:'Place with B. Blocks rain, storm-safe while under it, keeps a fire lit, respawn point.'},
 {cat:'Remedies',id:'salve',out:'salve',cost:{herb:2,sap:1},ds:'Healing salve: +40 HP over 3 s.'},
 {cat:'Remedies',id:'tea',out:'tea',cost:{herb:1,mushroom:1},need:'fire',ds:'Fever tea: warmth stops draining for 90 s.'},
 {cat:'Remedies',id:'tonic',out:'tonic',cost:{herb:1,sap:2},ds:'Stamina tonic: stamina regen ×2 for 60 s.'},
 {cat:'Cooking',id:'gfish',out:'gfish',cost:{fish:1},need:'fire',ds:'Grilled ayu: +25 hunger, +10 HP.'},
 {cat:'Cooking',id:'gmeat',out:'gmeat',cost:{meat:1},need:'fire',ds:'Venison skewer: +35 hunger, +10% damage for 2 min.'},
 {cat:'Cooking',id:'skewer',out:'skewer',cost:{mushroom:2,meat:1},need:'fire',ds:'Mushroom stew: +40 hunger, +30 warmth, +30 HP over 30 s.'}];
const FOOD={gfish:{hun:25,hp:10},gmeat:{hun:35},skewer:{hun:40,warm:30,hp:30,slow:1},fish:{hun:8},meat:{hun:6,hp:-4},mushroom:{hun:5},herb:{hun:3,hp:3}};
const SKILLS={ // Krea's 12 nodes
 blade:{jp:'剣の道',en:'Way of the Blade',col:'#ff7a6a',nodes:[{id:'keen',n:'Keen Edge',d:'+10% melee damage'},{id:'parry2',n:'Bell Parry',d:'Perfect parry window 0.18 → 0.22 s'},{id:'counter',n:'Bell Counter',d:'After a perfect parry, the next hit deals ×3'}]},
 hunter:{jp:'狩人の道',en:'Way of the Hunter',col:'#9df59d',nodes:[{id:'skinner',n:'Skinner',d:'+1 to all loot from wildlife'},{id:'bow',n:'Yumi Bow',d:'Unlocks bow + arrow recipes. LMB quick shot, RMB power shot, hunts deer'},{id:'stealth',n:'Silent Step',d:'Yokai notice you from 50% closer'}]},
 kami:{jp:'神の道',en:'Way of the Kami',col:'#7fc8ff',nodes:[{id:'fire',n:'Fire Ofuda',d:'X: 15 spirit, 25 dmg + burn 4/s for 3 s, lights fires. ×1.5 vs Jorōgumo'},{id:'well',n:'Spirit Well',d:'+25 max spirit'},{id:'earth',n:'Earth Wall',d:'Z: 20 spirit. Raises a stone wall that blocks yokai and counts as storm cover for 30 s'}]},
 hearth:{jp:'炉の道',en:'Way of the Hearth',col:'#ffb347',nodes:[{id:'thrift',n:'Thrift',d:'Crafting uses 1 fewer of the most common material'},{id:'feast',n:'Long Feast',d:'Cooked food buffs last twice as long'},{id:'hut',n:'Hut Craft',d:'A lean-to counts as a full hut: no lightning damage at all'}]}};
const MINION_DEF={
 kodama:{hp:20,speed:5.2,flee:true,xp:5,loot:[['sap',1,1],['herb',0,1]],scale:1},
 tanuki:{hp:45,speed:3.7,aggro:14,reach:2.0,tell:0.5,dmg:10,cd:1.7,xp:15,loot:[['hide',0,1],['meat',0,1],['fiber',0,2]]},
 mushroom:{hp:60,speed:1.5,aggro:11,reach:3.6,tell:1.0,dmg:8,cd:2.4,xp:20,loot:[['mushroom',1,2],['herb',0,1]]},
 spiderling:{hp:15,speed:5,aggro:40,reach:1.6,tell:0.35,dmg:6,cd:1.2,xp:4,loot:[['fiber',0,1]]},
 deer:{hp:30,speed:8,flee:true,animal:true,xp:3,loot:[['meat',2,2],['hide',1,1]]}};
const QUEST=[
 {t:'Gather supplies',s:'Collect 3 wood (chop cedars) and 3 plant fiber. Walk up to things and press E.',chk:S=>S.stat.gWood>=3&&S.stat.gFiber>=3},
 {t:'Make camp',s:'Craft a campfire (I) — 3 wood + 1 stone — then place it with B.',chk:S=>S.stat.fires>=1},
 {t:'Drive back the yokai',s:'Defeat 3 forest yokai (tanuki, mushroom yokai or kodama). Tap F just as they strike to PARRY.',chk:S=>S.stat.kills>=3},
 {t:'Forge a real weapon',s:'Craft a katana (3 iron ore from the rust rocks by the river, 2 wood, 1 hide) or a yari, near a lit fire or the Kanemura forge.',chk:S=>S.weapons.length>1},
 {t:'Survive the storm',s:'A storm is coming. Build a lean-to (B) and keep a fire going. Lightning strikes the exposed.',chk:S=>S.stat.stormsSurvived>=1},
 {t:'Find the web',s:"Follow the gold marker north-west to Jorōgumo's web in the deep cedars.",chk:S=>S.stat.foundWeb},
 {t:'Defeat Jorōgumo',s:'Cut her glowing anchor threads to drop her. Fire ofuda (X) hit her anywhere (×1.5). Phase II: parry the 3rd leg strike.',chk:S=>S.shards>=1},
 {t:'The first kakera is yours',s:'Seven more wait on Nemuriyama (v0.2+). Explore, hunt, fish, level up.',chk:()=>false}];

/* ============ RENDERER (Mountain Drop setup) ============ */
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});}
catch(e){try{renderer=new THREE.WebGLRenderer({antialias:false});}catch(e2){kmFatal('WebGL could not start: '+(e2.message||e2),'Turn on hardware acceleration in the browser settings, update the graphics driver, then reload.');throw e2;}}
renderer.domElement.id='gl';
renderer.debug.onShaderError=(gl,program,vs,fs)=>{kmFatal('A shader failed to compile on this GPU.',(gl.getProgramInfoLog(program)||'').slice(0,1500));try{FXQ.on=false}catch(e){}};
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();kmFatal('The GPU reset the WebGL context.','Reload the page. If it repeats, turn post FX off in the pause menu.');});
const PR_MAX=Math.min(devicePixelRatio||1,1.5);renderer.setPixelRatio(PR_MAX);renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
document.body.prepend(renderer.domElement);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,0.1,1800);
let composer=null;const FXQ={on:lsGet('km_fx')!=='0'&&QS.get('fx')!=='0'};
async function initFX(){try{const A=KM_CDN.base+'examples/jsm/';
 const [{EffectComposer},{RenderPass},{UnrealBloomPass},{ShaderPass},{OutputPass}]=await Promise.all(['postprocessing/EffectComposer.js','postprocessing/RenderPass.js','postprocessing/UnrealBloomPass.js','postprocessing/ShaderPass.js','postprocessing/OutputPass.js'].map(p=>import(A+p)));
 const c=new EffectComposer(renderer);c.addPass(new RenderPass(scene,camera));ripplePass=new ShaderPass(RIPPLE_SHADER);ripplePass.enabled=false;c.addPass(ripplePass);c.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth/2,innerHeight/2),0.6,0.55,0.84));
 c.addPass(new ShaderPass({uniforms:{tDiffuse:{value:null},vig:{value:0.35},lift:{value:new THREE.Color(0x101a48)},sat:{value:1.08}},
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`precision highp float;uniform sampler2D tDiffuse;uniform float vig;uniform float sat;uniform vec3 lift;varying vec2 vUv;
  void main(){vec4 c=texture2D(tDiffuse,vUv);float l=dot(c.rgb,vec3(0.2126,0.7152,0.0722));c.rgb=mix(vec3(l),c.rgb,sat);c.rgb+=lift*(1.0-smoothstep(0.0,0.25,l))*0.5;c.rgb*=mix(vec3(0.93,0.98,1.07),vec3(1.06,1.0,0.92),smoothstep(0.04,0.7,l));vec2 d=(vUv-0.5)*vec2(1.2,1.0);c.rgb*=1.0-vig*smoothstep(0.3,0.9,length(d));gl_FragColor=c;}`}));
 c.addPass(new OutputPass());c.setSize(innerWidth,innerHeight);c.render();composer=c;}
 catch(e){composer=null;kmWarn('Post FX unavailable, running without it: '+(e&&e.message||e));}}
function renderFrame(){try{renderWithRipple();}catch(e){composer=null;kmWarn('Post FX failed and was turned off.');renderer.setRenderTarget(null);renderer.render(scene,camera);}}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);if(composer)composer.setSize(innerWidth,innerHeight);});
scene.fog=new THREE.Fog(0x38457a,30,260);
const hemi=new THREE.HemisphereLight(0x93a6e8,0x1a2234,1.4);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffe0b8,1.2);scene.add(sun);scene.add(sun.target);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);{const sc=sun.shadow.camera;sc.left=-40;sc.right=40;sc.top=40;sc.bottom=-40;sc.near=1;sc.far=260;}
sun.shadow.bias=-0.0006;sun.shadow.normalBias=0.06;
const skyU={top:{value:new THREE.Color(0x0e1640)},mid:{value:new THREE.Color(0x2c356c)},bot:{value:new THREE.Color(0x6d5f98)}};
const sky=new THREE.Mesh(new THREE.SphereGeometry(1000,24,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:skyU,
 vertexShader:`varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
 fragmentShader:`uniform vec3 top,mid,bot;varying vec3 vP;void main(){float h=vP.y;vec3 c=h>0.04?mix(mid,top,smoothstep(0.04,0.55,h)):mix(bot,mid,smoothstep(-0.1,0.04,h));c+=bot*0.18*exp(-abs(h-0.02)*14.0);gl_FragColor=vec4(c,1.0);}`}));
sky.renderOrder=-1;scene.add(sky);
const std=(c,o={})=>new THREE.MeshStandardMaterial({color:c,flatShading:true,roughness:0.85,...o});
const emis=(c,i=1.6,o={})=>new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:i,flatShading:true,...o});
function canvasTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function mergeColored(parts){ // [{g:geometry,c:color}] -> one non-indexed geometry with vertex colours
 const pos=[],nor=[],col=[];for(const p of parts){const g=p.g.index?p.g.toNonIndexed():p.g;g.computeVertexNormals();const P=g.attributes.position.array,N=g.attributes.normal.array,c=new THREE.Color(p.c);
  for(let i=0;i<P.length;i+=3){pos.push(P[i],P[i+1],P[i+2]);nor.push(N[i],N[i+1],N[i+2]);const v=p.jit?1+(R()-.5)*p.jit:1;col.push(c.r*v,c.g*v,c.b*v);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));return g;}

/* ============ TERRAIN ============ */
const hash=(x,z)=>{const s=Math.sin(x*127.1+z*311.7)*43758.5453;return s-Math.floor(s);};
function vnoise(x,z){const xi=Math.floor(x),zi=Math.floor(z),xf=x-xi,zf=z-zi,u=xf*xf*(3-2*xf),v=zf*zf*(3-2*zf);
 return lerp(lerp(hash(xi,zi),hash(xi+1,zi),u),lerp(hash(xi,zi+1),hash(xi+1,zi+1),u),v);}
const fbm=(x,z)=>vnoise(x,z)*.55+vnoise(x*2.1,z*2.1)*.28+vnoise(x*4.3,z*4.3)*.17;
const RIVX=z=>72+16*Math.sin(z*0.017)+7*Math.sin(z*0.05+1);
const FALL_Z=-117;
const slopeH=z=>(-z)*0.11+smooth(-111,-119,z)*16;
const bedH=z=>slopeH(z)-2.6;
const FLATS=[{x:0,z:150,r:34},{x:-85,z:-100,r:24},{x:66,z:-104,r:12,pool:1}];// pool floor is deep (swimmable)
const ridgeN=(x,z)=>{const n=1-Math.abs(vnoise(x,z)*2-1);return n*n;};
function baseH(x,z){let h=slopeH(z)+fbm(x*0.013+3,z*0.013)*16-7;
 // v0.4 heightmap detail: ridged highlands, terraced cliff bands, erosion gullies, micro relief (calm near the village and the path)
 const calm=Math.max(1-smooth(28,62,Math.hypot(x,z-140)),1-smooth(3,13,pathDist(x,z))),wild=1-calm;
 h+=(ridgeN(x*.018+7,z*.018-3)*.65+ridgeN(x*.043,z*.043)*.35)*8*smooth(-4,12,h)*(1-calm*.85);
 if(h>5){const T=5.2,t=h/T,f=Math.floor(t),fr=t-f;h=lerp(h,(f+smooth(.28,.72,fr))*T,.6*smooth(5,11,h)*wild);}
 h-=Math.pow(1-Math.abs(vnoise(x*.055+11,z*.055)*2-1),5)*1.8*wild*smooth(-6,6,h);
 h+=(vnoise(x*.15,z*.15)-.5)*.75*(1-calm*.7)+(vnoise(x*.42+5,z*.42)-.5)*.16;
 h+=Math.pow(Math.max(0,Math.abs(x)-145)/55,2)*45;h+=Math.pow(Math.max(0,-z-150)/45,2)*55;h-=Math.max(0,z-172)*0.55;return h;}
function H(x,z){let h=baseH(x,z);
 for(const f of FLATS){const d=Math.hypot(x-f.x,z-f.z);if(d<f.r){const t=f.pool?bedH(f.z)-3.4:baseH(f.x,f.z);h=lerp(h,t,1-smooth(f.r*0.55,f.r,d));}}
 const dx=Math.abs(x-RIVX(z));if(z<178){const k=(1-smooth(5,15,dx))*(z<FALL_Z-1?1:1);h=lerp(h,Math.min(h,bedH(z)-(dx<5?0.6*(1-dx/5):0)),k);}
 return h;}
const WATER_SEA=-19.5;
const riverY=z=>bedH(z)+1.15;
function inWater(x,z){const dx=Math.abs(x-RIVX(z));return (dx<6.2&&z<178)||Math.hypot(x-66,z+104)<8;}
const pathPts=[[0,128],[-8,100],[-22,70],[-30,40],[-45,10],[-55,-25],[-70,-60],[-82,-88]];
function pathDist(x,z){let best=1e9;for(let i=0;i<pathPts.length-1;i++){const[a,b]=pathPts[i],[c,d]=pathPts[i+1];const vx=c-a,vz=d-b,t=clamp(((x-a)*vx+(z-b)*vz)/(vx*vx+vz*vz),0,1);best=Math.min(best,Math.hypot(x-a-vx*t,z-b-vz*t));}return best;}
const WMIN=-195,WMAX=195,ZMIN=-165,ZMAX=182;
const TSIZE=420,TSEG=240;
// v0.4 terrain: indexed + smooth-shaded, painted vertex palette + splat weights (path, riverbank, forest moss) for the detail shader in p14
const terrain=(()=>{const g=new THREE.PlaneGeometry(TSIZE,TSIZE,TSEG,TSEG);g.rotateX(-Math.PI/2);const p=g.attributes.position,uv=g.attributes.uv;
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,H(x,z));uv.setXY(i,x/5,z/5);}
 g.computeVertexNormals();const N=g.attributes.normal,col=new Float32Array(p.count*3),spl=new Float32Array(p.count*4),c=new THREE.Color();
 const cG=new THREE.Color(0x5c8a4a),cG2=new THREE.Color(0x7f9a4e),cF=new THREE.Color(0x35553a),cR=new THREE.Color(0x6b6a72),cS=new THREE.Color(0xa8987a),cP=new THREE.Color(0x8a7558),cSn=new THREE.Color(0xe6ecf6),cM=new THREE.Color(0x4a6b3a);
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=p.getY(i),ny=N.getY(i);
  const forest=x<45&&z<115&&z>-150;c.copy(forest?cF:cG).lerp(forest?cM:cG2,fbm(x*.045,z*.045)*.8);c.lerp(cM,smooth(.55,.75,fbm(x*.11+4,z*.11))*.35);
  const pd=pathDist(x,z),pw=1-smooth(1.6,3.2,pd);const rd=Math.abs(x-RIVX(z)),bank=z<178?1-smooth(6.5,11,rd):0;
  if(Math.hypot(x-66,z+104)<13)spl[i*4+1]=Math.max(spl[i*4+1],1-smooth(8,13,Math.hypot(x-66,z+104)));
  if(y<WATER_SEA+2.5){c.copy(cS);spl[i*4+1]=1;}
  if(ny<0.8)c.lerp(cR,smooth(.8,.62,ny)*.5);
  if(y>26)c.lerp(cSn,smooth(26,34,y));
  const v=0.95+hash(x,z)*0.08;col[i*3]=c.r*v;col[i*3+1]=c.g*v;col[i*3+2]=c.b*v;
  spl[i*4]=pw;spl[i*4+1]=Math.max(spl[i*4+1],bank);spl[i*4+2]=forest?1:0;spl[i*4+3]=smooth(26,34,y);}
 g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('splat',new THREE.BufferAttribute(spl,4));
 const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.93}));m.receiveShadow=true;scene.add(m);return m;})();
// sea
const sea=new THREE.Mesh(new THREE.PlaneGeometry(1600,900),new THREE.MeshStandardMaterial({color:0x3f7cab,roughness:.25,metalness:.1,transparent:true,opacity:.92,flatShading:true}));
sea.rotation.x=-Math.PI/2;sea.position.set(0,WATER_SEA,560);scene.add(sea);
// river ribbon + falls
const waterMat=new THREE.MeshStandardMaterial({color:0x2a7fa0,roughness:.15,metalness:.15,transparent:true,opacity:.82,emissive:0x0a2a40,emissiveIntensity:.4});
const river=(()=>{const pos=[],idx=[];let n=0;for(let z=-170;z<=182;z+=2){const x=RIVX(z),y=riverY(z);pos.push(x-6.5,y,z,x+6.5,y,z);if(n>0)idx.push(n*2-2,n*2-1,n*2,n*2-1,n*2+1,n*2);n++;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();const m=new THREE.Mesh(g,waterMat);scene.add(m);return m;})();
const pool=new THREE.Mesh(new THREE.CircleGeometry(9,20),waterMat);pool.rotation.x=-Math.PI/2;pool.position.set(66,riverY(-104)-0.4,-104);scene.add(pool);
const fallTex=canvasTex(64,256,(c,w,h)=>{c.fillStyle='#6fc6e6';c.fillRect(0,0,w,h);for(let i=0;i<70;i++){c.fillStyle=`rgba(255,255,255,${.25+R()*.5})`;c.fillRect(R()*w,R()*h,1+R()*3,10+R()*40);}});
fallTex.wrapS=fallTex.wrapT=THREE.RepeatWrapping;
const falls=new THREE.Mesh(new THREE.PlaneGeometry(13,17,1,1),new THREE.MeshStandardMaterial({map:fallTex,transparent:true,opacity:.88,emissive:0x5fb8d8,emissiveIntensity:.35,side:THREE.DoubleSide}));
falls.position.set(RIVX(FALL_Z),(riverY(-112)+riverY(-121))/2,FALL_Z);falls.rotation.x=-0.25;scene.add(falls);
const mist=[];for(let i=0;i<10;i++){const s=new THREE.Mesh(new THREE.IcosahedronGeometry(1.6+R()*1.4,0),new THREE.MeshBasicMaterial({color:0xe8f6ff,transparent:true,opacity:.25,depthWrite:false}));s.position.set(RIVX(-110)+rnd(-6,6),riverY(-110),-110+rnd(-4,4));scene.add(s);mist.push(s);}

/* ============ PROPS: cedars, grass, rocks, town ============ */
const cedarGeo=mergeColored([{g:new THREE.CylinderGeometry(.28,.45,5,6).translate(0,2.5,0),c:0x5a3b2a},
 {g:new THREE.ConeGeometry(2.6,4.2,7).translate(0,4.6,0),c:0x24452f,jit:.15},{g:new THREE.ConeGeometry(2.1,3.6,7).translate(0,6.8,0),c:0x2b5236,jit:.15},{g:new THREE.ConeGeometry(1.5,3.2,7).translate(0,8.8,0),c:0x32603d,jit:.15},{g:new THREE.ConeGeometry(.8,2.4,6).translate(0,10.6,0),c:0x3a6b44}]);
const vmat=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.9});
const trees=[];// {x,z,s,i,wood,regrow}
const colliders=[];// {x,z,r,ref}
const GRID=12,grid=new Map();const gk=(x,z)=>((Math.floor(x/GRID)+100)*1000+(Math.floor(z/GRID)+100));
function gAdd(o){const k=gk(o.x,o.z);if(!grid.has(k))grid.set(k,[]);grid.get(k).push(o);}
function gNear(x,z,r,out=[]){out.length=0;const c=Math.ceil(r/GRID);const cx=Math.floor(x/GRID),cz=Math.floor(z/GRID);for(let i=-c;i<=c;i++)for(let j=-c;j<=c;j++){const a=grid.get((cx+i+100)*1000+(cz+j+100));if(a)for(const o of a)out.push(o);}return out;}
function nearFlat(x,z,pad=4){return FLATS.some(f=>Math.hypot(x-f.x,z-f.z)<f.r+pad);}
for(let i=0;i<5200&&trees.length<1100;i++){const x=rnd(WMIN,WMAX),z=rnd(ZMIN+5,170);const forest=x<45&&z<115;
 const dens=forest?0.85:0.12;if(R()>dens)continue;if(Math.abs(x-RIVX(z))<11||pathDist(x,z)<4.5||nearFlat(x,z,forest?-2:4))continue;
 if(Math.hypot(x+85,z+100)<17)continue;const y=H(x,z);if(y<WATER_SEA+3)continue;
 const s=forest?rnd(1.1,1.9):rnd(.8,1.3);trees.push({x,z,y,s,rot:R()*TAU,wood:3,regrow:0,kind:'tree'});}
/* v0.3 wind sway (vertex shader, instanced) */
const WIND={t:{value:0}};function windMat(base,amp=.12){const m=base.clone();m.onBeforeCompile=sh=>{sh.uniforms.uWT=WIND.t;sh.vertexShader='uniform float uWT;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\nvec3 ip=vec3(instanceMatrix[3]);\n#else\nvec3 ip=vec3(0.);\n#endif\nfloat hh=max(transformed.y,0.);transformed.x+=sin(uWT*1.7+ip.x*.31+ip.z*.17)*'+amp.toFixed(3)+'*hh;transformed.z+=cos(uWT*1.3+ip.z*.29)*'+(amp*.6).toFixed(3)+'*hh;');};m.customProgramCacheKey=()=>'wind'+amp;return m;}
const treeMesh=new THREE.InstancedMesh(cedarGeo,windMat(vmat,.012),trees.length);treeMesh.castShadow=true;treeMesh.receiveShadow=true;
const _m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_s=new V3(),_p=new V3(),_e=new THREE.Euler();
function setTree(i,shake=0){const t=trees[i];const stump=t.wood<=0;_p.set(t.x,t.y-.1,t.z);_e.set(shake*0.05,t.rot,shake*0.04);_q.setFromEuler(_e);const s=t.s;_s.set(s,stump?0.09:s,s);_m.compose(_p,_q,_s);treeMesh.setMatrixAt(i,_m);treeMesh.instanceMatrix.needsUpdate=true;}
trees.forEach((t,i)=>{t.i=i;setTree(i);const c={x:t.x,z:t.z,r:.55*t.s,ref:t};colliders.push(c);gAdd(t);});
scene.add(treeMesh);
// grass tufts (instanced, cheap)
{const gg=mergeColored([{g:new THREE.ConeGeometry(.12,.7,3).translate(0,.35,0),c:0x6a9a52},{g:new THREE.ConeGeometry(.1,.55,3).rotateZ(.3).translate(.12,.25,0),c:0x5d8c48},{g:new THREE.ConeGeometry(.1,.6,3).rotateZ(-.3).translate(-.1,.28,.05),c:0x79a85d}]);
 const N=4200,im=new THREE.InstancedMesh(gg,windMat(vmat,.16),N);let n=0;for(let i=0;i<N*3&&n<N;i++){const x=rnd(-190,190),z=rnd(-160,175);if(inWater(x,z)||pathDist(x,z)<2)continue;const y=H(x,z);if(y<WATER_SEA+2.5||y>24)continue;
  _p.set(x,y,z);_e.set(0,R()*TAU,0);_q.setFromEuler(_e);const s=rnd(.7,1.6);_s.set(s,s,s);_m.compose(_p,_q,_s);im.setMatrixAt(n++,_m);}im.count=n;im.visible=false;/* v0.5: replaced by the GPU grass field */scene.add(im);}
// web-arena canopy darkness & distant ridges
const ridges=new THREE.Group();scene.add(ridges);
[[900,0x4b5389,90,190],[700,0x363f76,50,140]].forEach(([Rr,col,base,amp])=>{const N=160,pos=[],idx=[];for(let i=0;i<=N;i++){const a=i/N*TAU,hh=base+amp*(0.5+0.5*Math.sin(a*3.1+Rr))*fbm(i*.21,Rr*.01)*1.4+(a>Math.PI*1.25&&a<Math.PI*1.75?amp*1.6*Math.sin((a-Math.PI*1.25)*2*Math.PI):0);
 pos.push(Math.cos(a)*Rr,-40,Math.sin(a)*Rr,Math.cos(a)*Rr,hh,Math.sin(a)*Rr);if(i<N)idx.push(i*2,i*2+1,i*2+2,i*2+1,i*2+3,i*2+2);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:col,fog:false,side:THREE.DoubleSide}));ridges.add(m);});
// Kanemura town
const town=new THREE.Group();scene.add(town);const lamps=[];
function house(x,z,rot,w=6,d=5){const g=new THREE.Group(),y=H(x,z);g.position.set(x,y,z);g.rotation.y=rot;
 const b=new THREE.Mesh(new THREE.BoxGeometry(w,3,d),std(0xd9cdb4));b.position.y=1.5;b.castShadow=b.receiveShadow=true;g.add(b);
 const r=new THREE.Mesh(new THREE.CylinderGeometry(0,w*.78,2.2,4,1),std(0x33384f));r.rotation.y=Math.PI/4;r.scale.z=d/w;r.position.y=4.1;r.castShadow=true;g.add(r);
 const win=new THREE.Mesh(new THREE.PlaneGeometry(1.4,1),emis(0xffb35a,1.4));win.position.set(0,1.6,d/2+.01);g.add(win);town.add(g);colliders.push({x,z,r:Math.max(w,d)*.55});return g;}
house(-16,140,.3);house(16,138,-.4,7,5);house(-14,164,2.9);house(18,165,3.4,5,5);house(-26,152,1.6,5,4);
function torii(x,z,rot,s=1){const g=new THREE.Group(),m=std(0xe3402c,{emissive:0x5a0a00,emissiveIntensity:.3});g.position.set(x,H(x,z),z);g.rotation.y=rot;g.scale.setScalar(s);
 for(const sx of[-2.2,2.2]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.22,.26,5.2,8),m);p.position.set(sx,2.6,0);p.castShadow=true;g.add(p);}
 const t=new THREE.Mesh(new THREE.BoxGeometry(6.4,.42,.55),std(0x1c1c22));t.position.y=5.3;g.add(t);const t2=new THREE.Mesh(new THREE.BoxGeometry(5.4,.3,.35),m);t2.position.y=4.5;g.add(t2);scene.add(g);return g;}
torii(-2,124,.2);torii(-24,62,.5,.9);torii(-58,-30,.4,.9);torii(-78,-80,.6,1.1);
// broken bell frame
{const g=new THREE.Group();g.position.set(4,H(4,150),150);const wm=std(0x5a3b2a);for(const sx of[-2.4,2.4]){const p=new THREE.Mesh(new THREE.BoxGeometry(.5,6,.5),wm);p.position.set(sx,3,0);g.add(p);}
 const beam=new THREE.Mesh(new THREE.BoxGeometry(6.4,.6,.7),wm);beam.position.y=6;g.add(beam);const roof=new THREE.Mesh(new THREE.CylinderGeometry(0,5,1.6,4),std(0x33384f));roof.rotation.y=Math.PI/4;roof.position.y=7.2;g.add(roof);
 const bm=std(0x8a6a3a,{metalness:.6,roughness:.45});for(let i=0;i<6;i++){const f=new THREE.Mesh(new THREE.DodecahedronGeometry(.5+R()*.4,0),bm);f.position.set(rnd(-2,2),.35,rnd(-1.6,1.6));f.rotation.set(R()*3,R()*3,R()*3);g.add(f);}
 const half=new THREE.Mesh(new THREE.CylinderGeometry(.9,1.3,2.2,10,1,true,0,Math.PI*1.1),new THREE.MeshStandardMaterial({color:0x8a6a3a,metalness:.6,roughness:.45,side:THREE.DoubleSide}));half.position.y=4.6;g.add(half);
 g.traverse(o=>{if(o.isMesh)o.castShadow=true});scene.add(g);colliders.push({x:4,z:150,r:3});}
// forge (anvil) in Kanemura + vending machine + lamps + pylon
const FORGE={x:-6,z:142};
{const g=new THREE.Group();g.position.set(FORGE.x,H(FORGE.x,FORGE.z),FORGE.z);const a=new THREE.Mesh(new THREE.BoxGeometry(1.2,.5,.6),std(0x3a3a44,{metalness:.7,roughness:.4}));a.position.y=.95;g.add(a);
 const s=new THREE.Mesh(new THREE.CylinderGeometry(.3,.4,.7,6),std(0x5a3b2a));s.position.y=.35;g.add(s);const coals=new THREE.Mesh(new THREE.BoxGeometry(1.4,.6,1.4),emis(0xff5a1a,1.2));coals.position.set(1.8,.3,0);g.add(coals);
 const pl=new THREE.PointLight(0xff7a2a,8,10,1.6);pl.position.set(1.8,1.4,0);g.add(pl);scene.add(g);colliders.push({x:FORGE.x,z:FORGE.z,r:1});}
{const v=new THREE.Group();v.position.set(10,H(10,128),128);v.rotation.y=-.3;const b=new THREE.Mesh(new THREE.BoxGeometry(1.3,2.2,.9),std(0xe8eef5));b.position.y=1.1;v.add(b);const f=new THREE.Mesh(new THREE.PlaneGeometry(1.1,1.5),emis(0x6fe6ff,1.6));f.position.set(0,1.3,.46);v.add(f);scene.add(v);
 const pl=new THREE.PointLight(0x6fe6ff,4,7,1.8);pl.position.set(10,2,129.5);scene.add(pl);}
function lamp(x,z){const g=new THREE.Group();g.position.set(x,H(x,z),z);const p=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,4.5,6),std(0x3a3d4a));p.position.y=2.25;g.add(p);
 const h=new THREE.Mesh(new THREE.BoxGeometry(.5,.6,.5),emis(0xffa040,2));h.position.y=4.5;g.add(h);scene.add(g);lamps.push(h);return g;}
[[-6,130],[8,118],[-12,104],[-20,80],[-28,52],[-38,26]].forEach(([x,z])=>lamp(x+3,z));
const townLight=new THREE.PointLight(0xffa040,10,40,1.5);townLight.position.set(0,6,148);scene.add(townLight);
{const g=new THREE.Group();g.position.set(40,H(40,120),120);const m=std(0x8890a0,{metalness:.5});for(const[a,b]of[[-1.5,-1.5],[1.5,-1.5],[-1.5,1.5],[1.5,1.5]]){const l=new THREE.Mesh(new THREE.CylinderGeometry(.08,.12,18,4),m);l.position.set(a*.5,9,b*.5);l.rotation.set(b*-.08,0,a*.08);g.add(l);}
 for(const y of[12,16]){const c=new THREE.Mesh(new THREE.BoxGeometry(6,.2,.2),m);c.position.y=y;g.add(c);}scene.add(g);}
// shrine stones & lanterns along path
for(let i=0;i<pathPts.length;i++){const[x,z]=pathPts[i];const s=new THREE.Mesh(new THREE.BoxGeometry(.5,1.2,.5),std(0x8d8a86));s.position.set(x+3.5,H(x+3.5,z)+.6,z);s.castShadow=true;scene.add(s);}
