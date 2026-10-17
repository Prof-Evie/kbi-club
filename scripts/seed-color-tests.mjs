import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const D = (base, off) => { const x = new Date(2026, 9, 17); x.setDate(x.getDate() + off); return x; };
const tests = [
  { name: "تجربة ألوان ذهبي",   type: "general",  start: D(0,-9),  end: D(0,+19) }, // 20/29 ≈ 69% ذهبي
  { name: "تجربة ألوان برتقالي", type: "private",  start: D(0,-15), end: D(0,+14) }, // 15/30 = 50% برتقالي
  { name: "تجربة ألوان أحمر",    type: "general",  start: D(0,-28), end: D(0,+1)  }, // 2/30 ≈ 7% أحمر
  { name: "تجربة ألوان منتهي",   type: "private",  start: new Date(2026,8,1), end: new Date(2026,9,10) }, // منتهي
  { name: "تجربة ألوان أرضية",   type: "general",  start: D(0,-2),  end: D(0,+4)  }, // 5/7 = 71% لكن ≤5 أيام -> برتقالي
];
const created = [];
for (const t of tests) {
  const m = await p.member.create({ data: { ...t, phone: "0770000000" + (created.length + 1) } });
  created.push(m.id);
  console.log("created:", m.id, m.name);
}
await p.$disconnect();
