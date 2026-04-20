-- ============================================
-- 00014_we_popup_seed.sql
-- we.wesw.kr 메인 팝업 초기 데이터
-- ============================================

INSERT INTO public.content_blocks (slug, title, body_html, body_json, is_active)
VALUES (
  'we_popup',
  '수원 9.0캠프 서포터즈를 모집합니다',
  '<p>정희윤 수원시장 예비후보와 함께할 서포터즈를 모집합니다. 수원의 미래를 함께 만들어갈 분들의 많은 참여를 바랍니다.</p>',
  '{"button_text": "서포터즈 신청하기", "button_link": "/we/supporters"}'::jsonb,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  body_html = EXCLUDED.body_html,
  body_json = EXCLUDED.body_json,
  is_active = EXCLUDED.is_active;
