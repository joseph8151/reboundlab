import Link from "next/link";
import { deliveryLabel, kindLabel, levelsText } from "@/lib/catalog";
import { cn, formatPrice } from "@/lib/utils";
import type { Rec } from "@/lib/guide";

/** 선택지 버튼 묶음(단일/복수). 라디오·체크박스 역할을 aria로 표시합니다. */
export function Options({ items, value, onChange, multiple, columns = 2 }: { items: { id: string; label: string; note?: string }[]; value: string | string[]; onChange: (v: string) => void; multiple?: boolean; columns?: 1 | 2 | 3 }) {
  const on = (id: string) => (Array.isArray(value) ? value.includes(id) : value === id);
  return (
    <div role={multiple ? "group" : "radiogroup"} className={cn("grid gap-2", columns === 1 ? "" : columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3")}>
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          role={multiple ? "checkbox" : "radio"}
          aria-checked={on(it.id)}
          onClick={() => onChange(it.id)}
          className={cn("border px-4 py-3 text-left text-[15px] leading-snug transition-colors", on(it.id) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-dusty-rose")}
        >
          {it.label}
          {it.note && <span className={cn("mt-0.5 block text-[12px]", on(it.id) ? "text-primary-foreground/75" : "text-muted-foreground")}>{it.note}</span>}
        </button>
      ))}
    </div>
  );
}

export function StepHead({ step, total, title, hint }: { step: number; total: number; title: string; hint?: string }) {
  return (
    <div>
      <p className="font-display text-[14px] tracking-[0.2em] text-muted-foreground">STEP {step} / {total}</p>
      <div className="mt-2 h-px bg-border"><div className="h-px bg-primary transition-all" style={{ width: `${(step / total) * 100}%` }} /></div>
      <h2 className="mt-6 text-[24px] font-bold leading-snug tracking-[-0.03em] md:text-[28px]">{title}</h2>
      {hint && <p className="mt-2 text-[14px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function RecList({ recs, numbered = false }: { recs: Rec[]; numbered?: boolean }) {
  return (
    <ol className="divide-y divide-border border-y border-border">
      {recs.map((r, i) => (
        <li key={r.product.slug} className="grid gap-1 py-4 sm:grid-cols-[2rem_1fr_auto] sm:gap-4">
          {numbered ? <span className="font-display text-[20px] text-muted-foreground">{i + 1}</span> : <span className="hidden sm:block" />}
          <div className="min-w-0">
            <p className="text-[12px] text-muted-foreground">{levelsText(r.product.levels)} · {kindLabel(r.product.kind)}{r.product.deliveryType === "custom" ? ` · ${deliveryLabel("custom")}` : ""}</p>
            <Link href={`/books/${r.product.slug}`} className="mt-0.5 block text-[17px] font-semibold leading-snug hover:underline">{r.product.title}</Link>
            {r.reasons.length > 0 && <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/75">추천 이유: {r.reasons.join(" · ")}</p>}
          </div>
          <p className="text-[16px] font-semibold tabular-nums text-primary sm:text-right">{r.product.price !== null ? formatPrice(r.product.price) : "가격 상담"}</p>
        </li>
      ))}
    </ol>
  );
}

export const Disclaimer = ({ children }: { children: React.ReactNode }) => (
  <p className="border-l-2 border-mustard pl-3 text-[12px] leading-relaxed text-muted-foreground">{children}</p>
);

export function PageHead({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) {
  return (
    <header className="border-b border-border bg-muted">
      <div className="container-page max-w-3xl pb-10 pt-10 md:pb-14 md:pt-16">
        <p className="flex items-center gap-3 font-display text-[14px] font-semibold tracking-[0.26em] text-primary">{eyebrow}<span aria-hidden className="h-[2px] w-6 bg-mustard" /></p>
        <h1 className="mt-4 text-[32px] font-bold leading-[1.2] tracking-[-0.04em] text-secondary-foreground md:text-[44px]">{title}</h1>
        {lead && <p className="mt-4 max-w-xl text-[16px] leading-[1.8] text-muted-foreground">{lead}</p>}
      </div>
    </header>
  );
}

export const primaryBtn = "inline-flex h-12 items-center justify-center bg-primary px-7 text-[15px] font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-40";
export const lineBtn = "inline-flex h-12 items-center justify-center border border-dusty-rose/70 bg-card px-6 text-[15px] font-semibold text-secondary-foreground hover:bg-blush/50";
