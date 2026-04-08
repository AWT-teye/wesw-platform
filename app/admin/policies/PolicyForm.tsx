"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createPolicy, updatePolicy, type PolicyInput } from "./actions";

type ParentOption = { id: string; title: string; level: number };

export default function PolicyForm({
  level,
  parents,
  initial,
}: {
  level: number;
  parents: ParentOption[];
  initial?: Partial<PolicyInput> & { id?: string };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [form, setForm] = useState<PolicyInput>({
    id: initial?.id,
    level,
    parent_id: initial?.parent_id ?? null,
    title: initial?.title ?? "",
    content: initial?.content ?? "",
    display_order: initial?.display_order ?? 0,
    is_active: initial?.is_active ?? true,
  });

  function up<K extends keyof PolicyInput>(k: K, v: PolicyInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const r = form.id ? await updatePolicy(form) : await createPolicy(form);
      if ("error" in r && r.error) return setError(r.error);
      router.push(`/admin/policies?level=${level}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-gray-200 bg-white p-6">
      {level > 1 && (
        <label className="block text-sm font-semibold">
          상위 공약 (level {level - 1})
          <select
            value={form.parent_id ?? ""}
            onChange={(e) => up("parent_id", e.target.value || null)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">— 없음 —</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </label>
      )}

      <label className="mt-4 block text-sm font-semibold">
        제목 *
        <input required value={form.title} onChange={(e) => up("title", e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </label>

      <label className="mt-4 block text-sm font-semibold">
        본문
        <textarea rows={6} value={form.content} onChange={(e) => up("content", e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </label>

      <label className="mt-4 block text-sm font-semibold">
        표시 순서
        <input type="number" value={form.display_order} onChange={(e) => up("display_order", Number(e.target.value))} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </label>

      <label className="mt-4 flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" checked={form.is_active} onChange={(e) => up("is_active", e.target.checked)} />
        노출(활성화)
      </label>

      {error && <p className="mt-4 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700">{error}</p>}

      <div className="mt-6 flex gap-3">
        <button type="submit" disabled={pending} className="rounded-md bg-[#FF6B00] px-5 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">
          {pending ? "저장 중..." : form.id ? "수정 저장" : "등록"}
        </button>
        <button type="button" onClick={() => router.back()} className="rounded-md border border-gray-300 px-5 py-2 text-sm font-semibold hover:bg-gray-50">취소</button>
      </div>
    </form>
  );
}
