export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Supabase 환경 변수가 없으면 샘플 데이터로 동작하는 '데모 모드'가 됩니다. */
export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("xxxx"));
}

export const STORAGE_BUCKETS = {
  /** 비공개: 판매용 PDF 원본. 서명 URL로만 내려받을 수 있습니다. */
  files: "product-files",
  /** 공개: 썸네일, 워터마크가 들어간 샘플 이미지 */
  assets: "product-assets",
} as const;
