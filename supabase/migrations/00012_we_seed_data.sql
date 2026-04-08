-- ============================================
-- 00012_we_seed_data.sql
-- 정희윤 후보 + 공약 트리(대/중/세부) 시드 데이터
-- ※ 본문(content)은 운영자가 백오피스에서 실제 정책으로 교체 예정
-- ============================================

DO $$
DECLARE
  v_candidate_id uuid;

  -- 대공약 (level=1)
  v_big_1 uuid; -- 3대 착취악법 철폐
  v_big_2 uuid; -- 성공복지체계 구축
  v_big_3 uuid; -- 하이퍼넥서스시티

  -- 중공약 (level=2)
  v_mid_education uuid;   -- 인재교육
  v_mid_startup   uuid;   -- 미래창업
  v_mid_partner   uuid;   -- 기업상생
  v_mid_governance uuid;  -- 책임행정
  v_mid_ecosystem uuid;   -- 도시생태계
BEGIN
  -- ─────────────────────────────────────────────
  -- 1) 단일 후보(정희윤) row 보장
  -- ─────────────────────────────────────────────
  SELECT id INTO v_candidate_id
    FROM public.candidates
   ORDER BY display_order
   LIMIT 1;

  IF v_candidate_id IS NULL THEN
    INSERT INTO public.candidates (name, position_type, district, slogan, sns_links, display_order)
    VALUES (
      '정희윤',
      'mayor',
      '수원시',
      '모든 가능성을, 모두에게. 우리는 수원입니다.',
      '{}'::jsonb,
      1
    )
    RETURNING id INTO v_candidate_id;
  END IF;

  -- ─────────────────────────────────────────────
  -- 2) 대공약 (level=1) — 3개
  -- ─────────────────────────────────────────────
  INSERT INTO public.policies (candidate_id, level, parent_id, title, content, display_order, is_active)
  VALUES (
    v_candidate_id, 1, NULL,
    '3대 착취악법 철폐',
    '수도권 역차별과 수원 시민의 부담을 가중시키는 3대 착취형 악법(복지예산 강제부담·재정 역차별·이권구조 보호법)을 전면 철폐하고, 수원 재정자립도 회복의 첫 단추를 끼웁니다.',
    1, true
  )
  RETURNING id INTO v_big_1;

  INSERT INTO public.policies (candidate_id, level, parent_id, title, content, display_order, is_active)
  VALUES (
    v_candidate_id, 1, NULL,
    '성공복지체계 구축',
    '시혜성 복지가 아닌, 시민 한 사람 한 사람의 자립과 성공을 돕는 성공복지체계를 만듭니다. 인재교육·일자리·돌봄을 하나로 잇는 통합 복지 플랫폼을 구축합니다.',
    2, true
  )
  RETURNING id INTO v_big_2;

  INSERT INTO public.policies (candidate_id, level, parent_id, title, content, display_order, is_active)
  VALUES (
    v_candidate_id, 1, NULL,
    '하이퍼넥서스시티',
    '교통·주거·산업·문화가 초연결된 미래도시 수원. AI·반도체·바이오 기반 혁신 클러스터와 광역 교통망을 결합해 대한민국 세계선도도시로 도약합니다.',
    3, true
  )
  RETURNING id INTO v_big_3;

  -- ─────────────────────────────────────────────
  -- 3) 중공약 (level=2) — 5개
  -- ─────────────────────────────────────────────
  INSERT INTO public.policies (candidate_id, level, parent_id, title, content, display_order, is_active)
  VALUES (
    v_candidate_id, 2, v_big_2,
    '인재교육',
    '수원의 미래를 책임질 인재를 키웁니다. 공교육 강화, 디지털·AI 교육 인프라 확대, 평생학습 플랫폼 구축으로 모든 세대의 배움을 보장합니다.',
    1, true
  )
  RETURNING id INTO v_mid_education;

  INSERT INTO public.policies (candidate_id, level, parent_id, title, content, display_order, is_active)
  VALUES (
    v_candidate_id, 2, v_big_3,
    '미래창업',
    '청년·여성·시니어가 도전할 수 있는 창업 생태계를 만듭니다. 창업자금·공간·멘토링·판로를 패키지로 지원하고, 실패해도 다시 일어설 수 있는 안전망을 구축합니다.',
    2, true
  )
  RETURNING id INTO v_mid_startup;

  INSERT INTO public.policies (candidate_id, level, parent_id, title, content, display_order, is_active)
  VALUES (
    v_candidate_id, 2, v_big_3,
    '기업상생',
    '대기업·중소기업·소상공인이 함께 성장하는 상생 모델을 만듭니다. 공정한 거래질서, 동반성장 협약, 전통시장 디지털 전환을 적극 지원합니다.',
    3, true
  )
  RETURNING id INTO v_mid_partner;

  INSERT INTO public.policies (candidate_id, level, parent_id, title, content, display_order, is_active)
  VALUES (
    v_candidate_id, 2, v_big_1,
    '책임행정',
    '예산은 투명하게, 결정은 빠르게, 책임은 분명하게. 시민 참여 예산 공시제, 민원 원스톱 시스템, 행정 책임실명제로 신뢰받는 시청을 만듭니다.',
    4, true
  )
  RETURNING id INTO v_mid_governance;

  INSERT INTO public.policies (candidate_id, level, parent_id, title, content, display_order, is_active)
  VALUES (
    v_candidate_id, 2, v_big_3,
    '도시생태계',
    '교통·주거·환경·문화가 균형을 이루는 지속가능한 도시. 광역 모빌리티, 청년 주거, 녹지 인프라, 생활 문화공간을 통합적으로 설계합니다.',
    5, true
  )
  RETURNING id INTO v_mid_ecosystem;

  -- ─────────────────────────────────────────────
  -- 4) 세부공약 (level=3) — 카테고리별
  --    제목 앞에 [카테고리]를 붙여 메인페이지 그룹 표시 가능
  -- ─────────────────────────────────────────────

  -- 교통인프라 → 도시생태계
  INSERT INTO public.policies (candidate_id, level, parent_id, title, content, display_order, is_active) VALUES
  (v_candidate_id, 3, v_mid_ecosystem, '[교통인프라] 수원 트램 1호선 착공', '도심 순환 트램으로 광역 환승 체계를 완성하고, 출퇴근 시간을 30% 단축합니다.', 11, true),
  (v_candidate_id, 3, v_mid_ecosystem, '[교통인프라] BRT 노선 확대', '주요 거점을 잇는 BRT 노선을 신설해 광역버스 의존도를 낮춥니다.', 12, true),
  (v_candidate_id, 3, v_mid_ecosystem, '[교통인프라] 광역철도 신설 추진', 'GTX·신분당선 연장과 연계한 광역 철도망을 단계적으로 추진합니다.', 13, true);

  -- 주거부동산 → 도시생태계
  INSERT INTO public.policies (candidate_id, level, parent_id, title, content, display_order, is_active) VALUES
  (v_candidate_id, 3, v_mid_ecosystem, '[주거부동산] 청년·신혼 매입임대 1만호', '역세권 중심으로 청년·신혼부부 매입임대를 1만호 공급해 직주근접을 실현합니다.', 21, true),
  (v_candidate_id, 3, v_mid_ecosystem, '[주거부동산] 재개발 투명성 강화', '조합 운영 공시제를 도입하고 분담금 산정 과정을 모두 공개합니다.', 22, true);

  -- 의료복지안전 → 책임행정
  INSERT INTO public.policies (candidate_id, level, parent_id, title, content, display_order, is_active) VALUES
  (v_candidate_id, 3, v_mid_governance, '[의료복지안전] 권역 응급의료센터 확충', '소아·야간·휴일 응급 진료 공백을 없애고 권역별 거점 병원을 확대합니다.', 31, true),
  (v_candidate_id, 3, v_mid_governance, '[의료복지안전] 정신건강 상담 무료화', '청년·청소년 대상 무료 상담 바우처를 도입해 마음 건강을 지킵니다.', 32, true),
  (v_candidate_id, 3, v_mid_governance, '[의료복지안전] 어르신 안전망 강화', '독거 어르신 IoT 안전 알림 시스템과 정기 건강 모니터링을 확대합니다.', 33, true);

  -- 경제일자리 → 기업상생
  INSERT INTO public.policies (candidate_id, level, parent_id, title, content, display_order, is_active) VALUES
  (v_candidate_id, 3, v_mid_partner, '[경제일자리] 전통시장 디지털 전환', '결제·배달·홍보 인프라를 디지털화하고 청년 상인을 적극 유치합니다.', 41, true),
  (v_candidate_id, 3, v_mid_partner, '[경제일자리] 청년 창업 지원금 확대', '초기 창업자에게 자금·공간·멘토링을 패키지로 지원합니다.', 42, true),
  (v_candidate_id, 3, v_mid_partner, '[경제일자리] 기업 유치 인센티브', '미래산업(반도체·바이오·AI) 기업 유치를 위한 세제·부지 인센티브를 확대합니다.', 43, true);

  -- 문화관광 → 미래창업
  INSERT INTO public.policies (candidate_id, level, parent_id, title, content, display_order, is_active) VALUES
  (v_candidate_id, 3, v_mid_startup, '[문화관광] 수원화성 야간 콘텐츠', '야간 라이트업과 상설 공연을 운영해 365일 즐길 수 있는 관광지로 만듭니다.', 51, true),
  (v_candidate_id, 3, v_mid_startup, '[문화관광] 생활 문화공간 조성', '동(洞)별 생활 문화센터를 확충해 시민 누구나 가까이서 문화를 향유합니다.', 52, true);

  -- 교육청소년 → 인재교육
  INSERT INTO public.policies (candidate_id, level, parent_id, title, content, display_order, is_active) VALUES
  (v_candidate_id, 3, v_mid_education, '[교육청소년] 방과후 돌봄 100% 보장', '초등 방과후 돌봄교실을 100% 수용해 맞벌이 가정의 부담을 덜어드립니다.', 61, true),
  (v_candidate_id, 3, v_mid_education, '[교육청소년] 디지털·AI 교육 인프라', '학교 단말기·네트워크·교사 연수를 전면 개선해 미래 교육을 준비합니다.', 62, true),
  (v_candidate_id, 3, v_mid_education, '[교육청소년] 청소년 진로 멘토링', '지역 기업·대학과 연계한 진로 멘토링 프로그램을 상시 운영합니다.', 63, true);

  -- 행정책임투명 → 책임행정
  INSERT INTO public.policies (candidate_id, level, parent_id, title, content, display_order, is_active) VALUES
  (v_candidate_id, 3, v_mid_governance, '[행정책임투명] 민원 원스톱 시스템', '온·오프라인을 통합한 원스톱 민원 처리 체계를 구축합니다.', 71, true),
  (v_candidate_id, 3, v_mid_governance, '[행정책임투명] 시민 참여 예산 공시', '예산 편성·집행 전 과정을 시민이 직접 열람·제안할 수 있는 플랫폼을 만듭니다.', 72, true),
  (v_candidate_id, 3, v_mid_governance, '[행정책임투명] 행정 책임실명제', '주요 정책 결정의 담당자와 사유를 공개해 책임 행정을 실현합니다.', 73, true);

END $$;
