"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { RESIDENCE_OPTIONS, type Residence } from "./constants";

export type ObserverApplyInput = {
  station_id: string;
  name: string;
  phone: string;
  district: string;
  residence: string;
  is_party_member: boolean;
  agree: boolean;
};

export async function applyObserver(input: ObserverApplyInput) {
  const name = input.name.trim();
  const phone = input.phone.trim();

  if (!input.is_party_member) {
    return { error: "참관인은 개혁신당 당원만 신청 가능합니다." };
  }
  if (!input.agree) return { error: "개인정보 수집에 동의해 주세요." };
  if (!name) return { error: "성명을 입력해 주세요." };
  if (name.length > 50) return { error: "성명은 50자 이내로 입력해 주세요." };
  if (!phone || phone.length < 4)
    return { error: "연락처를 정확히 입력해 주세요." };
  if (!input.station_id) return { error: "투표소가 선택되지 않았습니다." };
  if (!input.district) return { error: "구를 선택해 주세요." };
  if (!RESIDENCE_OPTIONS.includes(input.residence as Residence)) {
    return { error: "거주지를 선택해 주세요." };
  }

  const supabase = await createClient();

  const { data: station } = await supabase
    .from("polling_stations")
    .select("max_observers, is_active")
    .eq("id", input.station_id)
    .maybeSingle();

  if (!station || !station.is_active) {
    return { error: "선택하신 투표소를 찾을 수 없습니다." };
  }

  // 실시간 집계 RPC 로 현재 활성 신청 수 확인
  const { data: liveCount } = await supabase.rpc("get_station_active_count", {
    p_station_id: input.station_id,
  });
  if ((liveCount ?? 0) >= station.max_observers) {
    return { error: "해당 투표소는 정원이 마감되었습니다." };
  }

  const { error } = await supabase.from("observer_applications").insert({
    station_id: input.station_id,
    name,
    phone,
    district: input.district,
    residence: input.residence,
    is_party_member: true,
    status: "pending",
  });

  if (error) {
    if (error.message.includes("정원")) {
      return { error: "해당 투표소는 정원이 마감되었습니다." };
    }
    return { error: error.message };
  }

  revalidatePath("/we/observers");
  revalidatePath("/admin/observers");
  return { ok: true };
}
