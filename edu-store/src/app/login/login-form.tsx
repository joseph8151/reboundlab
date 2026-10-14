"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { safeNextPath } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const ERROR_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "이메일 또는 비밀번호가 올바르지 않습니다.",
  "Email not confirmed": "이메일 인증이 아직 완료되지 않았습니다. 받은편지함을 확인해 주세요.",
  "User already registered": "이미 가입된 이메일입니다. 로그인해 주세요.",
};

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"));
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "info"; text: string } | null>(
    params.get("error") ? { type: "error", text: "인증에 실패했습니다. 다시 시도해 주세요." } : null,
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));
    const supabase = createClient();
    setLoading(true);
    setMessage(null);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return setMessage({ type: "error", text: ERROR_MESSAGES[error.message] ?? error.message });
      router.replace(next);
      router.refresh();
      return;
    }

    if (!form.get("agree")) {
      setLoading(false);
      return setMessage({ type: "error", text: "이용약관과 개인정보 수집·이용에 동의해 주세요." });
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setLoading(false);
    if (error) return setMessage({ type: "error", text: ERROR_MESSAGES[error.message] ?? error.message });
    if (data.session) {
      router.replace(next);
      router.refresh();
    } else {
      setMessage({ type: "info", text: `${email}로 인증 메일을 보냈습니다. 메일의 링크를 누르면 가입이 완료됩니다.` });
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 rounded-lg bg-muted p-1 text-sm font-semibold">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setMessage(null);
            }}
            className={cn("rounded-md py-2", mode === m ? "bg-background shadow-sm" : "text-muted-foreground")}
          >
            {m === "signin" ? "로그인" : "회원가입"}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            minLength={8}
            required
            placeholder="8자 이상"
          />
        </div>
        {mode === "signup" && (
          <label className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
            <input type="checkbox" name="agree" className="mt-1 size-4 accent-primary" />
            <span>
              (필수) <a href="/terms" target="_blank" className="underline">이용약관</a>과{" "}
              <a href="/privacy" target="_blank" className="underline">개인정보 수집·이용</a>에 동의합니다. 만 14세 미만은 법정대리인의 동의가 필요합니다.
            </span>
          </label>
        )}
        {message && (
          <p role="alert" className={cn("rounded-lg p-3 text-sm", message.type === "error" ? "bg-red-50 text-destructive" : "bg-accent text-accent-foreground")}>
            {message.text}
          </p>
        )}
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "처리 중…" : mode === "signin" ? "로그인" : "가입하기"}
        </Button>
      </form>
    </div>
  );
}
