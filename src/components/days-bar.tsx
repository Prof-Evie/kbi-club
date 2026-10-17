"use client";

import { useSyncExternalStore } from "react";
import { useLang } from "@/components/lang";
import { EXPIRING_SOON_DAYS, SubType, parseDay } from "@/lib/members";
import { Clock3 } from "lucide-react";

interface DaysBarProps {
  remaining: number;
  total: number;
  /** نوع الاشتراك — يظهر كشريحة داخل المربع */
  type: SubType;
  /** تاريخ الانتهاء YYYY-MM-DD — يحسب منه العدّاد التنازلي الحي */
  end: string;
  size?: "sm" | "lg";
  className?: string;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/* ---------------- عدّاد ثوانٍ مشترك لكل المربعات ----------------
   مصدر خارجي واحد (useSyncExternalStore) ينبض كل ثانية — مهما كان
   عدد المشتركين تبقى مؤقّت واحد فقط في الصفحة، ولا يتسبب في اختلاف
   بين الخادم والمتصفح لأنه يعيد null قبل الإقلاع. */

const secondListeners = new Set<() => void>();
let currentSecond: number | null = null;
let secondTimer: ReturnType<typeof setInterval> | null = null;

function ensureSecondTicker() {
  if (secondTimer) return;
  currentSecond = Math.floor(Date.now() / 1000);
  secondTimer = setInterval(() => {
    currentSecond = Math.floor(Date.now() / 1000);
    secondListeners.forEach((l) => l());
  }, 1000);
}

function subscribeSecond(cb: () => void): () => void {
  ensureSecondTicker();
  secondListeners.add(cb);
  return () => {
    secondListeners.delete(cb);
  };
}

function getSecondSnapshot(): number | null {
  return currentSecond;
}

/* ---------- درجة اللون حسب نفاد الاشتراك ----------
   المربع يبدأ فارغًا ويمتلئ باللون كلما استُهلكت أيام الاشتراك:
   استُهلك أقل من نصف الاشتراك    -> ذهبي
   استُهلك نصفه أو أكثر           -> برتقالي (نصف متبقٍ = نصف تعبئة برتقالية)
   استُهلك ثلاثة أرباعه أو أكثر   -> أحمر
   انتهى                          -> تعبئة حمراء كاملة
   مع أرضية أيام قليلة (آخر يومين أحمر دائمًا، وأقل من 5 أيام لا يبقى ذهبيًا)
   للتناسق مع فلتر «قارب على الانتهاء». */

type DaysTone = "good" | "warn" | "bad" | "expired";

function severityFor(r: number, consumed: number): DaysTone {
  if (r <= 0) return "expired";
  let sev: DaysTone =
    consumed >= 0.75 ? "bad" : consumed >= 0.5 ? "warn" : "good";
  if (r <= 2) sev = "bad";
  else if (r <= EXPIRING_SOON_DAYS && sev === "good") sev = "warn";
  return sev;
}

/** لوحة ألوان موحدة حسب درجة الشدة */
function toneFor(sev: DaysTone) {
  if (sev === "expired") {
    return {
      box: "border-red-500/25 bg-red-500/[0.06]",
      fill: "bg-red-500/[0.10]",
      edge: "",
      num: "text-red-400",
      clock: "text-red-400/60",
      dot: "",
    };
  }
  if (sev === "bad") {
    return {
      box: "border-red-500/25 bg-red-500/[0.05]",
      fill: "bg-red-500/[0.16]",
      edge: "bg-red-300/80",
      num: "text-red-400",
      clock: "text-red-300/80",
      dot: "bg-red-400",
    };
  }
  if (sev === "warn") {
    return {
      box: "border-orange-400/25 bg-orange-400/[0.05]",
      fill: "bg-orange-400/[0.16]",
      edge: "bg-orange-300/80",
      num: "text-orange-300",
      clock: "text-orange-300/80",
      dot: "bg-orange-400",
    };
  }
  return {
    box: "border-white/[0.08] bg-white/[0.03]",
    fill: "bg-gold/[0.14]",
    edge: "bg-gold/70",
    num: "text-gold",
    clock: "text-gold/75",
    dot: "bg-gold",
  };
}

/** خلية رقم في العدّاد الكبير (يوم : ساعة : دقيقة : ثانية) */
function CountCell({
  v,
  label,
  numCls,
}: {
  v: number | string;
  label: string;
  numCls: string;
}) {
  return (
    <span className="inline-flex flex-col items-center rounded-lg border border-white/[0.07] bg-white/[0.05] px-2 py-1 min-w-[46px]">
      <span className={`text-lg font-black tabular-nums leading-none ${numCls}`}>
        {typeof v === "number" ? pad2(v) : v}
      </span>
      <span className="mt-0.5 text-[9px] font-bold text-muted-foreground leading-none">
        {label}
      </span>
    </span>
  );
}

/**
 * مربع الاشتراك العصري: شريحة النوع + شريط تقدم متدرج + عدد الأيام
 * الكبير + عدّاد تنازلي حي بالثواني حتى لحظة نهاية الاشتراك.
 */
export default function DaysBar({
  remaining,
  total,
  type,
  end,
  size = "sm",
  className = "",
}: DaysBarProps) {
  const { t } = useLang();

  // ثانية حالية — null قبل الإقلاع (تُعرض شرطات بدل الأرقام)
  const nowSec = useSyncExternalStore(subscribeSecond, getSecondSnapshot, () => null);
  const now = nowSec !== null ? nowSec * 1000 : null;

  const r = Math.max(0, remaining);
  // نسبة ما استُهلك من الاشتراك — المربع يمتلئ بها كلما مرّت الأيام
  const consumed =
    total > 0 ? Math.min(1, Math.max(0, (total - r) / total)) : 0;
  // حد أدنى مرئي للتعبئة حتى يظهر المقياس من اليوم الأول
  const pct = Math.max(3, consumed * 100);
  // درجة اللون تتحدد بنسبة الاستهلاك والأيام المتبقية
  const sev = severityFor(r, consumed);
  const expired = sev === "expired";
  const live = !expired && now !== null;

  // لحظة الانتهاء الفعلية = نهاية يوم تاريخ الانتهاء (23:59:59.999)
  const endMs = parseDay(end).getTime() + 86400000 - 1;
  const diff = now !== null ? Math.max(0, endMs - now) : 0;
  const d = Math.floor(diff / 86400000);
  const hh = Math.floor((diff % 86400000) / 3600000);
  const mm = Math.floor((diff % 3600000) / 60000);
  const ss = Math.floor((diff % 60000) / 1000);

  const tone = toneFor(sev);
  const chipCls =
    type === "general"
      ? "bg-gold/12 text-gold border-gold/30"
      : "bg-white/[0.06] text-foreground/80 border-white/15";

  const typeLabel = type === "general" ? t("typeGeneral") : t("typePrivate");
  const aria = `${t("remaining")}: ${r} ${t("daysUnit")} — ${typeLabel}`;

  /* ---------- مؤشر النبض الحي ---------- */
  const pulseDot = live && (
    <span className="relative inline-flex size-1.5 shrink-0">
      <span
        className={`absolute inline-flex h-full w-full rounded-full opacity-50 animate-ping ${tone.dot}`}
      />
      <span className={`relative inline-flex size-1.5 rounded-full ${tone.dot}`} />
    </span>
  );

  /* ---------- النسخة الكبيرة (صفحة المشترك) ---------- */
  if (size === "lg") {
    return (
      <div
        role="img"
        aria-label={aria}
        className={`relative overflow-hidden rounded-2xl border p-4 ${tone.box} ${className}`}
      >
        {/* شريط التقدم */}
        {!expired ? (
          <div
            className="absolute inset-y-0 start-0 transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%` }}
            aria-hidden
          >
            <div
              className={`absolute inset-0 ltr:bg-gradient-to-r rtl:bg-gradient-to-l ${tone.fill}`}
            />
            <div className={`absolute inset-y-0 end-0 w-[3px] rounded-full ${tone.edge}`} />
          </div>
        ) : (
          <div className={`absolute inset-0 ${tone.fill}`} aria-hidden />
        )}

        <div className="relative flex items-center justify-between gap-3">
          {/* النوع + العدّاد */}
          <div className="flex flex-col items-start gap-2.5 min-w-0">
            <span
              className={`inline-flex items-center h-6 px-2.5 rounded-md border text-xs font-black ${chipCls}`}
            >
              {typeLabel}
            </span>
            <div dir="ltr" className="flex items-center gap-1.5">
              {!expired && (
                <CountCell v={now === null ? "--" : d} label={t("dayShort")} numCls={tone.num} />
              )}
              <CountCell v={now === null ? "--" : hh} label={t("unitHour")} numCls={tone.num} />
              <CountCell v={now === null ? "--" : mm} label={t("unitMin")} numCls={tone.num} />
              <CountCell v={now === null ? "--" : ss} label={t("unitSec")} numCls={tone.num} />
            </div>
          </div>

          {/* الأيام المتبقية */}
          <div className="text-end shrink-0 flex flex-col items-end gap-1">
            <span className={`text-4xl font-black tabular-nums leading-none ${tone.num}`}>
              {r}
            </span>
            <span className="text-[11px] font-bold text-muted-foreground leading-none">
              {expired ? t("subEnded") : t("daysUnit")}
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- النسخة الصغيرة (بطاقة القائمة) ---------- */
  return (
    <div
      role="img"
      aria-label={aria}
      className={`relative overflow-hidden rounded-xl border h-11 ${tone.box} ${className}`}
    >
      {/* شريط التقدم */}
      {!expired ? (
        <div
          className="absolute inset-y-0 start-0 transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
          aria-hidden
        >
          <div
            className={`absolute inset-0 ltr:bg-gradient-to-r rtl:bg-gradient-to-l ${tone.fill}`}
          />
          <div className={`absolute inset-y-0 end-0 w-[2px] rounded-full ${tone.edge}`} />
        </div>
      ) : (
        <div className={`absolute inset-0 ${tone.fill}`} aria-hidden />
      )}

      <div className="relative h-full flex items-center gap-2 px-2.5">
        {/* نوع الاشتراك داخل المربع */}
        <span
          className={`shrink-0 inline-flex items-center h-5.5 px-2 rounded-md border text-[10px] font-black leading-none ${chipCls}`}
        >
          {typeLabel}
        </span>

        <div className="flex-1" />

        {pulseDot}

        {/* العدّاد التنازلي الحي */}
        <span
          dir="ltr"
          className={`inline-flex items-center gap-1 text-[11px] font-bold tabular-nums ${tone.clock}`}
          title={t("untilEnd")}
        >
          <Clock3 className="size-3 shrink-0" />
          {now === null
            ? "--:--:--"
            : d > 0
              ? `${d}${t("dayShort")} ${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`
              : `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`}
        </span>

        {/* فاصل */}
        <span className="w-px h-4 bg-white/10 shrink-0" aria-hidden />

        {/* عدد الأيام */}
        <span className="flex items-baseline gap-1 shrink-0">
          <span className={`text-lg font-black tabular-nums leading-none ${tone.num}`}>
            {r}
          </span>
          <span className="text-[10px] font-bold text-muted-foreground leading-none">
            {expired ? "" : t("daysUnit")}
          </span>
        </span>
      </div>
    </div>
  );
}
