import { createClient } from "@/lib/supabase/server";
import AdminScheduleClient, {
  type AdminCandidateSchedule,
  type AdminElectionSchedule,
} from "./AdminScheduleClient";

export const dynamic = "force-dynamic";

export default async function AdminSchedulePage() {
  const supabase = await createClient();

  const [candRes, electionRes] = await Promise.all([
    supabase
      .from("candidate_schedules")
      .select(
        "id, title, subtitle, scheduled_date, start_time, end_time, location, content, extra, is_visible"
      )
      .order("scheduled_date", { ascending: true })
      .order("start_time", { ascending: true, nullsFirst: true }),
    supabase
      .from("election_schedules")
      .select(
        "id, title, scheduled_date, description, badge_label, display_order, is_visible"
      )
      .order("display_order", { ascending: true }),
  ]);

  const candidateSchedules = (candRes.data ?? []) as AdminCandidateSchedule[];
  const electionSchedules = (electionRes.data ?? []) as AdminElectionSchedule[];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-extrabold">일정 관리</h1>
        <p className="mt-2 text-sm text-gray-600">
          후보 공개 일정과 2026 지방선거 주요 일정을 관리합니다. 활성화된
          일정만 <code className="rounded bg-gray-100 px-1">/we/schedule</code>{" "}
          에 노출됩니다.
        </p>
      </div>

      {candRes.error && (
        <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          후보 일정 로드 실패: {candRes.error.message}
        </p>
      )}
      {electionRes.error && (
        <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          선거 일정 로드 실패: {electionRes.error.message}
        </p>
      )}

      <AdminScheduleClient
        candidateSchedules={candidateSchedules}
        electionSchedules={electionSchedules}
      />
    </div>
  );
}
