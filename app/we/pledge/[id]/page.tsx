import Link from "next/link";
import { notFound } from "next/navigation";

/**
 * 공약 세부 페이지
 * - 대공약(1~3), 중공약(1~4), 세부공약(101~702) 모두 동일 라우트에서 처리
 * - TODO: Supabase pledges 테이블 연동, OG 이미지 자동 생성(Vercel OG)
 */

type Pledge = {
  id: number;
  tier: "대공약" | "중공약" | "세부공약";
  category?: string;
  title: string;
  desc: string;
  body: string[];
};

const PLEDGES: Record<number, Pledge> = {
  1: {
    id: 1,
    tier: "대공약",
    title: "교통혁신",
    desc: "GTX·트램·BRT 통합 모빌리티",
    body: [
      "수원의 만성 교통난을 근본적으로 해결합니다.",
      "GTX·트램·BRT를 하나로 잇는 통합 모빌리티 체계를 구축하고, 환승 시간과 비용을 최소화합니다.",
      "광역 출퇴근 시민의 시간을 돌려드리겠습니다.",
    ],
  },
  2: {
    id: 2,
    tier: "대공약",
    title: "주거안정",
    desc: "청년·신혼 주거 1만호 공급",
    body: [
      "청년과 신혼부부가 수원에 정착할 수 있도록 1만호 규모의 공공·매입임대를 공급합니다.",
      "역세권 중심으로 직주근접을 실현합니다.",
    ],
  },
  3: {
    id: 3,
    tier: "대공약",
    title: "의료확충",
    desc: "권역별 공공의료 인프라 강화",
    body: [
      "권역 응급의료센터·소아 야간 진료를 확충합니다.",
      "공공의료 사각지대를 없애고 시민의 건강권을 지킵니다.",
    ],
  },
};

// 중공약/세부공약은 페이지 내 placeholder로 fallback 처리
function getPledge(id: number): Pledge | null {
  if (PLEDGES[id]) return PLEDGES[id];
  // 임시 fallback — 실제로는 Supabase에서 조회
  if (id >= 1 && id <= 9999) {
    return {
      id,
      tier: id < 100 ? "중공약" : "세부공약",
      title: `공약 #${id}`,
      desc: "백오피스 연동 후 상세 내용이 표시됩니다.",
      body: [
        "이 공약의 상세 설명, 추진 배경, 기대 효과, 실행 계획이 이곳에 표시됩니다.",
        "관리자는 백오피스에서 이 내용을 자유롭게 편집할 수 있습니다.",
      ],
    };
  }
  return null;
}

export default async function PledgeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pledge = getPledge(Number(id));
  if (!pledge) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <Link
        href="/we"
        className="inline-block text-sm text-gray-500 hover:text-[#FF6B00]"
      >
        ← 메인으로
      </Link>

      <div className="mt-4">
        <span className="inline-block rounded-full bg-[#FF6B00] px-3 py-1 text-xs font-bold text-white">
          {pledge.tier}
        </span>
        <h1 className="mt-3 text-2xl font-extrabold text-[#1a1a1a] md:text-4xl">
          {pledge.title}
        </h1>
        <p className="mt-2 text-base text-gray-600 md:text-lg">{pledge.desc}</p>
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-gray-200 pt-8">
        {pledge.body.map((p, i) => (
          <p key={i} className="text-sm leading-relaxed text-gray-800 md:text-base">
            {p}
          </p>
        ))}
      </div>
    </article>
  );
}
