"use client";

import { useState, useTransition } from "react";
import { saveRegionPledge } from "../actions";
import { uploadPledgeImage } from "../uploadClient";

type Region = {
  id: string;
  region_type: string;
  region_code: string;
  region_name: string;
  content: string | null;
  popup_image_url: string | null;
  display_order: number;
  is_visible: boolean;
};

export default function RegionList({ items }: { items: Region[] }) {
  return (
    <ul className="space-y-4">
      {items.map((r) => (
        <RegionCard key={r.id} region={r} />
      ))}
    </ul>
  );
}

function RegionCard({ region }: { region: Region }) {
  const [form, setForm] = useState({
    content: region.content ?? "",
    popup_image_url: region.popup_image_url ?? "",
    display_order: region.display_order,
    is_visible: region.is_visible,
  });
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  function up<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg("");
    try {
      const url = await uploadPledgeImage(file, `region/${region.region_code}`);
      up("popup_image_url", url);
    } catch (err) {
      setMsg(`업로드 실패: ${(err as Error).message}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function onSave() {
    setMsg("");
    startTransition(async () => {
      const r = await saveRegionPledge({
        id: region.id,
        content: form.content,
        popup_image_url: form.popup_image_url,
        display_order: form.display_order,
        is_visible: form.is_visible,
      });
      setMsg("error" in r && r.error ? `오류: ${r.error}` : "저장되었습니다.");
    });
  }

  return (
    <li className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-[#FF6B00]">
            {region.region_type === "gu" ? "구" : "특별 카드"}
          </p>
          <h3 className="text-lg font-extrabold">{region.region_name}</h3>
          <p className="text-xs text-gray-500">{region.region_code}</p>
        </div>
        <label className="inline-flex items-center gap-2 text-xs font-semibold">
          노출
          <button
            type="button"
            role="switch"
            aria-checked={form.is_visible}
            onClick={() => up("is_visible", !form.is_visible)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              form.is_visible ? "bg-[#FF6B00]" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                form.is_visible ? "left-5" : "left-0.5"
              }`}
            />
          </button>
        </label>
      </div>

      <label className="block text-sm font-semibold">
        내용
        <textarea
          rows={4}
          value={form.content}
          onChange={(e) => up("content", e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="지역별 맞춤공약 내용"
        />
      </label>

      <div className="mt-3">
        <p className="text-sm font-semibold">팝업 이미지</p>
        <div className="mt-1 flex items-start gap-3">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-50">
            {form.popup_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.popup_image_url}
                alt="미리보기"
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

      <div className="mt-3 flex items-end gap-3">
        <label className="block text-sm font-semibold">
          순서
          <input
            type="number"
            value={form.display_order}
            onChange={(e) => up("display_order", Number(e.target.value))}
            className="mt-1 w-24 rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={onSave}
          disabled={pending || uploading}
          className="ml-auto rounded-md bg-[#FF6B00] px-5 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "저장 중..." : "저장"}
        </button>
      </div>

      {msg && (
        <p className="mt-3 rounded border border-gray-200 bg-gray-50 p-2 text-xs">{msg}</p>
      )}
    </li>
  );
}
