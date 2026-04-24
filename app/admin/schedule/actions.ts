"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CandidateScheduleInput = {
  id?: string;
  scheduled_date: string; // YYYY-MM-DD
  title: string;
  subtitle?: string | null;
  start_time?: string | null; // HH:MM
  end_time?: string | null;
  location?: string | null;
  content?: string | null;
  extra?: string | null;
  is_visible: boolean;
};

function normTime(v?: string | null): string | null {
  if (!v) return null;
  const t = v.trim();
  if (!t) return null;
  // normalize HH:MM or HH:MM:SS
  return t.length === 5 ? `${t}:00` : t;
}

function sanitizePayload(input: CandidateScheduleInput) {
  const title = input.title.trim();
  if (!title) return { error: "제목을 입력해 주세요." as const };
  if (!input.scheduled_date) return { error: "날짜를 선택해 주세요." as const };

  return {
    payload: {
      title,
      subtitle: input.subtitle?.trim() || null,
      scheduled_date: input.scheduled_date,
      start_time: normTime(input.start_time),
      end_time: normTime(input.end_time),
      location: input.location?.trim() || null,
      content: input.content?.trim() || null,
      extra: input.extra?.trim() || null,
      is_visible: !!input.is_visible,
    },
  };
}

function revalidateAll() {
  revalidatePath("/admin/schedule");
  revalidatePath("/we/schedule");
}

export async function createCandidateSchedule(input: CandidateScheduleInput) {
  const s = sanitizePayload(input);
  if ("error" in s) return { error: s.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("candidate_schedules")
    .insert(s.payload);
  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function updateCandidateSchedule(input: CandidateScheduleInput) {
  if (!input.id) return { error: "id required" };
  const s = sanitizePayload(input);
  if ("error" in s) return { error: s.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("candidate_schedules")
    .update(s.payload)
    .eq("id", input.id);
  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function deleteCandidateSchedule(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("candidate_schedules")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function toggleCandidateScheduleVisible(
  id: string,
  next: boolean
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("candidate_schedules")
    .update({ is_visible: next })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}

// ───── 선거 공식 일정 ─────

export type ElectionScheduleInput = {
  id?: string;
  title: string;
  scheduled_date: string;
  end_date?: string | null;
  description?: string | null;
  badge_label?: string | null;
  display_order: number;
  is_visible: boolean;
  is_past_hidden?: boolean;
};

function buildElectionPayload(input: ElectionScheduleInput) {
  const title = input.title.trim();
  if (!title) return { error: "제목을 입력해 주세요." as const };
  if (!input.scheduled_date)
    return { error: "시작날짜를 선택해 주세요." as const };

  const endRaw = input.end_date?.trim();
  const end_date = endRaw ? endRaw : input.scheduled_date;

  return {
    payload: {
      title,
      scheduled_date: input.scheduled_date,
      end_date,
      description: input.description?.trim() || null,
      badge_label: input.badge_label?.trim() || null,
      display_order: input.display_order,
      is_visible: !!input.is_visible,
      is_past_hidden: !!input.is_past_hidden,
    },
  };
}

export async function createElectionSchedule(input: ElectionScheduleInput) {
  const s = buildElectionPayload(input);
  if ("error" in s) return { error: s.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("election_schedules")
    .insert(s.payload);
  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function updateElectionSchedule(input: ElectionScheduleInput) {
  if (!input.id) return { error: "id required" };
  const s = buildElectionPayload(input);
  if ("error" in s) return { error: s.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("election_schedules")
    .update(s.payload)
    .eq("id", input.id);
  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function toggleElectionPastHidden(id: string, next: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("election_schedules")
    .update({ is_past_hidden: next })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function deleteElectionSchedule(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("election_schedules")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}
