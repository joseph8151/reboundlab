"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookCover } from "./book-cover";
import { shelfActions, useShelf } from "@/lib/shelf";
import type { Product } from "@/lib/types";

type Mini = Pick<Product, "slug" | "title" | "series" | "area" | "course" | "levels" | "kind" | "curriculum" | "examYear" | "coverUrl" | "collection">;

/** 최근 본 교재: 서버에서 목록을 받아 두고, 이 브라우저에서 본 순서대로 보여 줍니다. */
export function RecentBooks({ catalog, excludeSlug }: { catalog: Mini[]; excludeSlug?: string }) {
  const { recent } = useShelf();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const books = mounted ? recent.filter((s) => s !== excludeSlug).map((s) => catalog.find((c) => c.slug === s)).filter((x): x is Mini => Boolean(x)).slice(0, 6) : [];
  if (!books.length) return null;
  return (
    <section className="container-page mt-20" aria-label="최근 본 교재">
      <h2 className="text-[13px] font-semibold tracking-[0.12em] text-muted-foreground">최근 본 교재</h2>
      <ul className="mt-4 flex gap-4 overflow-x-auto pb-2">
        {books.map((b) => (
          <li key={b.slug} className="w-[88px] shrink-0 sm:w-[104px]">
            <Link href={`/books/${b.slug}`} aria-label={b.title}><BookCover product={b} sizes="104px" /></Link>
            <p className="mt-2 line-clamp-2 text-[12px] leading-snug">{b.title}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 상세 페이지를 열면 최근 본 교재에 기록합니다. */
export function RecentTracker({ slug }: { slug: string }) {
  useEffect(() => shelfActions.pushRecent(slug), [slug]);
  return null;
}
