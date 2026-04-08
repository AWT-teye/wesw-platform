"use client";

import { useState, useTransition } from "react";
import { saveSns, type SnsLinks } from "../actions";

const FIELDS: { key: keyof SnsLinks; label: string }[] = [
  { key: "youtube", label: "YouTube" },
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "twitter", label: "Twitter / X" },
  { key: "kakao", label: "카카오톡 채널" },
  { key: "discord", label: "Discord" },
];

export default function SnsForm({ initial }: { initial: SnsLinks }) {
  const [links, setLinks] = useState<SnsLinks>(initial);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    startTransition(async () => {
      const r = await saveSns(links);
      setMsg("error" in r && r.error ? `오류: ${r.error}` : "저장되었습니다.");
    });
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-gray-200 bg-white p-6">
      {FIELDS.map((f) => (
        <label key={f.key} className="mt-4 block text-sm font-semibold first:mt-0">
          {f.label}
          <input
            value={links[f.key] ?? ""}
            onChange={(e) => setLinks((l) => ({ ...l, [f.key]: e.target.value }))}
            placeholder="https://..."
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
      ))}

      {msg && <p className="mt-4 rounded border border-gray-200 bg-gray-50 p-2 text-xs">{msg}</p>}

      <button type="submit" disabled={pending} className="mt-6 rounded-md bg-[#FF6B00] px-5 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">
        {pending ? "저장 중..." : "저장"}
      </button>
    </form>
  );
}
