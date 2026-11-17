/* ============ UI ============ */
function show(id){$(id).classList.remove('hidden');if(document.pointerLockElement)document.exitPointerLock();updLockOverlay();}
function hide(id){$(id).classList.add('hidden');setTimeout(updLockOverlay,0);}
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>{b.closest('.overlay').classList.add('hidden');updLockOverlay();});
$('clickplay').onclick=()=>{audioInit();requestLock();};
$('sens').value=MSET.sens;$('sensV').textContent=MSET.sens.toFixed(2);$('invy').checked=MSET.inv;
$('sens').oninput=e=>{MSET.sens=+e.target.value;$('sensV').textContent=MSET.sens.toFixed(2);lsSet('km_sens',MSET.sens);};$('invy').onchange=e=>{MSET.inv=e.target.checked;lsSet('km_invy',MSET.inv?'1':'0');};
function hotbarItems(){const a=S.weapons.map(w=>({w}));['salve','tea','tonic','gfish','gmeat','skewer','fish','mushroom','herb','meat'].forEach(k=>{if(S.inv[k]>0&&a.length<8)a.push({it:k});});return a.slice(0,8);}
function refreshHotbar(){const hb=$('hotbar');hb.innerHTML='';hotbarItems().forEach((s,i)=>{const d=document.createElement('div');d.className='slot'+(s.w===S.eq?' eq':'');
 d.innerHTML=`<span class="k">${i+1}</span>`+(s.w?`<div><div class="ic">${WEAPONS[s.w].icon}</div>${WEAPONS[s.w].name.split(' ')[0]}</div>`:`<div><div class="ic">${ITEMS[s.it][0]}</div>${{gfish:'Ayu',gmeat:'Skewer',skewer:'Stew',fish:'Raw fish',meat:'Raw meat',salve:'Salve',tea:'Tea',tonic:'Tonic',herb:'Herb',mushroom:'Shroom'}[s.it]||s.it}</div><span class="n">${S.inv[s.it]}</span>`);hb.appendChild(d);});
 for(let i=hotbarItems().length;i<8;i++){const d=document.createElement('div');d.className='slot';d.innerHTML=`<span class="k">${i+1}</span>`;hb.appendChild(d);}}
let invTab='Weapons';
function openInv(tab){if(tab)invTab=tab;renderInv();show('inv');}
function renderInv(){const it=$('items');it.innerHTML='';for(const k in S.inv){if(!(S.inv[k]>0)||!ITEMS[k])continue;const d=document.createElement('div');d.className='it';d.dataset.k=k;d.innerHTML=`<span class="ic">${ITEMS[k][0]}</span>${J(ITEMS[k][1])}<br><span class="n">×${S.inv[k]}</span>`;
 if(FOOD[k]||['salve','tea','tonic'].includes(k)){d.style.cursor='pointer';d.title='Click to use';d.onclick=()=>{useItem(k);renderInv();};}it.appendChild(d);}
 $('eqInfo').innerHTML=S.weapons.map(w=>`<button class="btn ${w===S.eq?'':'cy'}" style="padding:5px 9px;font-size:11px" data-w="${w}">${WEAPONS[w].icon} ${WEAPONS[w].name}</button>`).join('')+`<div style="font-size:11px;opacity:.8;margin-top:4px">${W().name}: light ${W().dmg} · heavy ${W().heavy} · reach ${W().reach} m · ${W().combo}-hit combo</div>`;
 $('eqInfo').querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>{equip(b.dataset.w);renderInv();});
 const cats=[...new Set(RECIPES.map(r=>r.cat))];$('ctabs').innerHTML=cats.map(c=>`<button class="${c===invTab?'on':''}">${c}</button>`).join('');$('ctabs').querySelectorAll('button').forEach((b,i)=>b.onclick=()=>{invTab=cats[i];renderInv();});
 $('recipes').innerHTML='';RECIPES.filter(r=>r.cat===invTab).forEach(r=>{const d=document.createElement('div');d.className='rec';const ok=canCraft(r);
  const cost=Object.keys(r.cost).map(k=>`<span class="${(S.inv[k]||0)>=costOf(r,k)?'ok':'no'}">${ITEMS[k][0]} ${ITEMS[k][1]} ${S.inv[k]||0}/${costOf(r,k)}</span>`).join(' · ');
  const need=r.need==='forge'?(nearForge()?'':' <span class="no">needs a lit campfire or the Kanemura forge</span>'):r.need==='fire'?(nearFire()?'':' <span class="no">needs a lit campfire</span>'):'';
  d.innerHTML=`<div><div class="nm">${r.out.startsWith('w:')?WEAPONS[r.out.slice(2)].icon:ITEMS[r.id]?ITEMS[r.id][0]:ITEMS[r.id+'_kit']?ITEMS[r.id+'_kit'][0]:''} ${r.out.startsWith('w:')?J(WEAPONS[r.out.slice(2)].name):ITEMS[r.id]?ITEMS[r.id][1]:ITEMS[r.id+'_kit'][1]}</div><div class="ds">${r.ds}</div><div class="cost">${cost}${need}</div></div>`;
  const b=document.createElement('button');b.textContent='CRAFT';b.disabled=!ok;b.onclick=()=>craft(r.id);d.appendChild(b);$('recipes').appendChild(d);});}
function renderSkills(){$('skP').textContent=S.skp;const t=$('tree');t.innerHTML='';for(const bk in SKILLS){const B=SKILLS[bk];const col=document.createElement('div');col.className='branch';col.innerHTML=`<h3 style="color:${B.col}">${B.en}<small>${SHOWJP?B.jp:''}</small></h3>`;
 B.nodes.forEach((n,i)=>{const own=has(n.id),prev=i===0||has(B.nodes[i-1].id),can=!own&&prev&&S.skp>0;const d=document.createElement('div');d.className='node'+(own?' own':can?' can':!prev?' lock':'');d.innerHTML=`<b>${own?'◆ ':''}${n.n}</b>${n.d}`;
  d.onclick=()=>{if(!can)return;S.skills[n.id]=1;S.skp--;bellTone(1);toast('Learned '+n.n);renderSkills();};col.appendChild(d);});t.appendChild(col);}}
