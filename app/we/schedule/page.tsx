import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ScheduleClient, {
  type CandidateSchedule,
  type ElectionSchedule,
} from "./ScheduleClient";

export const revalidate = 60;

const PAGE_URL = "https://we.wesw.kr/schedule";

export const metadata: Metadata = {
  title: "정희윤 후보 일정 | 수원특례시장 | 개혁신당",
  description:
    "정희윤 수원특례시장 후보의 공개 일정과 2026 지방선거 주요 일정",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "정희윤 후보 일정 | 수원특례시장 | 개혁신당",
    description:
      "정희윤 수원특례시장 후보의 공개 일정과 2026 지방선거 주요 일정",
    url: PAGE_URL,
    siteName: "we.wesw.kr",
    locale: "ko_KR",
    type: "website",
  },
};

export default async function WeSchedulePage() {
  const supabase = await createClient();

  const [candidateRes, electionRes] = await Promise.all([
    supabase
      .from("candidate_schedules")
      .select(
        "id, title, subtitle, scheduled_date, start_time, end_time, location, content, extra"
      )
      .eq("is_visible", true)
      .order("scheduled_date", { ascending: true })
      .order("start_time", { ascending: true, nullsFirst: true }),
    supabase
      .from("election_schedules")
      .select(
        "id, title, scheduled_date, description, badge_label, badge_color, display_order"
      )
      .eq("is_visible", true)
      .order("display_order", { ascending: true }),
  ]);

  const candidateSchedules = (candidateRes.data ?? []) as CandidateSchedule[];
  const electionSchedules = (electionRes.data ?? []) as ElectionSchedule[];

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5 md:py-7">
          <p className="text-xs font-semibold tracking-wider text-[#FF6B00]">
            SCHEDULE
          </p>
          <h1 className="mt-1 text-2xl font-extrabold md:text-3xl">
            후보 일정
          </h1>
          <p className="mt-2 text-sm text-gray-600 md:text-base">
            정희윤 수원특례시장 후보의 공개 일정과 2026 지방선거 주요 일정을
            확인할 수 있습니다.
          </p>
        </div>
      </header>

      <section className="mx-auto mt-6 max-w-6xl px-4">
        <ScheduleClient
          candidateSchedules={candidateSchedules}
          electionSchedules={electionSchedules}
        />
      </section>
    </main>
  );
}
