import type { Metadata } from "next";
import { Suspense } from "react";
import { ConfirmPayment } from "./confirm-payment";

export const metadata: Metadata = { title: "결제 완료", robots: { index: false } };

export default function CheckoutSuccessPage() {
  return (
    <div className="container-page flex max-w-xl flex-col items-center py-20 text-center">
      <Suspense>
        <ConfirmPayment />
      </Suspense>
    </div>
  );
}
