-- 공약제안 페이지 상단 콘텐츠 초기값 시드
-- (00015는 propose_suggestions 테이블에서 사용 중이므로 00016로 생성)

-- 거주지역이 백오피스에서 동적으로 관리되도록 CHECK 제약 제거
-- (고정 5개 구에서 관리자 추가/삭제 가능하게 완화)
alter table public.propose_suggestions
  drop constraint if exists propose_suggestions_district_check;

-- 1) we_propose_intro: 제목 / 부제 / 선거법 경고문
insert into public.content_blocks (slug, title, body_html, body_json, is_active)
values (
  'we_propose_intro',
  '시민 공약제안',
  '',
  jsonb_build_object(
    'subtitle', '수원의 가능성을 함께 만들어 갑니다. 당신의 아이디어를 들려주세요.',
    'warning', '타 후보 비방, 허위사실 유포 등 공직선거법 위반 게시물은 즉시 삭제되며, 작성된 글은 삭제할 수 없습니다. 100자 이내로 정중히 작성해 주세요.'
  ),
  true
)
on conflict (slug) do nothing;

-- 2) we_propose_districts: 거주지역 목록 (JSON 배열)
insert into public.content_blocks (slug, title, body_html, body_json, is_active)
values (
  'we_propose_districts',
  '거주지역 목록',
  '',
  jsonb_build_array('장안구', '권선구', '팔달구', '영통구', '기타'),
  true
)
on conflict (slug) do nothing;
