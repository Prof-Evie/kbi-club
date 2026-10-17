import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, isSecureRequest, sessionCookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  // نفس سمات كوكي الدخول حتى يُحذف فعليًا من المتصفح
  res.cookies.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(isSecureRequest(req)),
    maxAge: 0,
  });
  return res;
}
