-- 팩트체크 게시판
create table if not exists fact_checks (
  id         uuid primary key default gen_random_uuid(),
  type       text not null check (type in ('refute', 'expose', 'critique')),
  claim      text not null,
  truth      text not null,
  source     text not null default '',
  is_active  boolean not null default true,
  order_num  integer not null default 0,
  created_at timestamptz not null default now()
);

-- RLS
alter table fact_checks enable row level security;

-- 누구나 활성 행 읽기
create policy "fact_checks_select_public"
  on fact_checks for select
  using (is_active = true);

-- admin만 전체 읽기
create policy "fact_checks_select_admin"
  on fact_checks for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- admin만 insert/update/delete
create policy "fact_checks_insert_admin"
  on fact_checks for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "fact_checks_update_admin"
  on fact_checks for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "fact_checks_delete_admin"
  on fact_checks for delete
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- 정렬용 인덱스
create index idx_fact_checks_active_order on fact_checks (is_active, order_num desc, created_at desc);
