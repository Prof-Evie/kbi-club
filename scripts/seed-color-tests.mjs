import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const D = (m, d) => new Date(2026, m - 1, d);
// الشريط = نسبة الوقت المتبقي: ممتلئ عند البداية وينقص مع الوقت
const tests = [
  { name: "تجربة ممتلئ",  type: "general", start: D(10,17), end: D(11,15) }, // 30 يوم كاملة ≈ 100% ذهبي ممتلئ
  { name: "تجربة نصف",    type: "private", start: D(10,2),  end: D(10,31) }, // بقي 15/30 ≈ 50% في المنتصف برتقالي
  { name: "تجربة متدرج",  type: "general", start: D(9,27),  end: D(10,26) }, // بقي ~10/30 ≈ 33% بين البرتقالي والأحمر
  { name: "تجربة أحمر",   type: "private", start: D(9,19),  end: D(10,20) }, // بقي ~4/30 ≈ 13% أحمر
  { name: "تجربة منتهي",  type: "general", start: D(9,1),   end: D(10,10) }, // منتهي — تعبئة حمراء كاملة خافتة
];
let i = 0;
for (const t of tests) {
  const m = await p.member.create({ data: { ...t, phone: "0770000001" + i++ } });
  console.log("created:", m.name, m.start.toISOString().slice(0,10), "->", m.end.toISOString().slice(0,10));
}
await p.$disconnect();
