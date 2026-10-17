"use client";

import { useCallback, useEffect, useState } from "react";
import { useLang } from "@/components/lang";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import DaysBar from "@/components/days-bar";
import ConfirmDialog from "@/components/confirm-dialog";
import ExtendDialog from "@/components/extend-dialog";
import MemberFormDialog from "@/components/member-form-dialog";
import { CAPTAIN_DISPLAY, DictKey } from "@/lib/i18n";
import {
  MemberData,
  formatDate,
  memberAge,
  memberStatus,
  remainingDays,
  smsLink,
  telLink,
  totalDaysBetween,
  waLink,
} from "@/lib/members";
import { toast } from "sonner";
import {
  ArrowRight,
  CalendarPlus,
  Copy,
  Loader2,
  MessageSquareText,
  Pencil,
  Phone,
  Ruler,
  Scale,
  Trash2,
  UserRound,
} from "lucide-react";

export default function MemberView({
  id,
  onBack,
}: {
  id: string;
  onBack: () => void;
}) {
  const { t, lang } = useLang();

  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [extendOpen, setExtendOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const r = await fetch(`/api/members/${id}`, { cache: "no-store" });
      if (r.status === 404) {
        setNotFound(true);
        return;
      }
      if (!r.ok) throw new Error("bad");
      setMember(await r.json());
    } catch {
      toast.error(t("errorGeneric"));
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    load();
  }, [load]);

  async function deleteMember() {
    if (!member || deleting) return;
    setDeleting(true);
    try {
      const r = await fetch(`/api/members/${member.id}`, { method: "DELETE" });
      if (!r.ok) {
        toast.error(t("errorGeneric"));
        return;
      }
      toast.success(t("deletedOk"));
      onBack();
    } catch {
      toast.error(t("errorGeneric"));
    } finally {
      setDeleting(false);
    }
  }

  /* ------- الحالات الخاصة ------- */
  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <Skeleton className="h-10 w-28 rounded-xl bg-white/[0.045]" />
        <Skeleton className="h-36 rounded-2xl bg-white/[0.045]" />
        <Skeleton className="h-44 rounded-2xl bg-white/[0.045]" />
      </main>
    );
  }

  if (notFound || !member) {
    return (
      <main className="min-h-dvh flex items-center justify-center px-4">
        <div className="text-center">
          <UserRound className="size-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="font-black">{t("memberNotFound")}</p>
          <Button onClick={onBack} className="mt-4 rounded-xl bg-gold text-black font-black hover:bg-gold-soft cursor-pointer">
            {t("back")}
          </Button>
        </div>
      </main>
    );
  }

  /* ------- البيانات ------- */
  const remaining = remainingDays(member.end);
  const total = totalDaysBetween(member.start, member.end);
  const status = memberStatus(member.end);
  const age = memberAge(member.birth);

  const statusPill = {
    active: { label: t("subActive"), cls: "bg-green-500/12 text-green-400 border-green-500/30" },
    expiring: { label: t("subExpiring"), cls: "bg-orange-500/12 text-orange-400 border-orange-500/30" },
    expired: { label: t("subEnded"), cls: "bg-red-500/12 text-red-400 border-red-500/30" },
  }[status];

  const waText =
    lang === "ar"
      ? `مرحبًا ${member.name}، رسالة من نادي KBI للملاكمة.`
      : `Hello ${member.name}, a message from KBI Boxing Club.`;

  return (
    <main className="relative min-h-dvh pb-16">
      {/* خلفية الشعار */}
      <img
        src="/kbi-mark.png"
        alt=""
        aria-hidden
        className="pointer-events-none select-none fixed left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 w-[min(75vw,420px)] opacity-[0.04]"
      />

      {/* رأس الصفحة */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0d]/85 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-3 sm:px-5 h-[60px] flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="h-9 rounded-xl border-white/12 bg-white/[0.04] hover:bg-white/10 font-bold cursor-pointer gap-1.5"
          >
            <ArrowRight className="size-4 ltr:rotate-180" />
            {t("back")}
          </Button>
          <img
            src="/kbi-logo-sm.png"
            alt={t("clubName")}
            className="h-8 w-auto opacity-80 ms-auto"
          />
        </div>
      </header>

      <div className="relative mx-auto max-w-3xl px-3 sm:px-5 pt-4 space-y-4">
        {/* بطاقة الهوية */}
        <section className="rounded-2xl border border-white/[0.08] bg-card/70 p-5">
          <div className="flex items-center gap-4">
            <span
              className="inline-flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gold/10 border border-gold/25 text-gold font-black text-xl"
              aria-hidden
            >
              {member.name.trim().charAt(0) || <UserRound className="size-6" />}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-black truncate leading-tight">
                {member.name}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span
                  className={`inline-flex items-center h-6 px-2.5 rounded-md border text-xs font-black ${
                    member.type === "general"
                      ? "bg-gold/12 text-gold border-gold/30"
                      : "bg-white/[0.07] text-foreground/80 border-white/15"
                  }`}
                >
                  {member.type === "general" ? t("typeGeneral") : t("typePrivate")}
                </span>
                <span
                  className={`inline-flex items-center h-6 px-2.5 rounded-md border text-xs font-black ${statusPill.cls}`}
                >
                  {statusPill.label}
                </span>
              </div>
            </div>
          </div>

          {/* الهاتف */}
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.07] px-3.5 py-2.5">
            <Phone className="size-4 text-gold shrink-0" />
            <span dir="ltr" className="text-sm font-bold tabular-nums text-left">
              {member.phone}
            </span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(member.phone).then(
                  () => toast(t("copied")),
                  () => undefined
                );
              }}
              className="ms-auto p-1.5 rounded-lg text-muted-foreground hover:text-gold transition-colors cursor-pointer"
              aria-label="copy"
            >
              <Copy className="size-4" />
            </button>
          </div>
        </section>

        {/* بطاقة الاشتراك */}
        <section className="rounded-2xl border border-white/[0.08] bg-card/70 p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="font-black text-sm text-foreground/85 flex items-center gap-2">
              <CalendarPlus className="size-4 text-gold" />
              {t("subscription")}
            </h2>
            <span className="text-xs text-muted-foreground font-bold tabular-nums">
              {Math.round((Math.max(0, remaining) / Math.max(1, total)) * 100)}%
            </span>
          </div>

          <DaysBar
            remaining={remaining}
            total={total}
            status={status}
            size="lg"
            showUnit
          />
          <p className="mt-2 text-xs text-muted-foreground font-bold">
            {t("remaining")}
          </p>

          <Separator className="my-4 bg-white/[0.07]" />

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[11px] font-bold text-muted-foreground mb-0.5">
                {t("startDate")}
              </p>
              <p className="font-black tabular-nums" dir="ltr">
                {formatDate(member.start, lang)}
              </p>
            </div>
            <div className="text-end">
              <p className="text-[11px] font-bold text-muted-foreground mb-0.5">
                {t("endDate")}
              </p>
              <p className="font-black tabular-nums" dir="ltr">
                {formatDate(member.end, lang)}
              </p>
            </div>
          </div>
        </section>

        {/* البيانات الشخصية */}
        <section className="rounded-2xl border border-white/[0.08] bg-card/70 p-5">
          <h2 className="font-black text-sm text-foreground/85 mb-3.5">
            {t("personalInfo")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <InfoCell
              icon={<CalendarPlus className="size-3.5" />}
              label={t("birthShort")}
              value={
                member.birth
                  ? `${formatDate(member.birth, lang)}${
                      age != null
                        ? ` · ${t("yearsOld", { n: age })}`
                        : ""
                    }`
                  : "—"
              }
            />
            <InfoCell
              icon={<Ruler className="size-3.5" />}
              label={t("height")}
              value={member.height != null ? `${member.height} ${t("cm")}` : "—"}
            />
            <InfoCell
              icon={<Scale className="size-3.5" />}
              label={t("weight")}
              value={member.weight != null ? `${member.weight} ${t("kg")}` : "—"}
            />
          </div>
        </section>

        {/* الإجراءات */}
        <section className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          <Button
            onClick={() => setExtendOpen(true)}
            className="h-11 rounded-xl bg-gradient-to-b from-[#ffd44d] to-[#f0b400] text-black font-black hover:from-gold-soft hover:to-gold gold-glow cursor-pointer sm:min-w-36"
          >
            <CalendarPlus className="size-4" />
            {t("extend")}
          </Button>
          <Button
            onClick={() => setEditOpen(true)}
            variant="outline"
            className="h-11 rounded-xl border-gold/35 bg-gold/[0.06] text-gold hover:bg-gold/15 hover:text-gold font-black cursor-pointer sm:min-w-32"
          >
            <Pencil className="size-4" />
            {t("edit")}
          </Button>

          <a
            href={waLink(member.phone, waText)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#22c55e] px-4 text-sm font-black text-black hover:bg-[#4ade80] transition-colors"
          >
            <Phone className="size-4" />
            {t("whatsapp")}
          </a>
          <a
            href={telLink(member.phone)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 text-sm font-black text-foreground/90 hover:bg-white/10 transition-colors"
          >
            <Phone className="size-4" />
            {t("call")}
          </a>
          <a
            href={smsLink(member.phone)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 text-sm font-black text-foreground/90 hover:bg-white/10 transition-colors col-span-2 sm:col-span-1"
          >
            <MessageSquareText className="size-4" />
            {t("sms")}
          </a>
        </section>

        {/* حذف */}
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="mx-auto flex items-center gap-2 text-xs font-bold text-red-400/70 hover:text-red-400 transition-colors cursor-pointer pt-2"
        >
          <Trash2 className="size-3.5" />
          {t("delete")}
        </button>
      </div>

      {/* النوافذ */}
      <MemberFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        member={member}
        onSaved={(m) => {
          setEditOpen(false);
          setMember(m);
          toast.success(t("savedOk"));
        }}
      />

      <ExtendDialog
        open={extendOpen}
        onOpenChange={setExtendOpen}
        member={member}
        onExtended={(m) => {
          setExtendOpen(false);
          setMember(m);
          toast.success(
            t("extendedOk", { date: formatDate(m.end, lang) })
          );
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t("deleteTitle")}
        description={t("deleteOneDesc", { name: member.name })}
        confirmLabel={t("confirmDelete")}
        loading={deleting}
        onConfirm={deleteMember}
      />
    </main>
  );
}

function InfoCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3">
      <p className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5 mb-1">
        <span className="text-gold/80">{icon}</span>
        {label}
      </p>
      <p className="font-extrabold text-[15px] truncate" title={value}>
        {value}
      </p>
    </div>
  );
}
