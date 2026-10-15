"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type Stored<T> = { data: T; updatedAt: string };

function readLocal<T>(key: string): Stored<T> | null {
  try {
    const raw = window.localStorage.getItem(`study:${key}`);
    return raw ? (JSON.parse(raw) as Stored<T>) : null;
  } catch {
    return null;
  }
}

function writeLocal<T>(key: string, value: Stored<T>) {
  try {
    window.localStorage.setItem(`study:${key}`, JSON.stringify(value));
  } catch {
    // 시크릿 모드 등에서 저장이 막혀도 화면은 계속 동작합니다.
  }
}

/**
 * 학습 기록 저장 훅. 기본은 이 브라우저(localStorage)에 저장하고,
 * 로그인 상태면 Supabase study_progress 테이블과 동기화해 다른 기기에서도 이어서 볼 수 있습니다.
 */
export function useStudyProgress<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  const [synced, setSynced] = useState(false);
  const userId = useRef<string | null>(null);
  const skipSave = useRef(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const local = readLocal<T>(key);
      let best = local;
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        const uid = data.session?.user.id ?? null;
        userId.current = uid;
        if (uid) {
          const { data: row } = await supabase
            .from("study_progress")
            .select("data, updated_at")
            .eq("user_id", uid)
            .eq("key", key)
            .maybeSingle();
          if (row && (!local || row.updated_at > local.updatedAt)) best = { data: row.data as T, updatedAt: row.updated_at };
          if (!cancelled) setSynced(true);
        }
      }
      if (cancelled) return;
      if (best) setValue(best.data);
      skipSave.current = true;
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    const stored = { data: value, updatedAt: new Date().toISOString() };
    writeLocal(key, stored);
    const uid = userId.current;
    if (!uid) return;
    const timer = setTimeout(() => {
      createClient()
        .from("study_progress")
        .upsert({ user_id: uid, key, data: value, updated_at: stored.updatedAt })
        .then(({ error }) => error && console.warn("[study] 동기화 실패", error.message));
    }, 800);
    return () => clearTimeout(timer);
  }, [key, value, loaded]);

  return { value, setValue, loaded, synced } as const;
}

/** 한국 시간 기준 YYYY-MM-DD */
export function todayKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(date);
}

export function addDays(key: string, days: number) {
  const d = new Date(`${key}T00:00:00+09:00`);
  d.setUTCDate(d.getUTCDate() + days);
  return todayKey(d);
}

export function daysBetween(from: string, to: string) {
  return Math.round((new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / 86400000);
}
