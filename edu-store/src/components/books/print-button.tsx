"use client";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="inline-flex h-11 items-center justify-center border border-dusty-rose/70 bg-card px-5 text-[14px] font-semibold text-secondary-foreground hover:bg-blush/50">
      인쇄 / PDF로 저장
    </button>
  );
}
