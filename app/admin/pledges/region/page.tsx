import { createClient } from "@/lib/supabase/server";
import RegionList from "./RegionList";

export const dynamic = "force-dynamic";

export default async function AdminPledgeRegionPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("region_pledges")
    .select(
      "id, region_type, region_code, region_name, content, popup_image_url, display_order, is_visible"
    )
    .order("display_order", { ascending: true });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-extrabold">지역별 맞춤공약 관리</h1>
      <p className="mb-4 text-xs text-gray-500">
        6개 항목(수원 4개 구 + 특별 카드 2종)은 시드로 고정되어 있으며, 각 카드의
        내용·이미지·노출 여부·순서를 개별 저장할 수 있습니다.
      </p>
      <RegionList items={data ?? []} />
    </div>
  );
}
