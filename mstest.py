import json, sys
from playwright.sync_api import sync_playwright
BASE=sys.argv[2] if len(sys.argv)>2 else 'http://localhost:8765/'
eng=sys.argv[1] if len(sys.argv)>1 else 'chromium'
res=[]; errors=[]
def ok(n,c,x=''): res.append(c); print('PASS' if c else 'FAIL',f'[{eng}]',n,x)
DUMP="""()=>new Promise(r=>{const q=indexedDB.open('lessonIdeaMagazine');q.onsuccess=()=>{const d=q.result;const t=d.transaction(['lessons','meta']);const a=t.objectStore('lessons').getAll();const m=t.objectStore('meta').getAll();t.oncomplete=()=>{r({lessons:a.result,meta:Object.fromEntries(m.result.map(x=>[x.key,x.value]))});d.close();}}})"""
MUT="""()=>new Promise(r=>{const q=indexedDB.open('lessonIdeaMagazine');q.onsuccess=()=>{const d=q.result;const t=d.transaction(['lessons','meta'],'readwrite');const s=t.objectStore('lessons');
 const upd=(id,f)=>{const g=s.get(id);g.onsuccess=()=>{const v=g.result;f(v);s.put(v);}};
 upd('st-math-2',v=>{v.fav=true});
 upd('st-literacy-5',v=>{v.title='Snowman How-To (my version)';v.edited=true;v.updated=Date.now()});
 upd('st-art-4',v=>{v.hidden=true});
 upd('st-sel-1',v=>{v.fav=true;v.hidden=true});
 t.objectStore('meta').put({key:'customTags',value:['Apples']});
 t.objectStore('meta').put({key:'settings',value:{teacherName:'Ms. Test'}});
 t.oncomplete=()=>{d.close();r(true)}}})"""
