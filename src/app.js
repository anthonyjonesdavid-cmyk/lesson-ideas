/* ================= Data & constants ================= */
const SECTIONS = [
 {id:'math',name:'Math',color:'#3D8BF2',cd:'#2765bb',tint:'#E3EEFF',on:'#fff',tagline:'Counting, adding, measuring & more!'},
 {id:'literacy',name:'Literacy',color:'#F2545B',cd:'#c23b42',tint:'#FFE5E6',on:'#fff',tagline:'Phonics, reading & writing fun'},
 {id:'science',name:'Science',color:'#22B07D',cd:'#168059',tint:'#DDF6EC',on:'#fff',tagline:'Explore, predict & discover'},
 {id:'social',name:'Social Studies',color:'#14A9C2',cd:'#0d7a8c',tint:'#DCF4F8',on:'#fff',tagline:'Me, my community & the world'},
 {id:'art',name:'Art',color:'#9B5DE5',cd:'#7140b0',tint:'#F0E6FC',on:'#fff',tagline:'Create, color & imagine'},
 {id:'music',name:'Music & Movement',color:'#F15BB5',cd:'#bf3b8a',tint:'#FDE4F3',on:'#fff',tagline:'Sing, dance & wiggle!'},
 {id:'holidays',name:'Holidays & Seasons',color:'#F7882F',cd:'#c4621a',tint:'#FEEBDC',on:'#fff',tagline:'Celebrate all year long'},
 {id:'sel',name:'Classroom Management / SEL',short:'Management / SEL',color:'#F2B705',cd:'#b88a00',tint:'#FFF4CC',on:'#3b2f00',tagline:'Kindness, routines & big feelings'},
];
const SEC = Object.fromEntries(SECTIONS.map(s=>[s.id,s]));
const SPECIAL = {
 home:{color:'#F2545B',cd:'#c23b42',tint:'#FFE5E6',on:'#fff'},
 fav:{color:'#F2B705',cd:'#b88a00',tint:'#FFF4CC',on:'#3b2f00'},
 all:{color:'#F2545B',cd:'#c23b42',tint:'#FFE5E6',on:'#fff'},
 mine:{color:'#9B5DE5',cd:'#7140b0',tint:'#F0E6FC',on:'#fff'},
 tag:{color:'#14A9C2',cd:'#0d7a8c',tint:'#DCF4F8',on:'#fff'},
 search:{color:'#3D8BF2',cd:'#2765bb',tint:'#E3EEFF',on:'#fff'},
};
const DEFAULT_TAGS = ['Back to School','Fall','Halloween','Thanksgiving','Winter','Christmas','100th Day',"Valentine's Day","St. Patrick's Day",'Spring','Summer','Whole Group','Small Group','Centers','Hands-on','Brain Break'];
const TAG_COLORS = ['#F2545B','#F7882F','#E0A800','#22B07D','#14A9C2','#3D8BF2','#9B5DE5','#F15BB5'];
const NOTE_COLORS = ['#fff59d','#ffd3e6','#cfe9ff','#d3f5c7','#ffe0b8','#e6d9ff'];
const TAG_FIXED = {'Halloween':'#F7882F','Thanksgiving':'#c4621a','Christmas':'#22B07D',"Valentine's Day":'#F15BB5','100th Day':'#3D8BF2','Back to School':'#F2545B','Spring':'#22B07D','Fall':'#F7882F','Winter':'#14A9C2',"St. Patrick's Day":'#22B07D','Summer':'#E0A800'};
function tagColor(t){ if(TAG_FIXED[t]) return TAG_FIXED[t]; let h=0; for(const c of t) h=(h*31+c.charCodeAt(0))>>>0; return TAG_COLORS[h%TAG_COLORS.length]; }

const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const uid=()=>'my-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);

/* ================= Storage (IndexedDB w/ memory fallback) ================= */
const DB = {
  db:null, mem:null,
  open(){ return new Promise((res)=>{
    try{
      const r = indexedDB.open('lessonIdeaMagazine',1);
      r.onupgradeneeded=()=>{ const d=r.result; if(!d.objectStoreNames.contains('lessons')) d.createObjectStore('lessons',{keyPath:'id'}); if(!d.objectStoreNames.contains('meta')) d.createObjectStore('meta',{keyPath:'key'}); };
      r.onsuccess=()=>{ this.db=r.result; res(true); };
      r.onerror=()=>{ this.useMem(); res(false); };
      r.onblocked=()=>{ this.useMem(); res(false); };
    }catch(e){ this.useMem(); res(false); }
  });},
  useMem(){ this.mem={lessons:new Map(),meta:new Map()}; },
  tx(store,mode,fn){
    if(this.mem){ return Promise.resolve(fn(null,this.mem[store])); }
    return new Promise((res,rej)=>{ const t=this.db.transaction(store,mode); const s=t.objectStore(store); let out; const r=fn(s); if(r&&'onsuccess' in r) r.onsuccess=()=>{out=r.result}; t.oncomplete=()=>res(out); t.onerror=()=>rej(t.error); t.onabort=()=>rej(t.error||new Error('aborted')); });
  },
  all(){ return this.tx('lessons','readonly',(s,m)=> m?[...m.values()]:s.getAll()); },
  put(l){ return this.tx('lessons','readwrite',(s,m)=> m?void m.set(l.id,structuredClone(l)):s.put(l)); },
  putMany(a){ return this.tx('lessons','readwrite',(s,m)=>{ a.forEach(l=> m?m.set(l.id,structuredClone(l)):s.put(l)); }); },
  del(id){ return this.tx('lessons','readwrite',(s,m)=> m?void m.delete(id):s.delete(id)); },
  getMeta(k){ return this.tx('meta','readonly',(s,m)=> m?{result:m.get(k)}:s.get(k)).then(r=> this.mem ? r.result : (r?r.value:undefined)); },
  setMeta(k,v){ return this.tx('meta','readwrite',(s,m)=> m?void m.set(k,v):s.put({key:k,value:v})); },
};

let lessons = [];            // all lessons (incl hidden)
let settings = {teacherName:'Mrs. Jones'};
let customTags = [];
const byId = id => lessons.find(l=>l.id===id);
// Sections model: l.sections = [primary, ...others]; l.section mirrors sections[0] for backward compatibility.
function sectionsOf(l){
  const raw = Array.isArray(l&&l.sections) && l.sections.length ? l.sections : [l&&l.section];
  const out=[...new Set(raw.filter(id=>SEC[id]))];
  return out.length? out : ['math'];
}
const primaryOf = l => sectionsOf(l)[0];
const inSection = (l,id) => sectionsOf(l).includes(id);
const visible = () => lessons.filter(l=>!l.hidden);
function sortLessons(list, bySection){
  const secIdx = id => SECTIONS.findIndex(s=>s.id===id);
  return list.slice().sort((a,b)=>{
    if(bySection){ const d=secIdx(primaryOf(a))-secIdx(primaryOf(b)); if(d) return d; }
    if(a.mine!==b.mine) return a.mine?-1:1;
    if(a.mine) return (b.created||0)-(a.created||0);
    return (a.order||0)-(b.order||0);
  });
}
function allTags(){
  const set = new Set([...DEFAULT_TAGS, ...customTags]);
  lessons.forEach(l=>(l.tags||[]).forEach(t=>set.add(t)));
  const extra=[...set].filter(t=>!DEFAULT_TAGS.includes(t)).sort((a,b)=>a.localeCompare(b));
  return [...DEFAULT_TAGS.filter(t=>set.has(t)), ...extra];
}
function normalizeLesson(l){
  return {
    id:String(l.id), sections: sectionsOf(l), section: sectionsOf(l)[0],
    title:String(l.title||'Untitled idea').slice(0,200), summary:String(l.summary||''),
    materials:Array.isArray(l.materials)?l.materials.map(String).filter(Boolean):[], steps:Array.isArray(l.steps)?l.steps.map(String).filter(Boolean):[],
    notes:String(l.notes||''), tags:Array.isArray(l.tags)?[...new Set(l.tags.map(t=>String(t).trim()).filter(Boolean))]:[],
    fav:!!l.fav, photo:(typeof l.photo==='string' && l.photo.startsWith('data:image/'))?l.photo:null,
    mine:!!l.mine, starter:!!l.starter, hidden:!!l.hidden, edited:!!l.edited,
    order:+l.order||0, created:+l.created||0, updated:+l.updated||0,
  };
}

