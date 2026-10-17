import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/** وضع قاعدة البيانات الفعلي (للتشخيص فقط) */
export let dbMode: "d1" | "sqlite" = "sqlite";

/**
 * العميل يعمل بوضعين:
 *
 * 1) على Cloudflare Workers (النشر): سياق OpenNext متاح دائمًا في النطاق
 *    العام داخل Worker → قاعدة بيانات D1 عبر محوّل PrismaD1.
 *
 * 2) محليًا (next dev / next start): SQLite كملف عبر محوّل
 *    better-sqlite3 — نفس ملف db/custom.db وبياناته بلا أي تغيير.
 *    timestampFormat = unixepoch-ms لأن الملف القائم يخزّن التواريخ كأعداد.
 */
function createPrismaClient(): PrismaClient {
  // داخل Worker ينجح هذا الاستدعاء دائمًا؛ محليًا يرمي خطأ فيلتقطه catch
  try {
    const { env } = getCloudflareContext();
    if (env.DB) {
      dbMode = "d1";
      return new PrismaClient({
        adapter: new PrismaD1(env.DB),
      });
    }
  } catch {
    // ليس داخل Cloudflare — نكمل على SQLite المحلي
  }

  dbMode = "sqlite";

  // استيراد وقت التشغيل فقط حتى لا يحاول حزم وحدة better-sqlite3 الأصلية
  // داخل حزمة الـWorker (وهي غير قابلة للتنفيذ هناك أصلًا)
  // eslint-disable-next-line @typescript-eslint/no-eval
  const nodeRequire = eval("require") as NodeRequire;
  const { PrismaBetterSQLite3 } = nodeRequire("@prisma/adapter-better-sqlite3");

  // DATABASE_URL في .env نسبي لمجلد المخطط (prisma/) — نحوّله لمسار فعلي
  const raw = (process.env.DATABASE_URL || "file:../db/custom.db").replace(/^file:/, "");
  const dbPath = raw.startsWith("/") ? raw : `${process.cwd()}/prisma/${raw}`;

  return new PrismaClient({
    adapter: new PrismaBetterSQLite3(
      { url: dbPath },
      { timestampFormat: "unixepoch-ms" }
    ),
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
