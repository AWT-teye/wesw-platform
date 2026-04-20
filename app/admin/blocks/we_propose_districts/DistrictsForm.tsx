"use client";

import { useState, useTransition } from "react";
import { upsertProposeDistricts } from "./actions";

export default function DistrictsForm({
  initialList,
}: {
  initialList: string[];
}) {
  const [items, setItems] = useState<string[]>(
    initialList.length > 0 ? initialList : [""]
  );
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");

  function updateAt(i: number, v: string) {
    setItems((prev) => prev.map((p, idx) => (idx === i ? v : p)));
  }
  function removeAt(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }
  function add() {
    setItems((prev) => [...prev, ""]);
  }
  function moveUp(i: number) {
    if (i === 0) return;
    setItems((prev) => {
      const next = [...prev];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return next;
    });
  }
  function moveDown(i: number) {
    setItems((prev) => {
      if (i >= prev.length - 1) return prev;
      const next = [...prev];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return next;
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    startTransition(async () => {
      const r = await upsertProposeDistricts(items);
      setMsg("error" in r && r.error ? `오류: ${r.error}` : "저장되었습니다.");
    });
  }

  function resetDefault() {
    setItems(["장안구", "권선구", "팔달구", "영통구", "기타"]);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-gray-200 bg-white p-6"
    >
      <div className="mb-3 flex items-center justify-between">
        <label className="text-sm font-semibold">거주지역 목록</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={resetDefault}
            className="rounded border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
          >
            초기값 복원
          </button>
          <button
            type="button"
            onClick={add}
            className="rounded bg-[#FF6B00] px-3 py-1 text-xs font-bold text-white hover:opacity-90"
          >
            + 추가
          </button>
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {items.map((val, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="w-6 text-center text-xs text-gray-400">
              {i + 1}
            </span>
            <input
              value={val}
              onChange={(e) => updateAt(i, e.target.value)}
              placeholder="예: 장안구"
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => moveUp(i)}
              disabled={i === 0}
              className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-30"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => moveDown(i)}
              disabled={i === items.length - 1}
              className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-30"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
            >
              삭제
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-gray-500">
        ※ /we/propose 페이지의 거주지역 선택 버튼으로 노출됩니다. 추가·삭제·순서
        변경 가능.
      </p>

      {msg && (
        <p className="mt-4 rounded border border-gray-200 bg-gray-50 p-2 text-xs">
          {msg}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 rounded-md bg-[#FF6B00] px-5 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "저장 중..." : "저장"}
      </button>
    </form>
  );
}
