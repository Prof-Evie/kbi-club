"use client";

import { FormEvent, useState } from "react";
import { useLang } from "@/components/lang";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CAPTAIN_DISPLAY, DictKey } from "@/lib/i18n";
import {
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Lock,
  LogIn,
  ShieldAlert,
  User,
} from "lucide-react";

export default function LoginView({
  onSuccess,
}: {
  onSuccess: (captain: string) => void;
}) {
  const { t, lang, toggleLang } = useLang();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(false);
    setLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, remember }),
      });
      if (r.ok) {
        const data = await r.json();
        onSuccess(String(data.actor));
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-dvh flex items-center justify-center px-4 py-8 overflow-hidden">
      {/* خلفية الشعار */}
      <img
        src="/kbi-mark.png"
        alt=""
        aria-hidden
        className="pointer-events-none select-none fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(92vw,640px)] opacity-[0.05]"
      />

      {/* زر اللغة */}
      <button
        type="button"
        onClick={toggleLang}
        className="fixed top-4 end-4 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3.5 h-9 text-xs font-bold text-foreground/90 hover:bg-white/10 hover:border-gold/40 transition-colors cursor-pointer"
        aria-label="Switch language"
      >
        <Globe className="size-3.5 text-gold" />
        {lang === "ar" ? "EN" : "عربي"}
      </button>

      <div className="relative z-10 w-full max-w-[420px]">
        {/* البطاقة */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] p-7 sm:p-9">
          {/* الشعار */}
          <div className="flex flex-col items-center text-center gap-3 mb-7">
            <img
              src="/kbi-logo-sm.png"
              alt={t("clubName")}
              className="h-20 w-auto drop-shadow-[0_0_24px_rgba(255,200,33,0.35)]"
            />
            <div>
              <h1 className="text-lg font-black text-foreground leading-tight">
                {t("adminPanel")}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t("loginSubtitle")}
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4" noValidate>
            {/* اسم المستخدم */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="text-xs font-bold text-foreground/80"
              >
                {t("username")}
              </label>
              <div className="relative">
                <User className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="username"
                  name="username"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  dir="ltr"
                  className="ps-9 h-11 bg-white/[0.05] border-white/10 rounded-xl text-start"
                  placeholder={t("usernamePh")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* كلمة السر */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-bold text-foreground/80"
              >
                {t("password")}
              </label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  dir="ltr"
                  className="ps-9 pe-10 h-11 bg-white/[0.05] border-white/10 rounded-xl text-start"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute end-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  aria-label={
                    showPw ? t("hidePassword" as DictKey) : t("showPassword" as DictKey)
                  }
                >
                  {showPw ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {/* تذكرني */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
              <Checkbox
                checked={remember}
                onCheckedChange={(v) => setRemember(v === true)}
                className="border-white/25 data-[state=checked]:bg-gold data-[state=checked]:border-gold data-[state=checked]:text-black"
              />
              <span className="text-sm font-semibold text-foreground/85">
                {t("remember")}
              </span>
            </label>

            {/* الخطأ */}
            {error && (
              <div
                className="animate-shake flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3.5 py-2.5 text-sm font-bold text-red-400"
                role="alert"
              >
                <ShieldAlert className="size-4 shrink-0" />
                {t("invalidCreds")}
              </div>
            )}

            {/* زر الدخول */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-b from-[#ffd44d] to-[#f0b400] text-black font-black text-[15px] hover:from-gold-soft hover:to-gold gold-glow transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("loggingIn")}
                </>
              ) : (
                <>
                  <LogIn className="size-4" />
                  {t("login")}
                </>
              )}
            </Button>
          </form>
        </div>

        {/* توقيع الكابتنين */}
        <p className="mt-5 text-center text-xs text-muted-foreground/70 font-semibold">
          {lang === "ar"
            ? `${CAPTAIN_DISPLAY.BKR.ar} · ${CAPTAIN_DISPLAY.Jihad.ar}`
            : `${CAPTAIN_DISPLAY.BKR.en} · ${CAPTAIN_DISPLAY.Jihad.en}`}
          {" — "}
          {t("clubName")}
        </p>
      </div>
    </main>
  );
}
