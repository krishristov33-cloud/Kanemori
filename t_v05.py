import asyncio,sys,json
from playwright.async_api import async_playwright
OUT='/workspace/apex/kanemori/'
ARGS=sys.argv[1:]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg=await b.new_page(viewport={'width':1280,'height':720})
        errs=[]
        pg.on('console',lambda m: errs.append(m.type+': '+m.text) if m.type in('error','warning') and 'Failed to load resource' not in m.text else None)
        pg.on('pageerror',lambda e: errs.append('PAGEERROR: '+str(e)))
        q=[a[2:] for a in ARGS if a.startswith('q=')]
        await pg.goto('http://127.0.0.1:8931/index.html?noauto=1&shots=1'+('&q='+q[0] if q else ''))
        await pg.wait_for_function('window.KM',timeout=90000)
        await pg.evaluate("localStorage.clear()")
        await pg.click('#bNew'); await pg.wait_for_function('KM.V03.anim',timeout=90000)
        await pg.add_style_tag(content='#title{display:none!important}')
        await pg.evaluate("()=>{KM.setWeather('clear',900);}")
        async def shot(n,js,wait=2500):
            await pg.evaluate(js); await pg.evaluate('()=>{if(KM.V4.camDist)KM.V4.dist=KM.V4.camDist;KM.sim(2.5,null,1/30);KM.V4.piv=null;KM.sim(.5,null,1/30);}'); await pg.wait_for_timeout(wait); await pg.screenshot(path=OUT+'tmpshots/'+n+'.png',timeout=180000); print('shot',n)
        for a in ARGS:
            if a.startswith('js:'):
                print('JS',await pg.evaluate(a[3:]))
        if 'vista' in ARGS: await shot('vista',"()=>{KM.tp(60,20);KM.setTime(.25);KM.P.yaw=-0.5;KM.V4.camDist=12;KM.cam(-0.5,0.14);KM.V4.piv=null;}",4000)
        if 'meadow' in ARGS: await shot('meadow',"()=>{KM.tp(20,90);KM.setTime(.3);KM.P.yaw=Math.PI;KM.V4.camDist=8;KM.cam(2.6,0.15);KM.V4.piv=null;}",4000)
        if 'forest' in ARGS: await shot('forest',"()=>{KM.V4.camDist=0;KM.tp(-28,35);KM.setTime(.6);KM.P.yaw=1;KM.cam(-2.2,0.18);KM.V4.piv=null;}",4000)
        if 'night' in ARGS: await shot('night',"()=>{KM.V4.camDist=10;KM.tp(2,126);KM.setTime(.85);KM.P.yaw=0;KM.cam(0.15,0.25);KM.V4.piv=null;}",5000)
        if 'river' in ARGS: await shot('river',"()=>{KM.V4.camDist=14;KM.tp(56,-92);KM.setTime(.3);KM.P.yaw=0;KM.cam(Math.PI*0.8,0.2);KM.V4.piv=null;}",4000)
        if 'village' in ARGS: await shot('village',"()=>{KM.V4.camDist=16;KM.tp(2,124);KM.setTime(.35);KM.P.yaw=0;KM.cam(0.15,0.3);KM.V4.piv=null;}",5000)
        if 'ren' in ARGS: await shot('ren',"()=>{KM.V4.camDist=3.2;KM.tp(-6,104);KM.setTime(.58);KM.P.yaw=0.5;KM.cam(0.5+Math.PI*0.85,0.1);KM.V4.piv=null;}",3000)
        if 'storm' in ARGS: await shot('storm',"()=>{KM.V4.camDist=10;KM.setWeather('storm',300);KM.tp(20,90);KM.setTime(.3);KM.cam(2.6,0.2);KM.V4.piv=null;}",5000)
        if 'boss' in ARGS:
            await shot('bossr',"()=>{KM.V4.camDist=15;KM.setTime(.3);KM.tp(KM.ARENA.x+3,KM.ARENA.z+15);KM.P.yaw=Math.PI;KM.boss.active=true;KM.boss.state='reveal';KM.boss.t=0;KM.sim(1.2,null,1/30);KM.cam(0,-0.05);KM.V4.piv=null;}",5000)
            await shot('boss2',"()=>{const B=KM.boss;B.active=true;B.state='idle';B.t=0;B.damage(460,KM.Vec(0,0,0),false,false);KM.sim(3.2,null,1/30);KM.tp(B.pos.x+3,B.pos.z+15);KM.P.yaw=Math.PI;KM.V4.camDist=10;KM.cam(0.15,0.05);KM.V4.piv=null;console.log('B2',B.state,B.phase)}",5000)
            print('JS',await pg.evaluate("KM.boss.state+' '+KM.boss.phase+' '+KM.boss.hp"))
            if False: await shot('boss',"()=>{KM.V4.camDist=13;KM.setTime(.3);KM.tp(KM.ARENA.x+4,KM.ARENA.z+16);KM.P.yaw=Math.PI;KM.cam(0,0.25);KM.V4.piv=null;}",5000)
        if 'fps' in ARGS:
            for ql in ['low','medium','high']:
                r=await pg.evaluate("""async(q)=>{KM.setQuality(q);KM.V4.camDist=0;KM.tp(20,90);KM.setTime(.3);KM.cam(2.6,0.15);await new Promise(r=>setTimeout(r,4000));const I=KM.renderer.info;I.autoReset=false;let n=0;const ms=[];let tl=performance.now();await new Promise(r=>requestAnimationFrame(r));I.reset();await new Promise(r=>requestAnimationFrame(r));const tris=I.render.triangles,calls=I.render.calls;I.autoReset=true;const t0=performance.now();tl=t0;await new Promise(res=>{function f(){const t=performance.now();ms.push(t-tl);tl=t;n++;if(t-t0<10000)requestAnimationFrame(f);else res();}requestAnimationFrame(f);});ms.sort((a,b)=>a-b);return {q,fps:+(n/((performance.now()-t0)/1000)).toFixed(2),medMs:Math.round(ms[ms.length>>1]),tris,calls};}""",ql)
                print('FPS',json.dumps(r))
        print('ERRORS:',len(errs)); [print(' ',e[:400]) for e in errs[:30]]
        await b.close()
asyncio.run(main())
