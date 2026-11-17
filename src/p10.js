/* =====================================================================
   v0.3 SECTION: UI THEME (ink-wash paper, brush borders, kintsugi) ·
   CANVAS ITEM ICONS (rarity rims, tooltips) · AUDIO MANAGER (Wavy's OGGs)
   ===================================================================== */
const RARITY=k=>{const p=PRICE[k]||0;return k==='koi'||p>=40?'legend':p>=15?'rare':p>=7?'fine':'common';};
const RAR_COL={common:'#8a7a5a',fine:'#4e8a4a',rare:'#3a6ab8',legend:'#d8a030'};
const ICON_CACHE={};
function iconURL(k,glyph){const key=k+'|'+glyph;if(ICON_CACHE[key])return ICON_CACHE[key];const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
 const rc=RAR_COL[RARITY(k)]||RAR_COL.common;// paper disc with ink wash
 const grd=g.createRadialGradient(28,26,4,32,32,30);grd.addColorStop(0,'#fbf3dc');grd.addColorStop(.75,'#e8d8b0');grd.addColorStop(1,'#c9b282');g.fillStyle=grd;g.beginPath();g.arc(32,32,29,0,TAU);g.fill();
 // brush ring: several jittered strokes
 g.strokeStyle=rc;g.lineCap='round';for(let i=0;i<3;i++){g.lineWidth=3.2-i;g.globalAlpha=.85-i*.2;g.beginPath();const a0=i*1.9;g.arc(32+i*.4,32-i*.3,29-i*.8,a0,a0+TAU*.93);g.stroke();}
 g.globalAlpha=1;if(RARITY(k)==='legend'||RARITY(k)==='rare'){g.strokeStyle='#e8b84a';g.lineWidth=1.2;g.beginPath();g.moveTo(10,20);g.lineTo(18,26);g.lineTo(15,34);g.moveTo(52,42);g.lineTo(46,47);g.lineTo(49,55);g.stroke();}
 g.font='30px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif';g.textAlign='center';g.textBaseline='middle';g.shadowColor='rgba(40,20,0,.35)';g.shadowBlur=3;g.fillText(glyph||'?',32,35);
 return ICON_CACHE[key]=c.toDataURL();}
const ITEM_DESC={wood:'Cedar wood. Building, fuel, hafts.',stone:'Plain stone.',flint:'Strikes sparks. Arrowheads.',iron:'Rust-rock ore. Forge into blades.',fiber:'Plant fiber. Cord and bowstrings.',herb:'Yomogi. Heals when brewed.',
 mushroom:'Forest mushroom. Cook it first.',sap:'Kodama sap. Glue and fire.',hide:'Animal hide.',meat:'Raw meat. Cook at a fire.',fish:'Raw fish.',silk:'Jorōgumo silk. Strong as wire.',bamboo:'Bamboo. Bows and arrows.',
 ofuda:'Paper talisman for magic.',salve:'Healing salve.',tea:'Fever tea. Warms and cures.',tonic:'Stamina tonic.',arrow:'Arrow. Ammo for bows.',firearrow:'Fire arrow. Burns on hit.',kunai:'Throwing kunai. Equip from the hotbar.',coin:'Coins (mon).',koi:'A golden koi. Someone would treasure it.'};
function decorateIcons(root){root.querySelectorAll('.it').forEach(el=>{if(el.dataset.ic)return;const ic=el.querySelector('.ic');if(!ic)return;const glyph=ic.textContent.trim();const k=el.dataset.k||Object.keys(ITEMS).find(x=>ITEMS[x][0]===glyph&&el.textContent.includes(J(ITEMS[x][1])))||'';
  el.dataset.ic=1;el.classList.add('r-'+RARITY(k));ic.innerHTML=`<img src="${iconURL(k,glyph)}" width="40" height="40" alt="">`;el.title=(J(ITEMS[k]?ITEMS[k][1]:k))+' — '+(ITEM_DESC[k]||'')+' ['+RARITY(k)+']'+(PRICE[k]?' · worth ~'+PRICE[k]+' mon':'');});}
