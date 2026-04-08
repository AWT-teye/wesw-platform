"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createSlide, updateSlide, type SlideInput } from "./actions";

export default function SlideForm({
  initial,
}: {
  initial?: Partial<SlideInput> & { id?: string };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [form, setForm] = useState<SlideInput>({
    id: initial?.id,
    title: initial?.title ?? "",
    subtitle: initial?.subtitle ?? "",
    image_url: initial?.image_url ?? "",
    link_url: initial?.link_url ?? "",
    display_order: initial?.display_order ?? 0,
    is_active: initial?.is_active ?? true,
  });

  function up<K extends keyof SlideInput>(k: K, v: SlideInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const r = form.id ? await updateSlide(form) : await createSlide(form);
      if ("error" in r && r.error) return setError(r.error);
      router.push("/admin/carousel");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-gray-200 bg-white p-6">
      <Field label="제목 *">
        <input required value={form.title} onChange={(e) => up("title", e.target.value)} className={inputCls} />
      </Field>
      <Field label="부제">
        <input value={form.subtitle} onChange={(e) => up("subtitle", e.target.value)} className={inputCls} />
      </Field>
      <Field label="이미지 URL *">
        <input required value={form.image_url} onChange={(e) => up("image_url", e.target.value)} className={inputCls} placeholder="https://..." />
      </Field>
      <Field label="링크 URL">
        <input value={form.link_url} onChange={(e) => up("link_url", e.target.value)} className={inputCls} />
      </Field>
      <Field label="표시 순서">
        <input type="number" value={form.display_order} onChange={(e) => up("display_order", Number(e.target.value))} className={inputCls} />
      </Field>
      <label className="mt-4 flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" checked={form.is_active} onChange={(e) => up("is_active", e.target.checked)} />
        노출(활성화)
      </label>

      {error && <p className="mt-4 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700">{error}</p>}

      <div className="mt-6 flex gap-3">
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? "저장 중..." : form.id ? "수정 저장" : "등록"}
        </button>
        <button type="button" onClick={() => router.back()} className={btnSecondary}>취소</button>
      </div>
    </form>
  );
}

const inputCls = "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none";
const btnPrimary = "rounded-md bg-[#FF6B00] px-5 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50";
const btnSecondary = "rounded-md border border-gray-300 px-5 py-2 text-sm font-semibold hover:bg-gray-50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-4 block text-sm font-semibold first:mt-0">
      {label}
      {children}
    </label>
  );
}