/* ================= Page rendering ================= */
function secVars(s){ return `--c:${s.color};--cd:${s.cd};--tint:${s.tint};--on:${s.on}`; }
function tagChip(t, act=true){ return `<button class="chip" style="--tc:${tagColor(t)}" ${act?`data-act="open-tag" data-tag="${esc(t)}"`:''}><span class="hash">#</span>${esc(t)}</button>`; }
function counts(){ const c={}; visible().forEach(l=>sectionsOf(l).forEach(id=>{c[id]=(c[id]||0)+1})); return c; }
const plural=(n,w)=>`${n} ${w}${n===1?'':'s'}`;

function renderTOC(){
  const c = counts(); const v=visible();
  const tiles = SECTIONS.map(s=>`<button class="tile" style="${secVars(s)}" data-act="open-section" data-id="${s.id}" aria-label="${esc(s.name)}"><span class="tape"></span><span class="ic">${DOODLE[s.id]}</span><span class="nm">${esc(s.name)}</span><span class="ct">${plural(c[s.id]||0,'idea')}</span></button>`).join('');
  const f=v.filter(l=>l.fav).length, m=v.filter(l=>l.mine).length;
  const wide=(k,name,n,sub)=>`<button class="tile wide" style="${secVars(SPECIAL[k])}" data-act="open-${k}"><span class="ic">${DOODLE[k]}</span><span class="tx"><span class="nm">${name}</span><span class="ct">${n}</span></span></button>`;
  return `<div class="page toc"><div class="page-scroll">
    <div class="chalkboard toc-head">
      <svg class="chalk-doodle" style="left:18px;top:14px" width="44" height="44" viewBox="0 0 32 32"><path d="M16 3l3.9 8 8.8 1.3-6.4 6.2 1.5 8.8L16 23.1l-7.8 4.2 1.5-8.8L3.3 12.3l8.8-1.3z" fill="none" stroke="#fff" stroke-width="1.8" stroke-dasharray="3 2"/></svg>
      <svg class="chalk-doodle" style="right:20px;top:18px" width="50" height="40" viewBox="0 0 50 40"><text x="2" y="30" font-family="Patrick Hand,cursive" font-size="28" fill="#fff">ABC</text></svg>
      <div class="kick">${esc(settings.teacherName||'My')}'s</div>
      <h1>Lesson Idea Magazine</h1>
      <div class="sub">First grade fun, all in one place ✏️</div>
      <div class="ledge">${crayon('#F2545B',96).replace('class="crayon"','class="crayon" style="left:12%"')}${crayon('#3D8BF2',84).replace('class="crayon"','class="crayon" style="left:34%"')}<svg class="crayon" style="right:14%;bottom:12px" width="54" height="22" viewBox="0 0 54 22"><rect x="1" y="1" width="52" height="20" rx="4" fill="#ffb3c7"/><rect x="1" y="1" width="20" height="20" rx="4" fill="#5b8def"/></svg></div>
    </div>
    <div class="toc-intro">${starSticker(30)} Pick a section and flip through! ${starSticker(30,'#F15BB5')}</div>
    <div class="toc-grid">${tiles}</div>
    <div class="toc-row2">${wide('fav','Favorites',plural(f,'idea'))}${wide('all','All Ideas',plural(v.length,'idea'))}${wide('mine','My Ideas',plural(m,'idea'))}</div>
    <div class="toc-foot">${pencilArt(150)}${glueArt(64)}${rulerArt(170)}</div>
  </div></div>`;
}
function renderTagsPage(){
  const v=visible(); const tags=allTags();
  const notes = tags.map((t,i)=>{ const n=v.filter(l=>l.tags.includes(t)).length; const r=((i*37)%7-3)*0.9;
    return `<button class="tnote" style="--nc:${NOTE_COLORS[i%NOTE_COLORS.length]};--r:${r}deg" data-act="open-tag" data-tag="${esc(t)}"><span class="pin" style="background:radial-gradient(circle at 35% 35%,#fff8,${tagColor(t)} 55%)"></span><span class="nm">${esc(t)}</span><span class="ct">${plural(n,'idea')}</span></button>`; }).join('');
  return `<div class="page cork"><div class="page-scroll">
    <div class="cork-head"><span class="pin"></span><h2>Tag Board</h2><p>Tap a sticky note to flip through every idea with that tag</p></div>
    <button class="search-fake" data-act="search">${ICON.search}<span>Search all ideas…</span></button>
    <div class="notes-grid">${notes}</div>
  </div></div>`;
}
function renderTipsPage(){
  const li=(svg,t)=>`<li>${svg}<span>${t}</span></li>`;
  return `<div class="page tips"><div class="page-scroll"><div class="chalkboard">
    <h2>How to use your magazine</h2>
    <ul>
      ${li(starSticker(30),'<b>Swipe</b> left or right to turn pages — or tap the page edges, or use the ‹ › buttons.')}
      ${li(starSticker(30,'#F15BB5'),'Tap the big <b>+</b> button to add your own lesson idea, with a photo if you like.')}
      ${li(starSticker(30,'#22B07D'),'Tap the <b>star</b> on any lesson to save it to Favorites.')}
      ${li(starSticker(30,'#3D8BF2'),'Tap a <b>#tag</b> to see every lesson with that tag (Halloween, Centers…).')}
      ${li(starSticker(30,'#F7882F'),'Tap the <b>pencil</b> to edit any idea. Starter ideas can be edited or hidden.')}
      ${li(starSticker(30,'#9B5DE5'),'Everything is saved right on this device. Use <b>⚙︎ Settings → Export backup</b> now and then to keep a copy safe.')}
      ${li(starSticker(30,'#fff'),'Add to Home Screen: tap <b>Share</b> → <b>Add to Home Screen</b> for an app icon.')}
    </ul></div>
    <div class="supplies">${crayon('#F2545B',110)}${appleArt(64)}${crayon('#22B07D',110)}</div>
  </div></div>`;
}
function renderCover(d){
  const s=d.style;
  const btns = d.sectionId ? `<div class="cover-actions"><button class="btn ghost" data-act="add" data-sec="${d.sectionId}">${ICON.plus} Add ${esc(SEC[d.sectionId].short||SEC[d.sectionId].name)} idea</button></div>` : '';
  return `<div class="page cover" style="${secVars(s)}"><div class="page-scroll">
    <div class="cover-card">${PAPERCLIP}<div class="cover-kick">${esc(d.kicker)}</div><h2 class="cover-title">${esc(d.title)}</h2><div class="cover-tag">${esc(d.tagline)}</div></div>
    <div class="cover-art">${DOODLE[d.doodle]||DOODLE.all}${starSticker(52).replace('class="star"','class="star" style="right:2%;top:6%"')}${starSticker(40,'#F15BB5').replace('class="star"','class="star" style="left:4%;bottom:10%;width:40px;height:40px"')}</div>
    <div class="cover-count">${plural(d.count,'lesson idea')}</div>
    ${d.count? `<div class="cover-hint">Swipe to flip ${ICON.hand}</div>`:''}
    ${btns}
  </div></div>`;
}
function renderLesson(l){
  if(!l) return renderFiller();
  const secs=sectionsOf(l).map(id=>SEC[id]); const s=secs[0];
  const badge = l.mine ? `<span class="badge mine">${ICON.heart} My idea</span>` : `<span class="badge starter">Starter idea</span>${l.edited?'<span class="badge edited">· edited</span>':''}`;
  const mats = l.materials.length? `<section class="blk"><h3>${ICON.scissors} Materials</h3><ul class="mats">${l.materials.map(m=>`<li>${esc(m)}</li>`).join('')}</ul></section>`:'';
  const steps = l.steps.length? `<section class="blk"><h3>${ICON.list} Steps</h3><ol class="steps">${l.steps.map(m=>`<li>${esc(m)}</li>`).join('')}</ol></section>`:'';
  const notes = l.notes? `<div class="sticky pink">${PAPERCLIP}<b>Teacher notes</b>${esc(l.notes).replace(/\n/g,'<br>')}</div>`:'';
  const photo = l.photo? `<figure class="polaroid" style="margin-left:auto;margin-right:auto"><span class="tape"></span><img src="${l.photo}" alt="Photo for ${esc(l.title)}" draggable="false" loading="eager"><figcaption class="cap">${esc(l.title)}</figcaption></figure>`:'';
  return `<div class="page lesson" style="${secVars(s)}" data-lesson="${esc(l.id)}"><div class="page-scroll"><div class="sheet">
    <div class="ls-top">${secs.map(x=>`<button class="sec-pill" style="${secVars(x)}" data-act="open-section" data-id="${x.id}"><i>${DOODLE[x.id]}</i>${esc(x.short||x.name)}</button>`).join('')}${badge}<span class="ls-spacer"></span>
      <button class="ic-btn fav" data-act="fav" data-id="${esc(l.id)}" aria-pressed="${l.fav}" aria-label="${l.fav?'Remove from favorites':'Add to favorites'}">${l.fav?ICON.starOn:ICON.starOff}</button>
      <button class="ic-btn" data-act="edit" data-id="${esc(l.id)}" aria-label="Edit lesson">${ICON.pencil}</button></div>
    <h2 class="ls-title"><span>${esc(l.title)}</span></h2>
    ${l.summary?`<div class="sticky"><span class="tape"></span>${esc(l.summary)}</div>`:''}
    ${photo}${mats}${steps}${notes}
    ${l.tags.length?`<div class="tags">${l.tags.map(t=>tagChip(t)).join('')}</div>`:''}
    <div class="ls-foot"><hr>${secs.map(x=>esc(x.name)).join(' · ')}<hr></div>
  </div></div></div>`;
}
function renderFiller(d={}){
  const sec = d.sectionId? SEC[d.sectionId]:null;
  const style = sec? secVars(sec) : secVars(SPECIAL.home);
  return `<div class="page lesson endpage" style="${style}"><div class="page-scroll"><div class="sheet">
    <div class="art">${DOODLE.mine}</div>
    <h2>${esc(d.title||'Your next great idea goes here!')}</h2>
    <p>${esc(d.text||'Tap the big plus button any time inspiration strikes.')}</p>
    <div class="row"><button class="btn colored" data-act="add" ${sec?`data-sec="${sec.id}"`:''}>${ICON.plus} Add an idea</button><button class="btn ghost" data-act="home">${ICON.home} Contents</button></div>
  </div></div></div>`;
}
function renderPage(p){
  switch(p.t){
    case 'toc': return renderTOC();
    case 'tags': return renderTagsPage();
    case 'tips': return renderTipsPage();
    case 'cover': return renderCover(p);
    case 'lesson': return renderLesson(byId(p.id));
    case 'end': return renderFiller(p);
    default: return renderFiller();
  }
}

