import { createClient } from "@/lib/supabase/server";
import HeroForm from "./HeroForm";
import type { HeroSettingsInput } from "./actions";

export const dynamic = "force-dynamic";

const DEFAULTS: HeroSettingsInput = {
  background_image_url: "",
  overlay_opacity: 0.5,
  overlay_color: "#000000",
  use_image_background: false,
  image_fit: "contain",
  badge_text: "WE SUWON",
  headline_main: "모든 가능성을,",
  headline_accent: "모두에게",
  subline: "정희윤이 만드는 수원 9.0",
  cta_primary_text: "공약 보기",
  cta_primary_url: "/we/pledges",
  cta_secondary_text: "서포터즈 신청",
  cta_secondary_url: "/we/supporters",
};

export default async function AdminHeroPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("hero_settings")
    .select(
      "id, background_image_url, overlay_opacity, overlay_color, use_image_background, image_fit, badge_text, headline_main, headline_accent, subline, cta_primary_text, cta_primary_url, cta_secondary_text, cta_secondary_url"
    )
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const initial: HeroSettingsInput = data
    ? {
        id: data.id,
        background_image_url: data.background_image_url ?? "",
        overlay_opacity:
          data.overlay_opacity == null ? 0.5 : Number(data.overlay_opacity),
        overlay_color: data.overlay_color ?? "#000000",
        use_image_background: !!data.use_image_background,
        image_fit: data.image_fit === "cover" ? "cover" : "contain",
        badge_text: data.badge_text ?? "",
        headline_main: data.headline_main ?? "",
        headline_accent: data.headline_accent ?? "",
        subline: data.subline ?? "",
        cta_primary_text: data.cta_primary_text ?? "",
        cta_primary_url: data.cta_primary_url ?? "",
        cta_secondary_text: data.cta_secondary_text ?? "",
        cta_secondary_url: data.cta_secondary_url ?? "",
      }
    : DEFAULTS;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold">메인 대문(Hero) 관리</h1>
        <p className="mt-1 text-sm text-gray-500">
          메인페이지(/we) 상단 대문 영역의 배경 이미지, 오버레이, 텍스트, CTA 버튼을 관리합니다.
          단일 row 로 운영되며 저장 시 즉시 반영됩니다.
        </p>
      </div>
      <HeroForm initial={initial} />
    </div>
  );
}