// minimap + scroll map
const MAPRES=200,mapImg=document.createElement('canvas');mapImg.width=mapImg.height=MAPRES;
{const c=mapImg.getContext('2d'),id=c.createImageData(MAPRES,MAPRES);for(let j=0;j<MAPRES;j++)for(let i=0;i<MAPRES;i++){const x=WMIN+(i/MAPRES)*(WMAX-WMIN),z=ZMIN+(j/MAPRES)*(ZMAX-ZMIN),h=H(x,z);let r,g,b;
 if(h<WATER_SEA+.3||inWater(x,z)){r=70;g=130;b=170;}else{const f=x<45&&z<115;r=f?58:92;g=f?92:128;b=f?62:80;const k=clamp((h+20)/60,0,1);r+=k*60;g+=k*50;b+=k*50;if(pathDist(x,z)<2.5){r=170;g=145;b=105;}}
 const o=(j*MAPRES+i)*4;id.data[o]=r;id.data[o+1]=g;id.data[o+2]=b;id.data[o+3]=255;}c.putImageData(id,0,0);}
const DISC=40;function discIdx(x,z){return clamp(Math.floor((x-WMIN)/(WMAX-WMIN)*DISC),0,DISC-1)+clamp(Math.floor((z-ZMIN)/(ZMAX-ZMIN)*DISC),0,DISC-1)*DISC;}
let discSet=new Set();
const w2m=(x,z,W,Hh)=>[(x-WMIN)/(WMAX-WMIN)*W,(z-ZMIN)/(ZMAX-ZMIN)*Hh];
function drawMini(){const c=$('mini').getContext('2d'),s=160,scale=1.6;// px per m
 c.save();c.clearRect(0,0,s,s);c.beginPath();c.arc(80,80,80,0,TAU);c.clip();c.translate(80,80);c.rotate(-(P.camYaw+Math.PI));
 const [mx,mz]=w2m(hero.position.x,hero.position.z,MAPRES,MAPRES);const ppm=MAPRES/(WMAX-WMIN);c.scale(scale/ppm,scale/ppm);c.drawImage(mapImg,-mx,-mz);c.restore();
 c.save();c.translate(80,80);c.rotate(-(P.camYaw+Math.PI));const dot=(x,z,col,r=3)=>{const dx=(x-hero.position.x)*scale,dz=(z-hero.position.z)*scale;if(dx*dx+dz*dz>78*78)return;c.fillStyle=col;c.beginPath();c.arc(dx,dz,r,0,TAU);c.fill();};
 for(const s of structures)dot(s.x,s.z,s.type==='campfire'?'#ff8a2a':'#d9c08a',3.5);if(has('tracker'))for(const m of minions)if(m.alive)dot(m.pos.x,m.pos.z,m.D.animal?'#9df59d':'#ff5a6a',2.2);
 else for(const m of minions)if(m.alive&&!m.D.animal&&(m.state==='chase'||m.state==='tell'))dot(m.pos.x,m.pos.z,'#ff5a6a',2.2);
 if(!S.boss.dead){const dx=(ARENA.x-hero.position.x),dz=(ARENA.z-hero.position.z),d=Math.hypot(dx,dz),k=Math.min(1,74/(d*scale));c.fillStyle='#ffcf5a';c.beginPath();c.arc(dx*scale*k,dz*scale*k,5,0,TAU);c.fill();}
 c.restore();c.fillStyle='#fff';c.save();c.translate(80,80);c.rotate(P.yaw-P.camYaw);c.beginPath();c.moveTo(0,-7);c.lineTo(5,5);c.lineTo(-5,5);c.closePath();c.fill();c.restore();}
function drawRing(){const r=[['hun','#ffb347',S.hun/100],['warm','#ff6a3a',S.warm/100],['wet','#6fb8ff',S.wet/100]];let h='';const arc=(a0,a1,rad)=>{const p=(a)=>[95+Math.cos(a)*rad,95+Math.sin(a)*rad];const[x0,y0]=p(a0),[x1,y1]=p(a1);return`M${x0} ${y0}A${rad} ${rad} 0 ${a1-a0>Math.PI?1:0} 1 ${x1} ${y1}`;};
 r.forEach(([k,col,v],i)=>{const a0=Math.PI*.62+i*Math.PI*.6,a1=a0+Math.PI*.52;h+=`<path d="${arc(a0,a1,90)}" stroke="#0008" stroke-width="7" fill="none"/><path d="${arc(a0,a0+(a1-a0)*clamp(v,0.001,1),90)}" stroke="${col}" stroke-width="5" fill="none" stroke-linecap="round"/>`;});
 h+=`<text x="18" y="182" fill="#ffb347" font-size="10" font-weight="900">${SHOWJP?"食":"FOOD"}</text><text x="82" y="190" fill="#ff6a3a" font-size="10" font-weight="900">${SHOWJP?"暖":"WARM"}</text><text x="152" y="182" fill="#6fb8ff" font-size="10" font-weight="900">${SHOWJP?"濡":"WET"}</text>`;$('ring').innerHTML=h;}