/* ================= Books ================= */
function makeBook(kind,key=''){
  const v=visible();
  const cover=(o,list)=>({t:'cover',count:list.length,...o});
  const lessonPages=list=>list.map(l=>({t:'lesson',id:l.id}));
  const endFor=(o)=>({t:'end',...o});
  let b;
  if(kind==='section' && SEC[key]){
    const s=SEC[key], list=sortLessons(v.filter(l=>inSection(l,key)));
    b={title:s.name, style:s, pages:[cover({kicker:'Section',title:s.name,tagline:s.tagline,doodle:s.id,style:s,sectionId:s.id},list),...lessonPages(list),endFor({sectionId:s.id,title:`That's all for ${s.short||s.name}!`,text:'Add your own idea to this section any time.'})]};
  } else if(kind==='tag' && key){
    const list=sortLessons(v.filter(l=>l.tags.includes(key)),true);
    b={title:'#'+key, style:{...SPECIAL.tag,color:tagColor(key)}, pages:[cover({kicker:'Tagged',title:key,tagline:'Every idea with this tag',doodle:'tag',style:{...SPECIAL.tag,color:tagColor(key),cd:shade(tagColor(key))}},list),...lessonPages(list),endFor({title:'The end of this tag!',text:'Add a tag to any lesson from its edit form.'})]};
    b.style.cd=shade(tagColor(key));
  } else if(kind==='fav'){
    const list=sortLessons(v.filter(l=>l.fav),true);
    b={title:'Favorites', style:SPECIAL.fav, pages:[cover({kicker:'My',title:'Favorites',tagline:list.length?'The best of the best!':'Tap the ☆ on any lesson to add it here',doodle:'fav',style:SPECIAL.fav},list),...lessonPages(list),endFor({title:'Collect more stars!',text:'Tap the star on any lesson to save it here.'})]};
  } else if(kind==='all'){
    const list=sortLessons(v,true);
    b={title:'All Ideas', style:SPECIAL.all, pages:[cover({kicker:'Every',title:'All Ideas',tagline:'Flip through everything',doodle:'all',style:SPECIAL.all},list),...lessonPages(list),endFor({})]};
  } else if(kind==='mine'){
    const list=sortLessons(v.filter(l=>l.mine),true);
    b={title:'My Ideas', style:SPECIAL.mine, pages:[cover({kicker:'Made by me',title:'My Ideas',tagline:list.length?'Lessons you added':'Tap + to add your first idea!',doodle:'mine',style:SPECIAL.mine},list),...lessonPages(list),endFor({})]};
  } else if(kind==='search' && key){
    const list=sortLessons(searchLessons(key),true);
    b={title:`“${key}”`, style:SPECIAL.search, pages:[cover({kicker:'Search',title:`“${key}”`,tagline:'Search results',doodle:'search',style:SPECIAL.search},list),...lessonPages(list),endFor({title:'End of results',text:'Try another search or add a new idea.'})]};
  } else {
    kind='home'; key='';
    b={title:'Contents', style:SPECIAL.home, pages:[{t:'toc',wide:true},{t:'tags'},{t:'tips'}]};
  }
  b.kind=kind; b.key=key; return b;
}
function shade(hex,amt=.78){ const n=parseInt(hex.slice(1),16); const r=Math.round((n>>16&255)*amt),g=Math.round((n>>8&255)*amt),bb=Math.round((n&255)*amt); return '#'+((1<<24)|(r<<16)|(g<<8)|bb).toString(16).slice(1); }
function searchLessons(q){
  const terms=q.toLowerCase().split(/\s+/).filter(Boolean);
  return visible().filter(l=>{ const hay=[l.title,l.summary,l.notes,...l.materials,...l.steps,...l.tags,...sectionsOf(l).map(id=>SEC[id].name)].join(' ').toLowerCase(); return terms.every(t=>hay.includes(t)); });
}
function buildViews(pages, spread){
  const views=[]; let i=0;
  while(i<pages.length){
    if(!spread){ views.push([i]); i++; continue; }
    if(pages[i].wide){ views.push([i]); i++; continue; }
    if(i+1<pages.length && !pages[i+1].wide){ views.push([i,i+1]); i+=2; }
    else { views.push([i,-1]); i++; }
  }
  return views;
}

/* ================= App state & view ================= */
const bookEl = $('#book');
const cur = {book:null, views:[], vi:0, spread:false};
function isSpread(){ const w=bookEl.clientWidth, h=bookEl.clientHeight; return w>=900 && w>h*1.12; }
function viewHTML(vi){
  const idxs=cur.views[vi]||[];
  const spread = idxs.length===2;
  return `<div class="view${spread?' spread':''}" data-vi="${vi}">${idxs.map(i=> i<0? renderFiller() : renderPage(cur.book.pages[i])).join('')}</div>`;
}
function buildViewEl(vi){ const t=document.createElement('template'); t.innerHTML=viewHTML(vi).trim(); return t.content.firstElementChild; }
function currentEl(){ return bookEl.querySelector('.view.current'); }
function mountView(vi, anim){
  const el=buildViewEl(vi); el.classList.add('current'); if(anim) el.classList.add('enter');
  const old=currentEl(); bookEl.appendChild(el); if(old) old.remove();
  if(anim) el.addEventListener('animationend',()=>el.classList.remove('enter'),{once:true});
  cur.vi=vi; updateChrome();
}
function refreshView(){
  const old=currentEl(); const scrolls=old?$$('.page-scroll',old).map(e=>e.scrollTop):[];
  const el=buildViewEl(cur.vi); el.classList.add('current'); bookEl.appendChild(el); if(old) old.remove();
  $$('.page-scroll',el).forEach((e,i)=>{ if(scrolls[i]) e.scrollTop=scrolls[i]; });
  updateChrome();
}
function viewIndexForPage(pi){ const i=cur.views.findIndex(v=>v.includes(pi)); return i<0?0:i; }
function firstPageOfView(vi){ const v=cur.views[vi]; return v? v[0] : 0; }
function openBook(kind,key='',pageIdx=0,opts={}){
  cancelFlip();
  cur.book=makeBook(kind,key); cur.spread=isSpread(); cur.views=buildViews(cur.book.pages,cur.spread);
  pageIdx=clamp(pageIdx|0,0,cur.book.pages.length-1);
  mountView(viewIndexForPage(pageIdx), opts.anim!==false);
  writeHash(opts.push!==false);
}
function rebuildBook(focusLessonId){
  const pi = firstPageOfView(cur.vi);
  cur.book=makeBook(cur.book.kind,cur.book.key); cur.spread=isSpread(); cur.views=buildViews(cur.book.pages,cur.spread);
  let target=pi;
  if(focusLessonId){ const f=cur.book.pages.findIndex(p=>p.t==='lesson'&&p.id===focusLessonId); if(f>=0) target=f; }
  target=clamp(target,0,cur.book.pages.length-1);
  cur.vi=viewIndexForPage(target); refreshView(); writeHash(false);
}
function updateChrome(){
  const b=cur.book, s=b.style;
  const root=document.documentElement.style;
  root.setProperty('--c',s.color); root.setProperty('--cd',s.cd||shade(s.color)); root.setProperty('--tint',s.tint||'#eee'); root.setProperty('--on',s.on||'#fff');
  $('#tbTitle').textContent = b.kind==='home' ? (innerWidth<560?'Lesson Ideas':`${settings.teacherName||'My'}'s Lesson Ideas`) : b.title;
  const n=cur.views.length, vi=cur.vi, v=cur.views[vi];
  const realPages=v.filter(i=>i>=0).map(i=>i+1);
  $('#pgText').textContent = n<=1? 'Page 1 of 1' : (realPages.length>1? `Pages ${realPages[0]}–${realPages[realPages.length-1]} of ${b.pages.length}` : `Page ${realPages[0]} of ${b.pages.length}`);
  $('#pgFill').style.width = (n<=1?100: ((vi)/(n-1))*100)+'%';
  $('#pgPrev').disabled = vi<=0; $('#pgNext').disabled = vi>=n-1;
  $('#homeBtn').setAttribute('aria-current', b.kind==='home'?'page':'false');
}

