import fs from "fs";
import path from "path";

const file = "src/Pages/Auth/Login.jsx";
const content = fs.readFileSync(file, "utf8");
const lines = content.split("\n");

console.log(`Scanning ${file}...\n`);

lines.slice(0, 50).forEach((line, idx) => {
  if (line.includes("<")) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
    
    const match = line.match(/>([A-Z][^<{]*?)</);
    if (match) {
      console.log(`  → Found: "${match[1]}"\n`);
    }
  }
});
