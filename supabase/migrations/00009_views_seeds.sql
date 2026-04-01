-- ============================================
-- 00009_views_seeds.sql
-- 대시보드 뷰 + 시드 데이터
-- ============================================

-- ======== 뷰: 오늘의 수원 (최다 추천+댓글 게시글 3개) ========
CREATE OR REPLACE VIEW public.v_today_top_posts AS
SELECT
  p.id,
  p.board_id,
  p.title,
  p.like_count,
  p.comment_count,
  p.created_at,
  b.name AS board_name,
  pr.nickname AS author_nickname
FROM public.posts p
JOIN public.boards b ON p.board_id = b.id
JOIN public.profiles pr ON p.author_id = pr.id
WHERE p.is_active = true
  AND p.is_blinded = false
  AND p.is_archived = false
  AND p.created_at >= CURRENT_DATE
ORDER BY (p.like_count + p.comment_count) DESC
LIMIT 3;

-- ======== 뷰: 오늘의 유세일정 ========
CREATE OR REPLACE VIEW public.v_today_schedule AS
SELECT
  cs.id,
  cs.title,
  cs.description,
  cs.event_date,
  cs.start_time,
  cs.end_time,
  cs.location_name,
  cs.address,
  cs.latitude,
  cs.longitude,
  c.name AS candidate_name,
  c.position_type
FROM public.campaign_schedules cs
LEFT JOIN public.candidates c ON cs.candidate_id = c.id
WHERE cs.is_active = true
  AND cs.is_archived = false
  AND cs.event_date = CURRENT_DATE
ORDER BY cs.start_time;

-- ======== 뷰: 읽지 않은 알림 수 ========
CREATE OR REPLACE VIEW public.v_unread_notification_count AS
SELECT
  user_id,
  count(*) AS unread_count
FROM public.notifications
WHERE is_read = false
GROUP BY user_id;

-- ======== 시드: site_settings ========
INSERT INTO public.site_settings (key, value, description) VALUES
  ('election_mode', '"true"', '선거 기간 모드 (true: 선거 콘텐츠 노출, false: 비활성화)'),
  ('supporter_registration_open', '"true"', '서포터즈 지원 신청 오픈 여부'),
  ('community_boards_active', '"true"', '사통팔달 게시판 활성화 여부');

-- ======== 시드: content_pages (주요 페이지 등록) ========
INSERT INTO public.content_pages (page_slug, page_name, is_election_period_only) VALUES
  ('/', '진입 랜딩', false),
  ('/main', '메인 대시보드', false),
  ('/party/intro', '수원시당 소개', false),
  ('/party/org-chart', '수원시당 조직도', false),
  ('/suwon/intro', '수원시 소개', false),
  ('/suwon/budget', '수원시 재정 및 예산', false),
  ('/suwon/history', '역대 수원시장', false),
  ('/suwon/council', '수원시의회 활동', false),
  ('/election/candidates', '선거 후보자', true),
  ('/election/comparison', '경기도지사·교육감 정책비교', true),
  ('/election/org-chart', '지방선거 조직도', true),
  ('/election/media', '언론 및 미디어', true),
  ('/election/sns', '유튜브/SNS', true),
  ('/election/donate', '후원안내', true),
  ('/camp/candidate', '정희윤 후보소개', true),
  ('/camp/vision', '비전과 슬로건', true),
  ('/camp/policies', '정책과 공약', true),
  ('/camp/schedule', '유세일정', true),
  ('/camp/sns', 'SNS 및 온라인', true),
  ('/camp/minutes', '선거캠프 회의록', true),
  ('/camp/education', '교육프로그램', true),
  ('/camp/org-chart', '캠프 조직도', true),
  ('/camp/materials', '선거인쇄물', true),
  ('/camp/complaints', '선거민원공간', true),
  ('/camp/notices', '공지사항', false),
  ('/supporters', '서포터즈', true),
  ('/supporters/tasks', '서포터즈 오늘 할 일', true),
  ('/community', '사통팔달', false),
  ('/admin', '관리자 백오피스', false);
