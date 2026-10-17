import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getActor,
  logAction,
  parseMemberBody,
  serializeMember,
  unauthorized,
} from "@/lib/server";

/** GET /api/members — قائمة كل المشتركين */
export async function GET(req: NextRequest) {
  const actor = getActor(req);
  if (!actor) return unauthorized();

  const members = await db.member.findMany({
    orderBy: [{ name: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(members.map(serializeMember));
}

/** POST /api/members — إضافة مشترك جديد */
export async function POST(req: NextRequest) {
  const actor = getActor(req);
  if (!actor) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = parseMemberBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const member = await db.member.create({ data: parsed.data });
  const typeLabel = parsed.data.type === "general" ? "عام" : "خاص";
  const days = Math.round(
    (parsed.data.end.getTime() - parsed.data.start.getTime()) / 86400000
  );
  await logAction(actor, "CREATE", member.name, `${typeLabel} — ${days} يوم`);

  return NextResponse.json(serializeMember(member), { status: 201 });
}

/** DELETE /api/members?ids=a,b,c — حذف مجموعة مشتركين */
export async function DELETE(req: NextRequest) {
  const actor = getActor(req);
  if (!actor) return unauthorized();

  const idsParam = req.nextUrl.searchParams.get("ids") ?? "";
  const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
  if (ids.length === 0) {
    return NextResponse.json({ error: "no_ids" }, { status: 400 });
  }

  const found = await db.member.findMany({ where: { id: { in: ids } } });
  const result = await db.member.deleteMany({ where: { id: { in: ids } } });
  for (const m of found) {
    await logAction(actor, "DELETE", m.name, `نوع: ${m.type === "general" ? "عام" : "خاص"}`);
  }

  return NextResponse.json({ ok: true, deleted: result.count });
}
