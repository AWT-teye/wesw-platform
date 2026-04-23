"use client";

import { useState, useTransition } from "react";
import { saveSnsLinks, type SnsLinksInput } from "./actions";

const FIELDS: { key: keyof SnsLinksInput; label: string; placeholder: string }[] = [
  { key: "sns_naver", label: "네이버 블로그", placeholder: "https://blog.naver.com/..." },
  { key: "sns_instagram", label: "인스타그램", placeholder: "https://instagram.com/..." },
  { key: "sns_facebook", label: "페이스북", placeholder: "https://facebook.com/..." },
  { key: "sns_youtube_channel", label: "유튜브 채널", placeholder: "https://youtube.com/@..." },
];

export default function SnsLinksSection({ initial }: { initial: SnsLinksInput }) {
  const [form, setForm] = useState<SnsLinksInput>(initial);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    startTransition(async () => {
      const r = await saveSnsLinks(form);
      setMsg("error" in r && r.error ? `오류: ${r.error}` : "저장되었습니다.");
    });
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold">SNS 링크</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        {FIELDS.map((f) => (
          <label key={f.key} className="block text-sm font-semibold">
            {f.label}
            <input
              value={form[f.key] ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
        ))}

        {msg && <p className="rounded border border-gray-200 bg-gray-50 p-2 text-xs">{msg}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[#FF6B00] px-5 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "저장 중..." : "저장"}
        </button>
      </form>
    </section>
  );
}
