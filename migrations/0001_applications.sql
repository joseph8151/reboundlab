-- 상담 신청서
CREATE TABLE IF NOT EXISTS applications (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  phone       TEXT    NOT NULL,
  breakup     TEXT    NOT NULL,          -- 이별 시점
  state       TEXT    NOT NULL,          -- 현재 연락 상태
  service     TEXT    NOT NULL,          -- 원하는 상담
  memo        TEXT,                      -- 상황 메모 (선택)
  status      TEXT    NOT NULL DEFAULT '접수'  -- 접수 / 입금 대기 / 일정 확정 / 상담 완료 / 취소
);
CREATE INDEX IF NOT EXISTS idx_applications_created ON applications (created_at DESC);