function drawBell(){let h='<path d="M17 2 C8 4 6 14 5 28 L2 33 L32 33 L29 28 C28 14 26 4 17 2Z" fill="#0008" stroke="#f4ead2" stroke-width="1.5"/>';for(let i=0;i<8;i++){const x=4+i*3.3;h+=`<rect x="${x}" y="${30-((i%2)?14:20)}" width="2.4" height="${(i%2)?14:20}" fill="${i<S.shards?'#ffcf5a':'#ffffff22'}"/>`;}$('bellSvg').innerHTML=h;$('shN').textContent=S.shards;}
function drawMap(){const cv=$('mapcv'),c=cv.getContext('2d'),Wd=cv.width,Hd=cv.height;c.fillStyle='#e9dcbc';c.fillRect(0,0,Wd,Hd);
 // whole Nemuriyama: playable valley = lower-middle area
 const vx=Wd*.3,vy=Hd*.5,vw=Wd*.4,vh=Hd*.48;
 c.fillStyle='#d8c8a2';c.beginPath();c.moveTo(Wd*.05,Hd*.95);c.quadraticCurveTo(Wd*.2,Hd*.3,Wd*.5,Hd*.04);c.quadraticCurveTo(Wd*.8,Hd*.3,Wd*.95,Hd*.95);c.fill();
 c.strokeStyle='#2a2016';c.lineWidth=2;c.stroke();
 for(const r of REGIONS.filter(r=>!r.playable)){const x=r.mx*Wd,y=r.my*Hd;c.save();c.fillStyle='rgba(60,50,40,.18)';c.beginPath();c.ellipse(x,y,70,42,0,0,TAU);c.fill();c.strokeStyle='rgba(60,50,40,.4)';c.setLineDash([4,4]);c.stroke();c.setLineDash([]);
  c.beginPath();c.ellipse(x,y,70,42,0,0,TAU);c.clip();c.strokeStyle='rgba(60,50,40,.25)';for(let k=-120;k<120;k+=8){c.beginPath();c.moveTo(x+k,y-50);c.lineTo(x+k+60,y+50);c.stroke();}c.restore();
  c.fillStyle='#2a2016';c.font='900 15px "Noto Sans CJK JP",sans-serif';c.textAlign='center';c.fillText(SHOWJP?r.jp:r.en,x,y-4);c.font='700 11px system-ui';c.fillText((SHOWJP?r.en+' · ':'')+'🔒 '+r.boss,x,y+12);}
 c.fillStyle='#2a2016';c.font='900 13px system-ui';c.textAlign='center';c.fillText(J('▲ 鐘守寺 Summit — Orochi sleeps'),Wd*.5,Hd*.035+14);
 // valley inset with fog of war
 const tmp=document.createElement('canvas');tmp.width=DISC*5;tmp.height=DISC*5;const tc=tmp.getContext('2d');tc.drawImage(mapImg,0,0,tmp.width,tmp.height);tc.fillStyle='#cdbf9e';
 for(let j=0;j<DISC;j++)for(let i=0;i<DISC;i++)if(!discSet.has(i+j*DISC))tc.fillRect(i*5,j*5,5.5,5.5);
 c.save();c.drawImage(tmp,vx,vy,vw,vh);c.strokeStyle='#2a2016';c.lineWidth=3;c.strokeRect(vx,vy,vw,vh);
 const m=(x,z)=>{const[a,b]=w2m(x,z,vw,vh);return[vx+a,vy+b];};c.textAlign='center';
 for(const r of REGIONS.filter(r=>r.playable)){const[a,b]=m(r.x,r.z);if(!discSet.has(discIdx(r.x,r.z))&&!S.discovered[r.id])continue;c.fillStyle='#2a2016';c.font='900 13px "Noto Sans CJK JP",sans-serif';c.fillText(SHOWJP?r.jp:r.en,a,b);c.font='700 10px system-ui';if(SHOWJP)c.fillText(r.en,a,b+12);}
 for(const s of structures){const[a,b]=m(s.x,s.z);c.fillStyle=s.type==='campfire'?'#e3402c':'#6a4a30';c.fillRect(a-3,b-3,6,6);}
 if(!S.boss.dead){const[a,b]=m(ARENA.x,ARENA.z);c.fillStyle='#ffb000';c.strokeStyle='#2a2016';c.beginPath();c.arc(a,b-12,8,0,TAU);c.fill();c.stroke();c.fillStyle='#2a2016';c.font='900 10px system-ui';c.fillText('KAKERA 1',a,b-24);}
 const[px,pz]=m(hero.position.x,hero.position.z);c.translate(px,pz);c.rotate(-P.yaw+Math.PI);c.fillStyle='#e3402c';c.beginPath();c.moveTo(0,-9);c.lineTo(6,6);c.lineTo(-6,6);c.closePath();c.fill();c.restore();
 c.fillStyle='#2a2016';c.font='800 12px system-ui';c.textAlign='left';c.fillText(J('眠り山 NEMURIYAMA · the valley (boxed) · sealed regions open in later versions'),14,Hd-12);}
function drawCompass(){const el=$('compass');let h='';const dirs=[['N',Math.PI],['NE',Math.PI*.75],['E',Math.PI*.5],['SE',Math.PI*.25],['S',0],['SW',-Math.PI*.25],['W',-Math.PI*.5],['NW',-Math.PI*.75]];
 const put=(a,txt,cls)=>{const d=wrapPi(a-P.camYaw);if(Math.abs(d)>1.4)return;h+=`<span class="tick ${cls}" style="left:${210-d/1.4*200}px">${txt}</span>`;};
 dirs.forEach(([n,a])=>put(a,n,n==='N'?'n':''));const qa=questTarget();if(qa)put(Math.atan2(qa[0]-hero.position.x,qa[1]-hero.position.z),'◆','q');el.innerHTML=h;}
function questTarget(){if(S.quest>=5&&!S.boss.dead)return[ARENA.x,ARENA.z];if(S.quest===3&&!nearForge())return[FORGE.x,FORGE.z];return null;}
function updQuest(){while(S.quest<QUEST.length-1&&QUEST[S.quest].chk(S)){S.quest++;if(S.quest>0){bellTone(1);toast('✔ Goal complete');gainXP(25);}if(S.quest===4){S.stormArmed=true;if(['clear','cloudy'].includes(S.weather))setWeather('rain',25);}save();}
 const q=QUEST[S.quest];$('qT').textContent=q.t;$('qS').textContent=q.s;
 const side=[];if(!S.stat.fish)side.push('Fish at the river or Taki Pool (E)');if(!S.stat.cooked)side.push('Cook food at a campfire');if(S.skp>0)side.push(`${S.skp} skill point${S.skp>1?'s':''} to spend (K)`);if(!has('fire'))side.push('Learn the Fire ofuda (Kami branch)');try{for(const id in(S.q2||{})){const g=qGoal(id);if(g){const q=qDef(id);side.unshift((q.type==='main'?'★ ':q.type==='secret'?'✦ ':'◆ ')+q.title+': '+q.steps[S.q2[id].step].text);}}if(!S.q2||!Object.keys(S.q2).length)side.unshift('Talk to the villagers of Kanemura (E) · J journal');}catch(e){}
 $('qSide').innerHTML=side.slice(0,4).map(s=>'· '+s).join('<br>');}
