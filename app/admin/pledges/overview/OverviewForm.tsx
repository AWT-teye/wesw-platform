"use client";

import { useState, useTransition } from "react";
import { savePledgeOverview, type PledgeOverviewInput } from "../actions";
import { uploadPledgeImage } from "../uploadClient";

const URL_FIELDS: {
  key: keyof Pick<
    PledgeOverviewInput,
    "poster_url" | "bulletin_url" | "top10_url" | "plan_book_url"
  >;
  label: string;
  placeholder: string;
}[] = [
  { key: "poster_url", label: "선거벽보 URL", placeholder: "https://..." },
  { key: "bulletin_url", label: "선거공보 URL", placeholder: "https://..." },
  { key: "top10_url", label: "10대공약 URL (외부 PDF 등)", placeholder: "비워두면 내부 10대공약 탭으로 이동" },
  { key: "plan_book_url", label: "선거공약서 URL", placeholder: "https://..." },
];

export default function OverviewForm({ initial }: { initial: PledgeOverviewInput }) {
  const [form, setForm] = useState<PledgeOverviewInput>(initial);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  function up<K extends keyof PledgeOverviewInput>(k: K, v: PledgeOverviewInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg("");
    try {
      const url = await uploadPledgeImage(file, "overview");
      up("popup_image_url", url);
    } catch (err) {
      setMsg(`업로드 실패: ${(err as Error).message}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    startTransition(async () => {
      const r = await savePledgeOverview(form);
      setMsg("error" in r && r.error ? `오류: ${r.error}` : "저장되었습니다.");
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-xl border border-gray-200 bg-white p-6"
    >
      <label className="block text-sm font-semibold">
        공약 소개 텍스트
        <textarea
          rows={6}
          value={form.intro_text}
          onChange={(e) => up("intro_text", e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="공약 페이지 상단에 표시될 인트로 텍스트"
        />
      </label>

      <div>
        <p className="text-sm font-semibold">팝업 이미지</p>
        <div className="mt-1 flex items-start gap-3">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-50">
            {form.popup_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.popup_image_url}
                alt="팝업 미리보기"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                없음
              </div>
            )}
          </div>
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={onFile}
              disabled={uploading}
              className="block text-xs"
            />
            <input
              type="url"
              value={form.popup_image_url}
              onChange={(e) => up("popup_image_url", e.target.value)}
              placeholder="또는 이미지 URL 직접 입력"
              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-xs"
            />
            {uploading && (
              <p className="mt-1 text-xs text-gray-500">업로드 중...</p>
            )}
          </div>
        </div>
      </div>

      {URL_FIELDS.map((f) => (
        <label key={f.key} className="block text-sm font-semibold">
          {f.label}
          <input
            type="url"
            value={form[f.key]}
            onChange={(e) => up(f.key, e.target.value)}
            placeholder={f.placeholder}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
      ))}

      {msg && (
        <p className="rounded border border-gray-200 bg-gray-50 p-2 text-xs">{msg}</p>
      )}

      <button
        type="submit"
        disabled={pending || uploading}
        className="rounded-md bg-[#FF6B00] px-5 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "저장 중..." : "저장"}
      </button>
    </form>
  );
}
