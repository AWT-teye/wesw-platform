"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ObserverApplyInput = {
  station_id: string;
  name: string;
  phone: string;
  district: string;
  agree: boolean;
};

export async function applyObserver(input: ObserverApplyInput) {
  const name = input.name.trim();
  const phone = input.phone.trim();

  if (!input.agree) return { error: "개인정보 수집에 동의해 주세요." };
  if (!name) return { error: "성명을 입력해 주세요." };
  if (name.length > 50) return { error: "성명은 50자 이내로 입력해 주세요." };
  if (!phone || phone.length < 4)
    return { error: "연락처를 정확히 입력해 주세요." };
  if (!input.station_id) return { error: "투표소가 선택되지 않았습니다." };
  if (!input.district) return { error: "구를 선택해 주세요." };

  const supabase = await createClient();

  // 정원 사전 확인 (트리거가 최종 보장)
  const { data: station } = await supabase
    .from("polling_stations")
    .select("max_observers, current_observer_count, is_active")
    .eq("id", input.station_id)
    .maybeSingle();

  if (!station || !station.is_active) {
    return { error: "선택하신 투표소를 찾을 수 없습니다." };
  }
  if (station.current_observer_count >= station.max_observers) {
    return { error: "해당 투표소는 정원이 마감되었습니다." };
  }

  const { error } = await supabase.from("observer_applications").insert({
    station_id: input.station_id,
    name,
    phone,
    district: input.district,
    status: "pending",
  });

  if (error) {
    // 트리거에서 '정원 마감' 발생 시 에러 메시지에 포함됨
    if (error.message.includes("정원")) {
      return { error: "해당 투표소는 정원이 마감되었습니다." };
    }
    return { error: error.message };
  }

  revalidatePath("/we/observers");
  revalidatePath("/admin/observers");
  return { ok: true };
}
