-- ============================================
-- 00019_observers_clean.sql
-- 참관인 시스템 — 최종 정리본
-- 이전 00018_* 시리즈의 트리거/함수 오류 없이
-- 테이블 + RLS + 시드만 담은 안전 버전.
--
-- ※ 뷰나 v_active_count 같은 보조 객체는 일절 사용하지 않음.
-- ※ Supabase SQL Editor에 전체 복붙 → Run 한 번으로 완료.
-- ※ 멱등 (여러 번 실행해도 안전): 테이블은 있으면 skip, 정책은 drop 후 재생성.
-- ============================================

-- ======== 1) 투표소 테이블 ========
create table if not exists public.polling_stations (
  id                     uuid primary key default gen_random_uuid(),
  district               text not null,
  station_name           text not null,
  address                text not null default '',
  max_observers          integer not null default 2 check (max_observers > 0),
  current_observer_count integer not null default 0,
  is_active              boolean not null default true,
  created_at             timestamptz not null default now()
);

create index if not exists idx_polling_stations_district
  on public.polling_stations (district, station_name);

-- ======== 2) 참관인 신청 테이블 ========
create table if not exists public.observer_applications (
  id          uuid primary key default gen_random_uuid(),
  station_id  uuid not null references public.polling_stations(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 50),
  phone       text not null check (char_length(phone) between 4 and 30),
  district    text not null,
  status      text not null default 'pending'
                check (status in ('pending', 'confirmed', 'cancelled')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_observer_applications_station
  on public.observer_applications (station_id, status);
create index if not exists idx_observer_applications_created
  on public.observer_applications (created_at desc);

-- ======== 3) RLS ========
alter table public.polling_stations      enable row level security;
alter table public.observer_applications enable row level security;

-- polling_stations: 공개 읽기 (활성화된 행만)
drop policy if exists "polling_stations_select_public" on public.polling_stations;
create policy "polling_stations_select_public"
  on public.polling_stations for select
  using (is_active = true);

-- polling_stations: admin 전체 관리
drop policy if exists "polling_stations_admin_all" on public.polling_stations;
create policy "polling_stations_admin_all"
  on public.polling_stations for all
  using (
    exists (select 1 from public.profiles
             where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles
             where id = auth.uid() and role = 'admin')
  );

-- observer_applications: 누구나 INSERT (익명 신청)
drop policy if exists "observer_applications_insert_public" on public.observer_applications;
create policy "observer_applications_insert_public"
  on public.observer_applications for insert
  with check (
    char_length(name)  between 1 and 50
    and char_length(phone) between 4 and 30
    and status = 'pending'
  );

-- observer_applications: SELECT / UPDATE / DELETE 는 admin만 (개인정보 보호)
drop policy if exists "observer_applications_select_admin" on public.observer_applications;
create policy "observer_applications_select_admin"
  on public.observer_applications for select
  using (
    exists (select 1 from public.profiles
             where id = auth.uid() and role = 'admin')
  );

drop policy if exists "observer_applications_update_admin" on public.observer_applications;
create policy "observer_applications_update_admin"
  on public.observer_applications for update
  using (
    exists (select 1 from public.profiles
             where id = auth.uid() and role = 'admin')
  );

drop policy if exists "observer_applications_delete_admin" on public.observer_applications;
create policy "observer_applications_delete_admin"
  on public.observer_applications for delete
  using (
    exists (select 1 from public.profiles
             where id = auth.uid() and role = 'admin')
  );

-- ======== 4) 투표소 시드 (빈 테이블일 때만) ========
insert into public.polling_stations (district, station_name, address, max_observers)
select * from (values
  -- 장안구
  ('장안구', '장안구청 제1투표소',   '경기도 수원시 장안구 경수대로 1150',       2),
  ('장안구', '정자1동 행정복지센터',  '경기도 수원시 장안구 수성로 303',         2),
  ('장안구', '율천동 주민센터',       '경기도 수원시 장안구 율전로 97',          2),
  ('장안구', '파장동 주민센터',       '경기도 수원시 장안구 경수대로 1049',       2),
  ('장안구', '영화동 주민센터',       '경기도 수원시 장안구 영화로 47',          2),
  -- 권선구
  ('권선구', '권선구청 제1투표소',   '경기도 수원시 권선구 권선로 458',         2),
  ('권선구', '세류1동 행정복지센터',  '경기도 수원시 권선구 동말로 47번길 22',    2),
  ('권선구', '곡선동 주민센터',       '경기도 수원시 권선구 곡선로 79',          2),
  ('권선구', '입북동 주민센터',       '경기도 수원시 권선구 세화로 125',         2),
  ('권선구', '호매실동 행정복지센터', '경기도 수원시 권선구 칠보로 59',          2),
  -- 팔달구
  ('팔달구', '팔달구청 제1투표소',   '경기도 수원시 팔달구 효원로 241',         2),
  ('팔달구', '인계동 행정복지센터',   '경기도 수원시 팔달구 권광로 145',         2),
  ('팔달구', '화서1동 주민센터',      '경기도 수원시 팔달구 화서문로 56',         2),
  ('팔달구', '지동 주민센터',         '경기도 수원시 팔달구 창룡대로 188',        2),
  ('팔달구', '매교동 주민센터',       '경기도 수원시 팔달구 매산로 90번길 13',    2),
  -- 영통구
  ('영통구', '영통구청 제1투표소',   '경기도 수원시 영통구 청명로 102',         2),
  ('영통구', '매탄1동 행정복지센터',  '경기도 수원시 영통구 덕영대로 1556',       2),
  ('영통구', '원천동 주민센터',       '경기도 수원시 영통구 월드컵로 176',        2),
  ('영통구', '이의동 주민센터',       '경기도 수원시 영통구 광교중앙로 210',      2),
  ('영통구', '망포1동 주민센터',      '경기도 수원시 영통구 매영로 394',         2)
) as v(district, station_name, address, max_observers)
where not exists (select 1 from public.polling_stations limit 1);
