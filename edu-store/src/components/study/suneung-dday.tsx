"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/site";
import { daysBetween, todayKey } from "@/lib/study/dates";

/** 실제 수능일 기준 D-day. (가짜 마감 타이머 대신 학생에게 의미 있는 날짜만 보여 줍니다.) */
export function SuneungDday({ className }: { className?: string }) {
  const [d, setD] = useState<number | null>(null);
  useEffect(() => setD(daysBetween(todayKey(), siteConfig.suneungDate)), []);
  if (d === null || d < 0) return null;
  return <span className={className}>수능 {d === 0 ? "D-DAY" : `D-${d}`}</span>;
}
