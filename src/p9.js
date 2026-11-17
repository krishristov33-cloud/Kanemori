/* =====================================================================
   v0.3 SECTION: VILLAGE · NPCs · DIALOGUE · RELATIONSHIPS · FACTIONS ·
   JOURNAL · QUESTS · MYSTERY CHARACTERS · STABLE (horse & cart)
   Data-driven: loads data/npcs.json, quests.json, lore.json, mystery.json
   (see data/SCHEMA.md); built-in placeholder data has the same shape.
   ===================================================================== */
const DATA={factions:[
 {id:'village',name:'Kanemura Folk',desc:'Townsfolk of the shrine town under the broken bell.',area:'kanemura'},
 {id:'forest',name:'Forest Folk',desc:'Charcoal burners and kodama keepers of Sugi no Mori.',area:'sugi'},
 {id:'river',name:'River People',desc:'Fishers and ferrymen of Kawa Valley.',area:'kawa'}],
npcs:[
 {id:'oharu',name:'Oharu',nameJp:'お春',role:'Shopkeeper',faction:'village',home:'house2',work:'shop',schedule:[{from:6,to:19,at:'work'},{from:19,to:22,at:'wander'},{from:22,to:6,at:'home'}],
  persona:{personality:'warm, gossipy, shrewd with money',fears:['the yokai that come at night','her son Taro leaving for the city'],wants:['rare mushrooms','news from the river'],speech:'brisk, calls Ren "young bell-keeper"',secret:'She hid a bell shard fragment for years, thinking it was a lucky charm. It was just brass.'},
  greeting:'Ah, the young bell-keeper! Buying or just admiring my shelves?',
  lines:{bell:['That bell rang every dusk for as long as I have lived. The silence since the typhoon makes my teeth ache.'],forest:['Mushrooms from Sugi no Mori sell well. The red ones are for soup, not for eating raw, mind you.'],trade:['Coins for goods, goods for coins. Fair and simple.'],fear:['At night I hear scratching on the shutters. Silk threads on the door in the morning.']},
  likes:['mushroom','tea','silk'],dislikes:['meat'],shop:{sells:[{item:'salve',price:14},{item:'tea',price:10},{item:'arrow',price:2},{item:'ofuda',price:18},{item:'gfish',price:9}],buys:['fish','hide','mushroom','herb','silk','meat','sap','bamboo']},
  recruitable:false,quests:['q_mushrooms'],start:{affinity:10,trust:5,fear:0},look:{robe:'#b4533a',hair:'#2b1d14'}},
 {id:'genzo',name:'Genzo',nameJp:'源蔵',role:'Blacksmith',faction:'village',home:'house1',work:'smith',schedule:[{from:7,to:20,at:'work'},{from:20,to:6,at:'home'}],
  persona:{personality:'gruff, proud, secretly soft-hearted',fears:['his hands going weak','that the bell was cast badly by his grandfather'],wants:['iron ore','a worthy apprentice'],speech:'few words, metal metaphors'},
  greeting:'Hm. Ren. If it is not iron you bring, keep it short.',
  lines:{bell:['My grandfather cast the bell. Bronze, gold seams. If it cracked, the mountain cracked it, not his hands.'],trade:['Steel costs. Bring ore and I will sharpen your edge for less.'],forest:['Rust rocks by the river. Iron blood in them.'],fear:['Fear is a flaw in the casting. You hammer it out.']},
  likes:['iron','flint','tea'],dislikes:['mushroom'],shop:{sells:[{item:'kunai',price:4},{item:'arrow',price:2},{item:'iron',price:12},{item:'flint',price:4}],buys:['iron','stone','flint','wood','hide']},
  recruitable:true,combat:{hp:160,dmg:12},quests:['q_ore'],start:{affinity:0,trust:10,fear:0},look:{robe:'#3b3a40',hair:'#555'}},
 {id:'shinobu',name:'Shinobu',nameJp:'忍',role:'Temple Priestess',faction:'village',home:'temple',work:'temple',schedule:[{from:5,to:21,at:'work'},{from:21,to:5,at:'home'}],
  persona:{personality:'calm, learned, quietly frightened of what sleeps in the mountain',fears:['Orochi waking','losing her faith'],wants:['the eight kakera returned','old prayer strips'],speech:'measured, uses proverbs'},
  greeting:'Welcome, Keeper. The kami are listening, even when the bell is not.',
  lines:{bell:['The bell does not ring to be heard. It rings so that something below can keep sleeping.'],orochi:['Eight heads, eight shards. That is not coincidence, Ren.'],fear:['I pray every hour now. I am afraid the prayers are only for me.'],jorogumo:['The Lady of the Canopy was a weaver once. Grief turned her silk to iron.']},
  likes:['ofuda','herb','tea'],dislikes:['meat','fish'],recruitable:true,combat:{hp:110,dmg:8},quests:['q_prayers'],start:{affinity:15,trust:15,fear:0},look:{robe:'#e9e4da',hair:'#111'}},
 {id:'kenta',name:'Kenta',nameJp:'健太',role:'Stable Keeper',faction:'village',home:'house3',work:'stable',schedule:[{from:6,to:20,at:'work'},{from:20,to:6,at:'home'}],
  persona:{personality:'cheerful, horse-mad, talks too fast',fears:['wolves near the paddock','debt'],wants:['customers','carrots (he means any vegetable)'],speech:'excited, lots of exclamation'},
  greeting:'Hey hey, Ren! Looking for four legs? Best horses this side of the mountain!',
  lines:{trade:['A horse is 120 coins, a horse with cart 200. The cart carries a chest for your loot!'],forest:['Do not ride into the web woods. Horses hate silk.'],fear:['Something spooked the mares last night. Big. Lots of legs.']},
  likes:['herb','mushroom','fish'],dislikes:['silk'],shop:{sells:[{item:'horse',price:120},{item:'cart',price:200}],buys:['herb','fiber']},recruitable:false,quests:[],start:{affinity:5,trust:5,fear:0},look:{robe:'#5a7a3a',hair:'#4a2a14'}},
 {id:'aiko',name:'Aiko',nameJp:'愛子',role:'Hunter',faction:'forest',home:'house4',work:{x:-30,z:118},schedule:[{from:5,to:17,at:'work'},{from:17,to:22,at:'wander'},{from:22,to:5,at:'home'}],
  persona:{personality:'sharp-tongued, brave, competitive',fears:['being pitied','spiders, though she hides it'],wants:['to hunt the Jorogumo','a better bow'],speech:'short, teasing'},
  greeting:'Bell-keeper. Still in one piece? Impressive.',
  lines:{forest:['Deer run at dawn near the cedars. Shoot early, shoot once.'],jorogumo:['I will put an arrow in that spider queen. With or without you.'],hunt:['Want to hunt together? I lead, you keep up.'],fear:['Spiders? Me? ...just the big ones.']},
  likes:['arrow','meat','hide'],dislikes:['silk'],recruitable:true,combat:{hp:120,dmg:10,ranged:true},quests:['q_hunt'],start:{affinity:0,trust:0,fear:0},look:{robe:'#6b4a2a',hair:'#1a1a1a'}},
 {id:'jiro',name:'Old Jiro',nameJp:'次郎',role:'Fisherman',faction:'river',home:'house5',work:{x:58,z:120},schedule:[{from:5,to:15,at:'work'},{from:15,to:20,at:'wander'},{from:20,to:5,at:'home'}],
  persona:{personality:'slow, kind, full of river tales',fears:['the river rising','being forgotten'],wants:['someone to listen','a golden koi'],speech:'rambling, warm'},
  greeting:'Sit, sit. The fish are patient, so am I.',
  lines:{river:['The river people say a koi with gold scales swims below the waterfall. Catch it and your luck turns.'],bell:['When the bell rang, the fish jumped. Now they hide.'],fear:['The water rose twice this month. Mountains should not breathe.']},
  likes:['fish','gfish','tea'],dislikes:[],recruitable:false,quests:['q_koi'],start:{affinity:10,trust:10,fear:0},look:{robe:'#3a5a7a',hair:'#ccc'}},
 {id:'yui',name:'Yui',nameJp:'結衣',role:'Innkeeper',faction:'village',home:'inn',work:'inn',schedule:[{from:7,to:23,at:'work'},{from:23,to:7,at:'home'}],
  persona:{personality:'gentle, observant, hides worry with hospitality',fears:['the missing bell-ringer never coming home'],wants:['news of her brother, the bell-ringer Sota'],speech:'polite, soft'},
  greeting:'Please, rest a while. You look like the mountain chewed on you.',
  lines:{bell:['My brother Sota rang the bell. On the typhoon night he went up to the frame and did not come back.'],ringer:['If you hear a small bell in the mist near the waterfall... please, follow it.'],fear:['I set his bowl every evening.']},
  likes:['tea','fish','herb'],dislikes:[],recruitable:false,quests:['q_sota'],start:{affinity:10,trust:5,fear:0},look:{robe:'#8a5a9a',hair:'#221'}},
 {id:'daisuke',name:'Daisuke',nameJp:'大輔',role:'Charcoal Burner',faction:'forest',home:{x:-46,z:70},work:{x:-46,z:70},schedule:[{from:6,to:22,at:'work'},{from:22,to:6,at:'home'}],
  persona:{personality:'suspicious of town folk, loyal once won',fears:['the kodama punishing him for cutting trees'],wants:['respect from the village','sap for his kilns'],speech:'grumbling, dry humour'},
  greeting:'Town boy. What do you want in my smoke?',
  lines:{forest:['Every tree I burn, I thank. The kodama watch. They remember.'],trade:['Sap for coin. Not much coin.'],fear:['Little white faces in the branches at night. Counting.']},
  likes:['sap','wood','tea'],dislikes:['ofuda'],recruitable:true,combat:{hp:140,dmg:11},quests:['q_sap'],start:{affinity:-10,trust:-5,fear:0},look:{robe:'#2e2a26',hair:'#3a2a1a'}}
],
quests:[
 {id:'q_mushrooms',title:'Mushrooms for Oharu',type:'side',giver:'oharu',desc:'Oharu wants 5 mushrooms from Sugi no Mori for her soup stall.',steps:[{text:'Gather 5 mushrooms',goal:{type:'collect',item:'mushroom',n:5}},{text:'Bring them to Oharu',goal:{type:'give',item:'mushroom',n:5,target:'oharu'}}],reward:{xp:60,coins:25,items:{salve:1},affinity:{oharu:15},rep:{village:10}}},
 {id:'q_ore',title:'Iron for the Forge',type:'side',giver:'genzo',desc:'Genzo needs 4 iron ore from the rust rocks by the river.',steps:[{text:'Bring Genzo 4 iron ore',goal:{type:'give',item:'iron',n:4,target:'genzo'}}],reward:{xp:80,coins:30,items:{kunai:8},affinity:{genzo:20},rep:{village:10},lore:['l_casting']}},
 {id:'q_prayers',title:'Prayer Strips',type:'side',giver:'shinobu',desc:'Shinobu asks for 2 ofuda to re-seal the temple gate.',steps:[{text:'Bring Shinobu 2 ofuda',goal:{type:'give',item:'ofuda',n:2,target:'shinobu'}}],reward:{xp:70,coins:15,items:{tonic:1},affinity:{shinobu:20},rep:{village:8},lore:['l_orochi']}},
 {id:'q_hunt',title:'The Hunter\'s Wager',type:'side',giver:'aiko',desc:'Aiko bets you cannot hunt 3 deer before she does.',steps:[{text:'Hunt 3 deer',goal:{type:'kill',target:'deer',n:3}},{text:'Tell Aiko',goal:{type:'talk',target:'aiko'}}],reward:{xp:90,coins:20,items:{arrow:15},affinity:{aiko:20},rep:{forest:10}}},
 {id:'q_koi',title:'The Golden Koi',type:'side',giver:'jiro',desc:'Old Jiro dreams of a golden koi below the waterfall. Fish at Taki Pool.',steps:[{text:'Catch 3 fish at the falls (or anywhere)',goal:{type:'collect',item:'fish',n:3}},{text:'Show Jiro',goal:{type:'give',item:'fish',n:3,target:'jiro'}}],reward:{xp:70,coins:20,items:{koi:1},affinity:{jiro:20},rep:{river:15},lore:['l_koi']}},
 {id:'q_sap',title:'Sap for the Kilns',type:'side',giver:'daisuke',desc:'Daisuke needs 4 cedar sap for his charcoal kilns.',steps:[{text:'Bring Daisuke 4 sap',goal:{type:'give',item:'sap',n:4,target:'daisuke'}}],reward:{xp:60,coins:15,affinity:{daisuke:25},rep:{forest:15}}},
 {id:'q_sota',title:'The Lost Bell-Ringer',type:'secret',giver:'yui',desc:'Yui\'s brother Sota vanished on the typhoon night. A small bell was heard near the waterfall.',steps:[{text:'Find the lost bell-ringer near Taki Pool',goal:{type:'talk',target:'ringer'}},{text:'Bring word to Yui',goal:{type:'talk',target:'yui'}}],reward:{xp:150,coins:40,affinity:{yui:30},rep:{village:15},lore:['l_sota']}},
 {id:'q_mask',title:'The Hermit\'s Mask',type:'secret',giver:'hermit',desc:'The masked hermit wants you to defeat the Lady of the Canopy without fleeing the web.',steps:[{text:'Defeat the Jorogumo',goal:{type:'kill',target:'jorogumo',n:1}},{text:'Return to the hermit',goal:{type:'talk',target:'hermit'}}],reward:{xp:200,items:{ofuda:3},lore:['l_hermit']}},
 {id:'q_fox',title:'Three Riddles',type:'secret',giver:'fox',desc:'The fox traveler wants a gift of tea, a gift of fish and a gift of silk.',steps:[{text:'Give the fox tea',goal:{type:'give',item:'tea',n:1,target:'fox'}},{text:'Give the fox fish',goal:{type:'give',item:'fish',n:1,target:'fox'}},{text:'Give the fox silk',goal:{type:'give',item:'silk',n:1,target:'fox'}}],reward:{xp:150,coins:60,items:{firearrow:6},lore:['l_fox']}}
],
lore:[
 {id:'l_bell',title:'The Bell of Kanemura',text:'Cast a thousand years ago with gold in its seams, the bell was rung each dusk so that something under Nemuriyama would keep sleeping.',found:'start'},
 {id:'l_casting',title:'The Casting',text:'Genzo\'s grandfather recast the bell\'s lip after a quake. He swore it would hold for another thousand years. It held for sixty.',found:'quest:q_ore'},
 {id:'l_orochi',title:'Eight Heads, Eight Shards',text:'Temple scrolls tell of Yamata no Orochi, the eight-headed serpent bound beneath the summit. Each kakera holds one head\'s dream.',found:'quest:q_prayers'},
 {id:'l_koi',title:'The Golden Koi',text:'River people say the koi of Taki Pool was once a bell-keeper who chose to swim forever rather than let the river forget the bell\'s song.',found:'quest:q_koi'},
 {id:'l_jorogumo',title:'Lady of the Canopy',text:'The Jorogumo was a weaver of Kanemura who lost her children to a flood. She climbed the cedars to never see water again.',found:'shard:1'},
 {id:'l_sota',title:'Sota\'s Last Peal',text:'Sota rang the bell as it cracked. The shock flung him into the mist. He has been ringing a hand-bell ever since, keeping the dark at bay one step at a time.',found:'quest:q_sota'},
 {id:'l_hermit',title:'The Masked Hermit',text:'Beneath the mask is the face of the last Keeper. He failed. He has been waiting for someone who will not.',found:'quest:q_mask'},
 {id:'l_fox',title:'The Fox\'s Bargain',text:'Kitsune never lie. They only tell truths you are not ready for. Her ninth tail is a shard\'s shadow.',found:'quest:q_fox'}],
story:[
 {id:'s_prologue',title:'Typhoon Night',text:'The great bell cracked and its eight kakera scattered across Nemuriyama. I am Ren, and the village calls me Keeper now.',trigger:'start'},
 {id:'s_first',title:'The First Kakera',text:'The Lady of the Canopy is still. Gold runs through my cracks. One shard home, seven to go.',trigger:'shard:1'}],
mystery:[
 {id:'hermit',name:'The Masked Hermit',nameJp:'面の隠者',area:'sugi',x:-118,z:20,look:'hermit',time:'any',persona:{personality:'cryptic, weary, kind underneath',fears:['seeing his own face'],wants:['a Keeper who will not run'],speech:'riddles and short koans'},
  greeting:'A bell-keeper with a cracked bell. How fitting. Sit.',lines:{bell:['A bell is mostly silence shaped by bronze.'],orochi:['The serpent dreams. Every shard you take, it dreams less.'],jorogumo:['Do not flee her web. Fleeing is how I lost mine.']},lore:['l_bell'],quest:'q_mask'},
 {id:'fox',name:'Fox-Spirit Traveler',nameJp:'狐の旅人',area:'kawa',x:84,z:30,look:'fox',time:'any',persona:{personality:'playful, teasing, ancient',fears:['iron bells','being named'],wants:['gifts and good manners'],speech:'teasing, answers questions with questions'},
  greeting:'Oh? A human who can see me. How rude of you. How delightful.',lines:{bell:['Bells keep things asleep. Are you sure you want everything asleep?'],orochi:['I knew him when he had one head. Charming fellow.']},lore:[],quest:'q_fox'},
 {id:'ringer',name:'The Lost Bell-Ringer',nameJp:'迷いの鐘撞き',area:'taki',x:52,z:-92,look:'ringer',time:'any',persona:{personality:'dazed, gentle, repeating himself',fears:['the silence','forgetting his sister'],wants:['to go home','to hear the great bell again'],speech:'drifting, half-remembered sentences'},
  greeting:'...ring, ring... is it dusk? Yui will be setting my bowl...',lines:{bell:['I struck it and it screamed. Gold dust everywhere. Then the mist.'],yui:['Yui... tell her I am still ringing. Tell her I will come home.']},lore:[]}
]};
const PRICE={wood:2,stone:2,flint:4,iron:10,fiber:1,herb:3,mushroom:4,sap:3,hide:8,meat:4,fish:5,silk:9,bamboo:3,ofuda:15,salve:12,tea:8,tonic:20,gfish:8,gmeat:7,skewer:10,arrow:2,firearrow:5,kunai:3,koi:60};
async function loadData(){for(const f of['npcs','quests','lore','mystery']){try{const r=await fetch('data/'+f+'.json',{cache:'no-store'});if(!r.ok)continue;const j=await r.json();
  for(const k of['factions','npcs','quests','lore','story','mystery'])if(Array.isArray(j[k])&&j[k].length)DATA[k]=j[k];console.log('[kanemori] loaded data/'+f+'.json');}catch(e){/* placeholder data stays */}}
 for(const q of DATA.quests)for(const s of(q.steps||[]))if(s.goal&&s.goal.item&&!ITEMS[s.goal.item])ITEMS[s.goal.item]=['🎴',s.goal.item];
 for(const n of DATA.npcs){for(const it of(n.likes||[]))if(!ITEMS[it])ITEMS[it]=['🎴',it];}
 buildPeople();}
