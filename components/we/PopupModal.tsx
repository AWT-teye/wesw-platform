"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
  title: string;
  bodyHtml: string;
  buttonText: string | null;
  buttonLink: string | null;
};

const STORAGE_KEY = "we_popup_dismiss_date";

export default function PopupModal({
  title,
  bodyHtml,
  buttonText,
  buttonLink,
}: Props) {
  const [open, setOpen] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    const today = new Date().toISOString().slice(0, 10);
    if (dismissed !== today) {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleClose() {
    if (dontShowToday) {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem(STORAGE_KEY, today);
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="팝업 닫기"
        onClick={handleClose}
        className="absolute inset-0 bg-black/60"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-[90%] max-w-[480px] rounded-2xl bg-white shadow-2xl"
      >
        {/* Close button */}
        <button
          type="button"
          aria-label="팝업 닫기"
          onClick={handleClose}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Content */}
        <div className="px-6 pt-8 pb-4">
          <h2 className="text-xl font-extrabold text-[#1a1a1a] mb-4 pr-6">
            {title}
          </h2>
          <div
            className="prose prose-sm max-w-none text-gray-700 [&_*]:whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        </div>

        {/* Button */}
        {buttonText && buttonLink && (
          <div className="px-6 pb-4">
            <Link
              href={buttonLink}
              onClick={handleClose}
              className="block w-full rounded-lg bg-[#FF6B00] py-3 text-center text-base font-bold text-white hover:bg-[#e55f00] transition-colors shadow-lg shadow-[#FF6B00]/25"
            >
              {buttonText}
            </Link>
          </div>
        )}

        {/* Don't show today */}
        <div className="border-t border-gray-100 px-6 py-3">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-500">
            <input
              type="checkbox"
              checked={dontShowToday}
              onChange={(e) => setDontShowToday(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 accent-[#FF6B00]"
            />
            오늘 하루 보지 않기
          </label>
        </div>
      </div>
    </div>
  );
}
