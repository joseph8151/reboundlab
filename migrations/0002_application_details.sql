-- 상세 신청 항목(연애 기간, 이별 이유, 차단 범위 등)을 JSON으로 저장
ALTER TABLE applications ADD COLUMN details TEXT;