Object.assign(ITEMS,{coin:['🪙','Coins'],koi:['🐟','Golden koi'],silk:ITEMS.silk||['🕸️','Spider silk']});
/* ---------- village buildings ---------- */
const BLD={shop:{x:16,z:138,door:[13.6,141]},house1:{x:-16,z:140,door:[-14,143]},house2:{x:-14,z:164,door:[-13,161]},inn:{x:18,z:165,door:[17,162]},house3:{x:-26,z:152,door:[-23,152]},
 smith:{x:-6,z:142,door:[-6,144.5]},temple:{x:-4,z:176,door:[-4,171]},stable:{x:30,z:150,door:[27,148]},house4:{x:-32,z:122,door:[-30,124]},house5:{x:44,z:132,door:[42,130]},shrine:{x:-24,z:134,door:[-22,136]},well:{x:2,z:136,door:[3.5,136]},bellframe:{x:4,z:150,door:[4,146]}};
function bldPos(id){if(id&&typeof id==='object')return[id.x,id.z];const b=BLD[id];return b?b.door:[0,148];}
{// temple (pagoda-ish hall)
 const g=new THREE.Group(),x=-4,z=176;g.position.set(x,H(x,z),z);const red=std(0xc8402c,{emissive:0x3a0800,emissiveIntensity:.25}),roofM=std(0x2a2e3e),wall=std(0xeae0c8);
 const base=new THREE.Mesh(new THREE.BoxGeometry(11,1,9),std(0x8a8580));base.position.y=.5;g.add(base);const hall=new THREE.Mesh(new THREE.BoxGeometry(9,4,7),wall);hall.position.y=3;g.add(hall);
 for(const[px,pz]of[[-4.3,3.4],[4.3,3.4],[-4.3,-3.4],[4.3,-3.4],[-1.5,3.4],[1.5,3.4]]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,4,8),red);p.position.set(px,3,pz);g.add(p);}
 for(let i=0;i<2;i++){const r=new THREE.Mesh(new THREE.CylinderGeometry(i?3.6:1.2,i?7.6:6.2,i?1.6:1.8,4),roofM);r.rotation.y=Math.PI/4;r.scale.z=.8;r.position.y=i?5.8:7.6;g.add(r);}
 const ft=new THREE.Mesh(new THREE.ConeGeometry(.3,1.6,6),std(0xd8b04a,{metalness:.7,roughness:.3}));ft.position.y=9.2;g.add(ft);
 const lt=new THREE.PointLight(0xffa040,6,14,1.6);lt.position.set(0,3,5.5);g.add(lt);g.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true});scene.add(g);colliders.push({x,z,r:5.2});
 torii(-4,166,0,.85);}
{// stable with paddock fence + sign
 const g=new THREE.Group(),x=30,z=150;g.position.set(x,H(x,z),z);g.rotation.y=-Math.PI/2;const wood=std(0x7a5232),roofM=std(0x4a3a2e);
 const back=new THREE.Mesh(new THREE.BoxGeometry(8,3,.3),wood);back.position.set(0,1.5,-2.5);g.add(back);for(const sx of[-4,4]){const s=new THREE.Mesh(new THREE.BoxGeometry(.3,3,5),wood);s.position.set(sx,1.5,0);g.add(s);}
 const roof=new THREE.Mesh(new THREE.BoxGeometry(9,.3,6.4),roofM);roof.position.y=3.3;roof.rotation.x=-.15;g.add(roof);
 for(let i=-5;i<=5;i++){const p=new THREE.Mesh(new THREE.BoxGeometry(.16,1.1,.16),wood);p.position.set(i*1.1,.55,5);g.add(p);}const rail=new THREE.Mesh(new THREE.BoxGeometry(11.4,.12,.12),wood);rail.position.set(0,.95,5);g.add(rail);
 const hay=new THREE.Mesh(new THREE.CylinderGeometry(.7,.7,1,10),std(0xd8c070));hay.rotation.z=Math.PI/2;hay.position.set(2.5,.6,-1.2);g.add(hay);
 g.traverse(o=>{if(o.isMesh)o.castShadow=true});scene.add(g);colliders.push({x:x+1.5,z,r:2.6});}
