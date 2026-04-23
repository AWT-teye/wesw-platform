import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ShareButton from "./ShareButton";

export const revalidate = 60;

const PAGE_URL = "https://we.wesw.kr/sns";

export const metadata: Metadata = {
  title: "정희윤 SNS · 미디어 | 수원특례시장 후보 | 개혁신당",
  description:
    "개혁신당 정희윤 수원특례시장 후보의 공식 SNS, 유튜브 출연 영상, 최근 발언",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "정희윤 SNS · 미디어 | 수원특례시장 후보 | 개혁신당",
    description:
      "개혁신당 정희윤 수원특례시장 후보의 공식 SNS, 유튜브 출연 영상, 최근 발언",
    url: PAGE_URL,
    siteName: "we.wesw.kr",
    locale: "ko_KR",
    type: "website",
  },
};

function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /\/embed\/([A-Za-z0-9_-]{11})/,
    /\/shorts\/([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default async function WeSnsPage() {
  const supabase = await createClient();

  const { data: candidate } = await supabase
    .from("candidates")
    .select(
      "id, name, photo_url, profile_json, sns_naver, sns_instagram, sns_facebook, sns_youtube_channel"
    )
    .order("display_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  const candidateId = candidate?.id as string | undefined;

  const [videosRes, statementsRes] = await Promise.all([
    candidateId
      ? supabase
          .from("candidate_youtube_videos")
          .select("id, title, youtube_url, thumbnail_url, display_order")
          .eq("candidate_id", candidateId)
          .eq("is_visible", true)
          .order("display_order", { ascending: true })
      : Promise.resolve({ data: [] as never[] }),
    candidateId
      ? supabase
          .from("candidate_statements")
          .select("id, content, source, stated_at")
          .eq("candidate_id", candidateId)
          .eq("is_visible", true)
          .order("stated_at", { ascending: false, nullsFirst: false })
      : Promise.resolve({ data: [] as never[] }),
  ]);

  const videos = (videosRes.data ?? []) as Array<{
    id: string;
    title: string;
    youtube_url: string;
    thumbnail_url: string | null;
  }>;
  const statements = (statementsRes.data ?? []) as Array<{
    id: string;
    content: string;
    source: string | null;
    stated_at: string | null;
  }>;

  const profile = (candidate?.profile_json ?? {}) as { title?: string };
  const name = candidate?.name ?? "정희윤";
  const position = profile.title ?? "수원특례시장 후보 / 개혁신당";
  const photo = candidate?.photo_url ?? null;

  const sns = {
    naver: candidate?.sns_naver ?? null,
    instagram: candidate?.sns_instagram ?? null,
    facebook: candidate?.sns_facebook ?? null,
    youtube: candidate?.sns_youtube_channel ?? null,
  };

  const sameAs = [sns.naver, sns.instagram, sns.facebook, sns.youtube].filter(
    (v): v is string => !!v
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url: PAGE_URL,
    jobTitle: position,
    sameAs,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-gray-50 pb-20">
        {/* [A] 헤더 */}
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link
              href="/we"
              className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-[#FF6B00]"
            >
              <span aria-hidden>←</span> 메인으로
            </Link>
            <span className="rounded-full bg-[#FF6B00] px-3 py-1 text-xs font-extrabold tracking-wide text-white">
              SNS · 미디어
            </span>
          </div>
        </header>

        {/* [B] 후보 프로필 카드 */}
        <section className="mx-auto mt-6 max-w-5xl px-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
              <div className="mx-auto h-32 w-32 shrink-0 overflow-hidden rounded-2xl bg-gray-100 md:mx-0 md:h-40 md:w-40">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo}
                    alt={`${name} 후보 프로필 사진`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                    사진 없음
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 text-center md:text-left">
                <h1 className="text-2xl font-extrabold md:text-3xl">{name}</h1>
                <p className="mt-1 text-sm text-gray-600 md:text-base">{position}</p>

                <div className="mt-4 flex items-center justify-center gap-3 md:justify-start">
                  <SnsIcon kind="naver" url={sns.naver} />
                  <SnsIcon kind="instagram" url={sns.instagram} />
                  <SnsIcon kind="facebook" url={sns.facebook} />
                  <SnsIcon kind="youtube" url={sns.youtube} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* [C] 유튜브 영상 슬라이더 */}
        <section className="mx-auto mt-10 max-w-5xl px-4">
          <h2 className="mb-4 text-lg font-extrabold md:text-xl">
            📺 후보 출연 영상
          </h2>
          {videos.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
              등록된 영상이 없습니다.
            </p>
          ) : (
            <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-4">
              {videos.map((v) => {
                const vid = extractYoutubeId(v.youtube_url);
                const thumb =
                  v.thumbnail_url ||
                  (vid ? `https://img.youtube.com/vi/${vid}/hqdefault.jpg` : null);
                return (
                  <a
                    key={v.id}
                    href={v.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block min-w-[280px] shrink-0 snap-start overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-[#FF6B00] hover:shadow-md"
                  >
                    <div className="aspect-video w-full bg-gray-100">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumb}
                          alt={v.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                          no thumb
                        </div>
                      )}
                    </div>
                    <p className="line-clamp-2 p-3 text-sm font-semibold text-gray-800">
                      {v.title}
                    </p>
                  </a>
                );
              })}
            </div>
          )}
        </section>

        {/* [D] 최근 발언 */}
        <section className="mx-auto mt-10 max-w-3xl px-4">
          <h2 className="mb-4 text-lg font-extrabold md:text-xl">
            💬 {name}의 한마디
          </h2>
          {statements.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
              등록된 발언이 없습니다.
            </p>
          ) : (
            <ul className="space-y-3">
              {statements.map((s) => (
                <li
                  key={s.id}
                  className="rounded-xl border-l-4 border-[#FF6B00] bg-white p-5 shadow-sm"
                >
                  <p className="text-sm leading-relaxed text-gray-800 md:text-base">
                    <span className="mr-1 text-[#FF6B00]">“</span>
                    {s.content}
                    <span className="ml-1 text-[#FF6B00]">”</span>
                  </p>
                  {(s.source || s.stated_at) && (
                    <p className="mt-3 text-right text-xs text-gray-500">
                      {s.source ?? ""}
                      {s.source && s.stated_at ? " · " : ""}
                      {s.stated_at ?? ""}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* [E] 공유 버튼 */}
        <section className="mx-auto mt-10 max-w-3xl px-4 text-center">
          <ShareButton
            title={`${name} SNS · 미디어`}
            text={`${name} ${position}의 공식 SNS와 최근 발언`}
            url={PAGE_URL}
          />
        </section>
      </main>
    </>
  );
}

function SnsIcon({
  kind,
  url,
}: {
  kind: "naver" | "instagram" | "facebook" | "youtube";
  url: string | null;
}) {
  const enabled = !!url;
  const label = {
    naver: "네이버 블로그",
    instagram: "인스타그램",
    facebook: "페이스북",
    youtube: "유튜브 채널",
  }[kind];

  const body = <Glyph kind={kind} />;

  const base =
    "inline-flex h-11 w-11 items-center justify-center rounded-full transition";
  const cls = enabled
    ? `${base} hover:scale-110`
    : `${base} pointer-events-none opacity-40`;

  if (!enabled) {
    return (
      <span className={cls} aria-label={`${label} (등록되지 않음)`}>
        {body}
      </span>
    );
  }

  return (
    <a
      href={url!}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} 새 창에서 열기`}
      className={cls}
    >
      {body}
    </a>
  );
}

function Glyph({ kind }: { kind: "naver" | "instagram" | "facebook" | "youtube" }) {
  if (kind === "naver") {
    return (
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#03C75A] text-lg font-black text-white">
        N
      </span>
    );
  }
  if (kind === "instagram") {
    return (
      <span
        className="flex h-11 w-11 items-center justify-center rounded-full text-white"
        style={{
          background:
            "radial-gradient(circle at 30% 110%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </svg>
      </span>
    );
  }
  if (kind === "facebook") {
    return (
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1877F2] text-xl font-black text-white">
        f
      </span>
    );
  }
  // youtube
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FF0000] text-white">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
        <path d="M8 5.5v13l11-6.5-11-6.5z" />
      </svg>
    </span>
  );
}
