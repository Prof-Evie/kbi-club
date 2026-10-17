import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const D = (m, d) => new Date(2026, m - 1, d);
const tests = [
  { name: "تجربة جديد",    type: "general", start: D(10,17), end: D(11,15) }, // اليوم الأول: فارغ تقريبًا ذهبي
  { name: "تجربة نصف",     type: "private", start: D(10,2),  end: D(10,31) }, // استهلك 15/30 = 50% برتقالي نصفين
  { name: "تجربة برتقالي", type: "general", start: D(9,29),  end: D(10,28) }, // استهلك 18/30 = 60% برتقالي
  { name: "تجربة أحمر",    type: "private", start: D(9,21),  end: D(10,20) }, // استهلك 26/30 = 87% أحمر
  { name: "تجربة منتهي",   type: "general", start: D(9,1),   end: D(10,10) }, // منتهي أحمر كامل
];
let i = 0;
for (const t of tests) {
  const m = await p.member.create({ data: { ...t, phone: "0770000001" + i++ } });
  console.log("created:", m.name, m.start.toISOString().slice(0,10), "->", m.end.toISOString().slice(0,10));
}
await p.$disconnect();
