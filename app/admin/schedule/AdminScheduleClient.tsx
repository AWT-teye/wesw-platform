"use client";

import { useState, useTransition } from "react";
import {
  createCandidateSchedule,
  createElectionSchedule,
  deleteCandidateSchedule,
  deleteElectionSchedule,
  toggleCandidateScheduleVisible,
  toggleElectionPastHidden,
  updateCandidateSchedule,
  updateElectionSchedule,
} from "./actions";

export type AdminCandidateSchedule = {
  id: string;
  title: string;
  subtitle: string | null;
  scheduled_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  content: string | null;
  extra: string | null;
  is_visible: boolean;
};

export type AdminElectionSchedule = {
  id: string;
  title: string;
  scheduled_date: string;
  end_date: string | null;
  description: string | null;
  badge_label: string | null;
  display_order: number;
  is_visible: boolean;
  is_past_hidden: boolean;
};

type FormState = {
  id: string | null;
  scheduled_date: string;
  subtitle: string;
  title: string;
  start_time: string;
  end_time: string;
  location: string;
  content: string;
  extra: string;
  is_visible: boolean;
};

const EMPTY_FORM: FormState = {
  id: null,
  scheduled_date: "",
  subtitle: "",
  title: "",
  start_time: "",
  end_time: "",
  location: "",
  content: "",
  extra: "",
  is_visible: true,
};

