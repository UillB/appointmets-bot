/* scripts/generate-all-code-index.ts
 * Generates ALL_CODE_INDEX.md: a deep index for AI analysis.
 * - Per file: path, size, last modified, and head excerpt (first N lines)
 * - Default excerpt lines can be controlled via CLI flag: --max-lines=200
 * - Excludes heavy/irrelevant directories
 */

import { readdirSync, statSync, readFileSync, writeFileSync } from "fs";
import { join, relative } from "path";

const EXCLUDE_DIRS = new Set(["node_modules", ".git", "dist", "coverage", ".cache", ".next", "build", "out"]);
const MAX_DEFAULT = 200;
const REPO_ROOT = process.cwd();

function getArg(name: string, def?: string) {
  const m = process.argv.find(a => a.startsWith(`${name}=`));
  return m ? m.split("=")[1] : def;
}
const maxLines = parseInt(getArg("--max-lines", String(MAX_DEFAULT))!, 10) || MAX_DEFAULT;

type FileInfo = {
  path: string;
  size: number;
  mtime: Date;
  excerpt: string;
};

function walk(dir: string, out: FileInfo[]) {
  const items = readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    if (EXCLUDE_DIRS.has(it.name)) continue;
    if (it.name.startsWith(".") && it.name !== ".github") continue;
    const p = join(dir, it.name);
    const st = statSync(p);
    if (it.isDirectory()) {
      walk(p, out);
    } else {
      const ext = it.name.split(".").pop()?.toLowerCase();
      if (["png", "jpg", "jpeg", "gif", "webp", "mp4", "mov", "avi", "pdf"].includes(ext || "")) {
        // Skip binary/heavy files in the index body; keep metadata only
        out.push({
          path: p,
          size: st.size,
          mtime: st.mtime,
          excerpt: "(binary skipped)",
        });
        continue;
      }
      let excerpt = "";
      try {
        const raw = readFileSync(p, "utf8");
        const lines = raw.split(/\r?\n/).slice(0, maxLines);
        excerpt = lines.join("\n");
      } catch {
        excerpt = "(unreadable)";
      }
      out.push({ path: p, size: st.size, mtime: st.mtime, excerpt });
    }
  }
}

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

function main() {
  const files: FileInfo[] = [];
  walk(REPO_ROOT, files);
  files.sort((a, b) => a.path.localeCompare(b.path));
  const now = new Date().toISOString();

  const lines: string[] = [];
  lines.push("# ALL_CODE_INDEX");
  lines.push("");
  lines.push(`**Generated:** ${now}`);
  lines.push(`**Root:** \`${relative(REPO_ROOT, REPO_ROOT) || "."}\``);
  lines.push(`**Excerpt lines per file:** ${maxLines}`);
  lines.push("");
  lines.push("> This index is for deep analysis: metadata + head excerpts of each file.");
  lines.push("> For structure overview, see `CODEMAP.md` (auto-generated).");
  lines.push("");

  for (const f of files) {
    const rel = relative(REPO_ROOT, f.path) || ".";
    lines.push(`---`);
    lines.push(`### \`${rel}\``);
    lines.push(`- Size: ${humanSize(f.size)}  `);
    lines.push(`- Modified: ${f.mtime.toISOString()}`);
    lines.push("");
    lines.push("```");
    lines.push(f.excerpt);
    lines.push("```");
    lines.push("");
  }

  writeFileSync("ALL_CODE_INDEX.md", lines.join("\n"), "utf8");
  // eslint-disable-next-line no-console
  console.log("ALL_CODE_INDEX.md generated");
}

main();
