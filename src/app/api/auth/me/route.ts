import { NextRequest, NextResponse } from "next/server";
import { getActor, unauthorized } from "@/lib/server";

export async function GET(req: NextRequest) {
  const actor = getActor(req);
  if (!actor) return unauthorized();
  return NextResponse.json({ actor });
}