/* ================= Hash routing ================= */
function hashFor(){ const b=cur.book, pi=firstPageOfView(cur.vi); return '#/'+[b.kind, b.key?encodeURIComponent(b.key):'-', pi].join('/'); }
function writeHash(push){ const h=hashFor(); if(location.hash===h) return; try{ push? history.pushState(null,'',h) : history.replaceState(null,'',h);}catch(e){} }
function readHash(){ const m=location.hash.match(/^#\/([a-z]+)\/([^/]*)\/(\d+)/); if(!m) return {kind:'home',key:'',page:0}; return {kind:m[1], key:m[2]==='-'?'':decodeURIComponent(m[2]), page:+m[3]}; }
window.addEventListener('popstate',()=>{ closeAllModals(); const r=readHash(); openBook(r.kind,r.key,r.page,{push:false}); });

/* ================= Flip engine ================= */
let flip=null, animating=false;
function halfOf(srcEl, side, extra){
  const W=bookEl.clientWidth, h=W/2;
  const d=document.createElement('div'); d.className=`half ${side==='L'?'hl':'hr'} ${extra||''}`;
  const inner=document.createElement('div'); inner.className='half-inner'; inner.style.width=W+'px'; inner.style.left=(side==='L'?0:-h)+'px';
  const c=srcEl.cloneNode(true); c.classList.remove('current','enter'); c.removeAttribute('data-vi'); inner.appendChild(c); d.appendChild(inner);
  const s=document.createElement('div'); s.className='shade'; d.appendChild(s);
  return {d,c,s};
}
function copyScroll(from,to){ const a=$$('.page-scroll',from), b=$$('.page-scroll',to); a.forEach((e,i)=>{ if(b[i]&&e.scrollTop) b[i].scrollTop=e.scrollTop; }); }
function startFlip(dir){
  if(flip||animating) return false;
  const t=cur.vi+dir; if(t<0||t>=cur.views.length) return false;
  const curEl=currentEl(); if(!curEl) return false;
  const nextEl=buildViewEl(t);
  const wrap=document.createElement('div'); wrap.className='flip';
  const W=bookEl.clientWidth; wrap.style.perspective=Math.round(Math.max(1500,W*2.6))+'px';
  let uL,uR,front,back,flipper=document.createElement('div');
  if(dir>0){ uL=halfOf(curEl,'L'); uR=halfOf(nextEl,'R'); front=halfOf(curEl,'R','front'); back=halfOf(nextEl,'L','back'); flipper.className='flipper fr'; }
  else { uL=halfOf(nextEl,'L'); uR=halfOf(curEl,'R'); front=halfOf(curEl,'L','front'); back=halfOf(nextEl,'R','back'); flipper.className='flipper fl'; }
  flipper.appendChild(front.d); flipper.appendChild(back.d);
  wrap.appendChild(uL.d); wrap.appendChild(uR.d); wrap.appendChild(flipper);
  bookEl.appendChild(wrap);
  [uL,uR,front,back].forEach(x=>{ if(x.c && (x===uL&&dir>0 || x===uR&&dir<0 || x===front)) copyScroll(curEl,x.c); });
  curEl.style.visibility='hidden';
  // shading gradients
  const revealed = dir>0? uR : uL, covered = dir>0? uL : uR;
  revealed.s.style.background = dir>0? 'linear-gradient(90deg,rgba(0,0,0,.55),rgba(0,0,0,.12) 60%,rgba(0,0,0,.05))' : 'linear-gradient(270deg,rgba(0,0,0,.55),rgba(0,0,0,.12) 60%,rgba(0,0,0,.05))';
  covered.s.style.background = dir>0? 'linear-gradient(270deg,rgba(0,0,0,.45),rgba(0,0,0,.08))' : 'linear-gradient(90deg,rgba(0,0,0,.45),rgba(0,0,0,.08))';
  front.s.style.background = dir>0? 'linear-gradient(90deg,rgba(0,0,0,.08),rgba(0,0,0,.5))' : 'linear-gradient(270deg,rgba(0,0,0,.08),rgba(0,0,0,.5))';
  back.s.style.background = dir>0? 'linear-gradient(270deg,rgba(0,0,0,.08),rgba(0,0,0,.5))' : 'linear-gradient(90deg,rgba(0,0,0,.08),rgba(0,0,0,.5))';
  // glossy highlight on the moving page
  const gl=document.createElement('div'); gl.className='shade'; gl.style.background='linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.35) 50%,rgba(255,255,255,0))'; front.d.appendChild(gl);
  front.d.style.boxShadow='none';
  flip={dir,t,wrap,flipper,curEl,nextEl,p:0,setP(p){
    p=clamp(p,0,1); this.p=p; const a=180*p;
    flipper.style.transform=`rotateY(${dir>0?-a:a}deg)`;
    const showFront=a<90;
    front.d.style.visibility=showFront?'visible':'hidden'; back.d.style.visibility=showFront?'hidden':'visible';
    front.s.style.opacity = showFront? (a/90)*0.85 : 0;
    gl.style.opacity = showFront? Math.sin(a/90*Math.PI)*0.6 : 0;
    back.s.style.opacity = showFront? 0 : ((180-a)/90)*0.85;
    revealed.s.style.opacity = (1-p)*0.9;
    covered.s.style.opacity = p>0.5 ? Math.sin((p-0.5)*2*Math.PI)*0.55 : 0;
  }};
  flip.setP(0);
  return true;
}
function finishFlip(complete){
  if(!flip) return; const f=flip; flip=null;
  if(complete){
    f.nextEl.classList.add('current'); bookEl.insertBefore(f.nextEl,f.wrap);
    f.wrap.remove(); f.curEl.remove(); cur.vi=f.t; updateChrome(); writeHash(false);
  } else { f.curEl.style.visibility=''; f.wrap.remove(); }
}
function cancelFlip(){ if(flip){ finishFlip(false); } animating=false; }
const easeInOut=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const easeOut=t=>1-Math.pow(1-t,3);
function animateP(from,to,dur,ease,done){
  animating=true; const t0=performance.now();
  const step=now=>{ if(!flip){animating=false;return;} const k=Math.min(1,(now-t0)/dur); flip.setP(from+(to-from)*ease(k)); if(k<1) requestAnimationFrame(step); else { animating=false; done&&done(); } };
  requestAnimationFrame(step);
}
function go(dir){
  if(animating||flip||anyModal()) return;
  if(startFlip(dir)) animateP(0,1,720,easeInOut,()=>finishFlip(true));
  else bounce(dir);
}
function bounce(dir){ const el=currentEl(); if(!el||!el.animate) return; el.animate([{transform:'none'},{transform:`translateX(${-dir*16}px) rotateY(${dir*2}deg)`},{transform:'none'}],{duration:320,easing:'ease-out'}); }

/* ---------- pointer / drag ---------- */
// Gesture tuning (px, ms). A quick small flick should commit; a slow drag released near the start cancels.
const GESTURE = {
  SLOP: 6,             // px of movement before we decide the axis
  AXIS_RATIO: 1.2,     // |dx| must beat |dy|*ratio to count as horizontal (keeps vertical scrolling safe)
  VEL_WINDOW: 100,     // ms of recent samples used for release velocity
  FLICK_VEL: 0.2,      // px/ms in the turn direction (20px in ~60-100ms) commits
  FLICK_MIN: 10,       // px of travel a flick needs (filters jitter)
  BACK_VEL: -0.2,      // fling back toward start faster than this cancels even past the distance threshold
  COMMIT_FRAC: 0.13,   // slow drags commit after 13% of the page width
  QUICK_MS: 220,       // a whole touch lasting <= this long...
  QUICK_MIN: 12,       // ...that travelled >= this many px commits (robust to jank / coalesced events)
};
let drag=null, suppressClick=false;
const now=e=>(e&&e.timeStamp)||performance.now();
bookEl.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'&&e.button!==0) return;
  if(animating||flip||anyModal()) return;
  drag={id:e.pointerId,x0:e.clientX,y0:e.clientY,t0:now(e),mode:null,samples:[[now(e),e.clientX]]}; suppressClick=false;
});
function pushSample(d,e){ const t=now(e); d.samples.push([t,e.clientX]); while(d.samples.length>2 && t-d.samples[0][0]>GESTURE.VEL_WINDOW*2) d.samples.shift(); }
function recentVelocity(d,tEnd){ // px/ms over the last VEL_WINDOW ms (positive = rightward)
  const s=d.samples; if(s.length<2) return 0;
  const last=s[s.length-1]; const tRef=Math.max(tEnd||last[0],last[0]);
  let first=s[s.length-2];
  for(let i=s.length-2;i>=0;i--){ if(tRef-s[i][0]<=GESTURE.VEL_WINDOW) first=s[i]; else break; }
  if(tRef-last[0]>GESTURE.VEL_WINDOW) return 0; // finger stopped before lifting
  const dt=Math.max(8,last[0]-first[0]); return (last[1]-first[1])/dt;
}
function reachFor(){ const W=bookEl.clientWidth; return (cur.views[cur.vi].length===2||W>700) ? W*0.62 : W*0.78; }
window.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id) return;
  const dx=e.clientX-drag.x0, dy=e.clientY-drag.y0;
  pushSample(drag,e);
  if(!drag.mode){
    if(Math.abs(dx)<GESTURE.SLOP&&Math.abs(dy)<GESTURE.SLOP) return;
    if(Math.abs(dx)>Math.abs(dy)*GESTURE.AXIS_RATIO){
      const dir=dx<0?1:-1; drag.dir=dir; drag.mode=startFlip(dir)?'flip':'rubber';
      try{bookEl.setPointerCapture(e.pointerId)}catch(_){}
      suppressClick=true;
    } else { drag.mode='scroll'; return; }
  }
  if(drag.mode==='flip'&&flip){
    flip.setP((drag.dir>0?-dx:dx)/reachFor());
    e.preventDefault();
  } else if(drag.mode==='rubber'){
    const el=currentEl(); if(el) el.style.transform=`translateX(${dx*0.12}px)`;
  }
},{passive:false});
function endDrag(e,cancelled){
  if(!drag||e.pointerId!==drag.id) return; const d=drag; drag=null;
  if(e.type==='pointerup' && typeof e.clientX==='number') pushSample(d,e);
  const dx=e.clientX-d.x0, dy=e.clientY-d.y0;
  // Whole flick happened between events (no axis decided yet): treat a fast horizontal one as a turn.
  if(!d.mode && !cancelled && Math.abs(dx)>=GESTURE.SLOP && Math.abs(dx)>Math.abs(dy)*GESTURE.AXIS_RATIO){
    const v=Math.abs(recentVelocity(d,now(e)));
    const quick=(now(e)-d.t0)<=GESTURE.QUICK_MS && Math.abs(dx)>=GESTURE.QUICK_MIN;
    if(quick || v>=GESTURE.FLICK_VEL || Math.abs(dx)>=bookEl.clientWidth*GESTURE.COMMIT_FRAC){ suppressClick=true; go(dx<0?1:-1); }
    return;
  }
  if(d.mode==='flip'&&flip){
    const W=bookEl.clientWidth;
    const travel=d.dir>0?-dx:dx;                                   // px moved in the turn direction
    const v=recentVelocity(d,now(e))*(d.dir>0?-1:1);               // px/ms in the turn direction
    const quick = (now(e)-d.t0)<=GESTURE.QUICK_MS && travel>=GESTURE.QUICK_MIN && v>GESTURE.BACK_VEL;
    const flick = (v>=GESTURE.FLICK_VEL && travel>=GESTURE.FLICK_MIN) || quick;
    const far   = travel>=W*GESTURE.COMMIT_FRAC && v>GESTURE.BACK_VEL;
    const complete = cancelled ? travel>=W*GESTURE.COMMIT_FRAC : (flick||far);
    const p=flip.p, to=complete?1:0;
    // Completing always plays a full, smooth fold; a fast flick finishes a bit quicker.
    const dur = complete ? clamp(Math.round((1-p)*(flick?420:520)),240,520) : clamp(Math.round(p*480),140,360);
    animateP(p,to,dur,easeOut,()=>finishFlip(complete));
  } else if(d.mode==='rubber'){
    const el=currentEl(); if(el){ el.style.transition='transform .3s cubic-bezier(.2,1.4,.4,1)'; el.style.transform=''; setTimeout(()=>{el.style.transition=''},320); }
  }
}
window.addEventListener('pointerup',e=>endDrag(e,false));
window.addEventListener('pointercancel',e=>endDrag(e,true));
bookEl.addEventListener('click',e=>{ if(suppressClick){ e.stopPropagation(); e.preventDefault(); suppressClick=false; } },true);
bookEl.addEventListener('dragstart',e=>e.preventDefault());

