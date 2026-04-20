-- ============================================
-- 00021_observer_counts_rpc.sql
-- 참관인 신청현황 실시간 집계
--
-- polling_stations.current_observer_count 컬럼 대신
-- observer_applications 에서 pending+confirmed 건수를 직접 count하는 RPC.
--
-- - 익명(anon)/로그인(authenticated) 사용자가 개인정보(name/phone) 노출 없이
--   투표소별 카운트만 읽을 수 있도록 SECURITY DEFINER 로 래핑.
-- ============================================

-- 1) 전체 투표소 카운트 (list 조회용)
create or replace function public.get_polling_station_counts()
returns table(station_id uuid, active_count integer)
language sql
security definer
stable
set search_path = public
as $fn$
  select station_id, count(*)::integer as active_count
    from public.observer_applications
   where status in ('pending', 'confirmed')
   group by station_id;
$fn$;

-- 2) 단일 투표소 카운트 (신청 제출 시 정원 체크용)
create or replace function public.get_station_active_count(p_station_id uuid)
returns integer
language sql
security definer
stable
set search_path = public
as $fn$
  select count(*)::integer
    from public.observer_applications
   where station_id = p_station_id
     and status in ('pending', 'confirmed');
$fn$;

-- 3) 실행 권한 부여 (익명/로그인 모두)
grant execute on function public.get_polling_station_counts() to anon, authenticated;
grant execute on function public.get_station_active_count(uuid) to anon, authenticated;