let statusCache='';
function updHUD(){$('bHP').style.width=clamp(S.hp/DERIV.maxHp()*100,0,100)+'%';$('bST').style.width=clamp(S.st/DERIV.maxSt()*100,0,100)+'%';$('bSP').style.width=clamp(S.sp/DERIV.maxSp()*100,0,100)+'%';
 $('bXP').style.width=(S.xp/xpNeed(S.lvl)*100)+'%';$('lvN').textContent=S.lvl;$('spN').textContent=S.skp?S.skp+' skill pt (K)':'';
 const st=[];if(nearFire())st.push(['🔥 By the fire','warm']);if(sheltered())st.push(['⛺ Sheltered','good']);if(S.wet>50)st.push(['💧 Soaked','bad']);if(S.warm<25)st.push(['❄ Freezing','bad']);if(S.hun<20)st.push(['🍙 Starving','bad']);
 if(P.poison>0)st.push(['☠ Poisoned','bad']);if(W().ranged)st.push([W().thrown?'🗡 '+(S.inv.kunai||0)+' kunai':(ammoFor(W())==='firearrow'?'🔥 '+(S.inv.firearrow||0)+' fire arrows':'➶ '+(S.inv.arrow||0)+' arrows')+(W().thrown?'':' (R swaps)'),'good']);if(P.swim)st.push(['🏊 Swimming','bad']);if(nearWall())st.push(['🪨 Earth wall','good']);if(P.rooted>0)st.push(['🕸 Rooted','bad']);if(P.buffs.tea>0)st.push(['🍵 Tea','good']);if(P.buffs.tonic>0)st.push(['🧪 Tonic','good']);if(P.buffs.might>0)st.push(['🍖 +10% dmg','good']);if(P.regen.length)st.push(['🩹 Healing','good']);
 const sh=st.map(([t,c])=>`<span class="st ${c}">${t}</span>`).join('');if(sh!==statusCache){$('status').innerHTML=sh;statusCache=sh;}
 const hh=Math.floor((S.time*24+6)%24),mm=Math.floor((S.time*24*60)%60);const wxn={clear:'晴れ Clear',cloudy:'曇り Cloudy',rain:'雨 Rain',storm:'嵐 STORM',fog:'霧 Fog',warn:'⚠ Storm coming'}[S.weather];
 $('time').textContent=J(`${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')} ${isNight()?'🌙 night (yokai +30%)':'☀ day'} · ${wxn} · ${Math.round(S.warm)}° warmth`);
 $('cold').style.opacity=S.warm<30?String((30-S.warm)/30*.9):'0';
 const it=findInteract();const pr=$('prompt');if(FISH.on&&FISH.state==='bite'){pr.style.display='none';}else if(it){pr.style.display='block';pr.innerHTML=`<kbd>E</kbd>${it.verb}`;}else pr.style.display='none';
 const lk=$('lock');if(P.lock&&P.lock.alive!==false){_v.copy(P.lock.pos).add(new V3(0,P.lock.isBoss?2:1,0)).project(camera);lk.style.display='block';lk.style.left=((_v.x+1)/2*innerWidth)+'px';lk.style.top=((1-_v.y)/2*innerHeight)+'px';}else lk.style.display='none';}

/* ============ KEYS ============ */
function onKey(code){
 if(code==='F1'){$('help').classList.contains('hidden')?show('help'):hide('help');return;}
 if(code==='Escape'||code==='KeyP'){const o=UIopen();if(o&&o.id!=='start'&&o.id!=='dead'&&o.id!=='win'){if(o.id==='pause'&&performance.now()-autoPauseT<350)return;o.classList.add('hidden');if(FISH.on)endFishing();if(PL_OK&&!UIopen()&&!QS.has('shots'))requestLock();setTimeout(updLockOverlay,0);return;}if(!o&&!document.body.classList.contains('menu'))show('pause');updLockOverlay();return;}
 if(code==='KeyG'){FXQ.on=!FXQ.on;lsSet('km_fx',FXQ.on?'1':'0');if(FXQ.on&&!composer)initFX();toast('Post FX '+(FXQ.on?'on':'off'));return;}
 const o=UIopen();
 if(code==='KeyI'||code==='KeyC'){if(o&&o.id==='inv'){hide('inv');return;}if(!o)openInv();return;}
 if(code==='KeyK'){if(o&&o.id==='skills'){hide('skills');return;}if(!o){renderSkills();show('skills');}return;}
 if(code==='KeyM'){if(o&&o.id==='map'){hide('map');return;}if(!o){drawMap();show('map');}return;}
 if(o||document.body.classList.contains('menu'))return;
 if(code==='KeyJ'){openJournal();return;}if(code==='KeyR'){toggleAmmo();return;}if(code==='KeyH'){toggleRide();return;}if(code==='KeyE')interact();if(code==='KeyB')placeBuild();if(code==='KeyX')castFire();if(code==='KeyZ')castEarth();
 if(code==='Tab'){if(P.lock){P.lock=null;}else{let best=null,bd=26;for(const e of enemiesAll()){if(e.D&&e.D.animal&&!e.hb.g.visible)continue;const d=e.pos.distanceTo(hero.position);if(d<bd){bd=d;best=e;}}P.lock=best;}}
 if(/^Digit[1-8]$/.test(code)){const s=hotbarItems()[+code.slice(5)-1];if(s){if(s.w)equip(s.w);else useItem(s.it);}}}

