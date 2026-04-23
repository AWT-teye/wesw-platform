"use client";

import { useEffect, useState, useCallback } from "react";

// ───── 타입 ─────

export type PledgesData = {
  candidate: {
    name: string;
    position: string;
    photoUrl: string | null;
  };
  overview: {
    intro_text: string | null;
    popup_image_url: string | null;
    poster_url: string | null;
    bulletin_url: string | null;
    top10_url: string | null;
    plan_book_url: string | null;
  };
  bigPledges: Array<{
    id: string;
    title: string;
    content: string | null;
    display_order: number;
  }>;
  midPledges: Array<{
    id: string;
    title: string;
    content: string | null;
    parent_id: string | null;
    display_order: number;
    is_top10: boolean;
  }>;
  detailPledges: Array<{
    id: string;
    title: string;
    content: string | null;
    parent_id: string | null;
    display_order: number;
  }>;
  regions: Array<{
    region_type: string;
    region_code: string;
    region_name: string;
    content: string | null;
    popup_image_url: string | null;
    display_order: number;
    is_visible: boolean;
  }>;
};

type TabKey = "intro" | "all" | "top10" | "region";

const TABS: { key: TabKey; label: string }[] = [
  { key: "intro", label: "공약 소개" },
  { key: "all", label: "전체공약" },
  { key: "top10", label: "10대공약" },
  { key: "region", label: "지역별 맞춤공약" },
];

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

// ───── 메인 ─────

