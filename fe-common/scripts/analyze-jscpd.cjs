const r = require("../jscpd-report/jscpd-report.json");
console.log("TOTAL:", JSON.stringify(r.statistics.total, null, 2));
const d = r.duplicates;
console.log("total duplicate blocks:", d.length);
const byPair = {};
const byFile = {};
for (const c of d) {
  const a = c.firstFile.name.replace(/\\/g, "/");
  const b = c.secondFile.name.replace(/\\/g, "/");
  const key = a + "  <=>  " + b;
  byPair[key] = (byPair[key] || 0) + c.lines;
  byFile[a] = (byFile[a] || 0) + c.lines;
  byFile[b] = (byFile[b] || 0) + c.lines;
}
const sortedPairs = Object.entries(byPair).sort((a, b) => b[1] - a[1]);
console.log("\nTOP 30 DUPLICATED PAIRS (by lines):");
for (const [k, v] of sortedPairs.slice(0, 30))
  console.log(String(v).padStart(5), " ", k);

const sortedFiles = Object.entries(byFile).sort((a, b) => b[1] - a[1]);
console.log("\nTOP 30 FILES BY DUPLICATION IMPACT:");
for (const [k, v] of sortedFiles.slice(0, 30))
  console.log(String(v).padStart(5), " ", k);
