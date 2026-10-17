/// <reference types="@cloudflare/workers-types" />

/**
 * غلاف Worker لنادي KBI:
 * 1) يستورد محرك Prisma WASM كوحدة مجمّعة مسبقًا (CompiledWasm) —
 *    workerd يحظر تجميع WASM وقت التشغيل، فلا بد من الاستيراد البنيوي.
 * 2) يضعه في globalThis ليلتقطه ترقيع عميل Prisma (scripts/patch-prisma-wasm.mjs).
 * 3) يعيد تصدير worker.js المولّد من OpenNext دون أي تغيير.
 */
// @ts-expect-error — يوفّره wrangler عبر قاعدة CompiledWasm في wrangler.jsonc
import queryCompilerWasm from "./node_modules/.prisma/client/query_compiler_bg.wasm";

(globalThis as Record<string, unknown>).__KBI_QUERY_COMPILER_WASM__ = queryCompilerWasm;

export * from "./.open-next/worker.js";
export { default } from "./.open-next/worker.js";
