import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * The Sanity dataset is PRIVATE and the read token is server-only. A "use client"
 * component that imports the read `client` would silently break in production (no
 * token in the browser) and, worse, is the pattern that forced the dataset to be
 * public in the first place. Browser code must call a route handler instead.
 */
const APPS = ["web", "admin", "seller"].map((a) => join(__dirname, "..", "..", a));
const REPO_APPS = join(__dirname, "..", "..");
const SKIP = new Set(["node_modules", ".next", ".turbo", "dist"]);

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(p);
  }
  return out;
}

test("no 'use client' file imports a Sanity runtime client", () => {
  const offenders: string[] = [];
  for (const file of APPS.flatMap((root) => walk(root))) {
    const src = readFileSync(file, "utf8");
    if (!/^\s*(\/\/.*\n|\/\*[\s\S]*?\*\/\s*)*["']use client["']/.test(src)) continue;
    // value imports of the clients (type-only imports of Product, Category… are fine)
    const importsClient =
      /import\s*\{[^}]*\b(client|writeClient|backendClient)\b[^}]*\}\s*from\s*["']@repo\/sanity(\/client)?["']/.test(src) ||
      /from\s*["']next-sanity["'][\s\S]{0,40}createClient/.test(src) ||
      /api(cdn)?\.sanity\.io/.test(src);
    if (importsClient) offenders.push(file.replace(REPO_APPS + "/", "apps/"));
  }
  assert.deepEqual(offenders, [], `Browser code must not talk to Sanity directly:\n${offenders.join("\n")}`);
});
