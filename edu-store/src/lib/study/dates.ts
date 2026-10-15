/** 날짜 도우미 (서버·클라이언트 공용) */

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