/* ---------- edge taps & actions ---------- */
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-act]');
  if(a){ handleAction(a.dataset.act,a,e); return; }
  if(bookEl.contains(e.target) && !e.target.closest('button,a,input,textarea,select,label,img')){
    const r=bookEl.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width;
    const zone = r.width<600? 0.16 : 0.12;
    if(x<zone) go(-1); else if(x>1-zone) go(1);
  }
});
document.addEventListener('keydown',e=>{
  if(anyModal()){ if(e.key==='Escape') closeTopModal(); return; }
  if(e.target.closest&&e.target.closest('input,textarea,select')) return;
  if(e.key==='ArrowRight'||e.key==='PageDown'){ e.preventDefault(); go(1); }
  else if(e.key==='ArrowLeft'||e.key==='PageUp'){ e.preventDefault(); go(-1); }
  else if(e.key==='Escape'||e.key==='Home'){ if(cur.book.kind!=='home') openBook('home'); }
});
async function handleAction(act,el){
  switch(act){
    case 'home': closeAllModals(); openBook('home'); break;
    case 'open-section': closeAllModals(); openBook('section',el.dataset.id); break;
    case 'open-tag': closeAllModals(); openBook('tag',el.dataset.tag); break;
    case 'open-fav': openBook('fav'); break;
    case 'open-all': openBook('all'); break;
    case 'open-mine': openBook('mine'); break;
    case 'next': go(1); break;
    case 'prev': go(-1); break;
    case 'fav': await toggleFav(el.dataset.id); break;
    case 'edit': openForm(byId(el.dataset.id)); break;
    case 'add': openForm(null, el.dataset.sec || (cur.book.kind==='section'?cur.book.key:null)); break;
    case 'search': openSearch(); break;
    case 'settings': openSettings(); break;
  }
}
async function toggleFav(id){
  const l=byId(id); if(!l) return; l.fav=!l.fav; l.updated=Date.now();
  await DB.put(l); refreshView(); toast(l.fav?'⭐ Added to Favorites':'Removed from Favorites');
}

/* ---------- resize ---------- */
let rzT=0;
function onResize(){ clearTimeout(rzT); rzT=setTimeout(()=>{ if(!cur.book) return; cancelFlip(); const pi=firstPageOfView(cur.vi); const sp=isSpread(); if(sp!==cur.spread){ cur.spread=sp; cur.views=buildViews(cur.book.pages,sp); cur.vi=viewIndexForPage(pi); refreshView(); } },120); }
window.addEventListener('resize',onResize);
window.addEventListener('orientationchange',onResize);

