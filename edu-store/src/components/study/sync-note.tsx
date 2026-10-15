import Link from "next/link";
import { Cloud, HardDrive } from "lucide-react";

export function SyncNote({ synced }: { synced: boolean }) {
  return synced ? (
    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Cloud className="size-3.5 text-success" /> 계정에 저장 중 · 다른 기기에서도 이어서 할 수 있어요
    </p>
  ) : (
    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <HardDrive className="size-3.5" /> 이 브라우저에 저장됩니다 ·{" "}
      <Link href="/login?next=/study" className="underline">로그인</Link>하면 기기 간 동기화
    </p>
  );
}
