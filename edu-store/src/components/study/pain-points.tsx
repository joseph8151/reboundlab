import Link from "next/link";
import { ArrowRight, SquareCheckBig } from "lucide-react";
import { PAIN_POINTS } from "@/lib/study/tools";

export function PainPoints() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {PAIN_POINTS.map((p) => (
        <li key={p.pain}>
          <Link href={p.href} className="group flex h-full items-start gap-3 rounded-2xl border border-border bg-background p-5 transition-colors hover:border-primary/40">
            <SquareCheckBig className="mt-0.5 size-5 shrink-0 text-primary" />
            <span className="flex-1">
              <span className="block font-semibold">&ldquo;{p.pain}&rdquo;</span>
              <span className="mt-1 flex items-center gap-1 text-sm text-muted-foreground group-hover:text-primary">
                {p.fix} <ArrowRight className="size-3.5" />
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
