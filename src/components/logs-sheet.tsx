"use client";

import { useCallback, useEffect, useState } from "react";
import { useLang } from "@/components/lang";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CAPTAIN_DISPLAY } from "@/lib/i18n";
import { relativeTime } from "@/lib/members";
import { api } from "@/lib/client";
import {
  CalendarPlus,
  LogIn,
  Pencil,
  ScrollText,
  Trash2,
  UserPlus,
} from "lucide-react";

interface LogEntry {
  id: string;
  action: string;
  actor: string;
  target: string | null;
  details: string | null;
  createdAt: string;
}

const ACTION_STYLE: Record<
  string,
  { icon: typeof LogIn; cls: string }
> = {
  LOGIN: { icon: LogIn, cls: "text-zinc-300 bg-white/8 border-white/12" },
  CREATE: { icon: UserPlus, cls: "text-green-400 bg-green-500/10 border-green-500/25" },
  UPDATE: { icon: Pencil, cls: "text-gold bg-gold/10 border-gold/30" },
  EXTEND: {
    icon: CalendarPlus,
    cls: "text-orange-400 bg-orange-500/10 border-orange-500/25",
  },
  DELETE: { icon: Trash2, cls: "text-red-400 bg-red-500/10 border-red-500/25" },
};

export default function LogsSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t, lang } = useLang();
  const [logs, setLogs] = useState<LogEntry[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await api("/api/logs?limit=200");
      if (!r.ok) throw new Error("bad");
      const data = await r.json();
      setLogs(data);
      setError(false);
    } catch {
      setLogs([]);
      setError(true);
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="bg-[#0d0d11] border-white/10 p-0 w-full sm:max-w-sm flex flex-col gap-0"
      >
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-white/8">
          <SheetTitle className="font-black flex items-center gap-2 text-base">
            <ScrollText className="size-4.5 text-gold" />
            {t("logsTitle")}
          </SheetTitle>
          <SheetDescription className="text-xs">
            {logs ? t("logsSubtitle", { n: logs.length }) : ""}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-4 py-3 space-y-1.5">
            {logs === null && (
              <div className="space-y-2 pt-2">
                {Array.from({ length: 6 }, (_, i) => (
                  <div
                    key={i}
                    className="h-14 rounded-xl bg-white/[0.04] animate-pulse"
                  />
                ))}
              </div>
            )}

            {logs !== null && logs.length === 0 && (
              <div className="pt-14 text-center text-sm text-muted-foreground">
                <ScrollText className="size-9 mx-auto mb-3 opacity-40" />
                {error ? t("errorGeneric") : t("logsEmpty")}
              </div>
            )}

            {logs !== null &&
              logs.map((l) => {
                const st = ACTION_STYLE[l.action] ?? ACTION_STYLE.UPDATE;
                const Icon = st.icon;
                const actorName =
                  CAPTAIN_DISPLAY[l.actor]?.[lang] ?? l.actor;
                const actionLabel = t((`act${l.action.toUpperCase()}` as "actLOGIN"));
                return (
                  <div
                    key={l.id}
                    className="flex items-start gap-3 rounded-xl border border-white/6 bg-white/[0.025] px-3 py-2.5"
                  >
                    <span
                      className={`mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg border ${st.cls}`}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] leading-snug text-foreground/90">
                        <span className="font-black">{actorName}</span>{" "}
                        {actionLabel}
                        {l.target && (
                          <>
                            {" "}
                            «<span className="font-bold">{l.target}</span>»
                          </>
                        )}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                        {l.details && (
                          <span dir="ltr" className="tabular-nums">
                            {l.details}
                          </span>
                        )}
                        <span className="ms-auto whitespace-nowrap">
                          {relativeTime(l.createdAt, lang)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