[[-8,132],[12,156],[-20,170],[26,140],[-2,160]].forEach(([x,z])=>lamp(x,z));
// small shop awning + smith roof markers
{const a=new THREE.Mesh(new THREE.BoxGeometry(4,.12,1.6),std(0x2f6aa8));a.position.set(13.2,H(13.2,141)+2.6,141.2);a.rotation.set(.25,-.4,0);scene.add(a);
 const sr=new THREE.Mesh(new THREE.BoxGeometry(4.5,.2,3.6),std(0x33384f));sr.position.set(-5,H(-5,142)+3,142);scene.add(sr);for(const[a2,b2]of[[-7,140.4],[-3,140.4],[-7,143.6],[-3,143.6]]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,3,5),std(0x5a3b2a));p.position.set(a2,H(a2,b2)+1.5,b2);scene.add(p);}}
/* ---------- villager / mystery figure fallback models (Aether's GLB replaces when present) ---------- */
function mkFigure(look={},kind){const g=new THREE.Group();const robeC=new THREE.Color(look.robe||'#6a5a4a');
 const robe=new THREE.Mesh(new THREE.CylinderGeometry(.28,.5,1.25,8),std(robeC));robe.position.y=.7;g.add(robe);
 const sash=new THREE.Mesh(new THREE.CylinderGeometry(.3,.33,.12,8),std(0x2a2430));sash.position.y=1.05;g.add(sash);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8),std(0xe8c8a8));head.position.y=1.58;g.add(head);
 const hair=new THREE.Mesh(new THREE.SphereGeometry(.235,10,8,0,TAU,0,Math.PI*.55),std(new THREE.Color(look.hair||'#222')));hair.position.y=1.6;g.add(hair);
 const arms=[];for(const sx of[-1,1]){const a=new THREE.Mesh(new THREE.CylinderGeometry(.09,.12,.62,6),std(robeC.clone().multiplyScalar(.85)));a.position.set(sx*.36,1.1,0);a.geometry.translate(0,-.28,0);a.position.y=1.38;g.add(a);arms.push(a);}
 if(kind==='hermit'){const m=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8,0,TAU,0,Math.PI*.6),emis(0xf2efe6,.4));m.rotation.x=Math.PI/2;m.position.set(0,1.58,.1);g.add(m);
  const hat=new THREE.Mesh(new THREE.ConeGeometry(.6,.35,12),std(0xb89a5a));hat.position.y=1.92;g.add(hat);}
 if(kind==='fox'){for(const sx of[-1,1]){const e=new THREE.Mesh(new THREE.ConeGeometry(.08,.25,4),std(0xe8742a));e.position.set(sx*.13,1.86,0);g.add(e);}
  const mk=new THREE.Mesh(new THREE.ConeGeometry(.12,.3,4),std(0xffffff));mk.rotation.x=Math.PI/2;mk.position.set(0,1.55,.24);g.add(mk);
  for(let i=0;i<3;i++){const t=new THREE.Mesh(new THREE.ConeGeometry(.16,1,6),emis(0xff9a3a,.5));t.position.set((i-1)*.25,.6,-.55);t.rotation.x=-1.0;t.rotation.z=(i-1)*.4;g.add(t);}
  const wisp=new THREE.PointLight(0xff8a3a,3,8,1.8);wisp.position.y=2.2;g.add(wisp);}
 if(kind==='ringer'){const b=new THREE.Mesh(new THREE.ConeGeometry(.16,.24,10,1,true),std(0xd8b04a,{metalness:.8,roughness:.3,emissive:0x5a4010,emissiveIntensity:.6}));b.position.set(.42,.86,.12);g.add(b);
  const wisp=new THREE.PointLight(0xffd27a,3,9,1.8);wisp.position.y=2;g.add(wisp);robe.material.transparent=true;robe.material.opacity=.85;}
 g.scale.setScalar(look.scale||1);g.traverse(o=>{if(o.isMesh)o.castShadow=true});g.userData.arms=arms;return g;}
