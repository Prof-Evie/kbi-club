// ترقيع عميل Prisma بعد التوليد: تحميل query_compiler_bg.wasm من globalThis
// على Cloudflare Workers (عبر الغلاف worker.ts وقاعدة CompiledWasm) بدل
// قراءته من القرص — لأن workerd يحظر تجميع WASM وقت التشغيل ولا يملك نظام
// ملفات. محليًا (Node) يبقى سلوك القراءة من القرص كما هو.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const CLIENT_DIR = join(process.cwd(), "node_modules", ".prisma", "client");
const INDEX = join(CLIENT_DIR, "index.js");
const WASM = join(CLIENT_DIR, "query_compiler_bg.wasm");

if (!existsSync(INDEX) || !existsSync(WASM)) {
  console.log("patch-prisma-wasm: .prisma/client غير موجود — تخطٍ");
  process.exit(0);
}

const src = readFileSync(INDEX, "utf8");
if (src.includes("__KBI_QUERY_COMPILER_WASM__")) {
  console.log("patch-prisma-wasm: مُرقّع مسبقًا — تخطٍ");
  process.exit(0);
}

// كتلة getQueryCompilerWasmModule المولّدة (بغضّ النظر عن المسافات)
const RE = /getQueryCompilerWasmModule:\s*async\s*\(\)\s*=>\s*\{[^}]*?query_compiler_bg\.wasm[^}]*?\}/;

const m = src.match(RE);
if (!m || !m[0].includes("readFileSync")) {
  console.error("patch-prisma-wasm: لم أجد نمط القراءة المتوقع — تخطي دون تغيير");
  process.exit(0);
}

const NEW = `getQueryCompilerWasmModule: async () => {
        // على Cloudflare Workers يحقن الغلاف (worker.ts) الوحدة المجمّعة مسبقًا
        if (globalThis.__KBI_QUERY_COMPILER_WASM__) return globalThis.__KBI_QUERY_COMPILER_WASM__
        // محليًا (Node): القراءة من القرص كما ولّدها Prisma
        const queryCompilerWasmFilePath = require('path').join(config.dirname, 'query_compiler_bg.wasm')
        const queryCompilerWasmFileBytes = require('fs').readFileSync(queryCompilerWasmFilePath)
        return new WebAssembly.Module(queryCompilerWasmFileBytes)
      }`;

writeFileSync(INDEX, src.replace(m[0], NEW));
console.log("patch-prisma-wasm: تم ترقيع .prisma/client/index.js لدعم Workers");
