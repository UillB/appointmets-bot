#!/usr/bin/env ts-node

import fg from "fast-glob";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const includeGlobs = [
  "package.json",
  "tsconfig.json",
  "README.md",
  "prisma/schema.prisma",
  "src/**/*.ts",
  "src/**/*.json",
  "scripts/**/*.ts"
];
const excludeGlobs = [
  "**/node_modules/**",
  "**/*.d.ts",
  "**/*.map",
  "**/dist/**",
  "**/.DS_Store"
];

// полезные “якоря” для понимания проекта
const IMPORTANT_HINTS = [
  { title: "API routes (Express)", pattern: "src/api/routes/**/*.ts" },
  { title: "Telegraf bot handlers", pattern: "src/bot/handlers/**/*.ts" },
  { title: "Bot middlewares (i18n, etc.)", pattern: "src/bot/mw/**/*.ts" },
  { title: "i18n dictionaries", pattern: "src/i18n/lang/**/*.{json,ts}" },
  { title: "Lib (env, prisma, server)", pattern: "src/lib/**/*.ts" },
  { title: "Prisma schema", pattern: "prisma/schema.prisma" },
];

function codeFence(p: string, content: string) {
  const ext = path.extname(p).replace(".", "");
  const lang = ["ts","js","json","prisma","md","yml","yaml"].includes(ext) ? ext : "";
  const trimmed = content.length > 2000 ? content.slice(0,2000) + "\n/* …truncated… */\n" : content;
  return `\n<details><summary><code>${p}</code></summary>\n\n\`\`\`${lang}\n${trimmed}\n\`\`\`\n</details>\n`;
}

(async () => {
  const files = await fg(includeGlobs, { ignore: excludeGlobs, dot: false });
  files.sort();

  // 1) Дерево файлов (коротко)
  const treeLines: string[] = [];
  for (const f of files) treeLines.push(`- ${f}`);

  // 2) Секции по “якорям”
  const sections: string[] = [];
  for (const section of IMPORTANT_HINTS) {
    const matches = await fg(section.pattern, { ignore: excludeGlobs });
    if (!matches.length) continue;
    sections.push(`\n### ${section.title}\n`);
    for (const m of matches.sort()) {
      sections.push(`- \`${m}\``);
    }
  }

  // 3) Важные файлы с инлайном содержимого
  const inlineFiles = [
    "package.json",
    "tsconfig.json",
    "src/lib/server.ts",
    "src/api/index.ts",
    "src/bot/index.ts",
    "prisma/schema.prisma"
  ].filter(p => fs.existsSync(p));

  let inlineDump = "";
  for (const p of inlineFiles) {
    const c = fs.readFileSync(p, "utf8");
    inlineDump += codeFence(p, c);
  }

  const md = `# CODEMAP (auto-generated)

Эта карта создаётся автоматически при каждом push. Она нужна, чтобы ассистент мог **быстро понять весь проект** без расспросов.

- Ветка: \`${process.env.GITHUB_REF || "local"}\`
- Сгенерировано: ${new Date().toISOString()}

## Обзор структуры (файловое дерево)
${treeLines.map(l=>l).join("\n")}

## Навигация по ключевым узлам
${sections.join("\n")}

## Ключевые файлы (содержимое, укорочено)
${inlineDump}

> Для больших файлов показаны первые ~2000 символов.
`;

  fs.writeFileSync(path.join(ROOT, "CODEMAP.md"), md, "utf8");
  console.log("CODEMAP.md generated");
})();
