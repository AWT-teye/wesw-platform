"use client";

import { useState, useTransition } from "react";
import {
  addYoutubeVideo,
  deleteYoutubeVideo,
  toggleYoutubeVisibility,
  moveYoutubeVideo,
} from "./actions";
import { extractYoutubeId } from "./youtubeUtils";

type Video = {
  id: string;
  title: string;
  youtube_url: string;
  thumbnail_url: string | null;
  is_visible: boolean;
  display_order: number;
};

export default function YoutubeSection({ videos }: { videos: Video[] }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [customThumb, setCustomThumb] = useState("");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      setMsg("제목과 유튜브 URL은 필수입니다.");
      return;
    }
    setMsg("");
    startTransition(async () => {
      const r = await addYoutubeVideo({
        title: title.trim(),
        youtube_url: url.trim(),
        thumbnail_url: customThumb.trim() || undefined,
      });
      if ("error" in r && r.error) {
        setMsg(`오류: ${r.error}`);
      } else {
        setTitle("");
        setUrl("");
        setCustomThumb("");
      }
    });
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold">유튜브 영상</h2>

      <form onSubmit={onAdd} className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="영상 제목"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[#FF6B00] px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "추가 중..." : "추가"}
        </button>
        <input
          value={customThumb}
          onChange={(e) => setCustomThumb(e.target.value)}
          placeholder="(선택) 썸네일 이미지 URL — 비우면 자동으로 유튜브 썸네일 사용"
          className="md:col-span-3 rounded-md border border-gray-200 px-3 py-2 text-xs text-gray-700"
        />
      </form>

      {msg && <p className="mb-4 rounded border border-gray-200 bg-gray-50 p-2 text-xs">{msg}</p>}

      {videos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          등록된 영상이 없습니다.
        </p>
      ) : (
        <ul className="space-y-3">
          {videos.map((v, i) => (
            <VideoRow
              key={v.id}
              video={v}
              isFirst={i === 0}
              isLast={i === videos.length - 1}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function VideoRow({
  video,
  isFirst,
  isLast,
}: {
  video: Video;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const videoId = extractYoutubeId(video.youtube_url);
  const thumb =
    video.thumbnail_url ||
    (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null);

  function run(fn: () => Promise<unknown>) {
    startTransition(async () => {
      await fn();
    });
  }

  return (
    <li className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-3">
      <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded bg-gray-100">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt={video.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
            no thumb
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{video.title}</p>
        <p className="truncate text-xs text-gray-500">{video.youtube_url}</p>
      </div>

      <div className="flex items-center gap-2">
        <Toggle
          value={video.is_visible}
          disabled={pending}
          onChange={(v) => run(() => toggleYoutubeVisibility(video.id, v))}
        />
        <button
          type="button"
          disabled={pending || isFirst}
          onClick={() => run(() => moveYoutubeVideo(video.id, "up"))}
          className="rounded border border-gray-300 px-2 py-1 text-xs font-semibold hover:bg-gray-50 disabled:opacity-40"
        >
          ↑
        </button>
        <button
          type="button"
          disabled={pending || isLast}
          onClick={() => run(() => moveYoutubeVideo(video.id, "down"))}
          className="rounded border border-gray-300 px-2 py-1 text-xs font-semibold hover:bg-gray-50 disabled:opacity-40"
        >
          ↓
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (confirm("이 영상을 삭제할까요?")) run(() => deleteYoutubeVideo(video.id));
          }}
          className="rounded border border-red-300 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40"
        >
          삭제
        </button>
      </div>
    </li>
  );
}

function Toggle({
  value,
  onChange,
  disabled,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={`relative h-6 w-11 rounded-full transition-colors ${
        value ? "bg-[#FF6B00]" : "bg-gray-300"
      } disabled:opacity-40`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
          value ? "left-5" : "left-0.5"
        }`}
      />
    </button>
  );
}