/* ---------- people runtime ---------- */
const PEOPLE=[];// {d,mesh,x,z,yaw,tgt,mode,mystery,comp,hp}
let horseMesh=null,cartMesh=null;
function relOf(id){S.rel=S.rel||{};if(!S.rel[id]){const d=findDef(id)||{},st=d.start||{};S.rel[id]={aff:st.affinity||0,trust:st.trust||0,fear:st.fear||0,met:0,mem:[],talks:0,gifts:0};}return S.rel[id];}
function findDef(id){return DATA.npcs.find(n=>n.id===id)||DATA.mystery.find(n=>n.id===id);}
function repOf(f){S.rep=S.rep||{};return S.rep[f]||0;}
function addRep(f,n){if(!f)return;S.rep=S.rep||{};S.rep[f]=clamp((S.rep[f]||0)+n,-100,100);}
function dispName(d){return SHOWJP&&d.nameJp?d.name+' '+d.nameJp:d.name;}
function buildPeople(){for(const p of PEOPLE)scene.remove(p.mesh);PEOPLE.length=0;
 for(const d of DATA.npcs){const m=(window.KMV03&&KMV03.makeVillager&&KMV03.makeVillager(d))||mkFigure(d.look||{});const[x,z]=bldPos(d.work||d.home);m.position.set(x,H(x,z),z);scene.add(m);PEOPLE.push({d,mesh:m,x,z,yaw:0,tgt:[x,z],mode:'work',wT:0,hp:(d.combat&&d.combat.hp)||100,atkT:0});}
 for(const d of DATA.mystery){const m=mkFigure(d.look==='fox'?{robe:'#e8742a',hair:'#f0f0f0'}:d.look==='ringer'?{robe:'#cfd6e6',hair:'#333'}:d.look==='hermit'?{robe:'#4a4a3a',hair:'#666'}:{},d.look);const x=d.x,z=d.z;m.position.set(x,H(x,z),z);scene.add(m);
  PEOPLE.push({d,mesh:m,x,z,yaw:0,tgt:[x,z],mode:'idle',mystery:true,home:[x,z],wT:0});}
 ensureRel();}
function ensureRel(){S.rel=S.rel||{};S.rep=S.rep||{village:0,forest:0,river:0};S.q2=S.q2||{};S.jr=S.jr||{lore:[],story:[],notes:[]};S.inv.coin=S.inv.coin==null?60:S.inv.coin;
 for(const l of DATA.lore)if(l.found==='start'&&!S.jr.lore.includes(l.id))S.jr.lore.push(l.id);for(const s of DATA.story)if(s.trigger==='start'&&!S.jr.story.includes(s.id))S.jr.story.push(s.id);}
function hourNow(){return((S.time%1)*24+24)%24;}
function schedAt(d){const h=hourNow();for(const s of(d.schedule||[])){const a=s.from,b=s.to;if(a<b?(h>=a&&h<b):(h>=a||h<b))return s.at;}return'work';}
function npcNear(){const p=hero.position;let best=null,bd=2.8;for(const n of PEOPLE){if(!n.mesh.visible)continue;const d=Math.hypot(n.x-p.x,n.z-p.z);if(d<bd){bd=d;best=n;}}
 if(best)return{npc:best,verb:'Talk to '+dispName(best.d)+(best.d.role?' ('+best.d.role+')':'')+(best.comp?' · companion':'')};
 if(S.horse&&horseMesh&&!RIDE.on&&Math.hypot(horseMesh.position.x-p.x,horseMesh.position.z-p.z)<2.6)return{horse:1,verb:'Mount horse (H)'+(S.cart?' · cart chest':'')};return null;}
function villageUpdate(dt){if(!PEOPLE.length)return;const p=hero.position,t=performance.now()/1000;
 for(const n of PEOPLE){const d=n.d;let mode=n.mystery?'idle':schedAt(d);if(n.comp)mode='follow';
  if(n.mystery&&d.time==='night'){const night=hourNow()>19||hourNow()<5;n.mesh.visible=night;}
  if(mode!==n.mode||n.wT<=0){n.mode=mode;n.wT=6+R()*6;
   if(mode==='work')n.tgt=bldPos(d.work).map(v=>v+rnd(-1.5,1.5));else if(mode==='home')n.tgt=bldPos(d.home);else if(mode==='wander')n.tgt=[rnd(-18,22),rnd(132,168)];else if(n.mystery)n.tgt=[n.home[0]+rnd(-4,4),n.home[1]+rnd(-4,4)];}
  n.wT-=dt;
  if(mode==='follow'){const ang=PEOPLE.indexOf(n)*1.3;n.tgt=[p.x-Math.sin(P.yaw+ang*.3)*2.6-Math.cos(ang)*1.2,p.z-Math.cos(P.yaw+ang*.3)*2.6+Math.sin(ang)*1.2];companionFight(n,dt);}
  const dx=n.tgt[0]-n.x,dz=n.tgt[1]-n.z,dist=Math.hypot(dx,dz);const talking=TALK.n===n;
  let sp=mode==='follow'?(dist>12?(RIDE.on?13:8.5):dist>3?5.5:0):dist>.4?1.6:0;if(talking)sp=0;
  if(dist>80&&mode==='follow'){n.x=p.x-2;n.z=p.z-2;}
  if(sp>0){n.x+=dx/dist*sp*dt;n.z+=dz/dist*sp*dt;const ty=Math.atan2(dx,dz);n.yaw+=Math.atan2(Math.sin(ty-n.yaw),Math.cos(ty-n.yaw))*Math.min(1,dt*6);}
  else if(talking||Math.hypot(p.x-n.x,p.z-n.z)<4){const ty=Math.atan2(p.x-n.x,p.z-n.z);n.yaw+=Math.atan2(Math.sin(ty-n.yaw),Math.cos(ty-n.yaw))*Math.min(1,dt*4);}
  const home=mode==='home'&&dist<.6&&!n.comp;n.mesh.visible=!home&&(n.mystery&&d.time==='night'?n.mesh.visible:true);
  const y=H(n.x,n.z);const walk=sp>0?Math.sin(t*sp*3.2+n.x):0;n.mesh.position.set(n.x,Math.max(y,WATER_SEA-.3)+Math.abs(walk)*.05+(sp?0:Math.sin(t*1.6+n.z)*.012),n.z);n.mesh.rotation.y=n.yaw;
  if(n.mesh.userData.anim){try{v03NpcAnim(n,sp,dt,talking);}catch(e){n.mesh.userData.anim=null;}}
  const ar=n.mesh.userData.arms;if(ar){ar[0].rotation.x=walk*.5;ar[1].rotation.x=-walk*.5;if(n.mystery&&d.look==='ringer'){ar[1].rotation.x=-.4+Math.sin(t*5)*.3;}}
  if(n.mystery&&d.look==='ringer'&&Math.hypot(p.x-n.x,p.z-n.z)<40&&R()<dt*.4&&AC){try{tone(1320,.5,'sine',.05)}catch(e){}}
  if(n.atkT>0)n.atkT-=dt;}
 if(S.horse){if(!horseMesh)mkHorse();const ha=horseMesh.userData.anim;if(ha){ha.setMove(RIDE.on?P.vel.length():0,0);ha.update(dt);}
  if(RIDE.on){horseMesh.position.set(p.x,H(p.x,p.z),p.z);horseMesh.rotation.y=P.yaw;const gait=Math.min(1,P.vel.length()/12);horseMesh.userData.legs.forEach((l,i)=>l.rotation.x=Math.sin(t*12+i*1.6)*.6*gait);
   if(horseMesh.userData.saddle){horseMesh.updateMatrixWorld(true);const sp2=new V3();horseMesh.userData.saddle.getWorldPosition(sp2);hero.position.y=sp2.y-(V03.anim&&V03.anim.ride?0:.85);}else hero.position.y+=1.05;
   if(cartMesh){const bx=p.x-Math.sin(P.yaw)*3.4,bz=p.z-Math.cos(P.yaw)*3.4;cartMesh.position.lerp(new V3(bx,H(bx,bz),bz),Math.min(1,dt*6));cartMesh.lookAt(p.x,cartMesh.position.y,p.z);}}
  else if(cartMesh&&horseMesh){}}
 questTick(dt);}
/* ---------- companions: follow, fight in organized hunts / boss raids ---------- */
function companionFight(n,dt){const c=n.d.combat||{dmg:9,hp:120};let tgt=null,bd=c.ranged?18:11;for(const e of enemiesAll()){if(!e.alive&&e.alive!==undefined)continue;const d=Math.hypot(e.pos.x-n.x,e.pos.z-n.z);if(d<bd){bd=d;tgt=e;}}
 if(!tgt)return;if(!c.ranged)n.tgt=[tgt.pos.x-(tgt.pos.x-n.x)/Math.max(bd,.1)*1.4,tgt.pos.z-(tgt.pos.z-n.z)/Math.max(bd,.1)*1.4];
 if(n.atkT<=0&&(c.ranged||bd<2.2)){if(tgt.isBoss&&!c.ranged&&boss.canMelee&&!boss.canMelee())return;n.atkT=c.ranged?1.6:1.1;const dir=new V3(tgt.pos.x-n.x,0,tgt.pos.z-n.z).normalize();
  try{tgt.damage(Math.round(c.dmg*(.85+R()*.3)),dir,false,false);}catch(e){}burst(new V3(tgt.pos.x,tgt.pos.y+1,tgt.pos.z),c.ranged?0xffe0a0:0xffffff,6,3,.3);
  const ar=n.mesh.userData.arms;if(ar){ar[1].rotation.x=-2.2;}}}
