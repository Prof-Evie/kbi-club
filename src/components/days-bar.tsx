"use client";

import { useSyncExternalStore, type CSSProperties } from "react";
import { useLang } from "@/components/lang";
import { SubType, parseDay } from "@/lib/members";
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

/* ---------- لون مستمر على كامل مدى الاشتراك ----------
   الشريط يمثّل الوقت المتبقي من الاشتراك:
   يبدأ ممتلئًا بالكامل (اشتراك 30 أو 31 يومًا = ممتلئ باللون)،
   ويكون في منتصفه تمامًا عند بقاء النصف (15 من 30)،
   ثم ينقص مع مرور الوقت حتى ينفد لحظة الانتهاء.
   اللون يتدرّج بسلاسة عبر كامل المدى بلا مراحل مفاجئة:
   100% ذهبي ← 50% برتقالي ← 25% وأقل أحمر. */

type RGB = { r: number; g: number; b: number };

const GOLD: RGB = { r: 255, g: 200, b: 33 }; // ذهبي الموقع #ffc821
const ORANGE: RGB = { r: 251, g: 146, b: 60 }; // برتقالي #fb923c
const RED: RGB = { r: 239, g: 68, b: 68 }; // أحمر #ef4444
const ORANGE_SOFT: RGB = { r: 253, g: 186, b: 116 }; // نص برتقالي فاتح #fdba74
const RED_SOFT: RGB = { r: 248, g: 113, b: 113 }; // نص أحمر فاتح #f87171

function mix(a: RGB, b: RGB, t: number): RGB {
  const k = Math.min(1, Math.max(0, t));
  return {
    r: Math.round(a.r + (b.r - a.r) * k),
    g: Math.round(a.g + (b.g - a.g) * k),
    b: Math.round(a.b + (b.b - a.b) * k),
  };
}

const rgb = (c: RGB, a = 1) =>
  a >= 1 ? `rgb(${c.r} ${c.g} ${c.b})` : `rgb(${c.r} ${c.g} ${c.b} / ${a})`;

/** لوحة اللون اللحظية حسب نسبة الوقت المتبقي (0..1) — تدرج مستمر بلا مراحل */
function paletteFor(remain: number): { main: RGB; soft: RGB } {
  if (remain >= 0.5) {
    const t = (remain - 0.5) / 0.5; // 0.5..1.0 برتقالي ← ذهبي
    return { main: mix(ORANGE, GOLD, t), soft: mix(ORANGE_SOFT, GOLD, t) };
  }
  if (remain >= 0.25) {
    const t = (remain - 0.25) / 0.25; // 0.25..0.5 أحمر ← برتقالي
    return { main: mix(RED, ORANGE, t), soft: mix(RED_SOFT, ORANGE_SOFT, t) };
  }
  return { main: RED, soft: RED_SOFT };
}

/** خلية رقم في العدّاد الكبير (يوم : ساعة : دقيقة : ثانية) */
function CountCell({
  v,
  label,
  numStyle,
}: {
  v: number | string;
  label: string;
  numStyle: CSSProperties;
}) {
  return (
    <span className="inline-flex flex-col items-center rounded-lg border border-white/[0.07] bg-white/[0.05] px-2 py-1 min-w-[46px]">
      <span className="text-lg font-black tabular-nums leading-none" style={numStyle}>
        {typeof v === "number" ? pad2(v) : v}
      </span>
      <span className="mt-0.5 text-[9px] font-bold text-muted-foreground leading-none">
        {label}
      </span>
    </span>
  );
}

/**
 * مربع الاشتراك العصري: شريحة النوع + شريط يمثّل الوقت المتبقي (ممتلئ عند
 * البداية وينقص مع الوقت) بلون يتدرج باستمرار + عدد الأيام الكبير + عدّاد
 * تنازلي حي بالثواني حتى لحظة نهاية الاشتراك.
 */
