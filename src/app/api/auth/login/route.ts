import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  SESSION_COOKIE,
  checkPassword,
  isSecureRequest,
  resolveCaptain,
  sessionCookieOptions,
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
    // التوكن يُعاد في الجسم أيضًا — العميل يخزّنه في localStorage كخط
    // احتياطي حين تُحظر الكوكيز (iframe عبر نطاق مختلف / Safari ITP).
    const token = signToken(captain, days);

    const res = NextResponse.json({ ok: true, actor: captain, token });
    res.cookies.set(
      SESSION_COOKIE,
      token,
      sessionCookieOptions(isSecureRequest(req), remember ? days : undefined)
    );

    await logAction(captain, "LOGIN", null, remember ? "remember=true" : null);
    return res;
  } catch (e) {
    console.error("login error", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
