import sys
from playwright.sync_api import sync_playwright
tag=sys.argv[1]; URL=sys.argv[2] if len(sys.argv)>2 else 'http://localhost:8765/'
with sync_playwright() as p:
    out=[]
    for eng in ['chromium','webkit']:
        b=getattr(p,eng).launch()
        for name,(w,h) in {'ipad-portrait':(820,1180),'ipad-landscape':(1180,820),'phone':(390,844)}.items():
            opts=dict(viewport={'width':w,'height':h},device_scale_factor=2)
            if eng=='webkit':  # in-browser Safari: iPad/iPhone UA, touch, mobile viewport
                opts.update(has_touch=True,is_mobile=(name=='phone'),user_agent=('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' if name=='phone' else 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15'))
            ctx=b.new_context(**opts); pg=ctx.new_page()
            pg.goto(URL+'#/section/math/1'); pg.wait_for_selector('.view.current'); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(700)
            bb=pg.locator('.bottombar').bounding_box(); book=pg.locator('#book').bounding_box()
            out.append(f"{eng} {name}: bar h={bb['height']:.0f} book h={book['height']:.0f}")
            pre='' if eng=='chromium' else 'webkit-'
            pg.screenshot(path=f'shots/{pre}{name}-bottom-{tag}.png',clip={'x':0,'y':h-150,'width':w,'height':150})
            if tag=='after': pg.screenshot(path=f'shots/{pre}{name}-full-after.png')
            ctx.close()
        b.close()
    print('\n'.join(out))
