const fs=require('fs');const r=f=>fs.readFileSync('src/'+f,'utf8');
const art=r('art.js'); const ICON=new Function(art+';return ICON;')();
let body=r('body.html').replace('__HOME__',ICON.home).replace('__SEARCH__',ICON.search).replace('__GEAR__',ICON.gear).replace('__PLUS__',ICON.plus).replace('__LEFT__',ICON.left).replace('__RIGHT__',ICON.right);
const out=r('head.html')+r('style.css')+body+"(()=>{'use strict';\n"+r('seed.js')+'\n'+art+'\n'+r('app.js')+"\n})();\n</script>\n</body>\n</html>\n";
fs.writeFileSync('index.html',out); console.log('built',out.length);
