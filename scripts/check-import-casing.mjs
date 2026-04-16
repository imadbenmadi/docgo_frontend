import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(process.cwd());
const SRC_DIR = path.join(projectRoot, "src");

const CODE_EXTS = [".js", ".jsx", ".ts", ".tsx"];
const RESOLVE_EXTS = [
  ...CODE_EXTS,
  ".json",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".svg",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
];

function isIdentifierChar(ch) {
  return /[A-Za-z0-9_$]/.test(ch);
}

function skipWhitespace(code, i) {
  while (i < code.length && /\s/.test(code[i])) i++;
  return i;
}

function readStringLiteral(code, i) {
  const quote = code[i];
  if (quote !== "'" && quote !== '"') return null;
  i++;
  let value = "";
  while (i < code.length) {
    const ch = code[i];
    if (ch === "\\") {
      // keep escapes but we only need the raw value for paths
      const next = code[i + 1];
      if (next == null) break;
      value += next;
      i += 2;
      continue;
    }
    if (ch === quote) {
      return { value, end: i + 1 };
    }
    value += ch;
    i++;
  }
  return null;
}

function skipLineComment(code, i) {
  while (i < code.length && code[i] !== "\n") i++;
  return i;
}

function skipBlockComment(code, i) {
  i += 2; // skip /*
  while (i < code.length) {
    if (code[i] === "*" && code[i + 1] === "/") return i + 2;
    i++;
  }
  return i;
}

function skipString(code, i) {
  const quote = code[i];
  i++;
  while (i < code.length) {
    const ch = code[i];
    if (ch === "\\") {
      i += 2;
      continue;
    }
    if (ch === quote) return i + 1;
    i++;
  }
  return i;
}

function extractModuleSpecifiers(code) {
  const specs = [];
  let i = 0;

  while (i < code.length) {
    const ch = code[i];

    // comments
    if (ch === "/" && code[i + 1] === "/") {
      i = skipLineComment(code, i + 2);
      continue;
    }
    if (ch === "/" && code[i + 1] === "*") {
      i = skipBlockComment(code, i);
      continue;
    }

    // strings (skip so we don't match keywords inside)
    if (ch === "'" || ch === '"') {
      i = skipString(code, i);
      continue;
    }

    // template literal (skip)
    if (ch === "`") {
      i++;
      while (i < code.length) {
        const t = code[i];
        if (t === "\\") {
          i += 2;
          continue;
        }
        if (t === "`") {
          i++;
          break;
        }
        // skip ${ ... } blocks roughly
        if (t === "$" && code[i + 1] === "{") {
          i += 2;
          let depth = 1;
          while (i < code.length && depth > 0) {
            const c = code[i];
            if (c === "/" && code[i + 1] === "/") {
              i = skipLineComment(code, i + 2);
              continue;
            }
            if (c === "/" && code[i + 1] === "*") {
              i = skipBlockComment(code, i);
              continue;
            }
            if (c === "'" || c === '"') {
              i = skipString(code, i);
              continue;
            }
            if (c === "{") depth++;
            else if (c === "}") depth--;
            i++;
          }
          continue;
        }
        i++;
      }
      continue;
    }

    // keyword detection
    const isBoundaryBefore = i === 0 || !isIdentifierChar(code[i - 1]);
    if (
      isBoundaryBefore &&
      code.startsWith("import", i) &&
      !isIdentifierChar(code[i + 6] || "")
    ) {
      let j = i + 6;
      j = skipWhitespace(code, j);

      // dynamic import(
      if (code[j] === "(") {
        j++;
        j = skipWhitespace(code, j);
        const str = readStringLiteral(code, j);
        if (str) specs.push({ spec: str.value, index: i });
        i = j + 1;
        continue;
      }

      // import "...";
      if (code[j] === "'" || code[j] === '"') {
        const str = readStringLiteral(code, j);
        if (str) specs.push({ spec: str.value, index: i });
        i = str?.end ?? j + 1;
        continue;
      }

      // import ... from "...";
      // scan for the `from` keyword outside strings/comments (we already skip them in main loop)
      let k = j;
      while (k < code.length) {
        const c = code[k];
        if (c === ";" || c === "\n") break;
        if (c === "/" && code[k + 1] === "/") {
          k = skipLineComment(code, k + 2);
          continue;
        }
        if (c === "/" && code[k + 1] === "*") {
          k = skipBlockComment(code, k);
          continue;
        }
        if (c === "'" || c === '"') {
          k = skipString(code, k);
          continue;
        }

        const boundary = !isIdentifierChar(code[k - 1] || "");
        if (
          boundary &&
          code.startsWith("from", k) &&
          !isIdentifierChar(code[k + 4] || "")
        ) {
          let m = k + 4;
          m = skipWhitespace(code, m);
          const str = readStringLiteral(code, m);
          if (str) specs.push({ spec: str.value, index: i });
          break;
        }
        k++;
      }

      i = j + 1;
      continue;
    }

    const isBoundaryBeforeExport = i === 0 || !isIdentifierChar(code[i - 1]);
    if (
      isBoundaryBeforeExport &&
      code.startsWith("export", i) &&
      !isIdentifierChar(code[i + 6] || "")
    ) {
      // export ... from "...";
      let j = i + 6;
      j = skipWhitespace(code, j);
      let k = j;
      while (k < code.length) {
        const c = code[k];
        if (c === ";" || c === "\n") break;
        if (c === "/" && code[k + 1] === "/") {
          k = skipLineComment(code, k + 2);
          continue;
        }
        if (c === "/" && code[k + 1] === "*") {
          k = skipBlockComment(code, k);
          continue;
        }
        if (c === "'" || c === '"') {
          k = skipString(code, k);
          continue;
        }
        const boundary = !isIdentifierChar(code[k - 1] || "");
        if (
          boundary &&
          code.startsWith("from", k) &&
          !isIdentifierChar(code[k + 4] || "")
        ) {
          let m = k + 4;
          m = skipWhitespace(code, m);
          const str = readStringLiteral(code, m);
          if (str) specs.push({ spec: str.value, index: i });
          break;
        }
        k++;
      }
      i = j + 1;
      continue;
    }

    i++;
  }

  return specs.map((s) => s.spec);
}

