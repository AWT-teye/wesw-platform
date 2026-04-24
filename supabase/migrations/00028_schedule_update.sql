-- ============================================
-- 00028_schedule_update.sql
-- election_schedules: 날짜 범위(end_date) + 지난일정 숨김 토글
-- ============================================

ALTER TABLE public.election_schedules
  ADD COLUMN IF NOT EXISTS end_date       date,
  ADD COLUMN IF NOT EXISTS is_past_hidden boolean DEFAULT false;

-- 기존 데이터 end_date = scheduled_date 로 초기화
UPDATE public.election_schedules
SET end_date = scheduled_date
WHERE end_date IS NULL;

COMMENT ON COLUMN public.election_schedules.end_date
  IS '종료날짜. scheduled_date와 같으면 단일 날짜, 다르면 기간 표시';
COMMENT ON COLUMN public.election_schedules.is_past_hidden
  IS '지난 일정 숨김 처리 여부 (노출 페이지에서 opacity 처리)';
