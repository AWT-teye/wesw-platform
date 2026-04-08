import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "관리자 백오피스 | wesw",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 text-[#1a1a1a]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="text-lg font-extrabold text-[#FF6B00]">
            wesw 백오피스
          </Link>
          <nav className="flex gap-4 text-sm font-semibold">
            <Link href="/admin" className="hover:text-[#FF6B00]">
              대시보드
            </Link>
            <Link href="/admin/announcements" className="hover:text-[#FF6B00]">
              한마디
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
