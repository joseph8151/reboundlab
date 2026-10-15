"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { CircleCheckBig, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Props = { track: "suneung" | "middle"; trackLabel: string; endpoint: string; supportEmail: string };

const GRADES = {
  suneung: ["고1", "고2", "고3", "N수생", "기타"],
  middle: ["중1", "중2", "중3", "학부모(자녀 학년 아래에 적어 주세요)", "기타"],
};
const SUBJECTS = ["국어", "수학", "영어", "탐구", "전 과목", "자기주도학습·습관"];

export function ConsultForm({ track, trackLabel, endpoint, supportEmail }: Props) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);

    if (String(f.get("_gotcha") ?? "")) return; // 스팸 봇이 채우는 숨은 칸
    const contact = String(f.get("contact") ?? "").trim();
    const looksValid = /^\S+@\S+\.\S+$/.test(contact) || /^[0-9+\-\s]{9,15}$/.test(contact);
    if (!looksValid) {
      setState("error");
      setMessage("연락처에 이메일 또는 휴대폰 번호를 정확히 적어 주세요.");
      return;
    }

    setState("sending");
    setMessage(null);
    const payload = {
      _subject: `[${trackLabel}] ${String(f.get("name")).trim()} 님의 상담 신청`,
      구분: trackLabel,
      이름: String(f.get("name")).trim(),
      연락처: contact,
      학년: String(f.get("grade")),
      관심과목: f.getAll("subjects").join(", ") || "선택 안 함",
      상담내용: String(f.get("content")).trim(),
      // Formspree가 이메일 주소로 인식해 답장 대상으로 쓰도록, 이메일일 때만 보냅니다.
      ...(/^\S+@\S+\.\S+$/.test(contact) ? { email: contact } : {}),
    };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.errors?.[0]?.message ?? "전송에 실패했어요.");
      }
      form.reset();
      setState("done");
    } catch (err) {
      setState("error");
      setMessage(`${(err as Error).message} 잠시 후 다시 시도해 주세요.${supportEmail ? ` 계속 안 되면 ${supportEmail}로 보내 주세요.` : ""}`);
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-2xl bg-accent p-8 text-center" role="status">
        <CircleCheckBig className="mx-auto size-10 text-success" />
        <p className="mt-4 text-lg font-bold">상담 신청이 접수되었어요</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">남겨 주신 연락처로 영업일 기준 1일 이내에 답변드릴게요.</p>
        <Button variant="outline" className="mt-6" onClick={() => setState("idle")}>다른 내용 더 남기기</Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-border p-5 sm:p-6" aria-label={`${trackLabel} 신청 폼`}>
      {/* 스팸 방지용 숨은 칸 */}
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="c-name">이름 *</Label>
          <Input id="c-name" name="name" required maxLength={30} autoComplete="name" placeholder="학생 또는 보호자 이름" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-contact">연락처 * <span className="font-normal text-muted-foreground">(이메일 또는 휴대폰)</span></Label>
          <Input id="c-contact" name="contact" required maxLength={60} autoComplete="email" placeholder="name@example.com 또는 010-0000-0000" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="c-grade">학년 *</Label>
        <NativeSelect id="c-grade" name="grade" required defaultValue="">
          <option value="" disabled>선택</option>
          {GRADES[track].map((g) => <option key={g} value={g}>{g}</option>)}
        </NativeSelect>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">관심 과목 <span className="font-normal text-muted-foreground">(복수 선택)</span></legend>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((s) => (
            <label key={s} className="cursor-pointer">
              <input type="checkbox" name="subjects" value={s} className="peer sr-only" />
              <span className="inline-block rounded-md border border-border px-3.5 py-1.5 text-sm peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring">{s}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="c-content">상담 내용 *</Label>
        <Textarea
          id="c-content"
          name="content"
          required
          rows={6}
          maxLength={2000}
          placeholder={track === "suneung" ? "예: 현재 영어 3등급이고 빈칸 문제가 약해요. 12월까지 무엇부터 보면 좋을까요?" : "예: 중2 1학기 수학 서술형에서 자주 감점돼요. 어떤 자료가 맞을까요?"}
        />
      </div>

      <label className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
        <input type="checkbox" required className="mt-1 size-4 shrink-0 accent-primary" />
        <span>
          (필수) 상담 응대를 위해 이름·연락처·상담 내용을 수집·이용하고, 전송을 위해 Formspree(미국)에 처리를 맡기는 데 동의합니다. 상담 완료 후 1년 보관 뒤 파기합니다.{" "}
          <Link href="/privacy" target="_blank" className="underline">개인정보처리방침</Link> · 만 14세 미만은 보호자가 대신 작성해 주세요.
        </span>
      </label>

      {state === "error" && message && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-destructive">{message}</p>
      )}

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={state === "sending"}>
        {state === "sending" ? <><LoaderCircle className="animate-spin" /> 보내는 중…</> : "상담 신청하기"}
      </Button>
    </form>
  );
}
