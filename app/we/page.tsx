import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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
    notices,
    slogan,
    bigPledges,
    midPledges,
    detailPledges,
    footer,
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
  ]);

  return {
    slides: slides.data ?? [],
    intro: intro.data,
    notices: notices.data ?? [],
    slogan: slogan.data,
    bigPledges: bigPledges.data ?? [],
    midPledges: midPledges.data ?? [],
    detailPledges: detailPledges.data ?? [],
    footer: footer.data,
  };
}

// ──────────────────────────────────────────────────────────
// 페이지
// ──────────────────────────────────────────────────────────
export default async function WeMainPage() {
  const data = await fetchAll();

  return (
    <>
      <CarouselSection slides={data.slides} />
      <CampIntroSection block={data.intro} />
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

function CampIntroSection({ block }: { block: { title: string | null; body_html: string | null } | null }) {
  return (
    <section aria-label="선거캠프 소개" className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <h2 className="mb-3 text-xl font-extrabold md:text-2xl">{block?.title ?? "수원 9.0캠프"}</h2>
      <div
        className="prose prose-sm max-w-none text-sm leading-relaxed text-gray-700 md:text-base"
        dangerouslySetInnerHTML={{ __html: block?.body_html ?? "<p>백오피스에서 캠프 소개를 입력하세요.</p>" }}
      />
    </section>
  );
}

function NoticesSection({
  notices,
}: {
  notices: { id: string; title: string; created_at: string; is_pinned: boolean }[];
}) {
  return (
    <section aria-label="한마디 공지" className="mx-auto max-w-3xl px-4 py-8 md:py-10">
      <h2 className="mb-4 text-xl font-extrabold md:text-2xl">한마디</h2>
      {notices.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
          등록된 한마디가 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {notices.map((n) => (
            <li key={n.id}>
              <Link href="/we/supporters" className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-[#FF6B00] hover:shadow-md">
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
    </section>
  );
}

function SloganSection({ block }: { block: { body_html: string | null } | null }) {
  return (
    <section aria-label="슬로건" className="w-full bg-[#FF6B00] py-14 text-white md:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest opacity-80">Slogan</p>
        <div
          className="prose prose-invert mt-3 max-w-none text-3xl font-black leading-tight md:text-5xl"
          dangerouslySetInnerHTML={{ __html: block?.body_html ?? "<p>모든 가능성을, 모두에게.<br/>우리는 수원입니다.</p>" }}
        />
      </div>
    </section>
  );
}

type Pledge = { id: string; title: string; content: string | null; parent_id?: string | null };

function BigPledgesSection({ items }: { items: Pledge[] }) {
  return (
    <section aria-label="대공약" className="mx-auto max-w-5xl px-4 py-12 md:py-16">
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
                <Link href={`/we/pledge/${p.id}`} className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-[#FF6B00] hover:shadow-md">
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
    <section aria-label="세부공약" className="mx-auto max-w-5xl px-4 py-12 md:py-16">
      <h2 className="mb-6 text-xl font-extrabold md:text-2xl">세부공약</h2>
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
          백오피스에서 세부공약을 등록하세요.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
          {items.map((p) => (
            <li key={p.id}>
              <Link href={`/we/pledge/${p.id}`} className="block rounded-md border border-gray-200 bg-white p-3 text-sm hover:border-[#FF6B00] hover:bg-[#FF6B00]/5">
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ProposeSection() {
  return (
    <section aria-label="공약제안" className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h2 className="mb-4 text-xl font-extrabold md:text-2xl">공약제안</h2>
      <div role="alert" className="mb-5 rounded-lg border-2 border-red-600 bg-red-50 p-4 text-sm text-red-700">
        <strong className="block font-bold">⚠️ 선거법 안내</strong>
        타 후보 비방·허위사실 유포 등 공직선거법 위반 게시물은 즉시 삭제되며, 작성된 글은 삭제할 수 없습니다. 100자 이내로 정중히 작성해 주세요.
      </div>
      <Link href="/we/propose" className="inline-flex items-center justify-center rounded-lg bg-[#FF6B00] px-6 py-3 text-sm font-bold text-white hover:opacity-90 md:text-base">
        공약 제안하러 가기 →
      </Link>
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
            className="prose prose-invert mt-1 max-w-none text-xs"
            dangerouslySetInnerHTML={{ __html: block?.body_html ?? "<p>(백오피스에서 편집)</p>" }}
          />
        </div>
        <p className="text-gray-500">© 2026 정희윤 수원9.0캠프. All rights reserved.</p>
        <p className="mt-1 text-gray-500">문의: RESUWON@WHITEJO.ORG</p>
      </div>
    </footer>
  );
}
