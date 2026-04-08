"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createAnnouncement,
  updateAnnouncement,
  type AnnouncementInput,
} from "./actions";

type Props = {
  initial?: Partial<AnnouncementInput> & { id?: string };
};

export default function AnnouncementForm({ initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [form, setForm] = useState<AnnouncementInput>({
    id: initial?.id,
    category: (initial?.category as "party" | "election") ?? "election",
    title: initial?.title ?? "",
    content: initial?.content ?? "",
    is_pinned: initial?.is_pinned ?? false,
    is_active: initial?.is_active ?? true,
  });

  function update<K extends keyof AnnouncementInput>(
    key: K,
    value: AnnouncementInput[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = form.id
        ? await updateAnnouncement(form)
        : await createAnnouncement(form);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      router.push("/admin/announcements");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-gray-200 bg-white p-6"
    >
      <label className="block text-sm font-semibold">
        분류
        <select
          value={form.category}
          onChange={(e) =>
            update("category", e.target.value as "party" | "election")
          }
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="election">선거</option>
          <option value="party">당</option>
        </select>
      </label>

      <label className="mt-4 block text-sm font-semibold">
        제목
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="mt-4 block text-sm font-semibold">
        본문
        <textarea
          required
          rows={6}
          value={form.content}
          onChange={(e) => update("content", e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <span className="mt-1 block text-xs text-gray-500">
          ※ 추후 Tiptap 리치텍스트 에디터로 교체 예정
        </span>
      </label>

      <div className="mt-4 flex gap-6">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={form.is_pinned}
            onChange={(e) => update("is_pinned", e.target.checked)}
          />
          상단 고정
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => update("is_active", e.target.checked)}
          />
          노출(활성화)
        </label>
      </div>

      {error && (
        <p className="mt-4 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[#FF6B00] px-5 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "저장 중..." : form.id ? "수정 저장" : "등록"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 px-5 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          취소
        </button>
      </div>
    </form>
  );
}