/* ============ PLAYER UPDATE ============ */
function updPlayer(dt,time){const p=hero.position;if(P.dead){body.rotation.x=lerp(body.rotation.x,-1.4,dt*4);return;}
 if(!UIopen()){P.camYaw-=mdx*.0026;P.camPitch=clamp(P.camPitch+mdy*.0022,-.35,1.1);}mdx=mdy=0;if(keys.ArrowLeft)P.camYaw+=dt*2;if(keys.ArrowRight)P.camYaw-=dt*2;
 const ui=!!UIopen();const f=(!ui&&keys.KeyW?1:0)-(!ui&&keys.KeyS?1:0),r=(!ui&&keys.KeyD?1:0)-(!ui&&keys.KeyA?1:0);
 const fw=new V3(Math.sin(P.camYaw),0,Math.cos(P.camYaw)),rt=new V3(-Math.cos(P.camYaw),0,Math.sin(P.camYaw));const mv=fw.multiplyScalar(f).add(rt.multiplyScalar(r));P.moving=mv.lengthSq()>0;if(P.moving)mv.normalize();
 if(pressed.KeyQ&&!ui){if(P.rooted>0){P.rooted-=.6;useSt(8);}else if(P.dodge<=0&&S.st>=10&&!V4.chg&&(!P.atk||(P.atk.v4&&P.atk.hit&&!(P.atk.M.plunge&&P.atk.dive===1)))){if(P.atk){P.atk=null;V4.buf=null;}useSt(20);P.dodge=.35;P.dodgeDir.copy(P.moving?mv:new V3(-Math.sin(P.yaw),0,-Math.cos(P.yaw)));noise(.15,900,.12);}}
 v4Input(ui,dt,mv);
 const wantBlock=!ui&&keys.KeyF&&!P.atk&&P.dodge<=0;if(wantBlock&&!P.block)P.blockT=0;P.block=wantBlock;if(P.block)P.blockT+=dt;
 if(pressed.Space&&!ui&&P.ground&&P.dodge<=0&&P.rooted<=0){P.vy=7;P.ground=false;useSt(6);}
 for(const k in pressed)delete pressed[k];
 let speed=5.5;const sprint=keys.ShiftLeft&&P.moving&&S.st>1&&!P.block;if(sprint){speed=8;S.st-=12*dt;P.stDelay=.6;}if(P.block)speed=2.2;if(S.warm<=0)speed*=.75;if(P.slowT>0){P.slowT-=dt;speed*=.45;}P.swim=inDeep(p.x,p.z);if(P.inWater)speed*=P.swim?.5:.6;if(P.swim){S.st-=4*dt;P.stDelay=.6;if(S.st<=0)hurtTick(4*dt,'drowning');}
 if(RIDE.on){speed*=sprint?1.75:2.1;if(P.swim){RIDE.on=false;toast('Your horse refuses deep water');}}if(P.atk)speed*=P.atk.v4?.12:.25;if(V4.chg)speed=0;if(P.rooted>0){P.rooted-=dt;speed=0;}if(FISH.on)speed=0;
 if(P.dodge>0){P.dodge-=dt;const k=P.dodge/.35;P.iframe=(k<.857&&k>.143)?1:0;p.addScaledVector(P.dodgeDir,12*dt);P.yaw=Math.atan2(P.dodgeDir.x,P.dodgeDir.z);}
 else{P.iframe=0;v4Move(mv,speed,dt);p.addScaledVector(P.vel,dt);
  if(P.lock&&P.lock.alive!==false&&P.lock.pos.distanceTo(p)<30){const ty=Math.atan2(P.lock.pos.x-p.x,P.lock.pos.z-p.z);P.yaw+=wrapPi(ty-P.yaw)*Math.min(1,dt*12);}else if(P.lock)P.lock=null;
  if(P.moving&&!P.atk&&!V4.chg){const ty=Math.atan2(mv.x,mv.z);const dy=wrapPi(ty-P.yaw);if(!P.lock)v4Face(mv,dt);P.lean=lerp(P.lean,clamp(dy,-.6,.6)*.5*clamp(P.vel.length()/6,.3,1.3),dt*7);}else P.lean=lerp(P.lean,0,dt*6);}
 p.x=clamp(p.x,WMIN,WMAX);p.z=clamp(p.z,ZMIN,ZMAX);collide(p,.4);
 const gy=H(p.x,p.z);P.inWater=inWater(p.x,p.z);if(p.z>ZMAX-4||gy<WATER_SEA-.5){p.z=Math.min(p.z,ZMAX-4);}
 const surf=pool.position.y-1.15;if(P.swim&&p.y<surf){p.y=lerp(p.y,surf+Math.sin(time*2)*.05,Math.min(1,dt*6));P.vy=0;P.ground=true;}
 P.vy-=20*dt;p.y+=P.vy*dt;if(v4Ground(p,gy,dt)){}else if(p.y<=gy){if(!P.ground&&P.vy<-6){P.landSquash=.25;noise(.1,400,.15);if(KMF.ok)try{KMF.hero.land(clamp(-P.vy/12,.3,1.2))}catch(e){}}p.y=gy;P.vy=0;P.ground=true;}else if(p.y>gy+.3)P.ground=false;
 if(P.atk&&P.atk.v4)v4Tick(dt);else if(P.atk){const a=P.atk;a.t+=dt;if(!a.hit&&a.t>=a.hitAt){a.hit=true;doHit();}if(a.t>=a.dur){P.atk=null;if(P.queue==='L'){P.queue=null;startAttack(false);}}}
 if(P.comboT>0){P.comboT-=dt;if(P.comboT<=0)P.combo=0;}
 hero.rotation.y=P.yaw;
 // ---- procedural animation (Aether: tiered motion, lean, squash, survival body states) ----
 const tier=S.shards>=6?2:S.shards>=3?1:0;const spd=P.vel.length();P.ph=(P.ph||0)+dt*(spd<.3?0:Math.max(6.5,spd*1.75));const cyc=P.ph;/* distance-locked stride: feet plant instead of sliding */const amp=clamp(spd/6,0,1.3)*(tier?0.8:1);
 legL.rotation.x=Math.sin(cyc)*.7*amp;legR.rotation.x=-Math.sin(cyc)*.7*amp;hips.position.y=1.0+Math.abs(Math.sin(cyc))*.06*amp;
 const cold=S.warm<30,tired=S.st<20;chest.rotation.x=lerp(chest.rotation.x,(spd>7?.25:spd>1?.1:0)+(cold?.25:0)+(tired?.15:0),dt*6);if(cold)chest.position.x=Math.sin(time*40)*.012;else chest.position.x=0;{const br=spd<.5?Math.sin(time*1.9)*.018:0;chest.scale.set(1+br,1+br*.6,1+br);}
 P.landSquash=Math.max(0,P.landSquash-dt);if(!KMF.ok){const sway=[.035,.018,.005][tier];body.rotation.z=-P.lean*.6+(spd<.5?Math.sin(time*1.7)*sway:0);body.scale.set(1+P.landSquash*.5,1-P.landSquash*.8,1+P.landSquash*.5);}else{body.rotation.z=0;body.scale.set(1,1,1);}
 armL.rotation.set(-Math.sin(cyc)*.6*amp,0,-.12);
 if(P.atk){const a=P.atk,k=a.t/a.dur,wf=Math.max(.05,(a.hitAt-.03)/a.dur);const yari=S.eq==='yari'&&!a.sweep;
  if(a.bow){armL.rotation.set(-1.5,0,-.1);armR.rotation.set(-1.4,0,.5*(1-Math.min(1,k/(wf+.01))));}
  else if(yari){armR.rotation.set(k<wf?-.4-k/wf*.6:-1.5,0,0);weaponPivot.position.z=k>wf&&k<wf+.35?.6:0;}
  else if(a.heavy){const s=k<wf?lerp(0,-2.8,k/wf):lerp(-2.8,.9,Math.min(1,(k-wf)/.2));armR.rotation.set(s,0,-.2);chest.rotation.y=lerp(.4,-.6,k);}
  else{const side=a.idx%2?1:-1;const fk=Math.min(1,(k-wf)/(a.fin?.3:.45));const s=k<wf?lerp(0,-1.9,k/wf):lerp(-1.9,-.6,fk);armR.rotation.set(s,0,side*(k<wf?-.9:lerp(-.9,1.2,smooth(0,1,fk))));chest.rotation.y=side*(k<wf?-.5:lerp(-.5,.6,smooth(0,1,fk)));}
  trailMat.opacity=k>wf-.05&&k<wf+.35?.6:Math.max(0,trailMat.opacity-dt*4);}
 else if(P.block){armR.rotation.set(-1.4,0,.9);armL.rotation.set(-1.3,0,-.6);chest.rotation.y=0;trailMat.opacity=Math.max(0,trailMat.opacity-dt*4);weaponPivot.position.z=0;}
 else if(P.castT>0){P.castT-=dt;armL.rotation.set(-1.6,0,-.2);armR.rotation.set(-.3,0,0);}
 else if(P.gatherT>0){P.gatherT-=dt;armR.rotation.set(-1.2+Math.sin(P.gatherT*20)*.5,0,0);chest.rotation.x=.4;}
 else if(FISH.on){armR.rotation.set(-1.0,0,0);armL.rotation.set(-1.0,0,.2);}
 else{armR.rotation.set(Math.sin(cyc)*.6*amp+(tier?-.1:0),0,.12);chest.rotation.y=lerp(chest.rotation.y,0,dt*8);trailMat.opacity=Math.max(0,trailMat.opacity-dt*4);weaponPivot.position.z=0;}
 if(P.dodge>0){body.rotation.x=(1-P.dodge/.35)*TAU;body.position.y=.1;}else{body.rotation.x=0;body.position.y=0;}
 // trail sample
 if(weaponMesh){const a=new V3(0,0,.2),b=new V3(0,0,W().len+.2);weaponMesh.localToWorld(a);weaponMesh.localToWorld(b);trailPts.unshift([a,b]);if(trailPts.length>TRN)trailPts.pop();const pa=trailGeo.attributes.position;for(let i=0;i<TRN;i++){const t2=trailPts[Math.min(i,trailPts.length-1)];pa.setXYZ(i*2,t2[0].x,t2[0].y,t2[0].z);pa.setXYZ(i*2+1,t2[1].x,t2[1].y,t2[1].z);}pa.needsUpdate=true;}
 blob.position.set(p.x,gy+.05,p.z);if(hero.userData.scarf)hero.userData.scarf.forEach((t,i)=>{t.rotation.x=-.2-clamp(spd/9,0,1)*1.1+Math.sin(time*(6+i*2))*.08*(.3+spd/9);});
 if(cold&&R()<dt*2)burst(p.clone().add(new V3(Math.sin(P.yaw)*.3,1.95,Math.cos(P.yaw)*.3)),0xffffff,1,.6,.8,1.2,-0.5);
 if(P.inWater&&P.moving&&R()<dt*8)burst(p.clone().add(new V3(0,.2,0)),0xcfeeff,2,2,.4);
 // discovery + areas
 const di=discIdx(p.x,p.z);for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++){const k=di+dx+dz*DISC;if(k>=0&&k<DISC*DISC)discSet.add(k);}
 for(const rg of REGIONS){if(!rg.playable)continue;if(Math.hypot(p.x-rg.x,p.z-rg.z)<rg.r*.6){if(P.area!==rg.id){P.area=rg.id;if(rg.id!=='web')areaTitle(rg.jp,rg.en.toUpperCase(),rg.sub);if(!S.discovered[rg.id]){S.discovered[rg.id]=1;if(S.started)gainXP(25);}}break;}}
 P.lastSafe=P.lastSafe||p.clone();}
