'use strict';
// Check painted coastlines, rather than merely counting SVG paths. A Path can
// exist in the DOM while its stale clip rectangle paints towns over the sea.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
function pngPixels(buffer){
 const chunks=[];let width,height,channels;
 for(let offset=8;offset<buffer.length;){
  const size=buffer.readUInt32BE(offset),type=buffer.toString('ascii',offset+4,offset+8),data=buffer.subarray(offset+8,offset+8+size);
  if(type==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);assert.equal(data[8],8);channels=data[9]===6?4:data[9]===2?3:0;assert.ok(channels,'RGB/RGBA screenshot required');assert.equal(data[12],0);}
  if(type==='IDAT')chunks.push(data);offset+=size+12;
 }
 const raw=zlib.inflateSync(Buffer.concat(chunks)),stride=width*channels,pixels=Buffer.alloc(height*stride);
 const paeth=(a,b,c)=>{const p=a+b-c,da=Math.abs(p-a),db=Math.abs(p-b),dc=Math.abs(p-c);return da<=db&&da<=dc?a:db<=dc?b:c;};
 for(let y=0;y<height;y++){
  const filter=raw[y*(stride+1)];assert.ok(filter<=4);
  for(let x=0;x<stride;x++){
   const a=x>=channels?pixels[y*stride+x-channels]:0,b=y?pixels[(y-1)*stride+x]:0,c=y&&x>=channels?pixels[(y-1)*stride+x-channels]:0;
   const predictor=[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter];
   pixels[y*stride+x]=(raw[y*(stride+1)+1+x]+predictor)&255;
  }
 }
 return {width,height,pixel(x,y){const i=(Math.round(y)*width+Math.round(x))*channels;return [...pixels.subarray(i,i+3)];}};
}
module.exports=async function layoutQA(browser,base,root){
 const failures=[],report=[];
 for(const profile of [{name:'wide',viewport:{width:2048,height:1090},deviceScaleFactor:1},{name:'scaled',viewport:{width:1280,height:681},deviceScaleFactor:1.6},{name:'zoomed',viewport:{width:2048,height:1090},deviceScaleFactor:1,cssZoom:1.6}]){
  const context=await browser.newContext(profile),page=await context.newPage();
  try{
   await page.goto(base+'#operation=cobra&step=3',{waitUntil:'domcontentloaded',timeout:45000});
   await page.waitForFunction(()=>window.AtlasNormandyOperations?.current()?.step===3&&document.getElementById('campaign-map').dataset.landStatus==='loaded',{timeout:30000});
   if(profile.cssZoom)await page.evaluate(zoom=>{document.documentElement.style.zoom=zoom;},profile.cssZoom);
   const inspect=async(label,settle=true)=>{
    if(settle)await page.waitForTimeout(900);
    const details=await page.evaluate(()=>{
     const map=window.GrandAirWarV77.map(),panel=document.getElementById('operation-dossier'),nav=panel.querySelector('nav'),rect=panel.getBoundingClientRect();
     return {zoom:map.getZoom(),size:{x:map.getSize().x,y:map.getSize().y},panel:{height:rect.height,clientHeight:panel.clientHeight,scrollHeight:panel.scrollHeight,overflow:getComputedStyle(panel).overflowY,navHeight:nav.getBoundingClientRect().height,buttons:nav.querySelectorAll('button').length},points:[['Avranches',48.684,-1.356],['Coutances',49.049,-1.444],['Mortain',48.647,-.94]].map(([name,lat,lng])=>({name,...map.latLngToContainerPoint([lat,lng])})),renderers:[...document.querySelectorAll('#campaign-map svg')].map(svg=>({viewBox:svg.getAttribute('viewBox'),width:svg.getAttribute('width'),height:svg.getAttribute('height'),transform:svg.style.transform}))};
    });
    // Hide marks only during the paint probe, so the pixel is land, not a dot.
    const hide=await page.addStyleTag({content:'#campaign-map .leaflet-marker-pane,#campaign-map .leaflet-operation-paths-pane,#campaign-map .leaflet-tooltip-pane{visibility:hidden!important}'});
    const png=pngPixels(await page.locator('#campaign-map').screenshot({scale:'css',animations:'disabled'}));
    await hide.evaluate(el=>el.remove());
    const samples=details.points.filter(p=>p.x>10&&p.x<details.size.x-10&&p.y>10&&p.y<details.size.y-10).map(p=>({...p,rgb:png.pixel(p.x*png.width/details.size.x,p.y*png.height/details.size.y)}));
    assert.ok(samples.length>=2,'town probes unexpectedly outside the chart');
    for(const p of samples){const [r,g,b]=p.rgb;if(!(r>135&&g>130&&r-b>10))failures.push(profile.name+' '+label+': '+p.name+' painted '+p.rgb.join(',')+' instead of land');}
    if(details.panel.scrollHeight>details.panel.clientHeight+2)failures.push(profile.name+' '+label+': briefing still clips into an internal scroll viewport');
    report.push({profile:profile.name,label,...details,samples});
    fs.writeFileSync(path.join(root,'v80-qa-layout-report.json'),JSON.stringify({report,failures},null,2));
    await page.locator('.mainstage').screenshot({path:path.join(root,'v80-qa-layout-'+profile.name+'-'+label+'.png')});
   };
   await inspect('direct');
   // Exercise interrupted chapter/snapshot animation, then resize the map.
   await page.evaluate(()=>{for(let i=0;i<12;i++){window.AtlasNormandyOperations.choose(i%2?'cobra':'dday',i%3);}window.AtlasNormandyOperations.choose('cobra',3);});
   await inspect('rapid',false);
   await page.setViewportSize({width:980,height:800});await page.setViewportSize({width:1360,height:900});
   await inspect('resized');
   await page.evaluate(()=>{const m=window.GrandAirWarV77.map();m.setView([48.84,-1.25],10,{animate:false});m.panBy([90,-55],{animate:false});});
   await inspect('panned');
   for(const button of await page.locator('[data-operation-step]').all()){await button.click();}
   assert.equal(await page.locator('#operation-next').isDisabled(),true,'last snapshot control unreachable');
   await page.locator('#operation-prev').focus();await page.keyboard.press('Enter');
   assert.equal((await page.evaluate(()=>window.AtlasNormandyOperations.current())).step,2);
   await page.keyboard.press('Enter');assert.equal((await page.evaluate(()=>window.AtlasNormandyOperations.current())).step,1,'snapshot rerender lost keyboard focus');
   await page.locator('#operation-close').click();assert.ok(await page.locator('#campaign-dossier').isVisible());
  }finally{await context.close();}
 }
 fs.writeFileSync(path.join(root,'v80-qa-layout-report.json'),JSON.stringify({report,failures},null,2));
 console.log(JSON.stringify({layoutChecks:report.map(r=>({profile:r.profile,label:r.label,zoom:r.zoom,panel:r.panel,samples:r.samples})),failures},null,2));
 assert.deepEqual(failures,[],'painted coastlines and briefing layout regressions');
};
