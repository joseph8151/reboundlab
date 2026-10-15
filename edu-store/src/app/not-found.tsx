import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-28">
      <p className="font-display text-[15px] font-semibold tracking-[0.3em] text-muted-foreground">404</p>
      <h1 className="mt-4 text-[32px] font-bold tracking-[-0.03em]">페이지를 찾을 수 없습니다.</h1>
      <p className="mt-3 text-muted-foreground">주소가 바뀌었거나 판매가 종료된 교재일 수 있습니다.</p>
      <p className="mt-8 flex gap-6 text-[15px]"><Link href="/books" className="underline underline-offset-4">전체 교재</Link><Link href="/" className="underline underline-offset-4">홈으로</Link></p>
    </div>
  );
}
