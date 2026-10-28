import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const Tag = ({ children, tone = "plain" }: { children: ReactNode; tone?: "plain" | "wine" | "gold" | "ok" | "bad" }) => (
  <span className={cn("inline-block whitespace-nowrap px-1.5 py-px text-[11px] font-semibold", {
    "border border-dusty-rose/60 bg-light-pink text-secondary-foreground": tone === "plain",
    "bg-primary text-primary-foreground": tone === "wine",
    "bg-gold text-secondary-foreground": tone === "gold",
    "bg-success text-white": tone === "ok",
    "border border-destructive/60 bg-destructive/5 text-destructive": tone === "bad",
  })}>{children}</span>
);

export const Label = ({ children }: { children: ReactNode }) => (
  <p className="flex items-center gap-1.5 text-[11.5px] font-bold tracking-[0.04em] text-primary"><span aria-hidden className="inline-block size-[6px] bg-primary" />{children}</p>
);

export const Panel = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("border border-border bg-card p-4 sm:p-5", className)}>{children}</div>
);

/** ⟦① that⟧ 표기를 밑줄로, __________ 는 빈칸 선으로 보여 줍니다. */
export function MarkedText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(⟦[^⟧]+⟧)/g);
  return (
    <span className={cn("whitespace-pre-line", className)}>
      {parts.map((p, i) => {
        const m = /^⟦([^⟧]+)⟧$/.exec(p);
        if (m) return <u key={i} className="decoration-primary decoration-2 underline-offset-4">{m[1]}</u>;
        return <span key={i}>{p}</span>;
      })}
    </span>
  );
}

/** 연결어를 강조 표시합니다. */
export function Emph({ text, words }: { text: string; words?: string[] }) {
  if (!words?.length) return <>{text}</>;
  const re = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "i");
  return <>{text.split(re).map((p, i) => (re.test(p) && words.some((w) => w.toLowerCase() === p.toLowerCase()) ? <mark key={i} className="bg-gold/70 px-0.5 font-semibold text-secondary-foreground">{p}</mark> : <span key={i}>{p}</span>))}</>;
}
