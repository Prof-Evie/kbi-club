"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLang } from "@/components/lang";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import DaysBar from "@/components/days-bar";
import ConfirmDialog from "@/components/confirm-dialog";
import LogsSheet from "@/components/logs-sheet";
import MemberFormDialog from "@/components/member-form-dialog";
import {
  CAPTAIN_DISPLAY,
  DictKey,
} from "@/lib/i18n";
import {
  MemberData,
  memberStatus,
  remainingDays,
  totalDaysBetween,
} from "@/lib/members";
import { api } from "@/lib/client";
import { toast } from "sonner";
import {
  ChevronLeft,
  Globe,
  Loader2,
  LogOut,
  Plus,
  ScrollText,
  Search,
  ShieldX,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";

type StatusFilter = "all" | "active" | "expiring" | "expired";
type TypeFilter = "all" | "general" | "private";

export default function DashboardView({
  actor,
  onLogout,
}: {
  actor: string;
  onLogout: () => void;
}) {
  const { t, lang, toggleLang } = useLang();

  const [members, setMembers] = useState<MemberData[] | null>(null);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const [deleteMode, setDeleteMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  /* ------- تحميل البيانات ------- */
  const load = useCallback(async () => {
    try {
      const r = await api("/api/members");
      if (r.status === 401) {
        toast.error(t("sessionExpired"));
        onLogout();
        return;
      }
      if (!r.ok) throw new Error("bad");
      setMembers(await r.json());
    } catch {
      toast.error(t("errorGeneric"));
      setMembers([]);
    }
  }, [t, onLogout]);

  useEffect(() => {
    load();
  }, [load]);

  /* ------- إحصائيات ------- */
  const stats = useMemo(() => {
    const list = members ?? [];
    let active = 0;
    let expired = 0;
    for (const m of list) {
      if (remainingDays(m.end) > 0) active++;
      else expired++;
    }
    return { total: list.length, active, expired };
  }, [members]);

  /* ------- الفلترة ------- */
  const filtered = useMemo(() => {
    let list = members ?? [];
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(needle));
    }
    if (typeFilter !== "all") list = list.filter((m) => m.type === typeFilter);
    if (statusFilter !== "all") {
      list = list.filter((m) => memberStatus(m.end) === statusFilter);
    }
    return list;
  }, [members, q, statusFilter, typeFilter]);

  /* ------- الحذف ------- */
  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exitDeleteMode() {
    setDeleteMode(false);
    setSelected(new Set());
  }

  async function confirmDelete() {
    if (deleting) return;
    setDeleting(true);
    try {
      const r = await api(`/api/members?ids=${[...selected].join(",")}`, {
        method: "DELETE",
      });
      if (!r.ok) {
        toast.error(t("errorGeneric"));
        return;
      }
      toast.success(t("deletedOk"));
      setConfirmOpen(false);
      exitDeleteMode();
      await load();
    } catch {
      toast.error(t("errorGeneric"));
    } finally {
      setDeleting(false);
    }
  }

  const actorName = CAPTAIN_DISPLAY[actor]?.[lang] ?? actor;

  return (
    <main className="relative min-h-dvh pb-24">
      {/* خلفية الشعار */}
      <img
        src="/kbi-mark.png"
        alt=""
        aria-hidden
        className="pointer-events-none select-none fixed left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 w-[min(80vw,460px)] opacity-[0.035]"
      />

      {/* ======= الشريط الثابت ======= */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0d]/85 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-3 sm:px-5">
          {/* الصف الأول */}
          <div className="flex items-center gap-2 sm:gap-3 h-[60px]">
            {/* الشعار */}
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src="/kbi-logo-sm.png"
                alt={t("clubName")}
                className="h-9 w-auto shrink-0"
              />
              <div className="leading-none hidden min-[400px]:block">
                <p className="font-black text-[15px] text-gold tracking-wide">
                  KBI
                </p>
                <p className="text-[10px] text-muted-foreground font-bold mt-0.5">
                  {t("dashboard")}
                </p>
              </div>
            </div>

            {/* إحصائيات (شاشات متوسطة+) */}
            {statsChips("hidden md:flex")}

            <div className="ms-auto flex items-center gap-1.5 sm:gap-2">
              {/* البحث */}
              <div className="relative hidden md:block">
                <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("searchPh")}
                  className="ps-8 h-9 w-44 lg:w-56 rounded-xl bg-white/[0.05] border-white/10 text-sm"
                  aria-label={t("searchPh")}
                />
              </div>

              {/* إضافة */}
              <Button
                onClick={() => setAddOpen(true)}
                className="h-9 rounded-xl bg-gradient-to-b from-[#ffd44d] to-[#f0b400] text-black font-black hover:from-gold-soft hover:to-gold gold-glow cursor-pointer px-3"
              >
                <Plus className="size-4" strokeWidth={3} />
                <span className="hidden sm:inline">{t("add")}</span>
              </Button>

              {/* السجل */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setLogsOpen(true)}
                className="size-9 rounded-xl border-white/12 bg-white/[0.04] hover:bg-white/10 hover:border-gold/40 cursor-pointer"
                aria-label={t("logs")}
                title={t("logs")}
              >
                <ScrollText className="size-4" />
              </Button>

              {/* حذف */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => (deleteMode ? exitDeleteMode() : setDeleteMode(true))}
                aria-pressed={deleteMode}
                aria-label={t("delete")}
                title={t("delete")}
                className={`size-9 rounded-xl cursor-pointer border ${
                  deleteMode
                    ? "border-red-500/60 bg-red-500/15 text-red-400"
                    : "border-white/12 bg-white/[0.04] hover:bg-white/10 hover:border-red-500/40"
                }`}
              >
                <Trash2 className="size-4" />
              </Button>

              {/* اللغة */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLang}
                className="h-9 rounded-xl border-white/12 bg-white/[0.04] hover:bg-white/10 font-bold text-xs gap-1.5 cursor-pointer px-2.5"
                aria-label="Switch language"
              >
                <Globe className="size-3.5 text-gold" />
                {lang === "ar" ? "EN" : "ع"}
              </Button>

              {/* خروج */}
              <Button
                variant="outline"
                size="icon"
                onClick={onLogout}
                className="size-9 rounded-xl border-white/12 bg-white/[0.04] hover:bg-red-500/15 hover:border-red-500/40 hover:text-red-400 cursor-pointer"
                aria-label={t("logout")}
                title={`${t("logout")} (${actorName})`}
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>

          {/* الصف الثاني — موبايل: بحث + إحصائيات */}
          <div className="md:hidden flex items-center gap-2 pb-2.5">
            <div className="relative flex-1">
              <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("searchPh")}
                className="ps-8 h-9 rounded-xl bg-white/[0.05] border-white/10 text-sm"
                aria-label={t("searchPh")}
              />
            </div>
          </div>
          <div className="md:hidden pb-2.5">{statsChips("flex")}</div>
        </div>
      </header>

      {/* ======= المحتوى ======= */}
      <div className="mx-auto max-w-5xl px-3 sm:px-5">
        {/* الفلاتر */}
        <div className="flex flex-wrap items-center gap-1.5 pt-4 pb-1">
          <FilterChip
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
            label={t("filterAll")}
          />
          <FilterChip
            active={statusFilter === "active"}
            onClick={() => setStatusFilter("active")}
            label={t("active")}
          />
          <FilterChip
            active={statusFilter === "expiring"}
            onClick={() => setStatusFilter("expiring")}
            label={t("expiring")}
          />
          <FilterChip
            active={statusFilter === "expired"}
            onClick={() => setStatusFilter("expired")}
            label={t("expired")}
          />
          <span className="w-px h-5 bg-white/10 mx-1" aria-hidden />
          <FilterChip
            active={typeFilter === "all"}
            onClick={() => setTypeFilter("all")}
            label={t("typeAll")}
          />
          <FilterChip
            active={typeFilter === "general"}
            onClick={() => setTypeFilter("general")}
            label={t("typeGeneral")}
          />
          <FilterChip
            active={typeFilter === "private"}
            onClick={() => setTypeFilter("private")}
            label={t("typePrivate")}
          />
        </div>

        {/* تنبيه وضع الحذف */}
        {deleteMode && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/[0.08] px-3.5 py-2.5 text-sm font-bold text-red-300">
            <ShieldX className="size-4 shrink-0" />
            {t("deleteModeHint")}
          </div>
        )}

        {/* القائمة */}
        <div className="pt-3 space-y-2.5">
          {members === null &&
            Array.from({ length: 5 }, (_, i) => (
              <Skeleton
                key={i}
                className="h-[76px] rounded-2xl bg-white/[0.045]"
              />
            ))}

          {members !== null && filtered.length === 0 && (
            <EmptyState
              hasMembers={(members?.length ?? 0) > 0}
              onAdd={() => setAddOpen(true)}
            />
          )}

          {members !== null &&
            filtered.map((m) => (
              <MemberCard
                key={m.id}
                member={m}
                deleteMode={deleteMode}
                selected={selected.has(m.id)}
                onOpen={() => {
                  if (deleteMode) toggleSelected(m.id);
                  else window.location.hash = `#/member/${m.id}`;
                }}
              />
            ))}
        </div>
      </div>

      {/* ======= شريط الحذف العائم ======= */}
      {deleteMode && selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-5 z-50 flex justify-center px-4 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-red-500/35 bg-[#15151a]/95 backdrop-blur-xl px-4 py-2.5 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.9)] animate-in fade-in slide-in-from-bottom-4 duration-300">
            <span className="text-sm font-black text-foreground">
              {selected.size}{" "}
              <span className="text-muted-foreground font-bold">
                {t("memberCount")}
              </span>
            </span>
            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={deleting}
              className="h-9 rounded-xl bg-destructive text-white hover:bg-destructive/90 font-black cursor-pointer"
            >
              {deleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              {t("deleteSelected")}
            </Button>
            <Button
              variant="ghost"
              onClick={exitDeleteMode}
              className="h-9 rounded-xl font-bold cursor-pointer hover:bg-white/8"
            >
              {t("exitDelete")}
            </Button>
          </div>
        </div>
      )}

      {/* ======= النوافذ ======= */}
      <MemberFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        member={null}
        onSaved={(m, isNew) => {
          setAddOpen(false);
          toast.success(isNew ? t("addedOk") : t("savedOk"));
          load();
        }}
      />

      <LogsSheet open={logsOpen} onOpenChange={setLogsOpen} />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t("deleteTitle")}
        description={t("deleteManyDesc", { n: selected.size })}
        confirmLabel={t("confirmDelete")}
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </main>
  );

  /* ------- شريحة الإحصائيات ------- */
  function statsChips(extra: string) {
    return (
      <div className={`${extra} items-center gap-1.5`} role="status">
        <Chip
          label={t("total")}
          value={stats.total}
          icon={<Users className="size-3" />}
        />
        <Chip
          label={t("active")}
          value={stats.active}
          dot="bg-green-400"
        />
        <Chip label={t("expired")} value={stats.expired} dot="bg-red-400" />
      </div>
    );
  }
}

