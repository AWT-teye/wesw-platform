import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

/**
 * we.wesw.kr 메인페이지
 * 섹션 순서: 캐러셀 → 한마디 → 선거캠프소개 → 슬로건 → 대공약 → 중공약 → 세부공약 → 공약제안 → 푸터
 * 모바일 퍼스트, Tailwind, 브랜드 #FF6B00
 *
 * NOTE: 모든 콘텐츠는 추후 Supabase 백오피스 연동 예정. 현재는 placeholder 데이터.
 */

const BRAND = "#FF6B00";

// ──────────────────────────────────────────────────────────
// Placeholder 데이터 (백오피스 연동 전까지 임시)
// ──────────────────────────────────────────────────────────
const CAROUSEL = [
  { id: 1, title: "수원의 가능성을 다시 씁니다", caption: "정희윤이 함께합니다" },
  { id: 2, title: "교통·주거·의료, 시민의 삶 먼저", caption: "현장에서 답을 찾습니다" },
  { id: 3, title: "수원, 다시 도약하는 도시로", caption: "9.0캠프 출범" },
  { id: 4, title: "낡은 정치를 넘어", caption: "개혁의 길을 걷겠습니다" },
  { id: 5, title: "당신의 한마디가 정책이 됩니다", caption: "시민과 함께 만드는 공약" },
];

// NOTICES는 이제 Supabase announcements 테이블에서 조회 (NoticesSection)

const BIG_PLEDGES = [
  { id: 1, title: "교통혁신", desc: "GTX·트램·BRT 통합 모빌리티" },
  { id: 2, title: "주거안정", desc: "청년·신혼 주거 1만호 공급" },
  { id: 3, title: "의료확충", desc: "권역별 공공의료 인프라 강화" },
];

const MID_PLEDGES = [
  { id: 1, big: "교통혁신", title: "수원 트램 1호선 본격 추진", desc: "도심 순환 트램으로 광역 환승 체계 완성" },
  { id: 2, big: "교통혁신", title: "도심 BRT 노선 확대", desc: "주요 거점 BRT 신설로 출퇴근 시간 단축" },
  { id: 3, big: "주거안정", title: "청년 매입임대 5천호", desc: "청년·신혼부부 대상 저렴한 매입임대 공급" },
  { id: 4, big: "의료확충", title: "야간·소아 응급의료 확충", desc: "권역 응급의료센터와 소아 야간 진료 강화" },
];

const CATEGORIES = ["교통", "주거", "의료", "경제", "문화", "교육", "행정"] as const;
type DetailItem = { id: number; title: string; desc: string };
const DETAIL_PLEDGES: Record<(typeof CATEGORIES)[number], DetailItem[]> = {
  교통: [
    { id: 101, title: "수원 트램 착공", desc: "1호선 우선 착공으로 도심 순환망 구축" },
    { id: 102, title: "버스 준공영제 개선", desc: "노선 효율화와 운수 종사자 처우 개선" },
    { id: 103, title: "광역버스 노선 신설", desc: "서울·경기 거점 직행 노선 확대" },
  ],
  주거: [
    { id: 201, title: "청년주택 공급 확대", desc: "역세권 청년주택 1만호 공급 추진" },
    { id: 202, title: "재개발 투명성 강화", desc: "조합 운영 공시제 도입" },
  ],
  의료: [
    { id: 301, title: "공공 소아의료 확대", desc: "권역별 소아 야간·휴일 진료 확충" },
    { id: 302, title: "정신건강 상담 무료화", desc: "청년·청소년 무료 상담 바우처" },
  ],
  경제: [
    { id: 401, title: "전통시장 디지털화", desc: "결제·배달 인프라 디지털 전환 지원" },
    { id: 402, title: "청년 창업 지원금 확대", desc: "초기 창업자 자금·공간 패키지 지원" },
  ],
  문화: [
    { id: 501, title: "수원화성 야간콘텐츠", desc: "야간 라이트업·상설 공연 운영" },
    { id: 502, title: "생활문화공간 조성", desc: "동별 생활 문화센터 확충" },
  ],
  교육: [
    { id: 601, title: "방과후 돌봄 확대", desc: "초등 돌봄교실 100% 수용 보장" },
    { id: 602, title: "디지털 교육 인프라", desc: "학교 단말기·네트워크 전면 개선" },
  ],
  행정: [
    { id: 701, title: "민원 원스톱 시스템", desc: "온·오프 통합 민원 처리 체계" },
    { id: 702, title: "예산 투명 공개", desc: "시민 참여형 예산 공시 플랫폼" },
  ],
};

// ──────────────────────────────────────────────────────────
// 섹션 컴포넌트들
// ──────────────────────────────────────────────────────────

