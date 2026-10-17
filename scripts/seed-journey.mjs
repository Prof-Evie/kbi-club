import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const D = (m, d) => new Date(2026, m - 1, d);
const tests = [
  { name: "رحلة ذهبي",   type: "general", start: D(10,17), end: D(10,18) }, // نحو 21% ذهبي
  { name: "رحلة برتقالي", type: "private", start: D(10,14), end: D(10,19) }, // نحو 57% برتقالي
  { name: "رحلة أحمر",    type: "general", start: D(10,15), end: D(10,17) }, // نحو 80% أحمر
  { name: "رحلة منتهي",   type: "private", start: D(10,1),  end: D(10,16) }, // 100% أحمر كامل
];
let i = 0;
for (const t of tests) {
  const m = await p.member.create({ data: { ...t, phone: "0770000002" + i++ } });
  console.log("created:", m.name);
}
await p.$disconnect();
