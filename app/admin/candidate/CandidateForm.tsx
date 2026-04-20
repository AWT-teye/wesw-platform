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
      {/* ─── 기본 정보 ─── */}
      <Section title="기본 정보" />
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
      <Field label="프로필 사진 URL">
        <input value={form.photo_url} onChange={(e) => up("photo_url", e.target.value)} className={input} placeholder="https://..." />
        {form.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.photo_url} alt="미리보기" className="mt-2 h-32 w-auto rounded border border-gray-200 object-cover" />
        )}
      </Field>
      <Field label="슬로건 (한 줄)"><input value={form.slogan} onChange={(e) => up("slogan", e.target.value)} className={input} /></Field>
      <Field label="비전"><textarea rows={3} value={form.vision} onChange={(e) => up("vision", e.target.value)} className={input} /></Field>
      <Field label="소개 (bio)"><textarea rows={5} value={form.bio} onChange={(e) => up("bio", e.target.value)} className={input} /></Field>
      <Field label="출마선언문"><textarea rows={5} value={form.declaration} onChange={(e) => up("declaration", e.target.value)} className={input} /></Field>
      <Field label="선거사무소 정보"><textarea rows={3} value={form.office_info} onChange={(e) => up("office_info", e.target.value)} className={input} /></Field>

      {/* ─── 후보소개 — 인적사항 ─── */}
      <Section title="후보소개 / 인적사항" subtitle="/we/intro 프로필 카드에 표시됩니다." />
      <Field label="직함 (예: 수원특례시장 예비후보 / 개혁신당)">
        <input value={form.profile_title} onChange={(e) => up("profile_title", e.target.value)} className={input} />
      </Field>
      <Field label="생년월일"><input value={form.profile_birth} onChange={(e) => up("profile_birth", e.target.value)} className={input} placeholder="1987년 5월 28일" /></Field>
      <Field label="고향"><input value={form.profile_hometown} onChange={(e) => up("profile_hometown", e.target.value)} className={input} /></Field>
      <Field label="거주지"><input value={form.profile_residence} onChange={(e) => up("profile_residence", e.target.value)} className={input} /></Field>
      <Field label="병역"><input value={form.profile_military} onChange={(e) => up("profile_military", e.target.value)} className={input} /></Field>
      <Field label="선거"><input value={form.profile_election} onChange={(e) => up("profile_election", e.target.value)} className={input} /></Field>
      <Field label="학력 (한 줄에 하나)">
        <textarea rows={6} value={form.profile_education} onChange={(e) => up("profile_education", e.target.value)} className={input} placeholder={"파장초등학교\n수성중학교\n삼일고등학교\n..."} />
      </Field>
      <Field label="수상 (한 줄에 하나)">
        <textarea rows={3} value={form.profile_awards} onChange={(e) => up("profile_awards", e.target.value)} className={input} />
      </Field>
      <Field label="약력 (한 줄에 하나)">
        <textarea rows={5} value={form.profile_career} onChange={(e) => up("profile_career", e.target.value)} className={input} />
      </Field>

      {/* ─── 스토리 섹션 ─── */}
      <Section title="후보소개 / 스토리 섹션" subtitle="프로필 하단에 카드 형태로 표시됩니다. 비워두면 해당 카드는 노출되지 않습니다." />
      <StoryBlock
        index={1}
        title={form.story1_title}
        body={form.story1_body}
        onTitle={(v) => up("story1_title", v)}
        onBody={(v) => up("story1_body", v)}
      />
      <StoryBlock
        index={2}
        title={form.story2_title}
        body={form.story2_body}
        onTitle={(v) => up("story2_title", v)}
        onBody={(v) => up("story2_body", v)}
      />
      <StoryBlock
        index={3}
        title={form.story3_title}
        body={form.story3_body}
        onTitle={(v) => up("story3_title", v)}
        onBody={(v) => up("story3_body", v)}
      />

      {msg && <p className="mt-4 rounded border border-gray-200 bg-gray-50 p-2 text-xs">{msg}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 rounded-md bg-[#FF6B00] px-5 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "저장 중..." : "저장"}
      </button>

      <p className="mt-3 text-xs text-gray-500">
        ※ SNS 링크는 <a href="/admin/candidate/sns" className="underline hover:text-[#FF6B00]">SNS 링크 관리</a> 페이지에서 편집합니다.
      </p>
    </form>
  );
}

function Section({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mt-8 mb-3 border-b border-gray-200 pb-2 first:mt-0">
      <h2 className="text-base font-extrabold text-[#FF6B00]">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="mt-4 block text-sm font-semibold first:mt-0">{label}{children}</label>;
}

function StoryBlock({
  index,
  title,
  body,
  onTitle,
  onBody,
}: {
  index: number;
  title: string;
  body: string;
  onTitle: (v: string) => void;
  onBody: (v: string) => void;
}) {
  const input = "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm";
  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="mb-2 text-xs font-bold text-gray-600">스토리 {index}</p>
      <label className="block text-sm font-semibold">
        제목
        <input value={title} onChange={(e) => onTitle(e.target.value)} className={input} />
      </label>
      <label className="mt-3 block text-sm font-semibold">
        본문
        <textarea rows={4} value={body} onChange={(e) => onBody(e.target.value)} className={input} />
      </label>
    </div>
  );
}
