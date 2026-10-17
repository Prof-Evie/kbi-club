import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getActor, logAction, serializeMember, unauthorized } from "@/lib/server";

type Ctx = { params: Promise<{ id: string }> };

function utcToday(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

/** POST /api/members/[id]/extend — تمديد الاشتراك بعدد أيام */
export async function POST(req: NextRequest, ctx: Ctx) {
  const actor = getActor(req);
  if (!actor) return unauthorized();

  const { id } = await ctx.params;
  const member = await db.member.findUnique({ where: { id } });
  if (!member) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const days = Math.floor(Number(body?.days));
  if (!Number.isFinite(days) || days < 1 || days > 3650) {
    return NextResponse.json({ error: "bad_days" }, { status: 400 });
  }

  // التمديد يُحسب من نهاية الاشتراك الحالية إن كان نشطًا، وإلا من اليوم
  const base = Math.max(member.end.getTime(), utcToday().getTime());
  const newEnd = new Date(base + days * 86400000);

  const updated = await db.member.update({
    where: { id },
    data: { end: newEnd },
  });

  await logAction(
    actor,
    "EXTEND",
    member.name,
    `+${days} يوم ← ${newEnd.toISOString().slice(0, 10)}`
  );

  return NextResponse.json(serializeMember(updated));
}
