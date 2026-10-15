import { redirect } from "next/navigation";

/** 이전 주소(/checkout/교재슬러그) 호환: 새 주문 화면으로 보냅니다. */
export default async function LegacyCheckout({ params }: { params: Promise<{ slug: string }> }) {
  redirect(`/checkout?buy=${encodeURIComponent((await params).slug)}`);
}
