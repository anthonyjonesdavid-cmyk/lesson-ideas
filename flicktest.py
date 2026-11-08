import sys, json, time
from playwright.sync_api import sync_playwright
URL=sys.argv[2] if len(sys.argv)>2 else 'http://localhost:8765/'
eng=sys.argv[1] if len(sys.argv)>1 else 'chromium'
JS='''async ({x,y,pts,hold})=>{
  const target=document.elementFromPoint(x,y)||document.querySelector('#book');
  const mk=(type,cx,cy)=>new PointerEvent(type,{bubbles:true,cancelable:true,composed:true,pointerId:7,pointerType:'touch',isPrimary:true,clientX:cx,clientY:cy,button:0,buttons:type==='pointerup'?0:1,width:20,height:20,pressure:type==='pointerup'?0:.5});
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const ps=[]; let watching=true;
  (function w(){ const f=window.__lm.flip; if(f) ps.push(+f.p.toFixed(3)); if(watching) requestAnimationFrame(w); })();
  const t0=performance.now();
  target.dispatchEvent(mk('pointerdown',x,y));
  let cx=x,cy=y;
  for(const [dx,dy,dt] of pts){ await sleep(dt); cx=x+dx; cy=y+dy; target.dispatchEvent(mk('pointermove',cx,cy)); }
  if(hold) await sleep(hold);
  target.dispatchEvent(mk('pointerup',cx,cy));
  const dur=performance.now()-t0;
  await sleep(900); watching=false;
  return {dur:Math.round(dur), frames:ps.length, maxP:Math.max(0,...ps), distinct:new Set(ps.filter(p=>p>0.05&&p<0.99)).size, text:document.querySelector('#pgText').textContent};
}'''
res=[]; errors=[]
def ok(n,c,x=''): res.append(c); print(('PASS' if c else 'FAIL'),f'[{eng}]',n,x)
with sync_playwright() as p:
    b=getattr(p,eng).launch()
    for vp in [(820,1180),(1180,820),(390,844)]:
        ctx=b.new_context(viewport={'width':vp[0],'height':vp[1]},has_touch=True,is_mobile=False)
        pg=ctx.new_page(); pg.on('pageerror',lambda e:errors.append(str(e))); pg.on('console',lambda m: errors.append(m.text) if m.type=='error' else None)
        pg.goto(URL+'#/section/math/-/0'.replace('/-/0','/math/0').replace('math/math','math')) if False else pg.goto(URL+'#/section/math/0')
        pg.wait_for_selector('.view.current'); pg.wait_for_timeout(600)
        box=pg.locator('#book').bounding_box(); W=box['width']
        x=box['x']+W*0.6; y=box['y']+box['height']*0.45
        tag=f'{vp[0]}x{vp[1]}'
        def g(pts,hold=0,xx=x): return pg.evaluate(JS,{'x':xx,'y':y,'pts':pts,'hold':hold})
        start=pg.inner_text('#pgText')
        flickL=[[-5,0,15],[-10,0,15],[-15,0,15],[-20,0,15]]   # 20px in 60ms leftwards
        r=g(flickL); ok(f'{tag} flick forward 20px/60ms commits', r['text']!=start and r['maxP']>=0.999 and r['distinct']>=8, json.dumps(r))
        mid=r['text']
        r=g([[5,0,15],[10,0,15],[15,0,15],[20,0,15]]); ok(f'{tag} flick back 20px/60ms commits', r['text']==start and r['distinct']>=8, json.dumps(r))
        r=g([[-15,0,15],[-22,0,20]]); ok(f'{tag} 2-event flick commits', r['text']==mid, json.dumps(r))
        g([[5,0,15],[12,0,15],[20,0,15]]); pg.wait_for_timeout(100)
        slow=[[-i*3,0,60] for i in range(1,11)]   # 30px over 600ms then pause
        r=g(slow,hold=160); ok(f'{tag} slow short drag + pause cancels', r['text']==start, json.dumps(r))
        dist=W*0.15; slow2=[[-dist*i/16,0,50] for i in range(1,17)]  # 15% over 800ms (~0.15px/ms)
        r=g(slow2,hold=150); ok(f'{tag} slow drag past 13% commits', r['text']==mid, json.dumps(r))
        # vertical scroll on a lesson page must not flip
        r=g([[1,-8,16],[2,-20,16],[3,-35,16],[4,-55,16],[5,-70,16]]); ok(f'{tag} vertical swipe does not flip', r['text']==mid and r['frames']==0, json.dumps(r))
        r=g([[-3,-10,16],[-6,-24,16],[-9,-40,16]]); ok(f'{tag} diagonal-mostly-vertical does not flip', r['text']==mid and r['frames']==0, json.dumps(r))
        # tiny jitter tap does nothing
        r=g([[-3,0,20]],xx=box['x']+W*0.5); ok(f'{tag} 3px jitter does not flip', r['text']==mid, json.dumps(r))
        if eng=='chromium':
            cdp=ctx.new_cdp_session(pg)
            def touch(tp,px,py): cdp.send('Input.dispatchTouchEvent',{'type':tp,'touchPoints':[] if tp=='touchEnd' else [{'x':px,'y':py,'id':1}]})
            before=pg.inner_text('#pgText')
            t0=time.time(); touch('touchStart',x,y)
            for i in range(1,5): touch('touchMove',x-5*i,y)
            touch('touchEnd',x-20,y); el=int((time.time()-t0)*1000); pg.wait_for_timeout(900)
            ok(f'{tag} REAL CDP touch flick 20px forward ({el}ms)', pg.inner_text('#pgText')!=before, before+' -> '+pg.inner_text('#pgText'))
            before=pg.inner_text('#pgText')
            t0=time.time(); touch('touchStart',x,y)
            for i in range(1,5): touch('touchMove',x+5*i,y)
            touch('touchEnd',x+20,y); el=int((time.time()-t0)*1000); pg.wait_for_timeout(900)
            ok(f'{tag} REAL CDP touch flick 20px back ({el}ms)', pg.inner_text('#pgText')!=before, before+' -> '+pg.inner_text('#pgText'))
            # real slow touch drag released near start must cancel
            before=pg.inner_text('#pgText'); touch('touchStart',x,y)
            for i in range(1,9): time.sleep(0.06); touch('touchMove',x-3*i,y)
            time.sleep(0.2); touch('touchEnd',x-24,y); pg.wait_for_timeout(700)
            ok(f'{tag} REAL CDP slow 24px drag + pause cancels', pg.inner_text('#pgText')==before, before+' -> '+pg.inner_text('#pgText'))
            # real vertical scroll on lesson must not flip
            touch('touchStart',x,y)
            for i in range(1,8): touch('touchMove',x+1*i,y-12*i)
            touch('touchEnd',x+7,y-84); pg.wait_for_timeout(700)
            ok(f'{tag} REAL CDP vertical swipe does not flip', pg.inner_text('#pgText')==before, before+' -> '+pg.inner_text('#pgText'))
        ctx.close()
    b.close()
print('ERRORS',errors); print('ALL PASS' if all(res) else 'SOME FAILED')
