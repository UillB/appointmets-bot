# scripts/snapshot-all.ts

```ts
#!/usr/bin/env ts-node

import fg from "fast-glob";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "docs", "code");
const INDEX_MD = path.join(ROOT, "ALL_CODE_INDEX.md");

const include = [
  "package.json",
  "tsconfig.json",
  "README.md",
  "prisma/**/*.prisma",
  "scripts/**/*.ts",
  "src/**/*.{ts,js,json}",
  ".github/workflows/**/*.yml"
];

const exclude = [
  "**/node_modules/**",
  "**/.git/**",
  "**/.DS_Store",
  "**/*.log",
  "**/*.db",
  "**/.env*"
];

function fence(p: string) {
  const ext = path.extname(p).slice(1);
  return ["ts", "js", "json", "yml", "prisma", "md"].includes(ext) ? ext : "";
}

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

(async () => {
  const files = await fg(include, { ignore: exclude, dot: true });
  files.sort();

  if (fs.existsSync(OUT_DIR)) fs.rmSync(OUT_DIR, { recursive: true, force: true });
  ensureDir(OUT_DIR);

  for (const rel of files) {
    const abs = path.join(ROOT, rel);
    const out = path.join(OUT_DIR, `${rel}.md`);
    ensureDir(path.dirname(out));
    const content = fs.readFileSync(abs, "utf8");
    fs.writeFileSync(out, `# ${rel}\n\n\`\`\`${fence(rel)}\n${content}\n\`\`\`\n`);
  }

  const index = files.map(f => `- [${f}](docs/code/${f}.md)`).join("\n");
  fs.writeFileSync(INDEX_MD, `# ALL_CODE_INDEX\n\n${index}\n`);
  console.log(`✅ Snapshot done: ${files.length} files → ${OUT_DIR}`);
})();

```
