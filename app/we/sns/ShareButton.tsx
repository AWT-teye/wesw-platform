"use client";

import { useState } from "react";

type Props = { title: string; text: string; url: string };

export default function ShareButton({ title, text, url }: Props) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await navigator.share({ title, text, url });
        return;
      }
    } catch {
      // 사용자가 공유 취소한 경우 그대로 통과
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(url);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg bg-[#FF6B00] px-6 py-3 text-sm font-bold text-white shadow-md hover:opacity-90 md:text-base"
    >
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      {copied ? "링크가 복사되었습니다" : "공유하기"}
    </button>
  );
}
