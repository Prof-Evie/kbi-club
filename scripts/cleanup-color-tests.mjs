import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const r = await p.member.deleteMany({ where: { name: { startsWith: "تجربة" } } });
console.log("deleted test members:", r.count);
const left = await p.member.findMany({ select: { name: true } });
console.log("remaining members:", JSON.stringify(left));
await p.$disconnect();
