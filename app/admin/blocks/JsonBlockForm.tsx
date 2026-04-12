"use client";

import { useState, useTransition } from "react";
import { upsertBlock } from "./actions";

const EXAMPLES: Record<string, string> = {
  we_crisis_stats: JSON.stringify(
    [
      { label: "재정자립도", value: "37.8", unit: "%", sub: "2000년 89%에서 추락", source: "이투데이 2025.11" },
      { label: "사회복지예산", value: "40", unit: "%+", sub: "산업예산 단 1.5%", source: "2024년 수원시 세출" },
      { label: "청년층 고용률", value: "43.6", unit: "%", sub: "21개월 연속 하락", source: "통계청 2026.01" },
      { label: "고령화율", value: "15.49", unit: "%", sub: "2022년 12.35%에서 급등", source: "G.ECONOMY 2025.03" },
      { label: "1인가구 비율", value: "40.71", unit: "%", sub: "221,066가구", source: "수원시정연구원" },
      { label: "경제성장률", value: "-10.8", unit: "%", sub: "경기도 내 최하위", source: "2020년 기준" },
    ],
    null,
    2
  ),
  we_opportunity_cycle: JSON.stringify(
    [
      { label: "기회부재" },
      { label: "인재유출" },
      { label: "기업약화" },
      { label: "세입붕괴" },
      { label: "투자불능" },
      { label: "사회해체" },
    ],
    null,
    2
  ),
};

export default function JsonBlockForm({
  slug,
  initialBody,
}: {
  slug: string;
  initialBody: string;
}) {
  const [body, setBody] = useState(initialBody || EXAMPLES[slug] || "[]");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");
  const [jsonError, setJsonError] = useState("");

  function validate(val: string) {
    try {
      JSON.parse(val);
      setJsonError("");
    } catch (e) {
      setJsonError("JSON 형식 오류: " + (e as Error).message);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      JSON.parse(body);
    } catch {
      setMsg("JSON 형식이 올바르지 않습니다.");
      return;
    }
    setMsg("");
    startTransition(async () => {
      const r = await upsertBlock(slug, slug, body);
      setMsg("error" in r && r.error ? `오류: ${r.error}` : "저장되었습니다.");
    });
  }

  function handleFormat() {
    try {
      const parsed = JSON.parse(body);
      setBody(JSON.stringify(parsed, null, 2));
      setJsonError("");
    } catch (e) {
      setJsonError("JSON 형식 오류: " + (e as Error).message);
    }
  }

  function handleReset() {
    const example = EXAMPLES[slug] || "[]";
    setBody(example);
    setJsonError("");
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold">JSON 데이터</label>
        <div className="flex gap-2">
          <button type="button" onClick={handleFormat} className="rounded border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50">
            포맷팅
          </button>
          <button type="button" onClick={handleReset} className="rounded border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50">
            초기값 복원
          </button>
        </div>
      </div>

      <textarea
        rows={18}
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          validate(e.target.value);
        }}
        className={`w-full rounded-md border px-3 py-2 font-mono text-xs ${jsonError ? "border-red-400 bg-red-50" : "border-gray-300"}`}
      />

      {jsonError && <p className="mt-1 text-xs text-red-500">{jsonError}</p>}

      <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-4">
        <p className="mb-2 text-xs font-semibold text-gray-600">미리보기</p>
        <pre className="max-h-40 overflow-auto text-xs text-gray-700 whitespace-pre-wrap">
          {(() => {
            try {
              return JSON.stringify(JSON.parse(body), null, 2);
            } catch {
              return "JSON 파싱 실패";
            }
          })()}
        </pre>
      </div>

      {msg && <p className="mt-4 rounded border border-gray-200 bg-gray-50 p-2 text-xs">{msg}</p>}

      <button
        type="submit"
        disabled={pending || !!jsonError}
        className="mt-6 rounded-md bg-[#FF6B00] px-5 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "저장 중..." : "저장"}
      </button>
    </form>
  );
}
