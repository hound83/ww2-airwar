/* Local browser smoke checks. Run with: node tests/smoke.cjs */
'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1460,height:950}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
    const entry=pathToFileURL(path.join(__dirname,'../index.html')).href;
    await page.goto(entry,{waitUntil:'load'});
    await page.waitForTimeout(1100);
    assert.deepEqual(errors,[],'No uncaught startup errors');
    assert.equal(await page.title(),'European Air War Atlas · Pilots, Aircraft and Operations 1936–1945');
    assert.equal(await page.locator('[data-v4-tab]').count(),10);
    assert.ok((await page.locator('#v4-navigation').innerText()).includes('Version 7.2'));
    assert.ok((await page.locator('#v4-body').innerText()).includes('What was the Luftwaffe facing?'));
    const stats=await page.evaluate(()=>({
      months:window.LuftData.MONTHS,
      milestone:window.AirWarAtlasQA.historicalMilestones(),
      august:window.AirWarAtlasQA.snapshot(window.LuftData.idx(1943,7)),
      v3:window.LuftLabQA.inspect(),
      losses:window.LuftV4Data.usaFighterLossMonthly.map(x=>x.value)
    }));
    assert.equal(stats.months,107);
    assert.equal(stats.milestone,10);
    assert.equal(stats.august.us.find(x=>x.type==='P-47').value,811);
    assert.equal(stats.august.us.find(x=>x.type==='P-51').value,34);
    assert.deepEqual(stats.losses,[18,23,27,30,62,58,111,129,232,358]);
    for(const [tab,text] of [
      ['fleet','The fleet, aircraft by aircraft'],
      ['losses','What was lost, where, and to whom?'],
      ['pilothistory','The pilots behind the aircraft'],
      ['comparison','How airpower was supplied and employed'],
      ['campaigns','Campaigns and source archives'],
      ['sources','Audit the numbers'],
      ['about','Why this atlas exists'],
      ['pilot','Historical scenario controls'],
      ['equipment','Historical scenario controls']
    ]){
      await page.locator('[data-v4-tab="'+tab+'"]').click();
      await page.waitForTimeout(120);
      if(tab==='pilot'||tab==='equipment'){
        // The two original simulators deliberately restore the legacy workspace;
        // #v4-body remains mounted but is hidden rather than re-rendered.
        assert.equal(await page.locator('[data-v4-tab="'+tab+'"]').getAttribute('aria-current'),'page');
        assert.ok(await page.getByRole('heading',{name:text}).isVisible(),tab+' original controls remain accessible');
      }else{
        const body=await page.locator('#v4-body').innerText();
        assert.ok(body.includes(text),tab+' has its required content');
      }
      assert.deepEqual(errors,[],tab+' no runtime errors');
    }
    await page.locator('[data-v4-tab="losses"]').click();
    assert.ok((await page.locator('#v4-body').innerText()).includes('Original German aircraft loss returns'));
    assert.ok((await page.locator('#v4-body').innerText()).includes('May 1944'));
    await page.locator('#v71-theater').selectOption('Western Front');
    await page.locator('#v71-metric').selectOption('enemyDestroyed');
    assert.ok((await page.locator('#v4-body').innerText()).includes('228 / 71'));
    assert.ok((await page.locator('#v4-body').innerText()).includes('Source transcription'));
    await page.locator('[data-v4-tab="fleet"]').click();
    await page.locator('#v4-month').selectOption(String(stats.v3.start+7));
    await page.locator('[data-v4-tab="pilothistory"]').click();
    await page.locator('#v5-pilot-source-rate').hover({position:{x:500,y:100}});
    assert.ok(await page.locator('.atlas-tooltip:visible').count(),'Chart hover renders historical tooltip');
    await page.locator('#v4-markers-check').uncheck();
    assert.equal(await page.locator('#v5-pilot-source-rate .atlas-event-marker').count(),0);
    await page.locator('#v4-markers-check').check();
    assert.deepEqual(errors,[],'Monthly switch does not crash');
    console.log('PASS: preserved simulation, nine Atlas tabs, hover, event toggling, 1936–May 1945 coverage and original source values');
    console.log('DEBUG:',JSON.stringify({date:stats.august.i,pilot:stats.v3,sourceCount:await page.evaluate(()=>window.AirWarAtlasQA.sourceIds().length)}));
    if(process.env.ATLAS_SCREENSHOT)await page.screenshot({path:process.env.ATLAS_SCREENSHOT,fullPage:true});
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
