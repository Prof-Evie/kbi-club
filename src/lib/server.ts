import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SESSION_COOKIE, verifyToken } from "@/lib/auth";
import { MemberData, SubType, isValidPhone } from "@/lib/members";
import { Prisma } from "@prisma/client";

/** تحويل سجل Prisma إلى صيغة JSON موحدة */
export function serializeMember(m: Prisma.MemberGetPayload<object>): MemberData {
  return {
    id: m.id,
    name: m.name,
    birth: m.birth ? m.birth.toISOString().slice(0, 10) : null,
    height: m.height,
    weight: m.weight,
    phone: m.phone,
    type: (m.type === "private" ? "private" : "general") as SubType,
    start: m.start.toISOString().slice(0, 10),
    end: m.end.toISOString().slice(0, 10),
    createdAt: m.createdAt.toISOString(),
  };
}

/**
 * يستخرج هوية الكابتن: ترويسة Authorization: Bearer أولًا (تعمل حين
 * تُحظر الكوكيز داخل إطارات المعاينة) ثم كوكي الجلسة — أو null.
 */
export function getActor(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    const fromHeader = verifyToken(auth.slice(7).trim());
    if (fromHeader) return fromHeader;
  }
  return verifyToken(req.cookies.get(SESSION_COOKIE)?.value);
}

/** رد 401 موحد */
export function unauthorized(): NextResponse {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

function parseDateStr(v: unknown): Date | null {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const d = new Date(`${v}T00:00:00.000Z`);
  return isNaN(d.getTime()) ? null : d;
}

export interface ParsedMember {
  name: string;
  birth: Date | null;
  height: number | null;
  weight: number | null;
  phone: string;
  type: SubType;
  start: Date;
  end: Date;
}

type ParseResult =
  | { ok: true; data: ParsedMember }
  | { ok: false; error: "name" | "phone" | "date" | "dateOrder" };

/** التحقق من صحة بيانات المشترك القادمة من العميل */
export function parseMemberBody(body: unknown): ParseResult {
  const b = (body || {}) as Record<string, unknown>;
  const name = String(b.name ?? "").trim();
  const phone = String(b.phone ?? "").trim();
  const type: SubType = b.type === "private" ? "private" : "general";
  const start = parseDateStr(b.start);
  const end = parseDateStr(b.end);
  const birth = parseDateStr(b.birth);

  let height: number | null = null;
  if (b.height !== null && b.height !== undefined && String(b.height).trim() !== "") {
    const h = Number(b.height);
    if (!isNaN(h) && h > 0 && h < 300) height = h;
  }
  let weight: number | null = null;
  if (b.weight !== null && b.weight !== undefined && String(b.weight).trim() !== "") {
    const w = Number(b.weight);
    if (!isNaN(w) && w > 0 && w < 500) weight = w;
  }

  if (name.length < 2 || name.length > 80) return { ok: false, error: "name" };
  if (!isValidPhone(phone)) return { ok: false, error: "phone" };
  if (!start || !end) return { ok: false, error: "date" };
  if (end.getTime() < start.getTime()) return { ok: false, error: "dateOrder" };

  return { ok: true, data: { name, birth, height, weight, phone, type, start, end } };
}

export async function logAction(
  actor: string,
  action: string,
  target: string | null,
  details?: string | null
) {
  try {
    await db.log.create({ data: { actor, action, target, details: details ?? null } });
  } catch (e) {
    console.error("logAction failed", e);
  }
}
