-- ============================================
-- 00001_helpers.sql
-- 헬퍼 함수: RLS 및 트리거에서 공통 사용
-- ============================================

-- 현재 사용자의 역할 조회
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- 관리자 여부 확인
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
$$;

-- updated_at 자동 갱신 트리거 함수
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 선거 종료 시 일괄 보관 처리
CREATE OR REPLACE FUNCTION public.archive_election_content()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE content_pages SET is_active = false, is_archived = true
    WHERE is_election_period_only = true;
  UPDATE candidates SET is_archived = true, is_active = false;
  UPDATE campaign_schedules SET is_archived = true, is_active = false;
  UPDATE policies SET is_archived = true, is_active = false;
  UPDATE candidate_quotes SET is_archived = true, is_active = false;
  UPDATE supporter_tasks SET is_archived = true, is_active = false;
  UPDATE election_materials SET is_archived = true, is_active = false;
  UPDATE hero_slides SET is_archived = true, is_active = false;
  UPDATE announcements SET is_archived = true, is_active = false
    WHERE category = 'election';
  UPDATE site_settings SET value = '"false"', updated_at = now()
    WHERE key = 'election_mode';
END;
$$;
