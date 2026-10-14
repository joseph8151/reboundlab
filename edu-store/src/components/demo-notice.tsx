import { Info } from "lucide-react";

export function DemoNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
      <Info className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
