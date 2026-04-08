"use client";

import { useState, useTransition } from "react";
import { saveCandidate, type CandidateInput } from "./actions";

export default function CandidateForm({ initial }: { initial: CandidateInput }) {
  const [form, setForm] = useState<CandidateInput>(initial);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");

  function up<K extends keyof CandidateInput>(k: K, v: CandidateInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    startTransition(async () => {
      const r = await saveCandidate(form);
      setMsg("error" in r && r.error ? `오류: ${r.error}` : "저장되었습니다.");
    });
  }

  const input = "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm";

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-gray-200 bg-white p-6">
      <Field label="이름"><input value={form.name} onChange={(e) => up("name", e.target.value)} className={input} /></Field>
      <Field label="직급">
        <select value={form.position_type} onChange={(e) => up("position_type", e.target.value as CandidateInput["position_type"])} className={input}>
          <option value="mayor">시장</option>
          <option value="city_council">시의원</option>
          <option value="provincial_council">도의원</option>
          <option value="proportional">비례대표</option>
        </select>
      </Field>
      <Field label="지역구"><input value={form.district} onChange={(e) => up("district", e.target.value)} className={input} /></Field>
      <Field label="사진 URL"><input value={form.photo_url} onChange={(e) => up("photo_url", e.target.value)} className={input} /></Field>
      <Field label="슬로건 (한 줄)"><input value={form.slogan} onChange={(e) => up("slogan", e.target.value)} className={input} /></Field>
      <Field label="비전"><textarea rows={3} value={form.vision} onChange={(e) => up("vision", e.target.value)} className={input} /></Field>
      <Field label="소개 (bio)"><textarea rows={5} value={form.bio} onChange={(e) => up("bio", e.target.value)} className={input} /></Field>
      <Field label="출마선언문"><textarea rows={5} value={form.declaration} onChange={(e) => up("declaration", e.target.value)} className={input} /></Field>
      <Field label="선거사무소 정보"><textarea rows={3} value={form.office_info} onChange={(e) => up("office_info", e.target.value)} className={input} /></Field>

      {msg && <p className="mt-4 rounded border border-gray-200 bg-gray-50 p-2 text-xs">{msg}</p>}

      <button type="submit" disabled={pending} className="mt-6 rounded-md bg-[#FF6B00] px-5 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">
        {pending ? "저장 중..." : "저장"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="mt-4 block text-sm font-semibold first:mt-0">{label}{children}</label>;
}
