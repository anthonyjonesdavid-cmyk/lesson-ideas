# Lesson Ideas (Lesson Idea Magazine)

A cute, magazine-style flip-through app of first-grade lesson ideas. Live site (GitHub Pages):

https://anthonyjonesdavid-cmyk.github.io/lp-df5a03dd6780/

## What’s in this repo

| Path | Role |
|------|------|
| `src/` | Editable source (`app.js`, `art.js`, `seed.js`, `style.css`, `head.html`, `body.html`) |
| `build.js` | Concatenates `src/` into root `index.html` |
| `index.html` | **Built** site served by GitHub Pages — keep in sync after edits |
| `icon.svg` + `make_icons.py` | Apple app icon source; regenerates PNGs |
| `sw.js`, `manifest.webmanifest`, icons | PWA / Home Screen bits |
| `*.py` tests | Optional Playwright smoke tests (need a local static server) |
| `testdata/old-backup-v1.json` | Sanitized sample backup for migration tests (no personal photos) |

## Rebuild the site

Needs **Node.js 18+** (stdlib `fs` only — no npm install for the build).

```bash
node build.js
# → writes ./index.html
```

Then commit the updated `index.html` if you want Pages to pick up the change.

### Regenerate icons (optional)

Needs **Python 3** + **Playwright** Chromium:

```bash
pip install playwright
playwright install chromium
python3 make_icons.py
# → apple-touch-icon.png, icon-192.png, icon-512.png
```

### Run smoke tests (optional)

```bash
python3 -m http.server 8765
# in another terminal, from this directory:
python3 test.py          # chromium; or: python3 test.py webkit
python3 mstest.py        # multi-section + backup import
```

Screenshots land in a local `shots/` folder (gitignored).

## Note on the live site

Root deploy files (`index.html`, icons, `sw.js`, etc.) are what Pages serves. Editing only `src/` does not change the live app until you run `node build.js` and push the new `index.html`.
