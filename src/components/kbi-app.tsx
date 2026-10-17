"use client";

import { useCallback, useEffect, useState } from "react";
import { useLang } from "@/components/lang";
import { CAPTAIN_DISPLAY } from "@/lib/i18n";
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
  const route = useHashRoute();

  // تحقق من صلاحية الجلسة عند الإقلاع
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/auth/me", { cache: "no-store" });
        if (!alive) return;
        if (r.ok) {
          const data = await r.json();
          setActor(data.actor ?? null);
        } else {
          setActor(null);
        }
      } catch {
        /* الشبكة غير متاحة — نبقي الحالة كما هي */
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
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    setActor(null);
    window.location.hash = "";
    toast(t("sessionEnded"));
  }, [t]);

  if (!actor) {
    return <LoginView onSuccess={handleLogin} />;
  }

  const memberId = route.startsWith("member/") ? route.slice("member/".length) : null;

  if (memberId) {
    return <MemberView id={memberId} onBack={() => (window.location.hash = "#/")} />;
  }

  return <DashboardView actor={actor} onLogout={handleLogout} />;
}
