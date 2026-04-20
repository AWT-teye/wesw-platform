"use client";

import Link from "next/link";
import { useState } from "react";
import MobileNav, { type NavItem } from "./MobileNav";

/**
 * we.wesw.kr 헤더
 * - 모바일 퍼스트: 기본은 로고 + 햄버거
 * - md(≥768px) 이상에서 가로 GNB 노출
 * - sticky, 흰 배경, 브랜드 #FF6B00
 */
const NAV_ITEMS: NavItem[] = [
  { href: "/we/intro", label: "후보소개" },
  { href: "/we/pledge", label: "후보공약" },
  { href: "/we/sns", label: "후보SNS" },
  {
    href: "https://forms.gle/E6upekzVEfzZHwP76",
    label: "서포터즈신청",
    external: true,
  },
  { href: "/we/propose", label: "공약제안" },
  { href: "/we/organization", label: "조직도 및 연락처" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:h-16 md:px-6">
        {/* 로고 */}
        <Link
          href="/we"
          className="flex items-center gap-2"
          aria-label="we.wesw.kr 홈"
        >
          <span className="text-lg font-extrabold tracking-tight text-[#FF6B00] md:text-xl">
            정희윤
          </span>
          <span className="hidden text-xs font-medium text-gray-500 sm:inline">
            수원 9.0캠프
          </span>
        </Link>

        {/* 데스크탑 GNB */}
        <nav aria-label="주 메뉴" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const cls =
                "rounded-md px-3 py-2 text-sm font-semibold text-[#1a1a1a] hover:text-[#FF6B00] hover:underline hover:underline-offset-8 hover:decoration-[#FF6B00] hover:decoration-2";
              return (
                <li key={item.href}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cls}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link href={item.href} className={cls}>
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 햄버거 (모바일) */}
        <button
          type="button"
          aria-label="메뉴 열기"
          aria-expanded={open}
          aria-controls="we-mobile-nav"
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-md text-[#1a1a1a] hover:bg-gray-100 md:hidden"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      <div id="we-mobile-nav">
        <MobileNav
          open={open}
          onClose={() => setOpen(false)}
          items={NAV_ITEMS}
        />
      </div>
    </header>
  );
}
