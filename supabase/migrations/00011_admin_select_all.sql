-- ============================================
-- 00011_admin_select_all.sql
-- 관리자는 비활성/보관 행도 SELECT 가능하도록 정책 보완
-- (백오피스 목록에서 OFF/아카이브 행이 사라지는 문제 해결)
-- ============================================

-- 헬퍼: 기존 select 정책을 admin OR (is_active AND not archived) 로 교체
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'announcements', 'hero_slides', 'news_links', 'videos',
    'candidates', 'candidate_quotes', 'policies', 'campaign_schedules',
    'supporter_tasks', 'org_chart_members', 'meeting_minutes',
    'education_programs', 'election_materials', 'content_blocks'
  ];
  policy_names text[] := ARRAY[
    'announcements_select', 'hero_select', 'news_select', 'videos_select',
    'candidates_select', 'quotes_select', 'policies_select', 'schedules_select',
    'tasks_select', 'org_select', 'minutes_select',
    'edu_select', 'materials_select', 'blocks_select'
  ];
  i int;
BEGIN
  FOR i IN 1..array_length(tables, 1) LOOP
    t := tables[i];
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_names[i], t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT USING ((is_active = true AND is_archived = false) OR public.is_admin())',
      policy_names[i], t
    );
  END LOOP;
END $$;
