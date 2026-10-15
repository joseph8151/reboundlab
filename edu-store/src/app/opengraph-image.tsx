import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = `${siteConfig.name} | 수능·내신 PDF 학습자료`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadKoreanFont() {
  try {
    const res = await fetch("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/public/static/Pretendard-Bold.otf");
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const font = await loadKoreanFont();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: "linear-gradient(180deg, #FCEBF0 0%, #FFFCF7 100%)", fontFamily: "Pretendard" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg, #B8365E 60%, #E3B94F 100%)" }} />
          <div style={{ display: "flex", flexDirection: "column" }}><div style={{ fontSize: 40, color: "#2D1B26" }}>{siteConfig.name}</div><div style={{ fontSize: 20, color: "#8A6A12", letterSpacing: 6 }}>{siteConfig.nameEn.toUpperCase()}</div></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 68, color: "#2D1B26", lineHeight: 1.2 }}>필요한 만큼, 정확하게.</div>
          <div style={{ fontSize: 68, color: "#B8365E", lineHeight: 1.2 }}>오늘 바로 시작하는 공부 자료</div>
        </div>
        <div style={{ fontSize: 30, color: "#7A6670" }}>수능 · 내신 기출 분석 · 변형문제 · 스터디가이드 · 자기주도학습 PDF</div>
      </div>
    ),
    { ...size, fonts: font ? [{ name: "Pretendard", data: font, weight: 700, style: "normal" }] : undefined },
  );
}
