"use client";

import { useState, useTransition } from "react";
import { createPropose } from "./actions";

const MAX_LEN = 500;

export default function ProposeForm({
  districts,
}: {
  districts: string[];
}) {
  const [content, setContent] = useState("");
  const [district, setDistrict] = useState<string>("");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "ok" | "error"; text: string } | null>(
    null
  );

  const len = content.length;
  const over = len > MAX_LEN;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const trimmed = content.trim();
    if (!trimmed) {
      setMsg({ type: "error", text: "내용을 입력해 주세요." });
      return;
    }
    if (trimmed.length > MAX_LEN) {
      setMsg({ type: "error", text: "500자 이내로 작성해 주세요." });
      return;
    }
    if (!district) {
      setMsg({ type: "error", text: "거주지역을 선택해 주세요." });
      return;
    }

    const ok = window.confirm(
      "등록된 제안은 삭제할 수 없습니다.\n등록하시겠습니까?"
    );
    if (!ok) return;

    startTransition(async () => {
      const r = await createPropose({ content: trimmed, district });
      if ("error" in r && r.error) {
        setMsg({ type: "error", text: r.error });
      } else {
        setMsg({ type: "ok", text: "제안이 등록되었습니다. 감사합니다." });
        setContent("");
        setDistrict("");
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-gray-200 bg-white p-5 md:p-6"
    >
      <h2 className="mb-4 text-lg font-extrabold md:text-xl">공약 제안하기</h2>

      <label className="block text-sm font-semibold" htmlFor="propose-district">
        거주지역
      </label>
      <div id="propose-district" className="mt-2 flex flex-wrap gap-2">
        {districts.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDistrict(d)}
            className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
              district === d
                ? "border-[#FF6B00] bg-[#FF6B00] text-white"
                : "border-gray-300 bg-white text-gray-600 hover:border-[#FF6B00] hover:text-[#FF6B00]"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <label
        className="mt-5 block text-sm font-semibold"
        htmlFor="propose-content"
      >
        제안 내용 (500자 이내)
      </label>
      <textarea
        id="propose-content"
        rows={4}
        maxLength={MAX_LEN + 20}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="수원을 위한 정책 제안을 500자 이내로 정중히 작성해 주세요."
        className={`mt-2 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
          over
            ? "border-red-500 focus:ring-red-300"
            : "border-gray-300 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
        }`}
      />
      <div className="mt-1 flex items-center justify-between text-xs">
        <span className="text-gray-500">등록 후에는 삭제할 수 없습니다.</span>
        <span className={over ? "font-bold text-red-600" : "text-gray-500"}>
          {len} / {MAX_LEN}
        </span>
      </div>

      {msg && (
        <p
          className={`mt-4 rounded border p-2 text-xs ${
            msg.type === "ok"
              ? "border-green-300 bg-green-50 text-green-700"
              : "border-red-300 bg-red-50 text-red-700"
          }`}
        >
          {msg.text}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || over || !content.trim() || !district}
        className="mt-5 w-full rounded-md bg-[#FF6B00] px-5 py-3 text-sm font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 md:w-auto md:px-8"
      >
        {pending ? "등록 중..." : "제안 등록"}
      </button>
    </form>
  );
}
