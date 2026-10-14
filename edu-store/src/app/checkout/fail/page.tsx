import type { Metadata } from "next";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "결제 실패", robots: { index: false } };

export default async function CheckoutFailPage({ searchParams }: { searchParams: Promise<{ code?: string; message?: string }> }) {
  const { code, message } = await searchParams;
  const canceled = code === "PAY_PROCESS_CANCELED" || code === "USER_CANCEL";
  return (
    <div className="container-page flex max-w-xl flex-col items-center py-20 text-center">
      <TriangleAlert className="size-10 text-destructive" />
      <h1 className="mt-6 text-xl font-bold">{canceled ? "결제를 취소했습니다" : "결제에 실패했습니다"}</h1>
      <p className="mt-2 text-muted-foreground">{canceled ? "결제 금액은 청구되지 않았습니다." : message ?? "잠시 후 다시 시도해 주세요."}</p>
      {code && !canceled && <p className="mt-1 text-xs text-muted-foreground">오류 코드: {code}</p>}
      <Button asChild variant="outline" className="mt-8">
        <Link href="/products">자료 목록으로</Link>
      </Button>
    </div>
  );
}