new MutationObserver(()=>decorateIcons(document.getElementById('items'))).observe(document.getElementById('items'),{childList:true});
// theme stylesheet
{const st=document.createElement('style');st.textContent=`
:root{--paper:#efe3c4;--paper2:#e2d2a8;--inkc:#231a10;--seal:#b8321f;--gold:#e8b84a}
.card{background:radial-gradient(ellipse at 18% 12%,rgba(255,255,255,.5),transparent 40%),radial-gradient(ellipse at 85% 90%,rgba(120,90,40,.22),transparent 45%),linear-gradient(170deg,var(--paper),var(--paper2));color:var(--inkc);border:0;border-radius:6px 14px 8px 12px/12px 6px 14px 8px;box-shadow:0 0 0 2px #3a2a16,0 0 0 5px rgba(232,184,74,.55),0 18px 50px rgba(0,0,0,.55);position:relative}
.card:before{content:"";position:absolute;inset:8px;border:1.5px solid rgba(35,26,16,.35);border-radius:4px 10px 6px 9px;pointer-events:none}
.card:after{content:"";position:absolute;right:14px;top:12px;width:70px;height:46px;pointer-events:none;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 70 46'%3E%3Cpath d='M2 4 L18 14 L14 24 L30 30 L28 40 L44 44 M30 30 L48 22 L66 26' fill='none' stroke='%23e8b84a' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat;opacity:.9}
.card h1,.card h2,.card h3{font-family:Georgia,"Palatino Linotype","Book Antiqua",serif;color:var(--inkc);letter-spacing:.12em}.card h1 span{color:var(--seal)}
.card .lbl{color:#5a4630;opacity:.9}.card p{color:#2e2416}
.btn{background:var(--seal);color:#fbf1dc;font-family:Georgia,serif;letter-spacing:.14em;box-shadow:none;border-radius:3px 8px 4px 7px/7px 3px 8px 4px;border:2px solid #5a170c;text-shadow:0 1px 0 #0006}
.btn.cy{background:#2c2a26;border-color:#0e0d0b;color:#efe3c4}.btn:hover{filter:brightness(1.15);transform:translateY(-1px)}
.overlay{background:radial-gradient(ellipse at center,rgba(20,14,8,.35),rgba(8,6,4,.75))}
.it{background:rgba(255,250,235,.55);border:1.5px solid rgba(60,40,20,.35);border-radius:6px;color:var(--inkc);cursor:pointer;transition:transform .1s}.it:hover{transform:translateY(-2px);box-shadow:0 4px 10px rgba(60,40,10,.3)}
.it.r-fine{border-color:#4e8a4a}.it.r-rare{border-color:#3a6ab8;box-shadow:inset 0 0 8px rgba(58,106,184,.3)}.it.r-legend{border-color:#d8a030;box-shadow:inset 0 0 10px rgba(216,160,48,.45)}.it .n{color:#8a4a10}.it img{display:block;margin:0 auto 2px}
.rec{background:rgba(255,250,235,.5);border:1px solid rgba(60,40,20,.25);border-radius:5px;color:var(--inkc)}.rec .cost{color:#8a4a10}.rec .cost .ok{color:#2e7a2a}.rec .cost .no{color:#a8241a}.rec button{background:var(--seal);border-radius:3px}
.tabs button{background:#2c2a26;color:#efe3c4;border-radius:3px 6px 3px 6px;font-family:Georgia,serif}.tabs button.on{background:var(--gold);color:#231a10}
.node{background:rgba(255,250,235,.5);border:2px solid rgba(60,40,20,.25);color:var(--inkc);border-radius:6px}.node.own{border-color:#c8941a;background:rgba(232,184,74,.3)}.node.can{border-color:#2e7a2a}
.branch h3{color:var(--inkc)}
#tkLog{background:rgba(255,250,235,.45);border:1px solid rgba(60,40,20,.2)}.tkl b{color:#a8321f}.tkl.me b{color:#2a4a7a}.jent{background:rgba(255,250,235,.45);border-left-color:#c8941a}.relb i{background:rgba(60,40,20,.18)}
.st,.toast,#prompt,#time,#quest{background:linear-gradient(90deg,rgba(18,12,6,.78),rgba(18,12,6,.55));border-color:var(--gold)}
#quest{background:linear-gradient(90deg,transparent,rgba(18,12,6,.7) 14%);font-family:Georgia,serif}#quest h4{color:var(--gold);font-family:Georgia,serif}
.slot{background:radial-gradient(circle at 40% 35%,rgba(60,48,30,.85),rgba(14,10,6,.85));border:2px solid rgba(232,184,74,.35);border-radius:8px 4px 8px 4px}.slot.eq{border-color:var(--gold);box-shadow:0 0 12px rgba(232,184,74,.6)}
.slot img{width:30px;height:30px;display:block;margin:0 auto}
.bar{background:rgba(20,12,4,.6);border-radius:2px}.bar b{font-family:Georgia,serif;letter-spacing:.2em}
#title .a{font-family:Georgia,"Palatino Linotype",serif;letter-spacing:.2em}#title .b{font-family:Georgia,serif}
#start{background:radial-gradient(ellipse at 50% 30%,rgba(232,184,74,.12),transparent 50%),radial-gradient(ellipse at center,rgba(20,14,8,.25),rgba(8,6,4,.8))}
#start .card h1{font-size:58px}
.card{box-shadow:0 0 0 3px #1a1008,0 0 0 11px #4a3420,0 0 0 12px #6a4a2a,0 0 0 14px #1a1008,0 0 0 15px rgba(232,184,74,.55),0 22px 60px rgba(0,0,0,.6);margin:16px}
.tabs{background:linear-gradient(180deg,#5a3e24,#3a2614);padding:6px 8px 0;border-radius:4px;box-shadow:inset 0 -2px 0 #1a1008;margin-bottom:8px}
.tabs button{background:linear-gradient(180deg,#f2e6c8,#d8c49a);color:#231a10;border:1px solid #2a1a0a;border-bottom:0;border-radius:4px 4px 0 0;font:700 13px Georgia,serif;letter-spacing:.12em;text-transform:uppercase;padding:6px 14px;margin:0 4px 0 0;opacity:.75}
.tabs button.on{background:linear-gradient(180deg,#fff6dc,#efe3c4);color:#a8321f;opacity:1;box-shadow:0 -2px 0 #e8b84a inset}
.it img,.slot img{filter:sepia(.35) contrast(1.05)}.items{gap:8px}.it{min-height:84px;background:linear-gradient(160deg,rgba(255,250,235,.75),rgba(226,210,168,.65));box-shadow:inset 0 0 0 1px rgba(255,255,255,.5)}
#mapcv{border-radius:6px;box-shadow:0 0 0 3px #2a2016,0 0 0 6px rgba(232,184,74,.5)}
`;document.head.appendChild(st);}
// hotbar icons: swap emoji glyphs to painted icons after each refresh
{const hb=document.getElementById('hotbar');if(hb)new MutationObserver(()=>{hb.querySelectorAll('.ic').forEach(ic=>{if(ic.querySelector('img'))return;const g=ic.textContent.trim();if(!g)return;const k=Object.keys(ITEMS).find(x=>ITEMS[x][0]===g)||'w_'+g;ic.innerHTML=`<img src="${iconURL(k,g)}" alt="">`;});}).observe(hb,{childList:true,subtree:true});}

