"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs/promises");
const path=require("node:path");
const {version}=require("../research/transcriptions/europe-chapters.json");
const {studies}=require("../research/transcriptions/operational-balance.json");
module.exports=async(browser,base,root)=>{
  for (const width of [1440,390]) {
    const page=await browser.newPage({viewport:{width,height:width===390?844:900},hasTouch:width===390,isMobile:width===390});
    const errors=[];
    page.on("pageerror",error=>errors.push(error.message));
    try {
      await page.goto(base,{waitUntil:"domcontentloaded"});
      assert.ok((await page.title()).includes("v"+version));
      await page.getByRole("link",{name:"Operational balance studies",exact:true}).click();
      await page.getByRole("heading",{level:1,name:"What could the air forces do next?"}).waitFor();
      await page.screenshot({path:path.join(root,"v80-qa-operational-balance-index-"+width+".png")});
      const downloaded=page.waitForEvent("download");
      await page.getByRole("link",{name:"Download all six studies (CSV)"}).click();
      const combinedDownload=await downloaded;
      const combined=await fs.readFile(await combinedDownload.path(),"utf8");
      assert.equal(combined.trimEnd().split("\n").length,97);
      for(const study of studies) {
        const campaign=study.campaigns[0];
        await page.goto(base+"?campaign="+campaign+"#campaign-dossier",{waitUntil:"domcontentloaded"});
        const launch=page.locator('#dossier-balances a[href$="#'+study.id+'"]');
        if(width===390) await launch.tap(); else await launch.press("Enter");
        const section=page.locator("#"+study.id);
        await section.getByRole("heading",{name:study.title}).waitFor();
        assert.equal(new URL(page.url()).hash,"#"+study.id);
        assert.equal(await section.locator("tbody tr").count(),study.rows.length);
        const first=study.calculations[0];
        await section.locator('[id="'+study.id+'--'+first.id+'"] a').first().click();
        assert.equal(new URL(page.url()).hash,"#"+study.id+"--"+first.inputs[0]);
        await page.reload({waitUntil:"domcontentloaded"});
        assert.equal(await page.locator("tr:target").count(),1);
        assert.match(await page.locator("tr:target td").last().locator("a").getAttribute("href"),/^https:\/\//);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
        const get=page.waitForEvent("download");
        await section.getByRole("link",{name:"Download "+study.label+" data (CSV)"}).click();
        const download=await get;
        const csv=await fs.readFile(await download.path(),"utf8");
        assert.equal(csv.trimEnd().split("\n").length,study.rows.length+study.calculations.length+1);
        await section.locator('a[href="./formations.html#unit-'+study.units[0]+'"]').click();
        const unit=page.locator("#unit-"+study.units[0]);
        await unit.locator('a[href="./operational-balance.html#'+study.id+'"]').click();
        await section.locator("h2").waitFor();
        if(study.id==="reich") await page.screenshot({path:path.join(root,"v80-qa-operational-balance-case-"+width+".png")});
        await section.locator('a[href$="?campaign='+campaign+'#campaign-dossier"]').click();
        assert.equal(new URL(page.url()).searchParams.get("campaign"),campaign);
      }
      await page.goto(base+"?campaign=poland#campaign-dossier");
      await page.locator("#dossier-study-title").waitFor();
      assert.equal(await page.locator("#dossier-balances a").count(),0);
      assert.deepEqual(errors,[]);
    } finally {await page.close();}
  }
  console.log("PASS current public labels, six study journeys, evidence fragments, formation returns and CSV contents at both widths");
};
