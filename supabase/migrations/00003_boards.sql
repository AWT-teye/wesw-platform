-- ============================================
-- 00003_boards.sql
-- 게시판 카테고리 테이블 + 시드 데이터
-- ============================================

CREATE TABLE public.boards (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text NOT NULL UNIQUE,
  name          text NOT NULL,
  description   text,
  board_type    text NOT NULL DEFAULT 'general'
                  CHECK (board_type IN ('general', 'sangeon', 'manin')),
  display_order integer DEFAULT 0,
  is_active     boolean DEFAULT true,
  is_archived   boolean DEFAULT false,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

COMMENT ON TABLE public.boards IS '게시판 카테고리';
COMMENT ON COLUMN public.boards.board_type IS 'general: 일반, sangeon: 상언격쟁(추천10회 자동노출), manin: 개혁만인소(상태추적)';

CREATE TRIGGER trg_boards_updated_at
  BEFORE UPDATE ON public.boards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 시드 데이터: 8개 게시판
INSERT INTO public.boards (slug, name, description, board_type, display_order) VALUES
  ('sangeon',   '상언격쟁',   '추천 10회 이상 게시글 자동 노출 + 공식 답변 필수', 'sangeon', 1),
  ('gwonseon',  '수원시 권선구', '권선구 지역 게시판',                              'general', 2),
  ('yeongtong', '수원시 영통구', '영통구 지역 게시판',                              'general', 3),
  ('jangan',    '수원시 장안구', '장안구 지역 게시판',                              'general', 4),
  ('paldal',    '수원시 팔달구', '팔달구 지역 게시판',                              'general', 5),
  ('ineup',     '인읍교린',     '인근도시 당원/시민 게시판',                        'general', 6),
  ('haehak',    '해학사랑방',   '유머 게시판',                                      'general', 7),
  ('gaehyeok',  '개혁만인소',   '정책/공약 제안 게시판 (접수→검토중→답변완료)',       'manin',   8);
