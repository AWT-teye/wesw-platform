-- ============================================
-- 00024_sns_page.sql
-- /we/sns 페이지용 스키마
--   1) candidates 테이블에 개별 SNS 링크 컬럼 추가 (네이버/인스타/페북/유튜브채널)
--   2) candidate_youtube_videos : 후보 출연 유튜브 영상 목록
--   3) candidate_statements     : 후보 최근 발언
-- ============================================

-- 1) SNS 링크 컬럼 (개별 컬럼으로 관리)
alter table public.candidates
  add column if not exists sns_naver text,
  add column if not exists sns_instagram text,
  add column if not exists sns_facebook text,
  add column if not exists sns_youtube_channel text;

-- 2) 유튜브 영상 목록
create table if not exists public.candidate_youtube_videos (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references public.candidates(id) on delete cascade,
  title text not null,
  youtube_url text not null,
  thumbnail_url text,
  display_order integer default 0,
  is_visible boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_candidate_youtube_videos_candidate
  on public.candidate_youtube_videos(candidate_id, display_order);

alter table public.candidate_youtube_videos enable row level security;

drop policy if exists "public read visible youtube videos"
  on public.candidate_youtube_videos;
create policy "public read visible youtube videos"
  on public.candidate_youtube_videos
  for select
  using (is_visible = true);

drop policy if exists "admin all youtube videos"
  on public.candidate_youtube_videos;
create policy "admin all youtube videos"
  on public.candidate_youtube_videos
  for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 3) 최근 발언
create table if not exists public.candidate_statements (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references public.candidates(id) on delete cascade,
  content text not null,
  source text,
  stated_at date,
  display_order integer default 0,
  is_visible boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_candidate_statements_candidate
  on public.candidate_statements(candidate_id, stated_at desc);

alter table public.candidate_statements enable row level security;

drop policy if exists "public read visible statements"
  on public.candidate_statements;
create policy "public read visible statements"
  on public.candidate_statements
  for select
  using (is_visible = true);

drop policy if exists "admin all statements"
  on public.candidate_statements;
create policy "admin all statements"
  on public.candidate_statements
  for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
