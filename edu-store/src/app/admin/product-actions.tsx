"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadFile } from "./upload";

async function patchProduct(body: Record<string, unknown>) {
  const res = await fetch("/api/admin/products", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json()).message);
}

export function AttachPdfButton({ productId }: { productId: string }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <input
        ref={input}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          try {
            const { path } = await uploadFile(file, "file");
            await patchProduct({ id: productId, filePath: path });
            router.refresh();
          } catch (err) {
            alert((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      />
      <Button size="sm" variant="outline" disabled={busy} onClick={() => input.current?.click()}>
        <Upload /> {busy ? "업로드 중…" : "PDF 연결"}
      </Button>
    </>
  );
}

export function PublishToggle({ productId, published }: { productId: string; published: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await patchProduct({ id: productId, isPublished: !published });
          router.refresh();
        } catch (err) {
          alert((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
      className={`rounded-full px-3 py-1 text-xs font-semibold ${published ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
    >
      {published ? "공개" : "비공개"}
    </button>
  );
}
