"use client";

import { useState, useTransition } from "react";
import { createFactCheck } from "./actions";

export default function FactCheckForm() {
  const [type, setType] = useState<"refute" | "expose" | "critique">("refute");
  const [claim, setClaim] = useState("");
  const [truth, setTruth] = useState("");
  const [source, setSource] = useState("");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!claim.trim() || !truth.trim()) {
      setMsg("상대 주장과 팩트는 필수입니다.");
      return;
    }
    setMsg("");
    startTransition(async () => {
      const r = await createFactCheck({ type, claim, truth, source });
      if ("error" in r && r.error) {
        setMsg(`오류: ${r.error}`);
      } else {
        setMsg("등록되었습니다.");
        setClaim("");
        setTruth("");
        setSource("");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-extrabold">새 팩트체크 등록</h2>

      <label className="block text-sm font-semibold mb-1">유형</label>
      <div className="flex gap-2 mb-4">
        {([
          ["refute", "주장반박", "bg-red-600"],
          ["expose", "데이터폭로", "bg-[#FF6B00]"],
          ["critique", "정책비판", "bg-blue-600"],
        ] as const).map(([val, label, color]) => (
          <button
            key={val}
            type="button"
            onClick={() => setType(val)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
              type === val
                ? `${color} text-white`
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <label className="block text-sm font-semibold">
        상대 주장
        <textarea
          rows={2}
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          placeholder="상대가 한 주장을 입력하세요"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="mt-3 block text-sm font-semibold">
        팩트 (반박/폭로/비판)
        <textarea
          rows={3}
          value={truth}
          onChange={(e) => setTruth(e.target.value)}
          placeholder="데이터에 기반한 팩트를 입력하세요"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="mt-3 block text-sm font-semibold">
        출처
        <input
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="예: 통계청 2026.01, 수원시 결산서"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </label>

      {msg && <p className="mt-4 rounded border border-gray-200 bg-gray-50 p-2 text-xs">{msg}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 rounded-md bg-[#FF6B00] px-5 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "등록 중..." : "등록 (즉시 게시)"}
      </button>
    </form>
  );
}
