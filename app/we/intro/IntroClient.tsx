"use client";

import { useState } from "react";
import Link from "next/link";

// ───── 타입 ─────

export type ProfileJson = {
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

export type Story = { title: string; body: string; show?: boolean };

export type SnsLinks = {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  twitter?: string;
  kakao?: string;
  discord?: string;
};

export type IntroData = {
  name: string;
  photoUrl: string;
  profile: ProfileJson;
  stories: Story[];
  sns: SnsLinks;
  slogan: string;
  vision: string;
  bio: string;
  declaration: string;
  officeInfo: string;
  visibility: {
    slogan: boolean;
    vision: boolean;
    bio: boolean;
    declaration: boolean;
    office: boolean;
    profile: boolean;
    stories: boolean;
  };
};

type TabKey = "intro" | "story" | "declaration" | "office";

const TABS: { key: TabKey; label: string }[] = [
  { key: "intro", label: "후보 소개" },
  { key: "story", label: "정희윤 이야기" },
  { key: "declaration", label: "출마선언문" },
  { key: "office", label: "선거사무소 & 연락처" },
];

// ───── 메인 ─────

export default function IntroClient({ data }: { data: IntroData }) {
  const [tab, setTab] = useState<TabKey>("intro");

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-0 px-4 py-6 md:flex-row md:gap-10 md:px-6 md:py-10">
        {/* 사이드바 (데스크탑) */}
        <aside className="hidden shrink-0 md:block md:w-[240px] md:border-r md:border-gray-200 md:pr-6">
          <div className="sticky top-20">
            <div className="pb-6">
              <p className="text-xl font-extrabold tracking-tight text-[#FF6B00]">
                개혁신당
              </p>
              <p className="mt-1 text-xs font-semibold text-gray-500">
                수원특례시장 후보 정희윤
              </p>
            </div>
            <nav className="flex flex-col">
              {TABS.map((t) => {
                const active = t.key === tab;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={`relative border-l-4 px-4 py-3 text-left text-sm transition-colors ${
                      active
                        ? "border-[#FF6B00] font-bold text-[#FF6B00]"
                        : "border-transparent text-gray-500 hover:text-[#FF6B00]"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </nav>
            <div className="mt-8 pl-4">
              <Link
                href="/we"
                className="text-xs text-gray-400 hover:text-[#FF6B00]"
              >
                ← 메인으로
              </Link>
            </div>
          </div>
        </aside>

        {/* 모바일 상단 탭 */}
        <div className="-mx-4 mb-4 border-b border-gray-200 bg-white md:hidden">
          <div className="flex overflow-x-auto px-2">
            {TABS.map((t) => {
              const active = t.key === tab;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`shrink-0 border-b-2 px-3 py-3 text-sm transition-colors ${
                    active
                      ? "border-[#FF6B00] font-bold text-[#FF6B00]"
                      : "border-transparent text-gray-500"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 콘텐츠 */}
        <section className="min-w-0 flex-1">
          {tab === "intro" && <IntroTab data={data} />}
          {tab === "story" && <StoryTab data={data} />}
          {tab === "declaration" && <DeclarationTab data={data} />}
          {tab === "office" && <OfficeTab data={data} />}
        </section>
      </div>
    </div>
  );
}

// ───── 탭 1: 후보 소개 ─────

function IntroTab({ data }: { data: IntroData }) {
  const { name, photoUrl, profile, sns, slogan, vision, bio, visibility } =
    data;
  const anySection =
    visibility.profile ||
    (visibility.slogan && slogan) ||
    (visibility.vision && vision) ||
    (visibility.bio && bio);

  return (
    <div className="flex flex-col gap-10">
      <TabHeader eyebrow="CANDIDATE" title="후보 소개" />

      {/* 프로필 카드 */}
      {visibility.profile && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col items-start gap-5 p-5 md:flex-row md:gap-8 md:p-8">
            <div className="mx-auto aspect-[3/4] w-full max-w-[260px] overflow-hidden rounded-xl md:mx-0 md:shrink-0">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt={`${name} 후보 프로필 사진`}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FF6B00]/20 to-[#FF6B00]/5 text-xs text-gray-500">
                  프로필 사진 준비 중
                </div>
              )}
            </div>

            <div className="w-full min-w-0 flex-1">
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
        </div>
      )}

      {/* 슬로건 배너 */}
      {visibility.slogan && slogan && (
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF6B00] via-[#ff7e1f] to-[#ff8a3d] px-6 py-12 text-center text-white shadow-lg md:px-10 md:py-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] opacity-90">
            SLOGAN
          </p>
          <p className="mt-4 whitespace-pre-wrap text-2xl font-black leading-relaxed sm:text-3xl md:text-4xl md:leading-tight">
            {slogan}
          </p>
        </div>
      )}

      {/* 비전 */}
      {visibility.vision && vision && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[160px_1fr] md:gap-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#FF6B00]">
              VISION
            </p>
            <div className="mt-2 hidden h-0.5 w-10 bg-[#FF6B00] md:block" />
          </div>
          <p className="whitespace-pre-wrap text-base leading-loose text-gray-700 md:text-lg">
            {vision}
          </p>
        </div>
      )}

      {/* 소개 (bio) */}
      {visibility.bio && bio && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#FF6B00]">
            ABOUT
          </p>
          <div className="mt-2 h-0.5 w-10 bg-[#FF6B00]" />
          <p className="mt-6 whitespace-pre-wrap text-base leading-loose text-gray-700 md:text-lg">
            {bio}
          </p>
        </div>
      )}

      {!anySection && <EmptyState />}
    </div>
  );
}

// ───── 탭 2: 정희윤 이야기 ─────

