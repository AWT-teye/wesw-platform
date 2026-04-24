-- ============================================
-- 00027_schedule.sql
-- 후보 일정 (candidate_schedules) + 선거 공식 일정 (election_schedules)
-- /we/schedule 페이지, /admin/schedule 백오피스에서 사용
-- ============================================

-- 후보 일정 테이블
CREATE TABLE IF NOT EXISTS public.candidate_schedules (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id   uuid REFERENCES public.candidates(id) ON DELETE CASCADE,
  title          text NOT NULL,
  subtitle       text,
  scheduled_date date NOT NULL,
  start_time     time,
  end_time       time,
  location       text,
  content        text,
  extra          text,
  is_visible     boolean DEFAULT true,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

COMMENT ON TABLE public.candidate_schedules IS '후보 공개 일정 — /we/schedule 캘린더에서 사용';
COMMENT ON COLUMN public.candidate_schedules.subtitle IS '달력 셀 하단에 표시되는 짧은 라벨';

CREATE INDEX IF NOT EXISTS idx_candidate_schedules_date
  ON public.candidate_schedules (scheduled_date);

DROP TRIGGER IF EXISTS trg_candidate_schedules_updated_at
  ON public.candidate_schedules;
CREATE TRIGGER trg_candidate_schedules_updated_at
  BEFORE UPDATE ON public.candidate_schedules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 선거 공식 일정 테이블 (참관인신청, 유세시작, 선거일 등)
CREATE TABLE IF NOT EXISTS public.election_schedules (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text NOT NULL,
  scheduled_date date NOT NULL,
  description    text,
  badge_label    text,
  badge_color    text DEFAULT '#FF6B00',
  display_order  integer DEFAULT 0,
  is_visible     boolean DEFAULT true,
  created_at     timestamptz DEFAULT now()
);

COMMENT ON TABLE public.election_schedules IS '2026 지방선거 공식 일정 타임라인 — /we/schedule 우측 패널';

CREATE INDEX IF NOT EXISTS idx_election_schedules_order
  ON public.election_schedules (display_order);

-- 기본 선거 일정 seed (2026년 지방선거 기준)
INSERT INTO public.election_schedules
  (title, scheduled_date, description, badge_label, display_order)
VALUES
  ('예비후보자 등록', '2026-03-12', '선거관리위원회에 예비후보자 등록', '완료', 1),
  ('후보자 등록', '2026-05-14', '정식 후보자 등록 기간', 'D-DAY', 2),
  ('공식 선거운동 시작', '2026-05-21', '선거일 전 13일부터 공식 선거운동 가능', '예정', 3),
  ('사전투표', '2026-05-29', '5월 29일~30일 전국 사전투표소 운영', '예정', 4),
  ('제9회 전국동시지방선거', '2026-06-03', '수원특례시장 선거일', '선거일', 5)
ON CONFLICT DO NOTHING;

-- ============================================
-- RLS
-- ============================================
ALTER TABLE public.candidate_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read schedules" ON public.candidate_schedules;
CREATE POLICY "public read schedules"
  ON public.candidate_schedules
  FOR SELECT
  USING (is_visible = true);

DROP POLICY IF EXISTS "admin all schedules" ON public.candidate_schedules;
CREATE POLICY "admin all schedules"
  ON public.candidate_schedules
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE public.election_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read election" ON public.election_schedules;
CREATE POLICY "public read election"
  ON public.election_schedules
  FOR SELECT
  USING (is_visible = true);

DROP POLICY IF EXISTS "admin all election" ON public.election_schedules;
CREATE POLICY "admin all election"
  ON public.election_schedules
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
