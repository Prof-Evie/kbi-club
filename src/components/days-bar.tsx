"use client";

import { useLang } from "@/components/lang";
import { MemberStatus } from "@/lib/members";

const SEGMENTS = 12; // 6 يمين + 6 يسار حول الرقم

interface DaysBarProps {
  remaining: number;
  total: number;
  status: MemberStatus;
  size?: "sm" | "lg";
  showUnit?: boolean;
  className?: string;
}

/**
 * خط مستطيل مقطّع يمثل أيام الاشتراك المتبقية،
 * مع العدد في المنتصف — مثل: ⬜⬜⬜⬜ 27 ⬜⬜⬜⬜
 */
export default function DaysBar({
  remaining,
  total,
  status,
  size = "sm",
  showUnit = false,
  className = "",
}: DaysBarProps) {
  const { t } = useLang();
  const r = Math.max(0, remaining);
  const ratio = total > 0 ? r / total : 0;
  const filled =
    status === "expired" ? 0 : Math.max(r > 0 ? 1 : 0, Math.round(ratio * SEGMENTS));
  const half = SEGMENTS / 2;

  const segHeight = size === "lg" ? "h-3.5" : "h-2";
  const segBase = `${segHeight} flex-1 min-w-[4px] rounded-[2px] transition-colors`;

  const onColor =
    status === "expiring"
      ? "bg-orange-400"
      : status === "active"
        ? "bg-gradient-to-b from-[#ffd44d] to-[#f0b400]"
        : "bg-red-500/60";
  const offColor =
    status === "expired" ? "bg-red-500/15" : "bg-white/10";

  const renderSeg = (i: number) => (
    <span key={i} className={`${segBase} ${i < filled ? onColor : offColor}`} />
  );

  const numColor =
    status === "expired"
      ? "text-red-400"
      : status === "expiring"
        ? "text-orange-400"
        : "text-gold";

  const numSize = size === "lg" ? "text-2xl" : "text-sm";
  const tooltip = `${r} ${t("daysUnit")} — ${total} ${t("daysUnit")}`;

  return (
    <div
      className={`flex items-center gap-2 w-full ${className}`}
      role="img"
      aria-label={`${t("remaining")}: ${r} ${t("daysUnit")}`}
      title={tooltip}
    >
      {/* النصف الأول */}
      <div className="flex gap-[3px] flex-1" aria-hidden>
        {Array.from({ length: half }, (_, i) => renderSeg(i))}
      </div>
      {/* العدد في المنتصف */}
      <span
        className={`${numSize} ${numColor} font-black tabular-nums shrink-0 text-center leading-none tracking-tight`}
      >
        {r}
        {showUnit && (
          <span className="text-[11px] font-bold text-muted-foreground ms-1">
            {status === "expired" ? "" : t("daysUnit")}
          </span>
        )}
      </span>
      {/* النصف الثاني */}
      <div className="flex gap-[3px] flex-1" aria-hidden>
        {Array.from({ length: half }, (_, i) => renderSeg(half + i))}
      </div>
    </div>
  );
}
