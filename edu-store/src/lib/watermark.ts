import "server-only";
import { createHash } from "node:crypto";
import { degrees, PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { createAdminClient } from "./supabase/admin";
import { STORAGE_BUCKETS } from "./supabase/env";

export function isWatermarkEnabled() {
  return process.env.PDF_WATERMARK !== "false";
}

/** 표준 PDF 폰트는 한글을 못 쓰므로 ASCII만 남깁니다. */
const ascii = (s: string) => s.replace(/[^\x20-\x7E]/g, "?");

/**
 * 구매자 정보(이메일·주문번호)를 모든 페이지 하단과 대각선에 옅게 새긴 PDF를 만들어
 * 비공개 버킷의 stamped/ 경로에 캐시합니다. 원본이 바뀌면(수정본) 경로 해시가 달라져 새로 만듭니다.
 * 반환값: 서명 URL을 발급할 저장 경로
 */
export async function getStampedPath(params: { filePath: string; orderUuid: string; orderId: string; email: string }) {
  const admin = createAdminClient();
  const bucket = admin.storage.from(STORAGE_BUCKETS.files);
  const hash = createHash("sha256").update(params.filePath).digest("hex").slice(0, 12);
  const stampedPath = `stamped/${params.orderUuid}-${hash}.pdf`;

  const { data: existing } = await bucket.list("stamped", { search: `${params.orderUuid}-${hash}` });
  if (existing?.some((f) => f.name === `${params.orderUuid}-${hash}.pdf`)) return stampedPath;

  const { data: original, error } = await bucket.download(params.filePath);
  if (error || !original) throw new Error(`원본 다운로드 실패: ${error?.message}`);

  const pdf = await PDFDocument.load(await original.arrayBuffer(), { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const footer = ascii(`Licensed to ${params.email} | Order ${params.orderId} | Personal study use only - do not share`);
  const diagonal = ascii(params.email);

  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();
    const size = Math.max(6, Math.min(8, width / 90));
    page.drawText(footer, { x: 24, y: 12, size, font, color: rgb(0.45, 0.47, 0.52), opacity: 0.8 });
    page.drawText(diagonal, {
      x: width * 0.18,
      y: height * 0.3,
      size: Math.min(28, width / 18),
      font,
      color: rgb(0.12, 0.31, 0.82),
      opacity: 0.06,
      rotate: degrees(35),
    });
  }
  pdf.setProducer("[brand] study store");
  const bytes = await pdf.save();

  const { error: upErr } = await bucket.upload(stampedPath, bytes, { contentType: "application/pdf", upsert: true });
  if (upErr) throw new Error(`워터마크 PDF 저장 실패: ${upErr.message}`);
  return stampedPath;
}