/* ---------- stable: horse & cart ---------- */
const RIDE={on:false};
function mkHorse(){const g=new THREE.Group(),c=std(0x6a4426),dk=std(0x2a1a10);const body=new THREE.Mesh(new THREE.BoxGeometry(.8,.85,2),c);body.position.y=1.35;g.add(body);
 const neck=new THREE.Mesh(new THREE.BoxGeometry(.4,1,.45),c);neck.position.set(0,1.95,.95);neck.rotation.x=-.5;g.add(neck);const hd=new THREE.Mesh(new THREE.BoxGeometry(.32,.35,.75),c);hd.position.set(0,2.35,1.35);g.add(hd);
 const mane=new THREE.Mesh(new THREE.BoxGeometry(.12,.9,.3),dk);mane.position.set(0,2.05,.8);mane.rotation.x=-.5;g.add(mane);const tail=new THREE.Mesh(new THREE.ConeGeometry(.14,.9,5),dk);tail.position.set(0,1.2,-1.15);tail.rotation.x=-2.6;g.add(tail);
 const legs=[];for(const[a,b]of[[-.28,.75],[.28,.75],[-.28,-.75],[.28,-.75]]){const l=new THREE.Mesh(new THREE.BoxGeometry(.16,1,.16),c);l.geometry.translate(0,-.5,0);l.position.set(a,1.05,b);g.add(l);legs.push(l);}
 const saddle=new THREE.Mesh(new THREE.BoxGeometry(.85,.15,.7),std(0xa8302a));saddle.position.y=1.82;g.add(saddle);g.userData.legs=legs;g.traverse(o=>{if(o.isMesh)o.castShadow=true});
 horseMesh=(window.KMV03&&KMV03.makeHorse&&KMV03.makeHorse())||g;horseMesh.userData.legs=horseMesh.userData.legs||[];const sx=27,sz=154;horseMesh.position.set(sx,H(sx,sz),sz);scene.add(horseMesh);
 if(S.cart&&!cartMesh&&window.KMV03&&KMV03.makeCart){cartMesh=KMV03.makeCart();cartMesh.position.set(sx,H(sx,sz),sz-3.5);scene.add(cartMesh);}
 if(S.cart&&!cartMesh){const cg=new THREE.Group(),w=std(0x8a6a42);const bed=new THREE.Mesh(new THREE.BoxGeometry(1.6,.5,2.2),w);bed.position.y=.9;cg.add(bed);
  for(const sx2 of[-.95,.95]){const wh=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,.12,12),dk);wh.rotation.z=Math.PI/2;wh.position.set(sx2,.55,0);cg.add(wh);}const box=new THREE.Mesh(new THREE.BoxGeometry(1.1,.6,.9),std(0x5a3b2a));box.position.set(0,1.45,-.3);cg.add(box);
  cg.position.set(sx,H(sx,sz),sz-3.5);scene.add(cg);cartMesh=cg;}}
function toggleRide(){if(!S.horse){toast('You have no horse. Kenta at the stable sells them.');return;}if(!horseMesh)mkHorse();
 if(RIDE.on){RIDE.on=false;const p=hero.position;horseMesh.position.set(p.x+1.3,H(p.x+1.3,p.z),p.z);toast('Dismounted');return;}
 const p=hero.position;if(Math.hypot(horseMesh.position.x-p.x,horseMesh.position.z-p.z)>4){toast('Your horse is too far away (it waits where you left it)');return;}RIDE.on=true;toast('Riding — W to gallop, H to dismount');}
function openCart(){const inv=S.cartInv=S.cartInv||{};const rows=Object.keys(S.inv).filter(k=>S.inv[k]>0&&k!=='coin'&&!k.endsWith('_kit')).map(k=>`<button class="btn cy sm" data-dep="${k}">${ITEMS[k]?ITEMS[k][0]:''} ${J(ITEMS[k]?ITEMS[k][1]:k)} ×${S.inv[k]}</button>`).join('');
 const rows2=Object.keys(inv).filter(k=>inv[k]>0).map(k=>`<button class="btn sm" data-wd="${k}">${ITEMS[k]?ITEMS[k][0]:''} ${J(ITEMS[k]?ITEMS[k][1]:k)} ×${inv[k]}</button>`).join('')||'<i>empty</i>';
 $('m2T').textContent='Cart chest';$('m2B').innerHTML=`<div class="lbl">In the cart (click to take)</div><div>${rows2}</div><div class="lbl" style="margin-top:8px">Your pack (click to store all)</div><div>${rows}</div>`;show('menu2');
 $('m2B').querySelectorAll('[data-dep]').forEach(b=>b.onclick=()=>{const k=b.dataset.dep;inv[k]=(inv[k]||0)+S.inv[k];S.inv[k]=0;refreshHotbar();openCart();});
 $('m2B').querySelectorAll('[data-wd]').forEach(b=>b.onclick=()=>{const k=b.dataset.wd;S.inv[k]=(S.inv[k]||0)+inv[k];inv[k]=0;refreshHotbar();openCart();});}
/* ---------- quests ---------- */
function qDef(id){return DATA.quests.find(q=>q.id===id);}
function qState(id){S.q2=S.q2||{};return S.q2[id];}
function startQuest(id){const q=qDef(id);if(!q||qState(id))return;S.q2[id]={step:0,n:0,done:false};toast('New '+(q.type==='main'?'story':q.type)+' quest: '+q.title);journalNote(`Took the quest “${q.title}”.`);SFX.pick&&SFX.pick();}
function questAvail(id){const q=qDef(id);return q&&!qState(id)&&(!q.after||(qState(q.after)&&qState(q.after).done));}
function qGoal(id){const q=qDef(id),s=qState(id);if(!q||!s||s.done)return null;return q.steps[s.step]&&q.steps[s.step].goal;}
function advanceQuest(id){const q=qDef(id),s=qState(id);s.step++;s.n=0;if(s.step>=q.steps.length){s.done=true;rewardQuest(q);}else toast(q.title+': '+q.steps[s.step].text);}
function rewardQuest(q){const r=q.reward||{};toast('Quest complete: '+q.title);if(r.xp)gainXP(r.xp);if(r.coins)give('coin',r.coins);for(const k in(r.items||{}))give(k,r.items[k]);
 for(const k in(r.affinity||{})){const rl=relOf(k);rl.aff=clamp(rl.aff+r.affinity[k],-100,100);rl.trust=clamp(rl.trust+r.affinity[k]*.6,-100,100);}for(const k in(r.rep||{}))addRep(k,r.rep[k]);
 for(const l of(r.lore||[]))unlockLore(l);for(const st of DATA.story)if(st.trigger==='quest:'+q.id&&!S.jr.story.includes(st.id)){S.jr.story.push(st.id);}for(const l of DATA.lore)if(l.found==='quest:'+q.id)unlockLore(l.id);journalNote(`Completed “${q.title}”.`);try{bellRing(hero.position.clone(),1)}catch(e){}}
function unlockLore(id){if(S.jr.lore.includes(id))return;const l=DATA.lore.find(x=>x.id===id);if(!l)return;S.jr.lore.push(id);toast('Lore discovered: '+l.title+' (J)');}
function journalNote(t){S.jr=S.jr||{lore:[],story:[],notes:[]};S.jr.notes.unshift({day:Math.floor(S.day||0),t});if(S.jr.notes.length>60)S.jr.notes.pop();}
let qT=0;function questTick(dt){qT-=dt;if(qT>0)return;qT=.5;ensureRel();
 for(const id in S.q2){const g=qGoal(id);if(!g)continue;const s=S.q2[id];
  if(g.type==='collect'&&(S.inv[g.item]||0)>=g.n)advanceQuest(id);
  else if(g.type==='shard'&&S.shards>=g.n)advanceQuest(id);
  else if(g.type==='visit'&&Math.hypot(hero.position.x-g.x,hero.position.z-g.z)<(g.r||8))advanceQuest(id);
  else if(g.type==='kill'&&g.target==='jorogumo'&&S.boss&&S.boss.dead)advanceQuest(id);
  else if(g.type==='recruit'&&PEOPLE.some(n=>n.comp&&n.d.id===g.target))advanceQuest(id);}
 for(const s of DATA.story)if(s.trigger&&s.trigger.startsWith('shard:')&&S.shards>=+s.trigger.split(':')[1]&&!S.jr.story.includes(s.id)){S.jr.story.push(s.id);toast('Journal: '+s.title);}
 for(const l of DATA.lore)if(l.found&&l.found.startsWith('shard:')&&S.shards>=+l.found.split(':')[1])unlockLore(l.id);
 for(const l of DATA.lore)if(l.found&&l.found.startsWith('place:')){const[x,z,r]=l.found.slice(6).split(',').map(Number);if(Math.hypot(hero.position.x-x,hero.position.z-z)<(r||8))unlockLore(l.id);}}
function questEvent(type,target,extra){if(type==='kill'){S.bestiary=S.bestiary||{};S.bestiary[target]=(S.bestiary[target]||0)+1;}if(!S.q2)return;for(const id in S.q2){const g=qGoal(id);if(!g||g.type!==type)continue;if(g.target&&g.target!==target&&g.item!==target)continue;
  if(type==='kill'){S.q2[id].n++;if(S.q2[id].n>=(g.n||1))advanceQuest(id);}else if(type==='craft'&&g.item===target)advanceQuest(id);else if(type==='talk')advanceQuest(id);}}
