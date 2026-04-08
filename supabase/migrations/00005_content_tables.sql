-- ============================================
-- 00005_content_tables.sql
-- 게시글, 댓글, 투표, 신고, 알림, 대시보드 위젯,
-- 서포터즈, 조직도, 회의록, 교육, 인쇄물, 현수막, 시스템
-- ============================================

-- ======== 게시글 ========
CREATE TABLE public.posts (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id              uuid NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  author_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title                 text NOT NULL,
  content               text NOT NULL,
  like_count            integer DEFAULT 0,
  dislike_count         integer DEFAULT 0,
  comment_count         integer DEFAULT 0,
  view_count            integer DEFAULT 0,
  status                text DEFAULT '접수'
                          CHECK (status IN ('접수', '검토중', '답변완료')),
  official_response     text,
  official_response_at  timestamptz,
  official_responder_id uuid REFERENCES auth.users(id),
  is_featured           boolean DEFAULT false,
  is_pinned             boolean DEFAULT false,
  is_blinded            boolean DEFAULT false,
  is_active             boolean DEFAULT true,
  is_archived           boolean DEFAULT false,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

COMMENT ON TABLE public.posts IS '게시글';
COMMENT ON COLUMN public.posts.status IS '개혁만인소 전용: 접수→검토중→답변완료';
COMMENT ON COLUMN public.posts.is_featured IS '상언격쟁: 추천 10회 이상 자동 노출';
COMMENT ON COLUMN public.posts.is_blinded IS '관리자 블라인드 처리 (삭제 아님)';

CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======== 게시글 투표 ========
CREATE TABLE public.post_votes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type   text NOT NULL CHECK (vote_type IN ('like', 'dislike')),
  created_at  timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

COMMENT ON TABLE public.post_votes IS '게시글 추천/비추천 (1인 1투표)';

-- ======== 댓글 (대댓글 포함) ========
CREATE TABLE public.comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id   uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  content     text NOT NULL,
  like_count  integer DEFAULT 0,
  is_blinded  boolean DEFAULT false,
  is_active   boolean DEFAULT true,
  is_archived boolean DEFAULT false,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

COMMENT ON TABLE public.comments IS '댓글 + 대댓글 (parent_id로 계층)';

CREATE TRIGGER trg_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======== 신고 ========
CREATE TABLE public.post_reports (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id     uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id  uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  reason      text NOT NULL,
  status      text DEFAULT 'pending'
                CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at  timestamptz DEFAULT now(),
  CHECK (post_id IS NOT NULL OR comment_id IS NOT NULL)
);

COMMENT ON TABLE public.post_reports IS '게시글/댓글 신고';

-- ======== 알림 ========
CREATE TABLE public.notifications (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type               text NOT NULL
                       CHECK (type IN (
                         'comment_on_post', 'reply_to_comment', 'post_featured',
                         'status_changed', 'official_response', 'supporter_approved',
                         'task_assigned', 'system'
                       )),
  title              text NOT NULL,
  body               text,
  link_url           text,
  is_read            boolean DEFAULT false,
  related_post_id    uuid REFERENCES public.posts(id) ON DELETE SET NULL,
  related_comment_id uuid REFERENCES public.comments(id) ON DELETE SET NULL,
  created_at         timestamptz DEFAULT now()
);

COMMENT ON TABLE public.notifications IS '알림 (댓글/대댓글/상태변경 등)';

-- ======== 히어로 캐러셀 ========
CREATE TABLE public.hero_slides (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  subtitle      text,
  image_url     text NOT NULL,
  link_url      text,
  display_order integer NOT NULL DEFAULT 0,
  is_active     boolean DEFAULT true,
  is_archived   boolean DEFAULT false,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

COMMENT ON TABLE public.hero_slides IS '메인 페이지 히어로 캐러셀';

CREATE TRIGGER trg_hero_slides_updated_at
  BEFORE UPDATE ON public.hero_slides
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======== 오늘의 언론 ========
CREATE TABLE public.news_links (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text NOT NULL,
  summary        text,
  source_name    text NOT NULL,
  url            text NOT NULL,
  thumbnail_url  text,
  published_date date,
  display_order  integer DEFAULT 0,
  is_active      boolean DEFAULT true,
  is_archived    boolean DEFAULT false,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

COMMENT ON TABLE public.news_links IS '오늘의 언론 위젯 (링크+요약만, 직접 게재 금지)';

CREATE TRIGGER trg_news_links_updated_at
  BEFORE UPDATE ON public.news_links
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======== 오늘의 영상 ========
CREATE TABLE public.videos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  description   text,
  youtube_url   text NOT NULL,
  youtube_id    text,
  thumbnail_url text,
  display_order integer DEFAULT 0,
  is_active     boolean DEFAULT true,
  is_archived   boolean DEFAULT false,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

COMMENT ON TABLE public.videos IS '오늘의 영상 위젯';

CREATE TRIGGER trg_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======== 공지사항 ========
CREATE TABLE public.announcements (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category    text NOT NULL CHECK (category IN ('party', 'election')),
  title       text NOT NULL,
  content     text NOT NULL,
  author_id   uuid NOT NULL REFERENCES auth.users(id),
  is_pinned   boolean DEFAULT false,
  is_active   boolean DEFAULT true,
  is_archived boolean DEFAULT false,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

COMMENT ON TABLE public.announcements IS '공지사항 (party: 수원시당, election: 지방선거)';

CREATE TRIGGER trg_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======== 서포터즈 지원 ========
CREATE TABLE public.supporters (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  real_name       text NOT NULL,
  phone           text,
  motivation      text,
  status          text DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
  certificate_url text,
  approved_at     timestamptz,
  approved_by     uuid REFERENCES auth.users(id),
  is_active       boolean DEFAULT true,
  is_archived     boolean DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

COMMENT ON TABLE public.supporters IS '서포터즈 지원/임명';

CREATE TRIGGER trg_supporters_updated_at
  BEFORE UPDATE ON public.supporters
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======== 서포터즈 오늘 할 일 ========
CREATE TABLE public.supporter_tasks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  description   text,
  task_date     date NOT NULL DEFAULT CURRENT_DATE,
  link_url      text,
  display_order integer DEFAULT 0,
  is_active     boolean DEFAULT true,
  is_archived   boolean DEFAULT false,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

COMMENT ON TABLE public.supporter_tasks IS '서포터즈 오늘 할 일 (대시보드 위젯)';

CREATE TRIGGER trg_supporter_tasks_updated_at
  BEFORE UPDATE ON public.supporter_tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======== 조직도 ========
CREATE TABLE public.org_chart_members (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chart_type    text NOT NULL CHECK (chart_type IN ('party', 'election')),
  name          text NOT NULL,
  position      text NOT NULL,
  department    text,
  parent_id     uuid REFERENCES public.org_chart_members(id),
  phone         text,
  email         text,
  photo_url     text,
  display_order integer DEFAULT 0,
  is_active     boolean DEFAULT true,
  is_archived   boolean DEFAULT false,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

COMMENT ON TABLE public.org_chart_members IS '조직도 (party: 수원시당, election: 선거)';

CREATE TRIGGER trg_org_chart_members_updated_at
  BEFORE UPDATE ON public.org_chart_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======== 회의록 ========
CREATE TABLE public.meeting_minutes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  meeting_date    date NOT NULL,
  location        text,
  attendees       text,
  content         text NOT NULL,
  attachment_urls jsonb DEFAULT '[]',
  author_id       uuid NOT NULL REFERENCES auth.users(id),
  is_active       boolean DEFAULT true,
  is_archived     boolean DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

COMMENT ON TABLE public.meeting_minutes IS '선거캠프 회의록 (공개)';

CREATE TRIGGER trg_meeting_minutes_updated_at
  BEFORE UPDATE ON public.meeting_minutes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======== 교육프로그램 ========
CREATE TABLE public.education_programs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  description     text,
  content         text,
  program_date    date,
  attachment_urls jsonb DEFAULT '[]',
  video_url       text,
  display_order   integer DEFAULT 0,
  is_active       boolean DEFAULT true,
  is_archived     boolean DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

COMMENT ON TABLE public.education_programs IS '선거사무원 기본교육프로그램';

CREATE TRIGGER trg_education_programs_updated_at
  BEFORE UPDATE ON public.education_programs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======== 선거인쇄물 ========
CREATE TABLE public.election_materials (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_type text NOT NULL
                  CHECK (material_type IN ('banner', 'poster', 'pamphlet', 'other')),
  title         text NOT NULL,
  description   text,
  image_urls    jsonb DEFAULT '[]',
  file_url      text,
  display_order integer DEFAULT 0,
  is_active     boolean DEFAULT true,
  is_archived   boolean DEFAULT false,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

COMMENT ON TABLE public.election_materials IS '선거인쇄물 (banner: 현수막, poster: 벽보, pamphlet: 공보)';

CREATE TRIGGER trg_election_materials_updated_at
  BEFORE UPDATE ON public.election_materials
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======== 현수막 게첩지도 ========
CREATE TABLE public.banner_pins (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  memo        text,
  latitude    double precision NOT NULL,
  longitude   double precision NOT NULL,
  address     text,
  pin_type    text DEFAULT 'banner'
                CHECK (pin_type IN ('banner', 'poster', 'other')),
  photo_url   text,
  created_by  uuid NOT NULL REFERENCES auth.users(id),
  is_active   boolean DEFAULT true,
  is_archived boolean DEFAULT false,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

COMMENT ON TABLE public.banner_pins IS '현수막 게첩지도 핀 (관리자 전용)';

CREATE TRIGGER trg_banner_pins_updated_at
  BEFORE UPDATE ON public.banner_pins
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======== 사이트 전역 설정 ========
CREATE TABLE public.site_settings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text NOT NULL UNIQUE,
  value       jsonb NOT NULL DEFAULT 'true',
  description text,
  updated_at  timestamptz DEFAULT now()
);

COMMENT ON TABLE public.site_settings IS '사이트 전역 설정 (선거모드, 서포터즈 신청 등)';

-- ======== 페이지별 활성화/비활성화 ========
CREATE TABLE public.content_pages (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug                text NOT NULL UNIQUE,
  page_name                text NOT NULL,
  is_election_period_only  boolean DEFAULT false,
  is_active                boolean DEFAULT true,
  is_archived              boolean DEFAULT false,
  updated_at               timestamptz DEFAULT now()
);

COMMENT ON TABLE public.content_pages IS '페이지별 활성화/비활성화 토글 (백오피스 제어)';
