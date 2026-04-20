"use client";

import { useState, useTransition } from "react";
import { upsertPopupBlock } from "./actions";

type Props = {
  initialTitle: string;
  initialBody: string;
  initialButtonText: string;
  initialButtonLink: string;
  initialActive: boolean;
};

export default function PopupBlockForm({
  initialTitle,
  initialBody,
  initialButtonText,
  initialButtonLink,
  initialActive,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [buttonText, setButtonText] = useState(initialButtonText);
  const [buttonLink, setButtonLink] = useState(initialButtonLink);
  const [isActive, setIsActive] = useState(initialActive);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    startTransition(async () => {
      const r = await upsertPopupBlock({
        title,
        body_html: body,
        button_text: buttonText,
        button_link: buttonLink,
        is_active: isActive,
      });
      setMsg("error" in r && r.error ? `오류: ${r.error}` : "저장되었습니다.");
    });
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-gray-200 bg-white p-6">
      {/* 공개/비공개 토글 */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          onClick={() => setIsActive(!isActive)}
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
            isActive ? "bg-[#FF6B00]" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
              isActive ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className="text-sm font-semibold">
          {isActive ? "공개 (팝업 표시)" : "비공개 (팝업 숨김)"}
        </span>
      </div>

      {/* 제목 */}
      <label className="block text-sm font-semibold">
        제목
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="팝업 제목을 입력하세요"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </label>

      {/* 본문 */}
      <label className="mt-4 block text-sm font-semibold">
        본문 (HTML)
        <textarea
          rows={8}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="<p>팝업 본문을 입력하세요</p>"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-xs"
        />
        <span className="mt-1 block text-xs text-gray-500">
          HTML 태그 사용 가능: &lt;p&gt;, &lt;br/&gt;, &lt;strong&gt;, &lt;em&gt; 등
        </span>
      </label>

      {/* 버튼 텍스트 + 링크 */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          버튼 텍스트
          <input
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            placeholder="예: 자세히 보기"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-semibold">
          버튼 링크
          <input
            value={buttonLink}
            onChange={(e) => setButtonLink(e.target.value)}
            placeholder="예: /we/supporters"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      {/* 미리보기 */}
      <div className="mt-6 rounded-md border border-gray-200 bg-gray-50 p-4">
        <p className="mb-3 text-xs font-semibold text-gray-600">팝업 미리보기</p>
        <div className="mx-auto w-full max-w-[320px] rounded-2xl border border-gray-200 bg-white p-5 shadow-lg">
          <h3 className="text-lg font-extrabold text-[#1a1a1a] mb-3">
            {title || "(제목 없음)"}
          </h3>
          <div
            className="prose prose-sm max-w-none text-gray-700 [&_*]:whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: body || "<p>(본문 없음)</p>" }}
          />
          {buttonText && (
            <div className="mt-4 rounded-lg bg-[#FF6B00] py-2.5 text-center text-sm font-bold text-white">
              {buttonText}
            </div>
          )}
        </div>
      </div>

      {msg && (
        <p className={`mt-4 rounded border p-2 text-xs ${
          msg.startsWith("오류") ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"
        }`}>
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
