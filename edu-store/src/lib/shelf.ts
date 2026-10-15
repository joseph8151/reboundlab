"use client";

import { useSyncExternalStore } from "react";

/** 최근 본 교재. 이 브라우저(localStorage)에만 저장되며 서버로 전송되지 않습니다. */
export type Shelf = { recent: string[] };

const KEY = "melisa:shelf:v1";
const EMPTY: Shelf = { recent: [] };
const listeners = new Set<() => void>();
let cache: Shelf | null = null;

function read(): Shelf {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const p = JSON.parse(raw);
    const clean = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, 60) : []);
    return { recent: clean(p.recent).slice(0, 12) };
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): Shelf {
  return (cache ??= read());
}

function commit(next: Shelf) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // 저장이 막힌 환경에서도 이번 방문 동안은 동작합니다.
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export const shelfActions = {
  pushRecent: (slug: string) => {
    const s = getSnapshot();
    if (s.recent[0] === slug) return;
    commit({ ...s, recent: [slug, ...s.recent.filter((x) => x !== slug)].slice(0, 12) });
  },
};

export function useShelf(): Shelf {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}
