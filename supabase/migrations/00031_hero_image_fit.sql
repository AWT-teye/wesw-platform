-- ============================================
-- 00031_hero_image_fit.sql
-- hero_settings.image_fit 컬럼 추가
-- 'contain' (이미지 전체 표시, 잘림 없음 — 권장 / 기본값)
-- 'cover'   (화면 꽉 채우기, 위아래/좌우 잘림 가능)
-- 데스크톱에서만 적용. 모바일은 항상 cover (인물/주피사체 중앙 보존).
-- ============================================

ALTER TABLE public.hero_settings
  ADD COLUMN IF NOT EXISTS image_fit text DEFAULT 'contain'
    CHECK (image_fit IN ('contain', 'cover'));

COMMENT ON COLUMN public.hero_settings.image_fit IS
  '데스크톱 배경 이미지 표시 방식 — contain(전체표시) 또는 cover(꽉채움). 모바일은 항상 cover.';
