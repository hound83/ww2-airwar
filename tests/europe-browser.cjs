"use strict";
const assert=require("node:assert/strict");
const path=require("node:path");
const {version,chapters}=require("../research/transcriptions/europe-chapters.json");
module.exports=async(browser,base,root)=>{
  const reader=new URL("europe.html",base).href;
  const cases=[
    ["island-defence","britain","#moment-detail"],
    ["island-defence","malta",'[data-case="pedestal"][aria-current="true"]'],
    ["reach","sicily",'#case-list [data-case="landing-cover"][aria-current="true"]'],
    ["reach","reichdefense",'[data-raid="double-strike"][aria-current="true"]'],
    ["offensives","normandy","#moment-detail"],
    ["offensives","bagration",'[data-case="bobruisk"][aria-current="true"]']
  ];
  for (const width of [1440,390]) {
    const page=await browser.newPage({viewport:{width,height:width===390?844:900},isMobile:width===390,hasTouch:width===390});
    const errors=[];
    page.on("pageerror",error=>errors.push(error.message));
    async function follow(link) {
      const href=await link.getAttribute("href");
      const target=href && new URL(href,page.url());
      if(width===390) await link.tap();else await link.press("Enter");
      if(target) await page.waitForURL(url=>url.pathname===target.pathname && url.hash===target.hash,{waitUntil:"load"});
    }
    const back=async id=>{
      await follow(page.locator("#chapter-return a"));
      await page.locator("article:target h2").waitFor();
      assert.equal(new URL(page.url()).hash,"#"+id);
    };
    try {
      await page.goto(base,{waitUntil:"domcontentloaded"});
      assert.ok((await page.title()).includes("v"+version));
      await follow(page.getByRole("link",{name:"Read the seven chapters"}));
      await page.getByRole("heading",{level:1}).waitFor();
      assert.equal(await page.locator("#contents li").count(),7);
      assert.equal(await page.locator(".places a").count(),7);
      assert.ok(await page.locator(".places path").count()>6, "locator shows physical land");
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth+1));
      await page.screenshot({path:path.join(root,"v80-qa-europe-index-"+width+".png")});
      await follow(page.locator('.places a[href="#reach"]'));
      await page.locator("#reach:target").waitFor();
      await follow(page.locator("#reach summary").first());
      assert.ok(await page.locator("#reach details").first().evaluate(el=>el.open));
      await page.screenshot({path:path.join(root,"v80-qa-europe-chapter-"+width+".png")});
      for (const c of chapters) {
        const article=page.locator("article#"+c.id);
        for (const id of c.campaigns) {
          await follow(article.locator('.cases strong a[href*="campaign='+id+'&"]'));
          await page.locator("#dossier-study-title").waitFor();
          assert.equal(new URL(page.url()).searchParams.get("campaign"),id);
          assert.equal(await page.locator("#dossier-europe").getAttribute("href"),"./europe.html#"+c.id);
          await back(c.id);
        }
      }
      for(const [chapter,id,selector] of cases){
        await follow(page.locator("#"+chapter+' .cases strong a[href*="campaign='+id+'&"]'));
        await follow(page.locator("#dossier-study-link"));
        await page.locator(selector).first().waitFor();
        await page.reload({waitUntil:"domcontentloaded"});
        assert.equal(new URL(page.url()).searchParams.get("fromChapter"),chapter);
        await back(chapter);
      }
      for(const c of chapters) for(const [route] of c.records.filter(([href])=>href.startsWith("operational-balance"))){
        await follow(page.locator("#"+c.id+' .records a[href$="'+new URL(route,base).hash+'"]'));
        await page.locator("section.study:target h2").waitFor();
        await back(c.id);
      }
      await follow(page.locator('#reach .records a[href$="#unit-raf-92"]'));
      await follow(page.locator('#unit-raf-92 a[href="#station-pachino"]').first());
      await page.locator("#station-pachino h1").waitFor();
      await back("reach");
      await follow(page.locator('#offensives .records a[href*="operation=cobra"]'));
      await page.locator("#operation-dossier").waitFor();
      assert.match(await page.locator("#operation-dossier").innerText(),/Cobra/i);
      await back("offensives");
      await follow(page.locator('#last-winter .step a[href="#contents"]'));
      await page.locator("#contents:target").waitFor();
      await page.goto(base+"?campaign=poland&fromChapter=unknown#campaign-dossier",{waitUntil:"domcontentloaded"});
      assert.equal(await page.locator("#chapter-return").count(),0);
      assert.deepEqual(errors,[]);
    } catch (error) {
      await page.screenshot({path:path.join(root,"v80-qa-europe-failure-"+width+".png")});
      throw new Error(width+"px at "+page.url()+": "+error.message,{cause:error});
    } finally {await page.close();}
  }
  console.log("PASS public v10, seven chapters, 20 dossiers, six flagship cases, study/formation/map returns, sources, keyboard and touch");
};
