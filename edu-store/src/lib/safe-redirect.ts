/** 오픈 리다이렉트를 막기 위해 같은 사이트 내부 경로만 허용합니다. */
export function safeNextPath(next: string | null | undefined, fallback = "/mypage") {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
