#!/usr/bin/env node
/**
 * Merge translated strings into the French and Arabic dictionaries.
 *
 *   node scripts/i18n-merge.cjs
 *
 * Reads every scripts/i18n-translations-*.json, each shaped
 *
 *   { "some.key": { "fr": "...", "ar": "..." } }
 *
 * and writes the values into their dictionaries. Existing entries are left
 * alone: a translation somebody has already reviewed is not overwritten by a
 * batch file, so re-running this is safe and additive.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const LOCALES = path.join(ROOT, "src", "locales");

const dictPath = (lang) => path.join(LOCALES, lang, "translation.json");

const get = (obj, key) =>
    key.split(".").reduce((acc, part) => (acc == null ? acc : acc[part]), obj);

const set = (obj, key, value) => {
    const parts = key.split(".");
    let node = obj;
    for (const part of parts.slice(0, -1)) {
        if (typeof node[part] !== "object" || node[part] === null) node[part] = {};
        node = node[part];
    }
    node[parts.at(-1)] = value;
};

const batches = fs
    .readdirSync(__dirname)
    .filter((f) => /^i18n-translations-.*\.json$/.test(f))
    .sort();

if (!batches.length) {
    console.log("No i18n-translations-*.json files to merge.");
    process.exit(0);
}

const translations = {};
for (const file of batches) {
    Object.assign(
        translations,
        JSON.parse(fs.readFileSync(path.join(__dirname, file), "utf8")),
    );
}

// `en` too: a few batch entries carry an English value, either because the
// source had no fallback or because the fallback was accidentally French.
for (const lang of ["fr", "ar", "en"]) {
    const dict = JSON.parse(fs.readFileSync(dictPath(lang), "utf8"));
    let added = 0;
    let skipped = 0;

    for (const [key, values] of Object.entries(translations)) {
        const value = values[lang];
        if (!value) continue;
        if (get(dict, key) !== undefined) {
            skipped++;
            continue;
        }
        set(dict, key, value);
        added++;
    }

    fs.writeFileSync(dictPath(lang), `${JSON.stringify(dict, null, 2)}\n`);
    console.log(
        `  ${lang}: added ${added}` +
            (skipped ? `, left ${skipped} existing entr${skipped === 1 ? "y" : "ies"} alone` : ""),
    );
}

console.log(`\nMerged ${batches.length} batch file(s), ${Object.keys(translations).length} keys.\n`);
