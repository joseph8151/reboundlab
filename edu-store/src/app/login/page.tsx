import type { Metadata } from "next";
import { Suspense } from "react";
import { DemoNotice } from "@/components/demo-notice";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "로그인",
  description: "로그인하고 구매한 자료를 내 자료함에서 내려받으세요.",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <div className="container-page flex justify-center py-14 sm:py-20">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold">로그인</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">구매한 자료는 로그인한 계정의 내 자료함에 보관됩니다.</p>
        <div className="mt-8">
          {isSupabaseConfigured() ? (
            <Suspense>
              <LoginForm />
            </Suspense>
          ) : (
            <DemoNotice>
              데모 모드입니다. <code>.env.local</code>에 Supabase 환경 변수를 설정하면 회원가입·로그인이 활성화됩니다.
            </DemoNotice>
          )}
        </div>
      </div>
    </div>
  );
}