function updCamera(dt){const p=hero.position;let tgt=p.clone().add(new V3(0,1.7,0));let dist=6.2,yaw=P.camYaw,pitch=P.camPitch;
 if(P.lock&&P.lock.alive!==false){const lp=P.lock.pos;const ly=Math.atan2(lp.x-p.x,lp.z-p.z);P.camYaw+=wrapPi(ly-P.camYaw)*(1-Math.exp(-dt*4));yaw=P.camYaw;tgt.lerp(lp.clone().add(new V3(0,P.lock.isBoss?2:1,0)),.3);dist=P.lock.isBoss?9.5:7;}
 if(V4.camDist)dist=V4.camDist;V4.dist=V4.dist||dist;V4.dist+=(dist-V4.dist)*(1-Math.exp(-dt*4));dist=V4.dist;
 tgt=v4CamPivot(tgt,dt);// v0.4: spring-smoothed pivot, camera rigidly offset from it (no lerp-chase jitter)
 const off=new V3(-Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch)).multiplyScalar(dist);const want=tgt.clone().add(off);let minY=H(want.x,want.z)+.6;for(const st of structures){if(st.type==='campfire')continue;const dd=Math.hypot(want.x-st.x,want.z-st.z);if(dd<2.6){const ry=H(st.x,st.z)+(st.type==='hut'?4.4:2.6);minY=Math.max(minY,lerp(ry,want.y,dd/2.6));}}for(const w of walls){if(Math.hypot(want.x-w.x,want.z-w.z)<2.2)minY=Math.max(minY,w.y+3.2);}
 const lift=Math.max(0,minY-want.y);cspring(V4.lift,lift,lift>V4.lift.x?20:6,dt);want.y+=Math.max(V4.lift.x,lift*.85);
 camera.position.copy(want);const sh=v4Shake(dt);if(sh){camera.position.x+=sh[0];camera.position.y+=sh[1];tgt=tgt.clone();tgt.x+=sh[0]*.6;tgt.y+=sh[1]*.6;tgt.z+=sh[2];}camera.lookAt(tgt);}