/* ================= Modals ================= */
const modalStack=[];
function anyModal(){ return modalStack.length>0; }
function openModal(html,{small=false,style='',onClose}={}){
  const wrap=document.createElement('div'); wrap.className='modal-wrap'; wrap.setAttribute('role','dialog'); wrap.setAttribute('aria-modal','true');
  wrap.innerHTML=`<div class="msheet${small?' small':''}" style="${style}">${html}</div>`;
  document.body.appendChild(wrap); modalStack.push({wrap,onClose});
  wrap.addEventListener('click',e=>{ if(e.target===wrap) closeModal(wrap); if(e.target.closest('[data-close]')) closeModal(wrap); });
  return wrap;
}
function closeModal(wrap,result){
  const i=modalStack.findIndex(m=>m.wrap===wrap); if(i<0) return; const m=modalStack.splice(i,1)[0];
  wrap.classList.add('closing'); setTimeout(()=>wrap.remove(),170); m.onClose&&m.onClose(result);
}
function closeTopModal(){ const m=modalStack[modalStack.length-1]; if(m) closeModal(m.wrap); }
function closeAllModals(){ while(modalStack.length) closeTopModal(); }
function confirmBox(msg,{ok='OK',danger=true,title='Are you sure?'}={}){
  return new Promise(res=>{
    let val=false;
    const w=openModal(`<div class="mhead" style="background:${danger?'#F2545B':'#3D8BF2'}"><h2>${esc(title)}</h2></div><div class="mbody"><p class="confirm-msg">${esc(msg)}</p></div><div class="mfoot"><span class="sp"></span><button class="btn ghost" data-close>Cancel</button><button class="btn ${danger?'danger':'blue'}" data-ok>${esc(ok)}</button></div>`,{small:true,onClose:()=>res(val)});
    $('[data-ok]',w).addEventListener('click',()=>{ val=true; closeModal(w); });
  });
}
let toastT=0;
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2200); }

/* ---------- Lesson form ---------- */
function openForm(lesson, presetSec){
  const isNew=!lesson;
  const l = lesson? structuredClone(lesson) : {sections:[presetSec&&SEC[presetSec]?presetSec:'math'],title:'',summary:'',materials:[],steps:[],notes:'',tags:[],fav:false,photo:null};
  const tagsSel=new Set(l.tags); let photo=l.photo||null;
  const secSel=sectionsOf(l);  // ordered; first = primary
  const s0=SEC[secSel[0]];
  const secOpts=SECTIONS.map(s=>`<button type="button" class="secopt" style="--sc:${s.color};--st:${s.tint};--so:${s.on}" data-sec="${s.id}" aria-pressed="false"><span><i>${DOODLE[s.id]}</i><em>${esc(s.short||s.name)}</em><b class="prim">★ main</b></span></button>`).join('');
  const html=`<div class="mhead"><h2>${isNew?ICON.pencil:ICON.pencil} ${isNew?'New lesson idea':'Edit lesson'}</h2><button class="x" data-close aria-label="Close">${ICON.x}</button></div>
  <form class="mbody" id="lessonForm" autocomplete="off" novalidate>
    <div class="fld" id="fTitle"><label for="fi-title">Title</label><input class="inp" id="fi-title" name="title" maxlength="140" placeholder="e.g. Apple Tasting Graph" value="${esc(l.title)}"><div class="err">Please give your idea a title 🙂</div></div>
    <div class="fld" id="fSecs"><div class="lbl">Sections <span class="hint">pick one or more — the first (★ main) sets the page color</span></div><div class="secs" id="secPick">${secOpts}</div><div class="err">Pick at least one section 🙂</div></div>
    <div class="fld"><label for="fi-sum">Kid-friendly summary <span class="hint">What's the big idea?</span></label><textarea class="inp short" id="fi-sum" name="summary" placeholder="Students taste red, green & yellow apples and graph their favorite.">${esc(l.summary)}</textarea></div>
    <div class="fld"><label for="fi-mat">Materials <span class="hint">one per line</span></label><textarea class="inp" id="fi-mat" name="materials" placeholder="Apples (red, green, yellow)&#10;Plates&#10;Graph chart">${esc(l.materials.join('\n'))}</textarea></div>
    <div class="fld"><label for="fi-steps">Steps <span class="hint">one per line</span></label><textarea class="inp" id="fi-steps" name="steps" placeholder="Slice the apples&#10;Taste each color&#10;Vote with sticky notes">${esc(l.steps.join('\n'))}</textarea></div>
    <div class="fld"><label for="fi-notes">Notes <span class="hint">optional</span></label><textarea class="inp short" id="fi-notes" name="notes" placeholder="Tips, standards, what to do differently next time…">${esc(l.notes)}</textarea></div>
    <div class="fld"><div class="lbl">Tags <span class="hint">tap to choose</span></div><div class="tagpick" id="tagPick"></div>
      <div class="newtag"><input class="inp" id="fi-newtag" maxlength="30" placeholder="Make a new tag…" enterkeyhint="done"><button type="button" class="btn ghost" id="addTagBtn">${ICON.plus} Add</button></div></div>
    <div class="fld"><div class="lbl">Photo <span class="hint">optional</span></div><div id="photoBox"></div><input type="file" accept="image/*" id="fi-photo" hidden></div>
    <div class="fld"><button type="button" class="favrow" id="favRow" aria-pressed="${!!l.fav}"></button></div>
  </form>
  <div class="mfoot">${!isNew&&l.mine?`<button class="btn danger" id="delBtn">${ICON.trash} Delete</button>`:''}${!isNew&&l.starter?`<button class="btn danger" id="hideBtn">${ICON.eyeOff} Hide</button>${l.edited?`<button class="btn ghost" id="resetBtn">${ICON.undo} Reset</button>`:''}`:''}<span class="sp"></span><button class="btn ghost" data-close>Cancel</button><button class="btn primary" id="saveBtn">${ICON.check} Save</button></div>`;
  const w=openModal(html,{style:secVars(s0)});
  const sheet=$('.msheet',w), form=$('#lessonForm',w);
  form.addEventListener('submit',e=>e.preventDefault());
  const drawSecs=()=>{ $$('#secPick .secopt',w).forEach(b=>{ const i=secSel.indexOf(b.dataset.sec); b.setAttribute('aria-pressed',i>=0); b.classList.toggle('primary',i===0); });
    if(secSel.length){ sheet.setAttribute('style',secVars(SEC[secSel[0]])); $('#fSecs',w).classList.remove('bad'); } };
  drawSecs();
  $('#secPick',w).addEventListener('click',e=>{ const b=e.target.closest('[data-sec]'); if(!b) return; const id=b.dataset.sec; const i=secSel.indexOf(id); if(i>=0) secSel.splice(i,1); else secSel.push(id); drawSecs(); });
  const drawTags=()=>{ const all=[...new Set([...allTags(),...tagsSel])]; $('#tagPick',w).innerHTML=all.map(t=>`<button type="button" class="chip" style="--tc:${tagColor(t)}" data-t="${esc(t)}" aria-pressed="${tagsSel.has(t)}"><span class="hash">#</span>${esc(t)}</button>`).join(''); };
  drawTags();
  $('#tagPick',w).addEventListener('click',e=>{ const b=e.target.closest('[data-t]'); if(!b) return; const t=b.dataset.t; tagsSel.has(t)?tagsSel.delete(t):tagsSel.add(t); b.setAttribute('aria-pressed',tagsSel.has(t)); });
  const addTag=()=>{ const inp=$('#fi-newtag',w); let t=inp.value.trim().replace(/^#+/,'').replace(/\s+/g,' '); if(!t) return; const ex=allTags().find(x=>x.toLowerCase()===t.toLowerCase()); if(ex) t=ex; tagsSel.add(t); if(!ex && !customTags.includes(t)){ customTags.push(t); DB.setMeta('customTags',customTags); } inp.value=''; drawTags(); };
  $('#addTagBtn',w).addEventListener('click',addTag);
  $('#fi-newtag',w).addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); addTag(); } });
  const drawPhoto=()=>{ $('#photoBox',w).innerHTML = photo? `<div class="photo-prev"><img src="${photo}" alt="Lesson photo"><button type="button" class="btn danger rm" id="rmPhoto">${ICON.trash}</button></div>` : `<button type="button" class="photo-drop" id="pickPhoto">${ICON.camera}<span>Add a photo</span></button>`;
    const pp=$('#pickPhoto',w); if(pp) pp.onclick=()=>$('#fi-photo',w).click(); const rm=$('#rmPhoto',w); if(rm) rm.onclick=()=>{ photo=null; drawPhoto(); }; };
  drawPhoto();
  $('#fi-photo',w).addEventListener('change',async e=>{ const f=e.target.files[0]; if(!f) return; try{ $('#photoBox',w).innerHTML='<div class="empty">Shrinking photo…</div>'; photo=await compressImage(f); }catch(err){ toast('Sorry, that photo could not be read'); } drawPhoto(); e.target.value=''; });
  let fav=!!l.fav; const drawFav=()=>{ const b=$('#favRow',w); b.setAttribute('aria-pressed',fav); b.innerHTML=`${fav?ICON.starOn:ICON.starOff}<span>${fav?'In my Favorites':'Add to Favorites'}</span>`; };
  drawFav(); $('#favRow',w).addEventListener('click',()=>{ fav=!fav; drawFav(); });
  const lines=v=>v.split('\n').map(s=>s.replace(/^\s*(?:[-*•]|\d+[.)])\s*/,'').trim()).filter(Boolean);
  $('#saveBtn',w).addEventListener('click',async()=>{
    const title=$('#fi-title',w).value.trim();
    if(!title){ $('#fTitle',w).classList.add('bad'); $('#fi-title',w).focus(); return; }
    if(!secSel.length){ $('#fSecs',w).classList.add('bad'); $('#fSecs',w).scrollIntoView({block:'center',behavior:'smooth'}); return; }
    const now=Date.now();
    const data={ title, sections:[...secSel], section:secSel[0], summary:$('#fi-sum',w).value.trim(), materials:lines($('#fi-mat',w).value), steps:lines($('#fi-steps',w).value), notes:$('#fi-notes',w).value.trim(), tags:[...tagsSel], photo, fav, updated:now };
    let rec;
    if(isNew){ rec=normalizeLesson({id:uid(),mine:true,starter:false,created:now,...data}); lessons.push(rec); }
    else { rec=byId(lesson.id); Object.assign(rec,data); if(rec.starter) rec.edited=true; }
    try{ await DB.put(rec); }catch(err){ toast('Could not save — storage may be full'); return; }
    closeModal(w); afterChange(rec.id, isNew); toast(isNew?'✨ Idea added!':'Saved!');
  });
  const del=$('#delBtn',w); if(del) del.addEventListener('click',async()=>{ if(!await confirmBox(`Delete “${lesson.title}”? This can't be undone.`,{ok:'Delete'})) return; await DB.del(lesson.id); lessons=lessons.filter(x=>x.id!==lesson.id); closeModal(w); rebuildBook(); toast('Deleted'); });
  const hide=$('#hideBtn',w); if(hide) hide.addEventListener('click',async()=>{ if(!await confirmBox(`Hide the starter idea “${lesson.title}”? You can bring it back any time in Settings.`,{ok:'Hide',title:'Hide this idea?'})) return; const r=byId(lesson.id); r.hidden=true; await DB.put(r); closeModal(w); rebuildBook(); toast('Hidden — restore it in Settings'); });
  const reset=$('#resetBtn',w); if(reset) reset.addEventListener('click',async()=>{ if(!await confirmBox('Put this starter idea back the way it came? Your changes will be lost.',{ok:'Reset',title:'Reset to original?'})) return; const orig=STARTERS.find(s=>s.id===lesson.id); if(!orig) return; const r=byId(lesson.id); Object.assign(r,structuredClone(orig),{fav:r.fav,edited:false,photo:null,updated:Date.now()}); await DB.put(r); closeModal(w); rebuildBook(r.id); toast('Reset to original'); });
  if(isNew) setTimeout(()=>{ if(matchMedia('(pointer:fine)').matches) $('#fi-title',w).focus(); },60);
}
function afterChange(id,isNew){
  const inBook = cur.book.pages.some(p=>p.t==='lesson'&&p.id===id);
  const l=byId(id);
  if(inBook || (!isNew && cur.book.kind!=='home')){
    const fresh=makeBook(cur.book.kind,cur.book.key);
    if(fresh.pages.some(p=>p.t==='lesson'&&p.id===id)){ rebuildBook(id); return; }
    if(!isNew){ rebuildBook(); return; }
  }
  const ps=(cur.book.kind==='section'&&inSection(l,cur.book.key))?cur.book.key:primaryOf(l);
  const b=makeBook('section',ps); const pi=b.pages.findIndex(p=>p.t==='lesson'&&p.id===id);
  openBook('section',ps,Math.max(0,pi));
}
function compressImage(file){
  return new Promise((res,rej)=>{
    const url=URL.createObjectURL(file); const img=new Image();
    img.onload=()=>{ try{ const max=1280; const w=img.naturalWidth,h=img.naturalHeight; const s=Math.min(1,max/Math.max(w,h)); const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(w*s)); c.height=Math.max(1,Math.round(h*s)); const g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height); g.drawImage(img,0,0,c.width,c.height); URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg',0.74)); }catch(e){ rej(e); } };
    img.onerror=()=>{ URL.revokeObjectURL(url); rej(new Error('bad image')); };
    img.src=url;
  });
}

