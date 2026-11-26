import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_CHARS = 200;

const here = dirname(fileURLToPath(import.meta.url));
const entryPath = join(here, "entry.txt");
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outPath = join(outDir, "entry.txt");

const raw = readFileSync(entryPath, "utf8");
const text = raw.endsWith("\n") ? raw.slice(0, -1) : raw;

if (text.length === 0) throw new Error("entry is empty");
if (text.trim().length === 0) throw new Error("entry is only whitespace");
if (text.includes("\n") || text.includes("\r")) throw new Error("entry must be a single line");
if ([...text].length > MAX_CHARS) throw new Error(`entry exceeds ${MAX_CHARS} characters: ${[...text].length}`);

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, text, "utf8");

// Byte-exact round-trip verification: what the judge reads must be
// exactly the validated line, with no added newline or encoding drift.
const written = readFileSync(outPath);
const expected = Buffer.from(text, "utf8");
if (!written.equals(expected)) {
  throw new Error(`round-trip mismatch: wrote ${written.length} bytes, expected ${expected.length}`);
}
const reread = written.toString("utf8");
if (reread !== text || [...reread].length !== [...text].length) {
  throw new Error("round-trip text does not match the validated entry");
}
console.log(`wrote ${[...text].length} chars (${expected.length} bytes) to ${outPath}; round-trip verified byte-exact`);
