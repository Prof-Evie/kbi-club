// اختبار Prisma بمحرك queryCompiler (WASM) + محوّل better-sqlite3
// على نسخة من قاعدة البيانات الحقيقية — بدون لمس الأصل
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSQLite3 } = require("@prisma/adapter-better-sqlite3");
const fs = require("fs");

fs.copyFileSync("/home/z/my-project/db/custom.db", "/tmp/kbi-test-copy.db");

(async () => {
  const db = new PrismaClient({
    adapter: new PrismaBetterSQLite3(
      { url: "/tmp/kbi-test-copy.db" },
      { timestampFormat: "unixepoch-ms" }
    ),
  });

  console.log("== READ existing (epoch-ms ints) ==");
  const members = await db.member.findMany({ orderBy: { name: "asc" } });
  for (const m of members) {
    console.log(
      ` ${m.name} | start=${m.start.toISOString()} end=${m.end.toISOString()} | h=${m.height} w=${m.weight} birth=${m.birth ? m.birth.toISOString().slice(0, 10) : null}`
    );
  }

  console.log("== CREATE ==");
  const created = await db.member.create({
    data: {
      name: "اختبار محرك",
      phone: "07700000009",
      type: "general",
      start: new Date("2026-10-01T00:00:00.000Z"),
      end: new Date("2026-10-31T00:00:00.000Z"),
      height: 180,
      weight: 75,
    },
  });
  console.log(" created:", created.name, created.start.toISOString(), created.end.toISOString());

  console.log("== EXTEND ==");
  const extended = await db.member.update({
    where: { id: created.id },
    data: { end: new Date("2026-11-30T00:00:00.000Z") },
  });
  console.log(" new end:", extended.end.toISOString());

  console.log("== RAW STORAGE FORMAT ==");
  const Database = require("better-sqlite3");
  const rawDb = new Database("/tmp/kbi-test-copy.db", { readonly: true });
  const row = rawDb.prepare("SELECT start, end FROM Member WHERE id = ?").get(created.id);
  console.log(" stored start:", JSON.stringify(row.start), "typeof:", typeof row.start);

  console.log("== DELETE ==");
  await db.member.delete({ where: { id: created.id } });
  const after = await db.member.count();
  console.log(" count after delete:", after);

  console.log("== LOG create ==");
  const log = await db.log.create({ data: { action: "TEST", actor: "BKR", target: null, details: null } });
  console.log(" log id:", log.id ? "ok" : "fail");
  await db.log.delete({ where: { id: log.id } });

  await db.$disconnect();
  fs.unlinkSync("/tmp/kbi-test-copy.db");
  console.log("ALL LOCAL ADAPTER TESTS PASSED");
})().catch((e) => {
  console.error("FAILED:", e.message.slice(0, 500));
  process.exit(1);
});
