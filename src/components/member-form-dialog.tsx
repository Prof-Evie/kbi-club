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
import { MemberData, addDays, fmtDay, isValidPhone, parseDay, todayDay } from "@/lib/members";
import { api } from "@/lib/client";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";

const DURATION_PRESETS = [7, 14, 30, 60, 90];

interface MemberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = إضافة جديد */
  member: MemberData | null;
  onSaved: (member: MemberData, isNew: boolean) => void;
}

type FieldErrors = Partial<
  Record<"name" | "phone" | "date" | "dateOrder", string>
>;

export default function MemberFormDialog({
  open,
  onOpenChange,
  member,
  onSaved,
}: MemberFormDialogProps) {
  const { t } = useLang();
  const isEdit = Boolean(member);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birth, setBirth] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [type, setType] = useState<"general" | "private">("general");
  const [start, setStart] = useState(fmtDay(todayDay()));
  const [end, setEnd] = useState(fmtDay(addDays(todayDay(), 30)));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  // تعبئة الحقول عند فتح النافذة
  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (member) {
      setName(member.name);
      setPhone(member.phone);
      setBirth(member.birth ?? "");
      setHeight(member.height != null ? String(member.height) : "");
      setWeight(member.weight != null ? String(member.weight) : "");
      setType(member.type);
      setStart(member.start);
      setEnd(member.end);
    } else {
      setName("");
      setPhone("");
      setBirth("");
      setHeight("");
      setWeight("");
      setType("general");
      setStart(fmtDay(todayDay()));
      setEnd(fmtDay(addDays(todayDay(), 30)));
    }
  }, [open, member]);

  const duration = useMemo(() => {
    const ms = parseDay(end).getTime() - parseDay(start).getTime();
    return Math.round(ms / 86400000);
  }, [start, end]);

  function applyDuration(days: number) {
    setEnd(fmtDay(addDays(parseDay(start), days)));
  }

  function onStartChange(v: string) {
    if (!v) {
      setStart(v);
      return;
    }
    // إزاحة تاريخ النهاية بنفس قدر الإزاحة للحفاظ على المدة
    const delta = parseDay(v).getTime() - parseDay(start || v).getTime();
    setStart(v);
    if (end) setEnd(fmtDay(new Date(parseDay(end).getTime() + delta)));
  }

  function validate(): boolean {
    const e: FieldErrors = {};
    if (name.trim().length < 2) e.name = t("requiredField");
    if (!isValidPhone(phone)) e.phone = t("invalidPhone");
    if (!start || !end) e.date = t("requiredField");
    else if (parseDay(end).getTime() < parseDay(start).getTime())
      e.dateOrder = t("badDateOrder");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (saving) return;
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        birth: birth || null,
        height: height === "" ? null : Number(height),
        weight: weight === "" ? null : Number(weight),
        type,
        start,
        end,
      };
      const r = isEdit
        ? await api(`/api/members/${member!.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await api("/api/members", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (!r.ok) {
        toast.error(t("errorGeneric"));
        return;
      }
      const saved: MemberData = await r.json();
      onSaved(saved, !isEdit);
    } catch {
      toast.error(t("errorGeneric"));
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "bg-white/[0.05] border-white/10 rounded-xl h-10.5 py-2 text-start";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-white/10 rounded-2xl max-w-[94vw] sm:max-w-lg max-h-[88dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-black flex items-center gap-2">
            <UserPlus className="size-5 text-gold" />
            {isEdit ? t("editTitle") : t("addTitle")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isEdit ? t("editTitle") : t("addTitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3.5 pt-1">
          {/* الاسم */}
          <Field label={t("name")} error={errors.name} required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePh")}
              className={inputCls}
              autoComplete="off"
            />
          </Field>

          {/* الهاتف */}
          <Field label={t("phone")} error={errors.phone} required>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("phonePh")}
              dir="ltr"
              inputMode="tel"
              className={`${inputCls} text-left`}
              autoComplete="off"
            />
          </Field>

          {/* المواليد + الطول + الوزن */}
          <div className="grid grid-cols-3 gap-3">
            <Field label={t("birth")}>
              <Input
                type="date"
                value={birth}
                onChange={(e) => setBirth(e.target.value)}
                dir="ltr"
                className={`${inputCls} text-left`}
              />
            </Field>
            <Field label={`${t("height")} (${t("cm")})`}>
              <Input
                type="number"
                min={0}
                max={300}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="175"
                dir="ltr"
                className={`${inputCls} text-left`}
              />
            </Field>
            <Field label={`${t("weight")} (${t("kg")})`}>
              <Input
                type="number"
                min={0}
                max={500}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="75"
                dir="ltr"
                className={`${inputCls} text-left`}
              />
            </Field>
          </div>

          {/* نوع الاشتراك */}
          <Field label={t("subType")}>
            <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label={t("subType")}>
              <TypeCard
                active={type === "general"}
                onClick={() => setType("general")}
                title={t("typeGeneral")}
              />
              <TypeCard
                active={type === "private"}
                onClick={() => setType("private")}
                title={t("typePrivate")}
              />
            </div>
          </Field>

          {/* بداية الاشتراك */}
          <Field label={t("startDate")} error={errors.date}>
            <Input
              type="date"
              value={start}
              onChange={(e) => onStartChange(e.target.value)}
              dir="ltr"
              className={`${inputCls} text-left`}
            />
          </Field>

          {/* المدة */}
          <Field label={t("duration")}>
            <div className="flex flex-wrap gap-1.5" dir="ltr">
              {DURATION_PRESETS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => applyDuration(d)}
                  className={`h-9 min-w-11 px-2.5 rounded-xl text-sm font-black tabular-nums border transition-colors cursor-pointer ${
                    duration === d
                      ? "bg-gold text-black border-gold gold-glow"
                      : "bg-white/[0.05] text-foreground/80 border-white/10 hover:border-gold/40"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </Field>

          {/* نهاية الاشتراك */}
          <Field label={t("endDate")} error={errors.dateOrder}>
            <Input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              dir="ltr"
              className={`${inputCls} text-left`}
            />
          </Field>

          {/* أزرار */}
          <div className="flex gap-2 pt-1.5">
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
              disabled={saving}
              className="flex-[2] rounded-xl bg-gradient-to-b from-[#ffd44d] to-[#f0b400] text-black font-black hover:from-gold-soft hover:to-gold cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {isEdit ? t("saving") : t("adding")}
                </>
              ) : isEdit ? (
                t("save")
              ) : (
                t("add")
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5 min-w-0">
      <span className="text-xs font-bold text-foreground/75">
        {label}
        {required && <span className="text-gold"> *</span>}
      </span>
      {children}
      {error && (
        <p className="text-[11px] font-bold text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function TypeCard({
  active,
  onClick,
  title,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`h-11 rounded-xl border text-sm font-black transition-all cursor-pointer ${
        active
          ? "bg-gold/15 text-gold border-gold/60 shadow-[0_0_0_1px_rgba(255,200,33,0.25)]"
          : "bg-white/[0.04] text-foreground/70 border-white/10 hover:border-white/25"
      }`}
    >
      {title}
    </button>
  );
}
