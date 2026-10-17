import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getActor, unauthorized } from "@/lib/server";

/** GET /api/logs?limit=200 — آخر العمليات */
export async function GET(req: NextRequest) {
  const actor = getActor(req);
  if (!actor) return unauthorized();

  const limitParam = Number(req.nextUrl.searchParams.get("limit") ?? 200);
  const limit = Math.min(Math.max(1, Math.floor(limitParam) || 200), 500);

  const logs = await db.log.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(
    logs.map((l) => ({
      id: l.id,
      action: l.action,
      actor: l.actor,
      target: l.target,
      details: l.details,
      createdAt: l.createdAt.toISOString(),
    }))
  );
}
