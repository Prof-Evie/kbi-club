"use client";

import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/components/lang";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  MemberData,
  addDays,
  formatDate,
  fmtDay,
  parseDay,
  todayDay,
} from "@/lib/members";
import { toast } from "sonner";
import { CalendarPlus, Loader2 } from "lucide-react";

const PRESETS = [7, 14, 30, 60, 90];

interface ExtendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberData | null;
  onExtended: (member: MemberData) => void;
}

export default function ExtendDialog({
  open,
  onOpenChange,
  member,
  onExtended,
}: ExtendDialogProps) {
  const { t, lang } = useLang();
  const [days, setDays] = useState(30);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setDays(30);
  }, [open]);

  // قاعدة التمديد: من نهاية الاشتراك الحالية إن كان ساريًا، وإلا من اليوم
  const newEnd = useMemo(() => {
    if (!member) return null;
    const base = Math.max(parseDay(member.end).getTime(), todayDay().getTime());
    return fmtDay(new Date(base + days * 86400000));
  }, [member, days]);

  async function submit() {
    if (!member || saving || days < 1) return;
    setSaving(true);
    try {
      const r = await fetch(`/api/members/${member.id}/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days }),
      });
      if (!r.ok) {
        toast.error(t("errorGeneric"));
        return;
      }
      const updated: MemberData = await r.json();
      onExtended(updated);
    } catch {
      toast.error(t("errorGeneric"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-white/10 rounded-2xl max-w-[92vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-black flex items-center gap-2">
            <CalendarPlus className="size-5 text-gold" />
            {t("extendTitle")}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {member?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 pt-1">
          {/* المدة */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-foreground/75">
              {t("extendFor")}
            </span>
            <div className="flex flex-wrap gap-1.5" dir="ltr">
              {PRESETS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDays(d)}
                  className={`h-10 min-w-12 px-3 rounded-xl text-sm font-black tabular-nums border transition-colors cursor-pointer ${
                    days === d
                      ? "bg-gold text-black border-gold gold-glow"
                      : "bg-white/[0.05] text-foreground/80 border-white/10 hover:border-gold/40"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <Input
                type="number"
                min={1}
                max={3650}
                value={days}
                onChange={(e) =>
                  setDays(Math.max(0, Math.min(3650, Number(e.target.value))))
                }
                dir="ltr"
                className="w-28 h-10 bg-white/[0.05] border-white/10 rounded-xl text-left"
              />
              <span className="text-sm font-bold text-muted-foreground">
                {t("customDays")}
              </span>
            </div>
          </div>

          {/* النتيجة */}
          {newEnd && (
            <div className="rounded-xl border border-gold/25 bg-gold/[0.07] px-4 py-3 flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-foreground/80">
                {t("newEndDate")}
              </span>
              <span className="text-base font-black text-gold tabular-nums" dir="ltr">
                {formatDate(newEnd, lang)}
              </span>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              className="flex-1 rounded-xl border-white/12 bg-transparent hover:bg-white/5 cursor-pointer"
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              onClick={submit}
              disabled={saving || days < 1}
              className="flex-[2] rounded-xl bg-gradient-to-b from-[#ffd44d] to-[#f0b400] text-black font-black hover:from-gold-soft hover:to-gold cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("extending")}
                </>
              ) : (
                t("confirmExtend")
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