/* ---------- Search ---------- */
function openSearch(){
  const w=openModal(`<div class="mhead"><h2>${ICON.search} Find an idea</h2><button class="x" data-close aria-label="Close">${ICON.x}</button></div>
    <div class="mbody"><div class="search-in">${ICON.search}<input class="inp" id="q" type="search" placeholder="Try “pumpkin”, “graph”, or “dice”" enterkeyhint="search"></div>
    <div class="fld" style="margin:16px 0 0"><div class="lbl">Or tap a tag</div><div class="tagpick">${allTags().map(t=>tagChip(t)).join('')}</div></div>
    <div id="results"></div></div>`,{style:secVars(SPECIAL.search)});
  const q=$('#q',w), out=$('#results',w);
  const draw=()=>{ const v=q.value.trim(); if(!v){ out.innerHTML=''; return; } const r=sortLessons(searchLessons(v),true);
    out.innerHTML = r.length? `<div class="res-list"><button class="btn blue" data-sflip style="align-self:flex-start">${ICON.hand} Flip through ${plural(r.length,'result')}</button>${r.map(l=>{const s=SEC[primaryOf(l)]; return `<button class="res" style="--rc:${s.cd}" data-goto="${esc(l.id)}"><span class="bar" style="background:${s.color}"></span><span><div class="t">${esc(l.title)}</div><div class="s">${esc(l.summary)}</div><div class="m">${sectionsOf(l).map(id=>esc(SEC[id].name)).join(' · ')}${l.mine?' · My idea':''}</div></span></button>`;}).join('')}</div>` : `<div class="empty">No ideas match “${esc(v)}” yet.</div>`; };
  q.addEventListener('input',draw);
  q.addEventListener('keydown',e=>{ if(e.key==='Enter'&&q.value.trim()){ closeModal(w); openBook('search',q.value.trim()); } });
  out.addEventListener('click',e=>{ const g=e.target.closest('[data-goto]'); const v=q.value.trim(); if(g){ closeModal(w); const b=makeBook('search',v); const pi=b.pages.findIndex(p=>p.t==='lesson'&&p.id===g.dataset.goto); openBook('search',v,Math.max(0,pi)); } else if(e.target.closest('[data-sflip]')){ closeModal(w); openBook('search',v); } });
  setTimeout(()=>q.focus(),80);
}

