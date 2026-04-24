import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import OrgClient, {
  type OrgContact,
  type OrgNode,
} from "./OrgClient";

export const revalidate = 60;

const PAGE_URL = "https://we.wesw.kr/organization";

export const metadata: Metadata = {
  title: "조직도 및 연락처 | 수원9.0캠프 | 정희윤",
  description:
    "수원 9.0캠프 선거대책위원회 조직도와 주요 연락처",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "조직도 및 연락처 | 수원9.0캠프 | 정희윤",
    description:
      "수원 9.0캠프 선거대책위원회 조직도와 주요 연락처",
    url: PAGE_URL,
    siteName: "we.wesw.kr",
    locale: "ko_KR",
    type: "website",
  },
};

export default async function WeOrganizationPage() {
  const supabase = await createClient();

  const [nodesRes, contactsRes] = await Promise.all([
    supabase
      .from("org_nodes")
      .select(
        "id, node_key, name_ko, name_en, role, person_name, description, parent_key, level, display_order, color_scheme, is_visible"
      )
      .eq("is_visible", true)
      .order("level", { ascending: true })
      .order("display_order", { ascending: true }),
    supabase
      .from("org_contacts")
      .select(
        "id, org_node_key, department, phone, email, display_order, is_visible"
      )
      .eq("is_visible", true)
      .order("display_order", { ascending: true }),
  ]);

  const nodes = (nodesRes.data ?? []) as OrgNode[];
  const contacts = (contactsRes.data ?? []) as OrgContact[];

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* [A] 헤더 */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link
            href="/we"
            className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-[#FF6B00]"
          >
            <span aria-hidden>←</span> 메인으로
          </Link>
          <span className="rounded-full bg-[#FF6B00] px-3 py-1 text-xs font-extrabold tracking-wide text-white">
            ORGANIZATION
          </span>
        </div>
      </header>

      <section className="mx-auto mt-6 max-w-6xl px-4">
        <h1 className="text-2xl font-extrabold md:text-3xl">
          조직도 및 연락처
        </h1>
        <p className="mt-2 text-sm text-gray-600 md:text-base">
          수원 9.0캠프 선거대책위원회
        </p>
      </section>

      <OrgClient nodes={nodes} contacts={contacts} />
    </main>
  );
}
