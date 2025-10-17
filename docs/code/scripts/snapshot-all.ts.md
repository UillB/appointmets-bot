# scripts/snapshot-all.ts

```ts
#!/usr/bin/env ts-node

import fg from "fast-glob";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "docs", "code");
const INDEX_MD = path.join(ROOT, "ALL_CODE_INDEX.md");

// Всё, что хотим включить (подстрой при желании)
const include = [
  "package.json",
  "tsconfig.json",
  "README.md",
  "prisma/**/*.prisma",
  "scripts/**/*.ts",
  "src/**/*.{ts,js,json}",
  ".github/workflows/**/*.yml"
];

// Файлы/папки, которые нельзя публиковать
const exclude = [
  "**/node_modules/**",
  "**/.git/**",
  "**/.github/ISSUE_TEMPLATE/**",
  "**/.DS_Store",
  "**/*.log",
  "**/*.db",
  "**/*.db-journal",
  "**/.env",
  "**/.env.*",
];

function fenceLang(p: string) {
  const ext = path.extname(p).slice(1);
  if (["ts","js","json","yml","yaml","md","prisma"].includes(ext)) return ext;
  return ""; // без указания
}

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function asOutMdPath(srcPath: string) {
  // docs/code/src/bot/index.ts.md
  return path.join(OUT_DIR, `${srcPath}.md`);
}

function toLink(p: string) {
  return `docs/code/${p}.md`.replace(/\\/g, "/");
}

async function main() {
  const files = await fg(include, { ignore: exclude, dot: true, onlyFiles: true });
  files.sort();

  // очистим выходную папку
  if (fs.existsSync(OUT_DIR)) fs.rmSync(OUT_DIR, { recursive: true, force: true });
  ensureDir(OUT_DIR);

  // сгенерируем файлы-карточки
  for (const rel of files) {
    const abs = path.join(ROOT, rel);
    const content = fs.readFileSync(abs, "utf8");
    const outFile = asOutMdPath(rel);
    ensureDir(path.dirname(outFile));

    const code = [
      `# ${rel}`,
      "",
      "```" + fenceLang(rel),
      content,
      "```",
      ""
    ].join("\n");

    fs.writeFileSync(outFile, code, "utf8");
  }

  // индекс
  const indexLines = [
    "# ALL_CODE_INDEX",
    "",
    "> Автогенерация при каждом push. Каждый пункт ведёт на Markdown с полным содержимым файла.",
    "",
  ];

  for (const rel of files) {
    indexLines.push(`- [${rel}](${toLink(rel)})`);
  }

  fs.writeFileSync(INDEX_MD, indexLines.join("\n") + "\n", "utf8");
  console.log(`Snapshot done: ${files.length} files → docs/code + ALL_CODE_INDEX.md`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

```
