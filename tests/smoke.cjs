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
    const entry=pathToFileURL(path.join(__dirname,'../dist/index.html')).href;
    await page.goto(entry,{waitUntil:'load'});
    await page.waitForTimeout(1100);
    assert.deepEqual(errors,[],'No uncaught startup errors');
    assert.equal(await page.title(),'European Air War Atlas · Pilots, Aircraft and Operations 1936–1945');
    assert.equal(await page.locator('[data-v4-tab]').count(),7);
    assert.ok((await page.locator('#v4-body').innerText()).includes('What was the Luftwaffe facing?'));
    const stats=await page.evaluate(()=>({
      months:window.LuftData.MONTHS,
      milestone:window.AirWarAtlasQA.historicalMilestones(),
      august:window.AirWarAtlasQA.snapshot(window.LuftData.idx(1943,7)),
      v3:window.LuftLabQA.inspect(),
      losses:window.LuftV4Data.usaFighterLossMonthly.map(x=>x.value)
    }));
    assert.equal(stats.months,107);
    assert.equal(stats.milestone,9);
    assert.equal(stats.august.us.find(x=>x.type==='P-47').value,811);
    assert.equal(stats.august.us.find(x=>x.type==='P-51').value,34);
    assert.deepEqual(stats.losses,[18,23,27,30,62,58,111,129,232,358]);
    for(const [tab,text] of [
      ['fleet','The fleet, aircraft by aircraft'],
      ['losses','What was lost, where, and to whom?'],
      ['comparison','Thunderbolt vs Mustang'],
      ['sources','Audit the numbers'],
      ['pilot','The experienced core'],
      ['equipment','Aircraft / material losses']
    ]){
      await page.locator('[data-v4-tab="'+tab+'"]').click();
      await page.waitForTimeout(120);
      const body=await page.locator('body').innerText();
      assert.ok(body.includes(text),tab+' has its required content');
      assert.deepEqual(errors,[],tab+' no runtime errors');
    }
    await page.locator('[data-v4-tab="fleet"]').click();
    await page.locator('#v4-month').selectOption(String(stats.v3.start+7));
    assert.deepEqual(errors,[],'Monthly switch does not crash');
    console.log('PASS: v3 preserved, seven v4 tabs, 1936–May 1945 timeline, archival data and navigation');
    console.log('DEBUG:',JSON.stringify({date:stats.august.i,pilot:stats.v3,sourceCount:await page.evaluate(()=>window.AirWarAtlasQA.sourceIds().length)}));
    if(process.env.ATLAS_SCREENSHOT)await page.screenshot({path:process.env.ATLAS_SCREENSHOT,fullPage:true});
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
