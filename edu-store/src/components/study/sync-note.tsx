import { Cloud, HardDrive } from "lucide-react";

export function SyncNote({ synced }: { synced: boolean }) {
  return synced ? (
    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Cloud className="size-3.5 text-success" /> 계정에 저장 중 · 다른 기기에서도 이어서 할 수 있어요
    </p>
  ) : (
    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <HardDrive className="size-3.5" /> 이 브라우저에만 저장됩니다 · 서버로 전송되지 않아요
    </p>
  );
}
