#!/usr/bin/env node
/**
 * Which translation keys does the code ask for that the dictionaries do not
 * have?
 *
 *   node scripts/i18n-audit.js            report
 *   node scripts/i18n-audit.js --write    add the missing keys to en
 *
 * WHY THE GAP IS INVISIBLE
 *
 * Almost every call in this codebase is written `t("some.key", "Some text")`.
 * When the key is missing, i18next quietly returns that second argument, so
 * the page looks finished - in English. `fallbackLng` is "fr", so a missing
 * key does not even fall back to the English dictionary; it falls back to the
 * literal string in the source file.
 *
 * The result is a French and an Arabic site with English sentences scattered
 * through them, and nothing anywhere reporting it. That is what the client
 * saw on /profile/edit.
 *
 * WHAT --write DOES, AND DELIBERATELY DOES NOT
 *
 * It fills the English dictionary from those inline fallbacks, which is a real
 * completion: the fallback IS the English text.
 *
 * It does NOT touch French or Arabic. Copying English into fr.json would make
 * the audit pass while leaving the site exactly as wrong as it is now, and
 * hide it from the next person who runs this. Those keys are written to
 * i18n-missing.json instead, for a translator to work through once.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "src");
const LOCALES = path.join(SRC, "locales");
const LANGS = ["fr", "en", "ar"];

const WRITE = process.argv.includes("--write");

const walk = (dir, out = []) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, out);
        else if (/\.jsx?$/.test(entry.name)) out.push(full);
    }
    return out;
};

const dictPath = (lang) => path.join(LOCALES, lang, "translation.json");

const load = (lang) => {
    try {
        return JSON.parse(fs.readFileSync(dictPath(lang), "utf8"));
    } catch {
        return {};
    }
};

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

/**
 * Every t("key") and t("key", "fallback") in the source.
 *
 * Keys without a dot are skipped: they are almost always a variable or a
 * plain word passed through, not a dictionary path.
 */
const collect = () => {
    const found = new Map();

    for (const file of walk(SRC)) {
        const source = fs.readFileSync(file, "utf8");
        const pattern =
            /\bt\(\s*["'`]([^"'`]+)["'`]\s*(?:,\s*["'`]([^"'`]*)["'`])?/g;

        for (const match of source.matchAll(pattern)) {
            const [, key, fallback] = match;
            if (!key.includes(".")) continue;
            // `t(`paymentPage.${itemType}`)` is resolved at runtime; a static
            // scan cannot know which keys it produces, and reporting the
            // literal source text as missing is noise.
            if (key.includes("${")) continue;

            const existing = found.get(key) || { fallback: null, files: new Set() };
            if (fallback && !existing.fallback) existing.fallback = fallback;
            existing.files.add(path.relative(ROOT, file));
            found.set(key, existing);
        }
    }

    return found;
};

const main = () => {
    const used = collect();
    const dicts = Object.fromEntries(LANGS.map((l) => [l, load(l)]));

    const missing = {};
    for (const lang of LANGS) {
        missing[lang] = [...used.keys()].filter(
            (key) => get(dicts[lang], key) === undefined,
        );
    }

    console.log(`\n${"=".repeat(70)}`);
    console.log(`  Translations  ${used.size} keys used across the app`);
    console.log(`${"=".repeat(70)}\n`);

    for (const lang of LANGS) {
        const n = missing[lang].length;
        const pct = Math.round(((used.size - n) / used.size) * 100);
        console.log(
            `  ${lang}  ${String(used.size - n).padStart(4)} / ${used.size}  ${pct}%` +
                (n ? `   ${n} missing` : "   complete"),
        );
    }

    // Where the gaps are, so somebody can work through it a page at a time.
    const byFile = {};
    for (const key of missing.fr) {
        for (const file of used.get(key).files) {
            byFile[file] = (byFile[file] || 0) + 1;
        }
    }
    const worst = Object.entries(byFile).sort((a, b) => b[1] - a[1]).slice(0, 10);
    if (worst.length) {
        console.log("\n  Most affected files:");
        for (const [file, n] of worst) {
            console.log(`    ${String(n).padStart(3)}  ${file}`);
        }
    }

    const noFallback = missing.fr.filter((k) => !used.get(k).fallback);
    if (noFallback.length) {
        console.log(
            `\n  ${noFallback.length} of them have no inline fallback either,` +
                ` so they render as the raw key:`,
        );
        for (const key of noFallback.slice(0, 10)) console.log(`    ${key}`);
    }

    if (!WRITE) {
        console.log("\n  Re-run with --write to fill the English dictionary.\n");
        return;
    }

    // English: the inline fallback IS the English text, so this is a real
    // completion rather than a placeholder.
    let filled = 0;
    for (const key of missing.en) {
        const fallback = used.get(key).fallback;
        if (!fallback) continue;
        set(dicts.en, key, fallback);
        filled++;
    }
    fs.writeFileSync(dictPath("en"), `${JSON.stringify(dicts.en, null, 2)}\n`);
    console.log(`\n  en: filled ${filled} key(s) from their inline fallbacks`);

    // French and Arabic are left alone on purpose. See the header.
    const forTranslator = {};
    for (const lang of ["fr", "ar"]) {
        forTranslator[lang] = Object.fromEntries(
            missing[lang].map((key) => [key, used.get(key).fallback || ""]),
        );
    }
    const outPath = path.join(ROOT, "i18n-missing.json");
    fs.writeFileSync(outPath, `${JSON.stringify(forTranslator, null, 2)}\n`);
    console.log(
        `  fr/ar: left untouched. ${missing.fr.length} fr and ${missing.ar.length} ar` +
            ` keys written to i18n-missing.json for translation.`,
    );
    console.log(
        "\n  Copying the English into fr.json would make this audit pass and" +
            "\n  leave the site exactly as wrong as it is now.\n",
    );
};

main();