/* ---------- dialogue panel with free text input + persona engine (+ optional LLM) ---------- */
const TALK={n:null,hist:[],busy:false};
const INTENTS=[['bye',/\b(bye|goodbye|farewell|see you|later|leave)\b/],['greet',/^(hi|hello|hey|good (morning|evening|day)|greetings|yo)\b/],['name',/\b(who are you|your name|what.*called|about you(rself)?)\b/],
 ['job',/\b(job|work|do you do|role|trade here)\b/],['insult',/\b(stupid|idiot|ugly|hate you|useless|fool|shut up)\b/],['threat',/\b(kill you|i('| wi)ll hurt|die|threat|burn (your|this))\b/],
 ['thanks',/\b(thank|thanks|kind|beautiful|appreciate|great|wonderful|friend)\b/],['fear',/\b(afraid|fear|scared|worry|worried|frighten)\b/],['want',/\b(want|wish|dream|hope|desire)\b/],
 ['quest',/\b(help|quest|task|job for me|anything i can do|favou?r|errand)\b/],['trade',/\b(buy|sell|trade|shop|price|cost|coin|horse|cart|wares)\b/],['join',/\b(join|come with|follow me|companion|hunt (with|together)|fight with|raid|party)\b/],
 ['dismiss',/\b(go home|wait here|stay here|dismiss|leave the party)\b/],['bell',/\b(bell|kakera|shard)\b/],['jorogumo',/\b(jor[oō]gumo|spider|canopy|web)\b/],['orochi',/\b(orochi|serpent|summit|eight)\b/],
 ['forest',/\b(forest|sugi|tree|cedar|kodama|mushroom|deer)\b/],['river',/\b(river|kawa|fish|koi|water|waterfall|taki)\b/],['ringer',/\b(sota|ringer|brother|small bell)\b/],['yui',/\b(yui|sister)\b/],
 ['hunt',/\b(hunt|hunting|bow|arrow)\b/],['weather',/\b(weather|storm|rain|typhoon|cold)\b/],['secret',/\b(secret|hide|hiding|truth|really)\b/],['rumor',/\b(news|rumou?r|gossip|heard|happening)\b/],['feel',/\b(how are you|feel|mood|okay|alright)\b/]];
function intentOf(t){t=t.toLowerCase();const out=[];for(const[k,re]of INTENTS)if(re.test(t))out.push(k);return out.length?out:['chat'];}
const pk=a=>a[Math.floor(R()*a.length)];
function moodOf(rl){const s=rl.aff+rl.trust*.5-rl.fear*.6;return s>45?'devoted':s>15?'friendly':s>-15?'neutral':s>-45?'cold':'hostile';}
function personaReply(n,text){const d=n.d,rl=relOf(d.id),ps=d.persona||{},it=intentOf(text),mood=moodOf(rl),L=d.lines||{};let out=[];const nm=d.name;
 const seen=k=>rl.mem.filter(m=>m===k).length;
 for(const k of it){if(['insult'].includes(k)){rl.aff-=8;rl.trust-=4;out.push(mood==='devoted'?'That stung, Ren. I will pretend I did not hear it.':pk(['Watch your tongue, bell-keeper.','Charming. Truly.','Say that again and we are done talking.']));}
  else if(k==='threat'){rl.fear=clamp(rl.fear+15,0,100);rl.trust-=10;rl.aff-=6;out.push(pk(['...I hear you. Please, there is no need for that.','You would not dare. ...Would you?','Keeper or not, the kami see what you do.']));}
  else if(k==='thanks'){rl.aff+=3;rl.trust+=1;out.push(pk(['You are kinder than the mountain, Ren.','Hm. Kind words cost nothing, but I will take them.','That warms me more than tea.']));}
  else if(k==='greet'&&!out.length)out.push(rl.talks>2?pk([`Back again, Ren?`,`Ren. Good to see you.`]):d.greeting||'Hello.');
  else if(k==='name')out.push(`I am ${nm}${d.role?', '+d.role.toLowerCase():''}. ${ps.personality?('People say I am '+ps.personality.split(',')[0]+'.'):''}`);
  else if(k==='job')out.push(d.role?`I'm the ${d.role.toLowerCase()} here.`+(L.trade?' '+pk(L.trade):''):'I keep to myself.');
  else if(k==='fear'){if(rl.trust>=10||mood==='friendly'||mood==='devoted'){out.push(L.fear?pk(L.fear):'');if(ps.fears&&ps.fears.length)out.push('If I am honest, I fear '+pk(ps.fears)+'.');rl.trust+=2;}else out.push('Why would I tell you what scares me? We barely know each other.');}
  else if(k==='want')out.push(ps.wants&&ps.wants.length?`What I want? ${pk(ps.wants).replace(/^./,c=>c.toUpperCase())}. ${d.likes&&d.likes.length?'Bring me some '+J(ITEMS[d.likes[0]]?ITEMS[d.likes[0]][1]:d.likes[0]).toLowerCase()+' and you will see me smile.':''}`:'Peace. Just peace.');
  else if(k==='secret'){if(ps.secret&&rl.trust>=40){out.push('Since it is you... '+ps.secret);if(!rl.mem.includes('secret'))journalNote(nm+' told me a secret: '+ps.secret);}else out.push(rl.trust>=15?'Some things need more trust than we have yet.':'Secrets? Not for strangers.');}
  else if(k==='feel')out.push({devoted:'Better now that you are here.',friendly:'Tired, but well. You?',neutral:'Getting by.',cold:'Fine. Why?',hostile:'Worse for seeing you.'}[mood]);
  else if(k==='rumor'){const o=pk(PEOPLE.filter(p=>p!==n&&!p.mystery));out.push(o?`Have you met ${o.d.name}, the ${(o.d.role||'').toLowerCase()}? ${o.d.persona&&o.d.persona.wants?'They say '+o.d.name+' wants '+pk(o.d.persona.wants)+'.':''}`:'Quiet days. Too quiet.');}
  else if(k==='weather')out.push(S.weather==='storm'?'A storm! Get under a roof, fool!':S.weather==='warn'||S.weather==='rain'?'Rain coming. Build a hut or find a fire before the storm.':'Clear skies. The mountain is pretending to be kind.');
  else if(L[k])out.push(seen(k)?'As I said before: '+pk(L[k]):pk(L[k]));
  else if(k==='bell')out.push('The bell is broken, and you are the Keeper now. Find the kakera.');
  else if(k==='jorogumo')out.push('The Lady of the Canopy weaves west of the river, in the old cedars. Burn her mist with fire ofuda.');
  else if(k==='forest')out.push('Sugi no Mori is wide. Herbs, mushrooms, and things that bite.');
  else if(k==='river')out.push('The river runs cold from the falls. Good fishing at Taki Pool.');
  if(['insult','threat','thanks'].includes(k))rl.mem.push(k);else if(k!=='chat')rl.mem.push(k);}
 if(it.includes('quest')){const av=(d.quests||[]).filter(questAvail),act=(d.quests||[]).filter(id=>qState(id)&&!qState(id).done);
  if(av.length&&(rl.aff>-20)){const q=qDef(av[0]);out.push(q.desc+' Will you do it? (I added it to your journal.)');startQuest(av[0]);}else if(act.length)out.push('You already promised me: '+qDef(act[0]).title+'.');else out.push(d.quest&&!qState(d.quest)?'Hm.':'Nothing right now. Ask around the village.');
  if(d.quest&&questAvail(d.quest)&&rl.talks>=1){startQuest(d.quest);out.push(qDef(d.quest).desc);}}
 if(it.includes('trade'))out.push(d.shop?'Take a look. (Use the Trade button.)':'I have nothing to sell, but I might accept a gift.');
 if(it.includes('join'))out.push(recruit(n,true));if(it.includes('dismiss')&&n.comp){n.comp=false;out.push('I will head home then. Call on me again.');}
 if(it.includes('bye'))out.push(pk(d.lines&&d.lines.bye||['Walk safely, Keeper.','Until next time.','Mind the mist.']));
 out=out.filter(Boolean);if(!out.length){out.push(pk(mood==='hostile'?['I have nothing to say to you.']:mood==='cold'?['Mm.','Is that so.','Get to the point.']:[`Hm? ${pk(['Say that another way','I do not follow','Strange words'])}, Ren.`,(ps.wants&&ps.wants.length?'Speaking of things... I have been thinking about '+pk(ps.wants)+'.':'The bell has been silent too long.'),'Ask me about the bell, the forest, or what I fear. Or ask if I need help.']));}
 rl.aff=clamp(rl.aff,-100,100);rl.trust=clamp(rl.trust,-100,100);if(rl.mem.length>40)rl.mem.splice(0,rl.mem.length-40);
 return out.slice(0,3).join(' ');}
function recruit(n,talkMode){const d=n.d,rl=relOf(d.id);if(n.mystery)return'I walk my own path, Keeper.';if(!d.recruitable)return'Me? Fight? I would only slow you down.';if(n.comp)return'I am already at your side.';
 const need=25-repOf(d.faction)*.2;if(rl.aff+rl.trust*.5<need&&rl.fear<60)return`Earn my trust first. (Affinity needed: ~${Math.ceil(need)})`;if(PEOPLE.filter(p=>p.comp).length>=2)return'You already have two companions. Dismiss one first.';
 n.comp=true;try{if(V03.anim&&V03.anim.clips.command_gesture)V03.anim.play('command_gesture',{layer:'upper',fade:.1});}catch(e){}questEvent('recruit',d.id);journalNote(`${d.name} joined me as a companion.`);return rl.fear>=60&&rl.aff<10?'...Fine. I will come. Not that I have a choice.':pk(['Let us hunt, then. I am with you.','Lead the way, Keeper.','About time someone asked.']);}
function relBar(lbl,v,col){const w=Math.round((v+100)/2);return`<div class="relb"><span>${lbl}</span><i><b style="width:${w}%;background:${col}"></b></i><em>${Math.round(v)}</em></div>`;}
function renderTalkHead(){const n=TALK.n;if(!n)return;const d=n.d,rl=relOf(d.id);$('tkName').textContent=dispName(d);$('tkRole').textContent=(d.role||'Wanderer')+(d.faction?' · '+(DATA.factions.find(f=>f.id===d.faction)||{name:d.faction}).name:'')+' · '+moodOf(rl);
 $('tkRel').innerHTML=relBar('Affinity',rl.aff,'#e8b04a')+relBar('Trust',rl.trust,'#6fb8ff')+relBar('Fear',rl.fear*2-100,'#e85a4a');
 $('tkJoin').textContent=n.comp?'DISMISS':'RECRUIT';$('tkJoin').style.display=d.recruitable?'':'none';$('tkTrade').style.display=d.shop?'':'none';}
function tkLog(who,t){const e=document.createElement('div');e.className='tkl '+(who==='me'?'me':'them');e.innerHTML=`<b>${who==='me'?'Ren':dispName(TALK.n.d)}</b> ${t.replace(/</g,'&lt;')}`;$('tkLog').appendChild(e);$('tkLog').scrollTop=1e6;}
function openTalk(n){TALK.n=n;TALK.hist=[];const d=n.d,rl=relOf(d.id);$('tkLog').innerHTML='';renderTalkHead();show('talk');
 const first=!rl.met;rl.met=1;rl.talks++;try{const va=V03.anim;if(va&&!RIDE.on){if(first&&va.clips.bow_greet)va.play('bow_greet',{layer:'upper',fade:.15});}const na=n.mesh.userData.anim;if(na&&first&&na.clips.bow_greet)na.play('bow_greet',{fade:.15});}catch(e){}tkLog('them',first?(d.greeting||'Hello.'):({devoted:'Ren! I was hoping you would come by.',friendly:'Good to see you again, Ren.',neutral:d.greeting||'Yes?',cold:'You again.',hostile:'What do you want?'}[moodOf(rl)]));
 if(first){for(const l of DATA.lore)if(l.found==='npc:'+d.id||l.found==='mystery:'+d.id)unlockLore(l.id);for(const st of DATA.story)if((st.trigger==='npc:'+d.id||st.trigger==='mystery:'+d.id)&&!S.jr.story.includes(st.id)){S.jr.story.push(st.id);toast('Journal: '+st.title);}for(const l of(d.lore||[]))unlockLore(l);journalNote('Met '+d.name+(d.role?', the '+d.role.toLowerCase():'')+'.');if(n.mystery&&d.quest)setTimeout(()=>{if(TALK.n===n&&questAvail(d.quest)){startQuest(d.quest);tkLog('them',qDef(d.quest).desc);}},600);}
 questEvent('talk',d.id);{const mq=(d.quests||[]).find(id=>{const q=qDef(id);return q&&q.type==='main'&&questAvail(id);});if(mq)setTimeout(()=>{if(TALK.n===n&&questAvail(mq)){startQuest(mq);tkLog('them',qDef(mq).desc);}},700);}setTimeout(()=>{$('tkIn').focus();},50);}
function closeTalk(){TALK.n=null;hide('talk');}
async function sendTalk(){const ta=$('tkIn'),text=ta.value.trim();if(!text||!TALK.n||TALK.busy)return;ta.value='';tkLog('me',text);const n=TALK.n;
 let reply=personaReply(n,text);// local engine always runs (updates relationship + quest hooks)
 if(LLM.url&&LLM.model){TALK.busy=true;$('tkSend').textContent='…';try{const r=await llmReply(n,text,reply);if(r)reply=r;}catch(e){kmWarn('NPC AI unavailable, using built-in replies.');}TALK.busy=false;$('tkSend').textContent='SAY ⏎';}
 if(TALK.n!==n)return;TALK.hist.push({role:'user',content:text},{role:'assistant',content:reply});if(TALK.hist.length>12)TALK.hist.splice(0,2);tkLog('them',reply);renderTalkHead();ta.focus();}
async function llmReply(n,text,fallback){const d=n.d,rl=relOf(d.id),ps=d.persona||{};
 const sys=`You are ${d.name}${d.role?', the '+d.role:''} in Kanemura, a shrine village at the foot of Nemuriyama (the Sleeping Mountain) in a stylized Japanese-folklore world. Stay fully in character; reply in 1-3 short sentences, plain English, no stage directions.
Personality: ${ps.personality||'reserved'}. Speech style: ${ps.speech||'natural'}. Fears: ${(ps.fears||[]).join('; ')}. Wants: ${(ps.wants||[]).join('; ')}.${ps.secret&&rl.trust>=40?' Secret you may now share: '+ps.secret:''}
You are talking to Ren, the young Keeper of the shattered bell (${S.shards} of 8 kakera recovered). Your feelings toward Ren: affinity ${Math.round(rl.aff)}, trust ${Math.round(rl.trust)}, fear ${Math.round(rl.fear)} (mood: ${moodOf(rl)}). Time: ${Math.floor(hourNow())}:00, weather ${S.weather}.
Things you know: ${Object.values(d.lines||{}).flat().slice(0,8).join(' ')}
Topics Ren raised before: ${rl.mem.slice(-8).join(', ')||'none'}. A sensible in-character answer would be like: "${fallback}"
Answer ONLY with JSON: {"reply":"...","emotion":"calm|wary|warm|angry|afraid","trust_delta":0,"fear_delta":0,"action":"none|offer_trade|give_quest|join_raid|refuse|flee|tell_rumor","memory":"short note"}`;
 const ctl=new AbortController();const to=setTimeout(()=>ctl.abort(),8000);
 const r=await fetch(LLM.url,{method:'POST',signal:ctl.signal,headers:Object.assign({'Content-Type':'application/json'},LLM.key?{Authorization:'Bearer '+LLM.key}:{}),body:JSON.stringify({model:LLM.model,max_tokens:160,temperature:.8,messages:[{role:'system',content:sys},...TALK.hist,{role:'user',content:text}]})});
 clearTimeout(to);if(!r.ok)throw new Error('LLM '+r.status);const j=await r.json();let txt=(j.choices&&j.choices[0]&&(j.choices[0].message?j.choices[0].message.content:j.choices[0].text)||'').trim();
 const mm=txt.match(/\{[\s\S]*\}/);if(mm){try{const o=JSON.parse(mm[0]);const cl=v=>clamp(+v||0,-5,5);rl.trust=clamp(rl.trust+cl(o.trust_delta),-100,100);rl.fear=clamp(rl.fear+cl(o.fear_delta),0,100);if(o.memory)rl.mem.push(String(o.memory).slice(0,60));
  if(o.action==='offer_trade'&&d.shop)setTimeout(tradeMenu,300);if(o.action==='give_quest'){const av=(d.quests||[]).filter(questAvail);if(av.length)startQuest(av[0]);}if(o.action==='join_raid'&&d.recruitable&&!n.comp)recruit(n);txt=String(o.reply||'').trim();}catch(e){}}
 return txt;}
function giftMenu(){const n=TALK.n;if(!n)return;const d=n.d;const needCoin=Object.keys(S.q2||{}).some(id=>{const g=qGoal(id);return g&&g.type==='give'&&g.item==='coin'&&(g.target||qDef(id).giver)===d.id;});const items=Object.keys(S.inv).filter(k=>S.inv[k]>0&&(k!=='coin'||needCoin)&&!k.endsWith('_kit'));
 $('tkSub').innerHTML='<div class="lbl">Give an item</div>'+(items.map(k=>`<button class="btn cy sm" data-g="${k}">${ITEMS[k]?ITEMS[k][0]:''} ${J(ITEMS[k]?ITEMS[k][1]:k)} ×${S.inv[k]}</button>`).join('')||'<i>Your pack is empty.</i>');
 $('tkSub').querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{const k=b.dataset.g,rl=relOf(d.id);
  // quest give goals first
  for(const id in(S.q2||{})){const g=qGoal(id);if(g&&g.type==='give'&&(g.target||qDef(id).giver)===d.id&&g.item===k){if((S.inv[k]||0)>=g.n){S.inv[k]-=g.n;tkLog('me',`(hands over ${g.n} ${J(ITEMS[k][1])})`);tkLog('them','Exactly what I asked for. Thank you, Ren.');advanceQuest(id);refreshHotbar();renderTalkHead();$('tkSub').innerHTML='';return;}else{tkLog('them',`I need ${g.n} of those, you have ${S.inv[k]}.`);return;}}}
  try{if(V03.anim&&V03.anim.clips.give_item)V03.anim.play('give_item',{layer:'upper',fade:.1});}catch(e){}S.inv[k]--;rl.gifts++;const liked=(d.likes||[]).includes(k),dis=(d.dislikes||[]).includes(k);const v=liked?14:dis?-8:4;rl.aff=clamp(rl.aff+v/(1+rl.gifts*.08),-100,100);rl.trust=clamp(rl.trust+(liked?4:1),-100,100);addRep(d.faction,liked?3:1);
  tkLog('me',`(gives ${J(ITEMS[k]?ITEMS[k][1]:k)})`);tkLog('them',liked?pk(['For me? Oh, this is perfect!','You remembered! Thank you.']):dis?pk(['...I do not care for this.','Hm. Keep it next time.']):pk(['Thank you, Ren.','How thoughtful.']));refreshHotbar();renderTalkHead();giftMenu();});}
function priceFor(d,k,buy){const base=PRICE[k]||5;const rl=relOf(d.id),rep=repOf(d.faction);const disc=clamp(1-(rl.aff*.002+rep*.002),.7,1.25);return Math.max(1,Math.round(buy?base*disc:base*.45/disc));}
function tradeMenu(){const n=TALK.n;if(!n||!n.d.shop)return;const d=n.d,sh=d.shop;let h=`<div class="lbl">Buy · you have 🪙 ${S.inv.coin||0}</div>`;
 for(const s of sh.sells||[]){const pr=s.item==='horse'?Math.min(s.price,180):s.item==='cart'?Math.min(s.price,320):Math.round(s.price*priceFor(d,s.item,true)/(PRICE[s.item]||s.price)||s.price);const owned=(s.item==='horse'&&S.horse)||(s.item==='cart'&&S.cart);
  h+=`<button class="btn sm" data-b="${s.item}" data-p="${pr}" ${owned?'disabled':''}>${s.item==='horse'?'🐎 Horse':s.item==='cart'?'🐎🛒 Horse + cart':(ITEMS[s.item]?ITEMS[s.item][0]+' '+J(ITEMS[s.item][1]):s.item)} · 🪙${pr}${owned?' (owned)':''}</button>`;}
 h+=`<div class="lbl" style="margin-top:6px">Sell</div>`;for(const k of sh.buys||[])if((S.inv[k]||0)>0){const pr=priceFor(d,k,false);h+=`<button class="btn cy sm" data-s="${k}" data-p="${pr}">${ITEMS[k]?ITEMS[k][0]:''} ${J(ITEMS[k]?ITEMS[k][1]:k)} ×${S.inv[k]} · 🪙${pr}</button>`;}
 $('tkSub').innerHTML=h;
 $('tkSub').querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>{const k=b.dataset.b,p=+b.dataset.p;if((S.inv.coin||0)<p){tkLog('them','Not enough coin, Ren.');return;}S.inv.coin-=p;
  if(k==='horse'){S.horse=1;mkHorse();tkLog('them','She is yours! Her name is Kaze. She waits by the stable. Press H near her to ride.');journalNote('Bought a horse, Kaze.');}
  else if(k==='cart'){S.horse=1;S.cart=1;if(horseMesh){scene.remove(horseMesh);horseMesh=null;}mkHorse();tkLog('them','Horse and cart! The cart has a chest. Talk to... well, walk up to the horse to open it.');journalNote('Bought a horse and cart.');}
  else{give(k,1);tkLog('them',pk(['Pleasure doing business.','A fine choice.']));}relOf(d.id).aff+=1;addRep(d.faction,1);refreshHotbar();tradeMenu();});
 $('tkSub').querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{const k=b.dataset.s,p=+b.dataset.p;S.inv[k]--;give('coin',p,1);refreshHotbar();tradeMenu();});}
