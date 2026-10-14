import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-28 text-center">
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="mt-2 text-2xl font-bold">페이지를 찾을 수 없습니다</h1>
      <p className="mt-3 text-muted-foreground">주소가 바뀌었거나 판매가 종료된 자료일 수 있습니다.</p>
      <Button asChild className="mt-8">
        <Link href="/products">전체 자료 보기</Link>
      </Button>
    </div>
  );
}
