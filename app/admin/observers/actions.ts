"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ObserverStatus = "pending" | "confirmed" | "cancelled";

export async function updateObserverStatus(
  id: string,
  next: ObserverStatus
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("observer_applications")
    .update({ status: next })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/observers");
  revalidatePath("/we/observers");
  return { ok: true };
}

export async function deleteObserverApplication(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("observer_applications")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/observers");
  revalidatePath("/we/observers");
  return { ok: true };
}

// ───── 투표소 CRUD ─────

export async function createStation(input: {
  district: string;
  station_name: string;
  address: string;
}) {
  const station_name = input.station_name.trim();
  const address = input.address.trim();
  if (!station_name) return { error: "투표소명을 입력해 주세요." };
  if (!input.district) return { error: "구를 선택해 주세요." };

  const supabase = await createClient();
  const { error } = await supabase.from("polling_stations").insert({
    district: input.district,
    station_name,
    address,
    max_observers: 2,
    is_active: true,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/observers");
  revalidatePath("/we/observers");
  return { ok: true };
}

export async function updateStation(
  id: string,
  input: { station_name: string; address: string }
) {
  const station_name = input.station_name.trim();
  if (!station_name) return { error: "투표소명을 입력해 주세요." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("polling_stations")
    .update({
      station_name,
      address: input.address.trim(),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/observers");
  revalidatePath("/we/observers");
  return { ok: true };
}

export async function deleteStation(id: string) {
  const supabase = await createClient();

  // 신청자 존재 여부 체크
  const { count, error: countErr } = await supabase
    .from("observer_applications")
    .select("id", { count: "exact", head: true })
    .eq("station_id", id);

  if (countErr) return { error: countErr.message };
  if ((count ?? 0) > 0) {
    return {
      error:
        "해당 투표소에 신청자가 있어 삭제할 수 없습니다. 신청자를 먼저 정리해 주세요.",
    };
  }

  const { error } = await supabase
    .from("polling_stations")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/observers");
  revalidatePath("/we/observers");
  return { ok: true };
}
