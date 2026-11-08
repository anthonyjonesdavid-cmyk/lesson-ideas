from playwright.sync_api import sync_playwright
svg=open('icon.svg').read()
with sync_playwright() as p:
    b=p.chromium.launch()
    for size,name in [(180,'apple-touch-icon.png'),(192,'icon-192.png'),(512,'icon-512.png')]:
        pg=b.new_page(viewport={'width':size,'height':size})
        pg.set_content(f'<html><body style="margin:0">{svg.replace("<svg ",f"<svg width={size} height={size} ",1)}</body></html>')
        pg.screenshot(path=name,omit_background=False)
        pg.close()
    b.close()