/* ---------- journal ---------- */
let jTab='Quests';
function renderJournal(){ensureRel();const tabs=['Story','Quests','People','Factions','Rumors','Bestiary','Lore'];$('jTabs').innerHTML=tabs.map(t=>`<button class="tab ${t===jTab?'on':''}" data-t="${t}">${t}</button>`).join('');
 $('jTabs').querySelectorAll('.tab').forEach(b=>b.onclick=()=>{jTab=b.dataset.t;renderJournal();});let h='';
 if(jTab==='Story'){h+=DATA.story.filter(s=>S.jr.story.includes(s.id)).map(s=>`<div class="jent"><h4>${s.title}</h4><p>${s.text}</p></div>`).join('');h+=`<div class="jent"><h4>Main path</h4><p>${QUEST.map((q,i)=>(i<S.quest?'✔ ':i===S.quest?'➤ ':'· ')+q.t).join('<br>')}</p></div>`;
  h+='<h4 style="margin:8px 0 2px">Notes</h4>'+S.jr.notes.slice(0,20).map(n=>`<div class="jn">${n.t}</div>`).join('');}
 if(jTab==='Quests'){const act=[],done=[];for(const id in S.q2){const q=qDef(id);if(!q)continue;(S.q2[id].done?done:act).push(q);}
  h+=act.map(q=>{const s=S.q2[q.id];return`<div class="jent ${q.type}"><h4>${q.type==='secret'?'✦ ':''}${q.title}<small>${q.type}</small></h4><p>${q.desc}</p><p>${q.steps.map((st,i)=>(i<s.step?'✔ ':i===s.step?'➤ ':'· ')+st.text).join('<br>')}</p></div>`}).join('')||'<p><i>No active side quests. Talk to villagers and ask if they need help.</i></p>';
  if(done.length)h+='<h4>Completed</h4>'+done.map(q=>`<div class="jn">✔ ${q.title}</div>`).join('');}
 if(jTab==='People'){h+=PEOPLE.filter(n=>S.rel[n.d.id]&&S.rel[n.d.id].met).map(n=>{const rl=S.rel[n.d.id],ps=n.d.persona||{};return`<div class="jent"><h4>${dispName(n.d)}<small>${n.d.role||'?'} · ${moodOf(rl)}${n.comp?' · companion':''}</small></h4>${relBar('Affinity',rl.aff,'#e8b04a')}${relBar('Trust',rl.trust,'#6fb8ff')}${relBar('Fear',rl.fear*2-100,'#e85a4a')}<p>${ps.personality?'<i>'+ps.personality+'</i>. ':''}${rl.mem.includes('fear')&&ps.fears?'Fears '+ps.fears.join(', ')+'. ':''}${rl.mem.includes('want')&&ps.wants?'Wants '+ps.wants.join(', ')+'.':''} ${n.d.likes?'Likes: '+n.d.likes.map(k=>J(ITEMS[k]?ITEMS[k][1]:k)).join(', '):''}</p></div>`}).join('')||'<p><i>You have not met anyone yet. Kanemura is just down the path.</i></p>';}
 if(jTab==='Factions')h+=DATA.factions.map(f=>`<div class="jent"><h4>${f.name}</h4><p>${f.desc}</p>${relBar('Reputation',repOf(f.id),'#e8b04a')}</div>`).join('');
 if(jTab==='Rumors'){const met=Object.values(S.rel||{}).filter(r=>r.met).length;const AREA={sugi:'deep in Sugi no Mori, the cedar forest',kawa:'along the river, where the ferry once ran',taki:'in the mist below Taki falls',web:'near the old web woods',cave:'by the sealed cave mouth in the north-west',kanemura:'on the edge of Kanemura'};
  h+='<p class="lbl" style="text-transform:none;letter-spacing:0">Rumours are never marked on the map. Talk to more people to hear more.</p>';DATA.mystery.forEach((m,i)=>{const known=met>=1+i*2,found=S.rel&&S.rel[m.id]&&S.rel[m.id].met;if(!known)return;
   h+=`<div class="jent secret"><h4>${found?'✔ ':''}${found?m.name:'A whispered tale'}<small>${found?'found':'rumour'}</small></h4><p>Folk speak of someone ${m.look==='hermit'?'masked, who sits alone':m.look==='fox'?'with a fox-like smile who never casts a shadow right':m.look==='ringer'?'carrying a small bell that rings by itself':'strange and quiet'} ${AREA[m.area]||'somewhere in the valley'}${m.time==='night'?', seen only after dark':''}.</p></div>`;});
  if(!met)h+='<p><i>No rumours yet.</i></p>';}
 if(jTab==='Bestiary'){const B=S.bestiary||{};const DESC={kodama:'Tree spirit. Harmless alone, dangerous in groups at night.',tanuki:'Trickster. Steals from your pack; get it back by beating it.',mushroom:'Mushroom yokai. Puffs poison spores. Fire works well.',deer:'Wild deer. Hunt for meat and hide.',spiderling:'Brood of the Jorōgumo.',jorogumo:'Lady of the Canopy. Burn her mist, cut the anchor threads.'};
  h+=Object.keys(DESC).map(k=>`<div class="jent"><h4>${B[k]?k[0].toUpperCase()+k.slice(1):'???'}<small>${B[k]?B[k]+' defeated':'not yet met'}</small></h4><p>${B[k]?DESC[k]:'…'}</p></div>`).join('');}
 if(jTab==='Lore')h+=DATA.lore.filter(l=>S.jr.lore.includes(l.id)).map(l=>`<div class="jent"><h4>${l.title}</h4><p>${l.text}</p></div>`).join('')+`<p class="lbl">${S.jr.lore.length} / ${DATA.lore.length} discovered</p>`;
 $('jBody').innerHTML=h;}
function openJournal(){renderJournal();show('journal');}
function afterStateReset(){ensureRel();RIDE.on=false;if(horseMesh){scene.remove(horseMesh);horseMesh=null;}if(cartMesh){scene.remove(cartMesh);cartMesh=null;}for(const n of PEOPLE){n.comp=false;n.x=n.mesh.position.x;n.z=n.mesh.position.z;}if(S.horse)mkHorse();}
$('tkIn').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendTalk();}});
$('tkSend').onclick=sendTalk;$('tkBye').onclick=closeTalk;$('tkGift').onclick=giftMenu;$('tkTrade').onclick=tradeMenu;
$('tkJoin').onclick=()=>{const n=TALK.n;if(!n)return;if(n.comp){n.comp=false;tkLog('them','Back to my work, then. Call me any time.');}else tkLog('them',recruit(n));renderTalkHead();};
$('tkQ').onclick=()=>{$('tkIn').value='Do you need help with anything?';sendTalk();};
ensureRel();loadData();
