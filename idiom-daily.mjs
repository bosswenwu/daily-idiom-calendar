// 每日成语 · 生成器（供任务看板定时任务 / 命令行使用）
// 用法：
//   node idiom-daily.mjs           # 打印今天的成语（人读文本）
//   node idiom-daily.mjs --json    # 打印今天的成语（JSON）
//   node idiom-daily.mjs +3        # 打印今天 +3 天（用于预览/测试）
//
// 若指定了日期，可用 --date=2026-09-09 精确指定某天。优先于进退天数。

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));

// 合并三个成语数据文件（与浏览器加载顺序一致）
let IDIOMS = [];
for (const f of ["data.js", "data2.js", "data3.js"]) {
  const code = readFileSync(join(__dir, f), "utf8");
  IDIOMS = new Function("IDIOMS", code + ";return IDIOMS;")(IDIOMS);
}

function dayOfYear(d) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86400000);
}
function idiomFor(date) {
  const n = dayOfYear(date);
  return IDIOMS[(n - 1) % IDIOMS.length];
}

// 解析参数
const args = process.argv.slice(2);
let offset = 0;
let explicit = null;
for (const a of args) {
  if (a.startsWith("--date=")) explicit = a.slice(7);
  else if (a === "--json") {} // 标记，忽略
  else if (/^[+-]\d+$/.test(a)) offset = parseInt(a, 10);
}
const base = explicit ? new Date(explicit) : new Date();
const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
d.setDate(d.getDate() + offset);

const idiom = idiomFor(d);
const MONTHS = ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];

const txt = [
  `日期：${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 ${["星期日","星期一","星期二","星期三","星期四","星期五","星期六"][d.getDay()]}`,
  `成语：${idiom.idiom}　${idiom.pinyin}`,
  `释义：${idiom.meaningCn}`,
  `　　　${idiom.meaningEn}`,
  `例句：${idiom.exampleCn}`,
  `　　　${idiom.examplePy}`,
  `　　　${idiom.exampleEn}`,
].join("\n");

if (args.includes("--json")) {
  console.log(JSON.stringify({
    date: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`,
    weekday: ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"][d.getDay()],
    idiom: idiom.idiom, pinyin: idiom.pinyin,
    chars: idiom.chars, meaningCn: idiom.meaningCn, meaningEn: idiom.meaningEn,
    exampleCn: idiom.exampleCn, examplePy: idiom.examplePy, exampleEn: idiom.exampleEn,
    tone: idiom.tone, total: IDIOMS.length,
  }, null, 2));
} else {
  console.log(txt);
}
