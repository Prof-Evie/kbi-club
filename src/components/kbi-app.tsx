"use client";

import { useCallback, useEffect, useState } from "react";
import { useLang } from "@/components/lang";
import { CAPTAIN_DISPLAY } from "@/lib/i18n";
import { api, clearToken, getToken } from "@/lib/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import LoginView from "@/components/views/login-view";
import DashboardView from "@/components/views/dashboard-view";
import MemberView from "@/components/views/member-view";

/** يقرأ مسار الهاش الحالي: "" للرئيسية أو "member/<id>" */
function useHashRoute(): string {
  const [route, setRoute] = useState("");
  useEffect(() => {
    const apply = () => {
      const h = window.location.hash.replace(/^#\/?/, "");
      setRoute(h);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);
  return route;
}

export default function KbiApp({ initialActor }: { initialActor: string | null }) {
  const { t, lang } = useLang();
  const [actor, setActor] = useState<string | null>(initialActor);
  const [booting, setBooting] = useState(false);
  const route = useHashRoute();

  // تحقق من صلاحية الجلسة عند الإقلاع (كوكي أو توكن محفوظ في localStorage)
  useEffect(() => {
    let alive = true;
    // لا جلسة معروفة من الخادم ولا توكن محفوظ — اعرض تسجيل الدخول فورًا
    if (!initialActor && !getToken()) return;
    setBooting(true);
    (async () => {
      try {
        const r = await api("/api/auth/me");
        if (!alive) return;
        if (r.ok) {
          const data = await r.json();
          setActor(data.actor ?? null);
        } else {
          setActor(null);
          clearToken(); // توكن منتهي أو غير صالح — نظّفه
        }
      } catch {
        /* الشبكة غير متاحة — نبقي الحالة كما هي */
      } finally {
        if (alive) setBooting(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handleLogin = useCallback((captain: string) => {
    setActor(captain);
    const h = window.location.hash;
    if (!h || h === "#/" || h === "#") {
      // الرئيسية — لا تغيير
    } else if (!h.startsWith("#/member/")) {
      window.location.hash = "#/";
    }
    toast.success(t("welcomeBack", { name: CAPTAIN_DISPLAY[captain]?.[lang] ?? captain }));
  }, [t, lang]);

  const handleLogout = useCallback(async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    clearToken();
    setActor(null);
    window.location.hash = "";
    toast(t("sessionEnded"));
  }, [t]);

  // شاشة انتظار قصيرة أثناء استعادة الجلسة من التوكن المحفوظ
  if (booting && !actor) {
    return (
      <main className="relative min-h-dvh flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-gold" />
      </main>
    );
  }

  if (!actor) {
    return <LoginView onSuccess={handleLogin} />;
  }

  const memberId = route.startsWith("member/") ? route.slice("member/".length) : null;

  if (memberId) {
    return <MemberView id={memberId} onBack={() => (window.location.hash = "#/")} />;
  }

  return <DashboardView actor={actor} onLogout={handleLogout} />;
}
