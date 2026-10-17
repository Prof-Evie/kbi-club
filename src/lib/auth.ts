import crypto from "crypto";

export const SESSION_COOKIE = "kbi_session";

// كلمة السر الموحدة للكابتنين
const ADMIN_PASSWORD = "a7f3c9e21b8d46f0c5a2e9176d4b803f";

const SECRET =
  process.env.AUTH_SECRET || "kbi-boxing-club-signing-secret-2026";

export const CAPTAINS: Record<string, { ar: string; en: string }> = {
  BKR: { ar: "الكابتن بكر", en: "Capt. Bakr" },
  Jihad: { ar: "الكابتن جهاد", en: "Capt. Jihad" },
};

const PASSWORD_HASH = crypto
  .createHash("sha256")
  .update(ADMIN_PASSWORD)
  .digest();

export function checkPassword(pw: string): boolean {
  const h = crypto.createHash("sha256").update(pw).digest();
  return (
    h.length === PASSWORD_HASH.length && crypto.timingSafeEqual(h, PASSWORD_HASH)
  );
}

/** يحوّل مُدخل المستخدم إلى اسم الحساب الرسمي: BKR أو Jihad */
export function resolveCaptain(input: string): string | null {
  const n = String(input || "").trim().toLowerCase();
  if (n === "bkr") return "BKR";
  if (n === "jihad") return "Jihad";
  return null;
}

function hmac(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function signToken(username: string, days: number): string {
  const payload = Buffer.from(
    JSON.stringify({ u: username, exp: Date.now() + days * 86400000 })
  ).toString("base64url");
  return `${payload}.${hmac(payload)}`;
}

export function verifyToken(
  token: string | undefined | null
): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = hmac(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof data.u !== "string" || typeof data.exp !== "number") return null;
    if (Date.now() > data.exp) return null;
    return data.u;
  } catch {
    return null;
  }
}
