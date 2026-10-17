import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const members = await p.member.findMany({ orderBy: { createdAt: "asc" } });
const fmt = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v).slice(0, 10));
const today = new Date();
const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
for (const m of members) {
  const s = fmt(m.start), e = fmt(m.end);
  const [sy, sm, sd] = s.split("-").map(Number);
  const [ey, em, ed] = e.split("-").map(Number);
  const rem = Math.floor((new Date(ey, em-1, ed).getTime() - t0.getTime()) / 86400000) + 1;
  const tot = Math.floor((new Date(ey, em-1, ed).getTime() - new Date(sy, sm-1, sd).getTime()) / 86400000) + 1;
  console.log(`${m.id} | ${m.name} | ${m.type} | ${s}..${e} | rem=${rem}/${tot} (${Math.round(rem/tot*100)}%)`);
}
console.log("logs:", await p.log.count());
await p.$disconnect();
