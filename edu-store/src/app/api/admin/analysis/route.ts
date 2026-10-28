import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { getPassage, savePassage } from "@/lib/analysis/repo";
import { approvalProblems, isPublicStatus, type AnalysisPassage } from "@/lib/analysis/types";

export const runtime = "nodejs";
const deny = () => NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });

export async function GET(req: NextRequest) {
  if (!(await getAdminUser())) return deny();
  const p = await getPassage(req.nextUrl.searchParams.get("slug") ?? "", { all: true });
  return p ? NextResponse.json(p) : NextResponse.json({ message: "없는 지문입니다." }, { status: 404 });
}

/** 저장(신규·수정 공통). 승인·판매 중으로 올릴 때는 검수 체크리스트를 서버에서 다시 확인합니다. */
export async function PUT(req: NextRequest) {
  if (!(await getAdminUser())) return deny();
  const p = (await req.json().catch(() => null)) as AnalysisPassage | null;
  if (!p?.slug || !/^[a-z0-9-]+$/.test(p.slug)) return NextResponse.json({ message: "주소(slug)는 영문 소문자·숫자·하이픈만 쓸 수 있습니다." }, { status: 400 });
  if (isPublicStatus(p.status)) {
    const problems = approvalProblems(p);
    if (problems.length) return NextResponse.json({ message: `승인할 수 없습니다.\n${problems.join("\n")}` }, { status: 400 });
  }
  const { error } = await savePassage(p);
  return error ? NextResponse.json({ message: error.message }, { status: 400 }) : NextResponse.json({ ok: true });
}
