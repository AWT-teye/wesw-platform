"use client";

import { useState, useTransition } from "react";
import { upsertBlock } from "./actions";

export default function BlockForm({
  slug,
  initialTitle,
  initialBody,
}: {
  slug: string;
  initialTitle: string;
  initialBody: string;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    startTransition(async () => {
      const r = await upsertBlock(slug, title, body);
      setMsg("error" in r && r.error ? `오류: ${r.error}` : "저장되었습니다.");
    });
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-gray-200 bg-white p-6">
      <label className="block text-sm font-semibold">
        제목
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="mt-4 block text-sm font-semibold">
        본문 (HTML)
        <textarea
          rows={10}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-xs"
        />
        <span className="mt-1 block text-xs text-gray-500">
          ※ 추후 Tiptap 리치텍스트 에디터로 교체 예정. 현재는 HTML 직접 입력 (예: &lt;p&gt;텍스트&lt;/p&gt;, &lt;br/&gt;, &lt;strong&gt;강조&lt;/strong&gt;)
        </span>
      </label>

      <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-4">
        <p className="mb-2 text-xs font-semibold text-gray-600">미리보기</p>
        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: body }} />
      </div>

      {msg && <p className="mt-4 rounded border border-gray-200 bg-gray-50 p-2 text-xs">{msg}</p>}

      <button type="submit" disabled={pending} className="mt-6 rounded-md bg-[#FF6B00] px-5 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">
        {pending ? "저장 중..." : "저장"}
      </button>
    </form>
  );
}