/* ================== مكوّنات مساعدة ================== */

function Chip({
  label,
  value,
  icon,
  dot,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  dot?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 h-7 text-xs font-bold text-foreground/85 whitespace-nowrap">
      {icon && <span className="text-gold">{icon}</span>}
      {dot && <span className={`size-1.5 rounded-full ${dot}`} />}
      {label}
      <span className="text-gold tabular-nums font-black">{value}</span>
    </span>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-8 px-3.5 rounded-full text-xs font-black border transition-colors cursor-pointer whitespace-nowrap ${
        active
          ? "bg-gold text-black border-gold"
          : "bg-white/[0.04] text-foreground/70 border-white/10 hover:border-white/25 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function MemberCard({
  member,
  deleteMode,
  selected,
  onOpen,
}: {
  member: MemberData;
  deleteMode: boolean;
  selected: boolean;
  onOpen: () => void;
}) {
  const remaining = remainingDays(member.end);
  const total = totalDaysBetween(member.start, member.end);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className={`group w-full text-start rounded-2xl border px-3.5 py-3 transition-all cursor-pointer select-none ${
        selected
          ? "border-red-500/60 bg-red-500/[0.09]"
          : "border-white/[0.07] bg-card/70 hover:border-gold/35 hover:bg-white/[0.045]"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* دائرة التحديد أو الحرف */}
        {deleteMode ? (
          <span
            className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
              selected
                ? "border-red-400 bg-red-500/25 text-red-300"
                : "border-white/25 bg-transparent text-transparent"
            }`}
            aria-hidden
          >
            ✓
          </span>
        ) : (
          <span
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-gold/10 border border-gold/25 text-gold font-black text-base"
            aria-hidden
          >
            {member.name.trim().charAt(0) || <UserRound className="size-4" />}
          </span>
        )}

        {/* الاسم + الهاتف */}
        <div className="min-w-0 flex-1">
          <span className="font-extrabold text-[15px] truncate block">
            {member.name}
          </span>
          <span
            dir="ltr"
            className="block text-xs text-muted-foreground tabular-nums mt-0.5 text-start"
          >
            {member.phone}
          </span>
        </div>

        <ChevronLeft className="size-5 text-muted-foreground/40 group-hover:text-gold/70 transition-colors ltr:rotate-180 shrink-0" />
      </div>

      {/* مربع الاشتراك */}
      <div className="mt-2.5 ps-[52px]">
        <DaysBar
          remaining={remaining}
          total={total}
          type={member.type}
          end={member.end}
        />
      </div>
    </div>
  );
}

function EmptyState({
  hasMembers,
  onAdd,
}: {
  hasMembers: boolean;
  onAdd: () => void;
}) {
  const { t } = useLang();
  return (
    <div className="py-16 text-center">
      <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-gold/8 border border-gold/20 mb-4">
        <Users className="size-7 text-gold/70" />
      </div>
      <p className="font-black text-foreground/90">
        {hasMembers ? t("noResults") : t("emptyList")}
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        {hasMembers ? t("noResultsHint") : t("emptyListHint")}
      </p>
      {!hasMembers && (
        <Button
          onClick={onAdd}
          className="mt-5 rounded-xl bg-gradient-to-b from-[#ffd44d] to-[#f0b400] text-black font-black hover:from-gold-soft hover:to-gold gold-glow cursor-pointer"
        >
          <Plus className="size-4" strokeWidth={3} />
          {t("add")}
        </Button>
      )}
    </div>
  );
}
