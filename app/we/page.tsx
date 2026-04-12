import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CrisisSection from "@/components/we/CrisisSection";
import FactCheckSection from "@/components/we/FactCheckSection";

/**
 * we.wesw.kr 메인페이지
 * 모든 콘텐츠는 Supabase에서 실시간 fetch (60초 ISR)
 * 백오피스에서 변경 시 revalidatePath('/we')로 즉시 반영
 */
export const revalidate = 60;

// ──────────────────────────────────────────────────────────
// 데이터 fetch 헬퍼
// ──────────────────────────────────────────────────────────

async function fetchAll() {
  const supabase = await createClient();

  const [
    slides,
    intro,
    crisisStats,
    opportunityCycle,
    campClosing,
    notices,
    slogan,
    bigPledges,
    midPledges,
    detailPledges,
    footer,
    factChecks,
  ] = await Promise.all([
    supabase
      .from("hero_slides")
      .select("id, title, subtitle, image_url")
      .eq("is_active", true)
      .eq("is_archived", false)
      .order("display_order"),
    supabase
      .from("content_blocks")
      .select("title, body_html")
      .eq("slug", "we_camp_intro")
      .maybeSingle(),
    supabase
      .from("content_blocks")
      .select("body_html")
      .eq("slug", "we_crisis_stats")
      .maybeSingle(),
    supabase
      .from("content_blocks")
      .select("body_html")
      .eq("slug", "we_opportunity_cycle")
      .maybeSingle(),
    supabase
      .from("content_blocks")
      .select("title, body_html")
      .eq("slug", "we_camp_closing")
      .maybeSingle(),
    supabase
      .from("announcements")
      .select("id, title, created_at, is_pinned")
      .eq("is_archived", false)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("content_blocks")
      .select("body_html")
      .eq("slug", "we_slogan")
      .maybeSingle(),
    supabase
      .from("policies")
      .select("id, title, content, display_order")
      .eq("level", 1)
      .eq("is_active", true)
      .eq("is_archived", false)
      .order("display_order"),
    supabase
      .from("policies")
      .select("id, title, content, parent_id, display_order")
      .eq("level", 2)
      .eq("is_active", true)
      .eq("is_archived", false)
      .order("display_order"),
    supabase
      .from("policies")
      .select("id, title, content, parent_id, display_order")
      .eq("level", 3)
      .eq("is_active", true)
      .eq("is_archived", false)
      .order("display_order"),
    supabase
      .from("content_blocks")
      .select("title, body_html")
      .eq("slug", "we_footer_legal")
      .maybeSingle(),
    supabase
      .from("fact_checks")
      .select("id, type, claim, truth, source")
      .eq("is_active", true)
      .order("order_num", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  return {
    slides: slides.data ?? [],
    intro: intro.data,
    crisisStats: crisisStats.data,
    opportunityCycle: opportunityCycle.data,
    campClosing: campClosing.data,
    notices: notices.data ?? [],
    slogan: slogan.data,
    bigPledges: bigPledges.data ?? [],
    midPledges: midPledges.data ?? [],
    detailPledges: detailPledges.data ?? [],
    footer: footer.data,
    factChecks: factChecks.data ?? [],
  };
}

// ──────────────────────────────────────────────────────────
// 페이지
// ──────────────────────────────────────────────────────────
export default async function WeMainPage() {
  const data = await fetchAll();

  return (
    <>
      <HeroSection />
      <StatsSection />
      <CarouselSection slides={data.slides} />
      <CrisisSection
        intro={data.intro}
        statsJson={data.crisisStats?.body_html ?? null}
        cycleJson={data.opportunityCycle?.body_html ?? null}
        closing={data.campClosing}
      />
      <FactCheckSection items={data.factChecks} />
      <NoticesSection notices={data.notices} />
      <SloganSection block={data.slogan} />
      <BigPledgesSection items={data.bigPledges} />
      <MidPledgesSection items={data.midPledges} />
      <DetailPledgesSection items={data.detailPledges} />
      <ProposeSection />
      <FooterSection block={data.footer} />
    </>
  );
}

// ──────────────────────────────────────────────────────────
// 섹션들
// ──────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0a]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#FF6B00]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#FF6B00]/5 rounded-full blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-5xl px-4 py-24 md:py-32 text-center">
        <p className="text-[#FF6B00] text-sm font-semibold tracking-widest uppercase mb-4">WE SUWON</p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
          모든 가능성을,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#ff8a3d]">모두에게</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-10">
          정희윤이 만드는 <span className="text-[#FF6B00] font-semibold">수원 9.0</span>
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/we/pledge"
            className="px-8 py-3 bg-[#FF6B00] hover:bg-[#e55f00] text-white font-bold rounded-lg text-base transition-colors shadow-lg shadow-[#FF6B00]/25"
          >
            공약 보기
          </Link>
          <Link
            href="/we/supporters"
            className="px-8 py-3 border-2 border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10 font-bold rounded-lg text-base transition-colors"
          >
            서포터즈 신청
          </Link>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { label: "재정자립도", value: "38.17", unit: "%", sub: "↓ 89%에서 하락" },
    { label: "합계출산율", value: "0.71", unit: "명", sub: "위기 수준" },
    { label: "청년인구", value: "순유출", unit: "", sub: "진행중" },
    { label: "사회복지예산 비중", value: "42.3", unit: "%", sub: "강제 부담 증가" },
  ];
  return (
    <section className="w-full border-y border-gray-200 bg-[#f8f8f8]">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-center text-xs font-semibold tracking-widest uppercase mb-6 text-gray-400">
          수원, 지금 이 순간
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-gray-200 bg-white p-5 text-center hover:border-[#FF6B00] transition-colors"
            >
              <p className="text-xs mb-2 text-gray-400">{s.label}</p>
              <p className={`font-extrabold text-[#FF6B00] mb-1 ${s.unit ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"}`}>
                {s.value}{s.unit && <span className="text-lg">{s.unit}</span>}
              </p>
              <p className="text-xs text-red-500 font-medium">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CarouselSection({
  slides,
}: {
  slides: { id: string; title: string; subtitle: string | null; image_url: string }[];
}) {
  if (slides.length === 0) {
    return (
      <section className="flex h-56 items-center justify-center bg-gradient-to-br from-[#FF6B00] to-[#ff8a3d] text-white sm:h-72 md:h-96">
        <p className="text-sm opacity-80">백오피스에서 캐러셀 슬라이드를 등록하세요.</p>
      </section>
    );
  }
  return (
    <section aria-label="메인 캐러셀">
      <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-[#FF6B00] to-[#ff8a3d] sm:h-72 md:h-96">
        <div className="flex h-full snap-x snap-mandatory overflow-x-auto scroll-smooth">
          {slides.map((s) => (
            <div key={s.id} className="relative flex h-full w-full shrink-0 snap-center flex-col items-center justify-center px-6 text-center text-white">
              {s.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.image_url} alt={s.title} className="absolute inset-0 h-full w-full object-cover opacity-40" />
              )}
              <div className="relative">
                <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl md:text-5xl">{s.title}</h2>
                {s.subtitle && <p className="mt-3 text-sm font-medium opacity-90 sm:text-base md:text-lg">{s.subtitle}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


function NoticesSection({
  notices,
}: {
  notices: { id: string; title: string; created_at: string; is_pinned: boolean }[];
}) {
  return (
    <section aria-label="한마디 공지" className="w-full bg-[#f8f8f8] py-8 md:py-10">
      <div className="mx-auto max-w-3xl px-4">
      <h2 className="mb-4 text-xl font-extrabold md:text-2xl">한마디</h2>
      {notices.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
          등록된 한마디가 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {notices.map((n) => (
            <li key={n.id}>
              <Link href="/we/supporters" className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-[#FF6B00] hover:shadow-md transition-colors">
                <span className="text-xs font-medium text-gray-500">
                  {new Date(n.created_at).toLocaleDateString("ko-KR")}
                  {n.is_pinned && " · 📌 고정"}
                </span>
                <p className="mt-1 text-sm font-semibold md:text-base">{n.title}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      </div>
    </section>
  );
}

function SloganSection({ block }: { block: { body_html: string | null } | null }) {
  return (
    <section aria-label="슬로건" className="w-full bg-[#FF6B00] py-14 text-white md:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest opacity-80">Slogan</p>
        <div
          className="prose prose-invert mt-3 max-w-none text-3xl font-black leading-tight md:text-5xl [&_*]:whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: block?.body_html ?? "<p>모든 가능성을, 모두에게.<br/>우리는 수원입니다.</p>" }}
        />
      </div>
    </section>
  );
}

type Pledge = { id: string; title: string; content: string | null; parent_id?: string | null };

function BigPledgesSection({ items }: { items: Pledge[] }) {
  return (
    <section aria-label="대공약" className="w-full bg-white py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4">
      <h2 className="mb-6 text-xl font-extrabold md:text-2xl">대공약</h2>
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
          백오피스에서 대공약을 등록하세요.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {items.map((p, i) => (
            <li key={p.id} className="group relative">
              <Link href={`/we/pledge/${p.id}`} className="block h-full rounded-xl border-2 border-[#FF6B00] bg-white p-5 transition hover:bg-[#FF6B00] hover:text-white">
                <span className="inline-block rounded-full bg-[#FF6B00] px-3 py-1 text-xs font-bold text-white group-hover:bg-white group-hover:text-[#FF6B00]">
                  대공약 {i + 1}
                </span>
                <h3 className="mt-3 text-lg font-extrabold md:text-xl">{p.title}</h3>
                {p.content && <p className="mt-2 text-sm opacity-90 line-clamp-3">{p.content}</p>}
              </Link>
              {p.content && (
                <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-72 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-4 text-left text-sm shadow-xl group-hover:md:block">
                  <p className="font-bold text-[#FF6B00]">{p.title}</p>
                  <p className="mt-1 text-gray-700">{p.content}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      </div>
    </section>
  );
}

function MidPledgesSection({ items }: { items: Pledge[] }) {
  return (
    <section aria-label="중공약" className="w-full bg-gray-50 py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="mb-6 text-xl font-extrabold md:text-2xl">중공약</h2>
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
            백오피스에서 중공약을 등록하세요.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {items.map((p) => (
              <li key={p.id} className="group relative">
                <Link href={`/we/pledge/${p.id}`} className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-[#FF6B00] hover:shadow-md transition-colors">
                  <p className="text-sm font-bold md:text-base">{p.title}</p>
                  {p.content && <p className="mt-1 text-xs text-gray-500 line-clamp-2">{p.content}</p>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function DetailPledgesSection({ items }: { items: Pledge[] }) {
  return (
    <section aria-label="세부공약" className="w-full bg-white py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4">
      <h2 className="mb-6 text-xl font-extrabold md:text-2xl">세부공약</h2>
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
          백오피스에서 세부공약을 등록하세요.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
          {items.map((p) => (
            <li key={p.id}>
              <Link href={`/we/pledge/${p.id}`} className="block rounded-xl border border-gray-200 bg-white p-3 text-sm hover:border-[#FF6B00] hover:bg-[#FF6B00]/5 transition-colors">
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
      </div>
    </section>
  );
}

function ProposeSection() {
  return (
    <section aria-label="공약제안" className="w-full bg-[#f8f8f8] py-12 md:py-16">
      <div className="mx-auto max-w-3xl px-4">
      <h2 className="mb-4 text-xl font-extrabold md:text-2xl">공약제안</h2>
      <div role="alert" className="mb-5 rounded-lg border-2 border-red-600 bg-red-50 p-4 text-sm text-red-700">
        <strong className="block font-bold">⚠️ 선거법 안내</strong>
        타 후보 비방·허위사실 유포 등 공직선거법 위반 게시물은 즉시 삭제되며, 작성된 글은 삭제할 수 없습니다. 100자 이내로 정중히 작성해 주세요.
      </div>
      <Link href="/we/propose" className="inline-flex items-center justify-center rounded-lg bg-[#FF6B00] px-6 py-3 text-sm font-bold text-white hover:opacity-90 md:text-base">
        공약 제안하러 가기 →
      </Link>
      </div>
    </section>
  );
}

function FooterSection({ block }: { block: { title: string | null; body_html: string | null } | null }) {
  return (
    <footer className="w-full border-t border-gray-200 bg-[#1a1a1a] text-gray-300">
      <div className="mx-auto max-w-5xl px-4 py-10 text-xs leading-relaxed md:py-12 md:text-sm">
        <div className="mb-4">
          <p className="text-base font-extrabold text-[#FF6B00] md:text-lg">정희윤 · 수원의 가능성</p>
          <p className="mt-1 text-gray-400">개혁신당 수원시장 후보</p>
        </div>
        <div className="mb-4 rounded border border-gray-700 p-3 text-gray-400">
          <p className="font-semibold text-gray-300">{block?.title ?? "선거관리위원회 의무표시"}</p>
          <div
            className="prose prose-invert mt-1 max-w-none text-xs [&_*]:whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: block?.body_html ?? "<p>(백오피스에서 편집)</p>" }}
          />
        </div>
        <p className="text-gray-500">© 2026 정희윤 수원9.0캠프. All rights reserved.</p>
        <p className="mt-1 text-gray-500">문의: RESUWON@WHITEJO.ORG</p>
      </div>
    </footer>
  );
}