/* ============ MAIN LOOP ============ */
const clock=new THREE.Clock();let gtime=0,saveT=30,spawnT=0,fpsAcc=0,fpsN=0,perfStep=0,lowT=0;
function loop(){requestAnimationFrame(loop);let raw=Math.min(clock.getDelta(),.05);fpsAcc+=raw;fpsN++;
 try{frame(raw);}catch(e){if(!loop._errd){loop._errd=true;kmFatal('Game loop error: '+e.message,e.stack||'');}}
 renderFrame();}
function frame(raw){const menu=document.body.classList.contains('menu');const paused=menu||(!$('pause').classList.contains('hidden'))||(!$('dead').classList.contains('hidden'));
 let dt=raw;if(TIME.freeze>0){TIME.freeze-=raw;dt=0;}if(TIME.slowT>0){TIME.slowT-=raw;dt*=TIME.slow;}
 if(paused){updSky(raw);updCamera(raw);try{AUDIO.tick(raw);}catch(e){}return;}
 gtime+=dt;S.time=(S.time+dt/DAY_LEN)%1;
 updPlayer(dt,gtime);survivalTick(dt);updWalls(dt);motionUpdate(dt,raw);try{villageUpdate(dt);AUDIO.tick(dt);v03Update(dt);v4FxUpdate(dt);artUpdate(dt);v5Update(dt,raw);}catch(e){if(!window._vuErr){window._vuErr=1;console.warn('[kanemori] village update',e);}}weatherTick(dt);updSky(dt);
 for(const m of minions)updMinion(m,dt,gtime);updBoss(dt,gtime);updProjs(dt);updLoot(dt);updParts(dt);updRings(raw);updFishing(dt);regrowTick(dt);
 spawnT-=dt;if(spawnT<=0){spawnT=4;spawnTick(false);}
 fallTex.offset.y-=dt*1.6;mist.forEach((m,i)=>{m.position.y=riverY(-110)+Math.sin(gtime+i)*.4;m.rotation.y+=dt*.3;});arenaMist.forEach((m,i)=>m.position.x+=Math.sin(gtime*.3+i)*dt*.5);
 shardBeacon.material.opacity=.12+Math.sin(gtime*2)*.05;
 updCamera(raw);updDns(raw);
 if((gtime*2|0)!==((gtime-dt)*2|0))updLockOverlay();if(titleT>0){titleT-=raw;if(titleT<=0)$('title').style.opacity='0';}
 if((gtime*10|0)%2===0){updHUD();drawMini();drawCompass();drawRing();}if((gtime*4|0)!==((gtime-dt)*4|0)){updQuest();drawBell();}
 saveT-=raw;if(saveT<=0){saveT=30;save();}
 // auto quality drop (Mountain Drop)
 if(fpsAcc>2){const fps=fpsN/fpsAcc;fpsAcc=0;fpsN=0;if(typeof v5AutoQ==='function'&&v5AutoQ(fps)){}else if(fps<24&&!QS.has('noauto')){lowT++;if(lowT>=2&&perfStep<2){lowT=0;perfStep++;if(perfStep===1&&FXQ.on&&composer){FXQ.on=false;renderer.setPixelRatio(1);kmWarn('Low frame rate ('+fps.toFixed(0)+' fps): post FX off, resolution reduced. G turns FX back on.');}
  else{perfStep=2;renderer.setPixelRatio(.75);renderer.shadowMap.enabled=false;scene.traverse(o=>{if(o.material)o.material.needsUpdate=true;});kmWarn('Low frame rate: shadows off, resolution lowered.');}}}else lowT=0;}}
function applyLoaded(){hero.position.set(S.pos[0],H(S.pos[0],S.pos[2]),S.pos[2]);P.yaw=P.camYaw=S.yaw;equip(S.weapons.includes(S.eq)?S.eq:'bokken');
 for(const s of structures)scene.remove(s.g);structures.length=0;for(const s of S.structures||[])buildStruct(s.type,s.x,s.z,s.lit,s.fuel).grow=1;
 crackMeshes.forEach(m=>m.parent&&m.parent.remove(m));crackMeshes.length=0;for(let i=0;i<S.shards;i++)addCracks(i);
 if(S.boss.dead){boss.alive=false;boss.state='done';bossG.visible=false;silkLine.visible=false;shardBeacon.visible=false;webG.visible=true;}
 discSet=new Set(S.disc||[]);setWeather(S.weather,S.wxT);refreshHotbar();}
