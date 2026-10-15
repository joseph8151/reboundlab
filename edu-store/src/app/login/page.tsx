import type { Metadata } from "next";
import { Suspense } from "react";
import { DemoNotice } from "@/components/demo-notice";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "관리자 로그인",
  description: "교재·가격 관리를 위한 관리자 전용 로그인입니다.",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <div className="container-page flex justify-center py-14 sm:py-20">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold">관리자 로그인</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">교재·가격 관리를 위한 관리자 전용 페이지입니다. 고객은 로그인 없이 상담 신청만 하시면 됩니다.</p>
        <div className="mt-8">
          {isSupabaseConfigured() ? (
            <Suspense>
              <LoginForm />
            </Suspense>
          ) : (
            <DemoNotice>
              데모 모드입니다. <code>.env.local</code>에 Supabase 환경 변수를 설정하면 관리자 로그인이 활성화됩니다.
            </DemoNotice>
          )}
        </div>
      </div>
    </div>
  );
}
