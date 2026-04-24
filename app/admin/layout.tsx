import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "관리자 백오피스 | wesw",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/carousel", label: "캐러셀" },
  { href: "/admin/blocks/we_camp_intro", label: "캠프소개" },
  { href: "/admin/announcements", label: "한마디" },
  { href: "/admin/blocks/we_slogan", label: "슬로건" },
  { href: "/admin/policies?level=1", label: "대공약" },
  { href: "/admin/policies?level=2", label: "중공약" },
  { href: "/admin/policies?level=3", label: "세부공약" },
  { href: "/admin/pledges/overview", label: "공약소개관리" },
  { href: "/admin/pledges/region", label: "지역별공약관리" },
  { href: "/admin/candidate", label: "후보소개" },
  { href: "/admin/candidate/sns", label: "SNS링크" },
  { href: "/admin/sns", label: "SNS관리" },
  { href: "/admin/org", label: "조직도" },
  { href: "/admin/organization", label: "조직도관리" },
  { href: "/admin/observers", label: "참관인신청" },
  { href: "/admin/schedule", label: "일정관리" },
  { href: "/admin/propose", label: "공약제안" },
  { href: "/admin/blocks/we_propose_intro", label: "공약제안 상단" },
  { href: "/admin/blocks/we_propose_districts", label: "거주지역" },
  { href: "/admin/blocks/we_footer_legal", label: "푸터" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 text-[#1a1a1a]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              href="/admin"
              className="text-lg font-extrabold text-[#FF6B00]"
            >
              wesw 백오피스
            </Link>
          </div>
          <nav className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="hover:text-[#FF6B00]">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
