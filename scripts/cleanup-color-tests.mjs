import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const r = await p.member.deleteMany({ where: { name: { startsWith: "تجربة ألوان" } } });
console.log("deleted test members:", r.count);
const left = await p.member.findMany({ select: { name: true, start: true, end: true } });
console.log("remaining members:", JSON.stringify(left));
console.log("logs:", await p.log.count());
await p.$disconnect();
