/* scripts/generate-codemap.ts
 * Generates CODEMAP.md: a concise, auto-updated structural map of the repo.
 * - Walks repository (excluding node_modules, .git, dist, coverage, .cache)
 * - Builds a tree with file counts, sizes, and brief per-file notes
 * - Tries to extract a short description from the first comment block of each file
 */

import { readdirSync, statSync, readFileSync, writeFileSync } from "fs";
import { join, relative } from "path";

const EXCLUDE_DIRS = new Set(["node_modules", ".git", "dist", "coverage", ".cache", ".next", "build", "out"]);
const TEXT_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".yaml", ".yml", ".env", ".sql", ".prisma", ".html", ".css", ".scss"]);
const REPO_ROOT = process.cwd();

type Node = {
  name: string;
  path: string;
  isDir: boolean;
  size: number;
  children?: Node[];
  note?: string;
};

function extnameSafe(file: string): string {
  const idx = file.lastIndexOf(".");
  return idx >= 0 ? file.slice(idx).toLowerCase() : "";
}

function extractNote(path: string): string | undefined {
  const ext = extnameSafe(path);
  if (!TEXT_EXT.has(ext)) return undefined;
  try {
    const raw = readFileSync(path, "utf8");
    // Try block comment /** ... */ then // ... or first markdown heading
    const block = raw.match(/\/\*\*([\s\S]*?)\*\//);
    if (block) {
      const t = block[1].trim().split("\n").map(s => s.replace(/^\s*\*\s?/, "").trim()).filter(Boolean).join(" ");
      return t.length > 0 ? truncate(t, 240) : undefined;
    }
    const line = raw.match(/^\s*(?:\/\/|#)\s*(.+)$/m);
    if (line) return truncate(line[1].trim(), 240);
    const mdHead = raw.match(/^#\s+(.+)$/m);
    if (mdHead) return truncate(mdHead[1].trim(), 240);
  } catch {}
  return undefined;
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function walk(dir: string): Node {
  const name = dir === REPO_ROOT ? "" : dir.split(/[\\/]/).pop() || "";
  const node: Node = { name: name || "", path: dir, isDir: true, size: 0, children: [] };
  const items = readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    if (it.name.startsWith(".")) {
      // allow .github, ignore others only if not directory? We'll allow .github
      if (it.name !== ".github" && it.isDirectory()) continue;
    }
    if (EXCLUDE_DIRS.has(it.name)) continue;
    const p = join(dir, it.name);
    const st = statSync(p);
    if (it.isDirectory()) {
      const child = walk(p);
      if (child.children && child.children.length === 0) continue;
      node.size += child.size;
      node.children!.push(child);
    } else {
      const child: Node = { name: it.name, path: p, isDir: false, size: st.size, note: extractNote(p) };
      node.size += st.size;
      node.children!.push(child);
    }
  }
  // Sort: dirs first, then files; alphabetically
  node.children!.sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return node;
}

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

function renderTree(node: Node, prefix = "", isLast = true, root = true): string[] {
  const lines: string[] = [];
  const connector = root ? "" : (isLast ? "└── " : "├── ");
  const base = relative(REPO_ROOT, node.path) || ".";
  if (node.isDir) {
    const name = base === "." ? "." : node.name;
    const summary = `(${node.children?.length ?? 0} items, ${humanSize(node.size)})`;
    lines.push(`${prefix}${connector}**${name}/** ${summary}`);
    const nextPrefix = root ? "" : prefix + (isLast ? "    " : "│   ");
    const ch = node.children || [];
    ch.forEach((c, i) => {
      const childLast = i === ch.length - 1;
      lines.push(...renderTree(c, nextPrefix, childLast, false));
    });
  } else {
    const note = node.note ? ` — ${node.note}` : "";
    lines.push(`${prefix}${connector}\`${node.name}\` (${humanSize(node.size)})${note}`);
  }
  return lines;
}

function collectStats(node: Node, acc = { files: 0, dirs: 0, bytes: 0 }) {
  if (node.isDir) {
    acc.dirs++;
    node.children?.forEach(c => collectStats(c, acc));
  } else {
    acc.files++;
    acc.bytes += node.size;
  }
  return acc;
}

function main() {
  const root = walk(REPO_ROOT);
  const stats = collectStats(root);
  const lines: string[] = [];
  lines.push("# CODEMAP");
  lines.push("");
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push(`**Root:** \`${relative(REPO_ROOT, REPO_ROOT) || "."}\``);
  lines.push("");
  lines.push(`- Files: **${stats.files}**`);
  lines.push(`- Dirs: **${stats.dirs}**`);
  lines.push(`- Size: **${humanSize(stats.bytes)}**`);
  lines.push("");
  lines.push("## Tree");
  lines.push("");
  lines.push(...renderTree(root));
  lines.push("");
  lines.push("> Notes are extracted from top file comments when available. Keep first JSDoc/line comment descriptive.");
  writeFileSync("CODEMAP.md", lines.join("\n"), "utf8");
  // eslint-disable-next-line no-console
  console.log("CODEMAP.md generated");
}

main();
