"use strict";
const assert=require("node:assert/strict");
module.exports=async(browser,base)=>{
  for (const width of [1440,390]) {
    const page=await browser.newPage({viewport:{width,height:900},isMobile:width<500,hasTouch:width<500});
    const errors=[];page.on("pageerror",err=>errors.push(err.message));
    const goto=file=>page.goto(new URL(file,base).href);
    try {
      await goto("campaign-expansion.html#arctic-convoys");
      const entry=page.locator("#arctic-convoys");
      await entry.getByText("Read the 78 rows").click();
      assert.equal(await entry.locator("tbody tr").count(),78);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),true);
      const csv=await page.request.get(await entry.getByRole("link",{name:/Download 78 rows/}).evaluate(a=>a.href));assert.ok(csv.ok());
      assert.equal((await csv.text()).trimEnd().split("\n").length,79);
      await entry.getByRole("link",{name:"Open map and chronology"}).click();
      await page.locator("#dossier-title").getByText(/Arctic convoys/).waitFor();
      await page.locator("#theater-select").selectOption("atlantic");
      await page.locator('#campaign-list [data-campaign="atlantic"]').click();
      await page.locator("#dossier-title").getByText(/Battle of the Atlantic/).waitFor();
      const periods=await page.evaluate(()=>{
        const app=window.GrandAirWarV77;const fin=app.campaigns.find(c=>c.id==="finland");
        return ["1939-12","1940-11","1944-02"].map(month=>{app.setMonth(month);return app.active(fin);});
      });
      assert.deepEqual(periods,[true,false,true]);
      await goto("grand-air-war-v80.html?campaign=dragoon&event=1944-08-15&episode=Bluebird+and+Dove+glider+lifts#moment-detail");
      await page.locator("#moment-detail h3").getByText(/Bluebird and Dove/).waitFor();
      assert.match(await page.locator("#moment-detail").innerText(),/550th Glider Infantry/);
      await page.locator("#dossier-deployments").getByRole("link",{name:"Missions, outcomes and coverage"}).click();
      await page.locator("#page-title").getByText("Operation Dragoon and southern France",{exact:true}).waitFor();
      await page.locator("#evidence .mission").first().waitFor();
      assert.equal(await page.locator("#evidence .mission").count(),3);
      await goto("campaign-evidence.html?campaign=east-prussia#mission-2");
      const event=page.locator("#mission-2");
      assert.equal(await event.locator("tbody tr").count(),3);
      assert.match(await event.innerText(),/108 aircraft/);assert.match(await event.innerText(),/125 aircraft/);
      await event.locator("summary").click();assert.ok(await event.locator(".witnesses a").count()>=2);
      await event.locator(".study-nav a").first().click();await page.locator("#unit-list tbody tr").first().waitFor();
      assert.match(await page.locator("#unit-list").innerText(),/18th Air Army/);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),true);
      assert.deepEqual(errors,[]);
    } finally {await page.close();}
  }
  console.log("PASS v12 campaign index, downloads, Atlantic filter, Finnish interim peace, same-day episode links, conflicting figures and dated force lists at desktop and mobile widths.");
};
