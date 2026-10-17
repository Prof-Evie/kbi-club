/**
 * مساعد العميل الموحّد: يخزّن توكن الجلسة في localStorage ويرفقه
 * تلقائيًا مع كل طلبات الـ API عبر ترويسة Authorization.
 *
 * لماذا؟ بعض بيئات المعاينة تُعرض داخل إطار iframe عبر نطاق مختلف،
 * وهناك تُحظر كوكيز SameSite=Lax — بل تُحظر كل الكوكيز في Safari (ITP).
 * التوكن في localStorage يعمل دائمًا، والكوكي يبقى وسيلة إضافية.
 */

const TOKEN_KEY = "kbi_session_token";

export function getToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function storeToken(token: string): void {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
}

export function clearToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/** fetch موحّد: يرفق التوكن تلقائيًا ويعطّل التخزين المؤقت */
export async function api(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers, cache: "no-store" });
}