/* ---------- Settings / backup ---------- */
async function openSettings(){
  const hidden=lessons.filter(l=>l.hidden);
  let persisted=null, est=null;
  try{ if(navigator.storage&&navigator.storage.persisted) persisted=await navigator.storage.persisted(); if(navigator.storage&&navigator.storage.estimate) est=await navigator.storage.estimate(); }catch(e){}
  const lastBk=await DB.getMeta('lastBackup');
  const used = est&&est.usage? (est.usage/1048576).toFixed(1)+' MB used' : '';
  const w=openModal(`<div class="mhead"><h2>${ICON.gear} Settings & Backup</h2><button class="x" data-close aria-label="Close">${ICON.x}</button></div>
  <div class="mbody">
    <div class="set-sec"><h3>✏️ Magazine name</h3><div class="namefix"><input class="inp" id="tname" maxlength="40" value="${esc(settings.teacherName||'')}" placeholder="Mrs. Jones"><span style="font-size:17px">'s Lesson Idea Magazine</span></div></div>
    <div class="set-sec"><h3>💾 Backup</h3><p>Your ideas and photos live only on this device. Export a backup file now and then (save it to Files, iCloud Drive, or email it to yourself). ${lastBk?`<br>Last backup: <b>${new Date(lastBk).toLocaleDateString()}</b>`:'<br><b>No backup yet.</b>'}</p>
      <div class="row"><button class="btn primary" id="expBtn">${ICON.download} Export backup</button><button class="btn ghost" id="impBtn">${ICON.upload} Import backup</button><input type="file" id="impFile" accept="application/json,.json" hidden></div></div>
    <div class="set-sec"><h3>📦 Storage</h3><p>${persisted===true?'✅ This device has agreed to keep your ideas safe (persistent storage is on).':persisted===false?'Storage is “best effort.” Adding this app to your Home Screen helps keep it safe — and exporting backups is always a good idea.':'Storage status unavailable.'} ${used?'('+used+')':''}</p>
      ${persisted===false?`<div class="row"><button class="btn ghost" id="persistBtn">Ask to keep my data safe</button></div>`:''}</div>
    <div class="set-sec"><h3>🙈 Hidden starter ideas (${hidden.length})</h3>${hidden.length? hidden.map(l=>`<div class="hid-item"><span class="t">${esc(l.title)} <span style="color:${SEC[primaryOf(l)].cd};font-size:14px">· ${sectionsOf(l).map(id=>esc(SEC[id].name)).join(', ')}</span></span><button class="btn ghost" data-unhide="${esc(l.id)}">Show again</button></div>`).join('') : '<p>None — every starter idea is showing.</p>'}</div>
  </div><div class="mfoot"><span class="sp"></span><button class="btn blue" data-close>Done</button></div>`,{style:secVars(SPECIAL.mine)});
  const tn=$('#tname',w); tn.addEventListener('change',async()=>{ settings.teacherName=tn.value.trim()||'My'; await DB.setMeta('settings',settings); if(cur.book.kind==='home') refreshView(); else updateChrome(); });
  $('#expBtn',w).addEventListener('click',exportBackup);
  $('#impBtn',w).addEventListener('click',()=>$('#impFile',w).click());
  $('#impFile',w).addEventListener('change',async e=>{ const f=e.target.files[0]; e.target.value=''; if(f){ const ok=await importBackup(f); if(ok) closeModal(w); } });
  const pb=$('#persistBtn',w); if(pb) pb.addEventListener('click',async()=>{ const r=await requestPersist(); toast(r?'✅ Storage will be kept':'Your browser said “not yet” — keep exporting backups'); });
  w.addEventListener('click',async e=>{ const u=e.target.closest('[data-unhide]'); if(!u) return; const l=byId(u.dataset.unhide); l.hidden=false; await DB.put(l); u.closest('.hid-item').remove(); rebuildBook(); toast('Showing again'); });
}
async function exportBackup(){
  const data={app:'lesson-idea-magazine',version:2,exportedAt:new Date().toISOString(),settings,customTags,lessons};
  const json=JSON.stringify(data); const d=new Date(); const name=`lesson-ideas-backup-${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}.json`;
  const blob=new Blob([json],{type:'application/json'});
  let shared=false;
  try{ const touch=matchMedia('(pointer:coarse)').matches; if(touch && navigator.canShare && window.File){ const file=new File([blob],name,{type:'application/json'}); if(navigator.canShare({files:[file]})){ await navigator.share({files:[file],title:'Lesson Ideas Backup'}); shared=true; } } }catch(e){ if(e&&e.name==='AbortError') return; }
  if(!shared){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500); }
  await DB.setMeta('lastBackup',Date.now()); toast(`Backup saved (${plural(lessons.length,'idea')})`);
}
async function importBackup(file){
  let data; try{ data=JSON.parse(await file.text()); }catch(e){ toast('That file is not a valid backup'); return false; }
  const list = Array.isArray(data)? data : data&&Array.isArray(data.lessons)? data.lessons : null;
  if(!list){ toast('That file is not a lesson backup'); return false; }
  // Old (v1) backups have a single `section`; normalizeLesson converts to `sections`.
  // Untouched starter ideas pick up any extra sections from the current starter set.
  const clean=list.filter(l=>l&&l.id&&l.title).map(normalizeLesson).map(l=>{ if(l.starter&&!l.edited&&!Array.isArray((list.find(x=>String(x.id)===l.id)||{}).sections)){ const st=STARTERS.find(x=>x.id===l.id); if(st){ l.sections=[...st.sections]; l.section=l.sections[0]; } } return l; });
  if(!await confirmBox(`Import ${plural(clean.length,'idea')}? Ideas already here with the same ID will be replaced by the backup copy. Nothing else is removed.`,{ok:'Import',danger:false,title:'Import backup'})) return false;
  await DB.putMany(clean);
  if(data.customTags&&Array.isArray(data.customTags)){ customTags=[...new Set([...customTags,...data.customTags.map(String)])]; await DB.setMeta('customTags',customTags); }
  if(data.settings&&data.settings.teacherName&&(!settings.teacherName||settings.teacherName==='Mrs. Jones')){ settings.teacherName=String(data.settings.teacherName).slice(0,40); await DB.setMeta('settings',settings); }
  lessons=(await DB.all()).map(normalizeLesson);
  rebuildBook(); toast(`Imported ${plural(clean.length,'idea')} 🎉`); return true;
}
async function requestPersist(){ try{ if(navigator.storage&&navigator.storage.persist){ return await navigator.storage.persist(); } }catch(e){} return false; }

/* ================= Migration ================= */
const SCHEMA_VERSION = 2; // v1: single `section`; v2: `sections` array (+ `section` mirror of the primary)
async function migrate(){
  const schema = (await DB.getMeta('schemaVersion')) || 1;
  const seeded = (await DB.getMeta('seedVersion')) || 1;
  if(schema>=SCHEMA_VERSION && seeded>=SEED_VERSION) return;
  const all = await DB.all();
  const have = new Set(all.map(l=>l.id));
  const changed = [];
  for(const rec of all){
    let dirty=false;
    // Non-destructive: only ADD `sections`; every other field (photo, fav, hidden, edited, text…) is left untouched.
    if(!Array.isArray(rec.sections) || !rec.sections.length){ rec.sections = sectionsOf(rec); dirty=true; }
    if(rec.section!==rec.sections[0]){ rec.section=rec.sections[0]; dirty=true; }
    // Starter ideas she never edited pick up new second sections from the updated starter set.
    if(seeded<SEED_VERSION && rec.starter && !rec.edited){
      const st=STARTERS.find(x=>x.id===rec.id);
      if(st){ const merged=[...new Set([...rec.sections, ...st.sections])]; if(merged.length!==rec.sections.length){ rec.sections=merged; dirty=true; } }
    }
    if(dirty) changed.push(rec);
  }
  // Any brand-new starters in this version (none removed, hidden ones stay hidden).
  if(seeded<SEED_VERSION) STARTERS.filter(s=>!have.has(s.id)).forEach(s=>changed.push(structuredClone(s)));
  if(changed.length) await DB.putMany(changed);   // single transaction: all-or-nothing
  await DB.setMeta('schemaVersion',SCHEMA_VERSION);
  await DB.setMeta('seedVersion',SEED_VERSION);
}

/* ================= Boot ================= */
async function boot(){
  await DB.open();
  if(DB.mem) setTimeout(()=>toast('Private mode: ideas will not be saved after closing'),800);
  const seeded=await DB.getMeta('seedVersion');
  if(!seeded){ await DB.putMany(STARTERS.map(s=>structuredClone(s))); await DB.setMeta('seedVersion',SEED_VERSION); await DB.setMeta('schemaVersion',SCHEMA_VERSION); }
  await migrate();
  lessons=(await DB.all()).map(normalizeLesson);
  settings=Object.assign({teacherName:'Mrs. Jones'},await DB.getMeta('settings')||{});
  customTags=(await DB.getMeta('customTags'))||[];
  $('#loading')?.remove();
  const r=readHash(); cur.book=null;
  openBook(r.kind,r.key,r.page,{push:false,anim:true});
  try{ history.replaceState(null,'',hashFor()); }catch(e){}
  requestPersist();
  if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(()=>{});
}
window.__lm={GESTURE,go,startFlip,get flip(){return flip},finishFlip,openBook,cur};
boot();
