-- ============================================
-- 00020_observers_update.sql
-- observer_applications: 거주지 / 당원여부 컬럼 추가
--
-- 기존 테이블 있는 경우에만 컬럼 추가 (멱등).
-- Supabase SQL Editor 한 번 실행.
-- ============================================

-- 1) residence 컬럼 (거주지)
alter table public.observer_applications
  add column if not exists residence text;

-- 2) residence 값 제약 (기존 NULL은 허용 — 레거시 데이터 대응)
alter table public.observer_applications
  drop constraint if exists observer_applications_residence_check;

alter table public.observer_applications
  add constraint observer_applications_residence_check
  check (
    residence is null
    or residence in (
      '수원시권선구',
      '수원시영통구',
      '수원시장안구',
      '수원시팔달구',
      '수원외'
    )
  );

-- 3) is_party_member 컬럼 (당원여부)
alter table public.observer_applications
  add column if not exists is_party_member boolean not null default false;

-- 4) 참고 인덱스 (거주지별 집계용)
create index if not exists idx_observer_applications_residence
  on public.observer_applications (residence);