export default function DaysBar({
  remaining,
  total,
  type,
  end,
  size = "sm",
  className = "",
}: DaysBarProps) {
  const { t, dir } = useLang();

  // ثانية حالية — null قبل الإقلاع (تُعرض شرطات بدل الأرقام)
  const nowSec = useSyncExternalStore(subscribeSecond, getSecondSnapshot, () => null);
  const now = nowSec !== null ? nowSec * 1000 : null;

  const r = Math.max(0, remaining);

  /* حدود الاشتراك بالمللي ثانية: من بداية يوم البداية إلى نهاية يوم الانتهاء.
     نسبة المتبقي محسوبة من الساعة الحية نفسها التي يحركها العدّاد — فتنقص
     مع مرور الساعات والدقائق والثواني فعليًا، ولا تنتظر تغيّر اليوم. */
  const endDayStart = parseDay(end).getTime();
  const startMs = endDayStart - (Math.max(1, total) - 1) * 86400000;
  const endMs = endDayStart + 86400000;
  const totalMs = Math.max(86400000, endMs - startMs);

  // نسبة الوقت المتبقي 0..1 — قبل إقلاع العدّاد تُحسب من الأيام (المتبقي ÷ الإجمالي)
  const remainStatic = total > 0 ? Math.min(1, Math.max(0, r / total)) : 0;
  const remain =
    now !== null
      ? Math.min(1, Math.max(0, (endMs - now) / totalMs))
      : remainStatic;

  // يصبح «منتهيًا» لحظة وصول العدّاد إلى الصفر دون إعادة تحميل
  const rLive = now !== null && now >= endMs ? 0 : r;
  const expired = rLive <= 0;
  const live = !expired && now !== null;
  // آخر يومين أحمر دائمًا مهما كانت النسبة (يحمي الاشتراكات القصيرة جدًا)
  const urgent = !expired && rLive <= 2;

  const pal = expired || urgent ? { main: RED, soft: RED_SOFT } : paletteFor(remain);

  // عرض الشريط = نسبة الوقت المتبقي، بأرضية 3% حتى يظهر المقياس دائمًا
  const pct = expired ? 100 : Math.max(3, remain * 100);

  /* ---------- ألوان لحظية (style) بدل درجات Tailwind الثابتة ---------- */
  const numStyle: CSSProperties = { color: rgb(pal.soft) };
  const clockStyle: CSSProperties = { color: rgb(pal.soft, expired ? 0.6 : 0.75) };
  const boxStyle: CSSProperties = expired
    ? { borderColor: rgb(RED, 0.25), backgroundColor: rgb(RED, 0.06) }
    : { borderColor: rgb(pal.main, 0.25), backgroundColor: rgb(pal.main, 0.05) };
  // التعبئة: تدرّج يتوهّج عند الحافة المتحركة ويتناثر نحو القاعدة
  const fillStyle: CSSProperties = expired
    ? { background: rgb(RED, 0.1) }
    : dir === "rtl"
      ? { background: `linear-gradient(to left, ${rgb(pal.main, 0.07)}, ${rgb(pal.main, 0.42)})` }
      : { background: `linear-gradient(to right, ${rgb(pal.main, 0.07)}, ${rgb(pal.main, 0.42)})` };
  const edgeStyle: CSSProperties = { background: rgb(pal.soft, 0.85) };
  const dotStyle: CSSProperties = { background: rgb(pal.main) };

  // العدّاد التنازلي حتى نهاية يوم الانتهاء (منتصف الليل التالي)
  const diff = now !== null ? Math.max(0, endMs - now) : 0;
  const d = Math.floor(diff / 86400000);
  const hh = Math.floor((diff % 86400000) / 3600000);
  const mm = Math.floor((diff % 3600000) / 60000);
  const ss = Math.floor((diff % 60000) / 1000);

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
        className="absolute inline-flex h-full w-full rounded-full opacity-50 animate-ping"
        style={dotStyle}
      />
      <span className="relative inline-flex size-1.5 rounded-full" style={dotStyle} />
    </span>
  );

  /* ---------- النسخة الكبيرة (صفحة المشترك) ---------- */
  if (size === "lg") {
    return (
      <div
        role="img"
        aria-label={aria}
        className={`relative overflow-hidden rounded-2xl border p-4 ${className}`}
        style={boxStyle}
      >
        {/* شريط التقدم */}
        {!expired ? (
          <div
            className="absolute inset-y-0 start-0 transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%` }}
            aria-hidden
          >
            <div className="absolute inset-0" style={fillStyle} />
            <div
              className={`absolute inset-y-0 end-0 w-[3px] rounded-full ${live ? "animate-pulse" : ""}`}
              style={edgeStyle}
            />
          </div>
        ) : (
          <div className="absolute inset-0" style={fillStyle} aria-hidden />
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
                <CountCell v={now === null ? "--" : d} label={t("dayShort")} numStyle={numStyle} />
              )}
              <CountCell v={now === null ? "--" : hh} label={t("unitHour")} numStyle={numStyle} />
              <CountCell v={now === null ? "--" : mm} label={t("unitMin")} numStyle={numStyle} />
              <CountCell v={now === null ? "--" : ss} label={t("unitSec")} numStyle={numStyle} />
            </div>
          </div>

          {/* الأيام المتبقية */}
          <div className="text-end shrink-0 flex flex-col items-end gap-1">
            <span className="text-4xl font-black tabular-nums leading-none" style={numStyle}>
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
      className={`relative overflow-hidden rounded-xl border h-11 ${className}`}
      style={boxStyle}
    >
      {/* شريط التقدم */}
      {!expired ? (
        <div
          className="absolute inset-y-0 start-0 transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
          aria-hidden
        >
          <div className="absolute inset-0" style={fillStyle} />
          <div
            className={`absolute inset-y-0 end-0 w-[2px] rounded-full ${live ? "animate-pulse" : ""}`}
            style={edgeStyle}
          />
        </div>
      ) : (
        <div className="absolute inset-0" style={fillStyle} aria-hidden />
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
          className="inline-flex items-center gap-1 text-[11px] font-bold tabular-nums"
          style={clockStyle}
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
          <span className="text-lg font-black tabular-nums leading-none" style={numStyle}>
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
