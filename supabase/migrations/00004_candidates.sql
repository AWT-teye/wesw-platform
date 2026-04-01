-- ============================================
-- 00004_candidates.sql
-- 후보자, 오늘의 한마디, 공약, 공약투표, 유세일정
-- ============================================

-- 후보자 정보
CREATE TABLE public.candidates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  position_type   text NOT NULL
                    CHECK (position_type IN ('mayor', 'city_council', 'provincial_council', 'proportional')),
  district        text,
  photo_url       text,
  bio             text,
  declaration     text,
  inauguration_text text,
  office_info     text,
  vision          text,
  slogan          text,
  sns_links       jsonb DEFAULT '{}',
  display_order   integer DEFAULT 0,
  is_active       boolean DEFAULT true,
  is_archived     boolean DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

COMMENT ON TABLE public.candidates IS '후보자 정보';
COMMENT ON COLUMN public.candidates.position_type IS 'mayor: 시장, city_council: 시의원, provincial_council: 도의원, proportional: 비례대표';
COMMENT ON COLUMN public.candidates.sns_links IS '{"youtube":"...", "instagram":"...", "facebook":"...", "kakao":"...", "discord":"..."}';

CREATE TRIGGER trg_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 오늘의 한마디 (대시보드 위젯)
CREATE TABLE public.candidate_quotes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id  uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  quote_text    text NOT NULL,
  quote_date    date NOT NULL DEFAULT CURRENT_DATE,
  is_active     boolean DEFAULT true,
  is_archived   boolean DEFAULT false,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

COMMENT ON TABLE public.candidate_quotes IS '후보들의 오늘의 한마디 (대시보드 위젯)';

CREATE TRIGGER trg_candidate_quotes_updated_at
  BEFORE UPDATE ON public.candidate_quotes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 공약 (계층구조: 대공약 > 중공약 > 세부 > 시민참여 > 사회주제)
CREATE TABLE public.policies (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id  uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  parent_id     uuid REFERENCES public.policies(id) ON DELETE CASCADE,
  level         integer NOT NULL CHECK (level BETWEEN 1 AND 5),
  title         text NOT NULL,
  content       text,
  video_url     text,
  display_order integer DEFAULT 0,
  like_count    integer DEFAULT 0,
  dislike_count integer DEFAULT 0,
  is_active     boolean DEFAULT true,
  is_archived   boolean DEFAULT false,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

COMMENT ON TABLE public.policies IS '공약 (계층구조)';
COMMENT ON COLUMN public.policies.level IS '1=대공약, 2=중공약, 3=세부공약, 4=시민참여공약, 5=사회주제';

CREATE TRIGGER trg_policies_updated_at
  BEFORE UPDATE ON public.policies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 공약 호불호 투표 (징/백지)
CREATE TABLE public.policy_votes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id   uuid NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type   text NOT NULL CHECK (vote_type IN ('like', 'dislike')),
  created_at  timestamptz DEFAULT now(),
  UNIQUE(policy_id, user_id)
);

COMMENT ON TABLE public.policy_votes IS '공약 호불호 투표 (1인 1투표)';

-- 유세일정 (캘린더 + 지도)
CREATE TABLE public.campaign_schedules (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id  uuid REFERENCES public.candidates(id) ON DELETE SET NULL,
  title         text NOT NULL,
  description   text,
  event_date    date NOT NULL,
  start_time    time,
  end_time      time,
  location_name text NOT NULL,
  address       text,
  latitude      double precision,
  longitude     double precision,
  is_active     boolean DEFAULT true,
  is_archived   boolean DEFAULT false,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

COMMENT ON TABLE public.campaign_schedules IS '유세일정 (캘린더 + 지도 연동)';

CREATE TRIGGER trg_campaign_schedules_updated_at
  BEFORE UPDATE ON public.campaign_schedules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
