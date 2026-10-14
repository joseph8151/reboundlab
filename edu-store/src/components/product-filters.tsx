"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, type FormEvent } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select";
import { GRADES, SUBJECTS, TYPES } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function ProductFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => router.replace(`/products${next.size ? `?${next}` : ""}`, { scroll: false }));
  };

  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q")?.toString().trim() ?? "";
    update("q", q || null);
  };

  const chip = (key: string, id: string | null, label: string) => {
    const active = (params.get(key) ?? null) === id;
    return (
      <button
        key={`${key}-${id}`}
        type="button"
        onClick={() => update(key, id)}
        aria-pressed={active}
        className={cn(
          "h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors",
          active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:text-foreground",
        )}
      >
        {label}
      </button>
    );
  };

  return (
    <div className={cn("space-y-4 transition-opacity", pending && "opacity-60")}>
      <form onSubmit={onSearch} className="flex gap-2" role="search">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            key={params.get("q") ?? ""}
            name="q"
            defaultValue={params.get("q") ?? ""}
            placeholder="자료명, 단원, 키워드로 검색"
            className="pl-10"
            aria-label="자료 검색"
          />
        </div>
        <Button type="submit">검색</Button>
      </form>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="w-10 shrink-0 text-sm font-semibold">과목</span>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {chip("subject", null, "전체")}
            {SUBJECTS.map((s) => chip("subject", s.id, s.label))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-10 shrink-0 text-sm font-semibold">학년</span>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {chip("grade", null, "전체")}
            {GRADES.map((g) => chip("grade", g.id, g.label))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-10 shrink-0 text-sm font-semibold">유형</span>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {chip("type", null, "전체")}
            {TYPES.map((t) => chip("type", t.id, t.label))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SortSelect() {
  const router = useRouter();
  const params = useSearchParams();
  return (
    <NativeSelect
      aria-label="정렬"
      className="w-36"
      value={params.get("sort") ?? "recent"}
      onChange={(e) => {
        const next = new URLSearchParams(params.toString());
        if (e.target.value === "recent") next.delete("sort");
        else next.set("sort", e.target.value);
        router.replace(`/products${next.size ? `?${next}` : ""}`, { scroll: false });
      }}
    >
      <option value="recent">최신순</option>
      <option value="price-asc">낮은 가격순</option>
      <option value="price-desc">높은 가격순</option>
    </NativeSelect>
  );
}