export default function PledgesClient({ data }: { data: PledgesData }) {
  const [tab, setTab] = useState<TabKey>("intro");

  useEffect(() => {
    const handler = () => setTab("top10");
    window.addEventListener("pledges:goto-top10", handler);
    return () => window.removeEventListener("pledges:goto-top10", handler);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-0 px-4 py-6 md:flex-row md:gap-10 md:px-6 md:py-10">
        {/* 사이드바 (데스크탑/태블릿) */}
        <aside className="hidden shrink-0 md:block md:w-[200px] md:border-r md:border-gray-200 md:pr-5 lg:w-[240px] lg:pr-6">
          <div className="sticky top-20">
            <div className="pb-6">
              <p className="text-xl font-extrabold tracking-tight text-[#FF6B00]">
                공약
              </p>
              <p className="mt-1 text-xs font-semibold text-gray-500">
                {data.candidate.name} · {data.candidate.position}
              </p>
            </div>
            <nav aria-label="공약 탭">
              <ul className="flex flex-col gap-1">
                {TABS.map((t, i) => {
                  const active = tab === t.key;
                  return (
                    <li key={t.key}>
                      <button
                        type="button"
                        onClick={() => setTab(t.key)}
                        className={`w-full rounded-md px-3 py-2 text-left text-sm font-semibold transition ${
                          active
                            ? "bg-[#FF6B00] text-white"
                            : "text-gray-700 hover:bg-[#FF6B00]/10 hover:text-[#FF6B00]"
                        }`}
                      >
                        <span className="mr-2 text-xs opacity-70">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {t.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </aside>

        {/* 모바일 상단 탭 */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 md:hidden">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${
                  active
                    ? "bg-[#FF6B00] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-[#FF6B00]/10 hover:text-[#FF6B00]"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* 콘텐츠 */}
        <main className="min-w-0 flex-1">
          {tab === "intro" && <IntroTab data={data} />}
          {tab === "all" && <AllTab data={data} />}
          {tab === "top10" && <Top10Tab data={data} />}
          {tab === "region" && <RegionTab data={data} />}
        </main>
      </div>
    </div>
  );
}

// ───── 탭1 공약 소개 ─────

function IntroTab({ data }: { data: PledgesData }) {
  const [imgOpen, setImgOpen] = useState(false);
  const { overview, candidate } = data;

  const buttons: {
    label: string;
    url: string | null;
    onClick?: () => void;
  }[] = [
    { label: "선거벽보", url: overview.poster_url },
    { label: "선거공보", url: overview.bulletin_url },
    { label: "10대공약", url: overview.top10_url },
    { label: "선거공약서", url: overview.plan_book_url },
  ];

  return (
    <section className="flex flex-col items-center text-center">
      {/* 프로필 */}
      <div className="mb-4 h-32 w-32 overflow-hidden rounded-2xl bg-gray-100 md:h-40 md:w-40">
        {candidate.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={candidate.photoUrl}
            alt={`${candidate.name} 후보 프로필 사진`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
            사진 없음
          </div>
        )}
      </div>
      <h1 className="text-2xl font-extrabold md:text-3xl">{candidate.name}</h1>
      <p className="mt-1 text-sm text-gray-600 md:text-base">
        {candidate.position}
      </p>

      {/* 2x2 버튼 */}
      <div className="mt-6 grid w-full max-w-md grid-cols-2 gap-3">
        {buttons.map((b) => {
          const isTop10Button = b.label === "10대공약";
          const fallbackAction = isTop10Button ? "go-top10-tab" : null;
          const enabled = !!b.url || !!fallbackAction;
          if (b.url) {
            return (
              <a
                key={b.label}
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border-2 border-[#FF6B00] bg-white py-4 text-sm font-bold text-[#FF6B00] transition hover:bg-[#FF6B00] hover:text-white md:text-base"
              >
                {b.label}
              </a>
            );
          }
          if (fallbackAction === "go-top10-tab") {
            return (
              <button
                key={b.label}
                type="button"
                onClick={() => {
                  // IntroTab 내에서는 외부로 이벤트 발생
                  const event = new CustomEvent("pledges:goto-top10");
                  window.dispatchEvent(event);
                }}
                className="rounded-xl border-2 border-[#FF6B00] bg-white py-4 text-sm font-bold text-[#FF6B00] transition hover:bg-[#FF6B00] hover:text-white md:text-base"
              >
                {b.label}
              </button>
            );
          }
          return (
            <button
              key={b.label}
              type="button"
              disabled={!enabled}
              className="cursor-not-allowed rounded-xl border-2 border-gray-200 bg-gray-50 py-4 text-sm font-bold text-gray-400 md:text-base"
            >
              {b.label}
              <span className="mt-1 block text-[10px] font-semibold">준비중</span>
            </button>
          );
        })}
      </div>

      {/* 인트로 텍스트 */}
      {overview.intro_text && (
        <p className="mt-8 max-w-2xl whitespace-pre-wrap text-left text-sm leading-relaxed text-gray-800 md:text-base">
          {overview.intro_text}
        </p>
      )}

      {/* 팝업 이미지 */}
      {overview.popup_image_url && (
        <button
          type="button"
          onClick={() => setImgOpen(true)}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#FF6B00] px-5 py-2 text-sm font-bold text-white hover:opacity-90"
        >
          이미지로 보기
        </button>
      )}

      {imgOpen && overview.popup_image_url && (
        <Lightbox
          src={overview.popup_image_url}
          alt="공약 소개 이미지"
          onClose={() => setImgOpen(false)}
        />
      )}
    </section>
  );
}

// ───── 탭2 전체공약 ─────

function AllTab({ data }: { data: PledgesData }) {
  const midByBig = new Map<string, PledgesData["midPledges"]>();
  for (const m of data.midPledges) {
    const key = m.parent_id ?? "_";
    const arr = midByBig.get(key) ?? [];
    arr.push(m);
    midByBig.set(key, arr);
  }
  const detailByMid = new Map<string, PledgesData["detailPledges"]>();
  for (const d of data.detailPledges) {
    const key = d.parent_id ?? "_";
    const arr = detailByMid.get(key) ?? [];
    arr.push(d);
    detailByMid.set(key, arr);
  }

  if (data.bigPledges.length === 0) {
    return (
      <EmptyState>
        등록된 공약이 없습니다. 백오피스에서 대공약을 등록해 주세요.
      </EmptyState>
    );
  }

  return (
    <section className="space-y-8">
      <h2 className="text-xl font-extrabold md:text-2xl">전체공약</h2>
      {data.bigPledges.map((big, i) => {
        const mids = midByBig.get(big.id) ?? [];
        return (
          <div
            key={big.id}
            className="rounded-xl border-2 border-[#FF6B00] bg-white p-5"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FF6B00] text-sm font-black text-white">
                {ROMAN[i] ?? i + 1}
              </span>
              <h3 className="min-w-0 flex-1 text-lg font-extrabold md:text-xl">
                {big.title}
              </h3>
              <span className="shrink-0 rounded-full bg-[#FF6B00]/10 px-2 py-1 text-xs font-bold text-[#FF6B00]">
                중공약 {mids.length}
              </span>
            </div>
            {big.content && (
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                {big.content}
              </p>
            )}

            {mids.length > 0 && (
              <ul className="mt-4 space-y-2">
                {mids.map((mid, mi) => (
                  <MidAccordion
                    key={mid.id}
                    number={`${i + 1}-${mi + 1}`}
                    mid={mid}
                    details={detailByMid.get(mid.id) ?? []}
                  />
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </section>
  );
}

function MidAccordion({
  number,
  mid,
  details,
}: {
  number: string;
  mid: PledgesData["midPledges"][number];
  details: PledgesData["detailPledges"];
}) {
  const [open, setOpen] = useState(false);
  return (
    <li className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#FF6B00]/5"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 rounded bg-[#FF6B00]/10 px-2 py-0.5 text-xs font-bold text-[#FF6B00]">
            {number}
          </span>
          <span className="truncate text-sm font-bold md:text-base">
            {mid.title}
          </span>
        </span>
        <span
          className={`shrink-0 text-[#FF6B00] transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          ▼
        </span>
      </button>
      {open && (
        <div className="border-t border-gray-100 bg-[#FF6B00]/5 px-4 py-3">
          {mid.content && (
            <p className="whitespace-pre-wrap text-sm text-gray-800">
              {mid.content}
            </p>
          )}
          {details.length > 0 && (
            <ul className="mt-3 space-y-2 text-sm">
              {details.map((d) => (
                <li
                  key={d.id}
                  className="rounded border border-[#FF6B00]/30 bg-white p-3"
                >
                  <p className="font-semibold">{d.title}</p>
                  {d.content && (
                    <p className="mt-1 whitespace-pre-wrap text-xs text-gray-700">
                      {d.content}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

// ───── 탭3 10대공약 ─────

function Top10Tab({ data }: { data: PledgesData }) {
  const top10 = data.midPledges.filter((m) => m.is_top10);
  const bigById = new Map(data.bigPledges.map((b) => [b.id, b.title]));

  if (top10.length === 0) {
    return <EmptyState>10대공약 준비중입니다.</EmptyState>;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-extrabold md:text-2xl">10대공약</h2>
      <ul className="space-y-2">
        {top10.map((mid, i) => (
          <Top10Accordion
            key={mid.id}
            number={i + 1}
            category={mid.parent_id ? bigById.get(mid.parent_id) ?? "" : ""}
            mid={mid}
          />
        ))}
      </ul>
    </section>
  );
}

function Top10Accordion({
  number,
  category,
  mid,
}: {
  number: number;
  category: string;
  mid: PledgesData["midPledges"][number];
}) {
  const [open, setOpen] = useState(false);
  return (
    <li className="overflow-hidden rounded-lg border-2 border-[#FF6B00] bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#FF6B00]/5"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FF6B00] text-sm font-black text-white">
            {number}
          </span>
          <span className="min-w-0">
            {category && (
              <span className="mr-2 rounded bg-[#FF6B00]/10 px-2 py-0.5 text-[10px] font-bold text-[#FF6B00]">
                {category}
              </span>
            )}
            <span className="text-sm font-bold md:text-base">{mid.title}</span>
          </span>
        </span>
        <span
          className={`shrink-0 text-[#FF6B00] transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          ▼
        </span>
      </button>
      {open && mid.content && (
        <div className="border-t border-[#FF6B00]/30 bg-[#FF6B00]/5 px-4 py-3">
          <p className="whitespace-pre-wrap text-sm text-gray-800">
            {mid.content}
          </p>
        </div>
      )}
    </li>
  );
}

// ───── 탭4 지역별 맞춤공약 ─────

function RegionTab({ data }: { data: PledgesData }) {
  const gus = data.regions.filter((r) => r.region_type === "gu");
  const specials = data.regions.filter((r) => r.region_type === "special");

  const [activeCode, setActiveCode] = useState<string | null>(null);
  const byCode = useCallback(
    (code: string) => data.regions.find((r) => r.region_code === code) ?? null,
    [data.regions]
  );

  // URL 해시 동기화
  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && byCode(hash)) {
        setActiveCode(hash);
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [byCode]);

  function open(code: string) {
    const r = byCode(code);
    if (!r) return;
    if (!r.is_visible) {
      alert("준비중입니다.");
      return;
    }
    setActiveCode(code);
    if (typeof window !== "undefined") {
      history.replaceState(null, "", `#${code}`);
    }
  }
  function close() {
    setActiveCode(null);
    if (typeof window !== "undefined") {
      history.replaceState(null, "", window.location.pathname);
    }
  }

  const active = activeCode ? byCode(activeCode) : null;

  return (
    <section>
      <h2 className="text-xl font-extrabold md:text-2xl">지역별 맞춤공약</h2>
      <p className="mt-1 text-xs text-gray-500">
        수원 4개 구를 클릭하거나 아래 특별 카드를 눌러 상세 공약을 확인하세요.
      </p>

      <div className="mt-5">
        <SuwonMap gus={gus} onClick={open} />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {specials.map((s) => (
          <button
            key={s.region_code}
            type="button"
            onClick={() => open(s.region_code)}
            className={`rounded-xl border-2 p-5 text-left transition ${
              s.is_visible
                ? "border-[#FF6B00] bg-white hover:bg-[#FF6B00] hover:text-white"
                : "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
            }`}
          >
            <p className="text-xs font-bold opacity-80">SPECIAL</p>
            <p className="mt-1 text-base font-extrabold md:text-lg">
              {s.region_name}
            </p>
            {!s.is_visible && (
              <p className="mt-2 text-[11px] font-semibold">준비중</p>
            )}
          </button>
        ))}
      </div>

      {active && <RegionModal region={active} onClose={close} />}
    </section>
  );
}

function SuwonMap({
  gus,
  onClick,
}: {
  gus: PledgesData["regions"];
  onClick: (code: string) => void;
}) {
  const find = (code: string) => gus.find((g) => g.region_code === code);

  function pathCls(code: string) {
    const r = find(code);
    const enabled = !!r && r.is_visible;
    return `cursor-pointer transition-colors outline-none focus:outline-[#FF6B00] ${
      enabled
        ? "fill-[#FF6B00]/20 stroke-[#FF6B00] hover:fill-[#FF6B00]/60"
        : "fill-gray-200 stroke-gray-400"
    }`;
  }
  function labelCls(code: string) {
    const r = find(code);
    const enabled = !!r && r.is_visible;
    return `pointer-events-none select-none text-[12px] font-bold ${
      enabled ? "fill-[#1a1a1a]" : "fill-gray-400"
    }`;
  }

  // 수원 4개 구의 단순 추상화 배치 (정확한 지도가 아닌 개념도)
  return (
    <svg
      viewBox="0 0 400 260"
      role="img"
      aria-label="수원시 4개 구 지도"
      className="h-auto w-full max-w-xl"
    >
      <rect
        x="0"
        y="0"
        width="400"
        height="260"
        fill="#FF6B00"
        opacity="0.04"
        rx="12"
      />
      {/* 장안구 (좌상) */}
      <g onClick={() => onClick("jangan")}>
        <path
          d="M40 30 L200 30 L200 130 L40 130 Z"
          className={pathCls("jangan")}
          strokeWidth={2}
          aria-label="장안구"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onClick("jangan");
          }}
        />
        <text x="120" y="85" textAnchor="middle" className={labelCls("jangan")}>
          장안구
        </text>
      </g>
      {/* 영통구 (우상) */}
      <g onClick={() => onClick("yeongtong")}>
        <path
          d="M200 30 L360 30 L360 130 L200 130 Z"
          className={pathCls("yeongtong")}
          strokeWidth={2}
          aria-label="영통구"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onClick("yeongtong");
          }}
        />
        <text
          x="280"
          y="85"
          textAnchor="middle"
          className={labelCls("yeongtong")}
        >
          영통구
        </text>
      </g>
      {/* 권선구 (좌하) */}
      <g onClick={() => onClick("gwonseon")}>
        <path
          d="M40 130 L200 130 L200 230 L40 230 Z"
          className={pathCls("gwonseon")}
          strokeWidth={2}
          aria-label="권선구"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onClick("gwonseon");
          }}
        />
        <text
          x="120"
          y="185"
          textAnchor="middle"
          className={labelCls("gwonseon")}
        >
          권선구
        </text>
      </g>
      {/* 팔달구 (우하) */}
      <g onClick={() => onClick("paldal")}>
        <path
          d="M200 130 L360 130 L360 230 L200 230 Z"
          className={pathCls("paldal")}
          strokeWidth={2}
          aria-label="팔달구"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onClick("paldal");
          }}
        />
        <text x="280" y="185" textAnchor="middle" className={labelCls("paldal")}>
          팔달구
        </text>
      </g>
    </svg>
  );
}

function RegionModal({
  region,
  onClose,
}: {
  region: PledgesData["regions"][number];
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${region.region_name} 공약`}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/80"
      />
      <div className="relative flex h-full w-full flex-col bg-white md:h-auto md:max-h-[85vh] md:max-w-2xl md:rounded-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h3 className="text-lg font-extrabold text-[#FF6B00] md:text-xl">
            {region.region_name}
          </h3>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {region.content ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 md:text-base">
              {region.content}
            </p>
          ) : (
            <p className="text-sm text-gray-500">등록된 내용이 없습니다.</p>
          )}
          {region.popup_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={region.popup_image_url}
              alt={`${region.region_name} 공약 이미지`}
              className="mt-4 w-full rounded-lg border border-gray-200"
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ───── 공통 ─────

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
      {children}
    </div>
  );
}

function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/80"
      />
      <div className="relative max-h-full max-w-4xl">
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="absolute -top-10 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40"
        >
          ✕
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-h-[85vh] w-auto rounded-lg object-contain"
        />
      </div>
    </div>
  );
}
