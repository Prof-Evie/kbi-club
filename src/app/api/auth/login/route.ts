import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  SESSION_COOKIE,
  checkPassword,
  resolveCaptain,
  signToken,
} from "@/lib/auth";
import { logAction } from "@/lib/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const captain = resolveCaptain(String(body?.username ?? ""));
    const remember = Boolean(body?.remember);

    if (!captain || !checkPassword(String(body?.password ?? ""))) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }

    const days = remember ? 30 : 1;
    const res = NextResponse.json({ ok: true, actor: captain });
    res.cookies.set(SESSION_COOKIE, signToken(captain, days), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: false,
      ...(remember ? { maxAge: days * 24 * 60 * 60 } : {}),
    });

    await logAction(captain, "LOGIN", null, remember ? "remember=true" : null);
    return res;
  } catch (e) {
    console.error("login error", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
