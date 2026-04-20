"use client";

import { useState, useTransition } from "react";
import { upsertProposeIntro } from "./actions";

export default function ProposeIntroForm({
  initialTitle,
  initialSubtitle,
  initialWarning,
}: {
  initialTitle: string;
  initialSubtitle: string;
  initialWarning: string;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [warning, setWarning] = useState(initialWarning);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    startTransition(async () => {
      const r = await upsertProposeIntro({ title, subtitle, warning });
      setMsg("error" in r && r.error ? `오류: ${r.error}` : "저장되었습니다.");
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-gray-200 bg-white p-6"
    >
      <label className="block text-sm font-semibold">
        제목
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="시민 공약제안"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="mt-4 block text-sm font-semibold">
        부제
        <textarea
          rows={2}
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="수원의 가능성을 함께 만들어 갑니다. 당신의 아이디어를 들려주세요."
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="mt-4 block text-sm font-semibold">
        선거법 경고문 (레드박스 노출)
        <textarea
          rows={4}
          value={warning}
          onChange={(e) => setWarning(e.target.value)}
          placeholder="타 후보 비방, 허위사실 유포 등 공직선거법 위반 게시물은 즉시 삭제되며..."
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <span className="mt-1 block text-xs text-gray-500">
          ※ /we/propose 페이지 상단 빨간 박스에 표시됩니다.
        </span>
      </label>

      <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-4">
        <p className="mb-2 text-xs font-semibold text-gray-600">미리보기</p>
        <p className="text-xs font-semibold text-[#FF6B00]">PROPOSE</p>
        <p className="mt-1 text-lg font-extrabold">{title || "(제목)"}</p>
        <p className="mt-1 text-xs text-gray-600">{subtitle || "(부제)"}</p>
        <div className="mt-3 rounded border-2 border-red-600 bg-red-50 p-3 text-xs text-red-700">
          <p className="font-bold">⚠️ 선거법 위반 경고</p>
          <p className="mt-1 whitespace-pre-line">{warning || "(경고문)"}</p>
        </div>
      </div>

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
