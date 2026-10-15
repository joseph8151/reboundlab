"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { CircleCheckBig, LoaderCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectBox } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CONSULT_COPY, CONSULT_ENDPOINT, CONSULT_TITLES, clearDraft, formatPhone, isValidMobile, loadDraft, submitConsult,
  type ConsultDraft, type ConsultPayload, type InquiryType,
} from "@/lib/consult";
import type { ConsultOption } from "@/lib/consult-products";
import { formatPrice } from "@/lib/utils";

type Props = {
  mode: InquiryType;
  options: ConsultOption[];
  initialSlugs: string[];
  /** 서버가 판단한 엔드포인트 설정 여부(빌드 값). 비어 있으면 접수를 막습니다. */
  endpoint?: string;
  supportContact?: string;
};

const GRADES = ["중1", "중2", "중3", "고1", "고2", "고3", "N수생", "기타"];
const SUBJECTS = ["국어", "수학", "영어", "사회탐구", "과학탐구", "종합·기타"];
const LEVELS = ["기초 개념 보완", "중위권 유형 정리", "상위권 심화 훈련", "최상위권 실전 대비"];
const ACADEMY_SERVICES = ["수업용 문제집", "단원별 문제지", "내신 대비 자료", "서술형 문제집", "시험 대비 모의고사", "맞춤형 PDF 교재", "단체 이용·라이선스 상담"];

const label = "mb-1.5 block text-[13px] font-semibold";

