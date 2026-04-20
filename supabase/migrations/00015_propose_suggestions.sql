-- 공약제안 게시판
-- we.wesw.kr /we/propose 공개 입력, 삭제 불가(작성자), admin만 삭제 가능
create table if not exists propose_suggestions (
  id         uuid primary key default gen_random_uuid(),
  content    text not null check (char_length(content) between 1 and 100),
  district   text not null check (district in ('장안구', '권선구', '팔달구', '영통구', '기타')),
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

alter table propose_suggestions enable row level security;

-- 누구나 활성 행 읽기 (is_active = true)
create policy "propose_suggestions_select_public"
  on propose_suggestions for select
  using (is_active = true);

-- admin은 전체 읽기
create policy "propose_suggestions_select_admin"
  on propose_suggestions for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- 누구나 insert 가능 (비로그인 포함 — 공약 제안은 공개 접수)
create policy "propose_suggestions_insert_public"
  on propose_suggestions for insert
  with check (
    char_length(content) between 1 and 100
    and district in ('장안구', '권선구', '팔달구', '영통구', '기타')
  );

-- update는 admin만 (비활성화 처리용)
create policy "propose_suggestions_update_admin"
  on propose_suggestions for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- delete는 admin만
create policy "propose_suggestions_delete_admin"
  on propose_suggestions for delete
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create index if not exists idx_propose_suggestions_active_created
  on propose_suggestions (is_active, created_at desc);
