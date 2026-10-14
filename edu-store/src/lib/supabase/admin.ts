import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./env";

/**
 * service_role 키를 쓰는 관리자 클라이언트. RLS를 우회하므로
 * 주문 생성·결제 승인·서명 URL 발급처럼 서버에서 검증을 마친 작업에만 사용하세요.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.");
  return createClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** 쿠키 없이 공개 데이터(상품)만 읽는 클라이언트. 정적 생성/ISR 페이지에서 사용합니다. */
export function createPublicClient() {
  return createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "", {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
