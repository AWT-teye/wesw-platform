import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ObserversClient, { type Station } from "./ObserversClient";

export const revalidate = 30;

export default async function ObserversPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("polling_stations")
    .select(
      "id, district, station_name, address, max_observers, current_observer_count"
    )
    .eq("is_active", true)
    .order("district")
    .order("station_name");

  const stations = (data ?? []) as Station[];

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        <Link
          href="/we"
          className="mb-6 inline-block text-xs text-gray-500 hover:text-[#FF6B00]"
        >
          ← 메인으로
        </Link>

        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FF6B00]">
            OBSERVERS
          </p>
          <h1 className="mt-2 text-2xl font-extrabold md:text-3xl">
            참관인 신청
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            투표소별 참관인 신청을 받고 있습니다. 투표소당 정원 2명.
          </p>
        </div>

        {/* 자격 안내 레드 박스 */}
        <div
          role="alert"
          className="mb-6 rounded-lg border-2 border-red-600 bg-red-50 p-4 text-sm leading-relaxed text-red-700 md:flex md:items-center md:justify-between md:gap-4"
        >
          <div>
            <p className="mb-1 font-bold">⚠️ 신청 자격 안내</p>
            <p>
              참관인은{" "}
              <strong className="font-bold">개혁신당 소속 당원</strong>만 신청
              가능합니다. 아직 당원이 아니시라면 먼저 당원가입을 진행해 주세요.
            </p>
          </div>
          <a
            href="https://www.reformparty.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block whitespace-nowrap rounded-md bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 md:mt-0"
          >
            당원가입 바로가기 →
          </a>
        </div>

        <ObserversClient stations={stations} />

        <p className="mt-6 text-xs text-gray-500">
          ※ 신청 후 담당자가 유선으로 연락드립니다. 정원(2명)이 찬 투표소는
          &lsquo;마감&rsquo;으로 표시됩니다.
        </p>
      </div>
    </div>
  );
}
