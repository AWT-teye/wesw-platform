"use client";

import Link from "next/link";
import { useEffect } from "react";

export type NavItem = { href: string; label: string; external?: boolean };

type Props = {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
};

/**
 * we.wesw.kr 모바일 햄버거 메뉴
 * - 우측에서 슬라이드 인
 * - 배경 dim 클릭 시 닫힘
 * - ESC 키 닫힘 + body 스크롤 잠금
 */
export default function MobileNav({ open, onClose, items }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-50 md:hidden ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Dim */}
      <button
        type="button"
        aria-label="메뉴 닫기"
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="모바일 메뉴"
        className={`absolute right-0 top-0 h-full w-72 max-w-[80vw] bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <span className="text-base font-bold text-[#FF6B00]">정희윤</span>
          <button
            type="button"
            aria-label="메뉴 닫기"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100"
          >
            <svg
              width="22"
              height="22"
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
        </div>

        <nav className="px-2 py-3">
          <ul className="flex flex-col">
            {items.map((item) => {
              const cls =
                "block rounded-md px-4 py-3 text-base font-medium text-[#1a1a1a] hover:bg-[#FF6B00]/10 hover:text-[#FF6B00]";
              return (
                <li key={item.href}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onClose}
                      className={cls}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cls}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </div>
  );
}
