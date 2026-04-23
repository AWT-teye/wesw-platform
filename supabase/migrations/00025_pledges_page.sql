-- ============================================
-- 00025_pledges_page.sql
-- /we/pledges 페이지용 스키마
--   1) pledge_overview     — 공약 소개(인트로·벽보·공보·10대공약·공약서 URL, 팝업 이미지)
--   2) region_pledges      — 지역별 맞춤공약 (수원 4개 구 + 특별 카드 2종)
--   3) policies.is_top10   — 중공약에 10대공약 노출 플래그 (level=2 기준)
-- 기존 policies 테이블 구조(level 1/2/3)는 건드리지 않음.
-- ============================================

-- 1) 공약 소개
create table if not exists public.pledge_overview (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references public.candidates(id) on delete cascade,
  intro_text text,
  popup_image_url text,
  poster_url text,
  bulletin_url text,
  top10_url text,
  plan_book_url text,
  updated_at timestamptz default now()
);

create unique index if not exists uq_pledge_overview_candidate
  on public.pledge_overview(candidate_id);

alter table public.pledge_overview enable row level security;

drop policy if exists "public read pledge overview" on public.pledge_overview;
create policy "public read pledge overview"
  on public.pledge_overview
  for select
  using (true);

drop policy if exists "admin all pledge overview" on public.pledge_overview;
create policy "admin all pledge overview"
  on public.pledge_overview
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

-- 2) 지역별 맞춤공약
create table if not exists public.region_pledges (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references public.candidates(id) on delete cascade,
  region_type text not null check (region_type in ('gu','dong','special')),
  region_code text not null unique,
  region_name text not null,
  content text,
  popup_image_url text,
  display_order integer default 0,
  is_visible boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_region_pledges_order
  on public.region_pledges(display_order);

alter table public.region_pledges enable row level security;

drop policy if exists "public read region pledges" on public.region_pledges;
create policy "public read region pledges"
  on public.region_pledges
  for select
  using (true);

drop policy if exists "admin all region pledges" on public.region_pledges;
create policy "admin all region pledges"
  on public.region_pledges
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

insert into public.region_pledges (region_type, region_code, region_name, display_order) values
  ('gu', 'jangan', '장안구', 1),
  ('gu', 'gwonseon', '권선구', 2),
  ('gu', 'paldal', '팔달구', 3),
  ('gu', 'yeongtong', '영통구', 4),
  ('special', 'talent-edu', '가능성의 인재교육', 5),
  ('special', 'integrated-city', '접근성의 통합도시', 6)
on conflict (region_code) do nothing;

-- 3) 10대공약 플래그 (중공약 = policies.level = 2)
alter table public.policies
  add column if not exists is_top10 boolean default false;

create index if not exists idx_policies_is_top10
  on public.policies(is_top10) where is_top10 = true;
