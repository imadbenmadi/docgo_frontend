#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.join(__dirname, "../src");

const findings = [];

function walkDir(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    if (["node_modules", ".git", "dist", ".next"].includes(file)) return;

    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith(".jsx") || file.endsWith(".tsx")) {
      const content = fs.readFileSync(fullPath, "utf8");
      const lines = content.split("\n");

      lines.forEach((line, idx) => {
        // Skip comments and imports
        if (line.trim().startsWith("//") || line.includes("import ")) return;

        // Skip if already using t()
        if (line.includes('t("') || line.includes("t('") || line.includes("{t(")) return;

        // Find JSX text: >Text<
        const match = line.match(/>([A-Z][^<{]*?)</);
        if (match) {
          const text = match[1].trim();
          if (text.length > 0 && text.length < 100 && !/^http/.test(text)) {
            findings.push({
              file: path.relative(process.cwd(), fullPath),
              line: idx + 1,
              type: "JSX Text",
              text: text,
            });
          }
        }

        // Find attributes: placeholder="..." title="..." etc
        const attrMatches = line.matchAll(/(placeholder|title|aria-label|alt|label)=["']([^"']{3,})["']/g);
        for (const m of attrMatches) {
          if (!m[2].includes("${")) {
            findings.push({
              file: path.relative(process.cwd(), fullPath),
              line: idx + 1,
              type: `Attr: ${m[1]}`,
              text: m[2],
            });
          }
        }
      });
    }
  });
}

console.log("🔍 Scanning for untranslated strings...\n");
walkDir(SRC_DIR);

// Remove exact duplicates
const unique = Array.from(
  new Map(findings.map(f => [JSON.stringify({text: f.text, file: f.file}), f]).entries()).values()
);

// Group by file
const byFile = {};
unique.forEach(f => {
  if (!byFile[f.file]) byFile[f.file] = [];
  byFile[f.file].push(f);
});

if (unique.length === 0) {
  console.log("✅ No untranslated strings found!");
} else {
  console.log(`Found ${unique.length} untranslated strings:\n`);

  Object.entries(byFile).sort().forEach(([file, items]) => {
    console.log(`\n📄 ${file}`);
    items.slice(0, 8).forEach(f => {
      console.log(`   Line ${f.line}: "${f.text}" [${f.type}]`);
    });
    if (items.length > 8) console.log(`   ... +${items.length - 8} more`);
  });

  console.log(`\n${"═".repeat(80)}`);
  console.log(`📊 Total: ${unique.length} strings | ${Object.keys(byFile).length} files\n`);
}
