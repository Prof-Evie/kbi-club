import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const D = (m, d) => new Date(2026, m - 1, d);
// الشريط = نسبة الوقت المتبقي: ممتلئ عند البداية وينقص مع الوقت
const tests = [
  { name: "تجربة — 30 يوم كامل", type: "general", start: D(10,17), end: D(11,15) }, // ≈100% ذهبي ممتلئ بالكامل
  { name: "تجربة — نصف المدة",   type: "private", start: D(10,2),  end: D(10,31) }, // ≈48% في المنتصف برتقالي
  { name: "تجربة — آخر أيام",    type: "general", start: D(9,19),  end: D(10,20) }, // ≈11% شريحة حمراء صغيرة
];
let i = 0;
for (const t of tests) {
  const m = await p.member.create({ data: { ...t, phone: "0770000001" + i++ } });
  console.log("created:", m.name, m.start.toISOString().slice(0,10), "->", m.end.toISOString().slice(0,10));
}
await p.$disconnect();
