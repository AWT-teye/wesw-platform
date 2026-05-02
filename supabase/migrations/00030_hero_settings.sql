-- ============================================
-- 00030_hero_settings.sql
-- 메인페이지(/we) 대문(Hero) 섹션 설정
-- 단일 row 운영 (백오피스에서 UPSERT) — 이미지/오버레이/텍스트/CTA 관리
-- ============================================

CREATE TABLE IF NOT EXISTS public.hero_settings (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  background_image_url  text,
  overlay_opacity       numeric DEFAULT 0.5
                          CHECK (overlay_opacity >= 0 AND overlay_opacity <= 1),
  overlay_color         text DEFAULT '#000000',
  use_image_background  boolean DEFAULT false,
  badge_text            text DEFAULT 'WE SUWON',
  headline_main         text DEFAULT '모든 가능성을,',
  headline_accent       text DEFAULT '모두에게',
  subline               text DEFAULT '정희윤이 만드는 수원 9.0',
  cta_primary_text      text DEFAULT '공약 보기',
  cta_primary_url       text DEFAULT '/we/pledges',
  cta_secondary_text    text DEFAULT '서포터즈 신청',
  cta_secondary_url     text DEFAULT '/we/supporters',
  is_active             boolean DEFAULT true,
  updated_at            timestamptz DEFAULT now()
);

COMMENT ON TABLE public.hero_settings IS '메인페이지(/we) 대문 섹션 설정 — 단일 row 운영';

-- 기본 row 시드 (테이블이 비어있을 때만 1건 삽입 — 멱등)
INSERT INTO public.hero_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM public.hero_settings);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE public.hero_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read hero" ON public.hero_settings;
CREATE POLICY "public read hero" ON public.hero_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin all hero" ON public.hero_settings;
CREATE POLICY "admin all hero" ON public.hero_settings
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
