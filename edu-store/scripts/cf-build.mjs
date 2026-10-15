// Cloudflare Workers Builds 환경(WORKERS_CI=1)에서만, 의존성 설치 직후 Next.js를 Workers용으로 빌드합니다.
// 대시보드 배포 명령이 `npx wrangler deploy` 하나뿐이어도 .open-next 결과물이 미리 준비되도록 하기 위한 것입니다.
// 내 컴퓨터의 npm install에서는 아무것도 하지 않습니다.
import { spawnSync } from "node:child_process";

if (process.env.WORKERS_CI !== "1" && !process.env.CF_PAGES) process.exit(0);

console.log("[cf-build] Cloudflare 빌드 환경 감지 → opennextjs-cloudflare build");
const r = spawnSync("npx", ["opennextjs-cloudflare", "build"], { stdio: "inherit", env: process.env });
process.exit(r.status ?? 1);
