import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

type ProfileJson = {
  title?: string;
  birth?: string;
  hometown?: string;
  residence?: string;
  military?: string;
  election?: string;
  education?: string;
  awards?: string;
  career?: string;
};
type Story = { title: string; body: string };
type SnsLinks = {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  twitter?: string;
  kakao?: string;
  discord?: string;
};

export default async function IntroPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("candidates")
    .select("name, photo_url, profile_json, stories_json, sns_links")
    .order("display_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  const name = data?.name ?? "정희윤";
  const photoUrl = data?.photo_url ?? "";
  const profile = (data?.profile_json ?? {}) as ProfileJson;
  const stories = Array.isArray(data?.stories_json)
    ? (data!.stories_json as Story[])
    : [];
  const sns = (data?.sns_links ?? {}) as SnsLinks;

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        <Link
          href="/we"
          className="mb-6 inline-block text-xs text-gray-500 hover:text-[#FF6B00]"
        >
          ← 메인으로
        </Link>

        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FF6B00]">
            CANDIDATE
          </p>
          <h1 className="mt-2 text-2xl font-extrabold md:text-3xl">
            후보 소개
          </h1>
        </div>

        {/* 프로필 카드 */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col md:flex-row">
            {/* 사진: 모바일 전체폭, PC 300px 고정 */}
            <div className="md:w-[300px] md:shrink-0">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt={`${name} 후보 프로필 사진`}
                  className="h-auto w-full object-cover md:h-full"
                />
              ) : (
                <div className="flex aspect-[3/4] w-full items-center justify-center bg-gradient-to-br from-[#FF6B00]/20 to-[#FF6B00]/5 text-xs text-gray-500 md:aspect-auto md:h-full">
                  프로필 사진 준비 중
                </div>
              )}
            </div>

            {/* 인적사항 */}
            <div className="flex-1 p-5 md:p-8">
              <h2 className="text-2xl font-extrabold md:text-3xl">{name}</h2>
              {profile.title && (
                <p className="mt-1 text-sm font-semibold text-[#FF6B00]">
                  {profile.title}
                </p>
              )}

              <dl className="mt-5 grid grid-cols-1 gap-y-3 text-sm">
                <InfoRow label="생년월일" value={profile.birth} />
                <InfoRow label="고향" value={profile.hometown} />
                <InfoRow label="거주지" value={profile.residence} />
                <InfoRow label="병역" value={profile.military} />
                <InfoRow label="선거" value={profile.election} />
                <MultilineRow label="학력" value={profile.education} />
                <MultilineRow label="수상" value={profile.awards} />
                <MultilineRow label="약력" value={profile.career} />
              </dl>

              {hasAnySns(sns) && (
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">
                    SNS
                  </span>
                  {sns.instagram && (
                    <SnsIconLink href={sns.instagram} label="Instagram">
                      <InstagramIcon />
                    </SnsIconLink>
                  )}
                  {sns.facebook && (
                    <SnsIconLink href={sns.facebook} label="Facebook">
                      <FacebookIcon />
                    </SnsIconLink>
                  )}
                  {sns.youtube && (
                    <SnsIconLink href={sns.youtube} label="YouTube">
                      <YouTubeIcon />
                    </SnsIconLink>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 스토리 섹션 */}
        {stories.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-lg font-extrabold md:text-xl">
              정희윤 이야기
            </h2>
            <div className="flex flex-col gap-4">
              {stories.map((s, i) => (
                <article
                  key={i}
                  className="rounded-xl border border-gray-200 border-l-4 border-l-[#FF6B00] bg-white p-5 shadow-sm md:p-6"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#FF6B00]">
                    STORY {i + 1}
                  </p>
                  <h3 className="mt-1 text-base font-extrabold md:text-lg">
                    {s.title}
                  </h3>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700 md:text-base">
                    {s.body}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ───── 서브 컴포넌트 ─────

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[70px_1fr] gap-3 md:grid-cols-[88px_1fr]">
      <dt className="text-xs font-semibold text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-800">{value}</dd>
    </div>
  );
}

function MultilineRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  const lines = value
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (lines.length === 0) return null;
  return (
    <div className="grid grid-cols-[70px_1fr] gap-3 md:grid-cols-[88px_1fr]">
      <dt className="text-xs font-semibold text-gray-500">{label}</dt>
      <dd>
        <ul className="list-disc space-y-0.5 pl-4 text-sm text-gray-800">
          {lines.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </dd>
    </div>
  );
}

function SnsIconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:border-[#FF6B00] hover:bg-[#FF6B00] hover:text-white"
    >
      {children}
    </a>
  );
}

function hasAnySns(sns: SnsLinks): boolean {
  return !!(sns.instagram || sns.facebook || sns.youtube);
}

function InstagramIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
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
  );
}

function FacebookIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.2c0-.9.3-1.5 1.6-1.5h1.3V5c-.2 0-1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.4v3H11v7h2.5z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M21.6 7.2c-.2-.9-.9-1.6-1.8-1.8C18 5 12 5 12 5s-6 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 9 2 12 2 12s0 3 .4 4.8c.2.9.9 1.6 1.8 1.8C6 19 12 19 12 19s6 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.8.4-4.8.4-4.8s0-3-.4-4.8zM10 15V9l5 3-5 3z" />
    </svg>
  );
}