const _save=save;save=function(m){S.disc=[...discSet];_save(m);};
function startGame(cont){audioInit();P.dead=false;hide('dead');if(!(cont&&load())){S=freshState();applyLoaded();setWeather('clear',150);}try{afterStateReset();}catch(e){console.warn(e);}document.body.classList.remove('menu');hide('start');if(!QS.has('shots')&&PL_OK)requestLock();S.started=true;spawnTick(true);spawnTick(true);
 areaTitle('鐘守','KANEMORI','Keeper of the Shattered Bell · Kanemura');refreshHotbar();updQuest();drawBell();}
wrapJP(document.body);setJP(SHOWJP);
/* ---- settings ---- */
const LLM={url:lsGet('km_llm_url')||'',key:lsGet('km_llm_key')||'',model:lsGet('km_llm_model')||''};
const AUDSET={mus:+(lsGet('km_vol_mus')||0.6),sfx:+(lsGet('km_vol_sfx')||0.8)};
function openSettings(){$('sJP').checked=SHOWJP;$('sMus').value=AUDSET.mus;$('sSfx').value=AUDSET.sfx;$('sSens').value=MSET.sens;$('sInv').checked=MSET.inv;$('sLlmUrl').value=LLM.url;$('sLlmKey').value=LLM.key;$('sLlmModel').value=LLM.model;show('settings');}
$('sJP').onchange=e=>{setJP(e.target.checked);refreshHotbar();updQuest();};$('sMus').oninput=e=>{AUDSET.mus=+e.target.value;lsSet('km_vol_mus',AUDSET.mus);if(window.AUDIO)AUDIO.setVol();};
$('sSfx').oninput=e=>{AUDSET.sfx=+e.target.value;lsSet('km_vol_sfx',AUDSET.sfx);if(master)master.gain.value=muted?0:.7*AUDSET.sfx;};
$('sSens').oninput=e=>{MSET.sens=+e.target.value;lsSet('km_sens',MSET.sens);};$('sInv').onchange=e=>{MSET.inv=e.target.checked;lsSet('km_invy',MSET.inv?'1':'0');};
['Url','Key','Model'].forEach(k=>$('sLlm'+k).oninput=e=>{LLM[k.toLowerCase()]=e.target.value.trim();lsSet('km_llm_'+k.toLowerCase(),LLM[k.toLowerCase()]);});
const setLLM=(u,m,k)=>{LLM.url=u;LLM.model=m;if(k!==undefined)LLM.key=k;lsSet('km_llm_url',u);lsSet('km_llm_model',m);if(k!==undefined)lsSet('km_llm_key',k);$('sLlmUrl').value=LLM.url;$('sLlmModel').value=LLM.model;$('sLlmKey').value=LLM.key;};
$('sOllama').onclick=()=>{setLLM('http://localhost:11434/v1/chat/completions','llama3.2','');toast('NPC AI: Ollama preset (llama3.2)');};
$('sCustom').onclick=()=>{setLLM(LLM.url&&!LLM.url.includes('11434')?LLM.url:'https://api.openai.com/v1/chat/completions',LLM.model&&LLM.model!=='llama3.2'?LLM.model:'gpt-4o-mini');toast('Enter your key, then talk to a villager');};
$('sOff').onclick=()=>{setLLM('','');toast('NPC AI off: built-in persona engine');};
$('sClearKey').onclick=()=>{LLM.key='';$('sLlmKey').value='';try{localStorage.removeItem('km_llm_key')}catch(e){}toast('API key cleared');};
$('bSet').onclick=openSettings;$('pSetB').onclick=openSettings;
$('bNew').onclick=()=>startGame(false);$('bCont').onclick=()=>startGame(true);$('bCont').disabled=!lsGet(SAVE_KEY);
$('pRes').onclick=()=>{hide('pause');if(PL_OK&&!QS.has('shots'))requestLock();};$('pSave').onclick=()=>save(true);$('pLoad').onclick=()=>{if(load()){toast('Loaded');hide('pause');}};
$('pMute').onclick=()=>{muted=!muted;lsSet('km_mute',muted?'1':'0');if(master)master.gain.value=muted?0:.7;toast(muted?'Muted':'Sound on');};
$('pFx').onclick=()=>onKey('KeyG');$('pNew').onclick=()=>{if(confirm('Start a new journey? Your save will be overwritten.')){hide('pause');startGame(false);save();}};
$('bRespawn').onclick=respawn;$('bWin').onclick=()=>hide('win');
equip('bokken');hero.position.set(-2,H(-2,118),118);
$('loading').remove();show('start');
if(FXQ.on)setTimeout(initFX,300);loadMotion();
// test / debug hooks
window.KM={S:()=>S,P,boss,minions,hero,give,gainXP,setWeather,startGame,craft,placeBuild,interact,castFire,openInv,save,load,
 tp:(x,z)=>{hero.position.set(x,H(x,z),z);},setTime:t=>S.time=t,cam:(y,p)=>{P.camYaw=y;P.camPitch=p;},drawMap,renderSkills,show,hide,learn:id=>{S.skills[id]=1;},spawnMinion,
 key:(c)=>{pressed[c]=true;onKey(c);},attack:h=>startAttack(h),ARENA,keys,pressed,useItem,equip,castEarth,H,TIME,
 sim(sec,bot,step=1/30){const n=Math.round(sec/step);for(let i=0;i<n;i++){if(bot&&bot(i*step)===false)return i*step;frame(step);}return sec;}};
Object.assign(window.KM,{V4,v4Request,v4Start,v4Moves,TRL,GH,ART,SHF,camera,frame,terrain,renderer,Vec:(x,y,z)=>new V3(x,y,z),V03,PEOPLE,DATA,openTalk,closeTalk,sendTalk,personaReply,openJournal,renderJournal,toggleRide,RIDE,startQuest,relOf,setJP,tradeMenu,giftMenu,recruit});
try{v5Late();}catch(e){console.warn('[kanemori] v5 late',e);}
try{Object.assign(window.KM,{scene,THREE,V5,V5U,QC,QCFG,WATER5,falls,mist,RIVX,FALL_Z,riverY,JG,SEC,setQuality,meshH,weaponPivot,W,v4ChargeStart,v4ChargeEnd});}catch(e){console.warn('[kanemori] dbg',e);}
loop();
</script>
</body></html>
