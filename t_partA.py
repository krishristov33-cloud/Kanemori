import asyncio,sys,json
from playwright.async_api import async_playwright
OUT='/workspace/apex/kanemori/'
# usage: t_partA.py q=high "name|x|z|time|camYaw|pitch|dist|outpath?" ...
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
        if 'nohud' in ARGS: await pg.add_style_tag(content='#hud,#hotbar,#goal,#minimap,#compass{opacity:0!important}')
        for a in ARGS:
            if a.startswith('js:'): print('JS',await pg.evaluate(a[3:]))
            if a.startswith('jsf:'): print('JS',await pg.evaluate(open(a[4:]).read()))
            if a.startswith('now:'):
                await pg.screenshot(path=a[4:],timeout=180000); print('now',a[4:]); continue
            if '|' not in a or a.startswith('js'): continue
            n,x,z,t,yw,pt,d,*o=a.split('|')
            js=f"()=>{{KM.V4.camDist={d};KM.tp({x},{z});KM.setTime({t});KM.P.yaw={yw};KM.cam({yw},{pt});KM.V4.piv=null;}}"
            await pg.evaluate(js); await pg.evaluate('()=>{if(KM.V4.camDist)KM.V4.dist=KM.V4.camDist;KM.sim(2.5,null,1/30);KM.V4.piv=null;KM.sim(.5,null,1/30);}'); await pg.wait_for_timeout(4000)
            path=o[0] if o else OUT+'tmpshots/c_'+n+'.png'
            await pg.screenshot(path=path,timeout=180000); print('shot',n,path)
        print('ERRORS:',len(errs)); [print(' ',e[:400]) for e in errs[:30]]
        await b.close()
asyncio.run(main())
