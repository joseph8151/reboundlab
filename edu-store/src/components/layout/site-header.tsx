import { isSupabaseConfigured } from "@/lib/supabase/env";
import { HeaderClient } from "./header-client";

export function SiteHeader() {
  return (
    <>
      {!isSupabaseConfigured() && (
        <p className="bg-sand px-4 py-1.5 text-center text-[12px] leading-snug text-foreground">
          미리보기 환경입니다. 교재 데이터베이스와 결제가 아직 연결되지 않아, 표시된 교재는 구매할 수 없는 예시 구성입니다.
        </p>
      )}
      <HeaderClient authEnabled={isSupabaseConfigured()} />
    </>
  );
}
