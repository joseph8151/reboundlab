import type { Metadata } from "next";
import Link from "next/link";
import { getAdminUser } from "@/lib/auth";
import { analysisDemoMode, listPassages } from "@/lib/analysis/repo";
import { statusLabel } from "@/lib/analysis/types";
import { NewPassageForm } from "@/components/analysis/new-form";

export const metadata: Metadata = { title: "지문 분석 관리", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminAnalysis() {
  const demo = analysisDemoMode();
  if (!demo && !(await getAdminUser())) return <div className="container-page max-w-5xl py-14"><h1 className="text-[26px] font-bold">접근 권한이 없습니다</h1><p className="mt-3 text-muted-foreground">관리자 계정으로 로그인해 주세요.</p></div>;
  const list = await listPassages({ all: true });
  return (
    <div className="container-page max-w-5xl py-10 md:py-14">
      <Link href="/admin" className="text-[12.5px] text-muted-foreground hover:text-foreground">← 관리자</Link>
      <h1 className="mt-2 text-[28px] text-secondary-foreground">수능 영어 지문 분석</h1>
      {demo && <p className="mt-3 border-l-2 border-mustard pl-3 text-[12.5px] text-muted-foreground">데이터베이스(Supabase)가 연결되지 않은 미리보기 모드입니다. 수정·새 지문은 이 브라우저에만 저장됩니다. 연결하면 서버에 저장되고 승인된 것만 공개됩니다.</p>}
      <ul className="mt-6 divide-y divide-border border border-border bg-card">
        {list.map((p) => <li key={p.slug} className="flex flex-wrap items-center justify-between gap-2 p-4"><div><p className="font-semibold">{p.title}</p><p className="text-[12.5px] text-muted-foreground">{p.meta.questionType} · {statusLabel(p.status)} · 변형 {p.variants.length}문항</p></div><div className="flex gap-3 text-[13px] font-semibold"><Link className="text-primary" href={`/admin/analysis/${p.slug}`}>편집</Link><Link className="text-muted-foreground" href={`/analysis/${p.slug}`}>보기</Link></div></li>)}
      </ul>
      <h2 className="mt-10 text-[20px] text-secondary-foreground">새 지문 등록</h2>
      <NewPassageForm demo={demo} />
    </div>
  );
}
