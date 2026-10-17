// تصدير بيانات SQLite الحالية إلى d1/data.sql لاستيرادها في قاعدة D1
// ملاحظة مهمة: محوّل PrismaD1 يكتب التواريخ كسلاسل ISO (+00:00) ويستنتج
// نوع العمود من القيمة نفسها — لذا نحوّل الأعداد المخزنة (epoch ms) إلى
// سلاسل ISO حتى تُقرأ كـ DateTime بشكل صحيح وتتوحّد مع الصفوف الجديدة
import { DatabaseSync } from "node:sqlite";
import { writeFileSync } from "node:fs";

const DB_PATH = "/home/z/my-project/db/custom.db";
const OUT = "/home/z/my-project/d1/data.sql";

const db = new DatabaseSync(DB_PATH, { readOnly: true });

// أعمدة التاريخ في كل جدول — تُحوَّل من epoch ms إلى ISO
const DATE_COLUMNS = {
  Member: new Set(["birth", "start", "end", "createdAt", "updatedAt"]),
  Log: new Set(["createdAt"]),
};

function toIsoIfDate(table, col, v) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number" && DATE_COLUMNS[table]?.has(col)) {
    return `'${new Date(v).toISOString().replace("Z", "+00:00")}'`;
  }
  if (typeof v === "number") return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
}

function dumpTable(table, cols) {
  const rows = db.prepare(`SELECT ${cols.map((c) => `"${c}"`).join(", ")} FROM "${table}" ORDER BY rowid`).all();
  return rows.map((r) => {
    const vals = cols.map((c) => toIsoIfDate(table, c, r[c])).join(", ");
    return `INSERT INTO \`${table}\` (${cols.map((c) => `"${c}"`).join(", ")}) VALUES (${vals});`;
  });
}

const memberCols = ["id", "name", "birth", "height", "weight", "phone", "type", "start", "end", "createdAt", "updatedAt"];
const logCols = ["id", "action", "actor", "target", "details", "createdAt"];

const memberLines = dumpTable("Member", memberCols);
const logLines = dumpTable("Log", logCols);

const header = `-- بيانات KBI الحالية (المشتركون + سجل العمليات)
-- الاستيراد: npm run cf:d1-data-remote  (أو cf:d1-data-local للمعاينة المحلية)
-- تُنفَّذ بعد d1/schema.sql فقط
-- التواريخ بصيغة ISO +00:00 لتتوافق مع محوّل PrismaD1

`;

writeFileSync(OUT, header + memberLines.join("\n") + "\n\n" + logLines.join("\n") + "\n");

console.log(`Members: ${memberLines.length} rows, Logs: ${logLines.length} rows -> ${OUT}`);