function CarouselSection() {
  // TODO: 자동재생 캐러셀 (10초, hover 일시정지) — 클라이언트 컴포넌트로 분리 예정
  return (
    <section aria-label="메인 캐러셀" className="w-full">
      <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-[#FF6B00] to-[#ff8a3d] sm:h-72 md:h-96">
        <div className="flex h-full snap-x snap-mandatory overflow-x-auto scroll-smooth">
          {CAROUSEL.map((slide) => (
            <div
              key={slide.id}
              className="flex h-full w-full shrink-0 snap-center flex-col items-center justify-center px-6 text-center text-white"
            >
              <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl md:text-5xl">
                {slide.title}
              </h2>
              <p className="mt-3 text-sm font-medium opacity-90 sm:text-base md:text-lg">
                {slide.caption}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

async function NoticesSection() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("announcements")
    .select("id, title, content, created_at, is_pinned")
    .eq("is_archived", false)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5);

  const notices = data ?? [];

  return (
    <section
      aria-label="한마디 공지"
      className="mx-auto max-w-3xl px-4 py-8 md:py-10"
    >
      <h2 className="mb-4 text-xl font-extrabold text-[#1a1a1a] md:text-2xl">
        한마디
      </h2>
      {notices.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
          등록된 한마디가 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {notices.map((n) => (
            <li key={n.id}>
              <Link
                href="/we/supporters"
                className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-[#FF6B00] hover:shadow-md"
              >
                <span className="text-xs font-medium text-gray-500">
                  {new Date(n.created_at).toLocaleDateString("ko-KR")}
                  {n.is_pinned && " · 📌 고정"}
                </span>
                <p className="mt-1 text-sm font-semibold text-[#1a1a1a] md:text-base">
                  {n.title}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CampIntroSection() {
  return (
    <section
      aria-label="선거캠프 소개"
      className="mx-auto max-w-3xl px-4 py-10 md:py-14"
    >
      <h2 className="mb-3 text-xl font-extrabold text-[#1a1a1a] md:text-2xl">
        수원 9.0캠프
      </h2>
      <p className="text-sm leading-relaxed text-gray-700 md:text-base">
        잃어버린 수원의 성장동력, 가능성. 수원 9.0캠프는 가능성과 미래를
        준비합니다. 시민의 목소리와 책임있는 행정, 문제를 외면하지않는
        담대함으로 수원을 재도약시키고 세계선도도시로 만들겠습니다.
      </p>
    </section>
  );
}

function SloganSection() {
  return (
    <section
      aria-label="슬로건"
      className="w-full bg-[#FF6B00] py-14 text-white md:py-20"
    >
      <div className="mx-auto max-w-3xl px-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest opacity-80">
          Slogan
        </p>
        <h2 className="mt-3 text-3xl font-black leading-tight md:text-5xl">
          모든 가능성을, 모두에게.
          <br />
          우리는 수원입니다.
        </h2>
      </div>
    </section>
  );
}

function BigPledgesSection() {
  return (
    <section
      aria-label="대공약"
      className="mx-auto max-w-5xl px-4 py-12 md:py-16"
    >
      <h2 className="mb-6 text-xl font-extrabold text-[#1a1a1a] md:text-2xl">
        대공약
      </h2>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {BIG_PLEDGES.map((p) => (
          <li key={p.id} className="group relative">
            <Link
              href={`/we/pledge/${p.id}`}
              className="block h-full rounded-xl border-2 border-[#FF6B00] bg-white p-5 transition hover:bg-[#FF6B00] hover:text-white"
            >
              <span className="inline-block rounded-full bg-[#FF6B00] px-3 py-1 text-xs font-bold text-white group-hover:bg-white group-hover:text-[#FF6B00]">
                대공약 {p.id}
              </span>
              <h3 className="mt-3 text-lg font-extrabold md:text-xl">{p.title}</h3>
              <p className="mt-2 text-sm opacity-90">{p.desc}</p>
            </Link>
            {/* PC 호버 팝업 */}
            <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-72 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-4 text-left text-sm text-[#1a1a1a] shadow-xl group-hover:md:block">
              <p className="font-bold text-[#FF6B00]">{p.title}</p>
              <p className="mt-1 text-gray-700">{p.desc}</p>
              <p className="mt-2 text-xs text-gray-400">클릭하면 세부 페이지로 이동합니다</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MidPledgesSection() {
  return (
    <section
      aria-label="중공약"
      className="w-full bg-gray-50 py-12 md:py-16"
    >
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="mb-6 text-xl font-extrabold text-[#1a1a1a] md:text-2xl">
          중공약
        </h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MID_PLEDGES.map((p) => (
            <li key={p.id} className="group relative">
              <Link
                href={`/we/pledge/${p.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 transition hover:border-[#FF6B00] hover:shadow-md"
              >
                <span className="text-xs font-semibold text-[#FF6B00]">
                  {p.big}
                </span>
                <p className="mt-1 text-sm font-bold text-[#1a1a1a] md:text-base">
                  {p.title}
                </p>
              </Link>
              <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-72 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-4 text-left text-sm shadow-xl group-hover:md:block">
                <p className="font-bold text-[#FF6B00]">{p.title}</p>
                <p className="mt-1 text-gray-700">{p.desc}</p>
                <p className="mt-2 text-xs text-gray-400">클릭하면 세부 페이지로 이동합니다</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function DetailPledgesSection() {
  // TODO: 카테고리 탭 인터랙션 — 클라이언트 컴포넌트로 분리 예정. 현재는 전체 노출.
  return (
    <section
      aria-label="세부공약"
      className="mx-auto max-w-5xl px-4 py-12 md:py-16"
    >
      <h2 className="mb-2 text-xl font-extrabold text-[#1a1a1a] md:text-2xl">
        세부공약
      </h2>
      <p className="mb-6 text-xs text-gray-500 md:text-sm">
        카테고리: {CATEGORIES.join(" · ")}
      </p>

      <div className="flex flex-col gap-8">
        {CATEGORIES.map((cat) => (
          <div key={cat}>
            <h3 className="mb-3 inline-block border-b-2 border-[#FF6B00] pb-1 text-base font-bold text-[#1a1a1a] md:text-lg">
              {cat}
            </h3>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              {DETAIL_PLEDGES[cat].map((item) => (
                <li key={item.id} className="group relative">
                  <Link
                    href={`/we/pledge/${item.id}`}
                    className="block rounded-md border border-gray-200 bg-white p-3 text-sm text-[#1a1a1a] transition hover:border-[#FF6B00] hover:bg-[#FF6B00]/5"
                  >
                    {item.title}
                  </Link>
                  <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-64 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-3 text-left text-xs shadow-xl group-hover:md:block">
                    <p className="font-bold text-[#FF6B00]">{item.title}</p>
                    <p className="mt-1 text-gray-700">{item.desc}</p>
                    <p className="mt-2 text-[10px] text-gray-400">클릭하면 세부 페이지로 이동합니다</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProposeSection() {
  return (
    <section
      aria-label="공약제안"
      className="mx-auto max-w-3xl px-4 py-12 md:py-16"
    >
      <h2 className="mb-4 text-xl font-extrabold text-[#1a1a1a] md:text-2xl">
        공약제안
      </h2>

      {/* 선거법 위반 경고 — 레드박스 (CLAUDE.md 법적 필수사항) */}
      <div
        role="alert"
        className="mb-5 rounded-lg border-2 border-red-600 bg-red-50 p-4 text-sm text-red-700"
      >
        <strong className="block font-bold">⚠️ 선거법 안내</strong>
        타 후보 비방·허위사실 유포 등 공직선거법 위반 게시물은 즉시 삭제되며,
        작성된 글은 삭제할 수 없습니다. 100자 이내로 정중히 작성해 주세요.
      </div>

      <Link
        href="/we/propose"
        className="inline-flex items-center justify-center rounded-lg bg-[#FF6B00] px-6 py-3 text-sm font-bold text-white hover:opacity-90 md:text-base"
      >
        공약 제안하러 가기 →
      </Link>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="w-full border-t border-gray-200 bg-[#1a1a1a] text-gray-300">
      <div className="mx-auto max-w-5xl px-4 py-10 text-xs leading-relaxed md:py-12 md:text-sm">
        <div className="mb-4">
          <p className="text-base font-extrabold text-[#FF6B00] md:text-lg">
            정희윤 · 수원의 가능성
          </p>
          <p className="mt-1 text-gray-400">개혁신당 수원시장 후보</p>
        </div>

        {/* 선관위 의무표시 placeholder — 백오피스 편집 가능 */}
        <div className="mb-4 rounded border border-gray-700 p-3 text-gray-400">
          <p className="font-semibold text-gray-300">선거관리위원회 의무표시</p>
          <p className="mt-1">
            (선거사무소 주소·전화·후원회 정보 등 — 백오피스에서 편집)
          </p>
        </div>

        <p className="text-gray-500">
          © 2026 정희윤 수원9.0캠프. All rights reserved.
        </p>
        <p className="mt-1 text-gray-500">
          문의: RESUWON@WHITEJO.ORG
        </p>
      </div>
    </footer>
  );
}

// ──────────────────────────────────────────────────────────
// 페이지
// ──────────────────────────────────────────────────────────
export default function WeMainPage() {
  return (
    <>
      <CarouselSection />
      <CampIntroSection />
      <NoticesSection />
      <SloganSection />
      <BigPledgesSection />
      <MidPledgesSection />
      <DetailPledgesSection />
      <ProposeSection />
      <FooterSection />
    </>
  );
}
