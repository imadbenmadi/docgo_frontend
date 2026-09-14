/**
 * Build a real sitemap.xml.
 *
 * robots.txt has always pointed at /sitemap.xml, and nothing ever wrote one.
 * On a single-page app every unknown path falls through to index.html, so the
 * URL answered 200 with a page of HTML - which is worse than a 404, because a
 * 404 tells a crawler there is no sitemap while an HTML body tells it the
 * sitemap is broken.
 *
 * Runs before `vite build`, writes into public/ so the build copies it.
 *
 * The product URLs come from the live API. If it cannot be reached - offline,
 * or a CI runner with no route to the server - the static pages are still
 * written and the build carries on. A sitemap listing the eight pages that
 * never change is worth having; a failed build because a crawler hint could
 * not be generated is not.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, "..", "public", "sitemap.xml");

const SITE = (process.env.VITE_SITE_URL || "https://healthpathglobal.com")
    .trim()
    .replace(/\/+$/, "");
const API = (process.env.VITE_API_URL || "https://backend.healthpathglobal.com")
    .trim()
    .replace(/\/+$/, "");

/** Pages that exist whatever is in the database. */
const STATIC = [
    ["/", "1.0", "daily"],
    ["/Courses", "0.9", "daily"],
    ["/programs", "0.9", "daily"],
    ["/other-services", "0.8", "weekly"],
    ["/other-services/cv", "0.8", "weekly"],
    ["/other-services/internships", "0.8", "weekly"],
    ["/FAQ", "0.5", "monthly"],
    ["/about", "0.5", "monthly"],
    ["/contact", "0.5", "monthly"],
];

/**
 * Each catalogue: where to ask, how to read the answer, and the URL shape.
 * Only published rows are listed - a draft in a sitemap is a 404 to a crawler.
 */
const FEEDS = [
    {
        url: `${API}/Courses?limit=500`,
        rows: (d) => d.courses || d.data || [],
        keep: (r) => r.status === "published" && !r.isDeleted,
        path: (r) => `/Courses/${r.id}`,
        changed: (r) => r.updatedAt,
    },
    {
        url: `${API}/Programs?limit=500`,
        rows: (d) => d.programs || d.data || [],
        keep: (r) => r.status !== "draft" && !r.isDeleted,
        path: (r) => `/programs/${r.id}`,
        changed: (r) => r.updatedAt,
    },
    {
        url: `${API}/other-services/cv-services`,
        rows: (d) => d.data || [],
        keep: (r) => r.isActive !== false,
        path: (r) => `/other-services/cv/${r.id}`,
        changed: (r) => r.updatedAt,
    },
    {
        url: `${API}/other-services/internships?limit=500`,
        rows: (d) => d.data || d.internships || [],
        keep: (r) => r.isActive !== false,
        path: (r) => `/other-services/internships/${r.id}`,
        changed: (r) => r.updatedAt,
    },
];

const day = (value) => {
    const d = value ? new Date(value) : new Date();
    return Number.isNaN(d.getTime())
        ? new Date().toISOString().slice(0, 10)
        : d.toISOString().slice(0, 10);
};

const escape = (s) =>
    String(s).replace(/[<>&'"]/g, (c) => `&${{ "<": "lt", ">": "gt", "&": "amp", "'": "apos", '"': "quot" }[c]};`);

const entry = ({ loc, lastmod, changefreq, priority }) =>
    [
        "  <url>",
        `    <loc>${escape(loc)}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${changefreq}</changefreq>`,
        `    <priority>${priority}</priority>`,
        "  </url>",
    ].join("\n");

const main = async () => {
    const urls = STATIC.map(([path, priority, changefreq]) => ({
        loc: `${SITE}${path}`,
        lastmod: day(),
        changefreq,
        priority,
    }));

    let products = 0;
    for (const feed of FEEDS) {
        try {
            const res = await fetch(feed.url, {
                signal: AbortSignal.timeout(20000),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const rows = feed.rows(await res.json());
            for (const row of Array.isArray(rows) ? rows : []) {
                if (!row?.id || (feed.keep && !feed.keep(row))) continue;
                urls.push({
                    loc: `${SITE}${feed.path(row)}`,
                    lastmod: day(feed.changed(row)),
                    changefreq: "weekly",
                    priority: "0.7",
                });
                products += 1;
            }
        } catch (err) {
            console.warn(`[sitemap] skipped ${feed.url}: ${err.message}`);
        }
    }

    const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...urls.map(entry),
        "</urlset>",
        "",
    ].join("\n");

    mkdirSync(dirname(OUT), { recursive: true });
    writeFileSync(OUT, xml, "utf8");
    console.log(
        `[sitemap] ${urls.length} urls (${STATIC.length} static, ${products} products) -> public/sitemap.xml`,
    );
};

main().catch((err) => {
    // Never fail a build over a crawler hint.
    console.warn(`[sitemap] not generated: ${err.message}`);
});
