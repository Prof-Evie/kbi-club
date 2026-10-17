/** أدوات مشتركة للاشتراكات — تعمل على الخادم والعميل */

export type SubType = "general" | "private";
export type MemberStatus = "active" | "expiring" | "expired";

export interface MemberData {
  id: string;
  name: string;
  birth: string | null; // YYYY-MM-DD
  height: number | null;
  weight: number | null;
  phone: string;
  type: SubType;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  createdAt: string;
}

export const EXPIRING_SOON_DAYS = 5;

/* ---------- التواريخ (كلها بأسلوب التقويم المحلي) ---------- */

/** 'YYYY-MM-DD' -> تاريخ منتصف ليل محلي */
export function parseDay(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** تاريخ -> 'YYYY-MM-DD' */
export function fmtDay(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function todayDay(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, days: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
}

/* ---------- حالة الاشتراك ---------- */

/** الأيام المتبقية (يوم الانتهاء محسوب ضمنًا) */
export function remainingDays(end: string): number {
  const ms = parseDay(end).getTime() - todayDay().getTime();
  return Math.floor(ms / 86400000) + 1;
}

export function totalDaysBetween(start: string, end: string): number {
  const ms = parseDay(end).getTime() - parseDay(start).getTime();
  return Math.max(1, Math.floor(ms / 86400000) + 1);
}

export function memberStatus(end: string): MemberStatus {
  const r = remainingDays(end);
  if (r <= 0) return "expired";
  if (r <= EXPIRING_SOON_DAYS) return "expiring";
  return "active";
}

export function memberAge(birth: string | null): number | null {
  if (!birth) return null;
  const b = parseDay(birth);
  const t = new Date();
  let age = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) age--;
  return age;
}

/* ---------- التنسيق ---------- */

export function formatDate(s: string | null | undefined, lang: "ar" | "en"): string {
  if (!s) return "—";
  try {
    return new Intl.DateTimeFormat(lang === "ar" ? "ar-u-nu-latn" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(parseDay(s));
  } catch {
    return s;
  }
}

/** وقت نسبي بسيط */
export function relativeTime(iso: string, lang: "ar" | "en"): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return lang === "ar" ? "الآن" : "just now";
  if (min < 60)
    return lang === "ar" ? `منذ ${min} د` : `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return lang === "ar" ? `منذ ${hrs} س` : `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return lang === "ar" ? `منذ ${days} ي` : `${days}d ago`;
  return formatDate(iso.slice(0, 10), lang);
}

/* ---------- الهاتف ---------- */

/** يحوّل الرقم المحلي (07xxxxxxxxx) إلى صيغة دولية للعراق 964xxxxxxxxx */
export function intlPhone(phone: string): string {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = "964" + d.slice(1);
  return d;
}

export function waLink(phone: string, text: string): string {
  return `https://wa.me/${intlPhone(phone)}?text=${encodeURIComponent(text)}`;
}

export function telLink(phone: string): string {
  return `tel:+${intlPhone(phone)}`;
}

export function smsLink(phone: string): string {
  return `sms:+${intlPhone(phone)}`;
}

export function isValidPhone(phone: string): boolean {
  return phone.replace(/\D/g, "").length >= 7;
}
