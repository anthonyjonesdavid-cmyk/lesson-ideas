import json, sys, time
from playwright.sync_api import sync_playwright
URL='http://localhost:8765/'
VPS={'ipad-portrait':(820,1180),'ipad-landscape':(1180,820),'phone':(390,844)}
errors=[]
def attach(pg,tag):
    pg.on('console', lambda m: errors.append(f'[{tag}] console.{m.type}: {m.text}') if m.type in ('error','warning') else None)
    pg.on('pageerror', lambda e: errors.append(f'[{tag}] pageerror: {e}'))
def wait_idle(pg,ms=450): pg.wait_for_timeout(ms)
with sync_playwright() as p:
    import sys
    eng=sys.argv[1] if len(sys.argv)>1 else 'chromium'
    b=getattr(p,eng).launch()
    pre='' if eng=='chromium' else eng+'-'
    for name,(w,h) in VPS.items():
        ctx=b.new_context(viewport={'width':w,'height':h},device_scale_factor=2,has_touch=False)
        pg=ctx.new_page(); attach(pg,name)
        pg.goto(URL); pg.wait_for_selector('.view.current'); pg.evaluate('document.fonts.ready'); wait_idle(pg,700)
        pg.screenshot(path=f'shots/{pre}{name}-1-contents.png')
        pg.click('.view.current .tile[data-id="math"]'); wait_idle(pg,600)
        pg.screenshot(path=f'shots/{pre}{name}-2-section-cover.png')
        pg.keyboard.press('ArrowRight'); wait_idle(pg,1000)
        pg.screenshot(path=f'shots/{pre}{name}-3-lesson.png')
        # mid page-turn via real mouse drag
        box=pg.locator('#book').bounding_box()
        y=box['y']+box['height']*0.5; x0=box['x']+box['width']*0.85
        reach = box['width']*(0.62 if box['width']>700 else 0.78)
        pg.mouse.move(x0,y); pg.mouse.down()
        for i in range(1,13): pg.mouse.move(x0-i*(reach*0.33/12),y); pg.wait_for_timeout(16)
        wait_idle(pg,120); pg.screenshot(path=f'shots/{pre}{name}-4a-mid-turn-early.png')
        for i in range(1,13): pg.mouse.move(x0-reach*0.33-i*(reach*0.37/12),y); pg.wait_for_timeout(16)
        wait_idle(pg,120); pg.screenshot(path=f'shots/{pre}{name}-4b-mid-turn-late.png')
        pg.mouse.up(); wait_idle(pg,800)
        txt=pg.inner_text('#pgText'); print(name,'after drag:',txt)
        pg.click('.fab'); wait_idle(pg,500)
        pg.screenshot(path=f'shots/{pre}{name}-5-add-form.png')
        pg.keyboard.press('Escape'); wait_idle(pg,300)
        ctx.close()
    b.close()
print('ERRORS:',json.dumps(errors,indent=1))
