-- ============================================
-- 00029_organization.sql
-- 조직도 (org_nodes) + 연락처 (org_contacts)
-- /we/organization, /admin/organization 에서 사용
-- ============================================

-- 조직 노드 테이블
CREATE TABLE IF NOT EXISTS public.org_nodes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_key      text UNIQUE NOT NULL,
  name_ko       text NOT NULL,
  name_en       text,
  role          text,
  person_name   text,
  description   text,
  parent_key    text,
  level         integer DEFAULT 0,
  display_order integer DEFAULT 0,
  color_scheme  text DEFAULT 'default',
  is_visible    boolean DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

COMMENT ON TABLE public.org_nodes IS '선거대책위원회 조직 노드';
COMMENT ON COLUMN public.org_nodes.node_key IS '안정적인 식별자 (계층 관계 fk로 사용)';
COMMENT ON COLUMN public.org_nodes.parent_key IS '상위 노드의 node_key (없으면 루트)';
COMMENT ON COLUMN public.org_nodes.color_scheme IS 'primary / red / green / legal / advisory / staff / team / group1 / group2 / group3 / default';

CREATE INDEX IF NOT EXISTS idx_org_nodes_parent
  ON public.org_nodes (parent_key);

DROP TRIGGER IF EXISTS trg_org_nodes_updated_at ON public.org_nodes;
CREATE TRIGGER trg_org_nodes_updated_at
  BEFORE UPDATE ON public.org_nodes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 연락처 테이블
CREATE TABLE IF NOT EXISTS public.org_contacts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_node_key  text REFERENCES public.org_nodes(node_key) ON DELETE CASCADE,
  department    text NOT NULL,
  phone         text,
  email         text,
  display_order integer DEFAULT 0,
  is_visible    boolean DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

COMMENT ON TABLE public.org_contacts IS '조직별 대표 연락처 (전화 / 이메일)';

CREATE INDEX IF NOT EXISTS idx_org_contacts_order
  ON public.org_contacts (display_order);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE public.org_nodes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read org" ON public.org_nodes;
CREATE POLICY "public read org" ON public.org_nodes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin all org" ON public.org_nodes;
CREATE POLICY "admin all org" ON public.org_nodes
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE public.org_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read contacts" ON public.org_contacts;
CREATE POLICY "public read contacts" ON public.org_contacts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin all contacts" ON public.org_contacts;
CREATE POLICY "admin all contacts" ON public.org_contacts
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- 기본 조직 데이터 seed
-- ============================================
INSERT INTO public.org_nodes
  (node_key, name_ko, name_en, role, person_name, description, parent_key, level, display_order, color_scheme)
