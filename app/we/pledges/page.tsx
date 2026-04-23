import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import PledgesClient, { type PledgesData } from "./PledgesClient";

export const revalidate = 60;

const PAGE_URL = "https://we.wesw.kr/pledges";

export const metadata: Metadata = {
  title: "정희윤 공약 | 수원특례시장 후보 | 개혁신당",
  description:
    "개혁신당 정희윤 후보의 전체공약, 10대공약, 수원 4개 구 지역별 맞춤공약",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "정희윤 공약 | 수원특례시장 후보 | 개혁신당",
    description:
      "개혁신당 정희윤 후보의 전체공약, 10대공약, 수원 4개 구 지역별 맞춤공약",
    url: PAGE_URL,
    siteName: "we.wesw.kr",
    locale: "ko_KR",
    type: "website",
  },
};

export default async function WePledgesPage() {
  const supabase = await createClient();

  const { data: candidate } = await supabase
    .from("candidates")
    .select("id, name, photo_url, profile_json")
    .order("display_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  const candidateId = candidate?.id as string | undefined;

  const [overviewRes, bigRes, midRes, detailRes, regionRes, mapRes] = await Promise.all([
    candidateId
      ? supabase
          .from("pledge_overview")
          .select(
            "intro_text, popup_image_url, poster_url, bulletin_url, top10_url, plan_book_url"
          )
          .eq("candidate_id", candidateId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("policies")
      .select("id, title, content, display_order")
      .eq("level", 1)
      .eq("is_active", true)
      .eq("is_archived", false)
      .order("display_order", { ascending: true }),
    supabase
      .from("policies")
      .select("id, title, content, parent_id, display_order, is_top10")
      .eq("level", 2)
      .eq("is_active", true)
      .eq("is_archived", false)
      .order("display_order", { ascending: true }),
    supabase
      .from("policies")
      .select("id, title, content, parent_id, display_order")
      .eq("level", 3)
      .eq("is_active", true)
      .eq("is_archived", false)
      .order("display_order", { ascending: true }),
    supabase
      .from("region_pledges")
      .select(
        "id, region_type, region_code, region_name, content, popup_image_url, display_order, is_visible"
      )
      .order("display_order", { ascending: true }),
    supabase
      .from("suwon_map_regions")
      .select("gu_code, gu_name, dong_name, adm_cd2, geojson, region_pledge_id")
      .order("gu_code", { ascending: true }),
  ]);

  const profile = (candidate?.profile_json ?? {}) as { title?: string };
  const data: PledgesData = {
    candidate: {
      name: candidate?.name ?? "정희윤",
      position: profile.title ?? "수원특례시장 후보 / 개혁신당",
      photoUrl: candidate?.photo_url ?? null,
    },
    overview: overviewRes.data
      ? {
          intro_text: overviewRes.data.intro_text ?? null,
          popup_image_url: overviewRes.data.popup_image_url ?? null,
          poster_url: overviewRes.data.poster_url ?? null,
          bulletin_url: overviewRes.data.bulletin_url ?? null,
          top10_url: overviewRes.data.top10_url ?? null,
          plan_book_url: overviewRes.data.plan_book_url ?? null,
        }
      : {
          intro_text: null,
          popup_image_url: null,
          poster_url: null,
          bulletin_url: null,
          top10_url: null,
          plan_book_url: null,
        },
    bigPledges: (bigRes.data ?? []).map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      display_order: p.display_order,
    })),
    midPledges: (midRes.data ?? []).map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      parent_id: p.parent_id,
      display_order: p.display_order,
      is_top10: p.is_top10 ?? false,
    })),
    detailPledges: (detailRes.data ?? []).map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      parent_id: p.parent_id,
      display_order: p.display_order,
    })),
    regions: (regionRes.data ?? []).map((r) => ({
      id: r.id,
      region_type: r.region_type,
      region_code: r.region_code,
      region_name: r.region_name,
      content: r.content,
      popup_image_url: r.popup_image_url,
      display_order: r.display_order,
      is_visible: r.is_visible ?? true,
    })),
    suwonMap: (mapRes.data ?? []).map((m) => ({
      gu_code: m.gu_code as "jangan" | "gwonseon" | "paldal" | "yeongtong",
      gu_name: m.gu_name,
      dong_name: m.dong_name,
      adm_cd2: m.adm_cd2,
      geojson: m.geojson,
      region_pledge_id: m.region_pledge_id ?? null,
    })),
  };

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "메인",
          item: "https://we.wesw.kr/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "후보공약",
          item: PAGE_URL,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "정희윤 공약 | 수원특례시장 후보 | 개혁신당",
      description:
        "개혁신당 정희윤 후보의 전체공약, 10대공약, 수원 4개 구 지역별 맞춤공약",
      url: PAGE_URL,
      author: {
        "@type": "Person",
        name: data.candidate.name,
      },
      mainEntityOfPage: PAGE_URL,
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PledgesClient data={data} />
    </>
  );
}