function StoryTab({ data }: { data: IntroData }) {
  const { stories, visibility } = data;
  const visible = visibility.stories
    ? stories.filter((s) => (s.title || s.body) && s.show !== false)
    : [];

  return (
    <div className="flex flex-col gap-6">
      <TabHeader eyebrow="STORY" title="정희윤 이야기" />

      {visible.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((s, i) => (
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
      )}
    </div>
  );
}

// ───── 탭 3: 출마선언문 ─────

function DeclarationTab({ data }: { data: IntroData }) {
  const { declaration, visibility, name } = data;
  const show = visibility.declaration && declaration;
  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월`;

  return (
    <div className="flex flex-col gap-6">
      <TabHeader eyebrow="DECLARATION" title="출마선언문" />

      {!show ? (
        <EmptyState />
      ) : (
        <article className="relative rounded-xl border border-gray-200 bg-white px-6 py-10 shadow-sm md:px-12 md:py-14">
          <span className="absolute left-0 top-8 bottom-8 w-1 bg-[#FF6B00]" />
          <header className="mb-8 border-b border-gray-100 pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#FF6B00]">
              {dateStr} · 수원
            </p>
            <h2 className="mt-2 text-xl font-extrabold md:text-2xl">
              {name} 수원특례시장 후보 출마선언
            </h2>
          </header>
          <p className="whitespace-pre-wrap text-base leading-loose text-gray-700 md:text-lg">
            {declaration}
          </p>
          <footer className="mt-10 border-t border-gray-100 pt-6 text-right">
            <p className="text-xs text-gray-500">개혁신당 수원특례시장 후보</p>
            <p className="mt-1 text-2xl font-black text-[#1a1a1a] md:text-3xl">
              {name}
            </p>
          </footer>
        </article>
      )}
    </div>
  );
}

// ───── 탭 4: 선거사무소 & 연락처 ─────

function OfficeTab({ data }: { data: IntroData }) {
  const { officeInfo, sns, visibility } = data;
  const { address, phone, email, rest } = parseOffice(officeInfo);
  const showOffice = visibility.office && officeInfo;

  return (
    <div className="flex flex-col gap-8">
      <TabHeader eyebrow="OFFICE" title="선거사무소 & 연락처" />

      {!showOffice && !hasAnySns(sns) ? (
        <EmptyState />
      ) : (
        <>
          {showOffice && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
              <div className="flex flex-col gap-4">
                {address && (
                  <ContactRow icon={<PinIcon />} label="주소" value={address} />
                )}
                {phone && (
                  <ContactRow icon={<PhoneIcon />} label="전화" value={phone} href={`tel:${phone.replace(/[^0-9+]/g, "")}`} />
                )}
                {email && (
                  <ContactRow icon={<MailIcon />} label="이메일" value={email} href={`mailto:${email}`} />
                )}
                {rest && (
                  <div className="mt-2 border-t border-gray-100 pt-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                      {rest}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {hasAnySns(sns) && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#FF6B00]">
                SNS
              </p>
              <div className="flex flex-wrap gap-2">
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
            </div>
          )}

          <div className="rounded-xl bg-gray-50 p-5 text-sm text-gray-600 md:p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#FF6B00]">
              WEBSITE
            </p>
            <div className="flex flex-col gap-1">
              <a
                href="https://wesw.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#FF6B00]"
              >
                wesw.kr — 수원 9.0캠프 통합 플랫폼
              </a>
              <a
                href="https://we.wesw.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#FF6B00]"
              >
                we.wesw.kr — 후보 공약·정책
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ───── 공통 UI ─────

function TabHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header>
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#FF6B00]">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-2xl font-extrabold md:text-3xl">{title}</h1>
    </header>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-sm text-gray-400">
      준비 중인 콘텐츠입니다.
    </div>
  );
}

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

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const body = (
    <>
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF6B00]/10 text-[#FF6B00]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          {label}
        </p>
        <p className="mt-0.5 break-all text-sm text-gray-800">{value}</p>
      </div>
    </>
  );
  return href ? (
    <a href={href} className="flex items-start gap-3 hover:text-[#FF6B00]">
      {body}
    </a>
  ) : (
    <div className="flex items-start gap-3">{body}</div>
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

function parseOffice(raw: string): {
  address: string;
  phone: string;
  email: string;
  rest: string;
} {
  let address = "";
  let phone = "";
  let email = "";
  const restLines: string[] = [];
  raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((line) => {
      const emailMatch = line.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
      const phoneMatch = line.match(/[\d\-+()\s]{7,}/);
      if (!email && emailMatch) {
        email = emailMatch[0];
      } else if (!phone && phoneMatch && /\d{2,}-\d{2,}/.test(line)) {
        phone = phoneMatch[0].trim();
      } else if (
        !address &&
        (line.includes("시") || line.includes("도") || line.includes("로"))
      ) {
        address = line;
      } else {
        restLines.push(line);
      }
    });
  return { address, phone, email, rest: restLines.join("\n") };
}

// ───── 아이콘 ─────

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.2c0-.9.3-1.5 1.6-1.5h1.3V5c-.2 0-1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.4v3H11v7h2.5z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.6 7.2c-.2-.9-.9-1.6-1.8-1.8C18 5 12 5 12 5s-6 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 9 2 12 2 12s0 3 .4 4.8c.2.9.9 1.6 1.8 1.8C6 19 12 19 12 19s6 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.8.4-4.8.4-4.8s0-3-.4-4.8zM10 15V9l5 3-5 3z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.6a2 2 0 01-.5 2L8 9.5a16 16 0 006 6l1.2-1.2a2 2 0 012-.5c.9.3 1.8.6 2.6.7A2 2 0 0122 16.9z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}