function walkDir(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      // ignore node_modules just in case
      if (e.name === "node_modules" || e.name === ".git" || e.name === "dist")
        continue;
      out.push(...walkDir(full));
    } else if (e.isFile()) {
      if (CODE_EXTS.includes(path.extname(e.name))) out.push(full);
    }
  }
  return out;
}

function tryResolveModule(fromFile, spec) {
  const base = path.resolve(path.dirname(fromFile), spec);
  const hasExt = path.extname(base) !== "";

  const candidates = [];

  if (hasExt) {
    candidates.push(base);
  } else {
    for (const ext of RESOLVE_EXTS) candidates.push(base + ext);
  }

  // directory index
  candidates.push(...RESOLVE_EXTS.map((ext) => path.join(base, "index" + ext)));

  for (const p of candidates) {
    try {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
    } catch {
      // ignore
    }
  }

  return null;
}

function findCaseMismatchPath(absPath) {
  const parsed = path.parse(absPath);
  let cur = parsed.root;
  const rel = absPath.slice(parsed.root.length);
  const parts = rel.split(/[\\/]+/).filter(Boolean);

  const mismatches = [];

  for (const part of parts) {
    let entries;
    try {
      entries = fs.readdirSync(cur, { withFileTypes: true });
    } catch {
      // If we can't read dir, stop.
      return mismatches;
    }

    const found = entries.find(
      (e) => e.name.toLowerCase() === part.toLowerCase(),
    );
    if (!found) {
      // path segment doesn't exist (shouldn't happen if resolved)
      return mismatches;
    }
    if (found.name !== part) {
      mismatches.push({
        expected: found.name,
        actual: part,
        at: path.join(cur, part),
      });
    }
    cur = path.join(cur, found.name);
  }

  return mismatches;
}

function isRelativeImport(spec) {
  return (
    spec.startsWith("./") ||
    spec.startsWith("../") ||
    spec === "." ||
    spec === ".."
  );
}

function normalizeImportForResolve(spec) {
  // Allow people using backslashes in strings (rare)
  return spec.replace(/\\/g, "/");
}

if (!fs.existsSync(SRC_DIR)) {
  console.error(`check-import-casing: src/ not found at ${SRC_DIR}`);
  process.exit(1);
}

const files = walkDir(SRC_DIR);
let errorCount = 0;

for (const file of files) {
  const code = fs.readFileSync(file, "utf8");
  const specs = extractModuleSpecifiers(code);

  for (const rawSpec of specs) {
    const spec = normalizeImportForResolve(rawSpec);
    if (!isRelativeImport(spec)) continue;

    const resolved = tryResolveModule(file, spec);
    if (!resolved) {
      errorCount++;
      const relFile = path.relative(projectRoot, file).replace(/\\/g, "/");
      console.error(
        `\n[import-resolve] ${relFile}: cannot resolve relative import ${JSON.stringify(rawSpec)}`,
      );
      continue;
    }

    const mismatches = findCaseMismatchPath(resolved);
    if (mismatches.length === 0) continue;

    // If the mismatch is only in the resolved path but not in the import path,
    // that usually indicates weird FS issues; still report.
    const relFile = path.relative(projectRoot, file).replace(/\\/g, "/");
    const relResolved = path
      .relative(projectRoot, resolved)
      .replace(/\\/g, "/");

    errorCount++;
    console.error(
      `\n[import-case] ${relFile}: wrong casing in import ${JSON.stringify(rawSpec)}`,
    );
    console.error(`  resolves to: ${relResolved}`);

    // print first mismatch only (keeps output readable)
    const first = mismatches[0];
    console.error(`  disk has:   ${first.expected}`);
    console.error(`  import uses:${first.actual}`);
  }
}

if (errorCount > 0) {
  console.error(
    `\nFound ${errorCount} import path issue(s). Fix the import path casing to match the filesystem.`,
  );
  process.exit(1);
}

console.log("Import path casing check passed.");
