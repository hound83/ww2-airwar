"use strict";

const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(root, "research/transcriptions/narvik-daily-1940.json"), "utf8"));
const template = fs.readFileSync(path.join(root, "dist/narvik.html"), "utf8").replace(/\r\n/g, "\n");
const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const qualifiers = { approximate: "About ", "lower-bound-exclusive": "Over " };

const rows = data.rows.map(row => {
  const absent = row.areaSorties === null ? "No row" : "Blank";
  const area = [row.areaSorties, row.areaCombats, row.areaLosses].map(value => value ?? absent);
  if (row.areaApproximate) area[0] = "About " + row.areaSorties;
  const unit = row.squadronSorties === null ? "Uncounted" : (qualifiers[row.squadronQualifier] || "") + row.squadronSorties;
  const cells = [...area, unit].map(value => "<td>" + value + "</td>").join("");
  return '<tr id="day-' + row.date + '"><th scope="row">' + date.format(new Date(row.date + "T00:00:00Z")) + "</th>" + cells + "</tr>";
});
fs.writeFileSync(path.join(root, "narvik.html"), template.replace("<!-- DAILY ROWS -->", rows.join("\n")));
