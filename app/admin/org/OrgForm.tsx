"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createOrg, updateOrg, type OrgInput } from "./actions";

export default function OrgForm({ initial }: { initial?: Partial<OrgInput> & { id?: string } }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [form, setForm] = useState<OrgInput>({
    id: initial?.id,
    chart_type: (initial?.chart_type as "party" | "election") ?? "election",
    name: initial?.name ?? "",
    position: initial?.position ?? "",
    department: initial?.department ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    photo_url: initial?.photo_url ?? "",
    display_order: initial?.display_order ?? 0,
    is_active: initial?.is_active ?? true,
  });

  function up<K extends keyof OrgInput>(k: K, v: OrgInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const r = form.id ? await updateOrg(form) : await createOrg(form);
      if ("error" in r && r.error) return setError(r.error);
      router.push("/admin/org");
      router.refresh();
    });
  }

  const input = "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm";

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-gray-200 bg-white p-6">
      <Field label="구분">
        <select value={form.chart_type} onChange={(e) => up("chart_type", e.target.value as "party" | "election")} className={input}>
          <option value="election">선거 캠프</option>
          <option value="party">수원시당</option>
        </select>
      </Field>
      <Field label="이름 *"><input required value={form.name} onChange={(e) => up("name", e.target.value)} className={input} /></Field>
      <Field label="직책 *"><input required value={form.position} onChange={(e) => up("position", e.target.value)} className={input} /></Field>
      <Field label="부서"><input value={form.department} onChange={(e) => up("department", e.target.value)} className={input} /></Field>
      <Field label="전화"><input value={form.phone} onChange={(e) => up("phone", e.target.value)} className={input} /></Field>
      <Field label="이메일"><input value={form.email} onChange={(e) => up("email", e.target.value)} className={input} /></Field>
      <Field label="사진 URL"><input value={form.photo_url} onChange={(e) => up("photo_url", e.target.value)} className={input} /></Field>
      <Field label="표시 순서"><input type="number" value={form.display_order} onChange={(e) => up("display_order", Number(e.target.value))} className={input} /></Field>

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="mt-4 block text-sm font-semibold first:mt-0">{label}{children}</label>;
}
