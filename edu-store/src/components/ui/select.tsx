import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** 모바일에서 OS 기본 선택창이 뜨도록 네이티브 select를 shadcn 스타일로 감쌌습니다. */
function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <div className={cn("relative", className)}>
      <select
        className="h-11 w-full appearance-none rounded-lg border border-input bg-background pl-3.5 pr-9 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        {...props}
      />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export { NativeSelect };
