-- ============================================
-- 00010_content_blocks.sql
-- 자유 텍스트/리치텍스트 콘텐츠 블록
-- (캠프 소개, 슬로건, 푸터 의무표시 등 단일 텍스트 블록 보관)
-- ============================================

CREATE TABLE public.content_blocks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  title       text,
  body_html   text,
  body_json   jsonb,
  is_active   boolean DEFAULT true,
  is_archived boolean DEFAULT false,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

COMMENT ON TABLE public.content_blocks IS '자유 텍스트 블록 (캠프소개·슬로건·푸터 등). slug로 식별';
COMMENT ON COLUMN public.content_blocks.slug IS '식별 키 (예: we_camp_intro, we_slogan, we_footer_legal)';
COMMENT ON COLUMN public.content_blocks.body_html IS '렌더링용 sanitized HTML';
COMMENT ON COLUMN public.content_blocks.body_json IS 'Tiptap 등 에디터 원본 JSON (편집 복원용)';

CREATE TRIGGER trg_content_blocks_updated_at
  BEFORE UPDATE ON public.content_blocks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_content_blocks_slug ON public.content_blocks(slug);

-- ======== RLS ========
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blocks_select" ON public.content_blocks
  FOR SELECT USING (is_active = true AND is_archived = false);

CREATE POLICY "blocks_admin_insert" ON public.content_blocks
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "blocks_admin_update" ON public.content_blocks
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "blocks_admin_delete" ON public.content_blocks
  FOR DELETE USING (public.is_admin());

-- ======== 시드: we.wesw.kr 초기 블록 ========
INSERT INTO public.content_blocks (slug, title, body_html) VALUES
  (
    'we_camp_intro',
    '수원 9.0캠프',
    '<p>잃어버린 수원의 성장동력, 가능성. 수원 9.0캠프는 가능성과 미래를 준비합니다. 시민의 목소리와 책임있는 행정, 문제를 외면하지않는 담대함으로 수원을 재도약시키고 세계선도도시로 만들겠습니다.</p>'
  ),
  (
    'we_slogan',
    '슬로건',
    '<p>모든 가능성을, 모두에게.<br/>우리는 수원입니다.</p>'
  ),
  (
    'we_footer_legal',
    '선거관리위원회 의무표시',
    '<p>(선거사무소 주소·전화·후원회 정보 등 — 백오피스에서 편집)</p>'
  );
