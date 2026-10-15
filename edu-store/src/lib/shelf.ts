"use client";

import { useSyncExternalStore } from "react";

/**
 * 장바구니·위시리스트·최근 본 교재. 이 브라우저(localStorage)에만 저장되며 계정과 동기화되지 않습니다.
 * 결제 직전에 서버가 가격과 판매 상태를 다시 확인하므로, 여기에 저장된 값은 신뢰하지 않습니다.
 */
export type Shelf = { cart: string[]; wishlist: string[]; recent: string[] };

const KEY = "melisa:shelf:v1";
const EMPTY: Shelf = { cart: [], wishlist: [], recent: [] };
const listeners = new Set<() => void>();
let cache: Shelf | null = null;

function read(): Shelf {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const p = JSON.parse(raw);
    const clean = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, 60) : []);
    return { cart: clean(p.cart), wishlist: clean(p.wishlist), recent: clean(p.recent).slice(0, 12) };
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
  addToCart: (slug: string) => {
    const s = getSnapshot();
    if (!s.cart.includes(slug)) commit({ ...s, cart: [...s.cart, slug] });
  },
  removeFromCart: (slug: string) => commit({ ...getSnapshot(), cart: getSnapshot().cart.filter((x) => x !== slug) }),
  clearCart: () => commit({ ...getSnapshot(), cart: [] }),
  toggleWishlist: (slug: string) => {
    const s = getSnapshot();
    commit({ ...s, wishlist: s.wishlist.includes(slug) ? s.wishlist.filter((x) => x !== slug) : [slug, ...s.wishlist] });
  },
  pushRecent: (slug: string) => {
    const s = getSnapshot();
    if (s.recent[0] === slug) return;
    commit({ ...s, recent: [slug, ...s.recent.filter((x) => x !== slug)].slice(0, 12) });
  },
};

export function useShelf(): Shelf {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}
