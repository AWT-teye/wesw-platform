"use client";

import { useMemo, useState } from "react";

export type CandidateSchedule = {
  id: string;
  title: string;
  subtitle: string | null;
  scheduled_date: string; // YYYY-MM-DD
  start_time: string | null; // HH:MM:SS
  end_time: string | null;
  location: string | null;
  content: string | null;
  extra: string | null;
};

export type ElectionSchedule = {
  id: string;
  title: string;
  scheduled_date: string;
  end_date: string | null;
  description: string | null;
  badge_label: string | null;
  badge_color: string | null;
  display_order: number;
  is_past_hidden: boolean;
};

type Props = {
  candidateSchedules: CandidateSchedule[];
  electionSchedules: ElectionSchedule[];
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toKey(year: number, month: number, day: number): string {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatTime(t: string | null): string | null {
  if (!t) return null;
  // Accept "HH:MM:SS" or "HH:MM"
  const m = t.match(/^(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : t;
}

export default function ScheduleClient({
  candidateSchedules,
  electionSchedules,
}: Props) {
  const today = useMemo(() => startOfToday(), []);
  const [viewYear, setViewYear] = useState<number>(today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(today.getMonth()); // 0-indexed
  const [selectedKey, setSelectedKey] = useState<string>(
    toKey(today.getFullYear(), today.getMonth(), today.getDate())
  );

  // 날짜별 일정 그룹
  const schedulesByDate = useMemo(() => {
    const map = new Map<string, CandidateSchedule[]>();
    for (const s of candidateSchedules) {
      const arr = map.get(s.scheduled_date) ?? [];
      arr.push(s);
      map.set(s.scheduled_date, arr);
    }
    return map;
  }, [candidateSchedules]);

  const todayKey = toKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const selectedSchedules = schedulesByDate.get(selectedKey) ?? [];

  // 달력 셀 생성: 첫 주는 1일 이전 공백
  const cells = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const firstWeekday = first.getDay(); // 0(일)~6(토)
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const out: Array<{ day: number | null; key: string | null }> = [];
    for (let i = 0; i < firstWeekday; i++) {
      out.push({ day: null, key: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      out.push({ day: d, key: toKey(viewYear, viewMonth, d) });
    }
    while (out.length % 7 !== 0) out.push({ day: null, key: null });
    return out;
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const selectedDateLabel = useMemo(() => {
    const [y, m, d] = selectedKey.split("-").map(Number);
    return `${m}월 ${d}일`;
  }, [selectedKey]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(320px,1.1fr)_1fr] lg:grid-cols-[minmax(320px,1.1fr)_1fr_minmax(260px,0.9fr)]">
      {/* 좌 — 달력 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            aria-label="이전 달"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-[#FF6B00]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2 className="text-lg font-extrabold md:text-xl">
            {viewYear}년 {viewMonth + 1}월
          </h2>
          <button
            type="button"
            onClick={nextMonth}
            aria-label="다음 달"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-[#FF6B00]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-bold">
          {WEEKDAYS.map((w, i) => (
            <div
              key={w}
              className={
                i === 0
                  ? "py-1 text-red-500"
                  : i === 6
                  ? "py-1 text-blue-500"
                  : "py-1 text-gray-500"
              }
            >
              {w}
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((c, idx) => {
            if (c.day === null) {
              return <div key={`e-${idx}`} className="h-14 md:h-16" />;
            }
            const isToday = c.key === todayKey;
            const isSelected = c.key === selectedKey;
            const schedules = c.key ? schedulesByDate.get(c.key) ?? [] : [];
            const hasSchedule = schedules.length > 0;
            const weekdayIdx = idx % 7;
            const dayColor =
              weekdayIdx === 0
                ? "text-red-500"
                : weekdayIdx === 6
                ? "text-blue-500"
                : "text-gray-900";
            const subtitle =
              schedules.find((s) => s.subtitle)?.subtitle ?? null;

            return (
              <button
                key={c.key!}
                type="button"
                onClick={() => c.key && setSelectedKey(c.key)}
                className={[
                  "relative flex h-14 flex-col items-center justify-start rounded-md border text-xs transition md:h-16",
                  isSelected
                    ? "border-[#FF6B00] border-2"
                    : "border-transparent hover:border-gray-200",
                ].join(" ")}
                aria-label={`${viewYear}년 ${viewMonth + 1}월 ${c.day}일 선택`}
                aria-pressed={isSelected}
              >
                <span
                  className={[
                    "mt-1 flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold",
                    isToday
                      ? "bg-[#FF6B00] text-white"
                      : `${dayColor} font-medium`,
                  ].join(" ")}
                >
                  {c.day}
                </span>
                {hasSchedule && !isToday && (
                  <span
                    aria-hidden
                    className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#FF6B00]"
                  />
                )}
                {subtitle && (
                  <span className="mt-0.5 line-clamp-1 w-full px-1 text-[10px] font-semibold text-[#FF6B00]">
                    {subtitle}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
          <span className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-[#FF6B00]" />오늘
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded border-2 border-[#FF6B00]" />
            선택
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B00]" />
            일정 있음
          </span>
        </div>
      </div>

      {/* 중 — 선택 날짜 일정 상세 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex items-baseline gap-2 border-b border-gray-100 pb-3">
          <h2 className="text-lg font-extrabold md:text-xl">
            {selectedDateLabel}
          </h2>
          <span className="text-xs font-medium text-gray-500">
            선택한 날짜의 일정
          </span>
        </div>

        {selectedSchedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg
              width="42"
              height="42"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-300"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p className="mt-3 text-sm text-gray-500">
              선택한 날짜에 공개 일정이 없습니다.
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {selectedSchedules.map((s) => {
              const st = formatTime(s.start_time);
              const et = formatTime(s.end_time);
              const timeLabel =
                st && et ? `${st} ~ ${et}` : st ? st : "시간 미정";
              return (
                <li
                  key={s.id}
                  className="rounded-xl border-l-4 border-[#FF6B00] bg-gray-50 p-4"
                >
                  {s.subtitle && (
                    <span className="inline-block rounded-full bg-[#FF6B00] px-2 py-0.5 text-[11px] font-bold text-white">
                      {s.subtitle}
                    </span>
                  )}
                  <h3 className="mt-2 text-xl font-bold text-gray-900">
                    {s.title}
                  </h3>
                  <p className="mt-2 inline-flex items-center gap-1 text-sm text-gray-700">
                    <span aria-hidden>🕐</span>
                    {timeLabel}
                  </p>
                  {s.location && (
                    <p className="mt-1 inline-flex items-center gap-1 text-sm text-gray-700">
                      <span aria-hidden>📍</span>
                      {s.location}
                    </p>
                  )}
                  {s.content && (
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                      {s.content}
                    </p>
                  )}
                  {s.extra && (
                    <p className="mt-3 whitespace-pre-wrap text-xs text-gray-500">
                      {s.extra}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 우 — 선거 공식 일정 타임라인 */}
      <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:col-span-2 md:p-5 lg:col-span-1">
        <h2 className="text-lg font-extrabold text-[#FF6B00] md:text-xl">
          📅 선거 일정
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          2026 제9회 전국동시지방선거
        </p>

        <div className="orange-scroll mt-5 max-h-none overflow-visible md:max-h-[600px] md:overflow-y-auto">
          <ol className="relative space-y-5 border-l-2 border-[#FF6B00] pl-5 pr-1">
            {electionSchedules.map((e) => {
              const endKey = e.end_date ?? e.scheduled_date;
              const past = new Date(endKey) < today;
              const hidden = !!e.is_past_hidden;
              const opacityClass = hidden
                ? "opacity-40"
                : past
                ? "opacity-50"
                : "";
              return (
                <li key={e.id} className={`relative ${opacityClass}`}>
                  <span
                    aria-hidden
                    className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-[#FF6B00] bg-white"
                  />
                  <div className="flex items-center gap-1.5">
                    <BadgePill label={e.badge_label} />
                    {hidden && (
                      <span className="text-[10px] font-bold text-gray-400">
                        (완료)
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-bold text-gray-900">
                    {formatDateRange(e.scheduled_date, e.end_date)}
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {e.title}
                  </p>
                  {e.description && (
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">
                      {e.description}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </aside>

      <style>{`
        .orange-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 107, 0, 0.6) transparent;
        }
        .orange-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .orange-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .orange-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(255, 107, 0, 0.55);
          border-radius: 9999px;
        }
        .orange-scroll::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 107, 0, 0.8);
        }
      `}</style>
    </div>
  );
}

function formatDateRange(start: string, end: string | null): string {
  if (!end || end === start) return formatDateKorean(start);
  const [sy, sm, sd] = start.split("-").map(Number);
  const [ey, em, ed] = end.split("-").map(Number);
  if (sy === ey && sm === em) {
    return `${sy}. ${sm}. ${sd} ~ ${ed}.`;
  }
  if (sy === ey) {
    return `${sy}. ${sm}. ${sd} ~ ${em}. ${ed}.`;
  }
  return `${sy}. ${sm}. ${sd}. ~ ${ey}. ${em}. ${ed}.`;
}

function formatDateKorean(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${y}. ${m}. ${d}.`;
}

function BadgePill({ label }: { label: string | null }) {
  if (!label) return null;
  let cls =
    "inline-block rounded-full border px-2 py-0.5 text-[11px] font-bold";
  switch (label) {
    case "완료":
      cls += " border-gray-300 bg-gray-100 text-gray-500";
      break;
    case "예정":
      cls += " border-[#FF6B00] bg-white text-[#FF6B00]";
      break;
    case "D-DAY":
      cls += " border-[#FF6B00] bg-[#FF6B00] text-white";
      break;
    case "선거일":
      cls += " border-red-500 bg-red-500 text-white";
      break;
    default:
      cls += " border-gray-300 bg-white text-gray-600";
  }
  return <span className={cls}>{label}</span>;
}
