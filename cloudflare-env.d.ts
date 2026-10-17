/// <reference types="@cloudflare/workers-types" />

/**
 * أنواع ربط Cloudflare المتاحة للخادم.
 * DB = قاعدة بيانات D1 المعرّفة في wrangler.jsonc
 */
interface CloudflareEnv {
  DB: D1Database;
}

// استيراد وحدات WASM المجمّعة مسبقًا (قاعدة CompiledWasm في wrangler.jsonc)
declare module "*.wasm" {
  const wasmModule: WebAssembly.Module;
  export default wasmModule;
}
