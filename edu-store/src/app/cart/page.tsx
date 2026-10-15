import type { Metadata } from "next";
import { CartView } from "./cart-view";

export const metadata: Metadata = { title: "장바구니", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="container-page py-10 md:py-14">
      <h1 className="text-[30px] font-bold tracking-[-0.03em] md:text-[36px]">장바구니</h1>
      <CartView />
    </div>
  );
}
