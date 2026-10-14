import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-lg border border-input bg-background px-3.5 text-[15px] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1 file:text-sm file:font-medium",
        type === "file" && "h-auto py-2",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
