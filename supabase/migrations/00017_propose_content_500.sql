-- 공약제안 글자수 제한 100자 → 500자로 완화

-- 1) 기존 content 길이 CHECK 제약 제거
alter table public.propose_suggestions
  drop constraint if exists propose_suggestions_content_check;

-- 2) 새 CHECK 제약 추가 (1~500자)
alter table public.propose_suggestions
  add constraint propose_suggestions_content_check
  check (char_length(content) between 1 and 500);

-- 3) 기존 시드 경고 문구의 "100자" 표현을 "500자"로 갱신 (관리자가 이미 수정한 경우 변경하지 않음)
update public.content_blocks
set body_json = jsonb_set(
      body_json,
      '{warning}',
      to_jsonb(replace(body_json->>'warning', '100자', '500자'))
    )
where slug = 'we_propose_intro'
  and body_json ? 'warning'
  and body_json->>'warning' like '%100자%';
