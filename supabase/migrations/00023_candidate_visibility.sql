-- ============================================
-- 00023_candidate_visibility.sql
-- 후보 소개 섹션별 노출 여부 토글 컬럼 추가
--   show_slogan        : 슬로건
--   show_vision        : 비전
--   show_bio           : 소개 (bio)
--   show_declaration   : 출마선언문
--   show_office        : 선거사무소 정보
--   show_profile_info  : 인적사항 블록 (생년월일/고향/거주지/병역/선거/학력/수상/약력)
--   show_stories       : 스토리 섹션 전체
-- 개별 스토리(스토리1/2/3)의 노출 여부는 stories_json 각 원소의 show 필드로 관리.
-- (missing / null → true 로 해석)
-- ============================================

alter table public.candidates
  add column if not exists show_slogan        boolean not null default true,
  add column if not exists show_vision        boolean not null default true,
  add column if not exists show_bio           boolean not null default true,
  add column if not exists show_declaration   boolean not null default true,
  add column if not exists show_office        boolean not null default true,
  add column if not exists show_profile_info  boolean not null default true,
  add column if not exists show_stories       boolean not null default true;
