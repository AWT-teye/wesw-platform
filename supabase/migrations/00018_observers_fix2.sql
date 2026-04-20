-- ============================================
-- 00018_observers_fix2.sql
-- 참관인 시스템 — 최종 수정본
-- 이전 fix 파일에서도 지속 발생한
--   ERROR 42P01: relation "v_active_count" does not exist
-- 문제를 근본 해결.
--
-- 변경점:
--   - check_observer_capacity() 에서 DECLARE / SELECT INTO 완전 제거
--   - 서브쿼리 두 개를 IF 조건에 직접 삽입 (지역 변수 無)
--   - 이전에 잘못 생성됐을 가능성이 있는 "v_active_count" 관계 선제 DROP
--   - 모든 함수/트리거/정책을 멱등적으로 재설치
--
-- Supabase SQL Editor에서 전체 복붙 후 Run.
-- ============================================

-- ======== 0) 과거 실행 찌꺼기 정리 ========
-- 잘못 생성된 v_active_count 테이블/뷰가 있으면 제거 (있을 가능성 낮지만 방어)
drop view  if exists public.v_active_count cascade;
drop table if exists public.v_active_count cascade;

-- 기존 트리거/함수 정리 (존재하지 않아도 에러 없음)
drop trigger if exists trg_observer_applications_capacity on public.observer_applications;
drop trigger if exists trg_observer_applications_recount  on public.observer_applications;
drop trigger if exists trg_observer_applications_updated_at on public.observer_applications;

drop function if exists public.check_observer_capacity() cascade;
drop function if exists public.observer_applications_recount_trigger() cascade;
drop function if exists public.recount_polling_station(uuid) cascade;

-- ======== 1) 공통 헬퍼 함수 (누락 시 생성) ========
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $OBS$
begin
  new.updated_at := now();
  return new;
end;
$OBS$;

-- ======== 2) 투표소 테이블 ========
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

-- ======== 3) 참관인 신청 테이블 ========
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

create trigger trg_observer_applications_updated_at
  before update on public.observer_applications
  for each row execute function public.set_updated_at();

-- ======== 4) 인원수 자동 집계 함수 & 트리거 ========
create or replace function public.recount_polling_station(p_station_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $OBS$
begin
  update public.polling_stations
     set current_observer_count = (
       select count(*)
         from public.observer_applications
        where station_id = p_station_id
          and status in ('pending', 'confirmed')
     )
   where id = p_station_id;
end;
$OBS$;

create or replace function public.observer_applications_recount_trigger()
returns trigger
language plpgsql
as $OBS$
begin
  if tg_op = 'DELETE' then
    perform public.recount_polling_station(old.station_id);
    return old;
  elsif tg_op = 'UPDATE' then
    perform public.recount_polling_station(new.station_id);
    if new.station_id <> old.station_id then
      perform public.recount_polling_station(old.station_id);
    end if;
    return new;
  else
    perform public.recount_polling_station(new.station_id);
    return new;
  end if;
end;
$OBS$;

create trigger trg_observer_applications_recount
  after insert or update or delete on public.observer_applications
  for each row execute function public.observer_applications_recount_trigger();

-- ======== 5) 정원 초과 방지 함수 & 트리거 ========
-- ★ DECLARE / SELECT INTO 제거, 서브쿼리로 직접 비교
create or replace function public.check_observer_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $OBS$
begin
  -- cancelled 상태는 정원 체크 제외
  if new.status = 'cancelled' then
    return new;
  end if;

  if (
    select count(*)::int
      from public.observer_applications
     where station_id = new.station_id
       and status in ('pending', 'confirmed')
       and (tg_op = 'INSERT' or id <> new.id)
  ) >= coalesce(
    (select max_observers
       from public.polling_stations
      where id = new.station_id),
    2
  ) then
    raise exception '해당 투표소는 정원이 마감되었습니다.' using errcode = 'P0001';
  end if;

  return new;
end;
$OBS$;

create trigger trg_observer_applications_capacity
  before insert or update on public.observer_applications
  for each row execute function public.check_observer_capacity();

-- ======== 6) RLS ========
alter table public.polling_stations      enable row level security;
alter table public.observer_applications enable row level security;

drop policy if exists "polling_stations_select_public" on public.polling_stations;
create policy "polling_stations_select_public"
  on public.polling_stations for select
  using (is_active = true);

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

drop policy if exists "observer_applications_insert_public" on public.observer_applications;
create policy "observer_applications_insert_public"
  on public.observer_applications for insert
  with check (
    char_length(name) between 1 and 50
    and char_length(phone) between 4 and 30
    and status = 'pending'
  );

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

-- ======== 7) 시드 (빈 테이블일 때만) ========
insert into public.polling_stations (district, station_name, address, max_observers)
select * from (values
  ('장안구', '장안구청 제1투표소',        '경기도 수원시 장안구 경수대로 1150', 2),
  ('장안구', '정자1동 행정복지센터',       '경기도 수원시 장안구 수성로 303', 2),
  ('장안구', '율천동 주민센터',           '경기도 수원시 장안구 율전로 97', 2),
  ('장안구', '파장동 주민센터',           '경기도 수원시 장안구 경수대로 1049', 2),
  ('장안구', '영화동 주민센터',           '경기도 수원시 장안구 영화로 47', 2),
  ('권선구', '권선구청 제1투표소',        '경기도 수원시 권선구 권선로 458', 2),
  ('권선구', '세류1동 행정복지센터',       '경기도 수원시 권선구 동말로 47번길 22', 2),
  ('권선구', '곡선동 주민센터',           '경기도 수원시 권선구 곡선로 79', 2),
  ('권선구', '입북동 주민센터',           '경기도 수원시 권선구 세화로 125', 2),
  ('권선구', '호매실동 행정복지센터',      '경기도 수원시 권선구 칠보로 59', 2),
  ('팔달구', '팔달구청 제1투표소',        '경기도 수원시 팔달구 효원로 241', 2),
  ('팔달구', '인계동 행정복지센터',       '경기도 수원시 팔달구 권광로 145', 2),
  ('팔달구', '화서1동 주민센터',          '경기도 수원시 팔달구 화서문로 56', 2),
  ('팔달구', '지동 주민센터',             '경기도 수원시 팔달구 창룡대로 188', 2),
  ('팔달구', '매교동 주민센터',           '경기도 수원시 팔달구 매산로 90번길 13', 2),
  ('영통구', '영통구청 제1투표소',        '경기도 수원시 영통구 청명로 102', 2),
  ('영통구', '매탄1동 행정복지센터',       '경기도 수원시 영통구 덕영대로 1556', 2),
  ('영통구', '원천동 주민센터',           '경기도 수원시 영통구 월드컵로 176', 2),
  ('영통구', '이의동 주민센터',           '경기도 수원시 영통구 광교중앙로 210', 2),
  ('영통구', '망포1동 주민센터',          '경기도 수원시 영통구 매영로 394', 2)
) as v(district, station_name, address, max_observers)
where not exists (select 1 from public.polling_stations limit 1);

-- ======== 8) 카운트 재집계 (기존 데이터 보정) ========
update public.polling_stations ps
   set current_observer_count = coalesce(sub.cnt, 0)
  from (
    select station_id, count(*) as cnt
      from public.observer_applications
     where status in ('pending', 'confirmed')
     group by station_id
  ) sub
 where sub.station_id = ps.id;

update public.polling_stations
   set current_observer_count = 0
 where id not in (
   select distinct station_id
     from public.observer_applications
    where status in ('pending', 'confirmed')
 );
