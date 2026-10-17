import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getActor,
  logAction,
  parseMemberBody,
  serializeMember,
  unauthorized,
} from "@/lib/server";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/members/[id] — بيانات مشترك واحد */
export async function GET(req: NextRequest, ctx: Ctx) {
  const actor = getActor(req);
  if (!actor) return unauthorized();

  const { id } = await ctx.params;
  const member = await db.member.findUnique({ where: { id } });
  if (!member) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json(serializeMember(member));
}

/** PATCH /api/members/[id] — تعديل بيانات المشترك */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const actor = getActor(req);
  if (!actor) return unauthorized();

  const { id } = await ctx.params;
  const existing = await db.member.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = parseMemberBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const member = await db.member.update({ where: { id }, data: parsed.data });
  await logAction(actor, "UPDATE", member.name);

  return NextResponse.json(serializeMember(member));
}

/** DELETE /api/members/[id] — حذف مشترك */
export async function DELETE(req: NextRequest, ctx: Ctx) {
  const actor = getActor(req);
  if (!actor) return unauthorized();

  const { id } = await ctx.params;
  const existing = await db.member.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await db.member.delete({ where: { id } });
  await logAction(actor, "DELETE", existing.name);

  return NextResponse.json({ ok: true });
}