export function ConsultForm({ mode, options, initialSlugs, endpoint = CONSULT_ENDPOINT, supportContact }: Props) {
  const pathname = usePathname();
  const t = CONSULT_TITLES[mode];
  const bySlug = useMemo(() => new Map(options.map((o) => [o.slug, o])), [options]);
  const [slugs, setSlugs] = useState<string[]>(initialSlugs.filter((s) => bySlug.has(s)));
  const [draft, setDraft] = useState<ConsultDraft | null>(null);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [currentLevel, setCurrentLevel] = useState("");
  const [targetLevel, setTargetLevel] = useState("");
  const [examDate, setExamDate] = useState("");
  const messageTouched = useRef(false);

  // 진단·구성 도구에서 넘어온 정보를 한 번 읽어 옵니다(다시 입력하지 않도록).
  useEffect(() => {
    const d = loadDraft();
    // 다른 유형의 상담(예: 학원 문의)에는 이전 도구에서 넘어온 정보를 붙이지 않습니다.
    if (!d || (d.inquiryType ?? "book") !== mode) return;
    setDraft(d);
    if (d.slugs?.length) setSlugs((cur) => [...new Set([...cur, ...d.slugs!.filter((s) => bySlug.has(s))])]);
    if (d.grade) setGrade(d.grade);
    if (d.subject) setSubject(d.subject);
    if (d.currentLevel) setCurrentLevel(d.currentLevel);
    if (d.targetLevel) setTargetLevel(d.targetLevel);
    if (d.examDate) setExamDate(d.examDate);
    if (d.message && !messageTouched.current) setMessage(d.message);
  }, [bySlug, mode]);

  useEffect(() => {
    if (mode === "book" && slugs.length && !message && !messageTouched.current) setMessage("구매를 원합니다. 계좌이체 방법과 PDF 교재 구성에 대해 문자로 안내해 주세요.");
  }, [mode, slugs.length, message]);

  const chosen = slugs.map((s) => bySlug.get(s)).filter((o): o is ConsultOption => Boolean(o));
  const priced = chosen.filter((o) => o.price !== null);
  const total = priced.length === chosen.length && chosen.length ? priced.reduce((a, o) => a + (o.price ?? 0), 0) : null;
  const available = options.filter((o) => !slugs.includes(o.slug));
  const needsProduct = mode === "book" || mode === "errata";

  function draftSummary(d: ConsultDraft) {
    const rows: [string, string][] = [];
    if (d.grade) rows.push(["학년", d.grade]);
    if (d.subject) rows.push(["과목", d.subject]);
    if (d.currentLevel) rows.push(["현재", d.currentLevel]);
    if (d.targetLevel) rows.push(["목표", d.targetLevel]);
    if (d.examDate) rows.push(["시험일", d.examDate]);
    if (d.weakTypes?.length) rows.push(["어려운 유형", d.weakTypes.join(", ")]);
    if (d.diagnosis) rows.push(["진단 요약", d.diagnosis]);
    if (d.customSpec) rows.push(["구성 요청", d.customSpec]);
    return rows;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (String(f.get("_gotcha") ?? "")) return; // 스팸 봇이 채우는 숨은 칸: 전송하지 않습니다.

    const name = String(f.get("name") ?? "").trim();
    if (!name) return fail("이름을 입력해 주세요.");
    if (!isValidMobile(phone)) {
      setPhoneError("휴대전화 번호를 010-1234-5678 형식으로 입력해 주세요.");
      return fail(null);
    }
    setPhoneError(null);
    if (needsProduct && !chosen.length) return fail(mode === "errata" ? "교재를 선택해 주세요." : "관심 교재를 선택해 주세요.");
    const text = message.trim();
    if (!text) return fail("문의 내용을 입력해 주세요.");
    if (!f.get("privacy_consent")) return fail("개인정보 수집·이용에 동의해 주세요.");
    if (!endpoint) {
      setState("error");
      setError("상담 접수 주소가 설정되지 않아 전송할 수 없습니다. 운영자 설정이 끝난 뒤 다시 시도해 주세요.");
      return;
    }

    const payload: ConsultPayload = {
      inquiry_type: mode,
      name,
      phone,
      product: chosen.map((o) => o.title).join(", "),
      product_id: chosen.map((o) => o.id).join(","),
      price: total !== null ? total : chosen.map((o) => (o.price !== null ? `${o.title} ${formatPrice(o.price)}` : o.title)).join(" / "),
      contact_method: String(f.get("contact_method") ?? "문자 상담"),
      message: text,
      source_page: typeof window !== "undefined" ? window.location.href : pathname,
      submitted_at: new Date().toISOString(),
      privacy_consent: true,
    };
    const put = (k: string, v: unknown) => {
      if (typeof v === "string" && v.trim()) payload[k] = v.trim();
    };
    put("student_grade", grade);
    put("subject", subject);
    put("current_level", currentLevel);
    put("target_level", targetLevel);
    put("exam_date", examDate);
    if (mode === "academy") {
      put("academy_name", String(f.get("academy_name") ?? ""));
      put("target_grade", String(f.get("target_grade") ?? ""));
      put("usage_scale", String(f.get("usage_scale") ?? ""));
      put("services", f.getAll("services").join(", "));
    }
    if (mode === "parent") put("phone_owner", "학부모(보호자)");
    if (mode === "errata") put("error_location", String(f.get("error_location") ?? ""));
    if (draft) {
      put("diagnosis_source", draft.source);
      put("weak_types", draft.weakTypes?.join(", "));
      put("diagnosis", draft.diagnosis);
      put("recommended_books", draft.recommended?.join(", "));
      put("custom_spec", draft.customSpec);
    }

    setState("sending");
    setError(null);
    const res = await submitConsult(payload, endpoint);
    if (res.ok) {
      clearDraft();
      setState("done");
      return;
    }
    setState("error");
    setError(
      res.reason === "no-endpoint"
        ? "상담 접수 주소가 설정되지 않아 전송할 수 없습니다."
        : `접수에 실패했습니다. 잠시 후 다시 시도해 주세요${supportContact ? ` (급하시면 ${supportContact}로 문의해 주세요)` : ""}.${res.detail ? ` (${res.detail})` : ""}`,
    );
  }

  function fail(msg: string | null) {
    setState("error");
    setError(msg);
  }

  if (state === "done") {
    return (
      <div role="status" className="border border-blush bg-blush/60 p-6 sm:p-8">
        <CircleCheckBig className="size-6 text-success" aria-hidden />
        <p className="mt-3 text-[19px] font-semibold leading-snug">교재 상담 신청이 접수되었습니다.</p>
        <p className="mt-2 text-[14px] leading-relaxed text-foreground/80">멜리사 에듀 담당자가 남겨주신 연락처로 교재 구성과 계좌이체 방법을 안내해 드리겠습니다.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="/books" className="inline-flex h-11 items-center bg-primary px-5 text-[14px] font-semibold text-primary-foreground hover:bg-primary-hover">다른 교재 둘러보기</a>
          <a href="/" className="inline-flex h-11 items-center border border-dusty-rose/70 bg-card px-5 text-[14px] font-semibold text-secondary-foreground hover:bg-blush/50">홈페이지로 돌아가기</a>
        </div>
      </div>
    );
  }

  const rows = draft ? draftSummary(draft) : [];

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6" aria-label={t.title}>
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px] h-0 w-0 opacity-0" />

      {mode === "book" && chosen.length > 0 && (
        <div className="border-y border-primary/30 py-5">
          <p className="text-[12px] font-semibold tracking-[0.1em] text-muted-foreground">관심 교재</p>
          <p className="mt-1.5 text-[22px] font-bold leading-snug tracking-[-0.03em] text-secondary-foreground">{chosen.map((o) => o.title).join(" · ")}</p>
          <p className="mt-2 text-[17px] tabular-nums">판매가: <strong className="text-primary">{total !== null ? formatPrice(total) : "상담 시 안내"}</strong>{chosen.length > 1 && total !== null ? <span className="ml-2 text-[13px] text-muted-foreground">({chosen.length}권 합계)</span> : null}</p>
        </div>
      )}

      {rows.length > 0 && (
        <div className="border border-blush bg-card p-4 text-[13px] leading-relaxed">
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold">{draft?.source}에서 입력하신 정보가 상담 신청에 함께 전달됩니다.</p>
            <button type="button" className="shrink-0 text-muted-foreground underline underline-offset-2" onClick={() => { clearDraft(); setDraft(null); }}>
              지우기
            </button>
          </div>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            {rows.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="break-words">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {mode === "academy" && (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="academy_name" className={label}>학원·기관명 *</Label>
            <Input id="academy_name" name="academy_name" required autoComplete="organization" />
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name" className={label}>{mode === "academy" ? "담당자명 *" : "성함 *"}</Label>
          <Input id="name" name="name" autoComplete="name" required placeholder="이름을 입력해 주세요" />
        </div>
        <div>
          <Label htmlFor="phone" className={label}>{mode === "parent" ? "보호자 휴대전화 *" : "휴대전화 *"}</Label>
          <Input
            id="phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel" placeholder="010-1234-5678" required
            value={phone} onChange={(e) => { setPhone(formatPhone(e.target.value)); setPhoneError(null); }}
            aria-invalid={Boolean(phoneError)} aria-describedby={phoneError ? "phone-error" : undefined}
          />
          {phoneError && <p id="phone-error" className="mt-1.5 text-[12px] text-destructive">{phoneError}</p>}
        </div>
      </div>

      {mode !== "academy" && (
        <div>
          <Label htmlFor="product-add" className={label}>{mode === "errata" ? "해당 교재 *" : mode === "custom" ? "관심 교재 (선택)" : chosen.length ? "교재 추가 또는 변경" : "관심 교재 *"}</Label>
          {chosen.length > 0 && (
            <ul className="mb-2 divide-y divide-border border border-border bg-card">
              {chosen.map((o) => (
                <li key={o.slug} className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-[14px]">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{o.title}</span>
                    <span className="text-[12px] text-muted-foreground tabular-nums">
                      {o.kind === "package" ? "패키지 · " : ""}{o.price !== null ? formatPrice(o.price) : "가격 상담"}
                    </span>
                  </span>
                  <button type="button" aria-label={`${o.title} 제거`} className="p-1 text-muted-foreground hover:text-foreground" onClick={() => setSlugs(slugs.filter((s) => s !== o.slug))}>
                    <X className="size-4" />
                  </button>
                </li>
              ))}
              {total !== null && chosen.length > 1 && (
                <li className="flex justify-between bg-muted px-3.5 py-2 text-[13px]"><span>선택 교재 합계</span><span className="font-semibold tabular-nums">{formatPrice(total)}</span></li>
              )}
            </ul>
          )}
          <SelectBox>
            <select
              id="product-add"
              value=""
              onChange={(e) => e.target.value && setSlugs((cur) => (mode === "errata" ? [e.target.value] : [...cur, e.target.value]))}
              className="h-11 w-full appearance-none rounded-lg border border-input bg-card pl-3.5 pr-9 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">{chosen.length ? "교재 추가 선택" : "교재를 선택해 주세요"}</option>
              {available.map((o) => (
                <option key={o.slug} value={o.slug}>{o.kind === "package" ? "[패키지] " : ""}{o.title}{o.price !== null ? ` — ${formatPrice(o.price)}` : ""}</option>
              ))}
            </select>
          </SelectBox>
          {mode === "book" && chosen.length > 0 && (
            <p className="mt-1.5 text-[12px] text-muted-foreground">PDF가 아직 완성되지 않은 교재는 주문 제작 상담으로 진행되며, 제작 가능 여부와 납품 시점은 상담에서 안내해 드립니다.</p>
          )}
        </div>
      )}

      {mode === "academy" && (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="subject" className={label}>과목</Label>
              <SelectBox><select id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="h-11 w-full appearance-none rounded-lg border border-input bg-card pl-3.5 pr-9 text-[15px]"><option value="">선택</option>{SUBJECTS.map((s) => <option key={s}>{s}</option>)}</select></SelectBox>
            </div>
            <div>
              <Label htmlFor="target_grade" className={label}>대상 학년</Label>
              <Input id="target_grade" name="target_grade" placeholder="예: 고1·고2" />
            </div>
          </div>
          <div>
            <Label htmlFor="usage_scale" className={label}>예상 이용 규모</Label>
            <Input id="usage_scale" name="usage_scale" placeholder="예: 학생 30명, 월 2회 수업" />
          </div>
          <fieldset>
            <legend className={label}>관심 서비스</legend>
            <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {ACADEMY_SERVICES.map((s) => (
                <label key={s} className="flex items-center gap-2 text-[14px]"><input type="checkbox" name="services" value={s} className="size-4 accent-[var(--primary)]" />{s}</label>
              ))}
            </div>
          </fieldset>
        </>
      )}

      {(mode === "book" || mode === "parent" || mode === "custom") && (
        <details className="border-y border-blush py-3" open={Boolean(grade || subject || currentLevel || targetLevel || examDate) || mode === "parent"}>
          <summary className="cursor-pointer text-[14px] font-semibold">학습 정보 (선택)</summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><Label className={label}>{mode === "parent" ? "자녀 학년" : "학년"}</Label><SelectBox><select value={grade} onChange={(e) => setGrade(e.target.value)} className="h-11 w-full appearance-none rounded-lg border border-input bg-card pl-3.5 pr-9 text-[15px]"><option value="">선택 안 함</option>{GRADES.map((g) => <option key={g}>{g}</option>)}</select></SelectBox></div>
            <div><Label className={label}>과목</Label><SelectBox><select value={subject} onChange={(e) => setSubject(e.target.value)} className="h-11 w-full appearance-none rounded-lg border border-input bg-card pl-3.5 pr-9 text-[15px]"><option value="">선택 안 함</option>{SUBJECTS.map((g) => <option key={g}>{g}</option>)}</select></SelectBox></div>
            <div><Label className={label}>현재 성적대</Label><SelectBox><select value={currentLevel} onChange={(e) => setCurrentLevel(e.target.value)} className="h-11 w-full appearance-none rounded-lg border border-input bg-card pl-3.5 pr-9 text-[15px]"><option value="">선택 안 함</option>{LEVELS.map((g) => <option key={g}>{g}</option>)}</select></SelectBox></div>
            <div><Label className={label}>목표 성적대</Label><SelectBox><select value={targetLevel} onChange={(e) => setTargetLevel(e.target.value)} className="h-11 w-full appearance-none rounded-lg border border-input bg-card pl-3.5 pr-9 text-[15px]"><option value="">선택 안 함</option>{LEVELS.map((g) => <option key={g}>{g}</option>)}</select></SelectBox></div>
            <div><Label className={label}>시험 예정일</Label><Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} /></div>
          </div>
          {mode === "parent" && <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">만 14세 미만 학생의 이름·연락처는 받지 않습니다. 보호자(학부모) 연락처만 남겨 주세요.</p>}
        </details>
      )}

      {mode === "errata" && (
        <div>
          <Label htmlFor="error_location" className={label}>오류 위치 (쪽·문항 번호)</Label>
          <Input id="error_location" name="error_location" placeholder="예: 32쪽 7번" />
        </div>
      )}

      <div>
        <Label htmlFor="message" className={label}>{mode === "errata" ? "오류 내용 또는 해설 문의 *" : "문의 내용 *"}</Label>
        <Textarea
          id="message" name="message" required rows={7} className="min-h-40 text-[16px] leading-relaxed" value={message}
          onChange={(e) => { messageTouched.current = true; setMessage(e.target.value); }}
          placeholder={mode === "academy" ? "필요하신 교재 구성과 수업 방식을 적어 주세요." : "현재 학습 상황이나 궁금한 점을 자유롭게 적어 주세요. 문자로 상담해 드립니다."}
        />
      </div>

      {mode !== "errata" && (
        <fieldset>
          <legend className={label}>희망 연락 방식</legend>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
            <label className="flex items-center gap-2"><input type="radio" name="contact_method" value="문자 상담" defaultChecked className="size-4 accent-[var(--primary)]" />문자 상담</label>
            <label className="flex items-center gap-2"><input type="radio" name="contact_method" value="전화 상담" className="size-4 accent-[var(--primary)]" />전화 상담</label>
            <label className="flex items-center gap-2"><input type="radio" name="contact_method" value="문자·전화 모두 가능" className="size-4 accent-[var(--primary)]" />문자·전화 모두 가능</label>
          </div>
        </fieldset>
      )}

      <label className="flex items-start gap-2.5 text-[13px] leading-relaxed">
        <input type="checkbox" name="privacy_consent" className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]" />
        <span>
          [필수] 개인정보 수집·이용에 동의합니다. 수집 항목: 이름, 휴대전화, 문의 내용(및 입력한 학습 정보) / 목적: 교재 상담·구매 안내 / 보관: 상담 종료 후 지체 없이 파기(관계 법령에 따른 보존 제외).{" "}
          <a href="/privacy" target="_blank" className="underline underline-offset-2">자세히</a>
        </span>
      </label>

      <p className="text-[12.5px] leading-relaxed text-muted-foreground"><span className="bg-[linear-gradient(transparent_62%,var(--gold-soft)_62%)] font-medium text-secondary-foreground">상담 신청은 결제가 아닙니다.</span> 교재 구성과 구매 절차를 안내받으신 후 계좌이체로 결제하실 수 있습니다.</p>

      {error && <p role="alert" className="border-l-2 border-destructive bg-destructive/5 px-3 py-2 text-[13px] text-destructive">{error}</p>}
      {!endpoint && <p role="alert" className="text-[13px] text-destructive">상담 접수 주소가 설정되지 않았습니다. 운영자 설정이 필요합니다.</p>}

      <Button type="submit" size="lg" className="w-full sm:w-auto sm:min-w-56" disabled={state === "sending"}>
        {state === "sending" && <LoaderCircle className="animate-spin" />}
        {state === "sending" ? "전송 중" : t.submit}
      </Button>
    </form>
  );
}
