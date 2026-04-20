-- ============================================
-- 00018_observers.sql
-- 참관인 신청 시스템
-- - polling_stations: 투표소 마스터
-- - observer_applications: 참관인 신청 내역
-- ============================================

-- ======== 1) 투표소 ========
create table if not exists public.polling_stations (
  id            uuid primary key default gen_random_uuid(),
  district      text not null,
  station_name  text not null,
  address       text not null default '',
  max_observers integer not null default 2 check (max_observers > 0),
  current_observer_count integer not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create index if not exists idx_polling_stations_district
  on public.polling_stations (district, station_name);

-- ======== 2) 참관인 신청 ========
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

-- updated_at 트리거 (공통 함수 활용)
create trigger trg_observer_applications_updated_at
  before update on public.observer_applications
  for each row execute function public.set_updated_at();

-- ======== 3) 인원수 자동 집계 트리거 ========
-- cancelled 는 정원에서 제외 (공석 복구)
create or replace function public.recount_polling_station(p_station_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
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
$$;

create or replace function public.observer_applications_recount_trigger()
returns trigger
language plpgsql
as $$
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
$$;

drop trigger if exists trg_observer_applications_recount on public.observer_applications;
create trigger trg_observer_applications_recount
  after insert or update or delete on public.observer_applications
  for each row execute function public.observer_applications_recount_trigger();

-- ======== 4) 정원 초과 방지 트리거 ========
create or replace function public.check_observer_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_active_count int;
  v_max int;
begin
  -- cancelled 상태로 들어오는 것은 정원 체크 불필요
  if new.status = 'cancelled' then
    return new;
  end if;

  select count(*) into v_active_count
    from public.observer_applications
   where station_id = new.station_id
     and status in ('pending', 'confirmed')
     and (tg_op = 'INSERT' or id <> new.id);

  select max_observers into v_max
    from public.polling_stations
   where id = new.station_id;

  if v_active_count >= coalesce(v_max, 2) then
    raise exception '해당 투표소는 정원이 마감되었습니다.' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_observer_applications_capacity on public.observer_applications;
create trigger trg_observer_applications_capacity
  before insert or update on public.observer_applications
  for each row execute function public.check_observer_capacity();

-- ======== 5) RLS ========
alter table public.polling_stations enable row level security;
alter table public.observer_applications enable row level security;

-- polling_stations: 누구나 활성 투표소 읽기
create policy "polling_stations_select_public"
  on public.polling_stations for select
  using (is_active = true);

-- polling_stations: admin 전체
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

-- observer_applications: 누구나 INSERT 가능
create policy "observer_applications_insert_public"
  on public.observer_applications for insert
  with check (
    char_length(name) between 1 and 50
    and char_length(phone) between 4 and 30
    and status = 'pending'
  );

-- observer_applications: SELECT는 admin만 (개인정보 보호)
create policy "observer_applications_select_admin"
  on public.observer_applications for select
  using (
    exists (select 1 from public.profiles
             where id = auth.uid() and role = 'admin')
  );

-- observer_applications: UPDATE/DELETE admin만
create policy "observer_applications_update_admin"
  on public.observer_applications for update
  using (
    exists (select 1 from public.profiles
             where id = auth.uid() and role = 'admin')
  );

create policy "observer_applications_delete_admin"
  on public.observer_applications for delete
  using (
    exists (select 1 from public.profiles
             where id = auth.uid() and role = 'admin')
  );

-- ======== 6) 수원시 투표소 시드 (각 구당 5개 샘플) ========
-- 실제 투표소 정보는 관리자가 백오피스에서 보강
insert into public.polling_stations (district, station_name, address, max_observers) values
  -- 장안구
  ('장안구', '장안구청 제1투표소', '경기도 수원시 장안구 경수대로 1150', 2),
  ('장안구', '정자1동 행정복지센터', '경기도 수원시 장안구 수성로 303', 2),
  ('장안구', '율천동 주민센터', '경기도 수원시 장안구 율전로 97', 2),
  ('장안구', '파장동 주민센터', '경기도 수원시 장안구 경수대로 1049', 2),
  ('장안구', '영화동 주민센터', '경기도 수원시 장안구 영화로 47', 2),
  -- 권선구
  ('권선구', '권선구청 제1투표소', '경기도 수원시 권선구 권선로 458', 2),
  ('권선구', '세류1동 행정복지센터', '경기도 수원시 권선구 동말로 47번길 22', 2),
  ('권선구', '곡선동 주민센터', '경기도 수원시 권선구 곡선로 79', 2),
  ('권선구', '입북동 주민센터', '경기도 수원시 권선구 세화로 125', 2),
  ('권선구', '호매실동 행정복지센터', '경기도 수원시 권선구 칠보로 59', 2),
  -- 팔달구
  ('팔달구', '팔달구청 제1투표소', '경기도 수원시 팔달구 효원로 241', 2),
  ('팔달구', '인계동 행정복지센터', '경기도 수원시 팔달구 권광로 145', 2),
  ('팔달구', '화서1동 주민센터', '경기도 수원시 팔달구 화서문로 56', 2),
  ('팔달구', '지동 주민센터', '경기도 수원시 팔달구 창룡대로 188', 2),
  ('팔달구', '매교동 주민센터', '경기도 수원시 팔달구 매산로 90번길 13', 2),
  -- 영통구
  ('영통구', '영통구청 제1투표소', '경기도 수원시 영통구 청명로 102', 2),
  ('영통구', '매탄1동 행정복지센터', '경기도 수원시 영통구 덕영대로 1556', 2),
  ('영통구', '원천동 주민센터', '경기도 수원시 영통구 월드컵로 176', 2),
  ('영통구', '이의동 주민센터', '경기도 수원시 영통구 광교중앙로 210', 2),
  ('영통구', '망포1동 주민센터', '경기도 수원시 영통구 매영로 394', 2)
on conflict do nothing;
