-- ============================================
-- 00006_rls_policies.sql
-- 전체 테이블 RLS 활성화 + 정책
-- ============================================

-- ======== RLS 활성화 (전 테이블) ========
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supporter_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_chart_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_minutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banner_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- profiles
-- ============================================
CREATE POLICY "profiles_select_active" ON public.profiles
  FOR SELECT USING (is_active = true);

CREATE POLICY "profiles_insert_self" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_self_or_admin" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- ============================================
-- boards (누구나 읽기, 관리자만 수정)
-- ============================================
CREATE POLICY "boards_select_active" ON public.boards
  FOR SELECT USING (is_active = true);

CREATE POLICY "boards_admin_insert" ON public.boards
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "boards_admin_update" ON public.boards
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "boards_admin_delete" ON public.boards
  FOR DELETE USING (public.is_admin());

-- ============================================
-- posts
-- ============================================
CREATE POLICY "posts_select_active" ON public.posts
  FOR SELECT USING (
    (is_active = true AND is_blinded = false AND is_archived = false)
    OR public.is_admin()
  );

CREATE POLICY "posts_insert_member" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND author_id = auth.uid());

CREATE POLICY "posts_update_own_or_admin" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id OR public.is_admin());

CREATE POLICY "posts_delete_admin" ON public.posts
  FOR DELETE USING (public.is_admin());

-- ============================================
-- post_votes
-- ============================================
CREATE POLICY "post_votes_select_own_or_admin" ON public.post_votes
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "post_votes_insert_member" ON public.post_votes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "post_votes_update_own" ON public.post_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "post_votes_delete_own" ON public.post_votes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- comments
-- ============================================
CREATE POLICY "comments_select_active" ON public.comments
  FOR SELECT USING (
    (is_active = true AND is_blinded = false)
    OR public.is_admin()
  );

CREATE POLICY "comments_insert_member" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND author_id = auth.uid());

CREATE POLICY "comments_update_own_or_admin" ON public.comments
  FOR UPDATE USING (auth.uid() = author_id OR public.is_admin());

CREATE POLICY "comments_delete_admin" ON public.comments
  FOR DELETE USING (public.is_admin());

-- ============================================
-- post_reports
-- ============================================
CREATE POLICY "reports_insert_member" ON public.post_reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND reporter_id = auth.uid());

CREATE POLICY "reports_select_admin" ON public.post_reports
  FOR SELECT USING (public.is_admin());

CREATE POLICY "reports_update_admin" ON public.post_reports
  FOR UPDATE USING (public.is_admin());

-- ============================================
-- notifications
-- ============================================
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_admin" ON public.notifications
  FOR INSERT WITH CHECK (public.is_admin());

-- ============================================
-- 관리자 전용 쓰기 + 누구나 읽기 테이블들
-- (candidates, candidate_quotes, policies, campaign_schedules,
--  hero_slides, news_links, videos, announcements,
--  supporter_tasks, org_chart_members, meeting_minutes,
--  education_programs, election_materials)
-- ============================================

-- candidates
CREATE POLICY "candidates_select" ON public.candidates
  FOR SELECT USING (is_active = true AND is_archived = false);
CREATE POLICY "candidates_admin_insert" ON public.candidates
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "candidates_admin_update" ON public.candidates
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "candidates_admin_delete" ON public.candidates
  FOR DELETE USING (public.is_admin());

-- candidate_quotes
CREATE POLICY "quotes_select" ON public.candidate_quotes
  FOR SELECT USING (is_active = true AND is_archived = false);
CREATE POLICY "quotes_admin_insert" ON public.candidate_quotes
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "quotes_admin_update" ON public.candidate_quotes
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "quotes_admin_delete" ON public.candidate_quotes
  FOR DELETE USING (public.is_admin());

-- policies (공약)
CREATE POLICY "policies_select" ON public.policies
  FOR SELECT USING (is_active = true AND is_archived = false);
CREATE POLICY "policies_admin_insert" ON public.policies
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "policies_admin_update" ON public.policies
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "policies_admin_delete" ON public.policies
  FOR DELETE USING (public.is_admin());

-- policy_votes
CREATE POLICY "policy_votes_select_own_or_admin" ON public.policy_votes
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "policy_votes_insert_member" ON public.policy_votes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
CREATE POLICY "policy_votes_update_own" ON public.policy_votes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "policy_votes_delete_own" ON public.policy_votes
  FOR DELETE USING (auth.uid() = user_id);

-- campaign_schedules
CREATE POLICY "schedules_select" ON public.campaign_schedules
  FOR SELECT USING (is_active = true AND is_archived = false);
CREATE POLICY "schedules_admin_insert" ON public.campaign_schedules
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "schedules_admin_update" ON public.campaign_schedules
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "schedules_admin_delete" ON public.campaign_schedules
  FOR DELETE USING (public.is_admin());