function shortTime(t: string | null): string {
  if (!t) return "";
  const m = t.match(/^(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : t;
}

export default function AdminScheduleClient({
  candidateSchedules,
  electionSchedules,
}: {
  candidateSchedules: AdminCandidateSchedule[];
  electionSchedules: AdminElectionSchedule[];
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const editing = form.id !== null;

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setMsg(null);
    setErr(null);
  };

  const loadRow = (row: AdminCandidateSchedule) => {
    setForm({
      id: row.id,
      scheduled_date: row.scheduled_date,
      subtitle: row.subtitle ?? "",
      title: row.title,
      start_time: shortTime(row.start_time),
      end_time: shortTime(row.end_time),
      location: row.location ?? "",
      content: row.content ?? "",
      extra: row.extra ?? "",
      is_visible: row.is_visible,
    });
    setMsg(null);
    setErr(null);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    const payload = {
      id: form.id ?? undefined,
      scheduled_date: form.scheduled_date,
      subtitle: form.subtitle,
      title: form.title,
      start_time: form.start_time,
      end_time: form.end_time,
      location: form.location,
      content: form.content,
      extra: form.extra,
      is_visible: form.is_visible,
    };

    startTransition(async () => {
      const res = editing
        ? await updateCandidateSchedule(payload)
        : await createCandidateSchedule(payload);
      if ("error" in res && res.error) {
        setErr(res.error);
      } else {
        setMsg(editing ? "수정되었습니다." : "등록되었습니다.");
        resetForm();
      }
    });
  };

  const onToggle = (id: string, next: boolean) => {
    startTransition(async () => {
      const res = await toggleCandidateScheduleVisible(id, next);
      if ("error" in res && res.error) setErr(res.error);
    });
  };

  const onDelete = (id: string) => {
    if (!window.confirm("이 일정을 삭제하시겠습니까?")) return;
    startTransition(async () => {
      const res = await deleteCandidateSchedule(id);
      if ("error" in res && res.error) setErr(res.error);
    });
  };

  return (
    <div className="space-y-12">
      {/* 섹션 1 — 후보 일정 */}
      <section>
        <h2 className="text-xl font-extrabold">후보 일정</h2>
        <p className="mt-1 text-sm text-gray-500">
          캘린더에 노출될 후보 공개 일정입니다.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <h3 className="text-sm font-bold text-gray-900">
            {editing ? "일정 수정" : "일정 추가"}
          </h3>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="날짜 *">
              <input
                type="date"
                required
                value={form.scheduled_date}
                onChange={(e) =>
                  setForm((s) => ({ ...s, scheduled_date: e.target.value }))
                }
                className="input"
              />
            </Field>

            <Field label="소제목 (달력 셀에 표시)">
              <input
                type="text"
                value={form.subtitle}
                placeholder="예: 현장방문"
                onChange={(e) =>
                  setForm((s) => ({ ...s, subtitle: e.target.value }))
                }
                className="input"
              />
            </Field>

            <Field label="제목 *" full>
              <input
                type="text"
                required
                value={form.title}
                placeholder="예: 수원역 앞 시민 만남의 시간"
                onChange={(e) =>
                  setForm((s) => ({ ...s, title: e.target.value }))
                }
                className="input"
              />
            </Field>

            <Field label="시작시간">
              <input
                type="time"
                value={form.start_time}
                onChange={(e) =>
                  setForm((s) => ({ ...s, start_time: e.target.value }))
                }
                className="input"
              />
            </Field>

            <Field label="종료시간">
              <input
                type="time"
                value={form.end_time}
                onChange={(e) =>
                  setForm((s) => ({ ...s, end_time: e.target.value }))
                }
                className="input"
              />
            </Field>

            <Field label="장소" full>
              <input
                type="text"
                value={form.location}
                placeholder="예: 수원역 1번 출구 광장"
                onChange={(e) =>
                  setForm((s) => ({ ...s, location: e.target.value }))
                }
                className="input"
              />
            </Field>

            <Field label="내용" full>
              <textarea
                rows={4}
                value={form.content}
                onChange={(e) =>
                  setForm((s) => ({ ...s, content: e.target.value }))
                }
                className="input"
              />
            </Field>

            <Field label="기타" full>
              <textarea
                rows={2}
                value={form.extra}
                placeholder="우천 시 일정 변경 가능 등"
                onChange={(e) =>
                  setForm((s) => ({ ...s, extra: e.target.value }))
                }
                className="input"
              />
            </Field>

            <Field label="노출 여부" full>
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_visible}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, is_visible: e.target.checked }))
                  }
                  className="h-4 w-4"
                />
                <span>활성화 (끄면 /we/schedule에 노출되지 않음)</span>
              </label>
            </Field>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-[#FF6B00] px-5 py-2 text-sm font-bold text-white hover:bg-[#e55f00] disabled:opacity-50"
            >
              {editing ? "수정 저장" : "추가"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                취소 (새로 등록)
              </button>
            )}
            {msg && <span className="text-xs text-green-600">{msg}</span>}
            {err && <span className="text-xs text-red-600">{err}</span>}
          </div>
        </form>

        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-bold uppercase text-gray-500">
              <tr>
                <th className="px-3 py-2">날짜</th>
                <th className="px-3 py-2">소제목</th>
                <th className="px-3 py-2">제목</th>
                <th className="px-3 py-2">장소</th>
                <th className="px-3 py-2">노출</th>
                <th className="px-3 py-2 text-right">동작</th>
              </tr>
            </thead>
            <tbody>
              {candidateSchedules.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-8 text-center text-xs text-gray-400"
                  >
                    등록된 일정이 없습니다.
                  </td>
                </tr>
              )}
              {candidateSchedules.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td
                    className="cursor-pointer px-3 py-2 font-mono text-xs text-gray-700"
                    onClick={() => loadRow(r)}
                  >
                    {r.scheduled_date}
                  </td>
                  <td
                    className="cursor-pointer px-3 py-2 text-xs text-[#FF6B00]"
                    onClick={() => loadRow(r)}
                  >
                    {r.subtitle ?? "-"}
                  </td>
                  <td
                    className="cursor-pointer px-3 py-2 font-semibold"
                    onClick={() => loadRow(r)}
                  >
                    {r.title}
                  </td>
                  <td
                    className="cursor-pointer px-3 py-2 text-xs text-gray-600"
                    onClick={() => loadRow(r)}
                  >
                    {r.location ?? "-"}
                  </td>
                  <td className="px-3 py-2">
                    <label className="inline-flex cursor-pointer items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={r.is_visible}
                        onChange={(e) => onToggle(r.id, e.target.checked)}
                        disabled={pending}
                      />
                      <span>{r.is_visible ? "ON" : "OFF"}</span>
                    </label>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right text-xs">
                    <button
                      type="button"
                      onClick={() => loadRow(r)}
                      className="mr-2 rounded border border-gray-300 px-2 py-1 font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(r.id)}
                      disabled={pending}
                      className="rounded border border-red-300 px-2 py-1 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 섹션 2 — 선거 공식 일정 */}
      <section>
        <h2 className="text-xl font-extrabold">선거 공식 일정</h2>
        <p className="mt-1 text-sm text-gray-500">
          우측 타임라인 패널에 표시됩니다. 지난 일정은 자동 감지되며 &quot;숨김
          처리&quot; 토글로 흐리게 표시할 수 있습니다.
        </p>

        <ElectionCreateForm />

        <div className="orange-scroll mt-5 max-h-[600px] overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="space-y-3">
            {electionSchedules.length === 0 && (
              <p className="py-8 text-center text-xs text-gray-400">
                등록된 선거 일정이 없습니다.
              </p>
            )}
            {electionSchedules.map((e) => (
              <ElectionRow key={e.id} row={e} />
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .input {
          display: block;
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #d1d5db;
          background: #fff;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: #111827;
          outline: none;
        }
        .input:focus {
          border-color: #FF6B00;
          box-shadow: 0 0 0 2px rgba(255, 107, 0, 0.15);
        }
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

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={full ? "md:col-span-2" : ""}>
      <span className="mb-1 block text-xs font-bold text-gray-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function todayYMD(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}-${m < 10 ? `0${m}` : m}-${day < 10 ? `0${day}` : day}`;
}

function isPastEnd(endYMD: string | null, startYMD: string): boolean {
  const target = endYMD ?? startYMD;
  return target < todayYMD();
}

function ElectionCreateForm() {
  const [title, setTitle] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [badgeLabel, setBadgeLabel] = useState<
    "" | "완료" | "예정" | "D-DAY" | "선거일"
  >("예정");
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const reset = () => {
    setTitle("");
    setScheduledDate("");
    setEndDate("");
    setDescription("");
    setBadgeLabel("예정");
    setDisplayOrder(0);
    setIsVisible(true);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    startTransition(async () => {
      const res = await createElectionSchedule({
        title,
        scheduled_date: scheduledDate,
        end_date: endDate || null,
        description,
        badge_label: badgeLabel || null,
        display_order: Number(displayOrder) || 0,
        is_visible: isVisible,
        is_past_hidden: false,
      });
      if ("error" in res && res.error) {
        setErr(res.error);
      } else {
        setMsg("등록되었습니다.");
        reset();
      }
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="mt-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <h3 className="text-sm font-bold text-gray-900">선거 일정 추가</h3>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-6">
        <label className="md:col-span-3">
          <span className="mb-1 block text-xs font-bold text-gray-700">
            제목 *
          </span>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="예: 투표소 공고"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-bold text-gray-700">
            badge
          </span>
          <select
            value={badgeLabel}
            onChange={(e) =>
              setBadgeLabel(
                e.target.value as "" | "완료" | "예정" | "D-DAY" | "선거일"
              )
            }
            className="input"
          >
            <option value="">없음</option>
            <option value="완료">완료</option>
            <option value="예정">예정</option>
            <option value="D-DAY">D-DAY</option>
            <option value="선거일">선거일</option>
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs font-bold text-gray-700">
            순서
          </span>
          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(Number(e.target.value))}
            className="input"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-bold text-gray-700">
            노출
          </span>
          <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
            />
            {isVisible ? "ON" : "OFF"}
          </label>
        </label>

        <label className="md:col-span-2">
          <span className="mb-1 block text-xs font-bold text-gray-700">
            시작날짜 *
          </span>
          <input
            type="date"
            required
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="input"
          />
        </label>
        <label className="md:col-span-2">
          <span className="mb-1 block text-xs font-bold text-gray-700">
            종료날짜 (선택)
          </span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input"
            placeholder="비우면 시작날짜와 동일"
          />
        </label>

        <label className="md:col-span-6">
          <span className="mb-1 block text-xs font-bold text-gray-700">
            설명
          </span>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input"
          />
        </label>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[#FF6B00] px-5 py-2 text-sm font-bold text-white hover:bg-[#e55f00] disabled:opacity-50"
        >
          추가
        </button>
        {msg && <span className="text-xs text-green-600">{msg}</span>}
        {err && <span className="text-xs text-red-600">{err}</span>}
      </div>
    </form>
  );
}

function ElectionRow({ row }: { row: AdminElectionSchedule }) {
  const [form, setForm] = useState({
    title: row.title,
    scheduled_date: row.scheduled_date,
    end_date: row.end_date ?? "",
    description: row.description ?? "",
    badge_label: row.badge_label ?? "",
    display_order: row.display_order,
    is_visible: row.is_visible,
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const past = isPastEnd(row.end_date, row.scheduled_date);

  const onSave = () => {
    setMsg(null);
    setErr(null);
    startTransition(async () => {
      const res = await updateElectionSchedule({
        id: row.id,
        title: form.title,
        scheduled_date: form.scheduled_date,
        end_date: form.end_date || null,
        description: form.description,
        badge_label: form.badge_label,
        display_order: Number(form.display_order) || 0,
        is_visible: form.is_visible,
        is_past_hidden: row.is_past_hidden,
      });
      if ("error" in res && res.error) setErr(res.error);
      else setMsg("저장되었습니다.");
    });
  };

  const onTogglePastHidden = (next: boolean) => {
    startTransition(async () => {
      const res = await toggleElectionPastHidden(row.id, next);
      if ("error" in res && res.error) setErr(res.error);
    });
  };

  const onDelete = () => {
    if (!window.confirm("이 선거 일정을 삭제하시겠습니까?")) return;
    startTransition(async () => {
      const res = await deleteElectionSchedule(row.id);
      if ("error" in res && res.error) setErr(res.error);
    });
  };

  return (
    <div
      className={[
        "rounded-xl border p-4 shadow-sm transition",
        past
          ? "border-gray-200 bg-gray-100"
          : "border-gray-200 bg-white",
      ].join(" ")}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {past && (
            <span className="rounded-full bg-gray-400 px-2 py-0.5 text-[10px] font-bold text-white">
              지난 일정
            </span>
          )}
          {row.badge_label && (
            <span className="rounded-full border border-gray-300 bg-white px-2 py-0.5 text-[10px] font-bold text-gray-700">
              {row.badge_label}
            </span>
          )}
          <span className="text-[11px] text-gray-500">#{row.display_order}</span>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-gray-600">
          <input
            type="checkbox"
            checked={row.is_past_hidden}
            onChange={(e) => onTogglePastHidden(e.target.checked)}
            disabled={pending}
          />
          숨김 처리
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
        <label className="md:col-span-2">
          <span className="mb-1 block text-xs font-bold text-gray-700">
            제목
          </span>
          <input
            type="text"
            value={form.title}
            onChange={(e) =>
              setForm((s) => ({ ...s, title: e.target.value }))
            }
            className="input"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-bold text-gray-700">
            시작날짜
          </span>
          <input
            type="date"
            value={form.scheduled_date}
            onChange={(e) =>
              setForm((s) => ({ ...s, scheduled_date: e.target.value }))
            }
            className="input"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-bold text-gray-700">
            종료날짜
          </span>
          <input
            type="date"
            value={form.end_date}
            onChange={(e) =>
              setForm((s) => ({ ...s, end_date: e.target.value }))
            }
            className="input"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-bold text-gray-700">
            badge
          </span>
          <select
            value={form.badge_label ?? ""}
            onChange={(e) =>
              setForm((s) => ({ ...s, badge_label: e.target.value }))
            }
            className="input"
          >
            <option value="">없음</option>
            <option value="완료">완료</option>
            <option value="예정">예정</option>
            <option value="D-DAY">D-DAY</option>
            <option value="선거일">선거일</option>
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs font-bold text-gray-700">
            순서
          </span>
          <input
            type="number"
            value={form.display_order}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                display_order: Number(e.target.value),
              }))
            }
            className="input"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-bold text-gray-700">
            노출
          </span>
          <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_visible}
              onChange={(e) =>
                setForm((s) => ({ ...s, is_visible: e.target.checked }))
              }
            />
            {form.is_visible ? "ON" : "OFF"}
          </label>
        </label>

        <label className="md:col-span-6">
          <span className="mb-1 block text-xs font-bold text-gray-700">
            설명
          </span>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) =>
              setForm((s) => ({ ...s, description: e.target.value }))
            }
            className="input"
          />
        </label>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={pending}
          className="rounded-md bg-[#FF6B00] px-4 py-2 text-sm font-bold text-white hover:bg-[#e55f00] disabled:opacity-50"
        >
          저장
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          삭제
        </button>
        {msg && <span className="text-xs text-green-600">{msg}</span>}
        {err && <span className="text-xs text-red-600">{err}</span>}
      </div>
    </div>
  );
}
