import Link from "next/link";

const ITEMS = [
  { href: "/admin/blocks/we_popup", title: "메인 팝업 관리", desc: "팝업 제목/본문/버튼/공개여부" },
  { href: "/admin/carousel", title: "캐러셀 관리", desc: "메인 히어로 슬라이드 5장" },
  { href: "/admin/blocks/we_camp_intro", title: "위기 대시보드 — 인트로", desc: "제목 + 소개 텍스트" },
  { href: "/admin/blocks/we_crisis_stats", title: "위기 대시보드 — 데이터 카드", desc: "6개 위기 지표 JSON" },
  { href: "/admin/blocks/we_opportunity_cycle", title: "위기 대시보드 — 악순환 고리", desc: "6단계 순환 구조 JSON" },
  { href: "/admin/blocks/we_camp_closing", title: "위기 대시보드 — 클로징", desc: "마무리 슬로건" },
  { href: "/admin/factcheck", title: "팩트체크 관리", desc: "주장반박/데이터폭로/정책비판" },
  { href: "/admin/announcements", title: "한마디 관리", desc: "공지/한마디 카드" },
  { href: "/admin/blocks/we_slogan", title: "슬로건 편집", desc: "메인 슬로건 텍스트" },
  { href: "/admin/policies?level=1", title: "대공약 관리", desc: "1단계 핵심 공약" },
  { href: "/admin/policies?level=2", title: "중공약 관리", desc: "2단계 공약" },
  { href: "/admin/policies?level=3", title: "세부공약 관리", desc: "3단계 카테고리별 공약" },
  { href: "/admin/candidate", title: "후보 소개 편집", desc: "정희윤 프로필" },
  { href: "/admin/candidate/sns", title: "SNS 링크 관리", desc: "후보 SNS 채널" },
  { href: "/admin/org", title: "조직도/연락처 관리", desc: "캠프 조직도 멤버" },
  { href: "/admin/observers", title: "참관인신청 관리", desc: "투표소별 참관인 신청 확인·확정/취소" },
  { href: "/admin/propose", title: "공약제안 관리", desc: "시민 제안 확인/부적절 게시물 삭제" },
  { href: "/admin/blocks/we_propose_intro", title: "공약제안 — 상단 설정", desc: "제목/부제/선거법 경고문 편집" },
  { href: "/admin/blocks/we_propose_districts", title: "공약제안 — 거주지역", desc: "거주지역 선택지 추가/삭제/순서" },
  { href: "/admin/blocks/we_footer_legal", title: "푸터 편집", desc: "선관위 의무표시" },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold">관리자 대시보드</h1>
      <p className="mt-2 text-sm text-gray-600">
        관리할 콘텐츠를 선택하세요. 모든 변경은 메인페이지에 즉시 반영됩니다.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {ITEMS.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="block rounded-lg border border-gray-200 bg-white p-5 hover:border-[#FF6B00] hover:shadow-md"
          >
            <h2 className="text-base font-extrabold">{it.title}</h2>
            <p className="mt-1 text-xs text-gray-600">{it.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