/* ---------- AUDIO MANAGER: area/day/night/combat/boss/storm loops with crossfade + stingers ---------- */
const AUDIO={tracks:{},bus:null,stBus:null,cur:null,storm:0,failed:{},lastLvl:0,lastShard:0,
 LOOPS:['forest_explore','village_day','night_ambient','combat','boss_jorogumo','title_theme','storm_ambience'],
 init(){if(this.bus||!AC)return;this.bus=AC.createGain();this.bus.gain.value=AUDSET.mus;this.bus.connect(AC.destination);this.stBus=AC.createGain();this.stBus.gain.value=AUDSET.sfx;this.stBus.connect(AC.destination);},
 setVol(){if(this.bus)this.bus.gain.setTargetAtTime(AUDSET.mus,AC.currentTime,.1);if(this.stBus)this.stBus.gain.setTargetAtTime(AUDSET.sfx,AC.currentTime,.1);},
 async buf(name){const t=this.tracks[name]||(this.tracks[name]={});if(t.buf||t.loading||this.failed[name])return t.buf;t.loading=true;
  try{const r=await fetch('audio/'+name+'.ogg');if(!r.ok)throw 0;t.buf=await AC.decodeAudioData(await r.arrayBuffer());}catch(e){this.failed[name]=1;}t.loading=false;return t.buf;},
 async want(name,vol=1){if(!AC||!this.bus)return;const t=this.tracks[name]||(this.tracks[name]={});t.target=vol;if(t.src)return;const b=await this.buf(name);if(!b||t.src||!(t.target>0))return;
  const g=AC.createGain();g.gain.value=0;g.connect(this.bus);const s=AC.createBufferSource();s.buffer=b;s.loop=true;s.connect(g);s.start();t.src=s;t.g=g;},
 tick(dt){if(!AC||muted&&false)return;this.init();if(!this.bus)return;
  const menu=document.body.classList.contains('menu');let main='title_theme';
  if(!menu){const near=enemiesAll().some(e=>e.isBoss?boss.active:(e.state&&e.state!=='idle'&&e.state!=='wander'&&!e.D.animal&&Math.hypot(e.pos.x-hero.position.x,e.pos.z-hero.position.z)<16));
   if(boss.active&&boss.alive)main='boss_jorogumo';else if(near)main='combat';else if(isNight())main='night_ambient';else if(hero.position.z>112&&Math.abs(hero.position.x)<45)main='village_day';else main='forest_explore';}
  if(main!==this.cur){this.cur=main;}
  for(const n of this.LOOPS){const wantV=n===this.cur?(n==='combat'?.85:1):n==='storm_ambience'&&!menu&&S.weather==='storm'?.9:n==='storm_ambience'&&!menu&&S.weather==='warn'?.35:0;
   const t=this.tracks[n];if(wantV>0&&(!t||!t.src))this.want(n,wantV);if(t){t.target=wantV;if(t.g){t.g.gain.setTargetAtTime(wantV,AC.currentTime,wantV>0?1.2:.8);if(wantV===0&&t.g.gain.value<.003&&t.src){try{t.src.stop()}catch(e){}t.src.disconnect();t.g.disconnect();t.src=null;t.g=null;}}}}
  if(!menu&&S.started){if(this.lastLvl&&S.lvl>this.lastLvl)this.sting('level_up');if(S.shards>this.lastShard&&this.lastShard!==null&&this.lastLvl)this.sting('shard_get');this.lastLvl=S.lvl;this.lastShard=S.shards;}},
 stingSrc:null,async sting(name){if(!AC)return;this.init();const b=await this.buf(name);if(!b)return;if(this.stingSrc){const o=this.stingSrc;try{o.g.gain.setTargetAtTime(0,AC.currentTime,.25);setTimeout(()=>{try{o.s.stop()}catch(e){}},1200);}catch(e){}}
  const g=AC.createGain();g.gain.value=1;g.connect(this.stBus);const s=AC.createBufferSource();s.buffer=b;s.connect(g);s.start();this.stingSrc={s,g};
  if(this.bus){this.bus.gain.setTargetAtTime(AUDSET.mus*.4,AC.currentTime,.15);setTimeout(()=>{if(this.bus)this.bus.gain.setTargetAtTime(AUDSET.mus,AC.currentTime,1.2);},2500);}}};
window.AUDIO=AUDIO;
{const _sr=shrineRest;shrineRest=function(){AUDIO.sting('bell_ring');return _sr.apply(this,arguments);};}
addEventListener('pointerdown',()=>{audioInit();AUDIO.init();},{once:false,passive:true});