VALUES
  ('chair',            '총괄선거대책위원장',         'Campaign Chair',     '총괄',        '정희윤', '선거 전략 총괄 지휘',           NULL,               0, 1, 'primary'),
  ('secretary_general','사무국장',                  'Secretary General',  '사무국장',     '조홍식', '3본부 실행 총괄 · 위임 전결',   'chair',            2, 1, 'red'),
  ('finance',          '재정위원회',                'Finance Committee',  '재정위원장',   NULL,     '선거 재정 · 기부 · 회계',      'chair',            1, 1, 'green'),
  ('audit',            '감사위원회',                'Audit Committee',    '감사위원장',   NULL,     '회계 감사 · 공정 관리',        'chair',            1, 2, 'green'),
  ('legal',            '법무실',                    'Legal Office',       '위원장 직속',  NULL,     '법률 · 쟁송 · 정책법리',       'chair',            1, 3, 'legal'),
  ('advisory',         '자문회의체',                'Advisory Council',   '위원장 직속',  NULL,     '통합 자문',                     'chair',            1, 4, 'advisory'),
  ('party_liaison',    '정당연락관',                'Party Liaison',      NULL,          NULL,     '개혁신당 중앙당 · 도당 공조',   'secretary_general', 3, 1, 'staff'),
  ('staff_special',    '사무특보',                  'Staff of Staff',     NULL,          NULL,     '정책·공약·미디어 부분 책임',    'secretary_general', 3, 2, 'staff'),
  ('debate_tf',        '토론회준비TF',              'Debate Prep TF',     NULL,          NULL,     '토론 준비 · 경쟁후보 분석',     'staff_special',     4, 1, 'team'),
  ('observers',        '참관인관리팀',              'Observers Team',     NULL,          NULL,     '투·개표 참관인 모집·교육·배치',  'staff_special',     4, 2, 'team'),
  ('visual',           '비주얼디렉터',              'Visual Director',    NULL,          NULL,     'CI · 인쇄물 · 디지털 브랜드',    'staff_special',     4, 3, 'team'),
  ('group1',           '1그룹 · 정책전략본부',      NULL,                 NULL,          NULL,     '정책 · 공약 총괄 · 무결성 검증', 'secretary_general', 3, 3, 'group1'),
  ('policy_dev',       '정책개발팀',                NULL,                 NULL,          NULL,     '공약 초안 · 연설문',             'group1',            4, 1, 'team'),
  ('policy_research',  '정책연구팀',                NULL,                 NULL,          NULL,     '현안 연구 · 사례 수집',          'group1',            4, 2, 'team'),
  ('policy_verify',    '정책검증팀',                NULL,                 NULL,          NULL,     '무결성 검토 · 수치 검증',        'group1',            4, 3, 'team'),
  ('data_mgmt',        '데이터관리팀',              NULL,                 NULL,          NULL,     '여론 · DB · 웹관리',             'group1',            4, 4, 'team'),
  ('analysis',         '여론분석팀',                NULL,                 NULL,          NULL,     'SNS 모니터 · 조기 경보',         'group1',            4, 5, 'team'),
  ('group2',           '2그룹 · 유세커뮤니케이션본부', NULL,              NULL,          NULL,     '메시지 · 유세 · 홍보 통합 운영', 'secretary_general', 3, 4, 'group2'),
  ('sns_team',         'SNS활동팀',                  NULL,                NULL,          NULL,     '계정 운영 · 콘텐츠 제작',        'group2',            4, 1, 'team'),
  ('youtube_team',     '유튜브운영팀',              NULL,                 NULL,          NULL,     '채널 감독 · 영상 제작',          'group2',            4, 2, 'team'),
  ('press_team',       '언론대응팀',                NULL,                 NULL,          NULL,     '대변인 · 보도자료',              'group2',            4, 3, 'team'),
  ('crisis_team',      '위기대응팀',                NULL,                 NULL,          NULL,     '24시간 대기 · 이중화 운영',      'group2',            4, 4, 'team'),
  ('canvass_team',     '후보유세지원팀',            NULL,                 NULL,          NULL,     '현장 유세 · 집회 · 거리',        'group2',            4, 5, 'team'),
  ('group3',           '3그룹 · 시민참여단',        NULL,                 NULL,          NULL,     '44동 셀 · 현장 결집',            'secretary_general', 3, 5, 'group3'),
  ('supporters',       '9.0서포터즈',                NULL,                NULL,          NULL,     '44동 셀 리더 · 시민 네트워크',    'group3',            4, 1, 'team'),
  ('field_ops',        '현장운영팀',                NULL,                 NULL,          NULL,     '인원 동원 · 행사 조직',          'group3',            4, 2, 'team'),
  ('volunteer',        '자원봉사팀',                NULL,                 NULL,          NULL,     '모집 · 교육 · 동의서 관리',      'group3',            4, 3, 'team')
ON CONFLICT (node_key) DO NOTHING;

-- 기본 연락처 seed
INSERT INTO public.org_contacts
  (org_node_key, department, phone, email, display_order)
VALUES
  ('chair',             '선거캠프 대표',       '031-000-0000', 'contact@wesw.kr',  1),
  ('secretary_general', '사무국',              '031-000-0001', 'office@wesw.kr',   2),
  ('press_team',        '언론 · 보도자료',     '031-000-0002', 'press@wesw.kr',    3),
  ('supporters',        '서포터즈 · 자원봉사', '031-000-0003', 'support@wesw.kr',  4),
  ('observers',         '참관인 신청',         '031-000-0004', 'observer@wesw.kr', 5)
ON CONFLICT DO NOTHING;
