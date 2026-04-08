import type { Metadata } from "next";
import Ticker from "@/components/we/Ticker";
import Header from "@/components/we/Header";

export const metadata: Metadata = {
  title: "정희윤 | 수원의 가능성",
  description:
    "we.wesw.kr — 개혁신당 수원시장 후보 정희윤의 공약과 정책을 한눈에.",
  openGraph: {
    title: "정희윤 | 수원의 가능성",
    description: "개혁신당 수원시장 후보 정희윤의 공약과 정책",
    url: "https://we.wesw.kr",
    siteName: "we.wesw.kr",
    locale: "ko_KR",
    type: "website",
  },
};

export default function WeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]">
      <Ticker />
      <Header />
      <main>{children}</main>
      {/* TODO: <Footer /> — 선관위 의무표시 placeholder */}
    </div>
  );
}