-- hero_slides
CREATE POLICY "hero_select" ON public.hero_slides
  FOR SELECT USING (is_active = true AND is_archived = false);
CREATE POLICY "hero_admin_insert" ON public.hero_slides
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "hero_admin_update" ON public.hero_slides
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "hero_admin_delete" ON public.hero_slides
  FOR DELETE USING (public.is_admin());

-- news_links
CREATE POLICY "news_select" ON public.news_links
  FOR SELECT USING (is_active = true AND is_archived = false);
CREATE POLICY "news_admin_insert" ON public.news_links
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "news_admin_update" ON public.news_links
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "news_admin_delete" ON public.news_links
  FOR DELETE USING (public.is_admin());

-- videos
CREATE POLICY "videos_select" ON public.videos
  FOR SELECT USING (is_active = true AND is_archived = false);
CREATE POLICY "videos_admin_insert" ON public.videos
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "videos_admin_update" ON public.videos
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "videos_admin_delete" ON public.videos
  FOR DELETE USING (public.is_admin());

-- announcements
CREATE POLICY "announcements_select" ON public.announcements
  FOR SELECT USING (is_active = true AND is_archived = false);
CREATE POLICY "announcements_admin_insert" ON public.announcements
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "announcements_admin_update" ON public.announcements
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "announcements_admin_delete" ON public.announcements
  FOR DELETE USING (public.is_admin());

-- supporter_tasks
CREATE POLICY "tasks_select" ON public.supporter_tasks
  FOR SELECT USING (is_active = true AND is_archived = false);
CREATE POLICY "tasks_admin_insert" ON public.supporter_tasks
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "tasks_admin_update" ON public.supporter_tasks
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "tasks_admin_delete" ON public.supporter_tasks
  FOR DELETE USING (public.is_admin());

-- org_chart_members
CREATE POLICY "org_select" ON public.org_chart_members
  FOR SELECT USING (is_active = true AND is_archived = false);
CREATE POLICY "org_admin_insert" ON public.org_chart_members
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "org_admin_update" ON public.org_chart_members
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "org_admin_delete" ON public.org_chart_members
  FOR DELETE USING (public.is_admin());

-- meeting_minutes
CREATE POLICY "minutes_select" ON public.meeting_minutes
  FOR SELECT USING (is_active = true AND is_archived = false);
CREATE POLICY "minutes_admin_insert" ON public.meeting_minutes
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "minutes_admin_update" ON public.meeting_minutes
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "minutes_admin_delete" ON public.meeting_minutes
  FOR DELETE USING (public.is_admin());

-- education_programs
CREATE POLICY "edu_select" ON public.education_programs
  FOR SELECT USING (is_active = true AND is_archived = false);
CREATE POLICY "edu_admin_insert" ON public.education_programs
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "edu_admin_update" ON public.education_programs
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "edu_admin_delete" ON public.education_programs
  FOR DELETE USING (public.is_admin());

-- election_materials
CREATE POLICY "materials_select" ON public.election_materials
  FOR SELECT USING (is_active = true AND is_archived = false);
CREATE POLICY "materials_admin_insert" ON public.election_materials
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "materials_admin_update" ON public.election_materials
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "materials_admin_delete" ON public.election_materials
  FOR DELETE USING (public.is_admin());

-- ============================================
-- banner_pins (관리자 전용: 읽기+쓰기 모두)
-- ============================================
CREATE POLICY "banner_select_admin" ON public.banner_pins
  FOR SELECT USING (public.is_admin());
CREATE POLICY "banner_insert_admin" ON public.banner_pins
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "banner_update_admin" ON public.banner_pins
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "banner_delete_admin" ON public.banner_pins
  FOR DELETE USING (public.is_admin());

-- ============================================
-- supporters (본인 조회 + 관리자 전체)
-- ============================================
CREATE POLICY "supporters_select_own_or_admin" ON public.supporters
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "supporters_insert_self" ON public.supporters
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
CREATE POLICY "supporters_update_admin" ON public.supporters
  FOR UPDATE USING (public.is_admin());

-- ============================================
-- site_settings (누구나 읽기, 관리자만 수정)
-- ============================================
CREATE POLICY "settings_select" ON public.site_settings
  FOR SELECT USING (true);
CREATE POLICY "settings_admin_update" ON public.site_settings
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "settings_admin_insert" ON public.site_settings
  FOR INSERT WITH CHECK (public.is_admin());

-- ============================================
-- content_pages (누구나 읽기, 관리자만 수정)
-- ============================================
CREATE POLICY "pages_select" ON public.content_pages
  FOR SELECT USING (true);
CREATE POLICY "pages_admin_update" ON public.content_pages
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "pages_admin_insert" ON public.content_pages
  FOR INSERT WITH CHECK (public.is_admin());
