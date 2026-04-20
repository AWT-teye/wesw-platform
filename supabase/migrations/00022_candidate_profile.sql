-- ============================================
-- 00022_candidate_profile.sql
-- 후보 소개 페이지용 구조화된 프로필/스토리 컬럼 추가 + 초기 시드
--
-- profile_json: 인적사항(직함·생년월일·고향·거주지·병역·선거·학력·수상·약력)
-- stories_json: 스토리 3섹션 (정치를 시작한 이유 / 정치관 / 사회공헌)
-- 각 컬럼은 멀티라인 텍스트는 개행 문자(\n) 로 구분.
-- ============================================

-- 1) 컬럼 추가 (멱등)
alter table public.candidates
  add column if not exists profile_json jsonb default '{}'::jsonb;

alter table public.candidates
  add column if not exists stories_json jsonb default '[]'::jsonb;

-- 2) 기존 primary candidate 행이 있으면 프로필/스토리 시드
update public.candidates
set
  profile_json = jsonb_build_object(
    'title',     '수원특례시장 예비후보 / 개혁신당',
    'birth',     '1987년 5월 28일',
    'hometown',  '서울특별시',
    'residence', '경기도 수원시 장안구',
    'military',  '대한민국 해병대 병장 전역 (병1026기)',
    'election',  '제9회 전국동시지방선거 수원특례시장 후보',
    'education', E'파장초등학교\n수성중학교\n삼일고등학교\n인하대학교 정치외교학과\n고려대학교 문화스포츠대학원 사회복지학 석사\n광운대학교 대학원 건설법무학과 박사과정(휴학중)',
    'awards',    E'대한민국 신지식인 선정\n대한민국 인재상 대통령상',
    'career',    E'이찬열 국회의원 비서(전)\n제22대 국회의원(수원시 갑) 후보\n개혁신당 당대표 이준석 정책특보(전)\n개혁신당 수원시당 합동위원장'
  ),
  stories_json = jsonb_build_array(
    jsonb_build_object(
      'title', '정치를 시작한 이유',
      'body',  '대한민국의 정치인이자 작곡인, 발명가, 교육인, 방송인입니다. 수원에서 30년 넘게 살아온 지역구 국회의원이 이 정도의 위기를 해결하지 못한다면 누가 해결합니까. 저 정희윤이 직접 나섰습니다.'
    ),
    jsonb_build_object(
      'title', '정치관',
      'body',  '특권 없는 정치, 시민이 주인인 행정. 세금은 시민의 것이고, 예산은 미래를 위해 써야 합니다. 기회의 도시 수원을 만들겠습니다.'
    ),
    jsonb_build_object(
      'title', '사회공헌',
      'body',  '수원시 해병대 전우회 사무국장으로 지역 사회와 함께했습니다. 정치소인개발연구소를 설립하여 매주 수요일 무료 정치 강의를 진행했습니다.'
    )
  )
where id = (
  select id from public.candidates
  order by display_order nulls last, created_at
  limit 1
)
and (profile_json is null or profile_json = '{}'::jsonb);

-- 3) 아직 candidate 행이 없다면 시드 데이터로 신규 생성
insert into public.candidates (
  name, position_type, district, slogan, sns_links, display_order,
  profile_json, stories_json
)
select
  '정희윤',
  'mayor',
  '수원시',
  '모든 가능성을, 모두에게. 우리는 수원입니다.',
  '{}'::jsonb,
  1,
  jsonb_build_object(
    'title',     '수원특례시장 예비후보 / 개혁신당',
    'birth',     '1987년 5월 28일',
    'hometown',  '서울특별시',
    'residence', '경기도 수원시 장안구',
    'military',  '대한민국 해병대 병장 전역 (병1026기)',
    'election',  '제9회 전국동시지방선거 수원특례시장 후보',
    'education', E'파장초등학교\n수성중학교\n삼일고등학교\n인하대학교 정치외교학과\n고려대학교 문화스포츠대학원 사회복지학 석사\n광운대학교 대학원 건설법무학과 박사과정(휴학중)',
    'awards',    E'대한민국 신지식인 선정\n대한민국 인재상 대통령상',
    'career',    E'이찬열 국회의원 비서(전)\n제22대 국회의원(수원시 갑) 후보\n개혁신당 당대표 이준석 정책특보(전)\n개혁신당 수원시당 합동위원장'
  ),
  jsonb_build_array(
    jsonb_build_object(
      'title', '정치를 시작한 이유',
      'body',  '대한민국의 정치인이자 작곡인, 발명가, 교육인, 방송인입니다. 수원에서 30년 넘게 살아온 지역구 국회의원이 이 정도의 위기를 해결하지 못한다면 누가 해결합니까. 저 정희윤이 직접 나섰습니다.'
    ),
    jsonb_build_object(
      'title', '정치관',
      'body',  '특권 없는 정치, 시민이 주인인 행정. 세금은 시민의 것이고, 예산은 미래를 위해 써야 합니다. 기회의 도시 수원을 만들겠습니다.'
    ),
    jsonb_build_object(
      'title', '사회공헌',
      'body',  '수원시 해병대 전우회 사무국장으로 지역 사회와 함께했습니다. 정치소인개발연구소를 설립하여 매주 수요일 무료 정치 강의를 진행했습니다.'
    )
  )
where not exists (select 1 from public.candidates);