def nlessons(pg): return pg.evaluate('window.__lm.cur.book.pages.filter(p=>p.t==="lesson").length')
def ids(pg): return pg.evaluate('window.__lm.cur.book.pages.filter(p=>p.t==="lesson").map(p=>p.id)')
with sync_playwright() as p:
    b=getattr(p,eng).launch()
    # ---------- 1. MIGRATION from real old (v3, single-section) app data ----------
    ctx=b.new_context(viewport={'width':820,'height':1180},device_scale_factor=2,accept_downloads=True)
    pg=ctx.new_page(); pg.on('pageerror',lambda e:errors.append(str(e))); pg.on('console',lambda m: errors.append(m.text) if m.type=='error' else None)
    pg.goto(BASE+'old/index.html'); pg.wait_for_selector('.view.current .tile'); pg.wait_for_timeout(400)
    # add a lesson with photo in the OLD app UI
    pg.click('.fab'); pg.wait_for_selector('#lessonForm'); pg.fill('#fi-title','Old App Lesson'); pg.click('.secopt:has(input[value="literacy"]) span')
    pg.fill('#fi-sum','made before the upgrade'); pg.fill('#fi-mat','a\nb'); pg.fill('#fi-steps','one\ntwo')
    pg.set_input_files('#fi-photo','icon-512.png'); pg.wait_for_selector('.photo-prev img'); pg.click('#saveBtn'); pg.wait_for_timeout(700)
    pg.evaluate(MUT)
    before=pg.evaluate(DUMP)
    ok('old app wrote v1 data', all('sections' not in l for l in before['lessons']) and len(before['lessons'])==50, f"{len(before['lessons'])} records")
    errors.clear()  # old app at /old/ can't find /old/sw.js (test harness only)
    pg.goto(BASE+'#/home/-/0'); pg.wait_for_selector('.view.current .tile'); pg.wait_for_timeout(600)
    after=pg.evaluate(DUMP)
    A={l['id']:l for l in after['lessons']}; B={l['id']:l for l in before['lessons']}
    ok('no records lost or added', set(A)==set(B), f'{len(A)} vs {len(B)}')
    diffs=[]
    for i,o in B.items():
        n=A[i]
        for k,v in o.items():
            if n.get(k)!=v: diffs.append((i,k))
        if not isinstance(n.get('sections'),list) or n['sections'][0]!=o['section']: diffs.append((i,'sections-primary'))
    ok('every original field preserved byte-for-byte; primary = old section', not diffs, str(diffs[:5]))
    mine=[l for l in after['lessons'] if l.get('mine')][0]
    ok('her lesson + photo intact', mine['title']=='Old App Lesson' and mine['photo']==[l for l in before['lessons'] if l.get('mine')][0]['photo'] and mine['sections']==['literacy'])
    ok('edited starter keeps ONLY its own section', A['st-literacy-5']['sections']==['literacy'] and A['st-literacy-5']['title'].startswith('Snowman') and A['st-literacy-5']['edited'])
    ok('unedited starter gains 2nd section', A['st-literacy-6']['sections']==['literacy','holidays','sel'] and A['st-math-4']['sections']==['math','holidays'])
    ok('hidden starter stays hidden', A['st-art-4']['hidden'] and A['st-sel-1']['hidden'] and A['st-sel-1']['fav'])
    ok('fav preserved', A['st-math-2']['fav'])
    ok('meta preserved & versions set', after['meta'].get('customTags')==['Apples'] and after['meta']['settings']['teacherName']=='Ms. Test' and after['meta']['schemaVersion']==2 and after['meta']['seedVersion']==2, json.dumps({k:v for k,v in after['meta'].items()}))
    ok('home shows migrated name', 'Ms. Test' in pg.inner_text('.view.current .toc-head'))
    pg.reload(); pg.wait_for_selector('.view.current .tile'); pg.wait_for_timeout(400)
    again=pg.evaluate(DUMP); ok('migration idempotent on reload', json.dumps(sorted(again['lessons'],key=lambda l:l['id']))==json.dumps(sorted(after['lessons'],key=lambda l:l['id'])))
    pg.click('.view.current .tile[data-id="holidays"]'); pg.wait_for_timeout(400); h=ids(pg)
    ok('holidays book: cross-listed starters in, edited/hidden respected', 'st-literacy-6' in h and 'st-math-4' in h and 'st-literacy-5' not in h and 'st-art-4' not in h, f'{len(h)} lessons')
    ctx.close()

    # ---------- 2. MULTI-SELECT form, appears in both sections, counts ----------
    ctx=b.new_context(viewport={'width':820,'height':1180},device_scale_factor=2,accept_downloads=True)
    pg=ctx.new_page(); pg.on('pageerror',lambda e:errors.append(str(e))); pg.on('console',lambda m: errors.append(m.text) if m.type=='error' else None)
    pg.goto(BASE); pg.wait_for_selector('.view.current .tile'); pg.wait_for_timeout(400)
    cnt=lambda sid: int(pg.inner_text(f'.view.current .tile[data-id="{sid}"] .ct').split()[0])
    c0={s:cnt(s) for s in ['literacy','holidays','math']}
    pg.click('.fab'); pg.wait_for_selector('#lessonForm')
    ok('default one section preselected', pg.locator('#secPick [aria-pressed="true"]').count()==1)
    pg.fill('#fi-title','Turkey Disguise Writing')
    pg.click('#secPick [data-sec="math"]')  # deselect -> none
    pg.click('#saveBtn'); pg.wait_for_timeout(200)
    ok('at least one section required', pg.locator('#fSecs.bad').count()==1)
    pg.click('#secPick [data-sec="literacy"]'); pg.click('#secPick [data-sec="holidays"]'); pg.click('#secPick [data-sec="sel"]')
    ok('three selected, first is main', pg.locator('#secPick [aria-pressed="true"]').count()==3 and pg.locator('#secPick .secopt.primary').get_attribute('data-sec')=='literacy')
    pg.fill('#fi-sum','Kids disguise a paper turkey so it can hide from the farmer, then write a persuasive "Don\'t eat me!" paragraph.')
    pg.fill('#fi-mat','Turkey outline\nCraft scraps\nGlue'); pg.fill('#fi-steps','Read Turkey Trouble\nDisguise your turkey\nWrite how it hides')
    pg.click('#tagPick [data-t="Thanksgiving"]')
    pg.locator('#fSecs').scroll_into_view_if_needed(); pg.wait_for_timeout(250)
    pg.screenshot(path='shots/ipad-portrait-12-form-multi-section.png')
    pg.click('#secPick [data-sec="sel"]')  # deselect third
    pg.click('#saveBtn'); pg.wait_for_timeout(900)
    ok('opens in primary section', pg.inner_text('#tbTitle')=='Literacy')
    pills=pg.eval_on_selector_all('.view.current .lesson .sec-pill','els=>els.map(e=>e.dataset.id+":"+e.textContent.replace(/^.*?(Literacy|Holidays)/,"$1"))')
    ok('lesson page shows both section badges', pills==['literacy:Literacy','holidays:Holidays & Seasons'], str(pills))
    pg.screenshot(path='shots/ipad-portrait-13-lesson-multi-section.png')
    pg.click('.view.current .lesson .sec-pill[data-id="holidays"]'); pg.wait_for_timeout(500)
    ok('appears in Holidays section too', pg.inner_text('#tbTitle')=='Holidays & Seasons' and any(i.startswith('my-') for i in ids(pg)))
    pg.click('#homeBtn'); pg.wait_for_timeout(400)
    c1={s:cnt(s) for s in ['literacy','holidays','math']}
    ok('tile counts reflect both sections', c1['literacy']==c0['literacy']+1 and c1['holidays']==c0['holidays']+1 and c1['math']==c0['math'], f'{c0} -> {c1}')
    # edit: drop literacy -> holidays becomes primary/color
    pg.click('.view.current [data-act="open-mine"]'); pg.wait_for_timeout(300); pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(900)
    pg.click('.view.current [data-act="edit"]'); pg.wait_for_selector('#lessonForm')
    ok('edit form restores selection order', pg.locator('#secPick .secopt.primary').get_attribute('data-sec')=='literacy' and pg.locator('#secPick [aria-pressed="true"]').count()==2)
    pg.click('#secPick [data-sec="literacy"]'); pg.click('#saveBtn'); pg.wait_for_timeout(800)
    style=pg.locator('.view.current .lesson').first.get_attribute('style')
    ok('primary change updates page color', '#F7882F' in style, style[:40])
    # search & tags unchanged
    pg.click('#homeBtn'); pg.wait_for_timeout(300); pg.click('.view.current [data-act="open-mine"]'); pg.wait_for_timeout(300); pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(900)
    pg.click('.view.current .chip[data-tag="Thanksgiving"]'); pg.wait_for_timeout(500)
    ok('tag filter still works', any(i.startswith('my-') for i in ids(pg)))
    # ---------- 3. OLD BACKUP IMPORT + new-format EXPORT ----------
    pg.click('[data-act="settings"]'); pg.wait_for_selector('#impFile',state='attached')
    pg.set_input_files('#impFile','testdata/old-backup-v1.json'); pg.wait_for_selector('[data-ok]'); pg.click('[data-ok]'); pg.wait_for_timeout(900)
    d=pg.evaluate(DUMP); A={l['id']:l for l in d['lessons']}
    imp=[l for l in d['lessons'] if l.get('title')=='Apple Tasting Graph Day']
    ok('old backup imported & converted', len(imp)==1 and imp[0]['sections']==['science'] and imp[0]['photo'].startswith('data:image') and imp[0]['fav'], str(imp and imp[0]['sections']))
    ok('old-backup unedited starter gets 2nd section', A['st-math-4']['sections']==['math','holidays'])
    ok('existing lesson kept after import', any(l['title']=='Turkey Disguise Writing' for l in d['lessons']))
    pg.click('[data-act="settings"]'); pg.wait_for_selector('#expBtn')
    with pg.expect_download() as dl: pg.click('#expBtn')
    dl.value.save_as('/tmp/backup-v2.json'); e=json.load(open('/tmp/backup-v2.json'))
    ok('export is v2 with sections arrays', e['version']==2 and all(isinstance(l['sections'],list) and l['sections'] and l['section']==l['sections'][0] for l in e['lessons']), f"{len(e['lessons'])} lessons")
    # round-trip new export
    ctx.close()
    ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2)
    pg=ctx.new_page(); pg.on('pageerror',lambda e:errors.append(str(e)))
    pg.goto(BASE); pg.wait_for_selector('.view.current .tile')
    pg.click('[data-act="settings"]'); pg.wait_for_selector('#impFile',state='attached'); pg.set_input_files('#impFile','/tmp/backup-v2.json'); pg.click('[data-ok]'); pg.wait_for_timeout(900)
    d=pg.evaluate(DUMP); t=[l for l in d['lessons'] if l['title']=='Turkey Disguise Writing']
    ok('v2 backup round-trips multi-sections', len(t)==1 and t[0]['sections']==['holidays'])
    pg.click('.fab'); pg.wait_for_selector('#lessonForm'); pg.click('#secPick [data-sec="literacy"]'); pg.click('#secPick [data-sec="holidays"]'); pg.fill('#fi-title','Phone multi test')
    pg.locator('#fSecs').scroll_into_view_if_needed(); pg.wait_for_timeout(250)
    pg.screenshot(path=f'shots/{"" if eng=="chromium" else "webkit-"}phone-12-form-multi-section.png')
    ctx.close(); b.close()
print('ERRORS',errors); print('ALL PASS' if all(res) else 'SOME FAILED')
