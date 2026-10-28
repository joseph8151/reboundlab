"use client";
import { useEffect, useState } from "react";
import type { AnalysisPassage } from "./types";

export const localKey = (slug: string) => `melissa-analysis:${slug}`;

/** 데모(미연결) 모드에서는 관리자 편집본을 브라우저에 저장하므로, 화면에서도 그 편집본을 우선 보여 줍니다. */
export function useOverride(data: AnalysisPassage, demo?: boolean) {
  const [d, setD] = useState(data);
  useEffect(() => {
    if (!demo) { setD(data); return; }
    try {
      const raw = localStorage.getItem(localKey(data.slug));
      if (raw) setD(JSON.parse(raw) as AnalysisPassage);
    } catch { /* 저장소를 못 읽으면 기본 샘플을 보여 줍니다. */ }
  }, [data, demo]);
  return d;
}
